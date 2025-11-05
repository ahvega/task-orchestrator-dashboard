#!/usr/bin/env pwsh
# Docker Desktop Readiness Check
# Verifies that all prerequisites are met to run the dashboard in Docker

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Task Orchestrator Dashboard" -ForegroundColor Green
Write-Host "Docker Desktop Readiness Check" -ForegroundColor Green
Write-Host "========================================`n" -ForegroundColor Cyan

$allGood = $true

# Check 1: Docker is installed and running
Write-Host "[1/5] Checking Docker..." -ForegroundColor Cyan
try {
    $dockerVersion = docker --version 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  ✅ Docker installed: $dockerVersion" -ForegroundColor Green
        
        # Check if Docker daemon is running
        docker ps > $null 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host "  ✅ Docker daemon is running" -ForegroundColor Green
        } else {
            Write-Host "  ❌ Docker daemon is not running" -ForegroundColor Red
            Write-Host "     Please start Docker Desktop" -ForegroundColor Yellow
            $allGood = $false
        }
    } else {
        Write-Host "  ❌ Docker is not installed" -ForegroundColor Red
        Write-Host "     Install Docker Desktop from: https://www.docker.com/products/docker-desktop" -ForegroundColor Yellow
        $allGood = $false
    }
} catch {
    Write-Host "  ❌ Docker check failed: $_" -ForegroundColor Red
    $allGood = $false
}

# Check 2: Docker Compose is available
Write-Host "`n[2/5] Checking Docker Compose..." -ForegroundColor Cyan
try {
    $composeVersion = docker compose version 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  ✅ Docker Compose installed: $composeVersion" -ForegroundColor Green
    } else {
        Write-Host "  ❌ Docker Compose is not available" -ForegroundColor Red
        Write-Host "     Docker Compose should come with Docker Desktop" -ForegroundColor Yellow
        $allGood = $false
    }
} catch {
    Write-Host "  ❌ Docker Compose check failed: $_" -ForegroundColor Red
    $allGood = $false
}

# Check 3: mcp-task-data volume exists
Write-Host "`n[3/5] Checking mcp-task-data volume..." -ForegroundColor Cyan
try {
    $volumeCheck = docker volume inspect mcp-task-data 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  ✅ Volume 'mcp-task-data' exists" -ForegroundColor Green
        
        # Check if tasks.db exists in the volume
        $dbCheck = docker run --rm -v mcp-task-data:/data:ro busybox ls /data/tasks.db 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host "  ✅ tasks.db found in volume" -ForegroundColor Green
            
            # Get file size
            $fileInfo = docker run --rm -v mcp-task-data:/data:ro busybox ls -lh /data/tasks.db 2>&1 | Select-String "tasks.db"
            if ($fileInfo) {
                $size = ($fileInfo -split '\s+')[4]
                Write-Host "     Database size: $size" -ForegroundColor Gray
            }
        } else {
            Write-Host "  ⚠️  tasks.db not found in volume" -ForegroundColor Yellow
            Write-Host "     You may need to copy the database file" -ForegroundColor Yellow
            Write-Host "     See DOCKER_SETUP.md for instructions" -ForegroundColor Yellow
        }
    } else {
        Write-Host "  ⚠️  Volume 'mcp-task-data' not found" -ForegroundColor Yellow
        Write-Host "     The volume will be created automatically or you can create it:" -ForegroundColor Yellow
        Write-Host "     docker volume create mcp-task-data" -ForegroundColor Gray
    }
} catch {
    Write-Host "  ❌ Volume check failed: $_" -ForegroundColor Red
}

# Check 4: Required files exist
Write-Host "`n[4/5] Checking required files..." -ForegroundColor Cyan
$requiredFiles = @(
    "Dockerfile",
    "docker-compose.yml",
    "server_v2.py",
    "requirements.txt",
    ".env.example"
)

$missingFiles = @()
foreach ($file in $requiredFiles) {
    if (Test-Path $file) {
        Write-Host "  ✅ $file" -ForegroundColor Green
    } else {
        Write-Host "  ❌ $file (missing)" -ForegroundColor Red
        $missingFiles += $file
        $allGood = $false
    }
}

if ($missingFiles.Count -gt 0) {
    Write-Host "`n  Missing files: $($missingFiles -join ', ')" -ForegroundColor Red
}

# Check 5: Port availability
Write-Host "`n[5/5] Checking port 8888 availability..." -ForegroundColor Cyan
$portInUse = Get-NetTCPConnection -LocalPort 8888 -ErrorAction SilentlyContinue
if ($portInUse) {
    $processId = $portInUse.OwningProcess
    $process = Get-Process -Id $processId -ErrorAction SilentlyContinue
    Write-Host "  ⚠️  Port 8888 is in use by process: $($process.ProcessName) (PID: $processId)" -ForegroundColor Yellow
    Write-Host "     You can use a different port: .\docker-up.ps1 -Port 8890" -ForegroundColor Yellow
} else {
    Write-Host "  ✅ Port 8888 is available" -ForegroundColor Green
}

# Summary
Write-Host "`n========================================" -ForegroundColor Cyan
if ($allGood) {
    Write-Host "✅ ALL CHECKS PASSED!" -ForegroundColor Green
    Write-Host "`nYou're ready to run the dashboard in Docker!" -ForegroundColor Green
    Write-Host "`nNext steps:" -ForegroundColor Cyan
    Write-Host "  1. Start the dashboard:" -ForegroundColor White
    Write-Host "     .\docker-up.ps1" -ForegroundColor Gray
    Write-Host "`n  2. Open in browser:" -ForegroundColor White
    Write-Host "     http://localhost:8888" -ForegroundColor Gray
    Write-Host "`n  3. View API docs:" -ForegroundColor White
    Write-Host "     http://localhost:8888/docs" -ForegroundColor Gray
    Write-Host "`nFor detailed instructions, see: DOCKER_SETUP.md" -ForegroundColor Yellow
} else {
    Write-Host "❌ SOME CHECKS FAILED" -ForegroundColor Red
    Write-Host "`nPlease fix the issues above before running the dashboard." -ForegroundColor Yellow
    Write-Host "See DOCKER_SETUP.md for detailed troubleshooting." -ForegroundColor Yellow
}
Write-Host "========================================`n" -ForegroundColor Cyan
