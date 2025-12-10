const pool = require('../config/database');

const addMonthlyYearlyTracking = async () => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    // Add month and year columns to payroll table
    console.log('Checking for month column in payroll table...');
    const checkMonth = await client.query(
      "SELECT column_name FROM information_schema.columns WHERE table_name='payroll' AND column_name='month'"
    );
    
    if (checkMonth.rows.length === 0) {
      console.log('Adding month and year columns...');
      await client.query('ALTER TABLE payroll ADD COLUMN month INTEGER');
      await client.query('ALTER TABLE payroll ADD COLUMN year INTEGER');
      console.log('✓ month and year columns added');
    } else {
      console.log('✓ month and year columns already exist');
    }

    // Create monthly_attendance table for tracking leave days
    console.log('Checking for monthly_attendance table...');
    const checkMonthlyAttendance = await client.query(
      "SELECT EXISTS(SELECT FROM information_schema.tables WHERE table_name='monthly_attendance')"
    );
    
    if (!checkMonthlyAttendance.rows[0].exists) {
      console.log('Creating monthly_attendance table...');
      await client.query(`
        CREATE TABLE monthly_attendance (
          id SERIAL PRIMARY KEY,
          employee_id VARCHAR(50) REFERENCES employees(employee_id) ON DELETE CASCADE,
          month INTEGER NOT NULL,
          year INTEGER NOT NULL,
          total_days_expected INTEGER DEFAULT 30,
          days_worked INTEGER DEFAULT 0,
          leave_days INTEGER DEFAULT 0,
          extra_days INTEGER DEFAULT 0,
          extra_days_amount DECIMAL(10, 2) DEFAULT 0,
          status VARCHAR(20) DEFAULT 'pending',
          approved_date DATE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(employee_id, month, year)
        )
      `);
      console.log('✓ monthly_attendance table created');
    } else {
      console.log('✓ monthly_attendance table already exists');
    }

    // Create yearly_summary table
    console.log('Checking for yearly_summary table...');
    const checkYearlySummary = await client.query(
      "SELECT EXISTS(SELECT FROM information_schema.tables WHERE table_name='yearly_summary')"
    );
    
    if (!checkYearlySummary.rows[0].exists) {
      console.log('Creating yearly_summary table...');
      await client.query(`
        CREATE TABLE yearly_summary (
          id SERIAL PRIMARY KEY,
          employee_id VARCHAR(50) REFERENCES employees(employee_id) ON DELETE CASCADE,
          year INTEGER NOT NULL,
          total_days_worked INTEGER DEFAULT 0,
          total_leave_days INTEGER DEFAULT 0,
          total_extra_days INTEGER DEFAULT 0,
          total_extra_days_amount DECIMAL(10, 2) DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(employee_id, year)
        )
      `);
      console.log('✓ yearly_summary table created');
    } else {
      console.log('✓ yearly_summary table already exists');
    }

    // Add bonus_approved flag to bonuses table
    console.log('Checking for bonus_approved column in bonuses table...');
    const checkBonusApproved = await client.query(
      "SELECT column_name FROM information_schema.columns WHERE table_name='bonuses' AND column_name='bonus_approved'"
    );
    
    if (checkBonusApproved.rows.length === 0) {
      console.log('Adding bonus_approved column...');
      await client.query('ALTER TABLE bonuses ADD COLUMN bonus_approved BOOLEAN DEFAULT FALSE');
      await client.query('ALTER TABLE bonuses ADD COLUMN approval_date DATE');
      console.log('✓ bonus_approved and approval_date columns added');
    } else {
      console.log('✓ bonus_approved column already exists');
    }

    await client.query('COMMIT');
    console.log('\n✅ Monthly/Yearly tracking setup completed successfully!');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Migration error:', error);
    process.exit(1);
  } finally {
    client.release();
    process.exit(0);
  }
};

addMonthlyYearlyTracking();
