@echo off
echo ==========================================
echo Starting Interview of Destiny Servers...
echo ==========================================
echo.

start /b python -m http.server 8080
echo [1/2] Game Server started at http://localhost:8080/

cd server
start /b node index.js
echo [2/2] AI Chat Backend started at http://localhost:3000/
echo.

echo All systems active! Happy Hackathon! 🚀
echo (Keep this window open to keep the servers running.)
pause
