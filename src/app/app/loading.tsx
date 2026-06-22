export default function Loading() {
  return (
    <div className="p-4 space-y-4 animate-pulse">
      {/* category header */}
      <div className="h-3 w-24 bg-muted rounded-full mt-2" />
      {[1, 2, 3].map((i) => (
        <div key={i} className="glass-card rounded-[1.75rem] p-5 flex items-start justify-between gap-4">
          <div className="flex-1 space-y-2">
            <div className="h-4 w-32 bg-muted rounded-full" />
            <div className="h-7 w-16 bg-muted rounded-full" />
            <div className="h-3 w-24 bg-muted rounded-full" />
          </div>
        </div>
      ))}
      <div className="h-3 w-20 bg-muted rounded-full mt-4" />
      {[4, 5].map((i) => (
        <div key={i} className="glass-card rounded-[1.75rem] p-5 flex items-start justify-between gap-4">
          <div className="flex-1 space-y-2">
            <div className="h-4 w-28 bg-muted rounded-full" />
            <div className="h-7 w-12 bg-muted rounded-full" />
            <div className="h-3 w-20 bg-muted rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}
