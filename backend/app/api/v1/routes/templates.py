from uuid import UUID

from fastapi import APIRouter, Depends, File as UploadFileField, UploadFile, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_owned_project
from app.db.session import get_db
from app.models.file import File
from app.models.template import Template
from app.models.user import User
from app.schemas.template import TemplateRead
from app.services.document_processor import DocumentProcessor
from app.services.storage import StorageService
from app.services.template_learning import TemplateLearningService

router = APIRouter()


@router.get("/project/{project_id}", response_model=list[TemplateRead])
def list_templates(
    project_id: UUID,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> list[Template]:
    get_owned_project(project_id, user, db)
    return list(db.scalars(select(Template).where(Template.project_id == project_id)))


@router.post("/project/{project_id}/learn", response_model=TemplateRead, status_code=status.HTTP_201_CREATED)
async def learn_template(
    project_id: UUID,
    uploads: list[UploadFile] = UploadFileField(...),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> Template:
    get_owned_project(project_id, user, db)
    processor = DocumentProcessor()
    storage = StorageService()
    documents = []

    for upload in uploads:
        content = await upload.read()
        storage_key = storage.put_bytes(content, upload.filename or "upload.bin", upload.content_type or "application/octet-stream")
        db.add(
            File(
                project_id=project_id,
                uploaded_by_id=user.id,
                filename=upload.filename or "upload.bin",
                content_type=upload.content_type or "application/octet-stream",
                storage_key=storage_key,
                purpose="template_source",
                size_bytes=len(content),
            )
        )
        documents.append(processor.extract(upload.filename or "", content))

    profile, confidence = TemplateLearningService().learn(documents)
    template = Template(
        project_id=project_id,
        name="Learned University Template",
        profile=profile,
        confidence=confidence,
    )
    db.add(template)
    db.commit()
    db.refresh(template)
    return template
