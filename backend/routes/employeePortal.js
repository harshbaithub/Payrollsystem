const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { authMiddleware, isEmployee } = require('../middleware/auth');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/documents/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, req.user.employee_id + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf|doc|docx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Only images and documents (PDF, DOC, DOCX) are allowed'));
  }
});

// Get employee profile
router.get('/profile', authMiddleware, isEmployee, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, employee_id, first_name, last_name, email, phone, gender, designation, 
              department, hire_date, basic_salary, bank_name, account_number, 
              ifsc_code, pan_number, address, status
       FROM employees WHERE employee_id = $1`,
      [req.user.employee_id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Employee not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Update employee profile
router.put('/profile', authMiddleware, isEmployee, async (req, res) => {
  try {
    const { phone, address, bank_name, account_number, ifsc_code, pan_number, gender } = req.body;
    
    const result = await pool.query(
      `UPDATE employees 
       SET phone = $1, address = $2, bank_name = $3, account_number = $4, 
           ifsc_code = $5, pan_number = $6, gender = $7
       WHERE employee_id = $8 RETURNING *`,
      [phone, address, bank_name, account_number, ifsc_code, pan_number, gender, req.user.employee_id]
    );
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Submit attendance
router.post('/attendance', authMiddleware, isEmployee, async (req, res) => {
  try {
    const { date, status, hours_worked, overtime_hours, notes } = req.body;
    
    const result = await pool.query(
      `INSERT INTO attendance_requests (employee_id, date, status, hours_worked, overtime_hours, notes, approval_status)
       VALUES ($1, $2, $3, $4, $5, $6, 'pending')
       ON CONFLICT (employee_id, date)
       DO UPDATE SET status = $3, hours_worked = $4, overtime_hours = $5, notes = $6, approval_status = 'pending'
       RETURNING *`,
      [req.user.employee_id, date, status, hours_worked || 0, overtime_hours || 0, notes]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error submitting attendance:', error);
    res.status(500).json({ error: 'Failed to submit attendance' });
  }
});

// Get my attendance
router.get('/attendance', authMiddleware, isEmployee, async (req, res) => {
  try {
    const { month, year } = req.query;
    let query = 'SELECT * FROM attendance_requests WHERE employee_id = $1';
    const params = [req.user.employee_id];
    
    if (month && year) {
      params.push(month);
      query += ` AND EXTRACT(MONTH FROM date) = $${params.length}`;
      params.push(year);
      query += ` AND EXTRACT(YEAR FROM date) = $${params.length}`;
    }
    
    query += ' ORDER BY date DESC';
    
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching attendance:', error);
    res.status(500).json({ error: 'Failed to fetch attendance' });
  }
});

// Get my salary slips
router.get('/salary-slips', authMiddleware, isEmployee, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT p.*,
              COALESCE(SUM(b.amount), 0) as total_bonuses,
              COALESCE(SUM(d.amount), 0) as total_deductions,
              ss.generated_at, ss.viewed_at
       FROM payroll p
       LEFT JOIN salary_slips ss ON p.id = ss.payroll_id
       LEFT JOIN bonuses b ON p.employee_id = b.employee_id AND EXTRACT(MONTH FROM b.date) = p.month AND EXTRACT(YEAR FROM b.date) = p.year
       LEFT JOIN deductions d ON p.employee_id = d.employee_id AND EXTRACT(MONTH FROM d.date) = p.month AND EXTRACT(YEAR FROM d.date) = p.year
       WHERE p.employee_id = $1 AND p.status = 'paid'
       GROUP BY p.id, ss.generated_at, ss.viewed_at
       ORDER BY p.year DESC, p.month DESC`,
      [req.user.employee_id]
    );
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching salary slips:', error);
    res.status(500).json({ error: 'Failed to fetch salary slips' });
  }
});

