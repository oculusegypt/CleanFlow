@echo off
title CleanFlow Services Hostinger Builder ^& Server Launcher
echo ===================================================
echo   CleanFlow Services - Hostinger Build ^& Local Server
echo ===================================================
echo.
cd /d "%~dp0"

echo [1/3] Building Hostinger production package (cleanflow-services-hostinger.zip)...
node scripts/build-hostinger.mjs

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERROR] Build failed! Check the output above.
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo [2/3] Starting local full-stack server on http://localhost:5000...
set PORT=5000
set BASE_PATH=/
set NODE_ENV=production

start "" "http://localhost:5000"

echo [3/3] Server is running on http://localhost:5000 (Press Ctrl+C to stop)
node --enable-source-maps ./artifacts/api-server/dist/index.mjs
pause
