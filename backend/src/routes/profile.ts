import express from 'express';
import bcrypt from 'bcryptjs';
import { queryPg } from '../db_pg';

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

// Get All Users (for syncing local state with database)
router.get('/users', async (req, res) => {
  try {
    const result = await queryPg('SELECT id, name, surname, email, phone, role, matricola, department, degree_course as "degreeCourse", work_scope as "workScope", language FROM users');
    const dbUsers = result.rows;

    // Load teachings/courses for each user from MySQL
    for (const u of dbUsers) {
      u.ptaDomain = u.workScope;
      let teachings: string[] = [];
      let teacherDegrees: string[] = [];

      if (u.role === 'Docente') {
        const pgRes = await queryPg(
          `SELECT t.name as teaching_name, c.name as course_name 
           FROM teachings t 
           JOIN degree_courses c ON t.degree_course_id = c.id 
           WHERE t.teacher_id = $1`,
          [u.id]
        );
        const tResults = pgRes.rows;

        teachings = tResults.map(r => r.teaching_name);
        teacherDegrees = Array.from(new Set(tResults.map(r => r.course_name)));
        u.teacherDegrees = teacherDegrees;
      } else if (u.role === 'Studente') {
        const pgRes = await queryPg(
          `SELECT t.name as teaching_name 
           FROM student_teachings st 
           JOIN teachings t ON st.teaching_id = t.id 
           WHERE st.student_id = $1`,
          [u.id]
        );
        const tResults = pgRes.rows;

        teachings = tResults.map(r => r.teaching_name);
      }
      u.teachings = teachings;
    }

    res.json(dbUsers);
  } catch (err: any) {
    console.error('Failed to get users:', err);
    res.status(500).json({ error: err.message });
  }
});

// Update Profile
router.put('/profile', async (req, res) => {
  const {
    id, name, surname, phone, matricola, department, degreeCourse, workScope, ptaDomain,
    selectedTeachings, selectedCourses, language, password
  } = req.body;

  const validationErr = validateNameSurnamePhone(name, surname, phone);
  if (validationErr) {
    return res.status(400).json({ error: validationErr });
  }

  try {
    const userRoleResult = await queryPg('SELECT role FROM users WHERE id = $1', [id]);
    if (userRoleResult.rows.length === 0) {
      return res.status(404).json({ error: 'Utente non trovato.' });
    }
    const role = userRoleResult.rows[0].role;
    const workScopeVal = workScope || ptaDomain || null;

    // Validate phone uniqueness
    const checkPhone = await queryPg(
      `SELECT id FROM users WHERE REPLACE(REPLACE(phone, ' ', ''), '-', '') = REPLACE(REPLACE($1, ' ', ''), '-', '') AND id != $2`,
      [phone, id]
    );
    if (checkPhone.rows.length > 0) {
      return res.status(400).json({ error: 'Numero di telefono già registrato.' });
    }

    if (role === 'Studente') {
      if (!department || !department.trim()) {
        return res.status(400).json({ error: 'Il dipartimento è obbligatorio per lo studente.' });
      }
      if (!degreeCourse || !degreeCourse.trim()) {
        return res.status(400).json({ error: 'Il corso di laurea è obbligatorio per lo studente.' });
      }
      if (!matricola || !matricola.trim()) {
        return res.status(400).json({ error: 'La matricola è obbligatoria per lo studente.' });
      }
      const matricolaDigits = matricola.replace(/\D/g, '');
      if (matricolaDigits.length !== 10 || matricola.length !== 10) {
        return res.status(400).json({ error: 'La matricola deve essere di esattamente 10 cifre.' });
      }

      // Check matricola uniqueness
      const checkMatricola = await queryPg(
        'SELECT id FROM users WHERE matricola = $1 AND id != $2',
        [matricola.trim(), id]
      );
      if (checkMatricola.rows.length > 0) {
        return res.status(400).json({ error: 'Matricola già registrata da un altro studente.' });
      }
    }

    if (role === 'Docente') {
      if (!department || !department.trim()) {
        return res.status(400).json({ error: 'Il dipartimento è obbligatorio per il docente.' });
      }
      if (!selectedCourses || !Array.isArray(selectedCourses) || selectedCourses.length === 0) {
        return res.status(400).json({ error: 'I corsi di laurea di riferimento sono obbligatori per il docente.' });
      }
      if (!selectedTeachings || !Array.isArray(selectedTeachings) || selectedTeachings.length === 0) {
        return res.status(400).json({ error: 'Gli insegnamenti tenuti sono obbligatori per il docente.' });
      }
    }

    if (role === 'PTA') {
      if (!workScopeVal) {
        return res.status(400).json({ error: 'L\'ambito lavorativo è obbligatorio per il personale PTA.' });
      }
    }

    let passHash = null;
    if (password) {
      passHash = await bcrypt.hash(password, 10);
    }

    if (passHash) {
      // Update user table including password hash in Postgres
      await queryPg(`
        UPDATE users 
        SET name = $1, surname = $2, phone = $3, matricola = $4, department = $5, degree_course = $6, work_scope = $7, language = $8, password_hash = $9, profile_picture = $10, updated_at = NOW()
        WHERE id = $11
      `, [name, surname, phone, matricola || null, department || null, degreeCourse || null, workScopeVal, language || 'IT', passHash, null, id]);
    } else {
      // Update user table in Postgres (no password change)
      await queryPg(`
        UPDATE users 
        SET name = $1, surname = $2, phone = $3, matricola = $4, department = $5, degree_course = $6, work_scope = $7, language = $8, profile_picture = $9, updated_at = NOW()
        WHERE id = $10
      `, [name, surname, phone, matricola || null, department || null, degreeCourse || null, workScopeVal, language || 'IT', null, id]);
    }

    if (role === 'Docente' && Array.isArray(selectedTeachings)) {
      // Reset teachings previously taught
      await queryPg('UPDATE teachings SET teacher_id = NULL WHERE teacher_id = $1', [id]);

      // Set new teachings
      for (const tName of selectedTeachings) {
        await queryPg('UPDATE teachings SET teacher_id = $1 WHERE name = $2', [id, tName]);
      }
    } else if (role === 'Studente' && degreeCourse) {
      // If student course changed, re-sync their default teachings
      const checkEnrolled = await queryPg('SELECT COUNT(*) as count FROM student_teachings WHERE student_id = $1', [id]);
      const count = parseInt(checkEnrolled.rows[0]?.count || '0');

      if (count === 0) {
        const pgRes = await queryPg(
          'SELECT t.id FROM teachings t JOIN degree_courses c ON t.degree_course_id = c.id WHERE c.name = $1',
          [degreeCourse]
        );
        const teachings = pgRes.rows;

        for (const t of teachings) {
          await queryPg('INSERT INTO student_teachings (student_id, teaching_id) VALUES ($1, $2)', [id, t.id]);
        }
      }
    }

    res.json({ message: 'Profilo aggiornato con successo.' });
  } catch (err: any) {
    console.error('Update profile failed:', err);
    res.status(500).json({ error: err.message });
  }
});

// Delete account support
router.delete('/profile/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await queryPg('DELETE FROM users WHERE id = $1', [id]);
    await queryPg('UPDATE teachings SET teacher_id = NULL WHERE teacher_id = $1', [id]);
    await queryPg('DELETE FROM student_teachings WHERE student_id = $1', [id]);
    res.json({ message: 'Profilo eliminato.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
