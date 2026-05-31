import { AppShell } from "@/components/app-shell";
import { LiveEditor } from "@/components/live-editor";

export default function EditorPage() {
  return (
    <AppShell>
      <div className="px-5 py-5">
        <div className="mb-5">
          <p className="text-sm font-medium text-primary">Overleaf-style workspace</p>
          <h1 className="text-3xl font-semibold">Live LaTeX Editor</h1>
        </div>
        <LiveEditor />
      </div>
    </AppShell>
  );
}
