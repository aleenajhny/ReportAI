from uuid import UUID

from fastapi import APIRouter, Depends, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_owned_project
from app.db.session import get_db
from app.models.content import GeneratedContent
from app.models.questionnaire import Questionnaire
from app.models.template import Template
from app.models.user import User
from app.schemas.generation import GenerateContentRequest, GeneratedSectionRead
from app.services.ai_content import AIContentService

router = APIRouter()


@router.post("/project/{project_id}/content", response_model=list[GeneratedSectionRead], status_code=status.HTTP_201_CREATED)
def generate_content(
    project_id: UUID,
    payload: GenerateContentRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> list[GeneratedContent]:
    project = get_owned_project(project_id, user, db)
    template = db.scalar(
        select(Template).where(Template.project_id == project_id).order_by(Template.created_at.desc())
    )
    questionnaire = db.scalar(
        select(Questionnaire)
        .where(Questionnaire.project_id == project_id)
        .order_by(Questionnaire.created_at.desc())
    )

    generated = AIContentService().generate_sections(
        project={
            "title": project.title,
            "domain": project.domain,
            "description": project.description,
        },
        template=template.profile if template else None,
        answers=questionnaire.answers if questionnaire else {},
        sections=payload.sections,
        length=payload.length,
    )
    rows = [
        GeneratedContent(
            project_id=project_id,
            section=item["section"],
            content=item["content"],
            meta=item.get("meta", {}),
        )
        for item in generated
    ]
    db.add_all(rows)
    db.commit()
    for row in rows:
        db.refresh(row)
    return rows
