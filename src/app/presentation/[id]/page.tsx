import Link from "next/link";
import data from "@/data/presentations.json";
import BackupLinks from "@/components/presentation/BackupLinks";
import { ArrowLeft, Play, Sparkles, ExternalLink } from "lucide-react";
import type { Presentation as PresentationType } from "@/types/presentation";

export default async function FocusPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const presentation = (data.presentations as PresentationType[]).find(
    (p) => p.id === id
  );

  if (!presentation) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-5">
        <div className="text-6xl font-[family-name:var(--font-editorial)] font-bold text-[#f8fafc]">
          404
        </div>
        <p className="text-[#94a3b8]">Presentation not found.</p>
        <Link
          href="/"
          className="px-5 py-2.5 rounded-lg bg-indigo-500 hover:bg-indigo-400 text-white text-sm font-medium transition-colors"
        >
          Back to Hub
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Navigation */}
      <div className="flex items-center justify-between mb-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-[#94a3b8] hover:text-[#f8fafc] hover:bg-white/[0.04] transition-all text-sm group"
        >
          <ArrowLeft size={15} className="group-hover:-translate-x-0.5 transition-transform" aria-hidden="true" />
          Back to Hub
        </Link>
        
        <div className="flex items-center gap-2">
          {presentation.pinned && (
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-amber-500/10 border border-amber-400/20 text-amber-300 text-xs font-medium">
              <Sparkles size={10} aria-hidden="true" />
              Pinned
            </div>
          )}
          <span className="px-2 py-1 rounded-md bg-white/[0.04] border border-white/[0.06] text-xs text-[#94a3b8]">
            {presentation.platform}
          </span>
        </div>
      </div>

      {/* Title section */}
      <div className="mb-8">
        <h1 className="font-[family-name:var(--font-editorial)] text-4xl md:text-6xl font-bold leading-[1.08] tracking-tight text-[#f8fafc] mb-4 title-glow">
          {presentation.title}
        </h1>
        
        <div className="flex flex-wrap items-center gap-3 text-[#94a3b8]">
          <span className="px-3 py-1.5 rounded-lg bg-indigo-500/10 border border-indigo-400/15 text-indigo-300 font-medium text-sm">
            {presentation.subject}
          </span>
          <span className="text-lg">{presentation.topic}</span>
        </div>
      </div>

      {/* Preview area */}
      <div className="preview-area relative overflow-hidden mb-8 group">
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/30 via-transparent to-slate-950/30" />
        
        {/* Center glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-48 rounded-full bg-indigo-500/8 blur-3xl group-hover:bg-indigo-500/12 transition-all duration-500" />
        
        {/* Content */}
        <div className="relative z-10 aspect-video max-h-80 flex flex-col items-center justify-center gap-4 p-8">
          <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.06] group-hover:border-indigo-400/20 group-hover:bg-white/[0.05] transition-all duration-300">
            <Play 
              className="w-12 h-12 text-indigo-300/60 group-hover:text-indigo-300/80 transition-colors"
              aria-hidden="true"
            />
          </div>
          <div className="text-center">
            <span className="text-[#94a3b8] text-base font-medium block">
              Ready to Present
            </span>
            <span className="text-[#475569] text-sm">
              Click below to start
            </span>
          </div>
        </div>
      </div>

      {/* Description */}
      <p className="text-[#94a3b8] text-lg leading-relaxed mb-6 max-w-3xl">
        {presentation.description}
      </p>

      {/* Tags */}
      {presentation.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-8" role="list" aria-label="Tags">
          {presentation.tags.map((tag) => (
            <span
              key={tag}
              role="listitem"
              className="px-3 py-1.5 rounded-lg bg-white/[0.02] border border-white/[0.06] text-sm text-[#94a3b8]"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Primary actions */}
      <div className="glass-card p-6 mb-6">
        <h2 className="font-[family-name:var(--font-editorial)] text-xl font-semibold text-[#f8fafc] mb-4">
          Launch Presentation
        </h2>
        <BackupLinks presentation={presentation} />
      </div>

      {/* Backup info */}
      {presentation.backupLinks && presentation.backupLinks.length > 0 && (
        <div className="glass-card glass-card-utility p-5">
          <h3 className="text-sm font-medium text-[#f8fafc] mb-3 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" aria-hidden="true" />
            Backup Options
          </h3>
          <div className="space-y-3">
            {presentation.backupLinks.map((backup) => (
              <div
                key={backup.url}
                className="flex items-start gap-3 p-3 rounded-lg bg-white/[0.02] border border-white/[0.04]"
              >
                <div className="p-1.5 rounded-md bg-indigo-500/10 text-indigo-400 mt-0.5">
                  <ExternalLink size={14} aria-hidden="true" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[#f8fafc] text-sm font-medium">
                    {backup.label}
                  </div>
                  {backup.description && (
                    <div className="text-[#475569] text-xs mt-0.5">
                      {backup.description}
                    </div>
                  )}
                </div>
                <a
                  href={backup.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-md bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] text-xs text-[#f8fafc] transition-colors shrink-0"
                >
                  Open
                </a>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
