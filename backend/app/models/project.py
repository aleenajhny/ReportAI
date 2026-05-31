from sqlalchemy import ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin, UUIDMixin


class Project(UUIDMixin, TimestampMixin, Base):
    __tablename__ = "projects"

    owner_id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), index=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    domain: Mapped[str] = mapped_column(String(100), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    status: Mapped[str] = mapped_column(String(50), default="draft", nullable=False)

    owner: Mapped["User"] = relationship(back_populates="projects")
    files: Mapped[list["File"]] = relationship(back_populates="project", cascade="all, delete-orphan")
    templates: Mapped[list["Template"]] = relationship(back_populates="project", cascade="all, delete-orphan")
    questionnaires: Mapped[list["Questionnaire"]] = relationship(
        back_populates="project", cascade="all, delete-orphan"
    )
    generated_content: Mapped[list["GeneratedContent"]] = relationship(
        back_populates="project", cascade="all, delete-orphan"
    )
    references: Mapped[list["Reference"]] = relationship(
        back_populates="project", cascade="all, delete-orphan"
    )
    reports: Mapped[list["Report"]] = relationship(back_populates="project", cascade="all, delete-orphan")
