<#
.SYNOPSIS
    Starts all StoryBook ecosystem services concurrently and checks health in parallel.
.PARAMETER Env
    Target environment configuration: dev (default, Dev/Local), stage, or prod.
.PARAMETER NoWait
    Do not wait for services to become healthy before exiting.
.PARAMETER TimeoutSec
    Maximum time to wait for services to become healthy (default: 20).
#>
param (
    [ValidateSet("dev", "local", "stage", "staging", "prod", "production")]
    [string]$Env = "dev",
    [switch]$NoWait,
    [int]$TimeoutSec = 20
)

# Normalize environment alias (dev & local are one unified environment: 'dev')
$normalizedEnv = switch ($Env.ToLower()) {
    "local"       { "dev" }
    "development" { "dev" }
    "staging"     { "stage" }
    "production"  { "prod" }
    default       { $Env.ToLower() }
}
$env:SB_ENV = $normalizedEnv

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
if (-not $scriptDir) { $scriptDir = $PSScriptRoot }
$root = $null
try {
    $resolved = Resolve-Path (Join-Path $scriptDir "..\..") -ErrorAction SilentlyContinue
    if ($resolved -and (Test-Path $resolved)) { $root = $resolved.Path }
} catch {}
if (-not $root) {
    $root = (Get-Location).Path
}

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host " Starting StoryBook Services Ecosystem..." -ForegroundColor Cyan
Write-Host " Active Environment : $normalizedEnv (SB_ENV=$normalizedEnv)" -ForegroundColor Yellow
Write-Host " Root Directory     : $root" -ForegroundColor Gray
Write-Host "=========================================" -ForegroundColor Cyan

# 1. Fast Port Check (Single Batch Query)
$activePorts = @{}
Get-NetTCPConnection -State Listen -ErrorAction SilentlyContinue | ForEach-Object {
    $activePorts[$_.LocalPort] = $true
}

function Start-DetachedProcess($filePath, $argumentList, $workDir) {
    $fullCmd = "`"$filePath`" $argumentList"
    try {
        $wmi = [wmiclass]"Win32_Process"
        $startup = ([wmiclass]"Win32_ProcessStartup").CreateInstance()
        $startup.ShowWindow = 0
        # Inherit current process environment (including SB_ENV)
        $result = $wmi.Create($fullCmd, $workDir, $startup)
        if ($result.ReturnValue -eq 0) {
            return $result.ProcessId
        }
    } catch {}
    $p = Start-Process -FilePath $filePath -ArgumentList $argumentList -WorkingDirectory $workDir -WindowStyle Hidden -PassThru
    return $p.Id
}

function Resolve-PythonExec($svcDir) {
    $candidates = @(
        (Join-Path $svcDir ".venv\Scripts\python.exe"),
        (Join-Path $svcDir ".venv/bin/python"),
        (Join-Path $root ".venv\Scripts\python.exe"),
        (Join-Path $root ".venv/bin/python"),
        "python.exe",
        "python"
    )
    foreach ($c in $candidates) {
        if ($c -eq "python" -or $c -eq "python.exe") {
            $cmd = Get-Command $c -ErrorAction SilentlyContinue
            if ($cmd) { return $cmd.Source }
        } elseif (Test-Path $c) {
            return $c
        }
    }
    return "python"
}

$apiDir = Join-Path $root "sb-api"
$aiDir  = Join-Path $root "sb-api-ai"
$medDir = Join-Path $root "sb-api-media"

$services = @(
    @{
        Name = "sb-api"
        Port = 8000
        Dir  = $apiDir
        Exec = "cmd.exe"
        Args = "/c set SB_ENV=$normalizedEnv&& `"$(Resolve-PythonExec $apiDir)`" -m uvicorn main:app --host 0.0.0.0 --port 8000"
        Url  = "http://127.0.0.1:8000/health"
    },
    @{
        Name = "sb-api-ai"
        Port = 8002
        Dir  = $aiDir
        Exec = "cmd.exe"
        Args = "/c set SB_ENV=$normalizedEnv&& `"$(Resolve-PythonExec $aiDir)`" -m uvicorn main:app --host 0.0.0.0 --port 8002"
        Url  = "http://127.0.0.1:8002/health"
    },
    @{
        Name = "sb-api-media"
        Port = 8003
        Dir  = $medDir
        Exec = "cmd.exe"
        Args = "/c set SB_ENV=$normalizedEnv&& `"$(Resolve-PythonExec $medDir)`" -m uvicorn main:app --host 0.0.0.0 --port 8003"
        Url  = "http://127.0.0.1:8003/health"
    },
    @{
        Name = "sb100"
        Port = 3000
        Dir  = (Join-Path $root "sb100")
        Exec = "cmd.exe"
        Args = "/c npm run dev -- --mode $normalizedEnv"
        Url  = "http://127.0.0.1:3000"
    },
    @{
        Name = "sb-admin-web"
        Port = 3100
        Dir  = (Join-Path $root "sb-admin-web")
        Exec = "cmd.exe"
        Args = "/c npm run dev -- --mode $normalizedEnv"
        Url  = "http://127.0.0.1:3100"
    }
)

# 2. Start Services Concurrently
$idx = 1
$totalCount = $services.Count
foreach ($svc in $services) {
    if (-not $activePorts.ContainsKey($svc.Port)) {
        Write-Host "[$idx/$totalCount] Starting $($svc.Name) (Port $($svc.Port), Env: $normalizedEnv)..." -ForegroundColor Yellow
        $null = Start-DetachedProcess $svc.Exec $svc.Args $svc.Dir
    } else {
        Write-Host "[$idx/$totalCount] $($svc.Name) already running on port $($svc.Port)." -ForegroundColor Green
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
        if ($svc.Name -eq "sb100" -or $svc.Name -eq "sb-admin-web") {
            $detail = "HTTP $($res.Code) (Mode: $normalizedEnv, Ready at $($svc.Url))"
        } else {
            try {
                $json = $res.Data | ConvertFrom-Json
                $detail = "$($json.status)"
                if ($json.env) { $detail += " | Env: $($json.env)" }
                if ($json.database) { $detail += " | Database: $($json.database)" }
                if ($json.db_name) { $detail += " ($($json.db_name))" }
                if ($json.bucket) { $detail += " | Bucket: $($json.bucket)" }
                if ($json.service) { $detail += " [$($json.service)]" }
            } catch {
                $detail = "HTTP $($res.Code)"
            }
        }
        Write-Host " [OK] $($svc.Name.PadRight(16)) (Port $($svc.Port)): $detail" -ForegroundColor Green
    } else {
        Write-Host " [WAIT] $($svc.Name.PadRight(14)) (Port $($svc.Port)): Service warming up or unavailable" -ForegroundColor Yellow
    }
}

$elapsed = [math]::Round($sw.Elapsed.TotalSeconds, 2)
Write-Host "`nAll StoryBook services verified in $($elapsed)s!" -ForegroundColor Cyan
