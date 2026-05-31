class QualityAnalyzer:
    def score(self, latex_source: str, references: list[dict]) -> dict:
        word_count = len(latex_source.split())
        citation_score = 90 if references else 45
        depth = min(95, max(40, word_count // 30))
        formatting = 88 if "\\chapter" in latex_source or "\\section" in latex_source else 55
        readability = 82
        grammar = 84
        overall = round((grammar + readability + depth + formatting + citation_score) / 5)
        suggestions = []
        if word_count < 2500:
            suggestions.append("Expand methodology, implementation, testing, and result analysis sections.")
        if not references:
            suggestions.append("Add peer-reviewed references and link citations inside chapters.")
        if "\\includegraphics" not in latex_source:
            suggestions.append("Add architecture, flowchart, UML, or result diagrams.")
        return {
            "grammar": grammar,
            "readability": readability,
            "technical_depth": depth,
            "formatting_quality": formatting,
            "citation_quality": citation_score,
            "overall": overall,
            "suggestions": suggestions,
        }
