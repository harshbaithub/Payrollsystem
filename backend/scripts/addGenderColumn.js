const pool = require('../config/database');

const addGenderColumn = async () => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    console.log('Checking for gender column in employees table...');
    const checkGender = await client.query(
      "SELECT column_name FROM information_schema.columns WHERE table_name='employees' AND column_name='gender'"
    );
    
    if (checkGender.rows.length === 0) {
      console.log('Adding gender column...');
      await client.query("ALTER TABLE employees ADD COLUMN gender VARCHAR(20) CHECK (gender IN ('Male', 'Female', 'Other'))");
      console.log('✓ gender column added');
    } else {
      console.log('✓ gender column already exists');
    }

    await client.query('COMMIT');
    console.log('\n✅ Gender column migration completed successfully!');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Migration error:', error);
    process.exit(1);
  } finally {
    client.release();
    process.exit(0);
  }
};

addGenderColumn();
