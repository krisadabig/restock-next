export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <div className="glass-card p-8 max-w-sm w-full text-center space-y-4">
        <h1 className="text-2xl font-bold text-foreground">Page not found</h1>
        <p className="text-muted-foreground">
          This page doesn&apos;t exist or has been moved.
        </p>
        <a
          href="/"
          className="inline-block bg-primary text-white rounded-xl px-6 py-3 font-medium"
        >
          Go home
        </a>
      </div>
    </div>
  );
}
