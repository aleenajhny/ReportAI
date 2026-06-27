from __future__ import annotations

from datetime import datetime
from typing import Any
from uuid import UUID

from pydantic import BaseModel, Field


# =============================================================================
# Existing API Schemas
# =============================================================================

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


# =============================================================================
# Internal Report Generation Schemas
# =============================================================================

class PageLayout(BaseModel):
    paper: str = "A4"
    margin: str = "1in"


class FormatTemplate(BaseModel):
    """
    Structural information extracted from a university template.
    Stores only formatting rules, never the raw document text.
    """

    chapters: list[str] = Field(default_factory=list)
    citation_style: str = "IEEE"
    font: str = "Times New Roman"
    spacing: str = "1.5"
    heading_hierarchy: list[str] = Field(
        default_factory=lambda: ["chapter", "section", "subsection"]
    )
    page_layout: PageLayout = Field(default_factory=PageLayout)


class ContentReferenceTemplate(BaseModel):
    """
    Semantic summary extracted from a reference report or paper.
    """

    summary: str = ""
    key_concepts: list[str] = Field(default_factory=list)
    important_sections: list[str] = Field(default_factory=list)


class ProjectFacts(BaseModel):
    """
    Normalized questionnaire answers.
    Domain-specific answers are stored inside domain_details.
    """

    problem_statement: str = ""
    objectives: str = ""
    scope: str = ""
    domain_details: dict[str, Any] = Field(default_factory=dict)

    def as_prompt_text(self) -> str:
        lines = []

        if self.problem_statement:
            lines.append(f"Problem: {self.problem_statement}")

        if self.objectives:
            lines.append(f"Objectives: {self.objectives}")

        if self.scope:
            lines.append(f"Scope: {self.scope}")

        for key, value in self.domain_details.items():
            if value:
                lines.append(
                    f"{key.replace('_', ' ').title()}: {value}"
                )

        return "\n".join(lines)


class ProjectMetadata(BaseModel):
    """
    Master object shared between AI services.
    Prevents passing multiple dictionaries around the codebase.
    """

    title: str
    domain: str
    description: str = ""

    template_profile: FormatTemplate = Field(default_factory=FormatTemplate)
    content_reference: ContentReferenceTemplate = Field(
        default_factory=ContentReferenceTemplate
    )
    project_facts: ProjectFacts = Field(default_factory=ProjectFacts)

    def chapters(self) -> list[str]:
        return self.template_profile.chapters

    def citation_style(self) -> str:
        return self.template_profile.citation_style