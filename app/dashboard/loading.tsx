import { Loader2 } from 'lucide-react';

export default function DashboardLoading() {
  return (
    <main className="grid min-h-screen place-items-center bg-background px-6 text-foreground" aria-live="polite" aria-busy="true">
      <div className="flex items-center gap-3 border border-border bg-card px-5 py-4">
        <Loader2 className="size-5 animate-spin text-primary" aria-hidden="true" />
        <div>
          <p className="board-label text-primary">Learning network</p>
          <p className="mt-1 text-sm font-semibold">Loading your workspace…</p>
        </div>
      </div>
    </main>
  );
}
