const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { authMiddleware } = require('../middleware/auth');

// Get all advance salary requests (Manager)
router.get('/', async (req, res) => {
  try {
    const query = `
      SELECT a.*, e.first_name, e.last_name, e.employee_id, e.designation, e.department
      FROM advance_salary a
      JOIN employees e ON a.employee_id = e.employee_id
      ORDER BY a.requested_date DESC
    `;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching advance salary requests:', error);
    res.status(500).json({ error: 'Failed to fetch advance salary requests' });
  }
});

// Get employee's advance salary requests
router.get('/employee/:employeeId', authMiddleware, async (req, res) => {
  try {
    const { employeeId } = req.params;
    const query = `
      SELECT * FROM advance_salary
      WHERE employee_id = $1
      ORDER BY requested_date DESC
    `;
    const result = await pool.query(query, [employeeId]);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching employee advance salary:', error);
    res.status(500).json({ error: 'Failed to fetch advance salary data' });
  }
});

// Request advance salary (Employee)
router.post('/request', authMiddleware, async (req, res) => {
  try {
    const { amount, notes, description } = req.body;
    const employee_id = req.user.employee_id; // Get from authenticated user
    
    if (!employee_id || !amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid request data' });
    }

    const query = `
      INSERT INTO advance_salary (employee_id, amount, requested_date, notes)
      VALUES ($1, $2, CURRENT_DATE, $3)
      RETURNING *
    `;
    
    const result = await pool.query(query, [employee_id, amount, notes || description]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error requesting advance salary:', error);
    res.status(500).json({ error: 'Failed to submit advance salary request' });
  }
});
    
// Approve advance salary (Manager)
router.put('/:id/approve', async (req, res) => {
  try {
    const { id } = req.params;
    const { deduction_month, deduction_year } = req.body;

    if (!deduction_month || !deduction_year) {
      return res.status(400).json({ error: 'Deduction month and year are required' });
    }

    const query = `
      UPDATE advance_salary
      SET approval_status = 'approved', approved_date = CURRENT_DATE, deduction_month = $1, deduction_year = $2
      WHERE id = $3
      RETURNING *
    `;
    
    const result = await pool.query(query, [deduction_month, deduction_year, id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Advance salary request not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error approving advance salary:', error);
    res.status(500).json({ error: 'Failed to approve advance salary' });
  }
});

// Reject advance salary (Manager)
router.put('/:id/reject', async (req, res) => {
  try {
    const { id } = req.params;

    const query = `
      UPDATE advance_salary
      SET approval_status = 'rejected'
      WHERE id = $1
      RETURNING *
    `;
    
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Advance salary request not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error rejecting advance salary:', error);
    res.status(500).json({ error: 'Failed to reject advance salary' });
  }
});

module.exports = router;
