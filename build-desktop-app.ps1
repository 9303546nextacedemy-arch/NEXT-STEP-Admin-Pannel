
# NEXTSTEP Admin Panel - Desktop EXE Builder (PowerShell)
$ErrorActionPreference = "Stop"
$ProjectDir = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  NEXTSTEP Admin Panel - EXE Builder" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Set-Location $ProjectDir

# Step 0: Kill old processes
Write-Host "[0/4] Purana build clean kar rahe hain..." -ForegroundColor Yellow
Get-Process -Name "NEXTSTEP Admin" -ErrorAction SilentlyContinue | Stop-Process -Force
Get-Process -Name "electron" -ErrorAction SilentlyContinue | Stop-Process -Force
if (Test-Path "build-desktop") {
    Remove-Item -Recurse -Force "build-desktop"
    Write-Host "  Old build-desktop cleaned." -ForegroundColor Green
}

# Step 1: Vite Build
Write-Host ""
Write-Host "[1/4] Vite build ho raha hai..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Vite build fail hua!" -ForegroundColor Red
    exit 1
}
Write-Host "  Vite build complete!" -ForegroundColor Green

# Step 2: Electron dependencies
Write-Host ""
Write-Host "[2/4] Electron dependencies install ho rahi hain..." -ForegroundColor Yellow
Set-Location "$ProjectDir\electron"
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: npm install fail hua!" -ForegroundColor Red
    exit 1
}
Set-Location $ProjectDir
Write-Host "  Electron deps installed!" -ForegroundColor Green

# Step 3: Build EXE
Write-Host ""
Write-Host "[3/4] Windows .exe build ho raha hai..." -ForegroundColor Yellow
& ".\electron\node_modules\.bin\electron-builder.cmd" build --win --config electron\electron-builder.json --projectDir .
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Electron build fail hua!" -ForegroundColor Red
    exit 1
}

# Step 4: Done
Write-Host ""
Write-Host "[4/4] Build complete!" -ForegroundColor Green
Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host " .exe file yahan milega:" -ForegroundColor Cyan
Write-Host " build-desktop\NEXTSTEP Admin Setup.exe" -ForegroundColor White
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Client ko ye file dein!" -ForegroundColor Green

