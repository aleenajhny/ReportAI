"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { BarChart3, FileText, FolderKanban, LayoutDashboard, Settings, WandSparkles } from "lucide-react";

const nav = [
  { href: "/dashboard?tab=dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard?tab=projects", label: "Projects", icon: FolderKanban },
  { href: "/editor", label: "Live Editor", icon: FileText },
  { href: "/dashboard?tab=quality", label: "Quality", icon: BarChart3 },
  { href: "/dashboard?tab=settings", label: "Settings", icon: Settings },
];

function SidebarNav() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentTab = searchParams.get("tab") || "dashboard";

  return (
    <nav className="mt-8 space-y-1">
      {nav.map((item) => {
        const isEditor = item.href === "/editor";
        const isActive = isEditor
          ? pathname === "/editor"
          : pathname.startsWith("/dashboard") && (
              item.href.includes(`tab=${currentTab}`) || 
              (currentTab === "dashboard" && item.href.includes("tab=dashboard"))
            );

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-all duration-150 ${
              isActive
                ? "bg-primary text-primary-foreground font-semibold shadow-sm"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r bg-card p-4 lg:block">
        <Link href="/" className="flex items-center gap-2 text-lg font-semibold">
          <span className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <WandSparkles className="h-5 w-5" />
          </span>
          ReportAI
        </Link>
        <Suspense fallback={<div className="mt-8 h-40 animate-pulse bg-muted rounded-md" />}>
          <SidebarNav />
        </Suspense>
      </aside>
      <main className="lg:pl-64">{children}</main>
    </div>
  );
}
