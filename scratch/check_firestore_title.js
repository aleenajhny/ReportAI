const fs = require('fs');
const path = require('path');

// 1. Parse env variables from .env.local
const envPath = path.join(__dirname, '..', 'frontend', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    let value = match[2] || '';
    if (value.startsWith('"') && value.endsWith('"')) {
      value = value.slice(1, -1);
    }
    env[match[1]] = value;
  }
});

// Set process.env
Object.assign(process.env, env);

// 2. Title extraction and cleaning functions from pdf-generator.ts
function extractCommandContent(source, command) {
  const start = source.indexOf(`\\${command}{`);
  if (start === -1) return "";

  const contentStart = start + command.length + 2;
  let depth = 1;

  for (let index = contentStart; index < source.length; index++) {
    const char = source[index];
    const previous = source[index - 1];

    if (char === "{" && previous !== "\\") depth++;
    if (char === "}" && previous !== "\\") depth--;
    if (depth === 0) return source.slice(contentStart, index);
  }

  return "";
}

function normalizeLatexText(value) {
  return value
    .replace(/\r\n/g, "\n")
    .replace(/(^|[^\\])%.*$/gm, "$1")
    .replace(/```(?:latex)?|```/gi, "")
    .replace(/\\(vspace|hspace)\*?\{[^}]*\}/g, "")
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

// 3. Initialize Firebase and fetch project
const { initializeApp } = require('firebase/app');
const { getFirestore, doc, getDoc } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Use user ID and project ID from your E2E verification
const userId = "lA1X3G249Y7voZvozFl7ko6PO38"; // Wait, what was the user ID? 
// Let's check how the dashboard client fetches it, or search for projects under the users collection recursively.
// Actually, we can list all documents in projects, or we can fetch a specific path.
// Wait! Let's write the code to find the first project in firestore or try different common user IDs.
// Or we can query the backend databases if we can, or just inspect how they are stored.
// Let's query firestore for the project 'haKtUQYBHOPmxyZVVoPK'.
// Wait! In Firestore web SDK, you cannot list collections without admin credentials, unless we know the path.
// But we know the path of the projects is: /users/{userId}/projects/haKtUQYBHOPmxyZVVoPK
// Wait, what is the userId?
// Let's look at the database user ID. In previous runs, was the user ID lA1X3G249Y7voZvozFl7ko6PO38 or similar?
// Let's search the workspace files for any hardcoded userId.
