from uuid import UUID, uuid4
from datetime import datetime, timezone
from pydantic import BaseModel, Field
import asyncpg


def utcnow():
    return datetime.now(timezone.utc)


class DynamicAttributes(BaseModel):
    extra: dict = Field(default_factory=dict)

    def to_storage(self) -> dict:
        return self.extra


class AudioFile(BaseModel):
    id: UUID = Field(default_factory=uuid4)
    original_filename: str
    size_bytes: int
    uploaded_at: datetime = Field(default_factory=utcnow)
    dynamic_attributes: DynamicAttributes = Field(default_factory=DynamicAttributes)

    @property
    def metadata_json(self) -> dict:
        return self.dynamic_attributes.to_storage()

    @classmethod
    def from_row(cls, row: asyncpg.Record) -> "AudioFile":
        metadata = dict(row["metadata"]) if row.get("metadata") else {}
        return cls(
            id=row["id"],
            original_filename=row["original_filename"],
            size_bytes=row["size_bytes"],
            uploaded_at=row["uploaded_at"],
            dynamic_attributes=DynamicAttributes(extra=metadata),
        )

    @classmethod
    def create(
        cls,
        *,
        original_filename: str,
        size_bytes: int,
        extra_attributes: dict | None = None,
    ) -> "AudioFile":
        return cls(
            original_filename=original_filename,
            size_bytes=size_bytes,
            dynamic_attributes=DynamicAttributes(extra=extra_attributes or {}),
        )
