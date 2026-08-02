import data from "@/data/presentations.json";

export default function StatsBar() {
  const presentations = data.presentations || [];
  const pinnedCount = presentations.filter((p) => p.pinned).length;
  const subjects = new Set(presentations.map((p) => p.subject));

  return (
    <div className="grid grid-cols-3 gap-3 text-sm">
      <div className="bg-white/[0.03] border border-white/[0.08] rounded-xl p-3">
        <div className="text-[#475569] text-xs">Presentations</div>
        <div className="text-xl font-semibold text-[#f8fafc]">
          {presentations.length}
        </div>
      </div>
      <div className="bg-white/[0.03] border border-white/[0.08] rounded-xl p-3">
        <div className="text-[#475569] text-xs">Pinned</div>
        <div className="text-xl font-semibold text-[#f8fafc]">
          {pinnedCount}
        </div>
      </div>
      <div className="bg-white/[0.03] border border-white/[0.08] rounded-xl p-3">
        <div className="text-[#475569] text-xs">Subjects</div>
        <div className="text-xl font-semibold text-[#f8fafc]">
          {subjects.size}
        </div>
      </div>
    </div>
  );
}
