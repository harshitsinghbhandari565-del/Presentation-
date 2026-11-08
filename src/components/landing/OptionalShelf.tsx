import { BookOpen } from "lucide-react";

/**
 * Clean, static subjects showcase. No 3D, no WebGL — just a flat grid of
 * subject cards showing name + resource count. Content is always visible
 * and keyboard-navigable.
 */
export default function OptionalShelf({ subjects }: { subjects: { name: string; count: number }[] }) {
  const list = subjects.length ? subjects : [{ name: "English", count: 1 }];
  return <div className="optional-shelf static-shelf-grid">
    <div className="optional-shelf-copy">
      <div className="eyebrow"><BookOpen size={14} />A DIFFERENT POINT OF VIEW</div>
      <h3>See the shelf <em>take shape.</em></h3>
      <p>Every subject, in one organized view. The library stays fast, flat and keyboard-first.</p>
    </div>
    <div className="optional-shelf-stage static">
      {list.slice(0, 5).map(s => <div key={s.name} className="static-shelf-card">
        <strong>{s.name}</strong>
        <small>{s.count} resource{s.count !== 1 ? "s" : ""}</small>
      </div>)}
    </div>
  </div>;
}
