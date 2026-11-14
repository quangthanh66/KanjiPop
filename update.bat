@echo off
chcp 65001 >nul
echo ========================================================
echo   Kanjidle - Tu Dong Cap Nhat & Khoi Dong Tro Choi
echo ========================================================
echo.
echo Dang lay du lieu moi nhat tu GitHub (git pull)...
git pull origin main
echo.
echo Da cap nhat thanh cong!
echo Dang mo trinh duyet tai: http://localhost:8765
start http://localhost:8765
echo.
echo Khoi dong may chu Node.js (Nhan Ctrl + C de tat may chu)...
cd work\kanji-pop-site
node server.js
pause
