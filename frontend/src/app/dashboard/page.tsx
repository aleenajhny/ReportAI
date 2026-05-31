import { AppShell } from "@/components/app-shell";
import { DashboardClient } from "@/components/dashboard-client";

export default function DashboardPage() {
  return (
    <AppShell>
      <div className="mx-auto max-w-7xl px-5 py-6">
        <header className="flex flex-col gap-4 border-b pb-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-medium text-primary">Student dashboard</p>
            <h1 className="mt-1 text-3xl font-semibold">Generate, edit, and export academic reports</h1>
          </div>
        </header>
        <div className="mt-6">
          <DashboardClient />
        </div>
      </div>
    </AppShell>
  );
}
