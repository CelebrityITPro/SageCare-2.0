# Whisper FastAPI Speech-to-Text API

This service exposes OpenAI's Whisper model as a REST API using FastAPI.

## Setup

1. **Install Python dependencies:**
   ```sh
   pip install -r requirements.txt
   ```

2. **Install ffmpeg:**
   - On Windows: [Download from ffmpeg.org](https://ffmpeg.org/download.html) or use Chocolatey: `choco install ffmpeg`
   - On Mac: `brew install ffmpeg`
   - On Linux: `sudo apt install ffmpeg`

## Running the API

```sh
uvicorn whisper_api:app --host 0.0.0.0 --port 8001
```

## Usage

- **POST /transcribe/**
  - Form field: `file` (audio file, e.g., WAV/MP3/OGG)
  - Returns: `{ "text": "...transcription..." }`

Example with `curl`:
```sh
curl -X POST "http://localhost:8001/transcribe/" -F "file=@your_audio_file.wav"
```

You can also use the interactive docs at [http://localhost:8001/docs](http://localhost:8001/docs) 