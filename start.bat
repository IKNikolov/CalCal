@echo off
echo Starting Calorie Calculator...
echo.
echo [1/2] Starting Backend Server...
start "Backend Server" cmd /k "cd backend && npm run dev"
timeout /t 3 /nobreak > nul

echo [2/2] Starting Frontend...
start "Frontend Dev Server" cmd /k "npm run dev"

echo.
echo ✅ Both servers are starting!
echo.
echo Backend: http://localhost:3000
echo Frontend: http://localhost:5173
echo.
echo Close this window when done.
pause
