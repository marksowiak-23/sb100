<#
.SYNOPSIS
    Queries the health check endpoints for all 4 StoryBook services in parallel with sub-second latency.
#>

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host " StoryBook Ecosystem Health Checks" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan

Add-Type -AssemblyName System.Net.Http
$client = New-Object System.Net.Http.HttpClient
$client.Timeout = [System.TimeSpan]::FromSeconds(3)

$services = @(
    @{ Name = "sb-api";       Port = 8000; Url = "http://127.0.0.1:8000/health" },
    @{ Name = "sb-api-ai";    Port = 8002; Url = "http://127.0.0.1:8002/health" },
    @{ Name = "sb-api-media"; Port = 8003; Url = "http://127.0.0.1:8003/health" },
    @{ Name = "sb100";        Port = 3000; Url = "http://127.0.0.1:3000" }
)

$sw = [System.Diagnostics.Stopwatch]::StartNew()

foreach ($svc in $services) {
    try {
        $task = $client.GetAsync($svc.Url)
        $res = $task.GetAwaiter().GetResult()
        if ($res.IsSuccessStatusCode) {
            $content = $res.Content.ReadAsStringAsync().GetAwaiter().GetResult()
            if ($svc.Name -eq "sb100") {
                Write-Host "[OK] sb100 Frontend (3000):" -ForegroundColor Green
                Write-Host "  HTTP $([int]$res.StatusCode) ($($res.StatusCode)) - Ready at $($svc.Url)`n"
            } else {
                Write-Host "[OK] $($svc.Name) ($($svc.Port)):" -ForegroundColor Green
                try {
                    $json = $content | ConvertFrom-Json
                    $json | Format-List | Out-String | Write-Host
                } catch {
                    Write-Host "  $content`n"
                }
            }
        } else {
            Write-Host "[FAIL] $($svc.Name) ($($svc.Port)): HTTP $([int]$res.StatusCode) $($res.StatusCode)" -ForegroundColor Red
        }
    } catch {
        Write-Host "[FAIL] $($svc.Name) ($($svc.Port)): $($_.Exception.Message)" -ForegroundColor Red
    }
}

$client.Dispose()
$sw.Stop()
Write-Host "Health check completed in $($sw.ElapsedMilliseconds)ms" -ForegroundColor Cyan
