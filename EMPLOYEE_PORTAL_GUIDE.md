# Employee Self-Service Portal - Setup Guide

## 🎯 New Features Added

### 1. **Employee Portal** (Port 4000)
- Employee login with ID + Email verification
- Personal dashboard
- Mark own attendance
- View salary slips
- View deductions & bonuses
- Update personal info & bank details
- Upload documents
- Logout functionality

### 2. **Manager Dashboard Updates** (Port 3000)
- View employee-submitted attendance
- Approve/reject attendance requests
- View uploaded documents from employees
- All amounts now in **Indian Rupees (₹)**

### 3. **Backend Enhancements**
- JWT authentication
- Role-based access control
- File upload support
- New database tables:
  - `attendance_requests` - Employee submitted attendance
  - `documents` - Employee uploaded documents
  - `salary_slips` - Generated salary slips

### 4. **Currency Changed to Rupees (₹)**
- All salary amounts displayed in ₹ (Rupees)
- Indian number formatting (e.g., ₹75,000)

## 📁 New Project Structure

```
payrollsystem/
├── backend/              (Port 5000 - API Server)
│   ├── middleware/
│   │   └── auth.js      (JWT authentication)
│   ├── routes/
│   │   ├── auth.js      (Login routes)
│   │   └── employeePortal.js (Employee routes)
│   └── uploads/         (Document storage)
│
├── frontend/            (Port 3000 - Manager Dashboard)
│   └── (Existing manager interface)
│
└── employee-portal/     (Port 4000 - Employee Portal) ✨ NEW
    ├── public/
    ├── src/
    │   ├── components/
    │   │   ├── Login.js
    │   │   ├── Dashboard.js
    │   │   ├── Attendance.js
    │   │   ├── SalarySlips.js
    │   │   ├── Profile.js
    │   │   └── Documents.js
    │   └── services/
    │       └── api.js
    └── package.json
```

## 🔐 Login Credentials

### Employee Login (Port 4000)
```
Employee ID: EMP001
Email: john.doe@company.com
Password: password123

Employee ID: EMP002
Email: jane.smith@company.com
Password: password123
```

### Manager Login (Port 3000)
```
Username: admin
Password: admin123
```

## 🚀 How to Run

### Step 1: Update Database
```powershell
cd backend
npm run init-db
```

### Step 2: Start Backend (API Server)
```powershell
cd backend
npm start
```
Runs on: http://localhost:5000

### Step 3: Start Manager Dashboard
```powershell
cd frontend
npm start
```
Runs on: http://localhost:3000

### Step 4: Install & Start Employee Portal
```powershell
cd employee-portal
npm install
npm start
```
Will prompt to run on: http://localhost:4000

## 💡 Usage Flow

### For Employees:
1. Login to Employee Portal (http://localhost:4000)
2. View Dashboard with salary info
3. Mark daily attendance
4. View salary slips
5. Update bank details
6. Upload documents (Aadhar, PAN, etc.)
7. View bonuses & deductions

### For Managers:
1. Login to Manager Dashboard (http://localhost:3000)
2. View all employees
3. Approve employee attendance
4. Generate payroll
5. View employee documents
6. Add bonuses/deductions

## 📊 New API Endpoints

### Authentication
- `POST /api/auth/employee/login` - Employee login
- `POST /api/auth/manager/login` - Manager login

### Employee Portal (Requires JWT Token)
- `GET /api/employee/profile` - Get employee profile
- `PUT /api/employee/profile` - Update profile
- `POST /api/employee/attendance` - Submit attendance
- `GET /api/employee/attendance` - Get my attendance
- `GET /api/employee/salary-slips` - Get salary slips
- `GET /api/employee/deductions` - Get deductions
- `GET /api/employee/bonuses` - Get bonuses
- `POST /api/employee/documents` - Upload document
- `GET /api/employee/documents` - Get my documents

## 🏦 Bank Details Fields
- Bank Name
- Account Number
- IFSC Code
- PAN Number
- Address

## 📄 Document Types Supported
- Aadhar Card
- PAN Card
- Bank Passbook
- Educational Certificates
- Experience Letters
- Photos (JPG, PNG)
- PDFs

## 🔒 Security Features
- JWT token-based authentication
- Password hashing (bcrypt)
- Role-based access control
- File upload validation
- Token expiry (24 hours)

## 💰 Salary Calculation (in Rupees)
```
Basic Salary: ₹75,000/month
Hourly Rate: ₹75,000 / 160 hours = ₹468.75/hour
Overtime: ₹468.75 × 1.5 = ₹703.13/hour
Gross Salary: Basic + Overtime + Bonuses
Tax: 15% of Gross
Net Salary: Gross - Tax - Deductions
```

## 🎨 Employee Portal Features

### Dashboard
- Monthly salary in ₹
- Attendance statistics
- Pending approvals
- Quick actions

### Attendance
- Mark today's attendance
- Select status (Present/Absent/Half-day/Leave)
- Enter work hours & overtime
- Add notes
- View history with approval status

### Salary Slips
- View all salary slips
- Download as PDF (future)
- See breakdown:
  - Basic Salary
  - Overtime Pay
  - Bonuses
  - Deductions
  - Tax
  - Net Salary

### Profile
- View personal info
- Update phone, address
- Update bank details
- Update PAN number

### Documents
- Upload documents
- Select document type
- View uploaded documents
- Delete documents

## 🔄 Attendance Approval Flow

1. **Employee submits** attendance → Status: Pending
2. **Manager views** in dashboard
3. **Manager approves** → Moves to main attendance table
4. **Used in payroll** calculation

## 📱 Responsive Design
- Mobile-friendly interface
- Professional UI with gradients
- Card-based layout
- Easy navigation

## ⚙️ Configuration

### Backend `.env`
```
PORT=5000
DB_USER=postgres
DB_HOST=localhost
DB_NAME=payroll_db
DB_PASSWORD=root123
DB_PORT=5432
JWT_SECRET=your_jwt_secret_key_change_this_in_production_2024
```

### Manager Dashboard (Port 3000)
- No configuration needed
- Proxy to backend automatically

### Employee Portal (Port 4000)
- Proxy to backend automatically
- Will prompt if port 3000 is taken

## 🎯 Next Steps

1. Run database init to create new tables
2. Install employee-portal dependencies
3. Start all three servers
4. Login as employee
5. Test features

## 📞 Default Passwords
All employees: `password123`
Manager: `admin123`

**Change these in production!**
