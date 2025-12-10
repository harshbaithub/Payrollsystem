@echo off
echo Starting Payroll System...
echo.

echo Starting Backend Server...
cd backend
start cmd /k "npm start"

timeout /t 3 /nobreak > nul

echo Starting Frontend...
cd ../frontend
start cmd /k "npm start"

echo.
echo Payroll system is starting...
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3000
echo.
echo Press any key to exit this window (servers will continue running)
pause > nul