// Get specific salary slip
router.get('/salary-slips/:id', authMiddleware, isEmployee, async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      `SELECT p.*,
              COALESCE(SUM(b.amount), 0) as total_bonuses,
              COALESCE(SUM(d.amount), 0) as total_deductions
       FROM payroll p
       LEFT JOIN bonuses b ON p.employee_id = b.employee_id AND EXTRACT(MONTH FROM b.date) = p.month AND EXTRACT(YEAR FROM b.date) = p.year
       LEFT JOIN deductions d ON p.employee_id = d.employee_id AND EXTRACT(MONTH FROM d.date) = p.month AND EXTRACT(YEAR FROM d.date) = p.year
       WHERE p.id = $1 AND p.employee_id = $2
       GROUP BY p.id`,
      [id, req.user.employee_id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Salary slip not found' });
    }
    
    // Mark as viewed
    await pool.query(
      `INSERT INTO salary_slips (payroll_id, employee_id, month, year)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT DO NOTHING`,
      [id, req.user.employee_id, result.rows[0].month, result.rows[0].year]
    );
    
    await pool.query(
      `UPDATE salary_slips SET viewed_at = NOW() WHERE payroll_id = $1`,
      [id]
    );
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching salary slip:', error);
    res.status(500).json({ error: 'Failed to fetch salary slip' });
  }
});

// Get my deductions
router.get('/deductions', authMiddleware, isEmployee, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM deductions WHERE employee_id = $1 ORDER BY date DESC',
      [req.user.employee_id]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching deductions:', error);
    res.status(500).json({ error: 'Failed to fetch deductions' });
  }
});

// Get my bonuses
router.get('/bonuses', authMiddleware, isEmployee, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM bonuses WHERE employee_id = $1 ORDER BY date DESC',
      [req.user.employee_id]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching bonuses:', error);
    res.status(500).json({ error: 'Failed to fetch bonuses' });
  }
});

// Upload document
router.post('/documents', authMiddleware, isEmployee, upload.single('document'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    const { document_type } = req.body;
    
    const result = await pool.query(
      `INSERT INTO documents (employee_id, document_type, document_name, file_path, file_size)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [req.user.employee_id, document_type, req.file.originalname, req.file.path, req.file.size]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error uploading document:', error);
    res.status(500).json({ error: 'Failed to upload document' });
  }
});

// Get my documents
router.get('/documents', authMiddleware, isEmployee, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM documents WHERE employee_id = $1 ORDER BY uploaded_at DESC',
      [req.user.employee_id]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching documents:', error);
    res.status(500).json({ error: 'Failed to fetch documents' });
  }
});

// Manager: Get all employee documents (open access for dashboard)
router.get('/all-documents', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT d.*, e.first_name, e.last_name, e.employee_id
       FROM documents d
       JOIN employees e ON d.employee_id = e.employee_id
       ORDER BY d.uploaded_at DESC`
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching documents:', error);
    res.status(500).json({ error: 'Failed to fetch documents' });
  }
});

// Delete document
router.delete('/documents/:id', authMiddleware, isEmployee, async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query(
      'DELETE FROM documents WHERE id = $1 AND employee_id = $2',
      [id, req.user.employee_id]
    );
    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    console.error('Error deleting document:', error);
    res.status(500).json({ error: 'Failed to delete document' });
  }
});

// Manager: Get pending attendance approvals
router.get('/attendance-requests', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT ar.*, e.first_name, e.last_name, e.employee_id, e.designation, e.department
       FROM attendance_requests ar
       JOIN employees e ON ar.employee_id = e.employee_id
       WHERE ar.approval_status = 'pending'
       ORDER BY ar.date DESC`,
      []
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching attendance requests:', error);
    res.status(500).json({ error: 'Failed to fetch attendance requests' });
  }
});

// Manager: Approve or reject attendance
router.put('/attendance-requests/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { approval_status, notes } = req.body;

    if (!['approved', 'rejected'].includes(approval_status)) {
      return res.status(400).json({ error: 'Invalid approval status' });
    }

    const result = await pool.query(
      `UPDATE attendance_requests 
       SET approval_status = $1, approved_by = $2, approved_date = NOW(), notes = $3
       WHERE id = $4
       RETURNING *`,
      [approval_status, req.user.employee_id, notes || null, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Attendance request not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating attendance request:', error);
    res.status(500).json({ error: 'Failed to update attendance request' });
  }
});

// Manager: Delete document (admin access)
router.delete('/documents/manager/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // First get the file path
    const result = await pool.query('SELECT file_path FROM documents WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Document not found' });
    }
    
    const filePath = result.rows[0].file_path;
    
    // Delete from database
    await pool.query('DELETE FROM documents WHERE id = $1', [id]);
    
    // Delete file from filesystem if it exists
    if (filePath) {
      const absolutePath = path.resolve(filePath);
      if (fs.existsSync(absolutePath)) {
        fs.unlinkSync(absolutePath);
      }
    }
    
    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    console.error('Error deleting document:', error);
    res.status(500).json({ error: 'Failed to delete document' });
  }
});

module.exports = router;
