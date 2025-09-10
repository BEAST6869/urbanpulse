Write-Host "Starting UrbanPulse Backend Server..." -ForegroundColor Green

# Start server in background
$process = Start-Process -FilePath "node" -ArgumentList "index.js" -PassThru -WindowStyle Hidden
Write-Host "Server started successfully!" -ForegroundColor Green
Write-Host "Process ID: $($process.Id)" -ForegroundColor Cyan
Write-Host "URL: http://localhost:3000" -ForegroundColor Cyan

# Wait and test
Start-Sleep -Seconds 5
Write-Host "Testing connection..." -ForegroundColor Blue

try {
    $response = Invoke-RestMethod -Uri "http://localhost:3000" -TimeoutSec 10
    Write-Host "Server is responding!" -ForegroundColor Green
    Write-Host "API: $($response.message)" -ForegroundColor Gray
} catch {
    Write-Host "Server may still be starting up..." -ForegroundColor Yellow
}
