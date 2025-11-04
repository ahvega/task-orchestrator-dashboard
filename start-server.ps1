# Task Orchestrator Dashboard v2.0 - Startup Script
# This script starts the Phase 1 enhanced dashboard server

Write-Host "=" -NoNewline -ForegroundColor Cyan
Write-Host "=" * 59 -ForegroundColor Cyan
Write-Host "🚀 Task Orchestrator Dashboard v2.0 - Phase 1" -ForegroundColor Green
Write-Host "=" * 60 -ForegroundColor Cyan
Write-Host ""

# Check if virtual environment exists
if (-not (Test-Path "venv\Scripts\python.exe")) {
    Write-Host "❌ Virtual environment not found!" -ForegroundColor Red
    Write-Host "   Please run: python -m venv venv" -ForegroundColor Yellow
    Write-Host "   Then install dependencies: pip install -r requirements.txt" -ForegroundColor Yellow
    exit 1
}

# Activate virtual environment
Write-Host "📦 Activating virtual environment..." -ForegroundColor Cyan
& "venv\Scripts\Activate.ps1"

# Check if dependencies are installed
Write-Host "🔍 Checking dependencies..." -ForegroundColor Cyan
$packages = @("fastapi", "uvicorn", "pydantic", "docker", "websockets")
$missing = @()

foreach ($pkg in $packages) {
    $check = & "venv\Scripts\python.exe" -c "import $pkg" 2>&1
    if ($LASTEXITCODE -ne 0) {
        $missing += $pkg
    }
}

if ($missing.Count -gt 0) {
    Write-Host "❌ Missing dependencies: $($missing -join ', ')" -ForegroundColor Red
    Write-Host "   Installing dependencies..." -ForegroundColor Yellow
    & "venv\Scripts\pip.exe" install -r requirements.txt
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to install dependencies!" -ForegroundColor Red
        exit 1
    }
}

Write-Host "✅ Dependencies OK" -ForegroundColor Green
Write-Host ""

# Check database
Write-Host "🗄️  Checking database..." -ForegroundColor Cyan
if (Test-Path "data\tasks.db") {
    $dbSize = (Get-Item "data\tasks.db").Length / 1KB
    Write-Host "✅ Database found (size: $([math]::Round($dbSize, 2)) KB)" -ForegroundColor Green
} else {
    Write-Host "⚠️  Database not found at data\tasks.db" -ForegroundColor Yellow
    Write-Host "   Server will attempt Docker volume detection" -ForegroundColor Yellow
}

Write-Host ""

# Configuration options
Write-Host "⚙️  Configuration:" -ForegroundColor Cyan
Write-Host "   Docker Detection: Enabled" -ForegroundColor White
Write-Host "   WebSocket: Enabled" -ForegroundColor White
Write-Host "   Port: 8888" -ForegroundColor White
Write-Host ""

Write-Host "📝 To customize, set environment variables:" -ForegroundColor Yellow
Write-Host "   `$env:TASK_ORCHESTRATOR_DB = 'path\to\tasks.db'" -ForegroundColor Gray
Write-Host "   `$env:ENABLE_DOCKER_DETECTION = 'false'" -ForegroundColor Gray
Write-Host "   `$env:ENABLE_WEBSOCKET = 'false'" -ForegroundColor Gray
Write-Host ""

# Start server
Write-Host "🚀 Starting server..." -ForegroundColor Green
Write-Host "=" * 60 -ForegroundColor Cyan
Write-Host ""

& "venv\Scripts\python.exe" server_v2.py

# Cleanup message
Write-Host ""
Write-Host "=" * 60 -ForegroundColor Cyan
Write-Host "👋 Server stopped" -ForegroundColor Yellow
Write-Host "=" * 60 -ForegroundColor Cyan

