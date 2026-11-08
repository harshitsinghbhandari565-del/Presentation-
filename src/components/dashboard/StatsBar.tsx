import { getCatalogHighlights, getFacets } from "@/lib/catalog";
export default async function StatsBar() {
  const [{ total, featured }, facets] = await Promise.all([getCatalogHighlights(), getFacets()]);
  const stats = [["Resources", total], ["Featured on landing", featured.length], ["Subjects", facets.subjects.length]];
  return <div className="admin-stats">{stats.map(([label, value]) => <div className="admin-stat" key={label}><span>{label}</span><strong>{value}</strong></div>)}</div>;
}
