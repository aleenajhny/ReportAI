"""
app/services/template_learning.py
───────────────────────────────────
Learns a FormatTemplate and ContentReferenceTemplate from uploaded
reference documents. Returns typed schema objects — never raw text —
so downstream services never need to reload the original documents.
"""

from __future__ import annotations

from app.schemas.project import (
    ContentReferenceTemplate,
    FormatTemplate,
    PageLayout,
)


class TemplateLearningService:
    def learn(
        self, documents: list  # list[ExtractedDocument]
    ) -> tuple[FormatTemplate, ContentReferenceTemplate, float]:
        """
        Returns:
            format_template      – structural rules only (no text blobs)
            content_reference    – semantic summary (no text blobs)
            confidence           – float 0–1
        """
        headings: list[str] = []
        all_text_parts: list[str] = []

        for doc in documents:
            headings.extend(doc.headings)
            all_text_parts.append(doc.text[:2000])  # cap per-doc contribution

        combined_text = " ".join(all_text_parts)

        format_template = FormatTemplate(
            chapters=self._normalize_chapters(headings),
            citation_style=self._detect_citation_style(combined_text),
            font="Times New Roman",
            spacing="1.5",
            heading_hierarchy=["chapter", "section", "subsection"],
            page_layout=PageLayout(paper="A4", margin="1in"),
        )

        content_reference = ContentReferenceTemplate(
            summary=self._summarize(combined_text),
            key_concepts=self._extract_concepts(headings),
            important_sections=format_template.chapters[:5],
        )

        confidence = 0.82 if headings else 0.55
        return format_template, content_reference, confidence

    # ── private helpers ───────────────────────────────────────────────────────

    def _normalize_chapters(self, headings: list[str]) -> list[str]:
        seen: set[str] = set()
        chapters: list[str] = []
        for heading in headings:
            clean = heading.strip(" .:-0123456789")
            if 3 <= len(clean) <= 80 and clean.lower() not in seen:
                seen.add(clean.lower())
                chapters.append(clean)
        return chapters[:12]

    def _detect_citation_style(self, text: str) -> str:
        if "[" in text and "]" in text:
            return "IEEE"
        if "(" in text and "," in text and ")" in text:
            return "APA"
        return "IEEE"

    def _summarize(self, text: str) -> str:
        """Naive extractive summary — replace with AI call if needed."""
        sentences = [s.strip() for s in text.split(".") if len(s.strip()) > 40]
        return ". ".join(sentences[:3]) + "." if sentences else ""

    def _extract_concepts(self, headings: list[str]) -> list[str]:
        return [h.strip(" .:-0123456789") for h in headings if len(h.strip()) > 3][:8]