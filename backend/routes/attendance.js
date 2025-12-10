const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// Get pending attendance requests (for manager approval) - MUST come before /:id routes
router.get('/requests/pending', async (req, res) => {
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
    console.error('Error fetching pending attendance requests:', error);
    res.status(500).json({ error: 'Failed to fetch pending attendance requests' });
  }
});

// Approve or reject attendance request (for manager)
router.put('/requests/:id/approve', async (req, res) => {
  console.log(`[Attendance] Processing approval for request ID: ${req.params.id}`);
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    const { id } = req.params;
    const { approval_status, notes } = req.body;

    console.log(`[Attendance] Status: ${approval_status}, Notes: ${notes}`);

    if (!['approved', 'rejected'].includes(approval_status)) {
      return res.status(400).json({ error: 'Invalid approval status' });
    }

    // Get the attendance request
    const requestResult = await client.query(
      `SELECT ar.*, e.basic_salary as salary FROM attendance_requests ar
       JOIN employees e ON ar.employee_id = e.employee_id
       WHERE ar.id = $1`,
      [id]
    );

    if (requestResult.rows.length === 0) {
      console.log('[Attendance] Request not found');
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Attendance request not found' });
    }

    const attendanceRequest = requestResult.rows[0];
    console.log('[Attendance] Found request:', attendanceRequest);
    const { employee_id, date } = attendanceRequest;
    
    // Calculate days based on status
    let days_requested = 0;
    if (attendanceRequest.status === 'present' || attendanceRequest.status === 'leave') {
      days_requested = 1;
    } else if (attendanceRequest.status === 'half-day') {
      days_requested = 0.5;
    }
    console.log(`[Attendance] Days requested: ${days_requested}`);

    // Update attendance request
    const updateResult = await client.query(
      `UPDATE attendance_requests 
       SET approval_status = $1, approved_at = NOW(), notes = $2
       WHERE id = $3
       RETURNING *`,
      [approval_status, notes || null, id]
    );
    console.log('[Attendance] Updated attendance_requests table');

    // If approved, calculate extra days and update monthly_attendance
    if (approval_status === 'approved') {
      // Sync to attendance table
      console.log('[Attendance] Syncing to attendance table...');
      await client.query(
        `INSERT INTO attendance (employee_id, date, status, hours_worked, overtime_hours, notes)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (employee_id, date) 
         DO UPDATE SET status = $3, hours_worked = $4, overtime_hours = $5, notes = $6`,
        [
          attendanceRequest.employee_id, 
          attendanceRequest.date, 
          attendanceRequest.status, 
          attendanceRequest.hours_worked, 
          attendanceRequest.overtime_hours, 
          attendanceRequest.notes
        ]
      );
      console.log('[Attendance] Synced to attendance table');

      const requestDate = new Date(date);
      const month = requestDate.getMonth() + 1;
      const year = requestDate.getFullYear();
      console.log(`[Attendance] Month: ${month}, Year: ${year}`);

      // Calculate extra days: if employee worked on leave days, those are extra days
      const extraDays = 0; // Will be calculated when attendance is marked on leave days
      const salary = parseFloat(attendanceRequest.salary) || 0;
      const dailyRate = salary / 30; // Assuming 30 working days per month
      const extraDaysAmount = extraDays * dailyRate;
      console.log(`[Attendance] Salary: ${salary}, Daily Rate: ${dailyRate}`);

      // Get or create monthly attendance record
      let monthlyRecord = await client.query(
        `SELECT * FROM monthly_attendance 
         WHERE employee_id = $1 AND month = $2 AND year = $3`,
        [employee_id, month, year]
      );

      if (monthlyRecord.rows.length === 0) {
        console.log('[Attendance] Creating new monthly record');
        // Create new monthly record
        await client.query(
          `INSERT INTO monthly_attendance 
           (employee_id, month, year, days_worked, leave_days, extra_days, extra_days_amount, status, approved_date)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())`,
          [employee_id, month, year, days_requested, 0, extraDays, extraDaysAmount, 'approved']
        );
      } else {
        console.log('[Attendance] Updating existing monthly record');
        // Update existing monthly record
        const currentRecord = monthlyRecord.rows[0];
        const newDaysWorked = (currentRecord.days_worked || 0) + days_requested;
        
        await client.query(
          `UPDATE monthly_attendance 
           SET days_worked = $1, extra_days = $2, extra_days_amount = $3, status = $4, approved_date = NOW()
           WHERE employee_id = $5 AND month = $6 AND year = $7`,
          [newDaysWorked, extraDays, extraDaysAmount, 'approved', employee_id, month, year]
        );
      }
    }

    await client.query('COMMIT');
    console.log('[Attendance] Transaction committed successfully');
    res.json(updateResult.rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error updating attendance request:', error);
    res.status(500).json({ error: 'Failed to update attendance request', details: error.message });
  } finally {
    client.release();
  }
});

