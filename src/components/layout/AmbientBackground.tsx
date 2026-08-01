export default function AmbientBackground() {
  return (
    <div
      className="fixed inset-0 z-0 pointer-events-none overflow-hidden"
      aria-hidden="true"
    >
      {/* Primary ambient orb - top left */}
      <div 
        className="absolute -top-[30%] -left-[20%] w-[70vw] h-[70vw] max-w-[700px] max-h-[700px] rounded-full mesh-blob"
        style={{
          background: 'radial-gradient(circle at 40% 40%, rgba(99, 102, 241, 0.12) 0%, rgba(99, 102, 241, 0.04) 50%, transparent 70%)',
        }}
      />
      
      {/* Secondary orb - right side */}
      <div 
        className="absolute top-[15%] -right-[20%] w-[60vw] h-[60vw] max-w-[600px] max-h-[600px] rounded-full mesh-blob-delay"
        style={{
          background: 'radial-gradient(circle at 60% 50%, rgba(139, 92, 246, 0.08) 0%, rgba(139, 92, 246, 0.02) 50%, transparent 70%)',
        }}
      />
      
      {/* Tertiary orb - bottom */}
      <div 
        className="absolute -bottom-[25%] left-[5%] w-[55vw] h-[55vw] max-w-[550px] max-h-[550px] rounded-full mesh-blob-tertiary"
        style={{
          background: 'radial-gradient(circle at 50% 60%, rgba(52, 211, 153, 0.06) 0%, rgba(52, 211, 153, 0.02) 50%, transparent 70%)',
        }}
      />
      
      {/* Subtle vignette for depth */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse 80% 60% at 50% 40%, transparent 0%, rgba(5, 5, 5, 0.3) 100%)',
        }}
      />
      
      {/* Very subtle noise texture */}
      <div
        className="absolute inset-0 opacity-[0.012]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          backgroundSize: "150px 150px",
        }}
      />
    </div>
  );
}
