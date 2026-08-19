import uuid
import asyncio

from fastapi import APIRouter, File, UploadFile, HTTPException, Query
from pydantic import BaseModel
from typing import Optional, List

from app.infrastructure.repositories import AudioFileRepository
from app.infrastructure.database import get_db
from app.domain.entities import AudioFile


router = APIRouter(prefix="/api/v1/audio", tags=["audio"])


class AudioFileResponse(BaseModel):
    id: uuid.UUID
    original_filename: str
    size_bytes: int
    uploaded_at: str
    metadata: dict


class ProcessResponse(BaseModel):
    status: str
    input_id: uuid.UUID
    result_id: Optional[uuid.UUID] = None


class PaginatedResponse(BaseModel):
    items: List[AudioFileResponse]
    next_cursor: Optional[str] = None


@router.post("/process", response_model=ProcessResponse)
async def process_audio(file: UploadFile = File(...)):
    content = await file.read()
    if not content:
        raise HTTPException(status_code=400, detail="Empty file")

    repo = AudioFileRepository(get_db())
    audio_file = AudioFile.create(
        original_filename=file.filename or "unknown",
        size_bytes=len(content),
        extra_attributes={"type": file.content_type},
    )
    saved = await repo.save(audio_file)

    # Simulacion de procesamiento
    await asyncio.sleep(0.1)

    return ProcessResponse(
        status="processing",
        input_id=saved.id,
        result_id=uuid.uuid4(),
    )


@router.get("/files", response_model=PaginatedResponse)
async def get_files(
    limit: int = Query(10, ge=1, le=100),
    cursor: Optional[str] = None,
):
    repo = AudioFileRepository(get_db())
    page = await repo.get_paginated(limit, cursor)
    return {
        "items": [
            AudioFileResponse(
                id=f.id,
                original_filename=f.original_filename,
                size_bytes=f.size_bytes,
                uploaded_at=f.uploaded_at.isoformat(),
                metadata=f.metadata_json,
            )
            for f in page["items"]
        ],
        "next_cursor": page["next_cursor"],
    }
