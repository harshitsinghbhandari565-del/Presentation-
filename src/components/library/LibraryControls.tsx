"use client";
import { useRef, useEffect, useTransition, useSyncExternalStore, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Search, SlidersHorizontal, X, ArrowRight, LoaderCircle, LayoutGrid, Rows3 } from "lucide-react";
import Link from "next/link";
import { countActiveFilters, libraryHref, type LibraryFilters } from "@/lib/search";
import type { CatalogFacets } from "@/types/document";

type ViewMode = "grid" | "list";
const VIEW_KEY = "presentation-hub-library-view";
const viewListeners = new Set<() => void>();

function subscribeView(cb: () => void) {
  viewListeners.add(cb);
  const onStorage = (e: StorageEvent) => {
    if (e.key === VIEW_KEY || e.key === null) cb();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    viewListeners.delete(cb);
    window.removeEventListener("storage", onStorage);
  };
}

function getViewSnapshot(): ViewMode {
  try {
    const val = window.localStorage.getItem(VIEW_KEY);
    if (val === "list" || val === "grid") return val;
  } catch {}
  return "grid";
}

export default function LibraryControls({
  filters,
  facets,
  total,
  children,
  reviewMode,
  searchLimited = false,
}: {
  filters: LibraryFilters;
  facets: CatalogFacets;
  total: number;
  children: ReactNode;
  reviewMode?: string;
  searchLimited?: boolean;
}) {
  const router = useRouter();
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const input = useRef<HTMLInputElement>(null);
  const disclosure = useRef<HTMLDetailsElement>(null);
  const [pending, startTransition] = useTransition();
  const viewMode = useSyncExternalStore(subscribeView, getViewSnapshot, () => "grid" as ViewMode);
  const latestFilters = useRef(filters);

  useEffect(() => {
    latestFilters.current = filters;
  }, [filters]);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  useEffect(() => {
    if (input.current && !timer.current) input.current.value = filters.q;
  }, [filters.q]);

  // Press "/" anywhere outside inputs/dialogs to focus the library search bar
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "/" || e.metaKey || e.ctrlKey || e.altKey) return;
      const target = e.target as HTMLElement | null;
      if (
        !target ||
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.tagName === "SELECT" ||
        target.isContentEditable ||
        document.querySelector("dialog[open]")
      ) {
        return;
      }
      e.preventDefault();
      input.current?.focus();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    const media = window.matchMedia("(min-width: 761px)");
    const sync = () => {
      if (disclosure.current) disclosure.current.open = media.matches;
    };
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  const withReview = (href: string) =>
    reviewMode ? `${href}${href.includes("?") ? "&" : "?"}fixture=${encodeURIComponent(reviewMode)}` : href;

  const apply = (changes: Partial<LibraryFilters>) => {
    if (timer.current) clearTimeout(timer.current);
    startTransition(() =>
      router.replace(withReview(libraryHref({ ...latestFilters.current, ...changes })), { scroll: false }),
    );
  };

  const toggleView = (mode: ViewMode) => {
    try {
      window.localStorage.setItem(VIEW_KEY, mode);
    } catch {}
    viewListeners.forEach(cb => cb());
  };

  const fields = [
    { key: "subject", label: "Subject", options: facets.subjects.map(s => ({ value: s.slug, label: s.name })) },
    { key: "course", label: "Course", options: facets.courses.map(c => ({ value: c.slug, label: c.name })) },
    { key: "semester", label: "Semester", options: facets.semesters.map(s => ({ value: s, label: s })) },
    { key: "topic", label: "Topic", options: facets.topics.map(t => ({ value: t, label: t })) },
    { key: "type", label: "Document type", options: facets.types.map(t => ({ value: t, label: t })) },
    { key: "platform", label: "Source platform", options: facets.platforms.map(p => ({ value: p, label: p })) },
  ] as const;

  const active = countActiveFilters(filters);

  // Plain serializable chip descriptors (no refs read during render)
  const activeChips: { id: string; label: string; changes: Partial<LibraryFilters>; resetInput?: boolean }[] = [];
  if (filters.q) {
    activeChips.push({
      id: "q",
      label: `“${filters.q}”`,
      changes: { q: "" },
      resetInput: true,
    });
  }
  fields.forEach(field => {
    const val = filters[field.key];
    if (!val) return;
    const match = field.options.find(o => o.value === val)?.label ?? val;
    activeChips.push({
      id: field.key,
      label: `${field.label}: ${match}`,
      changes: { [field.key]: "" },
    });
  });
  if (filters.featured) {
    activeChips.push({
      id: "featured",
      label: "Featured only",
      changes: { featured: false },
    });
  }

  return (
    <div className="library-controls">
      <form
        className="library-search-form"
        role="search"
        onSubmit={event => {
          event.preventDefault();
          const q = String(new FormData(event.currentTarget).get("q") ?? "");
          apply({ q });
        }}
      >
        <Search size={21} aria-hidden="true" />
        <input
          ref={input}
          name="q"
          type="search"
          defaultValue={filters.q}
          maxLength={200}
          placeholder="Search titles, topics, keywords…"
          aria-label="Search the resource library"
          onChange={event => {
            const q = event.target.value;
            if (timer.current) clearTimeout(timer.current);
            timer.current = setTimeout(() => {
              timer.current = null;
              apply({ q });
            }, 300);
          }}
        />
        <kbd className="search-slash-hint" aria-hidden="true">/</kbd>
        <button type="submit" className="search-submit" aria-label="Submit search">
          {pending ? <LoaderCircle size={18} className="spin" /> : <ArrowRight size={19} />}
        </button>
      </form>

      <div className="library-layout">
        <aside className="filter-sidebar">
          <details ref={disclosure}>
            <summary>
              <SlidersHorizontal size={17} />
              Refine your search
              {active > 0 && <span className="filter-count">{active}</span>}
            </summary>
            <div className="filter-fields">
              <div className="filter-title">
                <h2>Filters</h2>
                {(active > 0 || filters.q) && (
                  <Link href={withReview("/library")} className="clear-filters">
                    <X size={12} />
                    Clear all
                  </Link>
                )}
              </div>
              {fields.map(field => (
                <label className="filter-field" key={field.key}>
                  <span>{field.label}</span>
                  <select
                    aria-label={field.label}
                    value={filters[field.key]}
                    onChange={event => apply({ [field.key]: event.target.value })}
                  >
                    <option value="">All {field.label.toLowerCase()}s</option>
                    {field.options.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  {field.options.length === 0 && <small>Not specified in this collection</small>}
                </label>
              ))}
              <label className="featured-checkbox">
                <input
                  type="checkbox"
                  checked={filters.featured}
                  onChange={event => apply({ featured: event.target.checked })}
                />
                <span>Featured resources only</span>
              </label>
            </div>
          </details>
          <div className="filter-note">
            <BookIcon />
            <p>
              A smaller shelf.
              <br />A more thoughtful collection.
            </p>
            <span>Every resource links to its original source.</span>
          </div>
        </aside>

        <div className="library-results" data-pending={pending || undefined} data-view={viewMode}>
          <div className="results-toolbar">
            <p role="status" aria-live="polite" aria-atomic="true">
              {pending ? (
                "Updating results…"
              ) : (
                <>
                  <strong>{total}</strong> resource{total !== 1 ? "s" : ""}
                  {filters.q && (
                    <>
                      {" "}
                      for <q>{filters.q}</q>
                    </>
                  )}
                </>
              )}
            </p>
            <div className="results-toolbar-right">
              <div className="view-toggle-group" role="group" aria-label="Result layout">
                <button
                  type="button"
                  className={`view-toggle-btn ${viewMode === "grid" ? "active" : ""}`}
                  aria-label="Grid layout"
                  aria-pressed={viewMode === "grid"}
                  onClick={() => toggleView("grid")}
                >
                  <LayoutGrid size={14} aria-hidden="true" />
                </button>
                <button
                  type="button"
                  className={`view-toggle-btn ${viewMode === "list" ? "active" : ""}`}
                  aria-label="List layout"
                  aria-pressed={viewMode === "list"}
                  onClick={() => toggleView("list")}
                >
                  <Rows3 size={14} aria-hidden="true" />
                </button>
              </div>
              <label>
                Sort by{" "}
                <select
                  aria-label="Sort resources"
                  value={filters.sort}
                  onChange={event => apply({ sort: event.target.value as LibraryFilters["sort"] })}
                >
                  <option value="relevance">Recommended</option>
                  <option value="newest">Recently added</option>
                  <option value="title">Title, A–Z</option>
                </select>
              </label>
            </div>
          </div>

          {activeChips.length > 0 && (
            <div className="active-filter-chips" aria-label="Active filters">
              {activeChips.map(chip => (
                <button
                  key={chip.id}
                  type="button"
                  className="active-filter-chip"
                  onClick={() => {
                    if (chip.resetInput && input.current) input.current.value = "";
                    apply(chip.changes);
                  }}
                  aria-label={`Remove filter ${chip.label}`}
                >
                  <span>{chip.label}</span>
                  <X size={12} aria-hidden="true" />
                </button>
              ))}
            </div>
          )}

          {searchLimited && (
            <p className="search-fallback-note" role="status" aria-live="polite">
              Search is temporarily limited to document fields; subject and course names are not included.{" "}
              {filters.sort === "newest"
                ? "These results use your newest-first sort."
                : filters.sort === "title"
                  ? "These results use your title sort."
                  : "These results are ordered by title rather than relevance."}
            </p>
          )}
          <div className="library-results-content" aria-busy={pending}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

function BookIcon() {
  return <SlidersHorizontal size={22} strokeWidth={1.3} aria-hidden="true" />;
}