// Get all attendance records
router.get('/', async (req, res) => {
  try {
    const { employee_id, month, year } = req.query;
    let query = 'SELECT * FROM attendance WHERE 1=1';
    const params = [];
    
    if (employee_id) {
      params.push(employee_id);
      query += ` AND employee_id = $${params.length}`;
    }
    
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

// Mark extra days worked (when employee works on a leave day)
router.post('/mark-extra-days', async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    const { employee_id, date, month, year } = req.body;

    // Get employee salary for rate calculation
    const empResult = await client.query(
      'SELECT salary FROM employees WHERE employee_id = $1',
      [employee_id]
    );

    if (empResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Employee not found' });
    }

    const dailyRate = empResult.rows[0].salary / 30; // 30 working days per month

    // Get or create monthly attendance record
    let monthlyRecord = await client.query(
      `SELECT * FROM monthly_attendance 
       WHERE employee_id = $1 AND month = $2 AND year = $3`,
      [employee_id, month, year]
    );

    if (monthlyRecord.rows.length === 0) {
      // Create new monthly record with 1 extra day
      await client.query(
        `INSERT INTO monthly_attendance 
         (employee_id, month, year, extra_days, extra_days_amount, status)
         VALUES ($1, $2, $3, 1, $4, 'active')`,
        [employee_id, month, year, dailyRate]
      );
    } else {
      // Update existing record - increment extra days
      const current = monthlyRecord.rows[0];
      const newExtraDays = current.extra_days + 1;
      const newExtraAmount = newExtraDays * dailyRate;

      await client.query(
        `UPDATE monthly_attendance 
         SET extra_days = $1, extra_days_amount = $2
         WHERE employee_id = $3 AND month = $4 AND year = $5`,
        [newExtraDays, newExtraAmount, employee_id, month, year]
      );
    }

    await client.query('COMMIT');
    res.json({ message: 'Extra day marked successfully', extra_days: 1, daily_rate: dailyRate });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error marking extra days:', error);
    res.status(500).json({ error: 'Failed to mark extra days' });
  } finally {
    client.release();
  }
});

// Add attendance record
router.post('/', async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { employee_id, date, status, hours_worked, overtime_hours, notes } = req.body;
    
    const result = await client.query(
      `INSERT INTO attendance (employee_id, date, status, hours_worked, overtime_hours, notes)
       VALUES ($1, $2, $3, $4, $5, $6) 
       ON CONFLICT (employee_id, date) 
       DO UPDATE SET status = $3, hours_worked = $4, overtime_hours = $5, notes = $6
       RETURNING *`,
      [employee_id, date, status, hours_worked || 0, overtime_hours || 0, notes]
    );

    // Sync to attendance_requests (as approved)
    await client.query(
      `INSERT INTO attendance_requests (employee_id, date, status, hours_worked, overtime_hours, notes, approval_status, approved_at, approved_by)
       VALUES ($1, $2, $3, $4, $5, $6, 'approved', NOW(), 'Manager')
       ON CONFLICT (employee_id, date)
       DO UPDATE SET status = $3, hours_worked = $4, overtime_hours = $5, notes = $6, approval_status = 'approved', approved_at = NOW()`,
      [employee_id, date, status, hours_worked || 0, overtime_hours || 0, notes]
    );
    
    await client.query('COMMIT');
    res.status(201).json(result.rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating attendance:', error);
    res.status(500).json({ error: 'Failed to create attendance record' });
  } finally {
    client.release();
  }
});

// Update attendance record
router.put('/:id', async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { id } = req.params;
    const { status, hours_worked, overtime_hours, notes } = req.body;
    
    const result = await client.query(
      `UPDATE attendance 
       SET status = $1, hours_worked = $2, overtime_hours = $3, notes = $4
       WHERE id = $5 RETURNING *`,
      [status, hours_worked, overtime_hours, notes, id]
    );
    
    if (result.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Attendance record not found' });
    }

    const updatedRecord = result.rows[0];

    // Sync to attendance_requests
    await client.query(
      `INSERT INTO attendance_requests (employee_id, date, status, hours_worked, overtime_hours, notes, approval_status, approved_at, approved_by)
       VALUES ($1, $2, $3, $4, $5, $6, 'approved', NOW(), 'Manager')
       ON CONFLICT (employee_id, date)
       DO UPDATE SET status = $3, hours_worked = $4, overtime_hours = $5, notes = $6, approval_status = 'approved', approved_at = NOW()`,
      [updatedRecord.employee_id, updatedRecord.date, status, hours_worked || 0, overtime_hours || 0, notes]
    );
    
    await client.query('COMMIT');
    res.json(updatedRecord);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error updating attendance:', error);
    res.status(500).json({ error: 'Failed to update attendance record' });
  } finally {
    client.release();
  }
});

// Delete attendance record
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM attendance WHERE id = $1', [id]);
    res.json({ message: 'Attendance record deleted successfully' });
  } catch (error) {
    console.error('Error deleting attendance:', error);
    res.status(500).json({ error: 'Failed to delete attendance record' });
  }
});

module.exports = router;
