import express from 'express';
import bcrypt from 'bcryptjs';
import { queryPg } from '../db_pg';
import { queryMysql } from '../db_mysql';

const router = express.Router();

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
        const tResults = await queryMysql(
          `SELECT t.name as teaching_name, c.name as course_name 
           FROM teachings t 
           JOIN degree_courses c ON t.degree_course_id = c.id 
           WHERE t.teacher_id = ?`,
          [u.id]
        ) as any[];

        teachings = tResults.map(r => r.teaching_name);
        teacherDegrees = Array.from(new Set(tResults.map(r => r.course_name)));
        u.teacherDegrees = teacherDegrees;
      } else if (u.role === 'Studente') {
        const tResults = await queryMysql(
          `SELECT t.name as teaching_name 
           FROM student_teachings st 
           JOIN teachings t ON st.teaching_id = t.id 
           WHERE st.student_id = ?`,
          [u.id]
        ) as any[];

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

  try {
    const workScopeVal = workScope || ptaDomain || null;
    
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

    // Handle teaching locks/updates in MySQL
    const userRoleResult = await queryPg('SELECT role FROM users WHERE id = $1', [id]);
    const role = userRoleResult.rows[0]?.role;

    if (role === 'Docente' && Array.isArray(selectedTeachings)) {
      // Reset teachings previously taught
      await queryMysql('UPDATE teachings SET teacher_id = NULL WHERE teacher_id = ?', [id]);

      // Set new teachings
      for (const tName of selectedTeachings) {
        await queryMysql('UPDATE teachings SET teacher_id = ? WHERE name = ?', [id, tName]);
      }
    } else if (role === 'Studente' && degreeCourse) {
      // If student course changed, re-sync their default teachings
      const checkEnrolled = await queryMysql('SELECT COUNT(*) as count FROM student_teachings WHERE student_id = ?', [id]) as any;
      const count = checkEnrolled[0]?.count || 0;

      if (count === 0) {
        const teachings = await queryMysql(
          'SELECT t.id FROM teachings t JOIN degree_courses c ON t.degree_course_id = c.id WHERE c.name = ?',
          [degreeCourse]
        ) as any[];

        for (const t of teachings) {
          await queryMysql('INSERT INTO student_teachings (student_id, teaching_id) VALUES (?, ?)', [id, t.id]);
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
    await queryMysql('UPDATE teachings SET teacher_id = NULL WHERE teacher_id = ?', [id]);
    await queryMysql('DELETE FROM student_teachings WHERE student_id = ?', [id]);
    res.json({ message: 'Profilo eliminato.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
