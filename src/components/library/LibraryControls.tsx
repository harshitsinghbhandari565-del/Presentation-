"use client";
import { useRef, useEffect, useTransition, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Search, SlidersHorizontal, X, ArrowRight, LoaderCircle } from "lucide-react";
import Link from "next/link";
import { countActiveFilters, libraryHref, type LibraryFilters } from "@/lib/search";
import type { CatalogFacets } from "@/types/document";
export default function LibraryControls({ filters, facets, total, children }: { filters: LibraryFilters; facets: CatalogFacets; total: number; children: ReactNode }) {
  const router = useRouter();
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const input = useRef<HTMLInputElement>(null);
  const disclosure = useRef<HTMLDetailsElement>(null);
  const [pending, startTransition] = useTransition();
  const latestFilters = useRef(filters);
  useEffect(() => { latestFilters.current = filters; }, [filters]);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);
  useEffect(() => { if (input.current && !timer.current) input.current.value = filters.q; }, [filters.q]);
  useEffect(() => {
    const media = window.matchMedia("(min-width: 761px)");
    const sync = () => { if (disclosure.current) disclosure.current.open = media.matches; };
    sync(); media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);
  const apply = (changes: Partial<LibraryFilters>) => { if (timer.current) clearTimeout(timer.current); startTransition(() => router.replace(libraryHref({ ...latestFilters.current, ...changes }), { scroll: false })); };
  const fields = [
    { key: "subject", label: "Subject", options: facets.subjects.map(s => ({ value: s.slug, label: s.name })) },
    { key: "course", label: "Course", options: facets.courses.map(c => ({ value: c.slug, label: c.name })) },
    { key: "semester", label: "Semester", options: facets.semesters.map(s => ({ value: s, label: s })) },
    { key: "topic", label: "Topic", options: facets.topics.map(t => ({ value: t, label: t })) },
    { key: "type", label: "Document type", options: facets.types.map(t => ({ value: t, label: t })) },
    { key: "platform", label: "Source platform", options: facets.platforms.map(p => ({ value: p, label: p })) },
  ] as const;
  const active = countActiveFilters(filters);
  return <div className="library-controls">
    <form className="library-search-form" role="search" onSubmit={event => { event.preventDefault(); const q = String(new FormData(event.currentTarget).get("q") ?? ""); apply({ q }); }}>
      <Search size={21} aria-hidden="true" /><input ref={input} name="q" type="search" defaultValue={filters.q} maxLength={200} placeholder="Search titles, topics, keywords…" aria-label="Search the resource library" onChange={event => { const q = event.target.value; if (timer.current) clearTimeout(timer.current); timer.current = setTimeout(() => { timer.current = null; apply({ q }); }, 300); }} /><button type="submit" className="search-submit" aria-label="Submit search">{pending ? <LoaderCircle size={18} className="spin" /> : <ArrowRight size={19} />}</button>
    </form>
    <div className="library-layout"><aside className="filter-sidebar"><details ref={disclosure}><summary><SlidersHorizontal size={17} />Refine your search{active > 0 && <span className="filter-count">{active}</span>}</summary><div className="filter-fields"><div className="filter-title"><h2>Filters</h2>{(active > 0 || filters.q) && <Link href="/library" className="clear-filters"><X size={12} />Clear all</Link>}</div>{fields.map(field => <label className="filter-field" key={field.key}><span>{field.label}</span><select aria-label={field.label} value={filters[field.key]} onChange={event => apply({ [field.key]: event.target.value })}><option value="">All {field.label.toLowerCase()}{field.label === "Subject" ? "s" : field.label === "Course" ? "s" : field.label === "Document type" ? "s" : field.label === "Source platform" ? "s" : "s"}</option>{field.options.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}</select>{field.options.length === 0 && <small>Not specified in this collection</small>}</label>)}<label className="featured-checkbox"><input type="checkbox" checked={filters.featured} onChange={event => apply({ featured: event.target.checked })} /><span>Featured resources only</span></label></div></details><div className="filter-note"><BookIcon /><p>A smaller shelf.<br />A more thoughtful collection.</p><span>Every resource links to its original source.</span></div></aside>
      <div className="library-results" aria-busy={pending}><div className="results-toolbar"><p role="status" aria-live="polite"><strong>{total}</strong> resource{total !== 1 ? "s" : ""}{filters.q && <> for <q>{filters.q}</q></>}</p><label>Sort by <select aria-label="Sort resources" value={filters.sort} onChange={event => apply({ sort: event.target.value as LibraryFilters["sort"] })}><option value="relevance">Recommended</option><option value="newest">Recently added</option><option value="title">Title, A–Z</option></select></label></div>{children}</div>
    </div>
  </div>;
}
function BookIcon() { return <SlidersHorizontal size={22} strokeWidth={1.3} aria-hidden="true" />; }
