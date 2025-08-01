# SageCare Docker Setup

This document describes how to run the complete SageCare application using Docker.

## Architecture

The application consists of 5 main services:

1. **sagecare-api** (Port 5000) - Node.js/Express backend API
2. **sagecare-frontend** (Port 5173) - React frontend application
3. **sagecare-consultation** (Port 3000) - React consultation app
4. **sagecare-whisper-api** (Port 8001) - Python FastAPI Whisper transcription service
5. **food-inference-api** (Port 5001) - Python/Flask ML service for food analysis

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
   - Food Inference API: http://localhost:5001

## Environment Variables

The application uses the following environment variables with default values:

### Database Configuration
- `DB_CONNECTION_URL` - MongoDB connection string
- `MONGODB_URI` - MongoDB connection string (for food-inference-api)

### API Configuration
- `JWT_SECRET` - JWT secret key for authentication
- `PW_ENCRYPT_KEY` - Password encryption key
- `EMAIL_USER` - Email service username
- `EMAIL_PASSWORD` - Email service password

### Frontend Configuration
- `VITE_API_URL` - Backend API URL (default: http://sagecare-api:5000/api)
- `VITE_FOOD_API_URL` - Food inference API URL (default: http://food-inference-api:5001)

### Consultation App Configuration
- `REACT_APP_API_URL` - Backend API URL (default: http://sagecare-api:5000)
- `REACT_APP_STT_URL` - Whisper API WebSocket URL (default: ws://sagecare-whisper-api:8001)

## Docker Hub Deployment

### Building for Docker Hub

1. **Build all images:**
   ```bash
   docker-compose build
   ```

2. **Tag images for Docker Hub:**
   ```bash
   docker tag sagecare-api your-dockerhub-username/sagecare-api:latest
   docker tag sagecare-frontend your-dockerhub-username/sagecare-frontend:latest
   docker tag sagecare-consultation your-dockerhub-username/sagecare-consultation:latest
   docker tag sagecare-whisper-api your-dockerhub-username/sagecare-whisper-api:latest
   docker tag food-inference-api your-dockerhub-username/food-inference-api:latest
   ```

3. **Push to Docker Hub:**
   ```bash
   docker push your-dockerhub-username/sagecare-api:latest
   docker push your-dockerhub-username/sagecare-frontend:latest
   docker push your-dockerhub-username/sagecare-consultation:latest
   docker push your-dockerhub-username/sagecare-whisper-api:latest
   docker push your-dockerhub-username/food-inference-api:latest
   ```

### Using from Docker Hub

1. **Create a docker-compose.yml file:**
   ```yaml
   version: '3.8'
   
   services:
     sagecare-api:
       image: your-dockerhub-username/sagecare-api:latest
       ports:
         - "5000:5000"
       environment:
         - DB_CONNECTION_URL=your-mongodb-connection-string
         - JWT_SECRET=your-jwt-secret
         - PW_ENCRYPT_KEY=your-encryption-key
         - EMAIL_USER=your-email
         - EMAIL_PASSWORD=your-email-password
       networks:
         - sagecare-network
   
     sagecare-frontend:
       image: your-dockerhub-username/sagecare-frontend:latest
       ports:
         - "5173:5173"
       environment:
         - VITE_API_URL=http://sagecare-api:5000/api
         - VITE_FOOD_API_URL=http://food-inference-api:5001
       depends_on:
         - sagecare-api
         - food-inference-api
       networks:
         - sagecare-network
   
     sagecare-consultation:
       image: your-dockerhub-username/sagecare-consultation:latest
       ports:
         - "3000:3000"
       environment:
         - REACT_APP_API_URL=http://sagecare-api:5000
         - REACT_APP_STT_URL=ws://sagecare-whisper-api:8001
       depends_on:
         - sagecare-api
         - sagecare-whisper-api
       networks:
         - sagecare-network
   
     sagecare-whisper-api:
       image: your-dockerhub-username/sagecare-whisper-api:latest
       ports:
         - "8001:8001"
       environment:
         - PYTHONUNBUFFERED=1
       networks:
         - sagecare-network
   
     food-inference-api:
       image: your-dockerhub-username/food-inference-api:latest
       ports:
         - "5001:5001"
       environment:
         - MONGODB_URI=your-mongodb-connection-string
       networks:
         - sagecare-network
       volumes:
         - food_models:/app/models
         - food_uploads:/app/uploads
   
   networks:
     sagecare-network:
       driver: bridge
   
   volumes:
     food_models:
     food_uploads:
   ```

2. **Run the application:**
   ```bash
   docker-compose up
   ```

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
npm run dev
```

### Food Inference API:
```bash
cd food-inference-api
pip install -r requirements.txt
python app.py
```

## Troubleshooting

### Common Issues:

1. **Port conflicts**: Ensure ports 3000, 5000, 5001, 5173, and 8001 are available
2. **MongoDB connection**: Verify your MongoDB connection string is correct
3. **Environment variables**: Check that all required environment variables are set
4. **Service dependencies**: Ensure all services are running before accessing the frontend

### Logs and Debugging:
```bash
# View real-time logs
docker-compose logs -f

# View specific service logs
docker-compose logs sagecare-api -f

# Access container shell
docker-compose exec sagecare-api sh
```

## Production Deployment

For production deployment:

1. **Set proper environment variables** for security
2. **Use HTTPS** for all external communications
3. **Configure proper logging** and monitoring
4. **Set up health checks** for all services
5. **Use Docker secrets** for sensitive information
6. **Configure proper networking** and firewall rules

## Support

For issues and questions:
- Check the logs: `docker-compose logs`
- Verify environment variables are set correctly
- Ensure all services are running: `docker-compose ps`
- Check network connectivity between services 