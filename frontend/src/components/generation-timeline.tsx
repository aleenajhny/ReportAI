import { CheckCircle2, CircleDot, Loader2 } from "lucide-react";

const labels = [
  "Project created",
  "Template uploaded",
  "Questionnaire saved",
  "LaTeX draft generated",
];

export function GenerationTimeline({ status = "draft" }: { status?: string }) {
  const activeIndex = status === "latex_ready" ? 3 : status === "questionnaire_ready" ? 2 : status === "template_uploaded" ? 1 : 0;
  return (
    <div className="space-y-4">
      {labels.map((label, index) => (
        <div key={label} className="flex items-center gap-3 rounded-md border bg-card p-3">
          {index < activeIndex ? <CheckCircle2 className="h-5 w-5 text-accent" /> : null}
          {index === activeIndex ? <Loader2 className="h-5 w-5 animate-spin text-primary" /> : null}
          {index > activeIndex ? <CircleDot className="h-5 w-5 text-muted-foreground" /> : null}
          <span className="text-sm">{label}</span>
        </div>
      ))}
    </div>
  );
}
