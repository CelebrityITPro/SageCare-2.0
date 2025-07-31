# HTTPS Setup for SageCare Consultation

This guide helps you set up HTTPS for the consultation app to resolve media access issues when joining from other devices on the network.

## Why HTTPS is Required

Modern browsers require HTTPS (or localhost) to access camera and microphone devices. When accessing the consultation app from another device on the network using HTTP, browsers block media access for security reasons.

## Quick Setup

### Option 1: Generate SSL Certificates (Recommended)

1. **Navigate to the consultation app directory:**
   ```bash
   cd dev/web-app/sagecare-consultation
   ```

2. **Generate SSL certificates:**
   - **Windows (PowerShell):**
     ```powershell
     .\generate-ssl.ps1
     ```
   - **Linux/Mac:**
     ```bash
     chmod +x generate-ssl.sh
     ./generate-ssl.sh
     ```

3. **Start the app with HTTPS:**
   ```bash
   npm start
   ```

4. **Access the app:**
   - Local: https://localhost:3000
   - Network: https://YOUR_IP:3000

### Option 2: Use mkcert (Alternative)

1. **Install mkcert:**
   - Windows: `choco install mkcert`
   - Mac: `brew install mkcert`
   - Linux: Follow instructions at https://github.com/FiloSottile/mkcert

2. **Generate certificates:**
   ```bash
   mkcert -install
   mkcert localhost 127.0.0.1 YOUR_IP_ADDRESS
   ```

3. **Rename certificates:**
   ```bash
   mv localhost+2.pem localhost.pem
   mv localhost+2-key.pem localhost-key.pem
   ```

## Troubleshooting

### Common Issues

1. **"Media devices not supported" error:**
   - **Cause**: Accessing via HTTP instead of HTTPS
   - **Solution**: Use HTTPS URL (https:// instead of http://)

2. **"Your connection is not private" warning:**
   - **Cause**: Self-signed certificate
   - **Solution**: Click "Advanced" → "Proceed to localhost (unsafe)"

3. **Certificate not found error:**
   - **Cause**: SSL certificates not generated
   - **Solution**: Run the certificate generation script

4. **Port not accessible:**
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
   - Allow port 8001 for Whisper API

### Docker Setup

If using Docker, the consultation app is configured to use HTTPS by default:

```bash
cd dev/web-app
docker-compose up sagecare-consultation
```

Access via: https://YOUR_IP:3000

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
- [ ] Transcription working

## Alternative Solutions

If HTTPS setup is problematic, consider:

1. **Use localhost only**: Test on the same machine
2. **Use VPN**: Connect devices through VPN
3. **Use ngrok**: Tunnel local server to public HTTPS URL
4. **Use production deployment**: Deploy to cloud with proper SSL 