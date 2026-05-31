from uuid import UUID

from fastapi import APIRouter, Depends, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_owned_project
from app.db.session import get_db
from app.models.questionnaire import Questionnaire
from app.models.user import User
from app.schemas.questionnaire import QuestionnaireAnswerUpdate, QuestionnaireRead
from app.services.question_engine import QuestionnaireEngine

router = APIRouter()


@router.post("/project/{project_id}", response_model=QuestionnaireRead, status_code=status.HTTP_201_CREATED)
def create_questionnaire(
    project_id: UUID,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> Questionnaire:
    project = get_owned_project(project_id, user, db)
    questions = QuestionnaireEngine().generate(project.domain)
    questionnaire = Questionnaire(project_id=project_id, questions=questions, answers={})
    db.add(questionnaire)
    db.commit()
    db.refresh(questionnaire)
    return questionnaire


@router.get("/project/{project_id}", response_model=list[QuestionnaireRead])
def list_questionnaires(
    project_id: UUID,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> list[Questionnaire]:
    get_owned_project(project_id, user, db)
    return list(db.scalars(select(Questionnaire).where(Questionnaire.project_id == project_id)))


@router.patch("/{questionnaire_id}", response_model=QuestionnaireRead)
def update_answers(
    questionnaire_id: UUID,
    payload: QuestionnaireAnswerUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> Questionnaire:
    questionnaire = db.get(Questionnaire, questionnaire_id)
    if questionnaire is None:
        from fastapi import HTTPException

        raise HTTPException(status_code=404, detail="Questionnaire not found")
    get_owned_project(questionnaire.project_id, user, db)
    questionnaire.answers = payload.answers
    db.commit()
    db.refresh(questionnaire)
    return questionnaire
