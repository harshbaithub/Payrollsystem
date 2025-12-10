# 🚀 Payroll System - Quick Start Guide

## ⚠️ Important: PostgreSQL Setup Required

This application requires PostgreSQL to be installed and running. Follow the steps below:

## Step 1: Install PostgreSQL

### Download and Install
1. Go to: https://www.postgresql.org/download/windows/
2. Download the latest version (PostgreSQL 16 recommended)
3. Run the installer
4. **During installation:**
   - Set a password for the `postgres` user (remember this!)
   - Default port: 5432 (keep this)
   - Select all components (including pgAdmin 4)
   - Click through to complete installation

### Verify Installation
Open PowerShell and run:
```powershell
Get-Service -Name postgresql*
```

You should see the PostgreSQL service listed and running.

## Step 2: Configure the Application

1. Open `backend\.env` file
2. Update the database password:
   ```
   DB_PASSWORD=your_password_here
   ```
   Replace `your_password_here` with the password you set during PostgreSQL installation.

## Step 3: Install Dependencies

✅ **Already completed!** Dependencies are installed for:
- Backend: Express, PostgreSQL driver, CORS, etc.
- Frontend: React, React Router, Axios, etc.

## Step 4: Initialize Database

Once PostgreSQL is installed and running:

```powershell
cd backend
npm run init-db
```

This creates:
- Database: `payroll_db`
- Tables: employees, attendance, payroll, deductions, bonuses
- Sample data: 4 employees

## Step 5: Start the Application

### Option A: Use the Startup Script (Easiest)
```powershell
.\start.bat
```

### Option B: Manual Start
Open two PowerShell windows:

**Window 1 - Backend:**
```powershell
cd backend
npm start
```
Backend runs on: http://localhost:5000

**Window 2 - Frontend:**
```powershell
cd frontend
npm start
```
Frontend opens automatically at: http://localhost:3000

## 📊 Using the Application

### 1. Dashboard
- View system statistics
- Quick access to all features

### 2. Employee Management
- Add new employees (Employee ID, Name, Position, Salary, etc.)
- Edit employee details
- Manage employee status (Active/Inactive)

### 3. Attendance Tracking
- Mark daily attendance
- Record work hours and overtime
- Status options: Present, Absent, Half-Day, Leave

### 4. Salary Adjustments
- Add deductions (Tax, Insurance, etc.)
- Add bonuses (Performance, Festival, etc.)

### 5. Process Payroll
- Select month and year
- Click "Generate Payroll"
- System automatically calculates:
  - Basic salary
  - Overtime pay (1.5x hourly rate)
  - Bonuses
  - Deductions
  - Tax (15%)
  - Net salary
- Approve and mark as paid

## 🔧 Troubleshooting

### PostgreSQL Not Running?

**Start the service:**
```powershell
# Run PowerShell as Administrator
net start postgresql-x64-16
```

**Or use Services:**
1. Press `Win + R`
2. Type `services.msc` and press Enter
3. Find "postgresql-x64-16"
4. Right-click → Start

### Connection Refused Error?

1. Check PostgreSQL is running: `Get-Service -Name postgresql*`
2. Verify password in `backend\.env`
3. Try connecting with psql: `psql -U postgres`

### Port Already in Use?

**Backend (Port 5000):**
- Change in `backend\.env`: `PORT=5001`

**Frontend (Port 3000):**
- The terminal will prompt you to use a different port

### Database Connection Issues?

1. Open `backend\.env`
2. Verify these settings:
   ```
   DB_USER=postgres
   DB_HOST=localhost
   DB_NAME=payroll_db
   DB_PASSWORD=your_actual_password
   DB_PORT=5432
   ```

## 📝 Default Sample Data

After database initialization, you'll have 4 employees:

| ID | Name | Position | Department | Salary |
|---|---|---|---|---|
| EMP001 | John Doe | Software Engineer | IT | $75,000 |
| EMP002 | Jane Smith | Senior Developer | IT | $90,000 |
| EMP003 | Mike Johnson | HR Manager | HR | $65,000 |
| EMP004 | Sarah Williams | Accountant | Finance | $60,000 |

## 🎯 Next Steps

1. **If PostgreSQL is not installed:**
   - Install PostgreSQL from the link above
   - Update `backend\.env` with your password
   - Run `npm run init-db` from the backend folder

2. **If PostgreSQL is already installed:**
   - Update `backend\.env` with your password
   - Run `npm run init-db` from the backend folder
   - Start the application with `.\start.bat`

3. **Access the application:**
   - Open http://localhost:3000
   - Start managing your payroll!

## 📚 Additional Resources

- Full README: `README.md`
- Detailed Setup: `SETUP_GUIDE.md`
- Backend API docs in `README.md`

## 🆘 Need Help?

1. Check PostgreSQL is running
2. Verify database credentials
3. Ensure both servers are running
4. Check browser console for errors
5. Check terminal for error messages

---

**System Status:**
- ✅ Backend code: Complete
- ✅ Frontend code: Complete
- ✅ Database schema: Ready
- ✅ Dependencies: Installed
- ⏳ PostgreSQL: Needs to be installed and configured
- ⏳ Database: Needs to be initialized

**Once PostgreSQL is set up, you're ready to go!** 🚀
