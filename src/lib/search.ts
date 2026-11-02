import type { EducationalDocument } from "@/types/document";

export const SORT_OPTIONS = ["relevance", "newest", "title"] as const;
export type SortOption = (typeof SORT_OPTIONS)[number];
export interface LibraryFilters {
  q: string;
  subject: string;
  course: string;
  semester: string;
  topic: string;
  type: string;
  platform: string;
  featured: boolean;
  sort: SortOption;
  page: number;
}
export const DEFAULT_FILTERS: LibraryFilters = {
  q: "", subject: "", course: "", semester: "", topic: "", type: "", platform: "", featured: false, sort: "relevance", page: 1,
};
export const PAGE_SIZE = 12;

export function normalizeSearch(value: string): string {
  return value.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[–—-]/g, " ").replace(/\s+/g, " ").trim();
}

export function matchesSearch(document: EducationalDocument, query: string): boolean {
  const terms = normalizeSearch(query).split(" ").filter(Boolean);
  if (!terms.length) return true;
  const haystack = normalizeSearch([document.title, document.description, document.subject, document.course, document.semester, document.topic, document.documentType, document.platform, ...document.tags, ...document.keywords].filter(Boolean).join(" "));
  return terms.every(term => haystack.includes(term));
}

/** Weighted relevance mirror of the proposed SQL setweight/ts_rank ordering. */
export function relevanceScore(document: EducationalDocument, query: string): number {
  const terms = normalizeSearch(query).split(" ").filter(Boolean);
  if (!terms.length) return 0;
  const fields: [string, number][] = [
    [document.title, 1.0],
    [[document.topic, ...document.keywords, ...document.tags].filter(Boolean).join(" "), 0.6],
    [[document.subject, document.course, document.semester, document.documentType, document.platform].filter(Boolean).join(" "), 0.35],
    [document.description, 0.15],
  ];
  let score = 0;
  for (const term of terms) {
    let termScore = 0;
    for (const [value, weight] of fields) {
      const normalized = normalizeSearch(value ?? "");
      if (!normalized) continue;
      if (normalized.split(" ").includes(term)) termScore = Math.max(termScore, weight);
      else if (normalized.includes(term)) termScore = Math.max(termScore, weight * 0.6);
    }
    if (termScore === 0) return 0;
    score += termScore;
  }
  return score / terms.length;
}

export function searchDocuments(documents: EducationalDocument[], query: string) {
  return documents
    .filter(document => matchesSearch(document, query))
    .sort((a, b) => relevanceScore(b, query) - relevanceScore(a, query) || a.title.localeCompare(b.title));
}

export function filterDocuments(documents: EducationalDocument[], filters: LibraryFilters) {
  const result = searchDocuments(documents, filters.q).filter(document =>
    (!filters.subject || document.subjectSlug === filters.subject) &&
    (!filters.course || document.courseSlug === filters.course) &&
    (!filters.semester || document.semester === filters.semester) &&
    (!filters.topic || document.topic === filters.topic) &&
    (!filters.type || document.documentType === filters.type) &&
    (!filters.platform || document.platform === filters.platform) &&
    (!filters.featured || document.isFeatured)
  );
  return result.sort((a, b) => {
    if (filters.sort === "title") return a.title.localeCompare(b.title);
    if (filters.sort === "newest") return (b.createdAt ? Date.parse(b.createdAt) : 0) - (a.createdAt ? Date.parse(a.createdAt) : 0) || a.title.localeCompare(b.title);
    if (filters.q) return relevanceScore(b, filters.q) - relevanceScore(a, filters.q) || a.title.localeCompare(b.title);
    return Number(b.isFeatured) - Number(a.isFeatured) || a.title.localeCompare(b.title);
  });
}

type SearchParams = Record<string, string | string[] | undefined>;
export function parseFilters(params: SearchParams): LibraryFilters {
  const read = (key: string, max = 120) => { const v = params[key]; return typeof v === "string" ? v.trim().slice(0, max) : ""; };
  const sort = read("sort");
  const page = Number(read("page"));
  return {
    q: read("q", 200), subject: read("subject"), course: read("course"), semester: read("semester"), topic: read("topic"), type: read("type"), platform: read("platform"),
    featured: read("featured") === "true",
    sort: SORT_OPTIONS.includes(sort as SortOption) ? sort as SortOption : "relevance",
    page: Number.isSafeInteger(page) && page > 0 ? Math.min(page, 10000) : 1,
  };
}

export function libraryHref(filters: Partial<LibraryFilters>, resetPage = true): string {
  const merged = { ...DEFAULT_FILTERS, ...filters };
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(merged)) {
    if (key === "page" && resetPage) continue;
    if (value && value !== "relevance" && !(key === "page" && value === 1)) query.set(key, String(value));
  }
  return `/library${query.size ? `?${query}` : ""}`;
}

export function countActiveFilters(filters: LibraryFilters) {
  return [filters.subject, filters.course, filters.semester, filters.topic, filters.type, filters.platform].filter(Boolean).length + Number(filters.featured);
}
