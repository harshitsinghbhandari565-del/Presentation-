import GlassCard from "@/components/ui/GlassCard";
import StatusOrb from "@/components/ui/StatusOrb";
import BackupLinks from "@/components/presentation/BackupLinks";
import { Sparkles, Play } from "lucide-react";
import type { Presentation } from "@/types/presentation";

export default function FeaturedPresentation({
  presentation,
}: {
  presentation: Presentation;
}) {
  return (
    <GlassCard variant="featured" className="p-6 md:p-10 relative">
      {/* Featured badge */}
      <div className="absolute top-5 right-5 md:top-8 md:right-8">
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-500/15 border border-indigo-400/25 text-indigo-300 text-xs font-medium">
          <Sparkles size={11} aria-hidden="true" />
          <span>Featured</span>
        </div>
      </div>

      {/* Status indicator */}
      <StatusOrb label="Ready to Present" />
      
      {/* Title */}
      <h1 className="font-[family-name:var(--font-editorial)] text-3xl md:text-5xl lg:text-6xl font-bold leading-[1.1] tracking-tight text-[#f8fafc] mb-3 title-glow">
        {presentation.title}
      </h1>
      
      {/* Metadata */}
      <div className="flex flex-wrap items-center gap-2.5 text-[#94a3b8] mb-5">
        <span className="px-2.5 py-1 rounded-md bg-white/[0.04] border border-white/[0.06] text-sm font-medium">
          {presentation.subject}
        </span>
        <span className="w-1 h-1 rounded-full bg-[#475569]" aria-hidden="true" />
        <span className="text-base">{presentation.topic}</span>
      </div>
      
      {/* Description */}
      <p className="text-[#94a3b8] text-base md:text-lg leading-relaxed mb-6 max-w-2xl">
        {presentation.description}
      </p>
      
      {/* Preview area */}
      <div className="preview-area relative overflow-hidden mb-6 group">
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/40 via-transparent to-slate-950/40" />
        
        {/* Center glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-indigo-500/10 blur-3xl group-hover:bg-indigo-500/15 transition-all duration-700" />
        
        {/* Content */}
        <div className="relative z-10 h-44 md:h-56 flex flex-col items-center justify-center gap-3 p-6">
          <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] group-hover:border-indigo-400/20 group-hover:bg-white/[0.05] transition-all duration-300">
            <Play 
              className="w-8 h-8 md:w-10 md:h-10 text-indigo-300/70 group-hover:text-indigo-300 transition-colors"
              aria-hidden="true"
            />
          </div>
          <span className="text-[#94a3b8] text-sm md:text-base font-medium">
            Click Start to begin
          </span>
        </div>
      </div>
      
      {/* Actions */}
      <BackupLinks presentation={presentation} />
    </GlassCard>
  );
}
