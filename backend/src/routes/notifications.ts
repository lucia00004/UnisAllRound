import express from 'express';
import { queryPg } from '../db_pg';

const router = express.Router();

// Notifications Management
router.get('/', async (req, res) => {
  const { role, userId } = req.query;
  try {
    let studentDegreeCourse: string | null = null;
    if (role === 'Studente' && userId) {
      const studentRes = await queryPg('SELECT degree_course FROM users WHERE id = $1', [userId]);
      if (studentRes.rows.length > 0) {
        studentDegreeCourse = studentRes.rows[0].degree_course;
      }
    }

    const result = await queryPg(`
      SELECT n.*, u.role as sender_role
      FROM notifications n
      LEFT JOIN users u ON n.sender_id = u.id
      WHERE n.target = 'Tutti' OR n.target = $1 OR n.target = $2 OR n.sender_id = $2 
      ORDER BY n.created_at DESC
    `, [role || '', userId || '']);

    let filteredRows = result.rows;
    if (role === 'Studente' && studentDegreeCourse) {
      const teacherIds = Array.from(new Set(
        filteredRows
          .filter(row => row.sender_role === 'Docente' && row.sender_id)
          .map(row => row.sender_id)
      ));
      
      if (teacherIds.length > 0) {
        const placeholders = teacherIds.map((_, idx) => `$${idx + 1}`).join(',');
        const pgQuery = `
          SELECT t.teacher_id, dc.name as degree_course_name 
          FROM teachings t 
          JOIN degree_courses dc ON t.degree_course_id = dc.id 
          WHERE t.teacher_id IN (${placeholders})
        `;
        const pgRes = await queryPg(pgQuery, teacherIds);
        const teachingsList = pgRes.rows;
        
        const teacherCoursesMap = new Map<string, Set<string>>();
        for (const row of teachingsList) {
          if (!teacherCoursesMap.has(row.teacher_id)) {
            teacherCoursesMap.set(row.teacher_id, new Set<string>());
          }
          teacherCoursesMap.get(row.teacher_id)!.add(row.degree_course_name);
        }
        
        filteredRows = filteredRows.filter(row => {
          if (row.target === userId) {
            return true;
          }
          if (row.sender_role === 'Docente' && row.sender_id) {
            const teacherCourses = teacherCoursesMap.get(row.sender_id);
            if (teacherCourses && studentDegreeCourse && teacherCourses.has(studentDegreeCourse)) {
              return true;
            }
            return false;
          }
          return true;
        });
      }
    }

    res.json(filteredRows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  const { id, title, body, target, date, senderId } = req.body;
  try {
    await queryPg(`
      INSERT INTO notifications (id, title, body, target, date, sender_id)
      VALUES ($1, $2, $3, $4, $5, $6)
    `, [id, title, body, target, date, senderId || null]);
    res.status(201).json({ id, title, target });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
