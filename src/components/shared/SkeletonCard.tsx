export function SkeletonCard() {
  return (
    <div className="flex items-center gap-4 px-5 py-4 animate-pulse">
      <div className="h-8 w-8 rounded-lg bg-muted shrink-0" />
      <div className="flex-1 space-y-2 min-w-0">
        <div className="h-3.5 bg-muted rounded w-2/3" />
        <div className="h-3 bg-muted rounded w-1/3" />
      </div>
      <div className="h-3.5 bg-muted rounded w-16 shrink-0" />
    </div>
  );
}

export function SkeletonList({ count = 5 }: { count?: number }) {
  return (
    <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
      <div className="divide-y divide-border">
        {Array.from({ length: count }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    </div>
  );
}

export function SkeletonStat() {
  return (
    <div className="bg-card rounded-xl border border-border p-4 shadow-card animate-pulse">
      <div className="flex items-center gap-2 mb-2">
        <div className="h-4 w-4 rounded bg-muted" />
        <div className="h-3 bg-muted rounded w-20" />
      </div>
      <div className="h-6 bg-muted rounded w-12" />
    </div>
  );
}
