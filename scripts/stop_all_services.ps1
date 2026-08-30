<#
.SYNOPSIS
    Stops all StoryBook ecosystem services cleanly.
#>

Write-Host "Stopping StoryBook services on ports 8000, 8002, 8003, 3000..." -ForegroundColor Yellow

$ports = @(8000, 8002, 8003, 3000)
foreach ($p in $ports) {
    $connections = Get-NetTCPConnection -LocalPort $p -State Listen -ErrorAction SilentlyContinue
    if ($connections) {
        foreach ($conn in $connections) {
            $pidToKill = $conn.OwningProcess
            try {
                cmd.exe /c "taskkill /F /T /PID $pidToKill" 2>$null | Out-Null
                Stop-Process -Id $pidToKill -Force -ErrorAction SilentlyContinue
                Write-Host " Terminated process $($pidToKill) listening on port $p" -ForegroundColor Green
            } catch {
                Write-Host " Could not terminate process $($pidToKill): $($_.Exception.Message)" -ForegroundColor Red
            }
        }
    } else {
        Write-Host " Port $p is already clear." -ForegroundColor Gray
    }
}

Write-Host "All StoryBook services stopped." -ForegroundColor Cyan
