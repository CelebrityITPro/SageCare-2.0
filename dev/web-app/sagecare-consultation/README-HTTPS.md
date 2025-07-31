# SageCare Consultation - HTTPS Setup Guide

This guide explains how to set up the SageCare Consultation application for both HTTP and HTTPS access, enabling other devices on the same network to join video consultations.

## Quick Start

### Option 1: Automatic Setup (Recommended)

```bash
# Navigate to the consultation app directory
cd dev/web-app/sagecare-consultation

# Run the interactive setup
npm run setup
```

This will guide you through the setup process and allow you to choose between HTTP, HTTPS, or both modes.

### Option 2: Direct HTTPS Setup

```bash
# Set up HTTPS only
npm run setup:https

# Or set up both HTTP and HTTPS
npm run setup:both
```

## Access URLs

After setup, you can access the application using:

### Local Access
- **HTTP**: http://localhost:3000
- **HTTPS**: https://localhost:3000

### Network Access (Other Devices)
- **HTTP**: http://YOUR_IP:3000
- **HTTPS**: https://YOUR_IP:3000

To find your IP address:
- **Windows**: `ipconfig`
- **Mac/Linux**: `ifconfig` or `ip addr`

## Why HTTPS is Important

Modern browsers require HTTPS (or localhost) to access camera and microphone devices. When accessing the consultation app from another device on the network using HTTP, browsers block media access for security reasons.

### Benefits of HTTPS:
- ✅ Full camera and microphone support
- ✅ Works on all devices on the network
- ✅ Secure communication
- ✅ Better browser compatibility

### HTTP Limitations:
- ⚠️ Limited camera/microphone support
- ⚠️ May not work on all browsers
- ⚠️ Security warnings

## Available Commands

### Setup Commands
```bash
npm run setup          # Interactive setup
npm run setup:https    # HTTPS only setup
npm run setup:http     # HTTP only setup
npm run setup:both     # Both HTTP and HTTPS setup
```

### Server Commands
```bash
npm start              # Start HTTP server
npm run start:https    # Start HTTPS server
npm run start:both     # Generate certs and start HTTPS
```

### Certificate Commands
```bash
npm run generate-certs         # Generate SSL certificates
npm run generate-certs-simple  # Generate simple certificates
```

## Manual Setup Steps

If you prefer to set up manually:

### 1. Generate SSL Certificates

```bash
# Using the comprehensive script (recommended)
npm run generate-certs

# Or using the simple script
npm run generate-certs-simple
```

### 2. Start the Server

```bash
# For HTTP access
npm start

# For HTTPS access
npm run start:https
```

## Troubleshooting

### Common Issues

#### 1. "Media devices not supported" error
- **Cause**: Accessing via HTTP instead of HTTPS
- **Solution**: Use HTTPS URL (https:// instead of http://)

#### 2. "Your connection is not private" warning
- **Cause**: Self-signed certificate
- **Solution**: Click "Advanced" → "Proceed to localhost (unsafe)"

#### 3. Certificate not found error
- **Cause**: SSL certificates not generated
- **Solution**: Run `npm run generate-certs`

#### 4. Port not accessible
- **Cause**: Firewall blocking port 3000
- **Solution**: Allow port 3000 in firewall settings

### Browser-Specific Instructions

#### Chrome/Edge
1. Navigate to https://YOUR_IP:3000
2. Click "Advanced"
3. Click "Proceed to [IP] (unsafe)"
4. Allow camera/microphone when prompted

#### Firefox
1. Navigate to https://YOUR_IP:3000
2. Click "Advanced"
3. Click "Accept the Risk and Continue"
4. Allow camera/microphone when prompted

#### Safari
1. Navigate to https://YOUR_IP:3000
2. Click "Show Details"
3. Click "visit this website"
4. Allow camera/microphone when prompted

### Network Configuration

1. **Find your IP address:**
   - Windows: `ipconfig`
   - Mac/Linux: `ifconfig` or `ip addr`

2. **Ensure devices are on the same network**

3. **Check firewall settings:**
   - Allow port 3000 for incoming connections
   - Allow port 8001 for Whisper API (if using transcription)

## Development vs Production

### Development
- Use self-signed certificates
- Accept security warnings in browser
- Works for local testing and network access

### Production
- Use proper SSL certificates from a certificate authority
- Configure reverse proxy (nginx) with SSL termination
- Set up proper domain names

## Testing Checklist

- [ ] SSL certificates generated
- [ ] App starts with HTTPS
- [ ] Can access via https://localhost:3000
- [ ] Can access via https://YOUR_IP:3000 from other devices
- [ ] Camera/microphone permissions granted
- [ ] Video/audio working in consultation
- [ ] Transcription working (if enabled)

## Alternative Solutions

If HTTPS setup is problematic, consider:

1. **Use localhost only**: Test on the same machine
2. **Use VPN**: Connect devices through VPN
3. **Use ngrok**: Tunnel local server to public HTTPS URL
4. **Use production deployment**: Deploy to cloud with proper SSL

## Scripts Overview

### `setup-https.ps1`
Comprehensive setup script that handles:
- Prerequisites checking
- Dependency installation
- Certificate generation
- Server startup
- Interactive mode selection

### `generate-ssl.ps1`
Advanced certificate generation script that:
- Auto-detects network IPs
- Supports both mkcert and PowerShell certificate generation
- Handles multiple IP addresses
- Provides better error handling

### `auto-cert.ps1` and `simple-https.ps1`
Legacy certificate generation scripts for backward compatibility.

## Security Notes

- Self-signed certificates are for development only
- Never use self-signed certificates in production
- Always use proper SSL certificates from a certificate authority in production
- Keep your private keys secure and never commit them to version control

## Support

If you encounter issues:

1. Check the troubleshooting section above
2. Ensure all prerequisites are installed (Node.js, npm)
3. Try running with the `-Simple` flag for basic certificate generation
4. Check that your firewall allows the required ports
5. Verify that devices are on the same network 