# SageCare Consultation Setup Script
# This script sets up the consultation app for both HTTP and HTTPS access

param(
    [switch]$HTTPS,
    [switch]$HTTP,
    [switch]$Both,
    [switch]$Force,
    [switch]$Simple
)

Write-Host "=== SageCare Consultation Setup ===" -ForegroundColor Cyan
Write-Host ""

# Function to get network information
function Get-NetworkInfo {
    $ips = @()
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

# Function to check if Node.js is installed
function Test-NodeInstalled {
    try {
        $null = Get-Command node -ErrorAction Stop
        return $true
    }
    catch {
        return $false
    }
}

# Function to check if npm is installed
function Test-NpmInstalled {
    try {
        $null = Get-Command npm -ErrorAction Stop
        return $true
    }
    catch {
        return $false
    }
}

# Function to install dependencies
function Install-Dependencies {
    Write-Host "Installing npm dependencies..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Dependencies installed successfully!" -ForegroundColor Green
    } else {
        Write-Host "Error installing dependencies." -ForegroundColor Red
        exit 1
    }
}

# Function to generate SSL certificates
function Generate-Certificates {
    Write-Host "Generating SSL certificates..." -ForegroundColor Yellow
    
    if ($Simple) {
        & ".\generate-ssl.ps1" -Simple
    } else {
        & ".\generate-ssl.ps1"
    }
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Certificates generated successfully!" -ForegroundColor Green
    } else {
        Write-Host "Error generating certificates." -ForegroundColor Red
        exit 1
    }
}

# Function to start HTTP server
function Start-HTTPServer {
    Write-Host "Starting HTTP server..." -ForegroundColor Yellow
    Write-Host "This will allow access via HTTP (less secure but simpler)" -ForegroundColor Cyan
    Write-Host ""
    
    $networkIPs = Get-NetworkInfo
    if ($networkIPs.Count -gt 0) {
        Write-Host "Access URLs:" -ForegroundColor Green
        Write-Host "- Local: http://localhost:3000" -ForegroundColor White
        Write-Host "- Network: http://$($networkIPs[0]):3000" -ForegroundColor White
        Write-Host ""
        Write-Host "Note: HTTP access may have limited camera/microphone support on some browsers." -ForegroundColor Yellow
    }
    
    npm start
}

# Function to start HTTPS server
function Start-HTTPServer {
    Write-Host "Starting HTTPS server..." -ForegroundColor Yellow
    Write-Host "This will allow secure access with full camera/microphone support" -ForegroundColor Cyan
    Write-Host ""
    
    $networkIPs = Get-NetworkInfo
    if ($networkIPs.Count -gt 0) {
        Write-Host "Access URLs:" -ForegroundColor Green
        Write-Host "- Local: https://localhost:3000" -ForegroundColor White
        Write-Host "- Network: https://$($networkIPs[0]):3000" -ForegroundColor White
        Write-Host ""
        Write-Host "Note: You may need to accept the security warning in your browser." -ForegroundColor Yellow
    }
    
    npm run start:https
}

# Main execution
try {
    # Check prerequisites
    Write-Host "Checking prerequisites..." -ForegroundColor Yellow
    
    if (-not (Test-NodeInstalled)) {
        Write-Host "Error: Node.js is not installed." -ForegroundColor Red
        Write-Host "Please install Node.js from https://nodejs.org/" -ForegroundColor Yellow
        exit 1
    }
    
    if (-not (Test-NpmInstalled)) {
        Write-Host "Error: npm is not installed." -ForegroundColor Red
        Write-Host "Please install npm or reinstall Node.js." -ForegroundColor Yellow
        exit 1
    }
    
    Write-Host "Prerequisites check passed!" -ForegroundColor Green
    Write-Host ""
    
    # Install dependencies if node_modules doesn't exist
    if (-not (Test-Path "node_modules")) {
        Write-Host "Installing dependencies..." -ForegroundColor Yellow
        Install-Dependencies
        Write-Host ""
    }
    
    # Determine mode
    if ($Both) {
        Write-Host "Setting up for both HTTP and HTTPS access..." -ForegroundColor Cyan
        Write-Host ""
        
        # Generate certificates for HTTPS
        Generate-Certificates
        Write-Host ""
        
        Write-Host "Setup complete! You can now:" -ForegroundColor Green
        Write-Host "1. Run 'npm start' for HTTP access" -ForegroundColor White
        Write-Host "2. Run 'npm run start:https' for HTTPS access" -ForegroundColor White
        Write-Host "3. Run 'npm run start:both' to generate certs and start HTTPS" -ForegroundColor White
        Write-Host ""
        
        $choice = Read-Host "Which mode would you like to start? (http/https/both)"
        switch ($choice.ToLower()) {
            "http" { Start-HTTPServer }
            "https" { Start-HTTPServer }
            "both" { 
                Write-Host "Starting HTTPS server (recommended for full functionality)..." -ForegroundColor Green
                Start-HTTPServer 
            }
            default { 
                Write-Host "Starting HTTPS server (recommended)..." -ForegroundColor Green
                Start-HTTPServer 
            }
        }
        
    } elseif ($HTTPS) {
        Write-Host "Setting up for HTTPS access only..." -ForegroundColor Cyan
        Write-Host ""
        
        # Generate certificates
        Generate-Certificates
        Write-Host ""
        
        # Start HTTPS server
        Start-HTTPServer
        
    } elseif ($HTTP) {
        Write-Host "Setting up for HTTP access only..." -ForegroundColor Cyan
        Write-Host ""
        Write-Host "Warning: HTTP access may have limited camera/microphone support." -ForegroundColor Yellow
        Write-Host ""
        
        # Start HTTP server
        Start-HTTPServer
        
    } else {
        # Interactive mode
        Write-Host "Choose your setup mode:" -ForegroundColor Cyan
        Write-Host "1. HTTP only (simpler, limited camera support)" -ForegroundColor White
        Write-Host "2. HTTPS only (secure, full camera support)" -ForegroundColor White
        Write-Host "3. Both (generate certs and choose at runtime)" -ForegroundColor White
        Write-Host ""
        
        $choice = Read-Host "Enter your choice (1/2/3)"
        
        switch ($choice) {
            "1" { 
                Write-Host "Setting up HTTP access..." -ForegroundColor Cyan
                Start-HTTPServer 
            }
            "2" { 
                Write-Host "Setting up HTTPS access..." -ForegroundColor Cyan
                Generate-Certificates
                Start-HTTPServer 
            }
            "3" { 
                Write-Host "Setting up both modes..." -ForegroundColor Cyan
                Generate-Certificates
                Write-Host ""
                Write-Host "Setup complete! You can now:" -ForegroundColor Green
                Write-Host "- Run 'npm start' for HTTP" -ForegroundColor White
                Write-Host "- Run 'npm run start:https' for HTTPS" -ForegroundColor White
                Write-Host ""
                $startChoice = Read-Host "Start HTTPS server now? (y/n)"
                if ($startChoice.ToLower() -eq "y") {
                    Start-HTTPServer
                }
            }
            default { 
                Write-Host "Invalid choice. Setting up HTTPS (recommended)..." -ForegroundColor Yellow
                Generate-Certificates
                Start-HTTPServer 
            }
        }
    }
    
} catch {
    Write-Host "Error during setup: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
} 