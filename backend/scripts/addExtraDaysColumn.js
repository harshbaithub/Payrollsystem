const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'payrollsystem',
  password: process.env.DB_PASSWORD || 'postgres',
  port: process.env.DB_PORT || 5432,
});

async function addExtraDaysColumn() {
  try {
    console.log('Adding extra_days column to payroll table...');
    
    // Add extra_days column for overtime on leave days
    await pool.query(`
      ALTER TABLE payroll 
      ADD COLUMN IF NOT EXISTS extra_days INTEGER DEFAULT 0;
    `);
    
    console.log('✓ extra_days column added successfully');
    
    // Add extra_pay column for additional earnings from extra days
    await pool.query(`
      ALTER TABLE payroll 
      ADD COLUMN IF NOT EXISTS extra_pay DECIMAL(10,2) DEFAULT 0;
    `);
    
    console.log('✓ extra_pay column added successfully');
    
    console.log('\nMigration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error during migration:', error);
    process.exit(1);
  }
}

addExtraDaysColumn();
