# Whisper API for SageCare Consultation

This is a FastAPI-based service that provides real-time speech-to-text transcription using OpenAI's Whisper model.

## Features

- **Real-time transcription** via WebSocket connection
- **HTTP API** for file upload transcription
- **Health monitoring** endpoints
- **16kHz, 16-bit mono audio** processing
- **WebSocket streaming** for live audio transcription

## Quick Start

### 1. Install Dependencies

```bash
cd dev/whisper-api
pip install -r requirements.txt
```

### 2. Start the API Server

```bash
# Option 1: Using the startup script
python start_api.py

# Option 2: Using uvicorn directly
uvicorn whisper_api:app --host 0.0.0.0 --port 8001 --reload
```

### 3. Verify the API is Running

- **Health Check**: http://localhost:8001/health
- **API Info**: http://localhost:8001/
- **WebSocket**: ws://localhost:8001/ws

## API Endpoints

### HTTP Endpoints

- `GET /` - API information
- `GET /health` - Health check
- `POST /transcribe/` - Upload audio file for transcription

### WebSocket Endpoint

- `ws://localhost:8001/ws` - Real-time audio streaming

## WebSocket Protocol

### Client to Server

1. **Connect**: Establish WebSocket connection
2. **Configure**: Send `{"type": "config"}` to initialize
3. **Stream Audio**: Send raw 16-bit PCM audio data (16kHz, mono)
4. **Receive Transcriptions**: Get JSON messages with transcription results

### Server to Client

```json
{
  "type": "transcription",
  "text": "Hello, how are you today?",
  "confidence": 0.9,
  "final": true
}
```

## Audio Format Requirements

- **Sample Rate**: 16kHz
- **Bit Depth**: 16-bit
- **Channels**: Mono (1 channel)
- **Format**: Raw PCM data

## Integration with SageCare

The consultation app automatically:
1. Captures mixed audio (local + remote)
2. Converts to 16-bit PCM format
3. Streams to Whisper API via WebSocket
4. Displays real-time transcriptions

## Troubleshooting

### Common Issues

1. **Port already in use**: Change port in `start_api.py`
2. **Whisper model download**: First run may download the model (~1GB)
3. **Audio format issues**: Ensure 16kHz, 16-bit, mono format
4. **WebSocket connection**: Check firewall and network settings

### Logs

The API provides detailed logging for debugging:
- Connection events
- Audio processing
- Transcription results
- Error messages

## Development

### Model Options

Change the Whisper model in `whisper_api.py`:
```python
model = whisper.load_model("base")  # Options: "tiny", "base", "small", "medium", "large"
```

### Performance Tuning

- **Buffer Size**: Adjust `32000` bytes in WebSocket handler
- **Processing Interval**: Modify the 1-second interval in consultation app
- **Model Size**: Use smaller models for faster processing 