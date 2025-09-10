# Start UrbanPulse Backend Server
Write-Host "🚀 Starting UrbanPulse Backend Server..." -ForegroundColor Green

# Check if already running
$existingProcess = Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object { 
    $_.MainModule.FileName -like "*node.exe*"
}

if ($existingProcess) {
    Write-Host "⚠️  Server may already be running (Process ID: $($existingProcess.Id))" -ForegroundColor Yellow
}

# Start server
$process = Start-Process -FilePath "node" -ArgumentList "index.js" -PassThru -WindowStyle Hidden
Write-Host "✅ Server started successfully!" -ForegroundColor Green
Write-Host "   Process ID: $($process.Id)" -ForegroundColor Cyan
Write-Host "   URL: http://localhost:3000" -ForegroundColor Cyan
Write-Host ""
Write-Host "💡 To stop the server later:" -ForegroundColor Blue
Write-Host "   Stop-Process -Id $($process.Id)" -ForegroundColor Gray

# Wait a moment then test
Start-Sleep -Seconds 3
Write-Host "🔍 Testing server connection..." -ForegroundColor Blue

try {
    $response = Invoke-RestMethod -Uri "http://localhost:3000" -TimeoutSec 10
    Write-Host "✅ Server is responding!" -ForegroundColor Green
    Write-Host "   API: $($response.message)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Server not responding yet. Check process ID $($process.Id)" -ForegroundColor Red
}
