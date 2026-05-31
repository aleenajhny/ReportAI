@echo off
setlocal

set "ROOT=%~dp0"
set "FRONTEND=%ROOT%frontend"

echo.
echo ReportAI local runner
echo =====================
echo.

if not exist "%FRONTEND%\package.json" (
  echo Could not find frontend package.json at:
  echo %FRONTEND%
  exit /b 1
)

where node.exe >nul 2>nul
if errorlevel 1 (
  echo Node.js was not found on PATH. Install Node.js 20+ and try again.
  exit /b 1
)

where npm.cmd >nul 2>nul
if errorlevel 1 (
  echo npm.cmd was not found on PATH. Install Node.js 20+ and try again.
  exit /b 1
)

cd /d "%FRONTEND%"

if not exist "node_modules" (
  echo Installing frontend dependencies...
  call npm.cmd install
  if errorlevel 1 exit /b 1
) else (
  echo Dependencies already installed.
)

echo.
echo.
echo Starting ReportAI at http://127.0.0.1:3000
echo Press Ctrl+C in this window to stop the server.
echo.

call npm.cmd run dev -- --hostname 127.0.0.1 --port 3000
