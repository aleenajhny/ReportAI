import re


class CitationGenerator:
    def build_bibtex(self, title: str, authors: list[str], year: int | None, style: str = "IEEE") -> str:
        key = re.sub(r"[^a-z0-9]+", "-", title.lower()).strip("-")[:40] or "reference"
        author_text = " and ".join(authors) if authors else "Unknown"
        return (
            f"@article{{{key},\n"
            f"  title = {{{title}}},\n"
            f"  author = {{{author_text}}},\n"
            f"  year = {{{year or 'n.d.'}}},\n"
            f"  note = {{{style} formatted placeholder}}\n"
            f"}}"
        )
