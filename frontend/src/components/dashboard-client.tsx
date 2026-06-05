"use client";

import { useEffect, useMemo, useState, Suspense } from "react";
import { onSnapshot } from "firebase/firestore";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { useAuth } from "@/components/auth-provider";
import { FirebaseConfigWarning } from "@/components/firebase-config-warning";
import { GenerationTimeline } from "@/components/generation-timeline";
import { MetricCard } from "@/components/metric-card";
import { ProjectCard } from "@/components/project-card";
import { ProjectForm } from "@/components/project-form";
import { QualityPanel } from "@/components/quality-panel";
import { UploadWizard } from "@/components/upload-wizard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getFirebaseAuth } from "@/lib/firebase";
import { projectsQuery } from "@/lib/firestore";
import type { Project, QualityScore } from "@/lib/types";

function SettingsView({ user }: { user: any }) {
  const [apiKey, setApiKey] = useState("");
  const [isSaved, setIsSaved] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const savedKey = localStorage.getItem("reportai_custom_api_key") || "";
    setApiKey(savedKey);
  }, []);

  const handleSaveKey = () => {
    localStorage.setItem("reportai_custom_api_key", apiKey.trim());
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleSignOut = async () => {
    try {
      await signOut(getFirebaseAuth());
      localStorage.removeItem("reportai_custom_api_key");
      router.push("/login");
    } catch (err) {
      console.error("Sign out failed", err);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border border-border bg-card shadow-md">
        <CardHeader>
          <CardTitle>OpenAI/Gemini API Key</CardTitle>
          <p className="text-sm text-muted-foreground">
            Configure your personal OpenAI-compatible or Gemini API key. This key will be forwarded to the backend to perform AI tasks.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="api-key" className="text-sm font-medium leading-none">API Key</label>
            <Input
              id="api-key"
              type="password"
              placeholder="AIzaSy... (Gemini) or sk-... (OpenAI)"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="font-mono"
            />
            <p className="text-xs text-muted-foreground">
              If left blank, the platform will use the system's default API key (if configured).
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button onClick={handleSaveKey}>Save Key</Button>
            {isSaved && <span className="text-sm text-green-500 font-medium">✓ Saved successfully!</span>}
          </div>
        </CardContent>
      </Card>

      <Card className="border border-border bg-card shadow-md">
        <CardHeader>
          <CardTitle>Account Details</CardTitle>
          <p className="text-sm text-muted-foreground">Your authenticated account credentials and profile</p>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <span className="text-xs font-semibold text-muted-foreground block">EMAIL ADDRESS</span>
            <span className="text-sm font-medium text-foreground">{user?.email || "Not available"}</span>
          </div>
          <div>
            <span className="text-xs font-semibold text-muted-foreground block">USER UID</span>
            <span className="text-sm font-mono text-foreground">{user?.uid || "Not available"}</span>
          </div>
          <div className="pt-2">
            <Button variant="outline" className="text-red-500 hover:text-red-600 border-red-200 hover:bg-red-50" onClick={handleSignOut}>
              Sign Out
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function DashboardContent() {
  const { user, loading, configured } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [error, setError] = useState("");
  const searchParams = useSearchParams();
  const activeTab = searchParams.get("tab") || "dashboard";

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

  if (activeTab === "settings") {
    return <SettingsView user={user} />;
  }

  if (activeTab === "quality") {
    return (
      <div className="space-y-6">
        <section className="grid gap-4 md:grid-cols-1">
          <MetricCard label="Average quality score across projects" value={score ? String(score.overall) : "-"} detail="Calculated from all active LaTeX draft compile metrics" />
        </section>
        <div className="max-w-4xl">
          <QualityPanel score={score} />
        </div>
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

export function DashboardClient() {
  return (
    <Suspense fallback={<p className="text-sm text-muted-foreground">Loading dashboard...</p>}>
      <DashboardContent />
    </Suspense>
  );
}
