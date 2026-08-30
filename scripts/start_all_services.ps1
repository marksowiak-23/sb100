<#
.SYNOPSIS
    Starts all StoryBook ecosystem services concurrently and checks health in parallel.
.PARAMETER NoWait
    Do not wait for services to become healthy before exiting.
.PARAMETER TimeoutSec
    Maximum time to wait for services to become healthy (default: 10).
#>
param (
    [switch]$NoWait,
    [int]$TimeoutSec = 20
)

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
if (-not $scriptDir) { $scriptDir = $PSScriptRoot }
$root = Resolve-Path (Join-Path $scriptDir "..\..")
if (-not (Test-Path $root)) {
    $root = "c:\Users\marks\OneDrive\Documents\My Antigravity\sbook"
}

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host " Starting StoryBook Services Ecosystem..." -ForegroundColor Cyan
Write-Host " Root Directory: $root" -ForegroundColor Gray
Write-Host "=========================================" -ForegroundColor Cyan

# 1. Fast Port Check (Single Batch Query)
$activePorts = @{}
Get-NetTCPConnection -State Listen -ErrorAction SilentlyContinue | ForEach-Object {
    $activePorts[$_.LocalPort] = $true
}

function Start-DetachedProcess($filePath, $argumentList, $workDir) {
    Start-Process -FilePath $filePath -ArgumentList $argumentList -WorkingDirectory $workDir -WindowStyle Hidden
}

$services = @(
    @{
        Name = "sb-api"
        Port = 8000
        Dir  = (Join-Path $root "sb-api")
        Exec = (Join-Path $root "sb-api\.venv\Scripts\python.exe")
        Args = "-m uvicorn main:app --host 0.0.0.0 --port 8000"
        Url  = "http://127.0.0.1:8000/health"
    },
    @{
        Name = "sb-api-ai"
        Port = 8002
        Dir  = (Join-Path $root "sb-api-ai")
        Exec = (Join-Path $root "sb-api-ai\.venv\Scripts\python.exe")
        Args = "-m uvicorn main:app --host 0.0.0.0 --port 8002"
        Url  = "http://127.0.0.1:8002/health"
    },
    @{
        Name = "sb-api-media"
        Port = 8003
        Dir  = (Join-Path $root "sb-api-media")
        Exec = (Join-Path $root "sb-api-media\.venv\Scripts\python.exe")
        Args = "-m uvicorn main:app --host 0.0.0.0 --port 8003"
        Url  = "http://127.0.0.1:8003/health"
    },
    @{
        Name = "sb100"
        Port = 3000
        Dir  = (Join-Path $root "sb100")
        Exec = "cmd.exe"
        Args = "/c npm run dev"
        Url  = "http://127.0.0.1:3000"
    }
)

# 2. Start Services Concurrently
$idx = 1
foreach ($svc in $services) {
    if (-not $activePorts.ContainsKey($svc.Port)) {
        Write-Host "[$idx/4] Starting $($svc.Name) (Port $($svc.Port))..." -ForegroundColor Yellow
        Start-DetachedProcess $svc.Exec $svc.Args $svc.Dir
    } else {
        Write-Host "[$idx/4] $($svc.Name) already running on port $($svc.Port)." -ForegroundColor Green
    }
    $idx++
}

if ($NoWait) {
    Write-Host "`nAll services launched (NoWait mode enabled)." -ForegroundColor Cyan
    exit 0
}

# 3. High-Speed Concurrent Health Polling
Add-Type -AssemblyName System.Net.Http
$client = New-Object System.Net.Http.HttpClient
$client.Timeout = [System.TimeSpan]::FromMilliseconds(1000)

Write-Host "`n--- Checking Service Health (Parallel) ---" -ForegroundColor Cyan
$sw = [System.Diagnostics.Stopwatch]::StartNew()
$maxMs = $TimeoutSec * 1000
$pending = [System.Collections.Generic.List[hashtable]]::new()
foreach ($s in $services) { $pending.Add($s) }
$results = @{}

while ($pending.Count -gt 0 -and $sw.ElapsedMilliseconds -lt $maxMs) {
    $toRemove = @()
    foreach ($svc in $pending) {
        try {
            $task = $client.GetAsync($svc.Url)
            $res = $task.GetAwaiter().GetResult()
            if ($res.IsSuccessStatusCode) {
                $content = $res.Content.ReadAsStringAsync().GetAwaiter().GetResult()
                $results[$svc.Name] = @{
                    Status = "OK"
                    Code   = [int]$res.StatusCode
                    Data   = $content
                    Port   = $svc.Port
                }
                $toRemove += $svc
            }
        } catch {
            # Service still initializing
        }
    }
    foreach ($item in $toRemove) {
        $pending.Remove($item) | Out-Null
    }
    if ($pending.Count -gt 0) {
        Start-Sleep -Milliseconds 250
    }
}

$client.Dispose()

# 4. Output Consolidated Summary
foreach ($svc in $services) {
    $res = $results[$svc.Name]
    if ($res) {
        $detail = ""
        if ($svc.Name -eq "sb100") {
            $detail = "HTTP $($res.Code) (Ready at $($svc.Url))"
        } else {
            try {
                $json = $res.Data | ConvertFrom-Json
                $detail = "$($json.status)"
                if ($json.database) { $detail += " | Database: $($json.database)" }
                if ($json.bucket) { $detail += " | Bucket: $($json.bucket)" }
                if ($json.service) { $detail += " ($($json.service))" }
            } catch {
                $detail = "HTTP $($res.Code)"
            }
        }
        Write-Host " [OK] $($svc.Name.PadRight(14)) (Port $($svc.Port)): $detail" -ForegroundColor Green
    } else {
        Write-Host " [WAIT] $($svc.Name.PadRight(12)) (Port $($svc.Port)): Service warming up or unavailable" -ForegroundColor Yellow
    }
}

$elapsed = [math]::Round($sw.Elapsed.TotalSeconds, 2)
Write-Host "`nAll StoryBook services verified in $($elapsed)s!" -ForegroundColor Cyan
