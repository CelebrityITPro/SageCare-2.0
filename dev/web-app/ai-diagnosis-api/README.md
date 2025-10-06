# SageCare AI Diagnosis API

This service provides AI-powered symptom analysis and medical diagnosis recommendations using the Grok language model.

## Quick Start

### Option 1: Using the startup script (Recommended)
```bash
python startdiagnosis.py
```

### Option 2: Manual startup
```bash
# Install dependencies
pip install -r requirements.txt

# Set environment variables
export FLASK_APP=app.py
export FLASK_ENV=development
export PORT=5002
export GROK_API_URL=https://api.x.ai/v1
export GROK_API_KEY=your_api_key_here
export SAGECARE_API_URL=http://localhost:5000/api

# Start the server
flask run --host=0.0.0.0 --port=5002
```

## Environment Setup

### Option A: Automatic Setup (Recommended)
```bash
python setup_env.py
```
This will create a `.env` file from the template. Edit it with your API key.

### Option B: Manual Setup
1. Copy the template: `cp env.template .env`
2. Edit `.env` and replace `your_grok_api_key_here` with your actual API key

## Prerequisites

1. **Python 3.8+** installed
2. **Grok API Key** from x.ai (free tier available)
3. **SageCare API** running (for doctor lookup)

## Getting Grok API Key

1. Go to https://console.x.ai/
2. Sign up for a free account
3. Navigate to API Keys section
4. Create a new API key
5. Add the API key to your `.env` file

## API Endpoints

- `GET /health` - Health check
- `POST /analyze-symptoms` - Analyze patient symptoms
- `GET /available-specialties` - Get list of medical specialties
- `GET /models` - Get available Grok models

## Environment Variables

The following variables can be set in your `.env` file:

- `FLASK_APP` - Flask application file (default: app.py)
- `FLASK_ENV` - Flask environment (default: development)
- `PORT` - Server port (default: 5002)
- `GROK_API_URL` - Grok API URL (default: https://api.x.ai/v1)
- `GROK_API_KEY` - Your Grok API key (required)
- `SAGECARE_API_URL` - Main SageCare API URL (default: http://localhost:5000/api)

## Usage

1. **Set up environment**:
   ```bash
   python setup_env.py
   ```

2. **Edit .env file** with your API key

3. **Start the service**:
   ```bash
   python startdiagnosis.py
   ```

4. **Test the API**:
   ```bash
   curl http://localhost:5002/health
   ```

## Example Request

```bash
curl -X POST http://localhost:5002/analyze-symptoms \
  -H "Content-Type: application/json" \
  -d '{
    "symptoms": "I have a headache and fever for the past 2 days",
    "severity": "moderate",
    "duration": "2 days",
    "onset": "gradual"
  }'
```

## Troubleshooting

- **API Key not set**: Ensure `GROK_API_KEY` is set in your `.env` file
- **Port 5002 in use**: Change the PORT environment variable
- **Dependencies missing**: Run `pip install -r requirements.txt`
- **Grok API errors**: Check your API key and internet connection

## Benefits of Using Grok

- **Free Tier**: Generous free usage limits
- **High Quality**: Excellent medical reasoning capabilities
- **Easy Setup**: Simple API integration
- **Reliable**: Stable and well-maintained service 