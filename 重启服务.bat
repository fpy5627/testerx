@echo off

echo ============================================
echo  Killing existing Node.js processes...
echo ============================================
taskkill /IM node.exe /F >nul 2>&1
echo Done.
echo.

echo ============================================
echo  Starting development server (pnpm dev)...
echo ============================================
pnpm dev

echo.
echo ============================================
echo  Server started. Press Ctrl + C to stop.
echo ============================================
pause
