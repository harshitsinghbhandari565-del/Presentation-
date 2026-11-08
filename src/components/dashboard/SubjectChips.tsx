"use client";
export default function SubjectChips({ subjects, active, onSelect }: { subjects: string[]; active: string; onSelect: (subject: string) => void }) {
  return <div className="detail-tags" role="group" aria-label="Filter by subject">{["All", ...subjects].map(subject => <button key={subject} onClick={() => onSelect(subject)} aria-pressed={active === subject} style={active === subject ? { color: "var(--accent)", borderColor: "var(--accent)", background: "var(--accent-soft)" } : undefined}>{subject}</button>)}</div>;
}
