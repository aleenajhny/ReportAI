"""
app/services/ai/research_assistant.py
──────────────────────────────────────
Handles inline editor AI assistance.
Receives only the selected text or a short document excerpt —
never the full LaTeX source — keeping prompts lean.
"""

from __future__ import annotations
import json

from app.core.ai_utils import get_openai_client_and_model
from app.core.prompt_loader import render

_OFFLINE = {
    "answer": "AI assistance is currently offline. Please configure your API key.",
    "suggested_text": None,
    "action": "chat",
}

_CONTEXT_CHAR_LIMIT = 1500  # max chars from full_source if no selection


class ResearchAssistant:
    def assist(
        self,
        prompt: str,
        selected_text: str | None = None,
        full_source: str | None = None,
        api_key: str | None = None,
    ) -> dict:
        try:
            client, model = get_openai_client_and_model(api_key)
        except ValueError:
            return _OFFLINE

        context_block = self._build_context(selected_text, full_source)

        user_prompt = render(
            "research_assist.txt",
            prompt=prompt,
            context_block=context_block,
        )

        try:
            response = client.chat.completions.create(
                model=model,
                messages=[{"role": "user", "content": user_prompt}],
                response_format={"type": "json_object"} if "gemini" not in model.lower() else None,
                max_tokens=1000,
            )
            return json.loads(response.choices[0].message.content.strip())
        except Exception as exc:
            print(f"ResearchAssistant error: {exc}")
            return {"answer": f"Error: {exc}", "suggested_text": None, "action": "chat"}

    # ── helpers ───────────────────────────────────────────────────────────────

    def _build_context(self, selected_text: str | None, full_source: str | None) -> str:
        if selected_text:
            return f"Selected Text:\n{selected_text}"
        if full_source:
            return f"Document excerpt:\n{full_source[:_CONTEXT_CHAR_LIMIT]}"
        return ""