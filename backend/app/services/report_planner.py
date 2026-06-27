from __future__ import annotations

import json

from app.core.ai_utils import get_openai_client_and_model


class ReportPlanner:

    DEFAULT_PLAN = [
        {
            "title": "Abstract",
            "goal": "Summarize the entire project.",
            "topics": ["Problem", "Objectives", "Methodology", "Results"],
            "expected_length": "500 words",
            "requires_figures": False,
            "requires_table": False,
            "requires_algorithm": False,
            "depends_on": [],
        },
        {
            "title": "Introduction",
            "goal": "Introduce the project and motivate the problem.",
            "topics": [
                "Background",
                "Problem Statement",
                "Objectives",
                "Scope",
            ],
            "expected_length": "1200 words",
            "requires_figures": False,
            "requires_table": False,
            "requires_algorithm": False,
            "depends_on": ["Abstract"],
        },
        {
            "title": "Literature Review",
            "goal": "Review previous work.",
            "topics": [
                "Existing Systems",
                "Research Papers",
                "Comparison",
                "Research Gap",
            ],
            "expected_length": "1800 words",
            "requires_figures": False,
            "requires_table": True,
            "requires_algorithm": False,
            "depends_on": ["Introduction"],
        },
        {
            "title": "System Analysis",
            "goal": "Describe the proposed solution.",
            "topics": [
                "Existing System",
                "Proposed System",
                "Requirements",
                "Feasibility",
            ],
            "expected_length": "1500 words",
            "requires_figures": True,
            "requires_table": False,
            "requires_algorithm": False,
            "depends_on": ["Literature Review"],
        },
        {
            "title": "System Design",
            "goal": "Explain the architecture.",
            "topics": [
                "Architecture",
                "Modules",
                "Database Design",
                "Sequence Diagram",
                "Class Diagram",
            ],
            "expected_length": "2000 words",
            "requires_figures": True,
            "requires_table": True,
            "requires_algorithm": False,
            "depends_on": ["System Analysis"],
        },
        {
            "title": "Methodology",
            "goal": "Explain implementation methodology.",
            "topics": [
                "Workflow",
                "Algorithms",
                "Technology Stack",
                "Development Process",
            ],
            "expected_length": "2200 words",
            "requires_figures": True,
            "requires_table": False,
            "requires_algorithm": True,
            "depends_on": ["System Design"],
        },
        {
            "title": "Implementation",
            "goal": "Explain software implementation.",
            "topics": [
                "Frontend",
                "Backend",
                "Database",
                "Authentication",
                "API",
            ],
            "expected_length": "2500 words",
            "requires_figures": True,
            "requires_table": False,
            "requires_algorithm": True,
            "depends_on": ["Methodology"],
        },
        {
            "title": "Testing",
            "goal": "Validate the project.",
            "topics": [
                "Unit Testing",
                "Integration Testing",
                "Performance",
                "Test Cases",
            ],
            "expected_length": "1500 words",
            "requires_figures": True,
            "requires_table": True,
            "requires_algorithm": False,
            "depends_on": ["Implementation"],
        },
        {
            "title": "Results",
            "goal": "Present experimental results.",
            "topics": [
                "Outputs",
                "Performance",
                "Comparison",
                "Analysis",
            ],
            "expected_length": "1500 words",
            "requires_figures": True,
            "requires_table": True,
            "requires_algorithm": False,
            "depends_on": ["Testing"],
        },
        {
            "title": "Conclusion",
            "goal": "Summarize achievements and future work.",
            "topics": [
                "Achievements",
                "Limitations",
                "Future Scope",
            ],
            "expected_length": "800 words",
            "requires_figures": False,
            "requires_table": False,
            "requires_algorithm": False,
            "depends_on": ["Results"],
        },
    ]

    def create_plan(
        self,
        project: dict,
        answers: dict,
        template: dict | None,
        api_key: str | None = None,
    ):

        try:
            client, model = get_openai_client_and_model(api_key)

            prompt = f"""
You are an expert academic report planner.

Generate a report plan for:

Title:
{project['title']}

Domain:
{project['domain']}

Description:
{project.get('description','')}

Questionnaire:
{json.dumps(answers, indent=2)}

Return ONLY JSON.

Each chapter must contain

- title
- goal
- topics
- expected_length
- requires_figures
- requires_table
- requires_algorithm
- depends_on
"""

            response = client.chat.completions.create(
                model=model,
                messages=[
                    {
                        "role": "system",
                        "content": "Return only JSON.",
                    },
                    {
                        "role": "user",
                        "content": prompt,
                    },
                ],
                response_format={"type": "json_object"} if "gemini" not in model.lower() else None,
            )

            data = json.loads(
                response.choices[0].message.content
            )

            return data["chapters"]

        except Exception:
            return self.DEFAULT_PLAN