import express from 'express';
import { queryMysql } from '../db_mysql';
import { queryPg } from '../db_pg';

const router = express.Router();

// Teacher Reception Slots (MySQL)
router.get('/', async (req, res) => {
  try {
    // Fetch slots, teaching names and degree course names from MySQL
    const results = await queryMysql(`
      SELECT 
        rs.*, t.name as teaching_name, dc.name as degree_course_name
      FROM reception_slots rs
      JOIN teachings t ON rs.teaching_id = t.id
      JOIN degree_courses dc ON t.degree_course_id = dc.id
    `) as any[];

    // Extract unique user IDs (teachers + booked student IDs)
    const teacherIds = results.map(row => row.teacher_id).filter(Boolean);
    const studentIds = results.map(row => row.booked_by).filter(Boolean);
    const allUserIds = [...new Set([...teacherIds, ...studentIds])];

    // Fetch user details from PostgreSQL in one go
    let usersMap: Record<string, { name: string; surname: string; degree_course?: string }> = {};
    if (allUserIds.length > 0) {
      const placeholders = allUserIds.map((_, i) => `$${i + 1}`).join(',');
      const usersResult = await queryPg(`
        SELECT id, name, surname, degree_course FROM users WHERE id IN (${placeholders})
      `, allUserIds);
      usersResult.rows.forEach(u => {
        usersMap[u.id] = { name: u.name, surname: u.surname, degree_course: u.degree_course };
      });
    }

    // Map MySQL snake_case fields back to React Native camelCase expectations and merge teacher/student names
    const mapped = results.map(row => {
      const teacher = usersMap[row.teacher_id] || { name: 'Docente', surname: 'Sconosciuto' };
      const student = row.booked_by ? usersMap[row.booked_by] : null;
      const bookedByStr = student ? `${student.name} ${student.surname} (${student.degree_course || 'Studente'})` : undefined;

      return {
        id: row.id.toString(),
        teacherId: row.teacher_id,
        teaching: row.teaching_name,
        day: row.day,
        time: row.time_slot,
        status: row.status,
        desc: row.description || '',
        date: row.date,
        teacherName: `${teacher.name} ${teacher.surname}`,
        bookedBy: bookedByStr,
        bookedByStudentId: row.booked_by || undefined,
        degreeCourse: row.degree_course_name
      };
    });

    res.json(mapped);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  const { teacherId, teachingName, day, timeSlot, time, status, description, desc, date } = req.body;

  try {
    // Find teaching ID by name
    const teachingRow = await queryMysql('SELECT id FROM teachings WHERE name = ? LIMIT 1', [teachingName]) as any[];
    const teachingId = teachingRow[0]?.id;

    if (!teachingId) {
      return res.status(400).json({ error: 'Insegnamento non valido.' });
    }

    const tSlot = timeSlot || time;
    const dScript = description || desc;

    const insertRes = await queryMysql(`
      INSERT INTO reception_slots (teacher_id, teaching_id, day, time_slot, status, description, date, booked_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, NULL)
    `, [teacherId, teachingId, day, tSlot, status, dScript || null, date || null]) as any;

    res.status(201).json({ id: insertRes.insertId.toString(), teachingName, status });
  } catch (err: any) {
    console.error('Failed to create slot:', err);
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { status, description, desc, bookedByStudentId } = req.body;

  try {
    const dScript = description || desc;
    await queryMysql(
      'UPDATE reception_slots SET status = ?, description = ?, booked_by = ? WHERE id = ?',
      [status, dScript || null, bookedByStudentId || null, id]
    );
    res.json({ message: 'Slot aggiornato.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Delete reception slot
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await queryMysql('DELETE FROM reception_slots WHERE id = ?', [id]);
    res.json({ message: 'Slot eliminato.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
