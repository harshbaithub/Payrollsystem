const { Client } = require('pg');
require('dotenv').config();

const migrateDatabase = async () => {
  const client = new Client({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
  });

  try {
    await client.connect();
    console.log('Connected to database');

    // Add new columns to employees table
    await client.query(`
      ALTER TABLE employees 
      ADD COLUMN IF NOT EXISTS password VARCHAR(255),
      ADD COLUMN IF NOT EXISTS bank_name VARCHAR(100),
      ADD COLUMN IF NOT EXISTS account_number VARCHAR(50),
      ADD COLUMN IF NOT EXISTS ifsc_code VARCHAR(20),
      ADD COLUMN IF NOT EXISTS pan_number VARCHAR(20),
      ADD COLUMN IF NOT EXISTS address TEXT;
    `);
    console.log('Updated employees table with new columns');

    // Create new tables
    await client.query(`
      CREATE TABLE IF NOT EXISTS documents (
        id SERIAL PRIMARY KEY,
        employee_id VARCHAR(50) REFERENCES employees(employee_id) ON DELETE CASCADE,
        document_type VARCHAR(50) NOT NULL,
        document_name VARCHAR(255) NOT NULL,
        file_path VARCHAR(500) NOT NULL,
        file_size INTEGER,
        uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Created documents table');

    await client.query(`
      CREATE TABLE IF NOT EXISTS salary_slips (
        id SERIAL PRIMARY KEY,
        payroll_id INTEGER REFERENCES payroll(id) ON DELETE CASCADE,
        employee_id VARCHAR(50) REFERENCES employees(employee_id) ON DELETE CASCADE,
        month INTEGER NOT NULL,
        year INTEGER NOT NULL,
        generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        viewed_at TIMESTAMP
      );
    `);
    console.log('Created salary_slips table');

    await client.query(`
      CREATE TABLE IF NOT EXISTS attendance_requests (
        id SERIAL PRIMARY KEY,
        employee_id VARCHAR(50) REFERENCES employees(employee_id) ON DELETE CASCADE,
        date DATE NOT NULL,
        status VARCHAR(20) NOT NULL,
        hours_worked DECIMAL(5, 2) DEFAULT 0,
        overtime_hours DECIMAL(5, 2) DEFAULT 0,
        notes TEXT,
        approval_status VARCHAR(20) DEFAULT 'pending',
        submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        approved_at TIMESTAMP,
        approved_by VARCHAR(50),
        UNIQUE(employee_id, date)
      );
    `);
    console.log('Created attendance_requests table');

    // Update existing employees with default passwords and bank info
    await client.query(`
      UPDATE employees 
      SET 
        password = '$2a$10$rN8QZ6F9KqX5Z1yYp0xGKOqKQMxZvqXZqF5Z1yYp0xGKOqKQMxZvq',
        bank_name = CASE 
          WHEN employee_id = 'EMP001' THEN 'HDFC Bank'
          WHEN employee_id = 'EMP002' THEN 'ICICI Bank'
          WHEN employee_id = 'EMP003' THEN 'SBI'
          WHEN employee_id = 'EMP004' THEN 'Axis Bank'
          ELSE bank_name
        END,
        account_number = CASE 
          WHEN employee_id = 'EMP001' THEN '12345678901234'
          WHEN employee_id = 'EMP002' THEN '98765432109876'
          WHEN employee_id = 'EMP003' THEN '11223344556677'
          WHEN employee_id = 'EMP004' THEN '55443322110099'
          ELSE account_number
        END,
        ifsc_code = CASE 
          WHEN employee_id = 'EMP001' THEN 'HDFC0001234'
          WHEN employee_id = 'EMP002' THEN 'ICIC0009876'
          WHEN employee_id = 'EMP003' THEN 'SBIN0001122'
          WHEN employee_id = 'EMP004' THEN 'UTIB0005544'
          ELSE ifsc_code
        END
      WHERE password IS NULL;
    `);
    console.log('Updated existing employees with default data');

    console.log('\n✅ Migration completed successfully!');
    console.log('Default password for all employees: password123');

    await client.end();
  } catch (error) {
    console.error('Migration error:', error);
    process.exit(1);
  }
};

migrateDatabase();
