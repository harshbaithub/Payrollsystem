const pool = require('../config/database');

async function checkColumns() {
  try {
    const res = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'attendance_requests'");
    console.log(res.rows.map(r => r.column_name));
  } catch (e) {
    console.error(e);
  } finally {
    // pool.end() might not be available depending on how pool is exported, but let's try to just exit
    process.exit(0);
  }
}

checkColumns();
