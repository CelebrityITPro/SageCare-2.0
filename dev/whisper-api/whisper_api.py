from fastapi import FastAPI, File, UploadFile
import whisper
import tempfile
import shutil
import os

app = FastAPI()
model = whisper.load_model("base")  # You can change to 'small', 'medium', 'large' as needed

@app.post("/transcribe/")
async def transcribe_audio(file: UploadFile = File(...)):
    # Save uploaded file to a temp file
    with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as tmp:
        shutil.copyfileobj(file.file, tmp)
        tmp_path = tmp.name

    # Transcribe using Whisper
    result = model.transcribe(tmp_path)
    os.remove(tmp_path)
    return {"text": result["text"]} 