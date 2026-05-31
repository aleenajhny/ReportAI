import Link from "next/link";

export function FirebaseConfigWarning() {
  return (
    <div className="rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950">
      Firebase is not configured yet. Add `NEXT_PUBLIC_FIREBASE_*` environment variables in Vercel and locally.
      See <Link className="font-medium underline" href="/dashboard">the dashboard</Link> after configuration.
    </div>
  );
}
