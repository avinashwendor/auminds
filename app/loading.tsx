export default function Loading() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/80 backdrop-blur-md">
      <div className="relative flex items-center justify-center">
        <div className="h-14 w-14 animate-spin rounded-full border-4 border-muted border-t-primary" />
        <span className="signal-dot absolute" />
      </div>
      <p className="mt-6 font-mono text-xs font-bold uppercase tracking-widest text-muted-foreground animate-pulse">
        Loading Concourse...
      </p>
    </div>
  );
}
