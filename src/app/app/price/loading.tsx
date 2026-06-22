export default function Loading() {
  return (
    <div className="p-4 space-y-4 animate-pulse">
      <div className="glass-card rounded-[2rem] p-5 space-y-3">
        <div className="h-3 w-20 bg-muted rounded-full" />
        <div className="h-9 w-32 bg-muted rounded-full" />
        <div className="h-3 w-24 bg-muted rounded-full" />
      </div>
      {[1, 2, 3].map((i) => (
        <div key={i} className="glass-card rounded-[2rem] p-5 flex items-center justify-between">
          <div className="h-4 w-28 bg-muted rounded-full" />
          <div className="h-4 w-16 bg-muted rounded-full" />
        </div>
      ))}
    </div>
  );
}
