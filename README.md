# Payroll Management System

A comprehensive payroll management system built with React, Node.js/Express, and PostgreSQL.

## Features

- **Employee Management**: Add, edit, and manage employee records
- **Attendance Tracking**: Mark daily attendance with overtime tracking
- **Salary Adjustments**: Add bonuses and deductions
- **Payroll Processing**: Automatic monthly payroll generation with tax calculations
- **Dashboard**: Overview of key metrics and statistics
- **Reports**: Detailed payroll summaries and reports

## Tech Stack

- **Frontend**: React 18, React Router, Axios
- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL
- **Styling**: Custom CSS

## Prerequisites

Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v14 or higher)
- [PostgreSQL](https://www.postgresql.org/download/) (v12 or higher)
- npm (comes with Node.js)

## Installation & Setup

### 1. Clone or navigate to the project directory

```bash
cd d:\payrollsystem
```

### 2. Configure PostgreSQL

Make sure PostgreSQL is installed and running on your system.

Update the database credentials in `backend\.env` if needed:
```
DB_USER=postgres
DB_PASSWORD=postgres
DB_HOST=localhost
DB_PORT=5432
DB_NAME=payroll_db
```

### 3. Install Backend Dependencies

```bash
cd backend
npm install
```

### 4. Initialize Database

This will create the database, tables, and insert sample data:

```bash
npm run init-db
```

### 5. Install Frontend Dependencies

```bash
cd ../frontend
npm install
```

## Running the Application

### Start the Backend Server

Open a terminal in the backend directory:

```bash
cd backend
npm start
```

The backend API will run on `http://localhost:5000`

### Start the Frontend

Open another terminal in the frontend directory:

```bash
cd frontend
npm start
```

The React app will open automatically at `http://localhost:3000`

## Usage Guide

### 1. Dashboard
- View system statistics
- Quick access to main features

### 2. Employee Management
- Add new employees with details (ID, name, position, salary, etc.)
- Edit existing employee information
- Delete employees (cascades to all related records)

### 3. Attendance Tracking
- Mark daily attendance for employees
- Record work hours and overtime
- Different status options: Present, Absent, Half-Day, Leave

### 4. Salary Adjustments
- Add deductions (tax, insurance, etc.)
- Add bonuses (performance, festival, etc.)
- View all adjustments by employee

### 5. Payroll Processing
- Select month and year
- Click "Generate Payroll" to automatically calculate:
  - Basic salary
  - Overtime pay (1.5x rate)
  - Bonuses
  - Deductions
  - Tax (15%)
  - Net salary
- Approve pending payroll
- Mark approved payroll as paid

## Database Schema

### Tables

1. **employees**: Employee information
2. **attendance**: Daily attendance records
3. **deductions**: Salary deductions
4. **bonuses**: Salary bonuses
5. **payroll**: Monthly payroll records

## API Endpoints

### Employees
- `GET /api/employees` - Get all employees
- `GET /api/employees/:id` - Get employee by ID
- `POST /api/employees` - Create new employee
- `PUT /api/employees/:id` - Update employee
- `DELETE /api/employees/:id` - Delete employee

### Attendance
- `GET /api/attendance` - Get attendance records
- `POST /api/attendance` - Mark attendance
- `PUT /api/attendance/:id` - Update attendance
- `DELETE /api/attendance/:id` - Delete attendance

### Payroll
- `GET /api/payroll` - Get payroll records
- `POST /api/payroll/generate` - Generate monthly payroll
- `PUT /api/payroll/:id/status` - Update payroll status
- `GET /api/payroll/summary` - Get payroll summary

### Deductions & Bonuses
- `GET /api/deductions` - Get all deductions
- `POST /api/deductions` - Add deduction
- `GET /api/bonuses` - Get all bonuses
- `POST /api/bonuses` - Add bonus

## Default Sample Data

The system comes with 4 sample employees:
- John Doe (EMP001) - Software Engineer
- Jane Smith (EMP002) - Senior Developer
- Mike Johnson (EMP003) - HR Manager
- Sarah Williams (EMP004) - Accountant

## Troubleshooting

### Database Connection Issues
- Ensure PostgreSQL is running
- Verify credentials in `.env` file
- Check if database exists: `npm run init-db`

### Port Already in Use
- Backend: Change `PORT` in `backend\.env`
- Frontend: It will prompt to use different port automatically

### CORS Issues
- Backend has CORS enabled for all origins
- Ensure backend is running before frontend

## Project Structure

```
payrollsystem/
├── backend/
│   ├── config/
│   │   └── database.js
│   ├── routes/
│   │   ├── employees.js
│   │   ├── attendance.js
│   │   ├── payroll.js
│   │   ├── deductions.js
│   │   └── bonuses.js
│   ├── scripts/
│   │   └── initDatabase.js
│   ├── .env
│   ├── server.js
│   └── package.json
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── Dashboard.js
│   │   │   ├── Employees.js
│   │   │   ├── Attendance.js
│   │   │   ├── Payroll.js
│   │   │   └── Adjustments.js
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.js
│   │   ├── App.css
│   │   └── index.js
│   └── package.json
└── README.md
```

## Development

### Adding New Features
1. Add database schema in `initDatabase.js`
2. Create API routes in `backend/routes/`
3. Add API functions in `frontend/src/services/api.js`
4. Create React components in `frontend/src/components/`

### Modifying Tax Calculation
Edit the tax calculation in `backend/routes/payroll.js`:
```javascript
const tax = grossSalary * 0.15; // Change 0.15 to your tax rate
```

## License

This project is open source and available for educational purposes.

## Support

For issues or questions, please check the code comments or refer to the documentation.
