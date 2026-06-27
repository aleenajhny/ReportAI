"""
app/core/prompt_loader.py
─────────────────────────
Load and render prompt templates from the prompts/ directory.
Keeps prompt text out of Python source files and out of Claude context
during development — only the template being edited need ever be loaded.
"""

from __future__ import annotations
from functools import lru_cache
from pathlib import Path

PROMPTS_DIR = Path(__file__).parent.parent / "prompts"


@lru_cache(maxsize=None)
def _load(name: str) -> str:
    """Read prompt file once and cache in memory."""
    path = PROMPTS_DIR / name
    if not path.exists():
        raise FileNotFoundError(f"Prompt file not found: {path}")
    return path.read_text(encoding="utf-8")


def render(name: str, **kwargs: object) -> str:
    """
    Load a prompt template and substitute named placeholders.

    Usage:
        render("report_generation.txt",
               sections="Abstract, Introduction",
               title="Smart Irrigation System",
               domain="IoT",
               project_facts=facts.as_prompt_text(),
               length="medium")
    """
    template = _load(name)
    return template.format(**kwargs)