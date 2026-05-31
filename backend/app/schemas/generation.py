from uuid import UUID

from pydantic import BaseModel, Field


class GenerateContentRequest(BaseModel):
    length: str = Field(default="standard", pattern="^(brief|standard|detailed)$")
    sections: list[str] | None = None


class GeneratedSectionRead(BaseModel):
    id: UUID
    section: str
    content: str
    meta: dict

    model_config = {"from_attributes": True}
