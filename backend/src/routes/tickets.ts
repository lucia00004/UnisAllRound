import express from 'express';
import { queryPg } from '../db_pg';

const router = express.Router();

// Support Tickets Management
router.get('/', async (req, res) => {
  const { creatorId, role, scope } = req.query;
  try {
    let result;
    if (role === 'PTA') {
      result = await queryPg(`
        SELECT t.*, u.name as creator_name, u.surname as creator_surname 
        FROM tickets t
        JOIN users u ON t.creator_id = u.id
        WHERE t.category = $1 AND (t.status = 'Aperto' OR t.assigned_to = $2)
        ORDER BY t.created_at DESC
      `, [scope || '', creatorId || '']);
    } else {
      // Student only sees their own
      result = await queryPg(`
        SELECT t.*, u.name as creator_name, u.surname as creator_surname 
        FROM tickets t
        JOIN users u ON t.creator_id = u.id
        WHERE t.creator_id = $1
        ORDER BY t.created_at DESC
      `, [creatorId || '']);
    }
    res.json(result.rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  const { id, creator_id, title, description, category, status, priority, created_at } = req.body;
  try {
    await queryPg(`
      INSERT INTO tickets (id, creator_id, title, description, category, status, priority, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `, [id, creator_id, title, description, category, status, priority, created_at]);
    res.status(201).json({ id, title, status });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { status, assignedTo } = req.body;
  try {
    if (assignedTo !== undefined) {
      await queryPg('UPDATE tickets SET status = $1, assigned_to = $2 WHERE id = $3', [status, assignedTo, id]);
    } else {
      await queryPg('UPDATE tickets SET status = $1 WHERE id = $2', [status, id]);
    }
    res.json({ message: 'Ticket aggiornato.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
