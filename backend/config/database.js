const { Pool } = require('pg');
require('dotenv').config();

const requiredEnv = ['DB_USER', 'DB_HOST', 'DB_NAME', 'DB_PASSWORD', 'DB_PORT'];
const missing = requiredEnv.filter((key) => !process.env[key]);
if (missing.length) {
  console.warn(`Warning: missing database env vars: ${missing.join(', ')}`);
}

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

pool.on('connect', () => {
  console.log('Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

pool.verifyConnection = async () => {
  try {
    await pool.query('SELECT 1');
    console.log('Database connection verified');
    return true;
  } catch (err) {
    console.error('Database connection failed', err.message);
    return false;
  }
};

module.exports = pool;
