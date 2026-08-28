<#
.SYNOPSIS
    Starts all StoryBook ecosystem services concurrently and checks health.
#>

$root = "c:\Users\marks\antigravity"
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host " Starting StoryBook Services Ecosystem..." -ForegroundColor Cyan
Write-Host " Root Directory: $root" -ForegroundColor Gray
Write-Host "=========================================" -ForegroundColor Cyan

function Is-PortInUse($port) {
    $conn = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue
    return ($null -ne $conn)
}

# 1. sb-api (Port 8000)
if (-not (Is-PortInUse 8000)) {
    Write-Host "[1/4] Starting sb-api (Port 8000)..." -ForegroundColor Yellow
    $apiVenv = Join-Path $root "sb-api\.venv\Scripts\python.exe"
    $apiDir = Join-Path $root "sb-api"
    Start-Process -FilePath $apiVenv -ArgumentList "-m uvicorn main:app --host 0.0.0.0 --port 8000 --reload" -WorkingDirectory $apiDir -WindowStyle Hidden
} else {
    Write-Host "[1/4] sb-api already running on port 8000." -ForegroundColor Green
}

# 2. sb-api-ai (Port 8002)
if (-not (Is-PortInUse 8002)) {
    Write-Host "[2/4] Starting sb-api-ai (Port 8002)..." -ForegroundColor Yellow
    $aiVenv = Join-Path $root "sb-api-ai\.venv\Scripts\python.exe"
    $aiDir = Join-Path $root "sb-api-ai"
    Start-Process -FilePath $aiVenv -ArgumentList "-m uvicorn main:app --host 0.0.0.0 --port 8002 --reload" -WorkingDirectory $aiDir -WindowStyle Hidden
} else {
    Write-Host "[2/4] sb-api-ai already running on port 8002." -ForegroundColor Green
}

# 3. sb-api-media (Port 8003)
if (-not (Is-PortInUse 8003)) {
    Write-Host "[3/4] Starting sb-api-media (Port 8003)..." -ForegroundColor Yellow
    $mediaVenv = Join-Path $root "sb-api-media\.venv\Scripts\python.exe"
    $mediaDir = Join-Path $root "sb-api-media"
    Start-Process -FilePath $mediaVenv -ArgumentList "-m uvicorn main:app --host 0.0.0.0 --port 8003 --reload" -WorkingDirectory $mediaDir -WindowStyle Hidden
} else {
    Write-Host "[3/4] sb-api-media already running on port 8003." -ForegroundColor Green
}

# 4. sb100 (Port 3000)
if (-not (Is-PortInUse 3000)) {
    Write-Host "[4/4] Starting sb100 frontend (Port 3000)..." -ForegroundColor Yellow
    $feDir = Join-Path $root "sb100"
    Start-Process -FilePath "cmd.exe" -ArgumentList "/c npm run dev" -WorkingDirectory $feDir -WindowStyle Hidden
} else {
    Write-Host "[4/4] sb100 frontend already running on port 3000." -ForegroundColor Green
}

Write-Host "`nWaiting 3 seconds for services to initialize..." -ForegroundColor Gray
Start-Sleep -Seconds 3

Write-Host "`n--- Health Check Results ---" -ForegroundColor Cyan

# Check sb-api
try {
    $resApi = Invoke-RestMethod -Uri "http://localhost:8000/health" -TimeoutSec 3
    Write-Host " [OK] sb-api (8000):       $($resApi.status) | Database: $($resApi.database)" -ForegroundColor Green
} catch {
    Write-Host " [WAIT] sb-api (8000):     Starting up..." -ForegroundColor Yellow
}

# Check sb-api-ai
try {
    $resAi = Invoke-RestMethod -Uri "http://localhost:8002/health" -TimeoutSec 3
    Write-Host " [OK] sb-api-ai (8002):    $($resAi.status)" -ForegroundColor Green
} catch {
    Write-Host " [WAIT] sb-api-ai (8002):  Starting up..." -ForegroundColor Yellow
}

# Check sb-api-media
try {
    $resMedia = Invoke-RestMethod -Uri "http://localhost:8003/health" -TimeoutSec 3
    Write-Host " [OK] sb-api-media (8003): $($resMedia.status) | Bucket: $($resMedia.bucket)" -ForegroundColor Green
} catch {
    Write-Host " [WAIT] sb-api-media (8003): Starting up..." -ForegroundColor Yellow
}

# Check sb100
try {
    $resFe = Invoke-WebRequest -Uri "http://localhost:3000" -TimeoutSec 3 -UseBasicParsing
    Write-Host " [OK] sb100 (3000):        HTTP $($resFe.StatusCode) (Ready at http://localhost:3000)" -ForegroundColor Green
} catch {
    Write-Host " [WAIT] sb100 (3000):      Starting up..." -ForegroundColor Yellow
}

Write-Host "`nAll StoryBook services configured and running!" -ForegroundColor Cyan
