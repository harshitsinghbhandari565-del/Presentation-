export default function AmbientBackground() {
  return (
    <div
      className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-[var(--color-surface-base)]"
      aria-hidden="true"
    >
      {/* Primary ambient orb - top left */}
      <div 
        className="absolute -top-[20%] -left-[10%] w-[80vw] h-[80vw] max-w-[1000px] max-h-[1000px] rounded-full mesh-blob opacity-30"
        style={{
          background: 'radial-gradient(circle at 40% 40%, rgba(99, 102, 241, 0.08) 0%, rgba(99, 102, 241, 0.02) 50%, transparent 80%)',
        }}
      />
      
      {/* Secondary orb - right side */}
      <div 
        className="absolute top-[10%] -right-[15%] w-[60vw] h-[60vw] max-w-[800px] max-h-[800px] rounded-full mesh-blob-delay opacity-20"
        style={{
          background: 'radial-gradient(circle at 60% 50%, rgba(232, 100, 10, 0.05) 0%, rgba(232, 100, 10, 0.01) 50%, transparent 80%)',
        }}
      />
      
      {/* Subtle vignette for depth */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse 80% 60% at 50% 40%, transparent 0%, var(--color-surface-base) 100%)',
          opacity: 0.6
        }}
      />
      
      {/* Minimal noise texture */}
      <div
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          backgroundSize: "180px 180px",
        }}
      />
    </div>
  );
}
