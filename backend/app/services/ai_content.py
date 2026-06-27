from app.core.ai_utils import get_openai_client_and_model
from app.services.report_planner import ReportPlanner

DEFAULT_SECTIONS = [
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


class AIContentService:
    def generate_sections(
        self,
        project: dict,
        template: dict | None,
        answers: dict,
        sections: list[str] | None,
        length: str,
        api_key: str | None = None,
    ) -> list[dict]:

        planner = ReportPlanner()

        plan = planner.create_plan(
            project=project,
            answers=answers,
            template=template,
            api_key=api_key,
        )

        generated_sections = []
        previous_context = ""

        for chapter in plan:

            section = self.generate_chapter(
                chapter=chapter["title"],
                goal=chapter["goal"],
                topics=chapter["topics"],
                expected_length=chapter["expected_length"],
                requires_figures=chapter["requires_figures"],
                requires_table=chapter["requires_table"],
                requires_algorithm=chapter["requires_algorithm"],
                project=project,
                answers=answers,
                previous_context=previous_context,
                length=length,
                api_key=api_key,
            )

            generated_sections.append(section)

            previous_context += "\n\n" + self.summarize_chapter(
                section["content"],
                api_key,
            )

        return generated_sections

    def generate_chapter(
        self,
        chapter: str,
        goal: str,
        topics: list[str],
        expected_length: str,
        requires_figures: bool,
        requires_table: bool,
        requires_algorithm: bool,
        project: dict,
        answers: dict,
        previous_context: str,
        length: str,
        api_key: str | None = None,
    ) -> dict:

        topic_text = "\n".join(f"- {topic}" for topic in topics)

        sections = []

        if answers.get("problem_statement"):
            sections.append(
                f"Problem Statement:\n{answers['problem_statement']}"
            )

        if answers.get("objectives"):
            sections.append(
                f"Objectives:\n{answers['objectives']}"
            )

        if answers.get("scope"):
            sections.append(
                f"Scope:\n{answers['scope']}"
            )

        for key, value in answers.items():

            if key in {
                "problem_statement",
                "objectives",
                "scope",
            }:
                continue

            if value:
                sections.append(
                    f"{key.replace('_', ' ').title()}:\n{value}"
                )

        answer_text = "\n\n".join(sections)

        try:
            client, model = get_openai_client_and_model(api_key)
        except ValueError:
            return self._fallback_section(chapter, project, answers, length)

        prompt = f"""
You are a senior university professor and technical researcher.

Your task is to write ONE chapter of a final-year engineering project report.

===========================================================
PROJECT DETAILS
===========================================================

Title:
{project["title"]}

Domain:
{project["domain"]}

Description:
{project.get("description","")}

===========================================================
PROJECT FACTS
===========================================================

{answer_text}

===========================================================
PREVIOUS CHAPTER SUMMARY
===========================================================

{previous_context}

===========================================================
CURRENT CHAPTER
===========================================================

Title:
{chapter}

Goal:
{goal}

Topics:
{topic_text}

Expected Length:
{expected_length}

Requires Figures:
{requires_figures}

Requires Tables:
{requires_table}

Requires Algorithms:
{requires_algorithm}

===========================================================
WRITING RULES
===========================================================

• Write ONLY this chapter.

• Do NOT write any other chapter.

• Do NOT generate \\chapter{{}}.

• Begin directly with appropriate \\section{{}} and \\subsection{{}} headings.

• Follow the writing style of a real university dissertation.

• Explain every concept before discussing implementation.

• Never write generic filler text.

• Never repeat information already discussed.

• Every subsection should naturally lead into the next.

• Explain WHY each design decision was made.

• Include implementation details whenever possible.

• Discuss advantages and limitations where appropriate.

• Mention figures using:
Figure~\\ref{{fig:architecture}}

• Mention tables using:
Table~\\ref{{tab:comparison}}

• Mention algorithms using:
Algorithm~\\ref{{alg:workflow}}

• Add citation placeholders:
\\cite{{ref1}}

• Do NOT invent numerical experimental results.

• Do NOT use bullet points unless absolutely necessary.

• Use long academic paragraphs.

• The output should resemble a publishable university report.

Return ONLY valid LaTeX.
"""
        try:
            response = client.chat.completions.create(
                model=model,
                messages=[
                    {
                        "role": "system",
                        "content": "You are an expert academic report writer.",
                    },
                    {
                        "role": "user",
                        "content": prompt,
                    },
                ],
            )

            return {
                "section": chapter,
                "content": response.choices[0].message.content.strip(),
            }

        except Exception:
            return self._fallback_section(chapter, project, answers, length)

    def summarize_chapter(
        self,
        chapter_content: str,
        api_key: str | None = None,
    ) -> str:

        try:
            client, model = get_openai_client_and_model(api_key)

            response = client.chat.completions.create(
                model=model,
                messages=[
                    {
                        "role": "system",
                        "content": "Summarize this chapter in under 120 words.",
                    },
                    {
                        "role": "user",
                        "content": chapter_content,
                    },
                ],
                max_tokens=180,
            )

            return response.choices[0].message.content.strip()

        except Exception:
            return ""

    def _fallback_section(
        self,
        chapter: str,
        project: dict,
        answers: dict,
        length: str,
    ) -> dict:
        return {
            "section": chapter,
            "content": (
                f"\\section{{{chapter}}}\n"
                f"This section describes the {chapter.lower()} of "
                f"{project['title']}. Further technical details should be added."
            ),
        }

    def research_assist(
        self,
        prompt: str,
        selected_text: str | None,
        full_source: str | None,
        api_key: str | None = None,
    ):
        return {
            "answer": "Research assistant is temporarily unavailable.",
            "suggested_text": None,
            "action": "chat",
        }

    def suggest_fix(
        self,
        error_message: str,
        source_fragment: str,
        api_key: str | None = None,
    ):
        return source_fragment