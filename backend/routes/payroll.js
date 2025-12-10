const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// Get all payroll records
router.get('/', async (req, res) => {
  try {
    const { employee_id, month, year } = req.query;
    let query = `
      SELECT p.*, e.first_name, e.last_name, e.designation, e.department
      FROM payroll p
      JOIN employees e ON p.employee_id = e.employee_id
      WHERE 1=1
    `;
    const params = [];

    if (employee_id) {
      params.push(employee_id);
      query += ` AND p.employee_id = $${params.length}`;
    }

    if (month) {
      params.push(month);
      query += ` AND p.month = $${params.length}`;
    }

    if (year) {
      params.push(year);
      query += ` AND p.year = $${params.length}`;
    }

    query += ' ORDER BY p.year DESC, p.month DESC, p.id DESC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching payroll:', error);
    res.status(500).json({ error: 'Failed to fetch payroll records' });
  }
});

// Calculate and generate payroll for a month
router.post('/generate', async (req, res) => {
  const client = await pool.connect();

  try {
    const { month, year } = req.body;

    await client.query('BEGIN');

    // Get all active employees
    const employees = await client.query('SELECT * FROM employees WHERE status = $1', ['active']);

    const payrollRecords = [];

    for (const employee of employees.rows) {
      // Calculate attendance-based pay
      const attendanceResult = await client.query(
        `SELECT 
          COUNT(*) FILTER (WHERE status = 'present') as present_days,
          COUNT(*) FILTER (WHERE status = 'half-day') as half_days,
          COUNT(*) FILTER (WHERE status = 'leave') as leave_days,
          SUM(hours_worked) as total_hours,
          SUM(overtime_hours) as total_overtime
         FROM attendance 
         WHERE employee_id = $1 
         AND EXTRACT(MONTH FROM date) = $2 
         AND EXTRACT(YEAR FROM date) = $3`,
        [employee.employee_id, month, year]
      );

      const attendance = attendanceResult.rows[0];
      const presentDays = parseInt(attendance.present_days) || 0;
      const halfDays = parseInt(attendance.half_days) || 0;
      const leaveDays = parseInt(attendance.leave_days) || 0;
      const totalHours = parseFloat(attendance.total_hours) || 0;
      const totalOvertime = parseFloat(attendance.total_overtime) || 0;

      // Calculate extra days (working on weekends - Saturday=6, Sunday=0)
      const extraDaysResult = await client.query(
        `SELECT COUNT(*) as extra_days
         FROM attendance 
         WHERE employee_id = $1 
         AND EXTRACT(MONTH FROM date) = $2 
         AND EXTRACT(YEAR FROM date) = $3
         AND status IN ('present', 'half-day')
         AND EXTRACT(DOW FROM date) IN (0, 6)`,
        [employee.employee_id, month, year]
      );

      const automaticExtraDays = parseInt(extraDaysResult.rows[0].extra_days) || 0;

      // Get manual extra days (added via Adjustments)
      const manualExtraDaysResult = await client.query(
        `SELECT SUM(days_count) as manual_days
         FROM extra_days 
         WHERE employee_id = $1 
         AND EXTRACT(MONTH FROM date) = $2 
         AND EXTRACT(YEAR FROM date) = $3`,
        [employee.employee_id, month, year]
      );

      const manualExtraDays = parseFloat(manualExtraDaysResult.rows[0].manual_days) || 0;
      const extraDays = automaticExtraDays + manualExtraDays;

      // Calculate days
      const totalDays = 30; // Fixed standard
      const workedDays = presentDays + (halfDays * 0.5);
      const paidLeaveDays = leaveDays; // Assuming approved leaves are paid for now, or fetch from leave policy
      const payableDays = workedDays + paidLeaveDays;
      const absentDays = totalDays - payableDays;

      // Calculate salary based on payable days
      const dailyRate = parseFloat(employee.basic_salary) / 30;
      const basePay = payableDays * dailyRate;

      // Calculate extra pay for extra days worked (weekends/holidays)
      const extraPay = extraDays * dailyRate;

      // Calculate overtime pay (1.5x hourly rate)
      const hourlyRate = parseFloat(employee.basic_salary) / 160; // Assuming 160 hours/month
      const overtimePay = totalOvertime * hourlyRate * 1.5;

      // Get bonuses for the month
      const bonusesResult = await client.query(
        `SELECT SUM(amount) as total_bonuses
         FROM bonuses 
         WHERE employee_id = $1 
         AND EXTRACT(MONTH FROM date) = $2 
         AND EXTRACT(YEAR FROM date) = $3`,
        [employee.employee_id, month, year]
      );

      const totalBonuses = parseFloat(bonusesResult.rows[0].total_bonuses) || 0;

      // Get deductions for the month
      const deductionsResult = await client.query(
        `SELECT SUM(amount) as total_deductions
         FROM deductions 
         WHERE employee_id = $1 
         AND EXTRACT(MONTH FROM date) = $2 
         AND EXTRACT(YEAR FROM date) = $3`,
        [employee.employee_id, month, year]
      );

      const totalDeductions = parseFloat(deductionsResult.rows[0].total_deductions) || 0;

      // Calculate gross and net salary
      // Use calculated basePay instead of full basic_salary if we want pro-rated, 
      // but usually basic_salary in DB is the fixed monthly amount. 
      // Let's assume basic_salary is fixed, but we add a deduction for absent days if needed, 
      // OR we calculate earnings based on payable days.
      // Here, let's use the pro-rated basePay as the "Basic Salary" component for this month.
      const basicSalary = basePay;

      const hra = basicSalary * 0.40; // 40% of basic salary
      const da = basicSalary * 0.20; // 20% of basic salary
      const grossSalary = basicSalary + hra + da + overtimePay + extraPay + totalBonuses;
      const tax = grossSalary * 0.15; // 15% tax
      const pf = basicSalary * 0.12; // 12% of basic salary
      const esi = grossSalary * 0.0075; // 0.75% of gross salary
      const netSalary = grossSalary - tax - pf - esi - totalDeductions;

      // Insert or update payroll record
      const payrollResult = await client.query(
        `INSERT INTO payroll 
         (employee_id, month, year, basic_salary, hra, da, overtime_pay, bonuses, deductions, gross_salary, tax, pf, esi, net_salary, status, days_worked, extra_days, extra_pay, total_days, payable_days, absent_days, paid_leave_days)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22)
         ON CONFLICT (employee_id, month, year) 
         DO UPDATE SET 
           basic_salary = $4, hra = $5, da = $6, overtime_pay = $7, bonuses = $8, deductions = $9,
           gross_salary = $10, tax = $11, pf = $12, esi = $13, net_salary = $14, status = $15,
           days_worked = $16, extra_days = $17, extra_pay = $18,
           total_days = $19, payable_days = $20, absent_days = $21, paid_leave_days = $22`,
        [
          employee.employee_id, month, year,
          basicSalary, hra, da, overtimePay, totalBonuses, totalDeductions,
          grossSalary, tax, pf, esi, netSalary, 'generated',
          workedDays, extraDays, extraPay,
          totalDays, payableDays, absentDays, paidLeaveDays
        ]
      );

      payrollRecords.push(payrollResult.rows[0]);
    }

    await client.query('COMMIT');
    res.status(201).json({
      message: 'Payroll generated successfully',
      records: payrollRecords
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error generating payroll:', error);
    res.status(500).json({ error: 'Failed to generate payroll' });
  } finally {
    client.release();
  }
});

// Update payroll status
router.put('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, payment_date } = req.body;

    const result = await pool.query(
      `UPDATE payroll 
       SET status = $1, payment_date = $2
       WHERE id = $3 RETURNING *`,
      [status, payment_date, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Payroll record not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating payroll:', error);
    res.status(500).json({ error: 'Failed to update payroll' });
  }
});

// Get payroll summary
router.get('/summary', async (req, res) => {
  try {
    const { month, year } = req.query;

    const result = await pool.query(
      `SELECT 
        COUNT(*) as total_employees,
        SUM(gross_salary) as total_gross,
        SUM(tax) as total_tax,
        SUM(deductions) as total_deductions,
        SUM(net_salary) as total_net
       FROM payroll 
       WHERE month = $1 AND year = $2`,
      [month, year]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching payroll summary:', error);
    res.status(500).json({ error: 'Failed to fetch payroll summary' });
  }
});

module.exports = router;
