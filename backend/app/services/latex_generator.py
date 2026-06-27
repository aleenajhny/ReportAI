from __future__ import annotations

from typing import Dict, List, Tuple


class LaTeXGenerator:
    """
    Builds a complete LaTeX document from structured section dicts.
    Used by the authenticated /project/{id}/content route via reports.py.
    """

    CHAPTER_INTROS: dict[str, str] = {
        "Abstract": (
            "This report presents the design, development, and evaluation of "
            r"\textbf{{{title}}}, an academic project in the domain of {domain}. "
            "The work addresses a focused problem, proposes a systematic solution, "
            "and validates outcomes through structured testing and analysis."
        ),
        "Introduction": (
            r"This chapter establishes the context and motivation for \textbf{{{title}}}. "
            r"It outlines the identified problem, the proposed approach, the project scope, "
            r"and the structural organisation of this report."
        ),
        "Literature Review": (
            r"A systematic review of existing literature and prior research in the domain of "
            r"{domain} was conducted to identify gaps and inform the design decisions "
            r"adopted in \textbf{{{title}}}."
        ),
        "Methodology": (
            r"This chapter describes the theoretical foundations, algorithms, and "
            r"experimental configurations adopted to develop and validate \textbf{{{title}}}."
        ),
        "Implementation": (
            r"The implementation chapter documents the development environment, "
            r"software and hardware configurations, and integration steps realised "
            r"for \textbf{{{title}}}."
        ),
        "Testing": (
            r"Validation and verification tests were systematically conducted to confirm "
            r"the correctness and reliability of \textbf{{{title}}}. This chapter covers "
            r"unit testing, integration testing, and scenario-based verification."
        ),
        "Results": (
            r"This chapter presents the experimental outcomes, performance metrics, and "
            r"comparative evaluations obtained from testing \textbf{{{title}}}."
        ),
        "Conclusion": (
            r"This chapter summarises the research contributions, outcomes achieved, "
            r"and lessons learned during the development of \textbf{{{title}}}."
        ),
        "Future Scope": (
            r"This chapter outlines potential enhancements and research directions "
            r"that could extend the capabilities of \textbf{{{title}}} in future work."
        ),
    }

    def render_report(
        self,
        project: dict,
        sections: list[dict],
        references_bib: str = "",
        citation_style: str = "IEEEtran",
        spacing: str = "1.5",
    ) -> tuple[str, dict[int, str]]:
        title = project["title"]
        domain = project.get("domain", "")

        spacing_cmd = self._spacing_command(spacing)
        bib_style   = self._bib_style(citation_style)

        header = rf"""
\documentclass[12pt,a4paper]{{report}}

% ---------------- Packages ----------------
\usepackage[a4paper,margin=1in]{{geometry}}
\usepackage{{graphicx}}
\usepackage{{setspace}}
\usepackage{{titlesec}}
\usepackage[hidelinks]{{hyperref}}
\usepackage{{tocloft}}
\usepackage{{fancyhdr}}
\usepackage{{booktabs}}
\usepackage{{caption}}
\usepackage{{float}}
\usepackage{{amsmath}}
\usepackage{{amssymb}}

\onehalfspacing

% ---------------- Chapter Style ----------------
\titleformat{{\chapter}}
{{\Huge\bfseries}}
{{Chapter \thechapter}}
{{20pt}}
{{}}

% ---------------- Header & Footer ----------------
\pagestyle{{fancy}}
\fancyhf{{}}
\fancyfoot[C]{{\thepage}}
\fancyfoot[R]{{Dept. of Computer Engineering}}
\renewcommand{{\headrulewidth}}{{0pt}}

% ---------------- TOC Style ----------------
\renewcommand{{\cftchapfont}}{{\bfseries}}
\renewcommand{{\cftchappagefont}}{{\bfseries}}

% ---------------- Document ----------------
\begin{{document}}

% ---------------- Title Page ----------------
\begin{{titlepage}}

\centering

\vspace*{{2cm}}

{{\Huge\bfseries {project["title"]}\par}}

\vspace{{1cm}}

{{\Large Academic Project Report}}

\vspace{{2cm}}

Prepared using

\vspace{{0.3cm}}

{{\Large ReportAI}}

\vfill

Generated on

\vspace{{0.3cm}}

{{\large \today}}

\end{{titlepage}}

% ---------------- Front Matter ----------------

\pagenumbering{{roman}}

\chapter*{{Certificate}}

This is to certify that the project report entitled
\textbf{{{project["title"]}}}
is submitted in partial fulfilment of the requirements for the award of the degree.

\vspace{{2cm}}

\noindent
Project Guide \hfill Head of Department

\clearpage

\chapter*{{Declaration}}

I hereby declare that this report is my original work and has not been submitted elsewhere.

\clearpage

\chapter*{{Acknowledgement}}

The author sincerely thanks the project guide, faculty members, institution and everyone who contributed towards the successful completion of this work.

\clearpage

\tableofcontents

\clearpage

\listoffigures

\clearpage

\listoftables

\clearpage

\pagenumbering{{arabic}}
"""

        line_map: dict[int, str] = {}
        current_line = header.count("\n") + 1

        body_parts: list[str] = []
        for section in sections:
            raw_content = section.get("content", "")
            sec_name    = section.get("section", "Section")

            # If AI returned only a \section{} opener (not a \chapter{}),
            # promote it to a proper chapter with an intro paragraph
            if raw_content.strip().startswith(r"\section{"):
                intro = self.CHAPTER_INTROS.get(
                    sec_name,
                    rf"This chapter covers the {sec_name.lower()} aspects of \textbf{{{title}}}.",
                ).format(title=title, domain=domain)
                content = f"\\chapter{{{sec_name}}}\n{intro}\n\n{raw_content}"
            elif not raw_content.strip().startswith((r"\chapter", r"\section")):
                # Plain text returned by AI — wrap it
                intro = self.CHAPTER_INTROS.get(
                    sec_name,
                    rf"This chapter covers the {sec_name.lower()} aspects of \textbf{{{title}}}.",
                ).format(title=title, domain=domain)
                content = f"\\chapter{{{sec_name}}}\n{intro}\n\n{raw_content}"
            else:
                content = raw_content

            start_line = current_line + 2
            end_line   = start_line + content.count("\n")
            for line in range(start_line, end_line + 1):
                line_map[line] = section.get("id", sec_name)

            body_parts.append(content)
            current_line = end_line

        footer = rf"""
\bibliographystyle{{{bib_style}}}
\bibliography{{references}}
\end{{document}}"""

        full_source = header + "\n\n" + "\n\n".join(body_parts) + "\n\n" + footer.strip()
        return full_source, line_map

    def render_references(self, entries: list[str]) -> str:
        return "\n\n".join(entries)

    # ── Helpers ───────────────────────────────────────────────────────────────

    @staticmethod
    def _spacing_command(spacing_str: str) -> str:
        try:
            sp = float(spacing_str)
            if sp >= 1.8:
                return r"\doublespacing"
            if sp < 1.3:
                return r"\singlespacing"
        except (ValueError, TypeError):
            pass
        return r"\onehalfspacing"

    @staticmethod
    def _bib_style(citation: str) -> str:
        c = citation.lower()
        if "apa" in c or "harvard" in c:
            return "apalike"
        return "IEEEtran"