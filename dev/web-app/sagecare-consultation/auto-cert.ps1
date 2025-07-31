# Auto-detect IP and generate SSL certificates
Write-Host "Auto-detecting IP and generating SSL certificates..." -ForegroundColor Green

# Get current IP address
$localIP = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object {$_.IPAddress -notlike "169.254.*" -and $_.IPAddress -notlike "127.*" -and $_.IPAddress -notlike "192.168.*" -and $_.IPAddress -notlike "10.*"} | Select-Object -First 1).IPAddress

if (-not $localIP) {
    # Fallback to any available IP
    $localIP = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object {$_.IPAddress -notlike "169.254.*" -and $_.IPAddress -notlike "127.*"} | Select-Object -First 1).IPAddress
}

if (-not $localIP) {
    Write-Host "Could not detect IP address. Using localhost only." -ForegroundColor Yellow
    $localIP = "localhost"
}

Write-Host "Detected IP: $localIP" -ForegroundColor Yellow

# Install mkcert CA if not already installed
mkcert -install

# Generate certificates for current IP
mkcert localhost 127.0.0.1 $localIP

# Rename files to match React's expected names
if (Test-Path "localhost+2.pem") {
    Move-Item "localhost+2.pem" "localhost.pem" -Force
}
if (Test-Path "localhost+2-key.pem") {
    Move-Item "localhost+2-key.pem" "localhost-key.pem" -Force
}

Write-Host "SSL certificates generated successfully!" -ForegroundColor Green
Write-Host "Certificate includes: localhost, 127.0.0.1, $localIP" -ForegroundColor Yellow
Write-Host ""
Write-Host "Files created:" -ForegroundColor Yellow
Write-Host "- localhost.pem (certificate)" -ForegroundColor White
Write-Host "- localhost-key.pem (private key)" -ForegroundColor White
Write-Host ""
Write-Host "You can now run: npm run start:https" -ForegroundColor Green
Write-Host "Then access via: https://$localIP:3000" -ForegroundColor Green
Write-Host ""
Write-Host "Note: Run this script again if you change networks!" -ForegroundColor Yellow 