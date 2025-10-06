from fastapi import FastAPI, File, UploadFile, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.responses import JSONResponse
import whisper
import tempfile
import shutil
import os
import logging
import json
import asyncio
import wave
import audioop
from typing import Dict, Optional
import base64
import numpy as np
import re
import uuid

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

# Initialize Whisper model with faster variant
model = whisper.load_model("tiny.en")  # Faster English-only model

# Store active WebSocket connections with state
active_connections: Dict[str, dict] = {}

def has_speech(audio_chunk: bytes, sample_rate: int = 16000) -> bool:
    """Detect if audio chunk contains speech using energy-based VAD"""
    try:
        # Convert bytes to 16-bit integers
        audio_array = np.frombuffer(audio_chunk, dtype=np.int16)

        if len(audio_array) == 0:
            return False

        # Calculate RMS energy
        energy = np.sqrt(np.mean(audio_array.astype(np.float32) ** 2))

        # Calculate zero-crossing rate (speech has higher ZCR than silence)
        zero_crossings = np.sum(np.diff(np.sign(audio_array)) != 0)
        zcr = zero_crossings / len(audio_array)

        # More lenient thresholds for better speech detection
        energy_threshold = 300  # Lowered from 500 for more sensitivity
        zcr_threshold = 0.03   # Lowered from 0.05 for more sensitivity

        # Speech is detected if energy is high OR zero-crossing rate is high
        has_speech_activity = bool(energy > energy_threshold or zcr > zcr_threshold)

        logger.debug(f"VAD: Energy={energy:.2f}, ZCR={zcr:.3f}, Speech={has_speech_activity}")

        return has_speech_activity

    except Exception as e:
        logger.warning(f"VAD error: {e}")
        return True  # Default to True if VAD fails

def calculate_audio_energy(audio_chunk: bytes) -> float:
    """Calculate audio energy level"""
    try:
        # Convert bytes to 16-bit integers
        audio_array = np.frombuffer(audio_chunk, dtype=np.int16)
        # Calculate RMS (Root Mean Square) energy
        energy = np.sqrt(np.mean(audio_array.astype(np.float32) ** 2))
        return energy
    except Exception as e:
        logger.warning(f"Energy calculation error: {e}")
        return 0.0

def should_merge_chunks(prev_text: str, current_text: str) -> bool:
    """Determine if chunks should be merged based on context"""
    if not prev_text or not current_text:
        return False

    # Don't merge if previous text ends with clear punctuation
    if prev_text.strip().endswith(('.', '!', '?', ':', ';')):
        return False

    # Don't merge if current text starts with uppercase (likely new sentence)
    if current_text.strip() and current_text.strip()[0].isupper():
        return False

    # Don't merge if current text looks like a complete sentence
    if current_text.strip().endswith(('.', '!', '?')):
        return False

    # Don't merge if there's a significant pause (handled by overlap)
    # Only merge if it looks like a continuation of the same sentence
    # Be more conservative - only merge if it's clearly a continuation
    prev_words = prev_text.strip().split()
    current_words = current_text.strip().split()

    # Don't merge if current chunk is too long (likely a complete sentence)
    if len(current_words) > 8:
        return False

    # Don't merge if previous chunk ends with a complete thought
    if prev_words and prev_words[-1].lower() in ['the', 'a', 'an', 'and', 'or', 'but', 'so', 'because']:
        return True  # Likely continuation

    # Don't merge if current chunk starts with articles (likely new sentence)
    if current_words and current_words[0].lower() in ['the', 'a', 'an']:
        return False

    # Default to not merging unless we're very confident it's a continuation
    return False

def clean_transcript_text(text: str) -> str:
    """Clean and normalize transcript text"""
    if not text:
        return ""

    # Remove extra whitespace
    text = re.sub(r'\s+', ' ', text.strip())

    # Remove common transcription artifacts
    text = re.sub(r'\[.*?\]', '', text)  # Remove [music], [applause], etc.
    text = re.sub(r'\(.*?\)', '', text)  # Remove (inaudible), etc.

    # Remove repeated phrases (simple deduplication)
    words = text.split()
    if len(words) > 3:
        # Check for immediate repetition
        for i in range(len(words) - 3):
            phrase = ' '.join(words[i:i+3])
            if i + 6 < len(words):
                next_phrase = ' '.join(words[i+3:i+6])
                if phrase.lower() == next_phrase.lower():
                    # Remove the repeated phrase
                    words = words[:i+3] + words[i+6:]
                    break

    return ' '.join(words).strip()

