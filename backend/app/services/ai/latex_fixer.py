"""
app/services/ai/latex_fixer.py
───────────────────────────────
Suggests single-line fixes for LaTeX compilation errors.
Tiny prompts: one error + one line of source only.
"""

from __future__ import annotations

from app.core.ai_utils import get_openai_client_and_model
from app.core.prompt_loader import render

# Common heuristic fixes applied without an AI call
_HEURISTICS: list[tuple[str, str]] = [
    ("_", r"\_"),
    ("%", r"\%"),
    ("&", r"\&"),
    ("#", r"\#"),
]


class LaTeXFixer:
    def suggest_fix(
        self,
        error_message: str,
        source_fragment: str,
        api_key: str | None = None,
    ) -> str | None:
        try:
            client, model = get_openai_client_and_model(api_key)
        except ValueError:
            return self._heuristic_fix(source_fragment)

        prompt = render(
            "latex_fix.txt",
            error_message=error_message,
            source_fragment=source_fragment,
        )
        try:
            response = client.chat.completions.create(
                model=model,
                messages=[{"role": "user", "content": prompt}],
                max_tokens=200,
            )
            return response.choices[0].message.content.strip()
        except Exception:
            return self._heuristic_fix(source_fragment)

    def _heuristic_fix(self, fragment: str) -> str | None:
        for raw, escaped in _HEURISTICS:
            if raw in fragment and escaped not in fragment:
                return fragment.replace(raw, escaped)
        return None