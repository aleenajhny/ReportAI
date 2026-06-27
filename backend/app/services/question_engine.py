"""
app/services/questionnaire_engine.py
──────────────────────────────────────
Generates domain-specific questionnaires and converts raw
answers into a typed ProjectFacts object.

Rule: question *labels* never leave this module — only IDs and
the resulting ProjectFacts are passed to other services.
"""

from __future__ import annotations

from app.schemas.project import ProjectFacts

# ── static question banks ─────────────────────────────────────────────────────

_COMMON: list[dict] = [
    {"id": "problem_statement", "label": "What problem does your project solve?", "type": "textarea"},
    {"id": "objectives",        "label": "List the main objectives.",              "type": "textarea"},
    {"id": "scope",             "label": "What is included and excluded from scope?", "type": "textarea"},
]

_DOMAIN_QUESTIONS: dict[str, list[dict]] = {
    "ai": [
        {"id": "dataset",           "label": "Dataset used?",          "type": "text"},
        {"id": "model_architecture","label": "Model architecture?",    "type": "text"},
        {"id": "accuracy",          "label": "Accuracy achieved?",     "type": "text"},
    ],
    "iot": [
        {"id": "sensors",    "label": "Sensors used?",               "type": "text"},
        {"id": "controller", "label": "Controller used?",            "type": "text"},
        {"id": "protocol",   "label": "Communication protocol?",     "type": "text"},
    ],
    "web": [
        {"id": "tech_stack",   "label": "Tech stack?",               "type": "text"},
        {"id": "architecture", "label": "Application architecture?", "type": "textarea"},
        {"id": "database",     "label": "Database used?",            "type": "text"},
    ],
}

_GENERIC_EXTRA: list[dict] = [
    {"id": "tools",      "label": "Tools, frameworks, or hardware used?", "type": "textarea"},
    {"id": "evaluation", "label": "How will the project be evaluated?",   "type": "textarea"},
]

# IDs that map to top-level ProjectFacts fields
_CORE_FIELDS = {"problem_statement", "objectives", "scope"}


class QuestionnaireEngine:
    def generate_questions(self, domain: str) -> list[dict]:
        """Return list of question dicts for the frontend form."""
        key = domain.lower()
        for candidate, questions in _DOMAIN_QUESTIONS.items():
            if candidate in key:
                return _COMMON + questions
        return _COMMON + _GENERIC_EXTRA

    def build_project_facts(self, answers: dict[str, str]) -> ProjectFacts:
        """
        Convert raw {id: answer} form submission into a typed ProjectFacts.
        Domain-specific answers land in domain_details.
        """
        core = {k: answers.get(k, "") for k in _CORE_FIELDS}
        domain_details = {k: v for k, v in answers.items() if k not in _CORE_FIELDS}
        return ProjectFacts(**core, domain_details=domain_details)