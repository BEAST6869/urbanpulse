# UrbanPulse Backend Server Manager

param(
    [Parameter(Position=0)]
    [ValidateSet("start", "stop", "status", "restart")]
    [string]$Action = "start"
)

$ServerProcess = Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object { $_.MainWindowTitle -like "*index.js*" -or $_.ProcessName -eq "node" }

function Start-Server {
    Write-Host "🚀 Starting UrbanPulse Backend Server..." -ForegroundColor Green
    Write-Host ""
    
    # Check if server is already running
    if ($ServerProcess) {
        Write-Host "⚠️  Server is already running on process ID: $($ServerProcess.Id)" -ForegroundColor Yellow
        Write-Host "   Use 'stop' command first if you want to restart"
        return
    }
    
    # Start server in new process
    $Process = Start-Process -FilePath "node" -ArgumentList "index.js" -PassThru -WindowStyle Normal
    Write-Host "✅ Server started successfully!" -ForegroundColor Green
    Write-Host "   Process ID: $($Process.Id)" -ForegroundColor Cyan
    Write-Host "   URL: http://localhost:3000" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "💡 To stop the server, run: .\server-manager.ps1 stop" -ForegroundColor Blue
}

function Stop-Server {
    if ($ServerProcess) {
        Write-Host "🛑 Stopping server (Process ID: $($ServerProcess.Id))..." -ForegroundColor Yellow
        Stop-Process -Id $ServerProcess.Id -Force
        Write-Host "✅ Server stopped successfully!" -ForegroundColor Green
    } else {
        Write-Host "ℹ️  No running server found." -ForegroundColor Blue
    }
}

function Show-Status {
    if ($ServerProcess) {
        Write-Host "✅ Server Status: RUNNING" -ForegroundColor Green
        Write-Host "   Process ID: $($ServerProcess.Id)" -ForegroundColor Cyan
        Write-Host "   URL: http://localhost:3000" -ForegroundColor Cyan
        
        # Test if server is responding
        try {
            $response = Invoke-WebRequest -Uri "http://localhost:3000" -TimeoutSec 5 -UseBasicParsing
            Write-Host "   Health Check: ✅ Responding" -ForegroundColor Green
        } catch {
            Write-Host "   Health Check: ❌ Not responding" -ForegroundColor Red
        }
    } else {
        Write-Host "❌ Server Status: NOT RUNNING" -ForegroundColor Red
        Write-Host "   Use 'start' command to start the server" -ForegroundColor Blue
    }
}

# Main execution
switch ($Action) {
    "start" { Start-Server }
    "stop" { Stop-Server }
    "status" { Show-Status }
    "restart" { 
        Stop-Server
        Start-Sleep -Seconds 2
        Start-Server
    }
    default { 
        Write-Host "Usage: .\\server-manager.ps1 [start|stop|status|restart]" -ForegroundColor Yellow
    }
}
