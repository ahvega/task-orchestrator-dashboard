Write-Host "[dashboard] Stopping containers..." -ForegroundColor Yellow
docker compose down
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
Write-Host "[dashboard] Stopped." -ForegroundColor Green

