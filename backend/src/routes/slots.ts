import express from 'express';
import { queryPg } from '../db_pg';

const router = express.Router();

function hasInvalidHyphenApostrophe(text: string): boolean {
  const invalidRegex = /(^[-'’])|([-'’]$)|([^A-Za-z0-9À-ÖØ-öø-ÿ][-'’])|([-'’][^A-Za-z0-9À-ÖØ-öø-ÿ])/;
  return invalidRegex.test(text);
}

// Teacher Reception Slots (PostgreSQL)
router.get('/', async (req, res) => {
  try {
    // Fetch slots, teaching names and degree course names from PostgreSQL
    const pgRes = await queryPg(`
      SELECT 
        rs.*, t.name as teaching_name, dc.name as degree_course_name
      FROM reception_slots rs
      JOIN teachings t ON rs.teaching_id = t.id
      JOIN degree_courses dc ON t.degree_course_id = dc.id
    `);
    const results = pgRes.rows;

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

    // Map fields back to React Native expectations and merge teacher/student names
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
    const teachingResult = await queryPg('SELECT id FROM teachings WHERE name = $1 LIMIT 1', [teachingName]);
    const teachingId = teachingResult.rows[0]?.id;

    if (!teachingId) {
      return res.status(400).json({ error: 'Insegnamento non valido.' });
    }

    const tSlot = timeSlot || time;
    const dScript = description || desc;

    if (dScript === undefined || typeof dScript !== 'string' || !dScript.trim()) {
      return res.status(400).json({ error: 'La descrizione del ricevimento non può essere vuota.' });
    }

    if (hasInvalidHyphenApostrophe(dScript)) {
      return res.status(400).json({ error: "I caratteri '-' e gli apostrofi devono essere preceduti e seguiti da una lettera o cifra." });
    }

    const insertRes = await queryPg(`
      INSERT INTO reception_slots (teacher_id, teaching_id, day, time_slot, status, description, date, booked_by)
      VALUES ($1, $2, $3, $4, $5, $6, $7, NULL)
      RETURNING id
    `, [teacherId, teachingId, day, tSlot, status, dScript.trim(), date || null]);

    res.status(201).json({ id: insertRes.rows[0].id.toString(), teachingName, status });
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
    const updates: string[] = [];
    const values: any[] = [];

    if (status !== undefined) {
      updates.push(`status = $${values.length + 1}`);
      values.push(status);
    }

    if (dScript !== undefined) {
      if (typeof dScript !== 'string' || !dScript.trim()) {
        return res.status(400).json({ error: 'La descrizione del ricevimento non può essere vuota.' });
      }
      if (hasInvalidHyphenApostrophe(dScript)) {
        return res.status(400).json({ error: "I caratteri '-' e gli apostrofi devono essere preceduti e seguiti da una lettera o cifra." });
      }
      updates.push(`description = $${values.length + 1}`);
      values.push(dScript.trim());
    }

    if (bookedByStudentId !== undefined || req.body.hasOwnProperty('bookedByStudentId')) {
      updates.push(`booked_by = $${values.length + 1}`);
      values.push(bookedByStudentId || null);
    }

    if (updates.length > 0) {
      values.push(parseInt(id));
      await queryPg(
        `UPDATE reception_slots SET ${updates.join(', ')} WHERE id = $${values.length}`,
        values
      );
    }
    res.json({ message: 'Slot aggiornato.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Delete reception slot
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await queryPg('DELETE FROM reception_slots WHERE id = $1', [parseInt(id)]);
    res.json({ message: 'Slot eliminato.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
