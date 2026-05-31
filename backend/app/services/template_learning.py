from app.services.document_processor import ExtractedDocument


DEFAULT_CHAPTERS = [
    "Abstract",
    "Introduction",
    "Literature Review",
    "Methodology",
    "Results",
    "Conclusion",
]


class TemplateLearningService:
    def learn(self, documents: list[ExtractedDocument]) -> tuple[dict, float]:
        headings: list[str] = []
        for document in documents:
            headings.extend(document.headings)

        chapters = self._normalize_chapters(headings) or DEFAULT_CHAPTERS
        profile = {
            "chapters": chapters,
            "citation": self._detect_citation_style(" ".join(d.text for d in documents)),
            "font": "Times New Roman",
            "spacing": "1.5",
            "heading_hierarchy": ["chapter", "section", "subsection"],
            "page_layout": {"paper": "A4", "margin": "1in"},
        }
        confidence = 0.82 if headings else 0.55
        return profile, confidence

    def _normalize_chapters(self, headings: list[str]) -> list[str]:
        seen = set()
        chapters = []
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
