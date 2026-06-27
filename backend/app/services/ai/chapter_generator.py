"""
app/services/ai/chapter_generator.py
─────────────────────────────────────
Generates individual chapter LaTeX content.
Receives only the minimal context each chapter needs.
"""

from __future__ import annotations
import json

from app.core.ai_utils import get_openai_client_and_model
from app.core.prompt_loader import render
from app.schemas.project import ProjectMetadata


class ChapterGenerator:
    """
    Generates one chapter at a time.

    Keeping generation per-chapter (rather than all-at-once) means:
    - Smaller prompts → fewer tokens per call
    - Failed chapters can be retried individually
    - Partial results are usable immediately
    """

    def generate(
        self,
        section: str,
        metadata: ProjectMetadata,
        length: str = "medium",
        api_key: str | None = None,
    ) -> dict:
        try:
            client, model = get_openai_client_and_model(api_key)
        except ValueError:
            return self._fallback(section, metadata, length)

        prompt = render(
            "chapter_generation.txt",
            section=section,
            domain=metadata.domain,
            project_facts=metadata.project_facts.as_prompt_text(),
            citation_style=metadata.citation_style(),
            heading_hierarchy=", ".join(metadata.template_profile.heading_hierarchy),
            length=length,
        )

        try:
            response = client.chat.completions.create(
                model=model,
                messages=[{"role": "user", "content": prompt}],
                max_tokens=2000,
            )
            content = response.choices[0].message.content.strip()
            return {"section": section, "content": content}
        except Exception as exc:
            print(f"ChapterGenerator error ({section}): {exc}")
            return self._fallback(section, metadata, length)

    def generate_all(
        self,
        sections: list[str],
        metadata: ProjectMetadata,
        length: str = "medium",
        api_key: str | None = None,
    ) -> list[dict]:
        return [self.generate(s, metadata, length, api_key) for s in sections]

    # ── fallback ──────────────────────────────────────────────────────────────

    def _fallback(self, section: str, metadata: ProjectMetadata, length: str) -> dict:
        content = (
            f"\\section{{{section}}}\n"
            f"This {length} draft section describes {metadata.title} "
            f"in the context of {metadata.domain}. "
            f"Expand with evidence, implementation details, results, and citations.\n"
            f"{metadata.project_facts.as_prompt_text()}"
        )
        return {"section": section, "content": content, "meta": {"mode": "offline-fallback"}}