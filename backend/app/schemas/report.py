from datetime import datetime
from uuid import UUID

from pydantic import BaseModel


class ReportRead(BaseModel):
    id: UUID
    project_id: UUID
    version: int
    status: str
    latex_storage_key: str | None
    pdf_storage_key: str | None
    compile_log: str | None
    quality_score: float | None
    quality_feedback: dict
    created_at: datetime

    model_config = {"from_attributes": True}


class CompileResult(BaseModel):
    ok: bool
    log: str
    pdf_storage_key: str | None = None
