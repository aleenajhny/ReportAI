import Link from "next/link";
import { ArrowRight, CheckCircle2, FileText, GraduationCap, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

const features = [
  "Learns chapter structure, citation style, typography, and layout",
  "Generates adaptive project questionnaires for AI, IoT, web, and custom domains",
  "Produces LaTeX, BibTeX, PDF, quality scores, and Overleaf-ready exports",
];

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <section className="border-b bg-card">
        <div className="mx-auto flex max-w-6xl flex-col gap-10 px-6 py-16 md:py-24">
          <nav className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 text-lg font-semibold">
              <span className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <GraduationCap className="h-5 w-5" />
              </span>
              ReportAI
            </Link>
            <div className="flex items-center gap-2">
              <Button variant="ghost" asChild>
                <Link href="/login">Login</Link>
              </Button>
              <Button asChild>
                <Link href="/dashboard">Dashboard</Link>
              </Button>
            </div>
          </nav>
          <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.16em] text-primary">Academic report automation</p>
              <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-normal md:text-6xl">
                Generate university-standard project reports from templates, answers, and evidence.
              </h1>
              <p className="mt-5 max-w-2xl text-lg text-muted-foreground">
                Upload previous reports or guidelines, let ReportAI learn the structure, answer a focused questionnaire, then generate LaTeX and PDF reports with citations and quality checks.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button asChild>
                  <Link href="/signup" className="flex items-center gap-2">
                    Start a project
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/editor">Open editor</Link>
                </Button>
              </div>
            </div>
            <div className="rounded-lg border bg-background p-5 shadow-sm">
              <div className="flex items-center justify-between border-b pb-4">
                <div>
                  <p className="text-sm text-muted-foreground">Generation pipeline</p>
                  <h2 className="text-xl font-semibold">Smart Report Draft</h2>
                </div>
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <div className="mt-5 space-y-4">
                {features.map((feature) => (
                  <div key={feature} className="flex gap-3 rounded-md border bg-card p-3">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 text-accent" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>
              <div className="mt-5 rounded-md bg-muted p-4 text-sm text-muted-foreground">
                <ShieldCheck className="mb-2 h-5 w-5 text-primary" />
                Review-first workflow with stored compile logs, report versions, and teacher-ready exports.
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
