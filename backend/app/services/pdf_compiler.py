import subprocess
import tempfile
from pathlib import Path


class PDFCompiler:
    def compile(self, latex_source: str, references_bib: str = "") -> tuple[bool, bytes | None, str]:
        with tempfile.TemporaryDirectory() as tmp:
            workdir = Path(tmp)
            tex_path = workdir / "report.tex"
            tex_path.write_text(latex_source, encoding="utf-8")
            (workdir / "references.bib").write_text(references_bib, encoding="utf-8")
            result = subprocess.run(
                ["latexmk", "-pdf", "-interaction=nonstopmode", "report.tex"],
                cwd=workdir,
                capture_output=True,
                text=True,
                timeout=90,
                check=False,
            )
            pdf_path = workdir / "report.pdf"
            if result.returncode == 0 and pdf_path.exists():
                return True, pdf_path.read_bytes(), result.stdout[-8000:]
            return False, None, (result.stdout + "\n" + result.stderr)[-8000:]
