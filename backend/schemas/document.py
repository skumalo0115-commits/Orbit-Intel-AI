from datetime import datetime
from typing import Any

from pydantic import BaseModel


class DocumentResponse(BaseModel):
    id: int
    filename: str
    upload_date: datetime

    class Config:
        from_attributes = True


class DocumentDetailResponse(DocumentResponse):
    text: str | None = None


class AnalysisResponse(BaseModel):
    document_id: int
    summary: str | None
    classification: str | None
    entities: list[dict[str, Any]] | None
    embeddings: list[float] | None
    insights: dict[str, Any] | None
