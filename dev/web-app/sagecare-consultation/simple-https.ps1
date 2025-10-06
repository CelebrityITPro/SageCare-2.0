# Simple HTTPS certificate generation
Write-Host "Generating simple SSL certificates..." -ForegroundColor Green

# Get current IP
$localIP = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object {$_.IPAddress -notlike "169.254.*" -and $_.IPAddress -notlike "127.*"} | Select-Object -First 1).IPAddress

if (-not $localIP) {
    $localIP = "localhost"
}

Write-Host "Using IP: $localIP" -ForegroundColor Yellow

# Create a simple certificate using PowerShell
$cert = New-SelfSignedCertificate -DnsName "localhost", "127.0.0.1", $localIP -CertStoreLocation "cert:\LocalMachine\My" -NotAfter (Get-Date).AddYears(1)

# Export certificate
$certPath = "cert:\LocalMachine\My\$($cert.Thumbprint)"
Export-Certificate -Cert $certPath -FilePath "localhost.pem" -Type CERT

# Export private key
$password = ConvertTo-SecureString -String "password" -Force -AsPlainText
Export-PfxCertificate -Cert $certPath -FilePath "localhost.pfx" -Password $password

# Convert to PEM format
$pfxBytes = [System.IO.File]::ReadAllBytes("localhost.pfx")
$pfxCert = New-Object System.Security.Cryptography.X509Certificates.X509Certificate2
$pfxCert.Import($pfxBytes, $password, "Exportable,PersistKeySet")

# Export private key in PEM format
$privateKeyBytes = $pfxCert.PrivateKey.ExportCspBlob($true)
$privateKeyBase64 = [System.Convert]::ToBase64String($privateKeyBytes)

$privateKeyPem = @"
-----BEGIN PRIVATE KEY-----
$privateKeyBase64
-----END PRIVATE KEY-----
"@

Set-Content -Path "localhost-key.pem" -Value $privateKeyPem

# Clean up
Remove-Item "localhost.pfx" -Force

Write-Host "SSL certificates generated successfully!" -ForegroundColor Green
Write-Host "Certificate includes: localhost, 127.0.0.1, $localIP" -ForegroundColor Yellow
Write-Host ""
Write-Host "You can now run: npm run start:https" -ForegroundColor Green
Write-Host "Then access via: https://$localIP:3000" -ForegroundColor Green 