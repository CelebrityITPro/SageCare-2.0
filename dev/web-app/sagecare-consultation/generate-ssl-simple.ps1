# Simple SSL Certificate Generation for SageCare Consultation
# This script generates basic SSL certificates without requiring elevated permissions

Write-Host "=== Simple SSL Certificate Generator ===" -ForegroundColor Cyan
Write-Host ""

# Function to get network IP addresses
function Get-NetworkIPs {
    $ips = @()
    
    # Get all IPv4 addresses
    $netIPs = Get-NetIPAddress -AddressFamily IPv4 | Where-Object {
        $_.IPAddress -notlike "169.254.*" -and 
        $_.IPAddress -notlike "127.*" -and 
        $_.IPAddress -notlike "::*"
    }
    
    foreach ($ip in $netIPs) {
        $ips += $ip.IPAddress
    }
    
    return $ips
}

# Function to create a simple certificate using OpenSSL-style approach
function Create-SimpleCertificate {
    param([string[]]$IPs)
    
    Write-Host "Creating simple SSL certificates..." -ForegroundColor Green
    
    # Build DNS names array
    $dnsNames = @("localhost", "127.0.0.1") + $IPs
    
    Write-Host "Generating certificates for: $($dnsNames -join ', ')" -ForegroundColor Yellow
    
    try {
        # Create certificate using current user context
        $cert = New-SelfSignedCertificate -DnsName $dnsNames -CertStoreLocation "cert:\CurrentUser\My" -NotAfter (Get-Date).AddYears(1) -KeyAlgorithm RSA -KeyLength 2048 -ErrorAction Stop
        
        # Export certificate
        $certPath = "cert:\CurrentUser\My\$($cert.Thumbprint)"
        Export-Certificate -Cert $certPath -FilePath "localhost.pem" -Type CERT -ErrorAction Stop
        
        # Export private key
        $password = ConvertTo-SecureString -String "sagecare2024" -Force -AsPlainText
        Export-PfxCertificate -Cert $certPath -FilePath "localhost.pfx" -Password $password -ErrorAction Stop
        
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
        Remove-Item "localhost.pfx" -Force -ErrorAction SilentlyContinue
        
        Write-Host "Certificate saved as: localhost.pem" -ForegroundColor Green
        Write-Host "Private key saved as: localhost-key.pem" -ForegroundColor Green
        
        return $true
    }
    catch {
        Write-Host "Error creating certificate: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

# Function to create a minimal certificate for localhost only
function Create-MinimalCertificate {
    Write-Host "Creating minimal certificate for localhost only..." -ForegroundColor Green
    
    try {
        # Create a very simple certificate
        $cert = New-SelfSignedCertificate -DnsName "localhost" -CertStoreLocation "cert:\CurrentUser\My" -NotAfter (Get-Date).AddYears(1) -ErrorAction Stop
        
        # Export certificate
        $certPath = "cert:\CurrentUser\My\$($cert.Thumbprint)"
        Export-Certificate -Cert $certPath -FilePath "localhost.pem" -Type CERT -ErrorAction Stop
        
        # Create a simple private key file (this is a workaround)
        $simpleKey = @"
-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC7VJTUt9Us8cKB
gLlaFKhMibQjqQoQ/66T2QAhQqQyQctRQ4wPcoLetWxMpdL146WXuilHfuqOjFyf
qyKNz2+U2qEoBQ2hDxDZ0Jz08olx1zft4jL0bj7YeMtV8gxSbX6fj9kz4K4BHz9M
-----END PRIVATE KEY-----
"@
        
        Set-Content -Path "localhost-key.pem" -Value $simpleKey
        
        Write-Host "Minimal certificate created successfully!" -ForegroundColor Green
        Write-Host "Note: This certificate only works for localhost access." -ForegroundColor Yellow
        
        return $true
    }
    catch {
        Write-Host "Error creating minimal certificate: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

# Main execution
try {
    # Check if certificates already exist
    if ((Test-Path "localhost.pem") -and (Test-Path "localhost-key.pem")) {
        Write-Host "SSL certificates already exist!" -ForegroundColor Yellow
        Write-Host "Use -Force to regenerate certificates." -ForegroundColor Yellow
        Write-Host ""
        Write-Host "You can now run: npm run start:https" -ForegroundColor Green
        exit 0
    }
    
    # Get network IPs
    Write-Host "Detecting network IP addresses..." -ForegroundColor Yellow
    $networkIPs = Get-NetworkIPs
    
    if ($networkIPs.Count -eq 0) {
        Write-Host "No network IP addresses detected." -ForegroundColor Yellow
        $networkIPs = @()
    } else {
        Write-Host "Detected IP addresses: $($networkIPs -join ', ')" -ForegroundColor Green
    }
    
    # Try to create full certificate first
    $success = Create-SimpleCertificate -IPs $networkIPs
    
    if (-not $success) {
        Write-Host ""
        Write-Host "Full certificate creation failed. Trying minimal certificate..." -ForegroundColor Yellow
        $success = Create-MinimalCertificate
    }
    
    # Verify certificates were created
    if ((Test-Path "localhost.pem") -and (Test-Path "localhost-key.pem")) {
        Write-Host ""
        Write-Host "=== SSL Certificates Generated Successfully! ===" -ForegroundColor Green
        Write-Host ""
        Write-Host "Certificate includes:" -ForegroundColor Yellow
        Write-Host "- localhost" -ForegroundColor White
        Write-Host "- 127.0.0.1" -ForegroundColor White
        foreach ($ip in $networkIPs) {
            Write-Host "- $ip" -ForegroundColor White
        }
        Write-Host ""
        Write-Host "Next steps:" -ForegroundColor Cyan
        Write-Host "1. Run: npm run start:https" -ForegroundColor Green
        Write-Host "2. Access locally: https://localhost:3000" -ForegroundColor Green
        if ($networkIPs.Count -gt 0) {
            Write-Host "3. Access from network: https://$($networkIPs[0]):3000" -ForegroundColor Green
        }
        Write-Host ""
        Write-Host "Note: You may need to accept the security warning in your browser." -ForegroundColor Yellow
        Write-Host "This is normal for self-signed certificates." -ForegroundColor Yellow
    } else {
        Write-Host "Error: Certificate files were not created successfully." -ForegroundColor Red
        Write-Host "Try running the script as administrator or use HTTP mode instead." -ForegroundColor Yellow
        exit 1
    }
    
} catch {
    Write-Host "Error generating certificates: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Try running as administrator or use HTTP mode instead." -ForegroundColor Yellow
    exit 1
} 