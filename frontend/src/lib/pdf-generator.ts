import { jsPDF } from "jspdf";

type ParsedSection = { title: string; body: string };
type RenderBlock = { type: "paragraph"; text: string } | { type: "list-item"; text: string };

// ── LaTeX string helpers ──────────────────────────────────────────────────────

function extractCommandContent(source: string, command: string): string {
  const pattern = new RegExp(`\\\\${command}\\s*\\*?\\s*\\{`, "i");
  const match = pattern.exec(source);
  if (!match) return "";
  const contentStart = match.index + match[0].length;
  let depth = 1;
  for (let i = contentStart; i < source.length; i++) {
    const ch = source[i], prev = source[i - 1];
    if (ch === "{" && prev !== "\\") depth++;
    if (ch === "}" && prev !== "\\") depth--;
    if (depth === 0) return source.slice(contentStart, i);
  }
  return "";
}

function normalizeLatexText(value: string): string {
  return value
    .replace(/\r\n/g, "\n")
    .replace(/(^|[^\\])%.*$/gm, "$1")
    .replace(/```(?:latex)?|```/gi, "")
    .replace(/\\(?:vspace|hspace)\*?\{[^}]*\}/g, "")
    .replace(/\\&/g, "&").replace(/\\%/g, "%").replace(/\\\$/g, "$")
    .replace(/\\#/g, "#").replace(/\\_/g, "_")
    .replace(/\\\{/g, "{").replace(/\\\}/g, "}")
    .replace(/\\textasciitilde\{\}|\\textasciitilde/g, "~")
    .replace(/\\textbackslash\{\}|\\textbackslash/g, "\\")
    .replace(/\\textbullet\b/g, "")
    .replace(/~+/g, " ").replace(/``|''/g, "\"")
    .replace(/[–—]/g, "-").replace(/--+/g, "-");
}

function stripLatexCommands(value: string): string {
  let text = normalizeLatexText(value);
  text = text
    .replace(/\\addcontentsline\s*\{[^}]*\}\s*\{[^}]*\}\s*\{[^}]*\}/g, "")
    .replace(/\\pagenumbering\s*\{[^}]*\}/g, "")
    .replace(/\\setcounter\s*\{[^}]*\}\s*\{[^}]*\}/g, "")
    .replace(/\\hypersetup\s*\{[^}]*\}/g, "")
    .replace(/\\usepackage\s*(?:\[[^\]]*\])?\s*\{[^}]*\}/g, "")
    .replace(/\\documentclass\s*(?:\[[^\]]*\])?\s*\{[^}]*\}/g, "")
    .replace(/\\(?:begin|end)\s*\{document\}/g, "")
    .replace(/\\\\|\\newline/g, " ")
    .replace(/\\\[[\d.]*(?:em|pt|cm|mm|ex|in)?\]/g, " ")
    .replace(/\\cite\s*(?:\[[^\]]*\])?\s*\{[^}]*\}/g, "[Ref]")
    .replace(/\\includegraphics\s*(?:\[[^\]]*\])?\s*\{[^}]*\}/g, "[Diagram]")
    .replace(/\\(?:label|ref|pageref|bibliographystyle|bibliography)\s*\{[^}]*\}/g, "")
    .replace(/\\(?:begin|end)\s*\{[^}]+\}\s*(?:\[[^\]]*\])?/g, "")
    .replace(/\blstlisting\s*(?:\[[^\]]*\])?/gi, "")
    .replace(/\[[^\]]*(?:label|leftmargin|language|caption)\s*=[^\]]*\]\s*/gi, "")
    .replace(/\\(?:onehalfspacing|doublespacing|singlespacing|maketitle|tableofcontents|clearpage|newpage|noindent|centering)\b/g, "")
    .replace(/\\(?:textbf|textit|texttt|emph|underline|url)\s*\{([^{}]*)\}/g, "$1")
    .replace(/\\(?:textbf|textit|texttt|emph|underline|url)\s*\{?/g, "")
    .replace(/\\href\s*\{[^{}]*\}\s*\{([^{}]*)\}/g, "$1")
    .replace(/\\(?:chapter|section|subsection|subsubsection)\s*\*?\s*\{([^{}]*)\}/g, "$1")
    .replace(/\\(?:Large|large|LARGE|huge|Huge|small|footnotesize|normalsize)\b/g, "")
    .replace(/\\(?:vfill|hfill|noindent)\b/g, "")
    .replace(/\$([^$]*)\$/g, "$1")
    .replace(/\\[a-zA-Z]+\s*\*?\s*(?:\[[^\]]*\])?\s*\{([^{}]*)\}/g, "$1")
    .replace(/\\[a-zA-Z]+\b\s*/g, "")
    .replace(/[{}]/g, "")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
  return text;
}

