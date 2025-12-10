const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// Get all bonuses
router.get('/', async (req, res) => {
  try {
    const { employee_id } = req.query;
    let query = 'SELECT * FROM bonuses';
    const params = [];
    
    if (employee_id) {
      params.push(employee_id);
      query += ' WHERE employee_id = $1';
    }
    
    query += ' ORDER BY date DESC';
    
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching bonuses:', error);
    res.status(500).json({ error: 'Failed to fetch bonuses' });
  }
});

// Add bonus
router.post('/', async (req, res) => {
  try {
    const { employee_id, bonus_type, amount, description, date } = req.body;
    
    const result = await pool.query(
      `INSERT INTO bonuses (employee_id, bonus_type, amount, description, date)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [employee_id, bonus_type, amount, description, date]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating bonus:', error);
    res.status(500).json({ error: 'Failed to create bonus' });
  }
});

// Delete bonus
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM bonuses WHERE id = $1', [id]);
    res.json({ message: 'Bonus deleted successfully' });
  } catch (error) {
    console.error('Error deleting bonus:', error);
    res.status(500).json({ error: 'Failed to delete bonus' });
  }
});

// Approve/Reject bonus (Manager)
router.put('/:id/approve', async (req, res) => {
  try {
    const { id } = req.params;
    const { bonus_approved } = req.body;

    const result = await pool.query(
      `UPDATE bonuses 
       SET bonus_approved = $1, approval_date = NOW()
       WHERE id = $2 RETURNING *`,
      [bonus_approved, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Bonus not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error approving bonus:', error);
    res.status(500).json({ error: 'Failed to approve bonus' });
  }
});

// Get employee's approved bonuses
router.get('/employee/:employeeId', async (req, res) => {
  try {
    const { employeeId } = req.params;
    const result = await pool.query(
      `SELECT * FROM bonuses 
       WHERE employee_id = $1 AND bonus_approved = true
       ORDER BY approval_date DESC`,
      [employeeId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching employee bonuses:', error);
    res.status(500).json({ error: 'Failed to fetch bonuses' });
  }
});

module.exports = router;
