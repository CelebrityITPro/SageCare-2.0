# SageCare Consultation App

A WebRTC-based video consultation module for telemedicine applications.

## Network Access Setup

To test the consultation app from other devices on the same network:

### 1. Find Your Computer's IP Address

**Windows:**
```cmd
ipconfig
```
Look for "IPv4 Address" (usually starts with 192.168.x.x or 10.x.x.x)

**Mac/Linux:**
```bash
ifconfig
# or
ip addr
```

### 2. Start All Services

Make sure all services are running:

1. **Backend API** (Port 5000):
   ```bash
   cd dev/web-app/sage-care-api
   npm start
   ```

2. **Whisper API** (Port 8001):
   ```bash
   cd dev/whisper-api
   python start_api.py
   ```

3. **Consultation App** (Port 3000):
   ```bash
   cd dev/web-app/sagecare-consultation
   npm start
   ```

### 3. Access from Other Devices

From another device on the same network, open:
```
http://YOUR_COMPUTER_IP:3000
```

Example: `http://192.168.1.100:3000`

### 4. Troubleshooting

- **Firewall**: Make sure Windows Firewall allows connections on ports 3000, 5000, and 8001
- **Antivirus**: Some antivirus software may block network connections
- **Router**: Ensure both devices are on the same network
- **HTTPS**: For production, use HTTPS for media access

### 5. Browser Permissions

When accessing from another device:
1. Allow camera/microphone access when prompted
2. If blocked, check browser settings for site permissions
3. Try refreshing the page if media access fails

## Development

### Local Development
```bash
npm start
```

### Build for Production
```bash
npm run build
```

## Features

- WebRTC peer-to-peer video calls
- Real-time transcription with Whisper
- Live captions and transcript saving
- Participant management
- Responsive UI design 