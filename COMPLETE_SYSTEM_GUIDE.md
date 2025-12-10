# 🎉 COMPLETE PAYROLL SYSTEM - NOW WITH EMPLOYEE PORTAL!

## ✅ What's New

### 1. **Employee Self-Service Portal** ✨
- Employees can login with their ID and email
- Mark their own attendance
- View salary slips
- Update personal info and bank details
- Upload documents
- See bonuses and deductions

### 2. **Currency Changed to Indian Rupees (₹)**
- All amounts now displayed in ₹
- Indian number formatting (e.g., ₹75,000)

### 3. **Authentication & Security**
- JWT token-based authentication
- Separate logins for employees and managers
- Role-based access control

## 🚀 Quick Start

### Run Everything at Once:
```powershell
.\start-all.bat
```

This starts:
1. Backend API (Port 5000)
2. Manager Dashboard (Port 3000)
3. Employee Portal (Port 4000)

## 🔐 Login Credentials

### Manager Dashboard (http://localhost:3000)
```
Username: admin
Password: admin123
```

### Employee Portal (http://localhost:4000)
```
Employee ID: EMP001
Email: john.doe@company.com
Password: password123

Also available: EMP002, EMP003, EMP004
(All use password: password123)
```

## 📊 System Overview

```
┌─────────────────────────────────────────┐
│   MANAGER DASHBOARD (Port 3000)         │
│   - Manage all employees                 │
│   - Approve attendance                   │
│   - Generate payroll                     │
│   - View all data                        │
└─────────────────────────────────────────┘
           ↓ API Calls ↓
┌─────────────────────────────────────────┐
│   BACKEND API (Port 5000)                │
│   - JWT Authentication                   │
│   - Database operations                  │
│   - File uploads                         │
└─────────────────────────────────────────┘
           ↓ API Calls ↓
┌─────────────────────────────────────────┐
│   EMPLOYEE PORTAL (Port 4000)            │
│   - Personal dashboard                   │
│   - Self-service features                │
│   - Document management                  │
└─────────────────────────────────────────┘
```

## 🎯 Employee Portal Features

### 📱 Dashboard
- View monthly salary in ₹
- Attendance statistics
- Pending approvals count
- Quick access buttons

### ⏰ Attendance
- Mark today's attendance
- Select status (Present/Absent/Half-day/Leave)
- Enter work hours and overtime
- View attendance history
- See approval status

### 💰 Salary Slips
- View all salary slips
- Detailed breakdown:
  - Basic Salary: ₹XX,XXX
  - Overtime Pay: ₹X,XXX
  - Bonuses: ₹X,XXX
  - Deductions: ₹X,XXX
  - Tax (15%): ₹X,XXX
  - Net Salary: ₹XX,XXX

### 👤 Profile
- View personal details
- Update phone number
- Update address
- Update bank details:
  - Bank Name
  - Account Number
  - IFSC Code
  - PAN Number

### 📄 Documents
- Upload documents (Aadhar, PAN, etc.)
- Supported formats: JPG, PNG, PDF, DOC, DOCX
- Maximum size: 5MB
- View uploaded documents
- Delete documents

## 🏦 Bank Details Included

Sample employees now have bank information:
- **EMP001**: HDFC Bank
- **EMP002**: ICICI Bank
- **EMP003**: SBI
- **EMP004**: Axis Bank

## 📋 Database Updates

### New Tables:
1. **attendance_requests** - Employee submitted attendance
2. **documents** - Employee uploaded documents
3. **salary_slips** - Generated salary slips tracking

### Updated Tables:
- **employees** - Now includes:
  - password (hashed)
  - bank_name
  - account_number
  - ifsc_code
  - pan_number
  - address

## 🔄 Attendance Workflow

### Old Way:
Manager marks attendance for employees

### New Way:
1. Employee submits attendance → Status: Pending
2. Manager reviews in dashboard
3. Manager approves → Moves to attendance table
4. Used in payroll calculation

## 💵 Salary Calculation (in ₹)

```
Basic Salary: ₹75,000/month
Hourly Rate: ₹75,000 / 160 hours = ₹468.75/hour
Overtime Rate: ₹468.75 × 1.5 = ₹703.13/hour

Gross Salary = Basic + Overtime + Bonuses
Tax = 15% of Gross
Net Salary = Gross - Tax - Deductions
```

