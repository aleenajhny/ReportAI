from datetime import datetime
from uuid import UUID

from pydantic import BaseModel


class TemplateRead(BaseModel):
    id: UUID
    project_id: UUID
    name: str
    profile: dict
    confidence: float
    created_at: datetime

    model_config = {"from_attributes": True}
