export default function AmbientBackground() {
  return (
    <div
      className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-[var(--color-surface-base)]"
      aria-hidden="true"
    >
      {/* Texture Layer */}
      <div
        className="absolute inset-0 opacity-[0.03] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.6' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />

      {/* Main Accent - Top Left */}
      <div 
        className="absolute -top-[10%] -left-[10%] w-[70vw] h-[70vw] max-w-[1200px] max-h-[1200px] rounded-full blur-[120px] opacity-40 mix-blend-screen"
        style={{
          background: 'radial-gradient(circle at center, rgba(99, 102, 241, 0.15) 0%, rgba(139, 92, 246, 0.05) 40%, transparent 70%)',
        }}
      />
      
      {/* Secondary Accent - Right Center */}
      <div 
        className="absolute top-[20%] -right-[5%] w-[50vw] h-[50vw] max-w-[800px] max-h-[800px] rounded-full blur-[100px] opacity-30 mix-blend-screen animate-pulse"
        style={{
          background: 'radial-gradient(circle at center, rgba(255, 85, 0, 0.1) 0%, rgba(245, 158, 11, 0.02) 50%, transparent 80%)',
          animationDuration: '10s'
        }}
      />
      
      {/* Tertiary Accent - Bottom Left */}
      <div 
        className="absolute bottom-[5%] left-[5%] w-[40vw] h-[40vw] max-w-[600px] max-h-[600px] rounded-full blur-[80px] opacity-20 mix-blend-screen"
        style={{
          background: 'radial-gradient(circle at center, rgba(16, 185, 129, 0.08) 0%, transparent 70%)',
        }}
      />

      {/* Vignette */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 50% 50%, transparent 0%, rgba(0, 0, 0, 0.4) 100%)'
        }}
      />
    </div>
  );
}