function cleanPdfTitle(value: string): string {
  return stripLatexCommands(value).replace(/\s+/g, " ").trim();
}

function parseBlocks(value: string): RenderBlock[] {
  const ITEM = "__REPORTAI_LIST_ITEM__";
  const prepared = normalizeLatexText(value)
    .replace(/\\begin\{(?:itemize|enumerate)\}(?:\[[^\]]*\])?|\\end\{(?:itemize|enumerate)\}/g, "\n")
    .replace(/\\begin\{(?:lstlisting|verbatim|minted)\}(?:\[[^\]]*\])?|\\end\{(?:lstlisting|verbatim|minted)\}/g, "\n")
    .replace(/\[[^\]]*(?:label|leftmargin|language|caption)\s*=[^\]]*\]\s*/gi, "")
    .replace(/\\item(?:\[[^\]]*\])?/g, `\n${ITEM} `)
    .replace(/(?:^|\s)(?:[*-]|\d+[.)])\s+(?=[A-Z0-9])/g, `\n${ITEM} `)
    .replace(/\\\\|\\newline/g, "\n");

  const blocks: RenderBlock[] = [];
  const pushParagraphs = (text: string) => {
    text.split(/\n{2,}/)
      .map((p) => stripLatexCommands(p.replace(/\n+/g, " ")))
      .filter(Boolean)
      .forEach((p) => blocks.push({ type: "paragraph", text: p }));
  };

  if (!prepared.includes(ITEM)) { pushParagraphs(prepared); return blocks; }

  const parts = prepared.split(ITEM);
  pushParagraphs(parts[0]);
  for (const part of parts.slice(1)) {
    const [rawItem = "", ...rest] = part.split(/\n{2,}/);
    const itemText = stripLatexCommands(rawItem.replace(/\n+/g, " "));
    if (itemText) blocks.push({ type: "list-item", text: itemText });
    if (rest.length > 0) pushParagraphs(rest.join("\n\n"));
  }
  return blocks;
}

// ── Chapter validation & answer mapping ──────────────────────────────────────

const VALID_CHAPTER_KEYWORDS = new Set([
  "abstract", "introduction", "literature", "review", "study", "analysis",
  "design", "architecture", "methodology", "implementation", "testing",
  "results", "discussion", "conclusion", "future", "scope", "requirements",
  "srs", "system", "background", "overview", "related", "work",
  "evaluation", "performance", "feasibility",
]);

const FRONT_MATTER_KEYS = new Set([
  "certificate", "declaration", "acknowledgement",
  "table of contents", "contents", "list of figures", "list of tables",
]);

const DEFAULT_CHAPTERS = [
  "Introduction", "System Study", "System Requirements", "System Design",
  "Implementation", "Testing", "Results", "Conclusion", "Future Scope",
];

function validateChapters(chapters: string[] | undefined): string[] | null {
  if (!chapters || chapters.length === 0) return null;
  if (chapters.some((c) => c.length > 40)) return null;
  const validCount = chapters.filter((c) =>
    [...VALID_CHAPTER_KEYWORDS].some((kw) => c.toLowerCase().includes(kw))
  ).length;
  if (validCount / chapters.length < 0.6) return null;
  return chapters;
}

