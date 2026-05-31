from fastapi import APIRouter

from app.api.v1.routes import auth, generation, projects, quality, questionnaires, reports, templates

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["authentication"])
api_router.include_router(projects.router, prefix="/projects", tags=["projects"])
api_router.include_router(templates.router, prefix="/templates", tags=["templates"])
api_router.include_router(questionnaires.router, prefix="/questionnaires", tags=["questionnaires"])
api_router.include_router(generation.router, prefix="/generation", tags=["generation"])
api_router.include_router(reports.router, prefix="/reports", tags=["reports"])
api_router.include_router(quality.router, prefix="/quality", tags=["quality"])
