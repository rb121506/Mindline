export default function Loading() {
  return (
    <div className="animate-fade-in">
      <div className="mb-6 h-8 w-40 rounded-lg bg-muted shimmer" />
      <div className="mb-3 h-11 w-full rounded-xl bg-muted shimmer" />
      <div className="grid gap-3">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-28 rounded-2xl border border-border bg-card shimmer"
          />
        ))}
      </div>
    </div>
  );
}
