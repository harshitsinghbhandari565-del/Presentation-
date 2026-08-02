export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-2 border-white/20 border-t-indigo-400 rounded-full animate-spin" />
        <p className="text-[#94a3b8] text-sm">Loading...</p>
      </div>
    </div>
  );
}
