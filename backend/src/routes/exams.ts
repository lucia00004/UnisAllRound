import express from 'express';
import { queryPg } from '../db_pg';

const router = express.Router();

// Get Student Exams
router.get('/', async (req, res) => {
  const { studentId } = req.query;
  try {
    const result = await queryPg('SELECT * FROM exams WHERE student_id = $1', [studentId]);
    res.json(result.rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Delete Exam
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await queryPg('DELETE FROM exams WHERE id = $1', [id]);
    res.json({ message: 'Esame eliminato con successo.' });
  } catch (err: any) {
    console.error('Delete exam failed:', err);
    res.status(500).json({ error: err.message });
  }
});

// Add Exam
router.post('/', async (req, res) => {
  const { id, student_id, name, grade, date, lode, status, cfu } = req.body;
  try {
    // Check if student already has a pending, accepted, or superato exam for this teaching
    const checkExisting = await queryPg(
      `SELECT id, status FROM exams 
       WHERE student_id = $1 AND LOWER(TRIM(name)) = LOWER(TRIM($2)) AND status IN ('Da valutare', 'Accettato', 'Superato')`,
      [student_id, name]
    );

    if (checkExisting.rows.length > 0) {
      return res.status(400).json({ error: 'Lo studente ha già un esito in corso o registrato per questo insegnamento.' });
    }

    await queryPg(`
      INSERT INTO exams (id, student_id, name, grade, date, lode, status, cfu)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `, [id, student_id, name, grade, date, lode, status, cfu]);
    res.status(201).json({ id, name, status });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Update Exam
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { grade, date, lode, status } = req.body;
  try {
    const updates: string[] = [];
    const values: any[] = [];
    let valIndex = 1;

    if (grade !== undefined) {
      updates.push(`grade = $${valIndex++}`);
      values.push(grade);
    }
    if (date !== undefined) {
      updates.push(`date = $${valIndex++}`);
      values.push(date);
    }
    if (lode !== undefined) {
      updates.push(`lode = $${valIndex++}`);
      values.push(lode);
    }
    if (status !== undefined) {
      updates.push(`status = $${valIndex++}`);
      values.push(status);
    }

    if (updates.length === 0) {
      return res.json({ message: 'Nessun campo da aggiornare.' });
    }

    values.push(id);
    const query = `
      UPDATE exams 
      SET ${updates.join(', ')} 
      WHERE id = $${valIndex}
    `;

    await queryPg(query, values);
    res.json({ message: 'Esame aggiornato.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