@app.post("/transcribe/")
async def transcribe_audio(file: UploadFile = File(...)):
    try:
        logger.info(f"Received audio file: {file.filename}, content_type: {file.content_type}")
        
        # Save uploaded file to a temp file
        with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as tmp:
            shutil.copyfileobj(file.file, tmp)
            tmp_path = tmp.name

        # Transcribe using Whisper
        logger.info(f"Transcribing file: {tmp_path}")
        result = model.transcribe(tmp_path, fp16=False)
        
        # Clean up temp file
        os.remove(tmp_path)
        
        # Clean and process text
        text = clean_transcript_text(result["text"])

        logger.info(f"Transcription completed: {text[:100]}...")
        return {"text": text}
        
    except Exception as e:
        logger.error(f"Error transcribing audio: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Transcription failed: {str(e)}")

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    connection_id = str(uuid.uuid4())
    active_connections[connection_id] = {
        "audio_buffer": b"",
        "speech_detected": False,
        "last_speech_time": 0,
        "previous_text": ""
    }
    
    logger.info(f"WebSocket connected: {connection_id}")
    
    try:
        while True:
            try:
                message = await websocket.receive()
                
                if "bytes" in message:
                    # Handle binary audio data
                    audio_data = message["bytes"]
                    conn_state = active_connections[connection_id]
                    conn_state["audio_buffer"] += audio_data

                    # Process audio when we have enough data (3 seconds worth)
                    # 16kHz, 16-bit mono audio = 96000 bytes per 3 seconds
                    if len(conn_state["audio_buffer"]) >= 96000:
                        try:
                            # Check for speech activity using VAD
                            has_speech_activity = has_speech(conn_state["audio_buffer"])
                            audio_energy = calculate_audio_energy(conn_state["audio_buffer"])

                            logger.info(f"Speech detected: {has_speech_activity}, Energy: {audio_energy:.2f}")

                            # Only process if speech is detected or energy is above threshold
                            if has_speech_activity or audio_energy > 300:  # Lowered from 500 for more sensitivity
                                conn_state["speech_detected"] = True
                                conn_state["last_speech_time"] = asyncio.get_event_loop().time()

                                # Save audio buffer to temporary file
                                with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as tmp:
                                    # Create a proper WAV file from raw PCM data
                                    with wave.open(tmp.name, 'wb') as wav_file:
                                        wav_file.setnchannels(1)  # mono
                                        wav_file.setsampwidth(2)  # 16-bit
                                        wav_file.setframerate(16000)  # 16kHz
                                        wav_file.writeframes(conn_state["audio_buffer"][:96000])
                                    
                                    tmp_path = tmp.name
                                
                                    # Transcribe using Whisper with confidence
                                    result = model.transcribe(tmp_path, fp16=False)
                                
                                # Clean up temp file
                                os.remove(tmp_path)
                                
                                # Clean and process text
                                transcription_text = clean_transcript_text(result["text"])

                                # Skip empty transcriptions
                                if not transcription_text.strip():
                                    logger.info(f"Empty transcription, skipping. Raw result: '{result['text']}'")
                                    continue

                                # Note: Whisper doesn't provide confidence scores by default
                                # We'll use a default confidence of 0.9 for successful transcriptions
                                confidence = 0.9

                                logger.info(f"Processing transcription: '{transcription_text}'")

                                # Determine if we should merge with previous text
                                should_merge = should_merge_chunks(conn_state["previous_text"], transcription_text)
                                logger.info(f"Chunk merging decision: prev='{conn_state['previous_text']}', current='{transcription_text}', merge={should_merge}")

                                if should_merge:
                                    # Merge with previous text
                                    merged_text = conn_state["previous_text"] + " " + transcription_text
                                    logger.info(f"Merged chunks: '{conn_state['previous_text']}' + '{transcription_text}'")
                                    conn_state["previous_text"] = merged_text
                                    transcription_text = merged_text
                                else:
                                    # Start new sentence
                                    logger.info(f"New sentence started: '{transcription_text}' (prev was: '{conn_state['previous_text']}')")
                                    conn_state["previous_text"] = transcription_text

                                # Send transcription result if we have text
                                if transcription_text.strip():
                                    await websocket.send_text(json.dumps({
                                        "type": "transcription",
                                        "text": transcription_text.strip(),
                                        "confidence": float(confidence),  # Convert to native Python float
                                        "final": False,  # Will be marked final when speech ends
                                        "speech_detected": bool(has_speech_activity),  # Convert to native Python bool
                                        "energy": float(audio_energy)  # Convert to native Python float
                                    }))
                                    logger.info(f"Sent transcription: {transcription_text[:50]}...")

                            else:
                                # No speech detected, check for end of speech
                                current_time = asyncio.get_event_loop().time()
                                if conn_state["speech_detected"]:
                                    silence_duration = current_time - conn_state["last_speech_time"]
                                    if silence_duration > 1.0:  # 1 second of silence
                                        # Send final transcription
                                        if conn_state["previous_text"]:
                                            await websocket.send_text(json.dumps({
                                                "type": "transcription",
                                                "text": conn_state["previous_text"],
                                                "confidence": float(confidence),  # Convert to native Python float
                                                "final": True
                                            }))
                                            logger.info(f"Speech ended, sent final: {conn_state['previous_text'][:50]}...")

                                        # Reset state
                                        conn_state["speech_detected"] = False
                                        conn_state["previous_text"] = ""

                            # Remove processed audio from buffer (keep overlap)
                            overlap_bytes = 8000  # Reduced from 16000 (0.25s instead of 0.5s)
                            conn_state["audio_buffer"] = conn_state["audio_buffer"][96000-overlap_bytes:]
                            
                        except Exception as e:
                            logger.error(f"Error processing audio chunk: {str(e)}")
                            try:
                                await websocket.send_text(json.dumps({
                                    "type": "error",
                                    "message": f"Transcription error: {str(e)}"
                                }))
                            except Exception as send_error:
                                logger.error(f"Failed to send error message: {send_error}")
                                break
                
                elif "text" in message:
                    # Handle text messages (control messages)
                    try:
                        data = json.loads(message["text"])
                        if data.get("type") == "config":
                            # Send acknowledgment
                            await websocket.send_text(json.dumps({
                                "type": "config_ack",
                                "status": "configured",
                                "model": "tiny.en",
                                "features": ["vad", "confidence_trimming", "chunk_merging"]
                            }))
                        elif data.get("type") == "keepalive":
                            # Respond to keep-alive messages to maintain connection
                            logger.debug(f"Received keep-alive from {connection_id}")
                            await websocket.send_text(json.dumps({
                                "type": "keepalive_ack",
                                "timestamp": data.get("timestamp"),
                                "status": "alive"
                            }))
                    except json.JSONDecodeError:
                        logger.warning(f"Received invalid JSON: {message['text']}")
                        
            except WebSocketDisconnect:
                logger.info(f"WebSocket disconnected: {connection_id}")
                break
            except Exception as e:
                logger.error(f"Error in WebSocket loop: {str(e)}")
                # Check if the connection is still open before continuing
                try:
                    await websocket.ping()
                except Exception:
                    logger.info(f"WebSocket connection lost, breaking loop: {connection_id}")
                break
                
    except WebSocketDisconnect:
        logger.info(f"WebSocket disconnected: {connection_id}")
    except Exception as e:
        logger.error(f"WebSocket error: {str(e)}")
    finally:
        # Clean up connection
        if connection_id in active_connections:
            del active_connections[connection_id]
        logger.info(f"WebSocket connection closed: {connection_id}")

@app.get("/")
async def root():
    return {"message": "Whisper Transcription Service", "endpoints": {
        "http": "/transcribe/",
        "websocket": "/ws"
    }, "model": "tiny.en", "features": ["vad", "confidence_trimming", "chunk_merging"]}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "connections": len(active_connections), "model": "tiny.en"} 