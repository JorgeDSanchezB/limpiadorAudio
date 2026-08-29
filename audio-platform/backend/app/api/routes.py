"""API local para procesar audios sin enviar archivos a internet."""

from __future__ import annotations

import os
import shutil
import subprocess
import sys
import uuid
from datetime import datetime, timezone
from pathlib import Path

from fastapi import APIRouter, File, HTTPException, UploadFile
from fastapi.responses import FileResponse
from pydantic import BaseModel


router = APIRouter(prefix="/api/v1/audio", tags=["audio"])
MAX_FILE_SIZE = 500 * 1024 * 1024
SUPPORTED_EXTENSIONS = {".wav", ".mp3", ".m4a", ".aac", ".flac", ".ogg"}
DATA_DIR = Path(__file__).resolve().parents[2] / "data"
INPUT_DIR = DATA_DIR / "inputs"
OUTPUT_DIR = DATA_DIR / "outputs"
BACKEND_DIR = Path(__file__).resolve().parents[2]
MODEL_DIR = BACKEND_DIR / "models"
MODEL_FILE = "std.rnnn"


class AudioFileResponse(BaseModel):
    id: str
    original_filename: str
    size_bytes: int
    uploaded_at: str
    status: str
    download_url: str | None = None


class ProcessResponse(AudioFileResponse):
    message: str


processed_files: list[dict] = []


def ensure_directories() -> None:
    INPUT_DIR.mkdir(parents=True, exist_ok=True)
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)


def find_ffmpeg() -> str:
    executable = os.environ.get("FFMPEG_PATH") or shutil.which("ffmpeg")
    if not executable and getattr(sys, "frozen", False):
        bundled = Path(sys._MEIPASS) / "ffmpeg.exe"
        if bundled.is_file():
            executable = str(bundled)
    if not executable and os.name == "nt":
        packages = Path(os.environ.get("LOCALAPPDATA", "")) / "Microsoft" / "WinGet" / "Packages"
        if packages.is_dir():
            candidates = list(packages.glob("Gyan.FFmpeg*/ffmpeg-*/bin/ffmpeg.exe"))
            if candidates:
                executable = str(candidates[0])
    if not executable:
        raise HTTPException(
            status_code=503,
            detail="No se encontró FFmpeg. Instálalo y vuelve a abrir la aplicación. Usa: winget install Gyan.FFmpeg",
        )
    return executable


async def save_upload(upload: UploadFile, destination: Path) -> int:
    total = 0
    with destination.open("wb") as target:
        while chunk := await upload.read(1024 * 1024):
            total += len(chunk)
            if total > MAX_FILE_SIZE:
                target.close()
                destination.unlink(missing_ok=True)
                raise HTTPException(status_code=413, detail="El audio supera el límite de 500 MB.")
            target.write(chunk)
    return total


def find_model_dir() -> Path:
    if getattr(sys, "frozen", False) and hasattr(sys, "_MEIPASS"):
        bundled = Path(sys._MEIPASS) / "models"
        if (bundled / MODEL_FILE).is_file():
            return bundled
    if (MODEL_DIR / MODEL_FILE).is_file():
        return MODEL_DIR
    raise HTTPException(
        status_code=503,
        detail="No se encontró el modelo de reducción de ruido. Reinstala la aplicación.",
    )


def clean_audio(input_path: Path, output_path: Path) -> None:
    """Reduce ruido de voz con red neuronal (RNNoise) y conserva el rango de la voz."""
    model_dir = find_model_dir()
    filters = (
        f"arnndn=m={MODEL_FILE},"
        "highpass=f=80,lowpass=f=12000,"
        "alimiter=limit=0.95,"
        "dynaudnorm=f=150:g=9:p=0.9"
    )
    command = [
        find_ffmpeg(), "-y", "-threads", "1", "-i", str(input_path),
        "-vn", "-af", filters,
        "-ar", "48000", "-ac", "1", "-c:a", "libmp3lame", "-b:a", "192k", str(output_path),
    ]
    result = subprocess.run(command, capture_output=True, text=True, timeout=60 * 30, cwd=str(model_dir))
    if result.returncode != 0:
        output_path.unlink(missing_ok=True)
        details = result.stderr.strip().splitlines()[-1] if result.stderr else "Error desconocido de FFmpeg"
        raise HTTPException(status_code=422, detail=f"No se pudo procesar este audio: {details}")


@router.post("/process", response_model=ProcessResponse)
async def process_audio(file: UploadFile = File(...)):
    filename = file.filename or "audio"
    extension = Path(filename).suffix.lower()
    if extension not in SUPPORTED_EXTENSIONS:
        raise HTTPException(status_code=415, detail="Formato no compatible. Usa WAV, MP3, M4A, AAC, FLAC u OGG.")

    ensure_directories()
    job_id = str(uuid.uuid4())
    input_path = INPUT_DIR / f"{job_id}{extension}"
    output_path = OUTPUT_DIR / f"{job_id}-limpio.mp3"
    size_bytes = await save_upload(file, input_path)
    try:
        clean_audio(input_path, output_path)
    finally:
        input_path.unlink(missing_ok=True)

    record = {
        "id": job_id,
        "original_filename": filename,
        "size_bytes": size_bytes,
        "uploaded_at": datetime.now(timezone.utc).isoformat(),
        "status": "completed",
        "download_url": f"/audio/download/{job_id}",
    }
    processed_files.insert(0, record)
    return ProcessResponse(**record, message="Audio limpio creado correctamente.")


@router.get("/files", response_model=list[AudioFileResponse])
async def get_files():
    return processed_files


@router.get("/download/{job_id}")
async def download_audio(job_id: str):
    output_path = OUTPUT_DIR / f"{job_id}-limpio.mp3"
    if not output_path.is_file():
        raise HTTPException(status_code=404, detail="El archivo procesado ya no está disponible.")
    return FileResponse(output_path, media_type="audio/mpeg", filename="audio-limpio.mp3")


@router.delete("/files/{job_id}")
async def delete_audio(job_id: str):
    for index, record in enumerate(processed_files):
        if record["id"] == job_id:
            processed_files.pop(index)
            (OUTPUT_DIR / f"{job_id}-limpio.mp3").unlink(missing_ok=True)
            return {"deleted": True}
    raise HTTPException(status_code=404, detail="El audio procesado ya no está disponible.")


@router.delete("/files")
async def clear_files():
    for record in processed_files:
        (OUTPUT_DIR / f"{record['id']}-limpio.mp3").unlink(missing_ok=True)
    processed_files.clear()
    return {"deleted": True}
