#!/usr/bin/env pwsh
# Force Restart - Clears cache and restarts server

Write-Host "==================================================================" -ForegroundColor Cyan
Write-Host "Force Restart - Task Orchestrator Dashboard" -ForegroundColor Cyan
Write-Host "==================================================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Kill any running Python processes
Write-Host "1. Stopping any running Python processes..." -ForegroundColor Yellow
Get-Process python -ErrorAction SilentlyContinue | Stop-Process -Force
Start-Sleep -Seconds 1
Write-Host "   ✓ Python processes stopped" -ForegroundColor Green
Write-Host ""

# Step 2: Clear Python cache
Write-Host "2. Clearing Python cache..." -ForegroundColor Yellow
if (Test-Path "__pycache__") {
    Remove-Item -Recurse -Force "__pycache__"
    Write-Host "   ✓ Removed __pycache__" -ForegroundColor Green
}
if (Test-Path "services/__pycache__") {
    Remove-Item -Recurse -Force "services/__pycache__"
    Write-Host "   ✓ Removed services/__pycache__" -ForegroundColor Green
}
Get-ChildItem -Recurse -Filter "*.pyc" | Remove-Item -Force
Write-Host "   ✓ Python cache cleared" -ForegroundColor Green
Write-Host ""

# Step 3: Check virtual environment
Write-Host "3. Checking virtual environment..." -ForegroundColor Yellow
if (-not (Test-Path ".\venv\Scripts\Activate.ps1")) {
    Write-Host "   ❌ Virtual environment not found!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please create it first:" -ForegroundColor Yellow
    Write-Host "  python -m venv venv" -ForegroundColor Gray
    Write-Host "  .\venv\Scripts\Activate.ps1" -ForegroundColor Gray
    Write-Host "  pip install -r requirements.txt" -ForegroundColor Gray
    exit 1
}
Write-Host "   ✓ Virtual environment found" -ForegroundColor Green
Write-Host ""

# Step 4: Activate venv
Write-Host "4. Activating virtual environment..." -ForegroundColor Yellow
& ".\venv\Scripts\Activate.ps1"
Write-Host "   ✓ Virtual environment activated" -ForegroundColor Green
Write-Host ""

# Step 5: Verify server file has new endpoints
Write-Host "5. Verifying server file updates..." -ForegroundColor Yellow
$hasEndpoint = Select-String -Path "server_v2.py" -Pattern "api/projects/summary" -SimpleMatch
if ($hasEndpoint) {
    Write-Host "   ✓ New endpoints found in server_v2.py" -ForegroundColor Green
} else {
    Write-Host "   ❌ New endpoints NOT found!" -ForegroundColor Red
    Write-Host "   The server file may not have been saved correctly." -ForegroundColor Yellow
    exit 1
}
Write-Host ""

# Step 6: Start server
Write-Host "6. Starting server..." -ForegroundColor Green
Write-Host ""
Write-Host "Server will start on:" -ForegroundColor Cyan
Write-Host "  🌐 Dashboard: http://localhost:8888" -ForegroundColor White
Write-Host "  📖 API Docs:  http://localhost:8888/docs" -ForegroundColor White
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Gray
Write-Host "==================================================================" -ForegroundColor Cyan
Write-Host ""

python server_v2.py
