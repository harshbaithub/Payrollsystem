const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Employee login
router.post('/employee/login', async (req, res) => {
  try {
    const { employee_id, email, password } = req.body;
    
    const result = await pool.query(
      'SELECT * FROM employees WHERE employee_id = $1 AND email = $2',
      [employee_id, email]
    );
    
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const employee = result.rows[0];
    
    // Check password (for demo, using simple comparison. In production, use bcrypt)
    const isPasswordValid = password === 'password123' || (employee.password && await bcrypt.compare(password, employee.password));
    
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const token = jwt.sign(
      { 
        id: employee.id, 
        employee_id: employee.employee_id, 
        email: employee.email,
        role: 'employee'
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    res.json({
      token,
      employee: {
        id: employee.id,
        employee_id: employee.employee_id,
        first_name: employee.first_name,
        last_name: employee.last_name,
        email: employee.email,
        designation: employee.designation,
        department: employee.department
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Manager login (simple - in production, have separate managers table)
router.post('/manager/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Simple manager login (username: admin, password: admin123)
    if (username === 'admin' && password === 'admin123') {
      const token = jwt.sign(
        { 
          id: 0, 
          username: 'admin',
          role: 'manager'
        },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );
      
      res.json({
        token,
        manager: {
          username: 'admin',
          role: 'manager'
        }
      });
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  } catch (error) {
    console.error('Manager login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

module.exports = router;
