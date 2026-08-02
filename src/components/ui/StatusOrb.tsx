export default function StatusOrb({
  label = "Ready to Present",
}: {
  label?: string;
}) {
  return (
    <div className="flex items-center gap-2.5 mb-3">
      <span className="relative flex h-2.5 w-2.5" aria-label="Live status">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400" />
      </span>
      <span className="uppercase tracking-[0.12em] text-[10px] font-medium text-[#94a3b8]">
        {label}
      </span>
    </div>
  );
}