## 🗂️ Project Structure

```
payrollsystem/
├── backend/                 (Port 5000)
│   ├── middleware/
│   │   └── auth.js         (JWT authentication)
│   ├── routes/
│   │   ├── auth.js         (Login routes)
│   │   └── employeePortal.js (Employee API)
│   ├── scripts/
│   │   └── migrate.js      (Database migration)
│   └── uploads/            (Document storage)
│
├── frontend/               (Port 3000)
│   └── (Manager Dashboard)
│
├── employee-portal/        (Port 4000) ✨ NEW
│   └── (Employee Portal)
│
├── start-all.bat          (Start everything)
└── EMPLOYEE_PORTAL_GUIDE.md (Detailed guide)
```

## 📖 API Endpoints

### Authentication
- `POST /api/auth/employee/login` - Employee login
- `POST /api/auth/manager/login` - Manager login

### Employee Portal (Requires Token)
- `GET /api/employee/profile` - Get profile
- `PUT /api/employee/profile` - Update profile
- `POST /api/employee/attendance` - Submit attendance
- `GET /api/employee/attendance` - Get my attendance
- `GET /api/employee/salary-slips` - Get salary slips
- `GET /api/employee/deductions` - Get deductions
- `GET /api/employee/bonuses` - Get bonuses
- `POST /api/employee/documents` - Upload document
- `GET /api/employee/documents` - Get documents

## 🛠️ Manual Setup (if start-all.bat doesn't work)

### Terminal 1: Backend
```powershell
cd backend
npm start
```

### Terminal 2: Manager Dashboard
```powershell
cd frontend
npm start
```

### Terminal 3: Employee Portal
```powershell
cd employee-portal
set PORT=4000
npm start
```

## 🎨 UI Improvements

### Manager Dashboard:
- ✅ Currency changed to ₹ (Rupees)
- ✅ Indian number formatting
- ✅ All salary displays updated

### Employee Portal:
- ✅ Modern login page
- ✅ Professional gradient design
- ✅ Card-based layout
- ✅ Responsive navigation
- ✅ Rupee symbol throughout

## 🔒 Security Features

- JWT token authentication (24-hour expiry)
- Password hashing with bcrypt
- Role-based access control
- Protected routes
- Secure file uploads
- Input validation

## 📝 Sample Data

All employees have:
- Default password: `password123`
- Bank details
- Salary in Rupees
- Active status

## 🚨 Important Notes

1. **Database Migration**: Run `node backend/scripts/migrate.js` if you have existing data
2. **Password**: All employees use `password123` for demo
3. **Ports**: Backend: 5000, Manager: 3000, Employee: 4000
4. **Currency**: All amounts now in ₹ (Indian Rupees)

## 🎯 Next Steps

1. Run `start-all.bat` to start all services
2. Open Manager Dashboard: http://localhost:3000
3. Open Employee Portal: http://localhost:4000
4. Login and explore!

## 📱 Access URLs

| Service | URL | Login |
|---------|-----|-------|
| **Manager Dashboard** | http://localhost:3000 | admin / admin123 |
| **Employee Portal** | http://localhost:4000 | EMP001 + email + password123 |
| **Backend API** | http://localhost:5000 | N/A (API only) |

## 🎉 Features Summary

### Manager Can:
- ✅ Manage employees
- ✅ View all attendance
- ✅ Approve attendance requests
- ✅ Generate payroll in ₹
- ✅ Add bonuses/deductions
- ✅ View employee documents
- ✅ See all reports

### Employee Can:
- ✅ Mark own attendance
- ✅ View salary slips in ₹
- ✅ Update personal info
- ✅ Update bank details
- ✅ Upload documents
- ✅ View bonuses/deductions
- ✅ See profile
- ✅ Logout securely

## 📚 Documentation Files

- `START_HERE.md` - Quick start guide
- `EMPLOYEE_PORTAL_GUIDE.md` - Employee portal details
- `README.md` - Complete documentation
- `SETUP_GUIDE.md` - Setup troubleshooting
- `ARCHITECTURE.md` - Technical architecture

---

**🎊 Your complete payroll system with employee self-service is ready!**

Run `start-all.bat` and start managing your payroll! 🚀
