"use client";

import { useState } from "react";
import { UploadCloud } from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { uploadTemplateFile } from "@/lib/firestore";

const steps = ["Upload", "Extract", "Learn", "Validate"];

export function UploadWizard({ projectId }: { projectId?: string }) {
  const [active, setActive] = useState(0);
  const [files, setFiles] = useState<FileList | null>(null);
  const [message, setMessage] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const { user } = useAuth();
  const progress = ((active + 1) / steps.length) * 100;

  async function uploadFiles() {
    if (!user || !projectId || !files?.length) {
      setMessage("Choose a project and at least one file first.");
      return;
    }

    setIsUploading(true);
    setMessage("");
    try {
      for (const file of Array.from(files)) {
        await uploadTemplateFile(user.uid, projectId, file);
      }
      setActive(steps.length - 1);
      setMessage("Files uploaded and template metadata saved to Firebase.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Upload failed.");
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Template Learning</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <label className="flex min-h-40 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed bg-background p-6 text-center">
          <UploadCloud className="h-8 w-8 text-primary" />
          <span className="mt-3 text-sm font-medium">Upload PDFs, DOCX reports, or guidelines</span>
          <span className="mt-1 text-xs text-muted-foreground">The backend extracts text, headings, citations, and layout hints.</span>
          <input type="file" multiple className="sr-only" onChange={(event) => setFiles(event.target.files)} />
        </label>
        {files?.length ? <p className="text-xs text-muted-foreground">{files.length} file(s) selected</p> : null}
        <Progress value={progress} />
        <div className="grid grid-cols-4 gap-2 text-xs">
          {steps.map((step, index) => (
            <button
              key={step}
              type="button"
              onClick={() => setActive(index)}
              className={`rounded-md border px-2 py-2 ${index <= active ? "bg-primary text-primary-foreground" : "bg-background"}`}
            >
              {step}
            </button>
          ))}
        </div>
        <Button className="w-full" onClick={uploadFiles} disabled={isUploading || !projectId}>
          {isUploading ? "Uploading..." : "Learn Template"}
        </Button>
        {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
      </CardContent>
    </Card>
  );
}
