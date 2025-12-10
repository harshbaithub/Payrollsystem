const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// Get all deductions
router.get('/', async (req, res) => {
  try {
    const { employee_id } = req.query;
    let query = 'SELECT * FROM deductions';
    const params = [];
    
    if (employee_id) {
      params.push(employee_id);
      query += ' WHERE employee_id = $1';
    }
    
    query += ' ORDER BY date DESC';
    
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching deductions:', error);
    res.status(500).json({ error: 'Failed to fetch deductions' });
  }
});

// Add deduction
router.post('/', async (req, res) => {
  try {
    const { employee_id, deduction_type, amount, description, date } = req.body;
    
    const result = await pool.query(
      `INSERT INTO deductions (employee_id, deduction_type, amount, description, date)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [employee_id, deduction_type, amount, description, date]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating deduction:', error);
    res.status(500).json({ error: 'Failed to create deduction' });
  }
});

// Delete deduction
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM deductions WHERE id = $1', [id]);
    res.json({ message: 'Deduction deleted successfully' });
  } catch (error) {
    console.error('Error deleting deduction:', error);
    res.status(500).json({ error: 'Failed to delete deduction' });
  }
});

module.exports = router;
