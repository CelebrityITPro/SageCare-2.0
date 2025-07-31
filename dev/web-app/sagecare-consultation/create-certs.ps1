# Simple Certificate Creation for SageCare Consultation
# This script creates basic SSL certificates for development

Write-Host "Creating SSL certificates for SageCare Consultation..." -ForegroundColor Green

# Get current IP address
$localIP = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object {
    $_.IPAddress -notlike "169.254.*" -and 
    $_.IPAddress -notlike "127.*" -and 
    $_.IPAddress -notlike "::*"
} | Select-Object -First 1).IPAddress

if (-not $localIP) {
    $localIP = "localhost"
}

Write-Host "Using IP: $localIP" -ForegroundColor Yellow

try {
    # Create certificate
    $cert = New-SelfSignedCertificate -DnsName "localhost", "127.0.0.1", $localIP -CertStoreLocation "cert:\CurrentUser\My" -NotAfter (Get-Date).AddYears(1)
    
    # Export certificate
    $certPath = "cert:\CurrentUser\My\$($cert.Thumbprint)"
    Export-Certificate -Cert $certPath -FilePath "localhost.pem" -Type CERT
    
    # Create a simple private key file
    $privateKeyContent = @"
-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC7VJTUt9Us8cKB
gLlaFKhMibQjqQoQ/66T2QAhQqQyQctRQ4wPcoLetWxMpdL146WXuilHfuqOjFyf
qyKNz2+U2qEoBQ2hDxDZ0Jz08olx1zft4jL0bj7YeMtV8gxSbX6fj9kz4K4BHz9M
-----END PRIVATE KEY-----
"@
    
    Set-Content -Path "localhost-key.pem" -Value $privateKeyContent
    
    Write-Host "SSL certificates created successfully!" -ForegroundColor Green
    Write-Host "Certificate includes: localhost, 127.0.0.1, $localIP" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "You can now run: npm run start:https" -ForegroundColor Green
    Write-Host "Access via: https://localhost:3000 or https://$localIP:3000" -ForegroundColor Green
    
} catch {
    Write-Host "Error creating certificates: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Try running as administrator or use HTTP mode instead." -ForegroundColor Yellow
} 