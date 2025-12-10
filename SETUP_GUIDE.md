# Payroll System - Complete Setup Guide

## Prerequisites Installation

### 1. Install PostgreSQL

If PostgreSQL is not installed, download and install it:

1. Download PostgreSQL from: https://www.postgresql.org/download/windows/
2. Run the installer
3. During installation:
   - Remember the password you set for the `postgres` user
   - Default port is 5432 (keep this)
   - Install pgAdmin 4 (recommended for database management)

### 2. Start PostgreSQL Service

After installation, PostgreSQL should start automatically. If not:

**Method 1: Using Services**
1. Press `Win + R`, type `services.msc` and press Enter
2. Find "postgresql-x64-xx" service
3. Right-click and select "Start"

**Method 2: Using Command Line (Run as Administrator)**
```powershell
net start postgresql-x64-16
```

**Method 3: Check if PostgreSQL is running**
```powershell
Get-Service -Name postgresql*
```

### 3. Verify PostgreSQL Installation

Open PowerShell and try to connect:
```powershell
psql -U postgres
```

If this opens the PostgreSQL prompt, your installation is working!

## Quick Setup Steps

### Step 1: Update Database Password

Open `backend\.env` and update the database password:
```
DB_PASSWORD=your_postgres_password_here
```

### Step 2: Install Dependencies

```powershell
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### Step 3: Initialize Database

```powershell
cd backend
npm run init-db
```

This will:
- Create the `payroll_db` database
- Create all required tables
- Insert sample employee data

### Step 4: Start the Application

**Option A: Use the startup script**
```powershell
cd d:\payrollsystem
.\start.bat
```

**Option B: Manual start**

Terminal 1 (Backend):
```powershell
cd backend
npm start
```

Terminal 2 (Frontend):
```powershell
cd frontend
npm start
```

## Troubleshooting

### Issue: "ECONNREFUSED" or "Connection refused"

**Solution:**
1. Ensure PostgreSQL service is running
2. Check PostgreSQL port (default: 5432)
3. Verify credentials in `backend\.env`

**Check PostgreSQL status:**
```powershell
Get-Service -Name postgresql*
```

**Start PostgreSQL:**
```powershell
# Run as Administrator
net start postgresql-x64-16
```

### Issue: "database does not exist"

**Solution:**
Run the initialization script:
```powershell
cd backend
npm run init-db
```

### Issue: "authentication failed"

**Solution:**
1. Open `backend\.env`
2. Update `DB_PASSWORD` with your PostgreSQL password
3. Ensure the `postgres` user exists

### Issue: Port 5000 or 3000 already in use

**Solution:**
- Change backend port in `backend\.env`: `PORT=5001`
- Frontend will automatically prompt to use a different port

### Issue: Cannot find 'psql' command

**Solution:**
Add PostgreSQL to PATH:
1. Find PostgreSQL bin folder (usually `C:\Program Files\PostgreSQL\16\bin`)
2. Add to Windows PATH environment variable
3. Restart your terminal

## Manual Database Setup

If automatic setup fails, you can manually create the database:

### 1. Open psql
```powershell
psql -U postgres
```

### 2. Create database
```sql
CREATE DATABASE payroll_db;
\c payroll_db
```

### 3. Run the SQL from `backend\scripts\initDatabase.js`
Copy and paste the CREATE TABLE statements from the script into psql.

## Verifying the Installation

### Check Backend
1. Open browser: http://localhost:5000/api/health
2. Should see: `{"status":"ok","message":"Payroll API is running"}`

### Check Frontend
1. Open browser: http://localhost:3000
2. Should see the Payroll System dashboard

### Check Database
```powershell
psql -U postgres -d payroll_db
```

Then in psql:
```sql
\dt  -- List all tables
SELECT * FROM employees;  -- View sample employees
```

## System Requirements

- **Node.js**: v14 or higher
- **PostgreSQL**: v12 or higher
- **RAM**: 4GB minimum
- **Disk Space**: 500MB

## Default Credentials

- **Database User**: postgres
- **Database Password**: (as set during PostgreSQL installation)
- **Database Name**: payroll_db

## Sample Data

After initialization, you'll have 4 sample employees:
- EMP001: John Doe (Software Engineer)
- EMP002: Jane Smith (Senior Developer)
- EMP003: Mike Johnson (HR Manager)
- EMP004: Sarah Williams (Accountant)

## Next Steps

1. Start both backend and frontend servers
2. Open http://localhost:3000 in your browser
3. Explore the dashboard
4. Add employees, mark attendance, and generate payroll!

## Support

If you encounter issues:
1. Check that PostgreSQL is running
2. Verify database credentials in `.env`
3. Ensure both servers are running
4. Check console for error messages

## Common PostgreSQL Commands

```sql
-- List databases
\l

-- Connect to database
\c payroll_db

-- List tables
\dt

-- View table structure
\d employees

-- View data
SELECT * FROM employees;

-- Exit psql
\q
```
