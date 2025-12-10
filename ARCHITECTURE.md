# Payroll System Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         USER (Browser)                               │
│                     http://localhost:3000                            │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             │ HTTP Requests
                             │
┌────────────────────────────▼────────────────────────────────────────┐
│                    REACT FRONTEND                                    │
│                                                                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐             │
│  │  Dashboard   │  │  Employees   │  │  Attendance  │             │
│  └──────────────┘  └──────────────┘  └──────────────┘             │
│                                                                      │
│  ┌──────────────┐  ┌──────────────┐                                │
│  │ Adjustments  │  │   Payroll    │                                │
│  └──────────────┘  └──────────────┘                                │
│                                                                      │
│  ┌─────────────────────────────────────────────┐                   │
│  │         API Service (Axios)                  │                   │
│  │  - employeeAPI                               │                   │
│  │  - attendanceAPI                             │                   │
│  │  - payrollAPI                                │                   │
│  │  - deductionAPI                              │                   │
│  │  - bonusAPI                                  │                   │
│  └─────────────────────────────────────────────┘                   │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             │ REST API Calls
                             │
┌────────────────────────────▼────────────────────────────────────────┐
│                   EXPRESS BACKEND                                    │
│                  http://localhost:5000                               │
│                                                                      │
│  ┌─────────────────────────────────────────────┐                   │
│  │              server.js                       │                   │
│  │  - CORS enabled                              │                   │
│  │  - Body parser                               │                   │
│  │  - Route handlers                            │                   │
│  └─────────────────────────────────────────────┘                   │
│                                                                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐             │
│  │  /employees  │  │ /attendance  │  │  /payroll    │             │
│  └──────────────┘  └──────────────┘  └──────────────┘             │
│                                                                      │
│  ┌──────────────┐  ┌──────────────┐                                │
│  │ /deductions  │  │   /bonuses   │                                │
│  └──────────────┘  └──────────────┘                                │
│                                                                      │
│  ┌─────────────────────────────────────────────┐                   │
│  │       Database Connection (pg)               │                   │
│  │  - Connection pooling                        │                   │
│  │  - Error handling                            │                   │
│  └─────────────────────────────────────────────┘                   │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             │ SQL Queries
                             │
┌────────────────────────────▼────────────────────────────────────────┐
│                      POSTGRESQL DATABASE                             │
│                      localhost:5432                                  │
│                      Database: payroll_db                            │
│                                                                      │
│  ┌──────────────────────────────────────────────────────┐          │
│  │  employees                                            │          │
│  │  - id, employee_id, name, email, position, salary... │          │
│  └──────────────────────────────────────────────────────┘          │
│                                                                      │
│  ┌──────────────────────────────────────────────────────┐          │
│  │  attendance                                           │          │
│  │  - id, employee_id, date, status, hours_worked...    │          │
│  └──────────────────────────────────────────────────────┘          │
│                                                                      │
│  ┌──────────────────────────────────────────────────────┐          │
│  │  deductions                                           │          │
│  │  - id, employee_id, type, amount, date...            │          │
│  └──────────────────────────────────────────────────────┘          │
│                                                                      │
│  ┌──────────────────────────────────────────────────────┐          │
│  │  bonuses                                              │          │
│  │  - id, employee_id, type, amount, date...            │          │
│  └──────────────────────────────────────────────────────┘          │
│                                                                      │
│  ┌──────────────────────────────────────────────────────┐          │
│  │  payroll                                              │          │
│  │  - id, employee_id, month, year, gross, net...       │          │
│  └──────────────────────────────────────────────────────┘          │
└─────────────────────────────────────────────────────────────────────┘
```

## Data Flow Examples

### 1. Add New Employee

```
User Input (Frontend)
    ↓
Form Data → POST /api/employees
    ↓
Express Route Handler (routes/employees.js)
    ↓
SQL INSERT → PostgreSQL (employees table)
    ↓
Response ← Employee Record
    ↓
UI Update (Employee List Refreshed)
```

### 2. Generate Payroll

```
User Clicks "Generate Payroll"
    ↓
POST /api/payroll/generate { month, year }
    ↓
Backend Process:
  1. Fetch all active employees
  2. Calculate attendance hours
  3. Sum bonuses for the month
  4. Sum deductions for the month
  5. Calculate overtime (1.5x rate)
  6. Calculate tax (15%)
  7. Compute net salary
    ↓
Insert/Update payroll records
    ↓
