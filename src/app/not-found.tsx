import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-6">
      <h1 className="font-[family-name:var(--font-editorial)] text-5xl font-bold text-[#f8fafc]">
        404
      </h1>
      <p className="text-[#94a3b8] text-lg">Page not found.</p>
      <Link
        href="/"
        className="px-5 py-3 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white font-medium transition-colors"
      >
        Back to Hub
      </Link>
    </div>
  );
}
