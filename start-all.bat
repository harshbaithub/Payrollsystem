@echo off
echo ====================================================================
echo         PAYROLL SYSTEM - All Services Startup
echo ====================================================================
echo.

echo [1/3] Starting Backend API Server (Port 5000)...
cd backend
start "Backend API" cmd /k "npm start"
timeout /t 3 /nobreak > nul

echo [2/3] Starting Manager Dashboard (Port 3000)...
cd ../frontend
start "Manager Dashboard" cmd /k "npm start"
timeout /t 3 /nobreak > nul

echo [3/3] Starting Employee Portal (Port 4000)...
cd ../employee-portal
start "Employee Portal" cmd /k "set PORT=4000 && npm start"

echo.
echo ====================================================================
echo                All Services are Starting...
echo ====================================================================
echo.
echo Backend API:        http://localhost:5000
echo Manager Dashboard:  http://localhost:3000
echo Employee Portal:    http://localhost:4000
echo.
echo Manager Login:   Username: admin  / Password: admin123
echo Employee Login:  ID: EMP001 / Email: john.doe@company.com / Password: password123
echo.
echo Press any key to close this window (servers will continue running)
echo ====================================================================
pause > nul
