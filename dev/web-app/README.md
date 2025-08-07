# SageCare 2.0 - Quick Start Guide

## Overview
SageCare 2.0 is a comprehensive healthcare platform consisting of 6 interconnected services designed to provide accessible healthcare solutions for aging populations.

## Prerequisites
- Node.js (v16 or higher)
- Python (v3.8 or higher)
- Git
- MongoDB (running locally or cloud instance)

## Clone & Setup
```bash
git clone <your-repo-url>
cd SageCare-2.0
```

## Install Dependencies

### Backend API
```bash
cd dev/web-app/sage-care-api
npm install
```

### Frontend
```bash
cd ../sage-care-frontend
npm install
```

### Food Inference API
```bash
cd ../food-inference-api
pip install -r requirements.txt
```

### Whisper API
```bash
cd ../sagecare-whisper-api
pip install -r requirements.txt
```

### Consultation App
```bash
cd ../sagecare-consultation
npm install
```

### AI Diagnosis App
```bash
cd ../sagecare-ai-diagnosis
npm install
```

## Start Services

**Note**: Each service should be started in a separate terminal window.

### Terminal 1 - Backend API
```bash
cd dev/web-app/sage-care-api
npm start
```
**Port**: 5000

### Terminal 2 - Frontend
```bash
cd dev/web-app/sage-care-frontend
npm run dev
```
**Port**: 5173

### Terminal 3 - Food Inference API
```bash
cd dev/web-app/food-inference-api
python app.py
```
**Port**: 5001

### Terminal 4 - Whisper API
```bash
cd dev/web-app/sagecare-whisper-api
python app.py
```
**Port**: 8001

### Terminal 5 - Consultation App
```bash
cd dev/web-app/sagecare-consultation
npm start
```
**Port**: 3000

### Terminal 6 - AI Diagnosis App
```bash
cd dev/web-app/sagecare-ai-diagnosis
npm start
```
**Port**: 3001

## Access Applications

Once all services are running, access the applications at:

- **Main Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000
- **Food Inference API**: http://localhost:5001
- **Whisper API**: http://localhost:8001
- **Consultation App**: http://localhost:3000
- **AI Diagnosis App**: http://localhost:3001

## Service Dependencies

- **Frontend** depends on **Backend API**
- **Food Inference API** is called by **Backend API**
- **Whisper API** is used by **Consultation App**
- **AI Diagnosis App** is independent but can integrate with **Backend API**

## Troubleshooting

### Common Issues
1. **Port already in use**: Kill the process using the port or change the port in the service configuration
2. **MongoDB connection error**: Ensure MongoDB is running and accessible
3. **Python dependencies**: Make sure you're using the correct Python version and virtual environment

### Stopping Services
Use `Ctrl+C` in each terminal to stop the respective service.

## Development Notes

- All services are configured for local development
- Environment variables are set to use localhost URLs
- Hot reloading is enabled for frontend services
- API endpoints are documented in each service's README

## Support

For issues or questions, refer to the individual service documentation or contact the development team. 