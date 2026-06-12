import express from 'express';
import bcrypt from 'bcryptjs';
import { queryPg } from '../db_pg';
import { queryMysql } from '../db_mysql';

const router = express.Router();

function validateNameSurnamePhone(name: any, surname: any, phone: any) {
  if (typeof name !== 'string' || !name.trim()) {
    return 'Il nome non può essere vuoto o contenere solo spazi.';
  }
  if (typeof surname !== 'string' || !surname.trim()) {
    return 'Il cognome non può essere vuoto o contenere solo spazi.';
  }
  const nameRegex = /^[A-Za-zÀ-ÖØ-öø-ÿ]+([\'’\-][A-Za-zÀ-ÖØ-öø-ÿ]+)*(\s+[A-Za-zÀ-ÖØ-öø-ÿ]+([\'’\-][A-Za-zÀ-ÖØ-öø-ÿ]+)*)*$/;
  if (!nameRegex.test(name.trim()) || !nameRegex.test(surname.trim())) {
    return 'Il nome e il cognome possono contenere lettere, spazi, apostrofi e trattini (questi ultimi non possono essere all\'inizio, alla fine, consecutivi o isolati).';
  }
  if (typeof phone !== 'string') {
    return 'Il numero di telefono non è valido.';
  }
  const parts = phone.trim().split(/\s+/);
  const digits = parts[parts.length - 1];
  if (!/^\d{8,13}$/.test(digits)) {
    return 'Il numero di telefono deve contenere solo cifre ed essere lungo tra 8 e 13 caratteri.';
  }
  return null;
}

// Authentication: Register
router.post('/register', async (req, res) => {
  const {
    id, name, surname, email, phone, role, password,
    matricola, department, degreeCourse, workScope, ptaDomain,
    selectedTeachings, // Array of teaching IDs (ints) or teaching names
    language
  } = req.body;

  const validationErr = validateNameSurnamePhone(name, surname, phone);
  if (validationErr) {
    return res.status(400).json({ error: validationErr });
  }

  const emailLower = (email || '').trim().toLowerCase();
  const emailRegex = /^[a-zA-Z0-9._%+-]*[a-zA-Z][a-zA-Z0-9._%+-]*@((studenti\.)?unisa\.it)$/i;
  if (!emailRegex.test(emailLower)) {
    return res.status(400).json({ error: 'Email istituzionale non valida.' });
  }
  
  if (role === 'Studente' && !emailLower.endsWith('@studenti.unisa.it')) {
    return res.status(400).json({ error: 'La mail per gli studenti deve terminare con @studenti.unisa.it.' });
  }

  if (role !== 'Studente' && !emailLower.endsWith('@unisa.it')) {
    return res.status(400).json({ error: 'La mail per i docenti/PTA deve terminare con @unisa.it.' });
  }

  try {
    // Check if email already exists
    const checkUser = await queryPg('SELECT id FROM users WHERE email = $1', [emailLower]);
    if (checkUser.rows.length > 0) {
      return res.status(400).json({ error: 'Email già registrata.' });
    }

    const passHash = await bcrypt.hash(password, 10);
    const userId = id || `user-${Date.now()}`;
    const workScopeVal = workScope || ptaDomain || null;

    // Save in PostgreSQL
    await queryPg(`
      INSERT INTO users (id, name, surname, email, phone, role, matricola, department, degree_course, work_scope, password_hash, language, profile_picture)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
    `, [
      userId, name, surname, email, phone, role,
      matricola || null, department || null, degreeCourse || null, workScopeVal,
      passHash, language || 'IT', null
    ]);

    // Handle student/teacher associations in MySQL
    if (role === 'Docente' && Array.isArray(selectedTeachings)) {
      // Clear previous teaching ties
      await queryMysql('UPDATE teachings SET teacher_id = NULL WHERE teacher_id = ?', [userId]);

      // Set teacher_id to current user for teachings
      for (const tIdentifier of selectedTeachings) {
        if (typeof tIdentifier === 'number' || /^\d+$/.test(tIdentifier.toString())) {
          await queryMysql('UPDATE teachings SET teacher_id = ? WHERE id = ?', [userId, tIdentifier]);
        } else {
          await queryMysql('UPDATE teachings SET teacher_id = ? WHERE name = ?', [userId, tIdentifier]);
        }
      }
    } else if (role === 'Studente' && Array.isArray(selectedTeachings)) {
      // Clear previous student enrollments
      await queryMysql('DELETE FROM student_teachings WHERE student_id = ?', [userId]);

      for (const tIdentifier of selectedTeachings) {
        let tId = tIdentifier;
        if (typeof tIdentifier === 'string' && !/^\d+$/.test(tIdentifier)) {
          const tRows = await queryMysql('SELECT id FROM teachings WHERE name = ? LIMIT 1', [tIdentifier]) as any[];
          tId = tRows[0]?.id;
        }
        if (tId) {
          await queryMysql('INSERT INTO student_teachings (student_id, teaching_id) VALUES (?, ?)', [userId, tId]);
        }
      }
    } else if (role === 'Studente' && degreeCourse) {
      // Default: Enroll student in all teachings of their selected course
      const teachings = await queryMysql(
        'SELECT t.id FROM teachings t JOIN degree_courses c ON t.degree_course_id = c.id WHERE c.name = ?',
        [degreeCourse]
      ) as any[];

      for (const t of teachings) {
        await queryMysql('INSERT INTO student_teachings (student_id, teaching_id) VALUES (?, ?)', [userId, t.id]);
      }
    }

    // Return profile
    const registeredUser = {
      id: userId, name, surname, email, phone, role,
      matricola, department, degreeCourse, 
      workScope: workScopeVal,
      ptaDomain: workScopeVal,
      teachings: selectedTeachings || [],
      language: language || 'IT'
    };

    res.status(201).json(registeredUser);
  } catch (err: any) {
    console.error('Registration failed:', err);
    res.status(500).json({ error: err.message });
  }
});

// Authentication: Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const userResult = await queryPg('SELECT * FROM users WHERE email = $1', [email]);
    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: 'Credenziali non valide.' });
    }

    const user = userResult.rows[0];
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res.status(401).json({ error: 'Credenziali non valide.' });
    }

    // Load associations from MySQL
    let teachings: string[] = [];
    let degreeCourses: string[] = [];

    if (user.role === 'Docente') {
      // Get teachings assigned to this teacher
      const tResults = await queryMysql(
        `SELECT t.name as teaching_name, c.name as course_name 
         FROM teachings t 
         JOIN degree_courses c ON t.degree_course_id = c.id 
         WHERE t.teacher_id = ?`,
        [user.id]
      ) as any[];

      teachings = tResults.map(r => r.teaching_name);
      // Unique courses
      degreeCourses = Array.from(new Set(tResults.map(r => r.course_name)));
    } else if (user.role === 'Studente') {
      // Get student teachings
      const tResults = await queryMysql(
        `SELECT t.name as teaching_name 
         FROM student_teachings st 
         JOIN teachings t ON st.teaching_id = t.id 
         WHERE st.student_id = ?`,
        [user.id]
      ) as any[];

      teachings = tResults.map(r => r.teaching_name);
    }

    const userProfile = {
      id: user.id,
      name: user.name,
      surname: user.surname,
      email: user.email,
      phone: user.phone,
      role: user.role,
      matricola: user.matricola,
      department: user.department,
      degreeCourse: user.degree_course,
      workScope: user.work_scope,
      ptaDomain: user.work_scope,
      degreeCourses: user.role === 'Docente' ? degreeCourses : undefined,
      teachings: teachings,
      language: user.language || 'IT'
    };

    res.json(userProfile);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
