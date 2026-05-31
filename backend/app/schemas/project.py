from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field


class ProjectBase(BaseModel):
    title: str = Field(min_length=3, max_length=255)
    domain: str = Field(min_length=2, max_length=100)
    description: str = Field(min_length=10)


class ProjectCreate(ProjectBase):
    pass


class ProjectUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=3, max_length=255)
    domain: str | None = Field(default=None, min_length=2, max_length=100)
    description: str | None = Field(default=None, min_length=10)
    status: str | None = None


class ProjectRead(ProjectBase):
    id: UUID
    status: str
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
