# Setting Up Grok API for AI Diagnosis

This guide will help you set up Grok API for the AI Diagnosis service.

## Step 1: Get Grok API Key

1. **Visit x.ai Console**
   - Go to https://console.x.ai/
   - Sign up for a free account (no credit card required)

2. **Navigate to API Keys**
   - After signing in, go to the API Keys section
   - Click "Create New API Key"

3. **Copy Your API Key**
   - Save the API key securely
   - You'll need this for the next steps

## Step 2: Configure Environment Variables

### Option A: Set Environment Variable (Recommended)

**Windows (PowerShell):**
```powershell
$env:GROK_API_KEY="your_api_key_here"
```

**Windows (Command Prompt):**
```cmd
set GROK_API_KEY=your_api_key_here
```

**Linux/Mac:**
```bash
export GROK_API_KEY="your_api_key_here"
```

### Option B: Create .env File

Create a `.env` file in the `ai-diagnosis-api` directory:
```env
GROK_API_KEY=your_api_key_here
GROK_API_URL=https://api.x.ai/v1
SAGECARE_API_URL=http://localhost:5000/api
```

## Step 3: Test the Setup

1. **Start the AI Diagnosis API:**
   ```bash
   python startdiagnosis.py
   ```

2. **Check Health Endpoint:**
   ```bash
   curl http://localhost:5002/health
   ```

3. **Test Symptom Analysis:**
   ```bash
   curl -X POST http://localhost:5002/analyze-symptoms \
     -H "Content-Type: application/json" \
     -d '{
       "symptoms": "I have a headache for the past 2 days",
       "patient_info": {
         "age": 30,
         "gender": "male"
       }
     }'
   ```

## Step 4: Docker Setup (Optional)

If using Docker, set the environment variable:

```bash
export GROK_API_KEY="your_api_key_here"
docker-compose up ai-diagnosis-api
```

## Troubleshooting

### Common Issues:

1. **"API Key not set" error**
   - Ensure `GROK_API_KEY` environment variable is set
   - Restart your terminal after setting the variable

2. **"Unauthorized" error**
   - Check that your API key is correct
   - Ensure you're using the correct API key from x.ai

3. **"Rate limit exceeded"**
   - Grok has generous free limits
   - Check your usage in the x.ai console

4. **Connection errors**
   - Ensure you have internet connection
   - Check if https://api.x.ai is accessible

## Benefits of Grok

- ✅ **Free Tier**: Generous usage limits
- ✅ **High Quality**: Excellent medical reasoning
- ✅ **Easy Setup**: Simple API integration
- ✅ **Reliable**: Stable service
- ✅ **No Local Setup**: No need to install or run local services

## Next Steps

Once Grok is configured:

1. Start the AI Diagnosis API
2. Test with the frontend application
3. Enjoy AI-powered medical diagnosis!

## Support

- **Grok API Documentation**: https://docs.x.ai/
- **x.ai Console**: https://console.x.ai/
- **API Status**: Check https://status.x.ai/ 