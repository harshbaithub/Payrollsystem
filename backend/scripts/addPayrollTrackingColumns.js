const pool = require('../config/database');

const addPayrollTrackingColumns = async () => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    const columns = [
      { name: 'total_days', type: 'INTEGER DEFAULT 30' },
      { name: 'payable_days', type: 'DECIMAL(5, 2) DEFAULT 0' },
      { name: 'absent_days', type: 'DECIMAL(5, 2) DEFAULT 0' },
      { name: 'paid_leave_days', type: 'DECIMAL(5, 2) DEFAULT 0' }
    ];

    for (const col of columns) {
      console.log(`Checking for ${col.name} column in payroll table...`);
      const checkCol = await client.query(
        "SELECT column_name FROM information_schema.columns WHERE table_name='payroll' AND column_name=$1",
        [col.name]
      );
      
      if (checkCol.rows.length === 0) {
        console.log(`Adding ${col.name} column...`);
        await client.query(`ALTER TABLE payroll ADD COLUMN ${col.name} ${col.type}`);
        console.log(`✓ ${col.name} column added`);
      } else {
        console.log(`✓ ${col.name} column already exists`);
      }
    }

    await client.query('COMMIT');
    console.log('\n✅ All payroll tracking columns added successfully!');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Migration error:', error);
    process.exit(1);
  } finally {
    client.release();
    process.exit(0);
  }
};

addPayrollTrackingColumns();
