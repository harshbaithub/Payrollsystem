const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config();

const pool = require('./config/database');
const authRoutes = require('./routes/auth');
const employeePortalRoutes = require('./routes/employeePortal');
const employeeRoutes = require('./routes/employees');
const attendanceRoutes = require('./routes/attendance');
const payrollRoutes = require('./routes/payroll');
const deductionRoutes = require('./routes/deductions');
const bonusRoutes = require('./routes/bonuses');
const extraDaysRoutes = require('./routes/extraDays');
const advanceSalaryRoutes = require('./routes/advanceSalary');

const app = express();

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:4000', 'http://localhost:3001'],
  credentials: true
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/employee', employeePortalRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/payroll', payrollRoutes);
app.use('/api/deductions', deductionRoutes);
app.use('/api/bonuses', bonusRoutes);
app.use('/api/extra-days', extraDaysRoutes);
app.use('/api/advance-salary', advanceSalaryRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Payroll API is running' });
});

// Database health check
app.get('/api/db-health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', message: 'Database connection verified' });
  } catch (err) {
    console.error('DB health check failed', err);
    res.status(500).json({ status: 'error', message: 'Database connection failed', detail: err.message });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;

// Verify DB connectivity on startup (non-blocking)
if (typeof pool.verifyConnection === 'function') {
  pool.verifyConnection().catch((err) => console.error('DB verification error', err));
}

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
