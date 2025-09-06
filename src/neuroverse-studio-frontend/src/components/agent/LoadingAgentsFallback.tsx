export function LoadingAgentsFallback() {
  return (
    <div
      className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
      role="status"
      aria-label="Loading AI agents"
    >
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="glassmorphic border-neon-blue/20 rounded-lg p-6 skeleton"
        >
          <div className="space-y-4">
            <div className="w-12 h-12 bg-neon-blue/20 rounded-full"></div>
            <div className="h-4 bg-neon-blue/20 rounded w-3/4"></div>
            <div className="h-3 bg-neon-blue/10 rounded w-full"></div>
            <div className="h-3 bg-neon-blue/10 rounded w-2/3"></div>
          </div>
        </div>
      ))}
      <span className="sr-only">Loading AI agents...</span>
    </div>
  );
}