const CHAPTER_ANSWER_KEYS: Record<string, string[]> = {
  "Abstract": ["abstract", "overview"],
  "Introduction": ["problem_statement", "objectives", "scope", "background", "motivation", "introduction"],
  "System Study": ["existing_system", "proposed_system", "feasibility",
    "technical_feasibility", "economic_feasibility", "operational_feasibility"],
  "Literature Review": ["literature_review", "related_work", "survey"],
  "System Requirements": ["functional_requirements", "non_functional_requirements",
    "hardware_requirements", "software_requirements"],
  "System Analysis": ["system_analysis", "dfd", "use_case", "requirements"],
  "System Design": ["system_design", "database_design", "architecture",
    "tech_stack", "database", "uml", "er_diagram", "software_architecture"],
  "Methodology": ["methodology", "algorithm", "approach", "model_architecture", "dataset"],
  "Implementation": ["implementation", "tools", "technology", "tech_stack",
    "sensors", "controller", "protocol", "code_structure"],
  "Testing": ["testing_methods", "test_cases", "test_results", "evaluation", "testing"],
  "Results": ["results", "evaluation_metrics", "performance", "outcomes", "accuracy"],
  "Conclusion": ["conclusion", "summary", "findings"],
  "Future Scope": ["future_scope", "future_work", "enhancements", "limitations"],
};

const EXACT_ONLY = new Set(["scope", "model", "database", "summary", "tools"]);

function isNilAnswer(v: string): boolean {
  return ["", "nil", "none", "nothing", "n/a", "na", "not applicable", "null", "no", "none.", "nil."]
    .includes(v.trim().toLowerCase());
}

