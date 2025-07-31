# SageCare Docker Setup

This document describes how to run the complete SageCare application using Docker.

## Architecture

The application consists of 4 main services:

1. **sagecare-api** (Port 5000) - Node.js/Express backend API
2. **sagecare-frontend** (Port 5173) - React frontend application
3. **sagecare-consultation** (Port 3000) - React consultation app
4. **sagecare-whisper-api** (Port 8001) - Python FastAPI Whisper transcription service

**Note**: MongoDB is configured to use a cloud MongoDB cluster (not included in Docker setup)

## Prerequisites

- Docker
- Docker Compose

## Quick Start

1. **Navigate to the web-app directory:**
   ```bash
   cd dev/web-app
   ```

2. **Build and start all services:**
   ```bash
   docker-compose up --build
   ```

3. **Access the applications:**
   - Main Frontend: http://localhost:5173
   - Consultation App: http://localhost:3000
   - Backend API: http://localhost:5000
   - Whisper API: http://localhost:8001

## Environment Variables

Before running, update the environment variables in `docker-compose.yml`:

- `JWT_SECRET`: Your JWT secret key
- `EMAIL_USER`: Your Gmail address
- `EMAIL_PASS`: Your Gmail app password
- `MONGODB_URI`: MongoDB connection string

## Individual Service Management

### Start specific services:
```bash
# Start only the backend
docker-compose up sagecare-api

# Start only the consultation app and whisper API
docker-compose up sagecare-consultation sagecare-whisper-api
```

### View logs:
```bash
# View all logs
docker-compose logs

# View specific service logs
docker-compose logs sagecare-api
docker-compose logs sagecare-whisper-api
```

### Stop services:
```bash
# Stop all services
docker-compose down

# Stop and remove volumes
docker-compose down -v
```

## Development Mode

For development, you can run services individually:

### Backend API:
```bash
cd sage-care-api
npm install
npm start
```

### Frontend:
```bash
cd sage-care-frontend
npm install
npm start
```

### Consultation App:
```bash
cd sagecare-consultation
npm install
npm start
```

### Whisper API:
```bash
cd sagecare-whisper-api
pip install -r requirements.txt
python start_api.py
```

## Troubleshooting

### Common Issues:

1. **Port conflicts**: Ensure ports 3000, 5173, 5000, and 8001 are available
2. **Memory issues**: The Whisper API requires significant memory. Ensure Docker has at least 4GB allocated
3. **Network issues**: All services communicate via the `sagecare-network` bridge network
4. **MongoDB connection**: Ensure your cloud MongoDB connection string is properly configured in the environment variables
5. **Media access issues**: For network access, HTTPS is required. See `sagecare-consultation/HTTPS-SETUP.md` for setup instructions

### Logs and Debugging:

```bash
# Check container status
docker-compose ps

# View real-time logs
docker-compose logs -f

# Access container shell
docker-compose exec sagecare-api sh
docker-compose exec sagecare-whisper-api bash
```

## Production Deployment

For production deployment:

1. Update environment variables with production values
2. Use proper secrets management
3. Configure SSL/TLS certificates
4. Set up proper monitoring and logging
5. Use a reverse proxy (nginx) for load balancing

## File Structure

```
dev/web-app/
├── docker-compose.yml
├── sage-care-api/
│   ├── Dockerfile
│   └── .dockerignore
├── sage-care-frontend/
│   ├── Dockerfile
│   └── .dockerignore
├── sagecare-consultation/
│   ├── Dockerfile
│   └── .dockerignore
└── sagecare-whisper-api/
    ├── Dockerfile
    └── .dockerignore
``` 