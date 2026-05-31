from datetime import datetime
from uuid import UUID

from pydantic import BaseModel


class QuestionnaireRead(BaseModel):
    id: UUID
    project_id: UUID
    questions: list[dict]
    answers: dict
    created_at: datetime

    model_config = {"from_attributes": True}


class QuestionnaireAnswerUpdate(BaseModel):
    answers: dict