function fmtKey(k: string): string {
  return k.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function answersForChapter(chapter: string, answers: Record<string, string>): Array<[string, string]> {
  const matched = new Set<string>();
  const result: Array<[string, string]> = [];
  const targets = CHAPTER_ANSWER_KEYS[chapter] ?? [chapter.toLowerCase().replace(/ /g, "_")];

  for (const target of targets) {
    for (const [key, val] of Object.entries(answers)) {
      if (matched.has(key) || isNilAnswer(val)) continue;
      if (key === target) {
        matched.add(key); result.push([fmtKey(key), val.trim()]);
      } else if (!EXACT_ONLY.has(key) && !EXACT_ONLY.has(target)) {
        if (target.includes(key) || key.includes(target)) {
          matched.add(key); result.push([fmtKey(key), val.trim()]);
        }
      }
    }
  }
  return result;
}

const CHAPTER_INTROS: Record<string, string> = {
  "Abstract": "This report presents the design, development, and evaluation of {TITLE}, a project in the domain of {DOMAIN}. The work addresses a focused problem, proposes a systematic solution, and validates outcomes through structured testing and analysis.",
  "Introduction": "This chapter establishes the context and motivation for {TITLE}. It outlines the identified problem, project objectives, scope, and the structural organisation of this report.",
  "System Study": "This chapter presents a detailed study of the existing system, identifies its limitations, and describes the proposed system for {TITLE}. A feasibility study evaluates the practicability of the solution.",
  "Literature Review": "A systematic review of existing literature relevant to {TITLE} was conducted to identify research gaps and inform design decisions.",
  "System Requirements": "This chapter documents the functional and non-functional requirements for {TITLE}, including hardware and software specifications.",
  "System Analysis": "This chapter presents the requirements analysis, data flow diagrams, and use-case models developed for {TITLE}.",
  "System Design": "The system design chapter details the architectural blueprint, database schemas, and component interactions designed for {TITLE}.",
  "Methodology": "This chapter describes the theoretical foundations, algorithms, and experimental configurations adopted to develop {TITLE}.",
  "Implementation": "This chapter documents the development environment, tools, technologies, and integration steps realised for {TITLE}.",
  "Testing": "Validation and verification tests were systematically conducted to confirm the correctness and reliability of {TITLE}, covering unit, integration, and scenario-based testing.",
  "Results": "This chapter presents the experimental outcomes, performance metrics, and comparative evaluations obtained from testing {TITLE}.",
  "Conclusion": "This chapter summarises the contributions, outcomes achieved, and lessons learned during the development of {TITLE}.",
  "Future Scope": "This chapter outlines potential enhancements, scalability improvements, and research directions that could extend {TITLE} in future work.",
};

function chapterIntro(chapter: string, title: string, domain: string): string {
  const tpl = CHAPTER_INTROS[chapter] ??
    `This chapter presents the ${chapter.toLowerCase()} aspects of {TITLE}, covering key design decisions and evaluation criteria.`;
  return tpl.replace(/{TITLE}/g, title).replace(/{DOMAIN}/g, domain);
}

// ── Static fallback LaTeX generator (unchanged) ───────────────────────────────

export function generateLatex(
  project: { title: string; domain: string; description: string },
  answers: Record<string, string>,
  rawChapters?: string[],
): string {
  const { title, domain, description } = project;
  const chapters = validateChapters(rawChapters) ?? DEFAULT_CHAPTERS;
  const bodyChapters = chapters.filter((c) => !FRONT_MATTER_KEYS.has(c.toLowerCase()));

  const front = `\\chapter*{Certificate}
This is to certify that the project report titled \\textbf{${title}} submitted by the student(s) is a bonafide record of work carried out under our supervision in partial fulfilment of the requirements for the award of the degree.

\\vspace{2cm}
\\noindent\\textbf{Project Guide} \\hfill \\textbf{Head of Department}

\\chapter*{Declaration}
I/We hereby declare that the project entitled \\textbf{${title}} submitted for the academic programme is our original work. Any references to other works have been duly cited.

\\vspace{1cm}
\\noindent\\textbf{Student Signature(s):}

\\chapter*{Acknowledgement}
The authors express sincere gratitude to their project supervisor, department faculty, and colleagues whose guidance was invaluable throughout the development of \\textbf{${title}}.`;

  const body = bodyChapters.map((chapter) => {
    let tex = `\\chapter{${chapter}}\n${chapterIntro(chapter, title, domain)}\n\n`;
    if (chapter === "Introduction" && description) tex += description + "\n\n";
    const chAnswers = answersForChapter(chapter, answers);
    if (chAnswers.length > 0) {
      for (const [label, value] of chAnswers) tex += `\\section{${label}}\n${value}\n\n`;
    } else if (chapter !== "Abstract") {
      tex += `Detailed content for the ${chapter.toLowerCase()} section will be populated with project-specific data, evidence, and citations.\n`;
    }
    return tex;
  }).join("\n\n");

  return `\\documentclass[12pt,a4paper]{report}
\\usepackage[margin=1in]{geometry}
\\usepackage{setspace}
\\usepackage{hyperref}
\\usepackage{parskip}
\\onehalfspacing

\\title{${title}}
\\author{}
\\date{\\today}

\\begin{document}
\\maketitle

${front}

\\tableofcontents
\\clearpage

${body}

\\bibliographystyle{IEEEtran}
\\bibliography{references}
\\end{document}`;
}

// ── Academic PDF renderer ─────────────────────────────────────────────────────
// Produces a LaTeX report-class style PDF:
//  - Clean white pages, no branding or watermarks
//  - "Chapter N" label (14pt) above chapter title (24pt bold), both Times
//  - Thin rule under chapter title
//  - Numbered sections (12pt bold), body text (12pt Times-Roman)
//  - Bullet list items with small filled circles
//  - Page numbers bottom-right; roman numerals for front matter (TOC, cert, decl, ack)
//  - TOC with dot leaders on the first page(s)

export function generateAndDownloadPdf(projectTitle: string, latex: string) {
  // jsPDF in "pt" units gives us 1:1 with PDF points (A4 = 595.28 × 841.89)
  const doc = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });

  const PW = doc.internal.pageSize.getWidth();   // 595.28 pt
  const PH = doc.internal.pageSize.getHeight();  // 841.89 pt
  const ML = 72, MR = 72, MT = 80, MB = 72;
  const CW = PW - ML - MR;                       // content width ≈ 451 pt

  // Font sizes
  const F_BODY = 12; const LH_BODY = 17;   // body text
  const F_SEC = 13; const LH_SEC = 19;   // section heading
  const F_CHLAB = 14; const LH_CHLAB = 22;   // "Chapter N" label
  const F_CHTIT = 24; const LH_CHTIT = 34;   // chapter title
  const F_TOCCH = 12; const LH_TOCCH = 20;   // TOC chapter entry
  const F_TOCS = 11; const LH_TOCS = 18;   // TOC section entry
  const F_TOCTIT = 18; const LH_TOCTIT = 28;  // "Contents" heading

  // ── Parse title ─────────────────────────────────────────────────────────────
  const titleRaw = extractCommandContent(latex, "title");
  const parsedTitle = cleanPdfTitle(titleRaw || projectTitle) || "Project Report";

  // ── Extract chapters from LaTeX ──────────────────────────────────────────────
  const chRx = /\\chapter\s*\*?\s*\{([^}]+)\}([\s\S]*?)(?=\\chapter\s*\*?\s*\{|\\bibliographystyle|\\end\s*\{document\})/g;
  type ChapterData = { title: string; content: string; isFM: boolean };
  const allChapters: ChapterData[] = [];
  let cm: RegExpExecArray | null;

  while ((cm = chRx.exec(latex)) !== null) {
    const t = stripLatexCommands(cm[1]);
    allChapters.push({ title: t, content: cm[2].trim(), isFM: FRONT_MATTER_KEYS.has(t.toLowerCase()) });
  }

  if (allChapters.length === 0) {
    const body = latex
      .replace(/\\documentclass[\s\S]*?\\begin\{document\}/, "")
      .replace(/\\maketitle|\\tableofcontents/, "")
      .replace(/\\end\{document\}[\s\S]*/, "").trim();
    allChapters.push({ title: "Project Report", content: body, isFM: false });
  }

  const fmChapters = allChapters.filter(c => c.isFM);
  const bodyChapters = allChapters.filter(c => !c.isFM);

  // ── State ────────────────────────────────────────────────────────────────────
  let physPage = 1;         // current physical page (1-indexed for jsPDF setPage)
  let logicPage = 1;        // logical page counter within current numbering scheme
  let inFrontMatter = true; // true → roman numerals

  const toRoman = (n: number): string => {
    const v = [1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1];
    const s = ["m", "cm", "d", "cd", "c", "xc", "l", "xl", "x", "ix", "v", "iv", "i"];
    let o = ""; for (let i = 0; i < v.length; i++) while (n >= v[i]) { o += s[i]; n -= v[i]; } return o;
  };

  const pageLabel = () => inFrontMatter ? toRoman(logicPage) : String(logicPage);

  const stampPageNum = () => {
    doc.setFont("times", "normal");
    doc.setFontSize(F_BODY);
    doc.setTextColor(0, 0, 0);
    doc.text(pageLabel(), PW - MR, PH - 30, { align: "right" });
  };

  // Record (logicPage, inFrontMatter) per physical page for back-patching
  // Instead, we stamp inline; back-patch TOC page numbers after body is rendered.

  // ── Low-level render helpers ─────────────────────────────────────────────────
  const overflow = (y: number, needed: number): number => {
    if (y + needed > PH - MB) {
      stampPageNum();
      logicPage++;
      doc.addPage();
      physPage++;
      y = MT;
      // Reset font for continued text
      doc.setFont("times", "normal");
      doc.setFontSize(F_BODY);
      doc.setTextColor(0, 0, 0);
    }
    return y;
  };

  const renderBlocks = (blocks: RenderBlock[], startY: number): number => {
    let y = startY;
    doc.setFont("times", "normal");
    doc.setFontSize(F_BODY);
    doc.setTextColor(0, 0, 0);
    const paraGap = LH_BODY * 0.4;

    for (const block of blocks) {
      const isItem = block.type === "list-item";
      const xLeft = ML + (isItem ? 16 : 0);
      const wText = CW - (isItem ? 16 : 0);
      const lines = doc.splitTextToSize(block.text, wText);

      if (isItem) y += 3;

      for (let li = 0; li < lines.length; li++) {
        y = overflow(y, LH_BODY);
        if (isItem && li === 0) {
          doc.setFillColor(0, 0, 0);
          doc.circle(ML + 5, y - 3.5, 1.8, "F");
        }
        doc.text(lines[li], xLeft, y);
        y += LH_BODY;
      }
      y += isItem ? 3 : paraGap;
    }
    return y;
  };

  const drawRule = (y: number): void => {
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.5);
    doc.line(ML, y, PW - MR, y);
  };

  // ── TOC data (collected during body render) ──────────────────────────────────
  type TocRow = { level: "chapter" | "section"; num: string; title: string; logicPg: number };
  const tocRows: TocRow[] = [];
  // We'll also track which body logic page each chapter/section starts on
  // Body logic pages reset at 1 when we leave front matter.

  // ── PHASE 1: TOC placeholder page (page 1) ───────────────────────────────────
  // We render TOC last (setPage back to 1), so leave page 1 blank for now.
  // Actually jsPDF renders linearly, so we stamp TOC at the end using setPage().
  // For now, emit an empty first page.

  let y = MT;
  // Leave page 1 as TOC placeholder — we'll fill it in Phase 3.
  // Just advance to the next page for front matter.

  // ── PHASE 2: Front matter ────────────────────────────────────────────────────
  // Pages 2+ (physical) = Certificate, Declaration, Acknowledgement
  // These use roman numeral page numbers starting at "ii" (TOC = "i")

  if (fmChapters.length > 0) {
    for (const fm of fmChapters) {
      stampPageNum(); logicPage++;
      doc.addPage(); physPage++;
      y = MT;

      doc.setFont("times", "bold");
      doc.setFontSize(F_CHTIT);
      doc.setTextColor(0, 0, 0);
      doc.text(fm.title, ML, y);
      y += LH_CHTIT + 4;
      drawRule(y); y += 18;

      const blocks = parseBlocks(fm.content);
      y = renderBlocks(blocks, y);
    }
    stampPageNum(); logicPage++;
  } else {
    stampPageNum(); logicPage++;
  }

  // ── Switch to arabic page numbering ──────────────────────────────────────────
  inFrontMatter = false;
  logicPage = 1;

  // ── PHASE 3: Body chapters ───────────────────────────────────────────────────
  const chapterLogicPages: number[] = [];  // body logic page where each chapter starts

  bodyChapters.forEach((ch, chIdx) => {
    doc.addPage(); physPage++;
    chapterLogicPages.push(logicPage);
    tocRows.push({ level: "chapter", num: String(chIdx + 1), title: ch.title, logicPg: logicPage });

    y = MT;

    // "Chapter N"
    doc.setFont("times", "normal");
    doc.setFontSize(F_CHLAB);
    doc.setTextColor(0, 0, 0);
    doc.text(`Chapter ${chIdx + 1}`, ML, y);
    y += LH_CHLAB + 4;

    // Chapter title (may wrap)
    doc.setFont("times", "bold");
    doc.setFontSize(F_CHTIT);
    const titleLines = doc.splitTextToSize(ch.title, CW);
    for (const tl of titleLines) {
      doc.text(tl, ML, y);
      y += LH_CHTIT;
    }
    y += 6;
    drawRule(y); y += 20;

    // Parse sections
    const sections: ParsedSection[] = [];
    const cleanContent = ch.content
      .replace(/\\onehalfspacing|\\doublespacing|\\singlespacing|\\maketitle|\\tableofcontents/g, "")
      .replace(/\\pagenumbering\{[^}]*\}/g, "")
      .replace(/\\addcontentsline\{[^}]*\}\{[^}]*\}\{[^}]*\}/g, "")
      .replace(/\\clearpage|\\newpage/g, "").trim();

    const secRx = /\\section\s*\*?\s*\{([^}]+)\}([\s\S]*?)(?=\\section\s*\*?\s*\{|$)/g;
    const firstSecIdx = /\\section\s*\*?\s*\{/.exec(cleanContent)?.index ?? -1;
    if (firstSecIdx > 0) {
      const intro = cleanContent.substring(0, firstSecIdx).trim();
      if (intro) sections.push({ title: "", body: intro });
    }
    let sm: RegExpExecArray | null;
    while ((sm = secRx.exec(cleanContent)) !== null) {
      sections.push({ title: stripLatexCommands(sm[1]), body: sm[2].trim() });
    }
    if (sections.length === 0) sections.push({ title: "", body: cleanContent });

    let secCounter = 0;
    for (const sec of sections) {
      if (sec.title) {
        secCounter++;
        // Ensure heading + at least 2 body lines fit on same page
        if (y + LH_SEC + LH_BODY * 2 > PH - MB) {
          stampPageNum(); logicPage++;
          doc.addPage(); physPage++;
          y = MT;
        }
        tocRows.push({
          level: "section",
          num: `${chIdx + 1}.${secCounter}`,
          title: sec.title,
          logicPg: logicPage,
        });
        doc.setFont("times", "bold");
        doc.setFontSize(F_SEC);
        doc.setTextColor(0, 0, 0);
        doc.text(`${chIdx + 1}.${secCounter}  ${sec.title}`, ML, y);
        y += LH_SEC + 4;
      }

      doc.setFont("times", "normal");
      doc.setFontSize(F_BODY);
      doc.setTextColor(0, 0, 0);
      const blocks = parseBlocks(sec.body);
      y = renderBlocks(blocks, y);
      y += 4;
    }

    stampPageNum(); logicPage++;
  });

  // ── PHASE 4: Render TOC on page 1 ────────────────────────────────────────────
  doc.setPage(1);
  y = MT;

  doc.setFont("times", "bold");
  doc.setFontSize(F_TOCTIT);
  doc.setTextColor(0, 0, 0);
  doc.text("Contents", ML, y);
  y += LH_TOCTIT + 12;

  for (const row of tocRows) {
    if (y > PH - MB - 16) break; // overflow guard (single-page TOC)

    const isChap = row.level === "chapter";
    const fs = isChap ? F_TOCCH : F_TOCS;
    const lh = isChap ? LH_TOCCH : LH_TOCS;
    const indent = isChap ? 0 : 20;
    const fn = isChap ? "bold" : "normal";

    doc.setFont("times", fn);
    doc.setFontSize(fs);
    doc.setTextColor(0, 0, 0);

    const leftLabel = `${row.num}  ${row.title}`;
    const rightLabel = String(row.logicPg);
    const lw = doc.getTextWidth(leftLabel);
    const rw = doc.getTextWidth(rightLabel);
    const dotArea = CW - indent - lw - rw - 6;
    const dotW = doc.getTextWidth(".");
    const nDots = Math.max(4, Math.floor(dotArea / dotW));

    doc.text(leftLabel, ML + indent, y);
    doc.setFont("times", "normal");
    doc.setFontSize(fs);
    doc.text(".".repeat(nDots), ML + indent + lw + 3, y);
    doc.text(rightLabel, PW - MR, y, { align: "right" });
    y += lh;
  }

  // Page number on TOC page (roman "i")
  doc.setFont("times", "normal");
  doc.setFontSize(F_BODY);
  doc.setTextColor(0, 0, 0);
  doc.text("i", PW - MR, PH - 30, { align: "right" });

  // ── Save ────────────────────────────────────────────────────────────────────
  const filename = `${parsedTitle.toLowerCase().replace(/[^a-z0-9]+/g, "_")}_report.pdf`;
  doc.save(filename);
}