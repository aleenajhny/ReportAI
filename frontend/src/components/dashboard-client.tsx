"use client";

import { useEffect, useMemo, useState } from "react";
import { onSnapshot } from "firebase/firestore";
import Link from "next/link";
import { useAuth } from "@/components/auth-provider";
import { FirebaseConfigWarning } from "@/components/firebase-config-warning";
import { GenerationTimeline } from "@/components/generation-timeline";
import { MetricCard } from "@/components/metric-card";
import { ProjectCard } from "@/components/project-card";
import { ProjectForm } from "@/components/project-form";
import { QualityPanel } from "@/components/quality-panel";
import { UploadWizard } from "@/components/upload-wizard";
import { Button } from "@/components/ui/button";
import { projectsQuery } from "@/lib/firestore";
import type { Project, QualityScore } from "@/lib/types";

export function DashboardClient() {
  const { user, loading, configured } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return;
    return onSnapshot(
      projectsQuery(user.uid),
      (snapshot) => {
        setProjects(snapshot.docs.map((document) => ({ id: document.id, ...document.data() }) as Project));
        setError("");
      },
      (nextError) => setError(nextError.message),
    );
  }, [user]);

  const score = useMemo<QualityScore | null>(() => {
    const scores = projects.map((project) => project.quality_score).filter((value): value is number => typeof value === "number");
    if (!scores.length) return null;
    const average = Math.round(scores.reduce((sum, value) => sum + value, 0) / scores.length);
    return {
      grammar: average,
      readability: average,
      technical_depth: average,
      formatting_quality: average,
      citation_quality: average,
      overall: average,
      suggestions: ["Open each project to improve questionnaire answers, citations, and generated LaTeX."],
    };
  }, [projects]);

  if (!configured) {
    return <FirebaseConfigWarning />;
  }

  if (loading) {
    return <p className="text-sm text-muted-foreground">Loading account...</p>;
  }

  if (!user) {
    return (
      <div className="rounded-lg border bg-card p-5">
        <h2 className="text-lg font-semibold">Sign in required</h2>
        <p className="mt-2 text-sm text-muted-foreground">Log in to create projects and store reports in Firebase.</p>
        <Button className="mt-4" asChild>
          <Link href="/login">Login</Link>
        </Button>
      </div>
    );
  }

  return (
    <>
      {error ? <p className="mb-4 rounded-md border bg-card p-3 text-sm text-muted-foreground">{error}</p> : null}
      <section className="grid gap-4 md:grid-cols-3">
        <MetricCard label="Active projects" value={String(projects.length)} detail="Stored in your Firebase account" />
        <MetricCard label="Templates learned" value={String(projects.filter((project) => project.status !== "draft").length)} detail="Uploaded and saved as template profiles" />
        <MetricCard label="Average quality" value={score ? String(score.overall) : "-"} detail="Calculated from generated drafts" />
      </section>

      <section className="mt-6 grid gap-5 xl:grid-cols-[1fr_380px]">
        <div className="space-y-5">
          {projects.length ? (
            <div className="grid gap-4 md:grid-cols-2">
              {projects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          ) : (
            <div className="rounded-lg border bg-card p-5">
              <h2 className="text-lg font-semibold">No projects yet</h2>
              <p className="mt-2 text-sm text-muted-foreground">Create your first project and it will appear here instantly from Firestore.</p>
            </div>
          )}
          <QualityPanel score={score} />
        </div>
        <div className="space-y-5">
          <ProjectForm userId={user.uid} />
          <UploadWizard projectId={projects[0]?.id} />
          <GenerationTimeline status={projects[0]?.status} />
        </div>
      </section>
    </>
  );
}
