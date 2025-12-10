const path = require('path');
const { Client } = require('pg');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

async function addColumns() {
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'payroll_db',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || ''
  });

  try {
    await client.connect();
    console.log('Connected to database');
    
    await client.query(`
      ALTER TABLE payroll 
      ADD COLUMN IF NOT EXISTS hra DECIMAL(10, 2) DEFAULT 0,
      ADD COLUMN IF NOT EXISTS da DECIMAL(10, 2) DEFAULT 0,
      ADD COLUMN IF NOT EXISTS pf DECIMAL(10, 2) DEFAULT 0,
      ADD COLUMN IF NOT EXISTS esi DECIMAL(10, 2) DEFAULT 0
    `);
    
    console.log('✅ Columns added successfully to payroll table');
    console.log('Columns: hra, da, pf, esi');
    
    await client.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error adding columns:', error.message);
    try {
      await client.end();
    } catch (e) {}
    process.exit(1);
  }
}

addColumns();
