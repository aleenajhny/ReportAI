"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createProject } from "@/lib/firestore";

export function ProjectForm({ userId }: { userId: string }) {
  const [title, setTitle] = useState("");
  const [domain, setDomain] = useState("");
  const [description, setDescription] = useState("");
  const [message, setMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setMessage("");
    try {
      await createProject(userId, { title, domain, description });
      setTitle("");
      setDomain("");
      setDescription("");
      setMessage("Project created in Firebase.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not create project.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Project</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="space-y-3" onSubmit={submit}>
          <Input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Project title" required />
          <Input value={domain} onChange={(event) => setDomain(event.target.value)} placeholder="Domain, e.g. AI, IoT, Web" required />
          <Textarea value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Project description" required />
          <Button className="w-full" type="submit" disabled={isSaving}>
            {isSaving ? "Creating..." : "Create Project"}
          </Button>
        </form>
        {message ? <p className="mt-3 text-sm text-muted-foreground">{message}</p> : null}
      </CardContent>
    </Card>
  );
}
