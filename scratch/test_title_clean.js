function normalizeLatexText(value) {
  return value
    .replace(/\r\n/g, "\n")
    .replace(/(^|[^\\])%.*$/gm, "$1")
    .replace(/```(?:latex)?|```/gi, "")
    .replace(/\\(?:vspace|hspace)\*?\{[^}]*\}/g, "")
    .replace(/\\&/g, "&")
    .replace(/\\%/g, "%")
    .replace(/\\\$/g, "$")
    .replace(/\\#/g, "#")
    .replace(/\\_/g, "_")
    .replace(/\\\{/g, "{")
    .replace(/\\\}/g, "}")
    .replace(/\\textasciitilde\{\}|\\textasciitilde/g, "~")
    .replace(/\\textbackslash\{\}|\\textbackslash/g, "\\")
    .replace(/\\textbullet\b/g, "")
    .replace(/~+/g, " ")
    .replace(/``|''/g, "\"")
    .replace(/[–—]/g, "-")
    .replace(/--+/g, "-");
}

function stripLatexCommands(value) {
  let text = normalizeLatexText(value);

  text = text
    .replace(/\\cite(?:\[[^\]]*\])?\{[^}]*\}/g, "[Ref]")
    .replace(/\\includegraphics(?:\[[^\]]*\])?\{[^}]*\}/g, "[Diagram]")
    .replace(/\\(?:label|ref|pageref|bibliographystyle|bibliography)\{[^}]*\}/g, "")
    .replace(/\\(?:begin|end)\{[^}]+\}(?:\[[^\]]*\])?/g, "")
    .replace(/\blstlisting(?:\[[^\]]*\])?/gi, "")
    .replace(/\[[^\]]*(?:label|leftmargin|language|caption)\s*=[^\]]*\]\s*/gi, "")
    .replace(/\\(?:onehalfspacing|maketitle|tableofcontents|clearpage|newpage|noindent|centering)\b/g, "")
    .replace(/\\(?:textbf|textit|texttt|emph|underline|url)\{([^{}]*)\}/g, "$1")
    .replace(/\\(?:textbf|textit|texttt|emph|underline|url)\{?/g, "")
    .replace(/\\href\{[^{}]*\}\{([^{}]*)\}/g, "$1")
    .replace(/\\(?:chapter|section|subsection|subsubsection)\*?\{([^{}]*)\}/g, "$1")
    .replace(/\$([^$]*)\$/g, "$1")
    .replace(/\\[a-zA-Z]+\*?(?:\[[^\]]*\])?(?:\{([^{}]*)\})?/g, "$1")
    .replace(/[{}]/g, "")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  return text;
}

function cleanPdfTitle(value) {
  return stripLatexCommands(value)
    .replace(/\\[a-zA-Z]+\*?\{?/g, "")
    .replace(/[{}]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

const originalTitle = "Smart Campus IoT Lighting";
const cleaned = cleanPdfTitle(originalTitle);

console.log("Original Title:", originalTitle);
console.log("Cleaned Title:", cleaned);

if (cleaned === originalTitle) {
  print("SUCCESS: Title parsed correctly!");
} else {
  print("FAILED: Title is not matching!");
}

// Test with LaTeX command in title
const latexTitle = "\\textbf{Smart Campus IoT Lighting}";
const cleanedLatex = cleanPdfTitle(latexTitle);
console.log("\nLaTeX Title:", latexTitle);
console.log("Cleaned LaTeX Title:", cleanedLatex);

if (cleanedLatex === originalTitle) {
  print("SUCCESS: LaTeX title cleaned and parsed correctly!");
} else {
  print("FAILED: LaTeX title cleaning!");
}
