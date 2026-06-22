export default function Loading() {
  return (
    <div className="p-4 space-y-6 animate-pulse">
      <div className="glass-card rounded-[2rem] p-5 space-y-4">
        <div className="h-3 w-20 bg-muted rounded-full" />
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 bg-muted rounded-2xl shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-28 bg-muted rounded-full" />
            <div className="h-3 w-20 bg-muted rounded-full" />
          </div>
        </div>
      </div>
      {[1, 2].map((i) => (
        <div key={i} className="glass-card rounded-[2rem] overflow-hidden divide-y divide-primary/5">
          {[1, 2, 3].map((j) => (
            <div key={j} className="p-5 flex items-center justify-between">
              <div className="h-4 w-32 bg-muted rounded-full" />
              <div className="h-4 w-10 bg-muted rounded-full" />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
