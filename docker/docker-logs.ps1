Write-Host "[dashboard] Tailing logs (Ctrl+C to exit)..." -ForegroundColor Cyan
docker compose -p task-dashboard logs -f dashboard

