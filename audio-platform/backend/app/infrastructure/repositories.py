import base64
import json
from uuid import UUID
from datetime import datetime
from typing import Optional

from app.domain.entities import AudioFile
from app.infrastructure.database import Database


class AudioFileRepository:
    def __init__(self, db: Database):
        self.db = db

    @staticmethod
    def encode_cursor(ts: datetime, fid: UUID) -> str:
        return base64.urlsafe_b64encode(
            json.dumps({"ts": ts.isoformat(), "id": str(fid)}).encode()
        ).decode()

    @staticmethod
    def decode_cursor(cursor: str):
        p = json.loads(base64.urlsafe_b64decode(cursor.encode()).decode())
        return datetime.fromisoformat(p["ts"]), UUID(p["id"])

    async def save(self, f: AudioFile) -> AudioFile:
        q = (
            "INSERT INTO audio_files "
            "(id, original_filename, size_bytes, uploaded_at, metadata) "
            "VALUES ($1, $2, $3, $4, $5) "
            "RETURNING id, original_filename, size_bytes, uploaded_at, metadata"
        )
        row = await self.db.fetchrow(
            q, f.id, f.original_filename, f.size_bytes, f.uploaded_at, f.metadata_json
        )
        return AudioFile.from_row(row)

    async def get_paginated(
        self, limit: int, cursor: Optional[str] = None
    ) -> dict:
        if cursor:
            ts, lid = self.decode_cursor(cursor)
            q = (
                "SELECT id, original_filename, size_bytes, uploaded_at, metadata "
                "FROM audio_files "
                "WHERE (uploaded_at, id) < ($1, $2) "
                "ORDER BY uploaded_at DESC, id DESC "
                "LIMIT $3"
            )
            rows = await self.db.fetch(q, ts, lid, limit)
        else:
            q = (
                "SELECT id, original_filename, size_bytes, uploaded_at, metadata "
                "FROM audio_files "
                "ORDER BY uploaded_at DESC, id DESC "
                "LIMIT $1"
            )
            rows = await self.db.fetch(q, limit)

        items = [AudioFile.from_row(r) for r in rows]
        next_c = (
            self.encode_cursor(items[-1].uploaded_at, items[-1].id)
            if len(items) == limit
            else None
        )
        return {"items": items, "next_cursor": next_c}
