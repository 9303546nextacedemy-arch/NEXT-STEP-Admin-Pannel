@echo off
echo ========================================
echo   NEXTSTEP Admin Panel - EXE Builder
echo ========================================
echo.

echo [0/4] Pehle purana build clean kar rahe hain...
taskkill /F /IM "NEXTSTEP Admin.exe" /T >nul 2>&1
taskkill /F /IM "electron.exe" /T >nul 2>&1
if exist build-desktop rmdir /s /q build-desktop
echo Cleaned.

echo.
echo [1/4] Vite build ho raha hai...
call npm run build
if errorlevel 1 (
  echo ERROR: Vite build fail ho gaya!
  pause
  exit /b 1
)

echo.
echo [2/4] Electron dependencies install ho rahi hain...
cd electron
call npm install
cd ..
if errorlevel 1 (
  echo ERROR: npm install fail hua!
  pause
  exit /b 1
)

echo.
echo [3/4] Windows .exe build ho raha hai...
call electron\node_modules\.bin\electron-builder build --win --config electron\electron-builder.json --projectDir .
if errorlevel 1 (
  echo ERROR: Electron build fail hua!
  pause
  exit /b 1
)

echo.
echo [4/4] Build complete!
echo.
echo ============================================
echo  .exe file yahan milega:
echo  build-desktop\NEXTSTEP Admin Setup.exe
echo ============================================
echo.
echo Client ko ye file dein - install karke use kar sakte hain!
echo.
pause
