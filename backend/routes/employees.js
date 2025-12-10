const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// Get all employees
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM employees ORDER BY id DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching employees:', error);
    res.status(500).json({ error: 'Failed to fetch employees' });
  }
});

// Get single employee
router.get('/:employeeId', async (req, res) => {
  try {
    const { employeeId } = req.params;
    const result = await pool.query('SELECT * FROM employees WHERE employee_id = $1', [employeeId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Employee not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching employee:', error);
    res.status(500).json({ error: 'Failed to fetch employee' });
  }
});

// Create new employee
router.post('/', async (req, res) => {
  try {
    const { employee_id, first_name, last_name, email, phone, designation, department, hire_date, basic_salary, gender } = req.body;
    
    const result = await pool.query(
      `INSERT INTO employees (employee_id, first_name, last_name, email, phone, designation, department, hire_date, basic_salary, gender)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
      [employee_id, first_name, last_name, email, phone, designation, department, hire_date, basic_salary, gender]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating employee:', error);
    res.status(500).json({ error: 'Failed to create employee' });
  }
});

// Update employee
router.put('/:employeeId', async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { first_name, last_name, email, phone, designation, department, hire_date, basic_salary, status, gender } = req.body;
    
    const result = await pool.query(
      `UPDATE employees 
       SET first_name = $1, last_name = $2, email = $3, phone = $4, designation = $5, 
           department = $6, hire_date = $7, basic_salary = $8, status = $9, gender = $10
       WHERE employee_id = $11 RETURNING *`,
      [first_name, last_name, email, phone, designation, department, hire_date, basic_salary, status, gender, employeeId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Employee not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating employee:', error);
    res.status(500).json({ error: 'Failed to update employee' });
  }
});

// Delete employee
router.delete('/:employeeId', async (req, res) => {
  try {
    const { employeeId } = req.params;
    const result = await pool.query('DELETE FROM employees WHERE employee_id = $1 RETURNING *', [employeeId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Employee not found' });
    }
    
    res.json({ message: 'Employee deleted successfully' });
  } catch (error) {
    console.error('Error deleting employee:', error);
    res.status(500).json({ error: 'Failed to delete employee' });
  }
});

module.exports = router;
