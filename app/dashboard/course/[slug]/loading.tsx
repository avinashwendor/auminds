import { Loader2 } from 'lucide-react';

export default function CourseLoading() {
  return (
    <main className="grid min-h-screen place-items-center bg-slate-950 px-6 text-slate-100" aria-live="polite" aria-busy="true">
      <div className="flex items-center gap-3 border border-border bg-card px-5 py-4">
        <Loader2 className="size-5 animate-spin text-primary" aria-hidden="true" />
        <div>
          <p className="board-label text-primary">Course workspace</p>
          <p className="mt-1 text-sm font-semibold">Loading lesson…</p>
        </div>
      </div>
    </main>
  );
}
