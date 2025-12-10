const pool = require('../config/database');

const addNewColumns = async () => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    // Add designation column to employees table (rename position)
    console.log('Checking for designation column in employees table...');
    const checkDesignation = await client.query(
      "SELECT column_name FROM information_schema.columns WHERE table_name='employees' AND column_name='designation'"
    );
    
    if (checkDesignation.rows.length === 0) {
      console.log('Adding designation column...');
      await client.query('ALTER TABLE employees ADD COLUMN designation VARCHAR(100)');
      // Copy position data to designation
      await client.query('UPDATE employees SET designation = position WHERE designation IS NULL');
      console.log('✓ designation column added');
    } else {
      console.log('✓ designation column already exists');
    }

    // Add days_worked column to payroll table
    console.log('Checking for days_worked column in payroll table...');
    const checkDaysWorked = await client.query(
      "SELECT column_name FROM information_schema.columns WHERE table_name='payroll' AND column_name='days_worked'"
    );
    
    if (checkDaysWorked.rows.length === 0) {
      console.log('Adding days_worked column...');
      await client.query('ALTER TABLE payroll ADD COLUMN days_worked INTEGER DEFAULT 0');
      console.log('✓ days_worked column added');
    } else {
      console.log('✓ days_worked column already exists');
    }

    // Add extra_days column to payroll table
    console.log('Checking for extra_days column in payroll table...');
    const checkExtraDays = await client.query(
      "SELECT column_name FROM information_schema.columns WHERE table_name='payroll' AND column_name='extra_days'"
    );
    
    if (checkExtraDays.rows.length === 0) {
      console.log('Adding extra_days column...');
      await client.query('ALTER TABLE payroll ADD COLUMN extra_days INTEGER DEFAULT 0');
      console.log('✓ extra_days column added');
    } else {
      console.log('✓ extra_days column already exists');
    }

    // Add extra_amount column to payroll table
    console.log('Checking for extra_amount column in payroll table...');
    const checkExtraAmount = await client.query(
      "SELECT column_name FROM information_schema.columns WHERE table_name='payroll' AND column_name='extra_amount'"
    );
    
    if (checkExtraAmount.rows.length === 0) {
      console.log('Adding extra_amount column...');
      await client.query('ALTER TABLE payroll ADD COLUMN extra_amount DECIMAL(10, 2) DEFAULT 0');
      console.log('✓ extra_amount column added');
    } else {
      console.log('✓ extra_amount column already exists');
    }

    // Create advance_salary table
    console.log('Checking for advance_salary table...');
    const checkAdvanceTable = await client.query(
      "SELECT EXISTS(SELECT FROM information_schema.tables WHERE table_name='advance_salary')"
    );
    
    if (!checkAdvanceTable.rows[0].exists) {
      console.log('Creating advance_salary table...');
      await client.query(`
        CREATE TABLE advance_salary (
          id SERIAL PRIMARY KEY,
          employee_id VARCHAR(50) REFERENCES employees(employee_id) ON DELETE CASCADE,
          amount DECIMAL(10, 2) NOT NULL,
          requested_date DATE NOT NULL,
          approval_status VARCHAR(20) DEFAULT 'pending',
          approved_date DATE,
          deduction_month INTEGER,
          deduction_year INTEGER,
          notes TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      console.log('✓ advance_salary table created');
    } else {
      console.log('✓ advance_salary table already exists');
    }

    // Add advance_salary_deducted column to payroll table
    console.log('Checking for advance_salary_deducted column in payroll table...');
    const checkAdvanceDeducted = await client.query(
      "SELECT column_name FROM information_schema.columns WHERE table_name='payroll' AND column_name='advance_salary_deducted'"
    );
    
    if (checkAdvanceDeducted.rows.length === 0) {
      console.log('Adding advance_salary_deducted column...');
      await client.query('ALTER TABLE payroll ADD COLUMN advance_salary_deducted DECIMAL(10, 2) DEFAULT 0');
      console.log('✓ advance_salary_deducted column added');
    } else {
      console.log('✓ advance_salary_deducted column already exists');
    }

    await client.query('COMMIT');
    console.log('\n✅ All migrations completed successfully!');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Migration error:', error);
    process.exit(1);
  } finally {
    client.release();
    process.exit(0);
  }
};

addNewColumns();
