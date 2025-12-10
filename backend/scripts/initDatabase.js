const { Client } = require('pg');
require('dotenv').config();

const initDatabase = async () => {
  // First connect to default postgres database to create our database
  const client = new Client({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: 'postgres',
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
  });

  try {
    await client.connect();
    
    // Check if database exists
    const dbCheck = await client.query(
      "SELECT 1 FROM pg_database WHERE datname = $1",
      [process.env.DB_NAME]
    );

    if (dbCheck.rows.length === 0) {
      await client.query(`CREATE DATABASE ${process.env.DB_NAME}`);
      console.log(`Database ${process.env.DB_NAME} created successfully`);
    } else {
      console.log(`Database ${process.env.DB_NAME} already exists`);
    }

    await client.end();

    // Now connect to our new database to create tables
    const dbClient = new Client({
      user: process.env.DB_USER,
      host: process.env.DB_HOST,
      database: process.env.DB_NAME,
      password: process.env.DB_PASSWORD,
      port: process.env.DB_PORT,
    });

    await dbClient.connect();

    // Create tables
    await dbClient.query(`
      CREATE TABLE IF NOT EXISTS employees (
        id SERIAL PRIMARY KEY,
        employee_id VARCHAR(50) UNIQUE NOT NULL,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        phone VARCHAR(20),
        position VARCHAR(100) NOT NULL,
        department VARCHAR(100),
        hire_date DATE NOT NULL,
        basic_salary DECIMAL(10, 2) NOT NULL,
        status VARCHAR(20) DEFAULT 'active',
        password VARCHAR(255),
        bank_name VARCHAR(100),
        account_number VARCHAR(50),
        ifsc_code VARCHAR(20),
        pan_number VARCHAR(20),
        address TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await dbClient.query(`
      CREATE TABLE IF NOT EXISTS attendance (
        id SERIAL PRIMARY KEY,
        employee_id VARCHAR(50) REFERENCES employees(employee_id) ON DELETE CASCADE,
        date DATE NOT NULL,
        status VARCHAR(20) NOT NULL,
        hours_worked DECIMAL(5, 2) DEFAULT 0,
        overtime_hours DECIMAL(5, 2) DEFAULT 0,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(employee_id, date)
      );
    `);

    await dbClient.query(`
      CREATE TABLE IF NOT EXISTS deductions (
        id SERIAL PRIMARY KEY,
        employee_id VARCHAR(50) REFERENCES employees(employee_id) ON DELETE CASCADE,
        deduction_type VARCHAR(50) NOT NULL,
        amount DECIMAL(10, 2) NOT NULL,
        description TEXT,
        date DATE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await dbClient.query(`
      CREATE TABLE IF NOT EXISTS bonuses (
        id SERIAL PRIMARY KEY,
        employee_id VARCHAR(50) REFERENCES employees(employee_id) ON DELETE CASCADE,
        bonus_type VARCHAR(50) NOT NULL,
        amount DECIMAL(10, 2) NOT NULL,
        description TEXT,
        date DATE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await dbClient.query(`
      CREATE TABLE IF NOT EXISTS payroll (
        id SERIAL PRIMARY KEY,
        employee_id VARCHAR(50) REFERENCES employees(employee_id) ON DELETE CASCADE,
        month INTEGER NOT NULL,
        year INTEGER NOT NULL,
        basic_salary DECIMAL(10, 2) NOT NULL,
        hra DECIMAL(10, 2) DEFAULT 0,
        da DECIMAL(10, 2) DEFAULT 0,
        overtime_pay DECIMAL(10, 2) DEFAULT 0,
        bonuses DECIMAL(10, 2) DEFAULT 0,
        deductions DECIMAL(10, 2) DEFAULT 0,
        gross_salary DECIMAL(10, 2) NOT NULL,
        tax DECIMAL(10, 2) DEFAULT 0,
        pf DECIMAL(10, 2) DEFAULT 0,
        esi DECIMAL(10, 2) DEFAULT 0,
        net_salary DECIMAL(10, 2) NOT NULL,
        payment_date DATE,
        status VARCHAR(20) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(employee_id, month, year)
      );
    `);

    await dbClient.query(`
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

    await dbClient.query(`
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

    await dbClient.query(`
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

    console.log('All tables created successfully');

    // Insert sample data
    await dbClient.query(`
      INSERT INTO employees (employee_id, first_name, last_name, email, phone, position, department, hire_date, basic_salary, password, bank_name, account_number, ifsc_code)
      VALUES 
        ('EMP001', 'John', 'Doe', 'john.doe@company.com', '555-0101', 'Software Engineer', 'IT', '2023-01-15', 75000, '$2a$10$rN8QZ6F9KqX5Z1yYp0xGKOqKQMxZvqXZqF5Z1yYp0xGKOqKQMxZvq', 'HDFC Bank', '12345678901234', 'HDFC0001234'),
        ('EMP002', 'Jane', 'Smith', 'jane.smith@company.com', '555-0102', 'Senior Developer', 'IT', '2022-06-01', 90000, '$2a$10$rN8QZ6F9KqX5Z1yYp0xGKOqKQMxZvqXZqF5Z1yYp0xGKOqKQMxZvq', 'ICICI Bank', '98765432109876', 'ICIC0009876'),
        ('EMP003', 'Mike', 'Johnson', 'mike.johnson@company.com', '555-0103', 'HR Manager', 'HR', '2021-03-10', 65000, '$2a$10$rN8QZ6F9KqX5Z1yYp0xGKOqKQMxZvqXZqF5Z1yYp0xGKOqKQMxZvq', 'SBI', '11223344556677', 'SBIN0001122'),
        ('EMP004', 'Sarah', 'Williams', 'sarah.williams@company.com', '555-0104', 'Accountant', 'Finance', '2023-09-01', 60000, '$2a$10$rN8QZ6F9KqX5Z1yYp0xGKOqKQMxZvqXZqF5Z1yYp0xGKOqKQMxZvq', 'Axis Bank', '55443322110099', 'UTIB0005544')
      ON CONFLICT (employee_id) DO NOTHING;
    `);

    console.log('Sample employees inserted (Default password for all: password123)');

    await dbClient.end();
    console.log('Database initialization completed!');
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  }
};

initDatabase();
