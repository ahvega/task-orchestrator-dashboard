param(
  [int]$Port = 8888,
  [string]$Volume = 'mcp-task-data'
)

Write-Host "[dashboard] Checking Docker..." -ForegroundColor Cyan
if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
  Write-Error "Docker is not installed or not in PATH"
  exit 1
}

# Warn if volume is missing
Write-Host "[dashboard] Checking volume '$Volume'..." -ForegroundColor Cyan
docker volume inspect $Volume *> $null
if ($LASTEXITCODE -ne 0) {
  Write-Warning "Docker volume '$Volume' not found. Ensure MCP server created it."
}

$env:DASHBOARD_PORT = "$Port"
Write-Host "[dashboard] Starting on port $Port..." -ForegroundColor Green
docker compose up --build -d
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host "[dashboard] Running at http://localhost:$Port" -ForegroundColor Green

