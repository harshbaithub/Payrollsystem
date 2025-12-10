const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'payroll_db',
  user: 'postgres',
  password: 'admin'
});

async function addColumns() {
  try {
    await pool.query(`
      ALTER TABLE payroll 
      ADD COLUMN IF NOT EXISTS hra DECIMAL(10, 2) DEFAULT 0,
      ADD COLUMN IF NOT EXISTS da DECIMAL(10, 2) DEFAULT 0,
      ADD COLUMN IF NOT EXISTS pf DECIMAL(10, 2) DEFAULT 0,
      ADD COLUMN IF NOT EXISTS esi DECIMAL(10, 2) DEFAULT 0
    `);
    console.log('✅ Columns added successfully to payroll table');
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error adding columns:', error);
    await pool.end();
    process.exit(1);
  }
}

addColumns();
