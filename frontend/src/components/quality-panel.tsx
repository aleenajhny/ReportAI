import { Progress } from "@/components/ui/progress";
import type { QualityScore } from "@/lib/types";

export function QualityPanel({ score }: { score?: QualityScore | null }) {
  if (!score) {
    return (
      <section id="quality" className="rounded-lg border bg-card p-5">
        <h2 className="text-lg font-semibold">Quality Analyzer</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Generate a report draft to calculate grammar, readability, technical depth, formatting, and citation scores.
        </p>
      </section>
    );
  }

  const rows = [
    ["Grammar", score.grammar],
    ["Readability", score.readability],
    ["Technical depth", score.technical_depth],
    ["Formatting", score.formatting_quality],
    ["Citations", score.citation_quality],
  ] as const;

  return (
    <section id="quality" className="rounded-lg border bg-card p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">Quality Analyzer</h2>
          <p className="mt-1 text-sm text-muted-foreground">Academic readiness score and actionable fixes.</p>
        </div>
        <div className="rounded-md bg-accent px-3 py-2 text-xl font-semibold text-accent-foreground">{score.overall}</div>
      </div>
      <div className="mt-5 space-y-4">
        {rows.map(([label, value]) => (
          <div key={label}>
            <div className="mb-1 flex justify-between text-sm">
              <span>{label}</span>
              <span>{value}%</span>
            </div>
            <Progress value={value} />
          </div>
        ))}
      </div>
      <ul className="mt-5 space-y-2 text-sm text-muted-foreground">
        {score.suggestions.map((suggestion) => (
          <li key={suggestion}>- {suggestion}</li>
        ))}
      </ul>
    </section>
  );
}