Return payroll records
    ↓
Display in UI with statistics
```

### 3. Mark Attendance

```
Select Employee & Date
    ↓
Enter Hours & Status
    ↓
POST /api/attendance
    ↓
INSERT or UPDATE (unique constraint: employee_id + date)
    ↓
Attendance record saved
    ↓
Table refreshed with new record
```

## Technology Stack Details

### Frontend
- **React 18**: Component-based UI
- **React Router DOM 6**: Client-side routing
- **Axios**: HTTP client for API calls
- **CSS**: Custom styling with gradients

### Backend
- **Node.js**: JavaScript runtime
- **Express 4**: Web framework
- **pg (node-postgres)**: PostgreSQL client
- **dotenv**: Environment variables
- **cors**: Cross-origin resource sharing
- **body-parser**: Request body parsing

### Database
- **PostgreSQL 12+**: Relational database
- **Connection Pooling**: Efficient connections
- **Foreign Keys**: Data integrity
- **Constraints**: Unique combinations

## Security Features

1. **Environment Variables**: Sensitive data in .env
2. **SQL Parameterization**: Prevents SQL injection
3. **CORS**: Controlled cross-origin access
4. **Error Handling**: Graceful error responses

## Scalability Considerations

1. **Connection Pooling**: Reuses database connections
2. **Async/Await**: Non-blocking operations
3. **Modular Routes**: Easy to extend
4. **Component Architecture**: Reusable UI components

## API Design

### RESTful Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | /api/employees | List all employees |
| GET | /api/employees/:id | Get one employee |
| POST | /api/employees | Create employee |
| PUT | /api/employees/:id | Update employee |
| DELETE | /api/employees/:id | Delete employee |
| GET | /api/attendance | List attendance |
| POST | /api/attendance | Mark attendance |
| GET | /api/payroll | List payroll |
| POST | /api/payroll/generate | Generate payroll |
| PUT | /api/payroll/:id/status | Update status |

### Response Format

Success:
```json
{
  "id": 1,
  "employee_id": "EMP001",
  "first_name": "John",
  "last_name": "Doe",
  ...
}
```

Error:
```json
{
  "error": "Error message description"
}
```

## Database Relationships

```
employees (1) ←──→ (M) attendance
employees (1) ←──→ (M) deductions
employees (1) ←──→ (M) bonuses
employees (1) ←──→ (M) payroll
```

- One employee can have many attendance records
- One employee can have many deductions
- One employee can have many bonuses
- One employee can have many payroll records

## Payroll Calculation Logic

```javascript
// For each employee:
hourlyRate = basicSalary / 160  // 160 hours/month

overtimePay = overtimeHours × hourlyRate × 1.5

grossSalary = basicSalary + overtimePay + bonuses

tax = grossSalary × 0.15  // 15% tax rate

netSalary = grossSalary - tax - deductions
```

## File Organization

```
Routes
  ├── employees.js    → Employee CRUD operations
  ├── attendance.js   → Attendance tracking
  ├── payroll.js      → Payroll generation & management
  ├── deductions.js   → Deduction management
  └── bonuses.js      → Bonus management

Components
  ├── Dashboard.js    → Overview & statistics
  ├── Employees.js    → Employee management UI
  ├── Attendance.js   → Attendance tracking UI
  ├── Payroll.js      → Payroll processing UI
  └── Adjustments.js  → Deductions & bonuses UI
```

## Development Workflow

1. **Modify Backend**:
   - Edit routes in `backend/routes/`
   - Update database queries
   - Test with Postman or browser

2. **Modify Frontend**:
   - Edit components in `frontend/src/components/`
   - Update API calls in `frontend/src/services/api.js`
   - See changes hot-reload in browser

3. **Modify Database**:
   - Edit schema in `backend/scripts/initDatabase.js`
   - Drop and recreate database
   - Or use migrations for production

## Performance Optimization

1. **Database Indexing**: On employee_id, date fields
2. **Connection Pooling**: Reuse connections
3. **Async Operations**: Non-blocking I/O
4. **React Memoization**: Prevent unnecessary re-renders

## Future Enhancements

- [ ] User authentication & authorization
- [ ] Role-based access control
- [ ] Email notifications for payslips
- [ ] PDF payslip generation
- [ ] Advanced reporting & analytics
- [ ] Leave management system
- [ ] Multi-currency support
- [ ] Audit logs
- [ ] Backup & restore functionality
- [ ] Mobile responsive design improvements
