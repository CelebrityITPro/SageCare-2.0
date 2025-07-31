# Comprehensive SSL Certificate Generation for SageCare Consultation
# This script generates SSL certificates for both localhost and network access

param(
    [switch]$Force,
    [switch]$Simple
)

Write-Host "=== SageCare Consultation SSL Certificate Generator ===" -ForegroundColor Cyan
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

# Function to check if mkcert is available
function Test-MkcertAvailable {
    try {
        $null = Get-Command mkcert -ErrorAction Stop
        return $true
    }
    catch {
        return $false
    }
}

# Function to generate certificates using mkcert
function Generate-MkcertCertificates {
    param([string[]]$IPs)
    
    Write-Host "Using mkcert for certificate generation..." -ForegroundColor Green
    
    # Install mkcert CA
    Write-Host "Installing mkcert CA..." -ForegroundColor Yellow
    mkcert -install
    
    # Build DNS names array
    $dnsNames = @("localhost", "127.0.0.1") + $IPs
    
    # Generate certificates
    Write-Host "Generating certificates for: $($dnsNames -join ', ')" -ForegroundColor Yellow
    mkcert $dnsNames
    
    # Find and rename the generated certificate files
    $certFiles = Get-ChildItem -Name "localhost*.pem" | Sort-Object
    if ($certFiles.Count -ge 2) {
        $certFile = $certFiles[0]
        $keyFile = $certFiles[1]
        
        # Rename to expected names
        if (Test-Path $certFile) {
            Move-Item $certFile "localhost.pem" -Force
            Write-Host "Certificate saved as: localhost.pem" -ForegroundColor Green
        }
        if (Test-Path $keyFile) {
            Move-Item $keyFile "localhost-key.pem" -Force
            Write-Host "Private key saved as: localhost-key.pem" -ForegroundColor Green
        }
    }
}

# Function to generate certificates using PowerShell
function Generate-PowerShellCertificates {
    param([string[]]$IPs)
    
    Write-Host "Using PowerShell for certificate generation..." -ForegroundColor Green
    
    # Build DNS names array
    $dnsNames = @("localhost", "127.0.0.1") + $IPs
    
    Write-Host "Generating certificates for: $($dnsNames -join ', ')" -ForegroundColor Yellow
    
    # Create certificate
    $cert = New-SelfSignedCertificate -DnsName $dnsNames -CertStoreLocation "cert:\LocalMachine\My" -NotAfter (Get-Date).AddYears(1) -KeyAlgorithm RSA -KeyLength 2048
    
    # Export certificate
    $certPath = "cert:\LocalMachine\My\$($cert.Thumbprint)"
    Export-Certificate -Cert $certPath -FilePath "localhost.pem" -Type CERT
    
    # Export private key
    $password = ConvertTo-SecureString -String "sagecare2024" -Force -AsPlainText
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
    
    Write-Host "Certificate saved as: localhost.pem" -ForegroundColor Green
    Write-Host "Private key saved as: localhost-key.pem" -ForegroundColor Green
}

# Main execution
try {
    # Check if certificates already exist
    if ((Test-Path "localhost.pem") -and (Test-Path "localhost-key.pem") -and -not $Force) {
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
        Write-Host "No network IP addresses detected. Using localhost only." -ForegroundColor Yellow
        $networkIPs = @("localhost")
    } else {
        Write-Host "Detected IP addresses: $($networkIPs -join ', ')" -ForegroundColor Green
    }
    
    # Choose certificate generation method
    if ($Simple) {
        Write-Host "Using simple PowerShell certificate generation..." -ForegroundColor Yellow
        Generate-PowerShellCertificates -IPs $networkIPs
    } elseif (Test-MkcertAvailable) {
        Write-Host "mkcert found, using it for certificate generation..." -ForegroundColor Yellow
        Generate-MkcertCertificates -IPs $networkIPs
    } else {
        Write-Host "mkcert not found, using PowerShell certificate generation..." -ForegroundColor Yellow
        Write-Host "For better certificates, install mkcert: choco install mkcert" -ForegroundColor Cyan
        Generate-PowerShellCertificates -IPs $networkIPs
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
        Write-Host "3. Access from network: https://$($networkIPs[0]):3000" -ForegroundColor Green
        Write-Host ""
        Write-Host "Note: You may need to accept the security warning in your browser." -ForegroundColor Yellow
        Write-Host "This is normal for self-signed certificates." -ForegroundColor Yellow
    } else {
        Write-Host "Error: Certificate files were not created successfully." -ForegroundColor Red
        exit 1
    }
    
} catch {
    Write-Host "Error generating certificates: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Try running with -Simple flag for basic certificate generation." -ForegroundColor Yellow
    exit 1
} 