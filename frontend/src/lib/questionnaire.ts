export type Question = {
  id: string;
  label: string;
  type: "text" | "textarea";
};

const commonQuestions: Question[] = [
  { id: "problem_statement", label: "What problem does your project solve?", type: "textarea" },
  { id: "objectives", label: "List the main objectives.", type: "textarea" },
  { id: "scope", label: "What is included and excluded from scope?", type: "textarea" },
];

const domainQuestions: Record<string, Question[]> = {
  ai: [
    { id: "dataset", label: "Dataset used?", type: "text" },
    { id: "model_architecture", label: "Model architecture?", type: "text" },
    { id: "accuracy", label: "Accuracy achieved?", type: "text" },
  ],
  iot: [
    { id: "sensors", label: "Sensors used?", type: "text" },
    { id: "controller", label: "Controller used?", type: "text" },
    { id: "protocol", label: "Communication protocol?", type: "text" },
  ],
  web: [
    { id: "tech_stack", label: "Tech stack?", type: "text" },
    { id: "architecture", label: "Application architecture?", type: "textarea" },
    { id: "database", label: "Database used?", type: "text" },
  ],
};

const fallbackQuestions: Question[] = [
  { id: "tools", label: "Tools, frameworks, or hardware used?", type: "textarea" },
];

export function questionsForDomain(domain: string): Question[] {
  const key = Object.keys(domainQuestions).find((candidate) => domain.toLowerCase().includes(candidate));
  return [...commonQuestions, ...(key ? domainQuestions[key] : fallbackQuestions)];
}
