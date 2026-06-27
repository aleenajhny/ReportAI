"""
app/services/report_orchestrator.py
─────────────────────────────────────
Thin orchestrator that wires the modular AI services together.
API routes should depend on this — not on individual AI services directly.

Context budget per operation
─────────────────────────────
generate_report  →  ProjectMetadata (lean) + chapter prompt × N
research_assist  →  selected_text (≤ 1 500 chars) + user prompt
fix_error        →  one error message + one source line
"""

from __future__ import annotations

from app.schemas.project import ProjectMetadata
from app.services.ai.chapter_generator import ChapterGenerator
from app.services.ai.latex_fixer import LaTeXFixer
from app.services.ai.research_assistant import ResearchAssistant

_DEFAULT_SECTIONS = [
    "Abstract",
    "Acknowledgement",
    "Introduction",
    "Literature Review",
    "System Analysis",
    "System Design",
    "Methodology",
    "Implementation",
    "Testing",
    "Results",
    "Conclusion",
    "Future Scope",
]


class ReportOrchestrator:
    def __init__(self) -> None:
        self._chapter_gen  = ChapterGenerator()
        self._researcher   = ResearchAssistant()
        self._latex_fixer  = LaTeXFixer()

    # ── public API ────────────────────────────────────────────────────────────

    def generate_report(
        self,
        metadata: ProjectMetadata,
        sections: list[str] | None = None,
        length: str = "medium",
        api_key: str | None = None,
    ) -> list[dict]:
        target = sections or metadata.chapters() or _DEFAULT_SECTIONS
        return self._chapter_gen.generate_all(target, metadata, length, api_key)

    def research_assist(
        self,
        prompt: str,
        selected_text: str | None = None,
        full_source: str | None = None,
        api_key: str | None = None,
    ) -> dict:
        return self._researcher.assist(prompt, selected_text, full_source, api_key)

    def fix_latex_error(
        self,
        error_message: str,
        source_fragment: str,
        api_key: str | None = None,
    ) -> str | None:
        return self._latex_fixer.suggest_fix(error_message, source_fragment, api_key)