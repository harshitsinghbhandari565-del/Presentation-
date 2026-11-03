import test from "node:test";
import assert from "node:assert/strict";
import { createClient } from "@supabase/supabase-js";
import { compatibilityDocuments, deriveFacets, getCatalogHighlights, getRelatedDocuments, queryCatalog, searchCatalog } from "../../src/lib/catalog";
import { getAdminDocuments, getCategories, type AdminClient } from "../../src/lib/admin/repository";
import { DEFAULT_FILTERS, filterDocuments, searchDocuments } from "../../src/lib/search";
import type { EducationalDocument } from "../../src/types/document";

const id = (n: number) => `00000000-0000-4000-8000-${n.toString().padStart(12, "0")}`;
const sample = compatibilityDocuments[0];
const doc = (n: number, changes: Partial<EducationalDocument> = {}): EducationalDocument => ({
  ...sample, id: id(n), slug: `ordering-${n}`, title: "Equal title", description: "Shared matching description.",
  subject: "Subject", subjectSlug: "subject", subjectId: id(900), course: "Course", courseSlug: "course", courseId: id(901),
  topic: "Topic", isFeatured: true, createdAt: "2024-01-01T00:00:00Z", ...changes,
});
const toRow = (d: EducationalDocument) => ({
  id: d.id, slug: d.slug, title: d.title, description: d.description, original_url: d.originalUrl, platform: d.platform,
  subject_id: d.subjectId, course_id: d.courseId, semester: d.semester, topic: d.topic, document_type: d.documentType,
  thumbnail_url: d.thumbnailUrl, keywords: d.keywords, tags: d.tags, is_featured: d.isFeatured, publication_status: d.publicationStatus,
  created_at: d.createdAt, updated_at: d.updatedAt, presentation_url: d.presentationUrl, embed_url: d.embedUrl, backup_links: d.backupLinks,
  subjects: { id: d.subjectId, name: d.subject, slug: d.subjectSlug }, courses: d.courseId ? { id: d.courseId, name: d.course, slug: d.courseSlug } : null,
});
type Row = ReturnType<typeof toRow>;

// The mock executes the actual PostgREST order/limit/offset URL emitted by the
// application over intentionally reversed input. It doesn't claim hosted DB or
// PostgreSQL collation verification.
async function withServer(rows: Row[], run: (requests: URL[]) => Promise<void>, rankedRows?: Row[]) {
  const oldUrl = process.env.NEXT_PUBLIC_SUPABASE_URL, oldKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, oldFetch = globalThis.fetch;
  Object.assign(process.env, { NEXT_PUBLIC_SUPABASE_URL: "https://unit-test.invalid", NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_TESTONLY12345678901234567890" });
  const requests: URL[] = [];
  globalThis.fetch = async (input, init) => {
    const url = new URL(String(input instanceof Request ? input.url : input)); requests.push(url);
    const headers = { "content-type": "application/json", "content-range": `0-${Math.max(0, rows.length - 1)}/${rows.length}` };
    if (url.pathname.endsWith("/rpc/get_catalog_facets")) return new Response(JSON.stringify(deriveFacets(rows.map(r => doc(Number(r.id.slice(-12)), { subjectId: r.subject_id, courseId: r.course_id })))), { status: 200, headers });
    if (url.pathname.endsWith("/rpc/search_catalog")) return rankedRows ? new Response(JSON.stringify({total: rankedRows.length, documents: rankedRows}), {status: 200, headers}) : new Response(JSON.stringify({ code: "PGRST202", message: "Missing test RPC" }), { status: 404, headers });
    if (url.pathname.endsWith("/subjects") || url.pathname.endsWith("/courses")) return new Response(JSON.stringify([{id:id(1),name:"Category",slug:"category"}]), { status: 200, headers });
    if (!url.pathname.endsWith("/documents")) throw new Error(`Unexpected test URL ${url.pathname}`);
    const selected = rows.filter(r => {
      for (const key of ["id", "is_featured", "subject_id", "course_id", "topic", "publication_status"] as const) {
        const filter = url.searchParams.get(key); if (!filter) continue;
        const value = String(r[key]); if (filter.startsWith("eq.") && value !== filter.slice(3)) return false;
        if (filter.startsWith("neq.") && value === filter.slice(4)) return false;
      }
      return true;
    });
    const order = (url.searchParams.get("order") ?? "").split(",").filter(Boolean).map(part => part.split("."));
    const sorted = selected.toSorted((a,b) => {
      for (const [key,direction] of order) {
        const av = String(a[key as keyof Row] ?? ""), bv = String(b[key as keyof Row] ?? "");
        const cmp = av < bv ? -1 : av > bv ? 1 : 0;
        if (cmp) return direction === "desc" ? -cmp : cmp;
      }
      return 0;
    });
    const offset = Number(url.searchParams.get("offset") ?? 0), limit = Number(url.searchParams.get("limit") ?? sorted.length);
    const responseHeaders = { ...headers, "content-range": `${offset}-${Math.min(offset + limit - 1, Math.max(0, sorted.length - 1))}/${sorted.length}` };
    return new Response(init?.method === "HEAD" ? null : JSON.stringify(sorted.slice(offset, offset + limit)), { status: 200, headers: responseHeaders });
  };
  try { await run(requests); } finally {
    globalThis.fetch = oldFetch;
    if (oldUrl === undefined) delete process.env.NEXT_PUBLIC_SUPABASE_URL; else process.env.NEXT_PUBLIC_SUPABASE_URL = oldUrl;
    if (oldKey === undefined) delete process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY; else process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = oldKey;
  }
}
const documentRequests = (requests: URL[]) => requests.filter(url => url.pathname.endsWith("/documents"));

test("live browse repeats and adjacent pages have total orders for every sort and fallback", async () => {
  const rows = Array.from({length: 28}, (_, i) => toRow(doc(28-i)));
  await withServer(rows, async requests => {
    for (const [sort, order] of [["relevance", "is_featured.desc,title.asc,id.asc"], ["title", "title.asc,id.asc"], ["newest", "created_at.desc,title.asc,id.asc"]] as const) {
      const one = await queryCatalog({...DEFAULT_FILTERS, sort});
      const repeat = await queryCatalog({...DEFAULT_FILTERS, sort});
      const two = await queryCatalog({...DEFAULT_FILTERS, sort, page: 2});
      assert.deepEqual(one.documents, repeat.documents);
      assert.deepEqual(one.documents.map(d => d.id), Array.from({length: 12}, (_,i) => id(i+1)));
      assert.deepEqual(two.documents.map(d => d.id), Array.from({length: 12}, (_,i) => id(i+13)));
      assert.equal(new Set([...one.documents, ...two.documents].map(d => d.id)).size, 24);
      assert.equal(one.total, 28);
      assert.equal(documentRequests(requests).at(-1)?.searchParams.get("order"), order);
    }
    const fallback = await queryCatalog({...DEFAULT_FILTERS, q:"matching", sort:"newest"});
    assert.equal(fallback.searchLimitation, "document-fields-fallback");
    assert.equal(documentRequests(requests).at(-1)?.searchParams.get("order"), "created_at.desc,title.asc,id.asc");
    const palette = await searchCatalog("matching");
    assert.equal(palette.searchLimited, true);
    assert.deepEqual(palette.documents.map(d => d.id), Array.from({length: 8}, (_,i) => id(i+1)));
    assert.equal(documentRequests(requests).at(-1)?.searchParams.get("order"), "is_featured.desc,id.asc");
  });
});

test("live featured/recent rails and related selection append ID without overriding existing priorities", async () => {
  const reference = doc(100);
  const rows = [
    doc(8, {title:"Alpha", topic:"Different"}), // lower related score despite feature and title
    doc(7, {title:"Beta", isFeatured:true}),
    doc(2, {title:"Alpha", isFeatured:false}),
    doc(6, {title:"Beta", isFeatured:true}),
    ...Array.from({length: 15}, (_,i) => doc(30-i, {title:"Zeta", isFeatured:false})),
  ].map(toRow);
  await withServer(rows, async requests => {
    const a = await getCatalogHighlights(), b = await getCatalogHighlights();
    assert.deepEqual(a,b);
    assert.deepEqual(a.featured.map(d => d.id), [id(8),id(6),id(7)]);
    assert.deepEqual(a.recent.map(d => d.id), [id(2),id(6),id(7)]);
    const related = await getRelatedDocuments(reference);
    assert.deepEqual(related.map(d => d.id), [id(6),id(7),id(2)]); // score, then server feature/title/id order
    const orders = documentRequests(requests).map(url => url.searchParams.get("order"));
    assert.ok(orders.includes("title.asc,id.asc"));
    assert.ok(orders.includes("created_at.desc,id.asc"));
    assert.ok(orders.includes("is_featured.desc,title.asc,id.asc"));
    const relatedRequest = documentRequests(requests).at(-1)!;
    assert.equal(relatedRequest.searchParams.get("limit"),"12");
  });
});

test("fixture and compatibility comparators use ID only after rank, title, timestamp and featured priorities", async () => {
  const tied = Array.from({length: 28}, (_,i) => doc(28-i));
  const expected = Array.from({length: 28}, (_,i) => id(i+1));
  for (const sort of ["relevance","title","newest"] as const) {
    assert.deepEqual(filterDocuments(tied, {...DEFAULT_FILTERS, sort}).map(d => d.id), expected);
    const page1 = await queryCatalog({...DEFAULT_FILTERS, sort}, tied);
    const page2 = await queryCatalog({...DEFAULT_FILTERS, sort, page:2}, tied);
    assert.deepEqual([...page1.documents,...page2.documents].map(d=>d.id), expected.slice(0,24));
    assert.deepEqual((await queryCatalog({...DEFAULT_FILTERS, sort}, tied)).documents,page1.documents);
  }
  assert.deepEqual(searchDocuments(tied,"matching").map(d=>d.id),expected);
  const strong=doc(99,{title:"Matching",description:"Other description.",isFeatured:false});
  assert.equal(searchDocuments([...tied,strong],"matching")[0].id,strong.id);
  assert.equal(filterDocuments([doc(1,{isFeatured:false}),doc(99,{isFeatured:true})],DEFAULT_FILTERS)[0].id,id(99));
  assert.equal(filterDocuments([doc(1),doc(99,{createdAt:"2025-01-01T00:00:00Z"})],{...DEFAULT_FILTERS,sort:"newest"})[0].id,id(99));
  const original = [...compatibilityDocuments], oldUrl=process.env.NEXT_PUBLIC_SUPABASE_URL, oldKey=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  try {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL; delete process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
    compatibilityDocuments.splice(0,compatibilityDocuments.length,...tied);
    assert.deepEqual((await queryCatalog(DEFAULT_FILTERS)).documents.map(d=>d.id),expected.slice(0,12));
    const rails=await getCatalogHighlights();
    assert.deepEqual(rails.featured.map(d=>d.id),expected.slice(0,3));
    assert.deepEqual(rails.recent.map(d=>d.id),expected.slice(0,3));
    assert.deepEqual((await getRelatedDocuments(doc(99))).map(d=>d.id),expected.slice(0,3));
    const improved=doc(80,{topic:"Different"});
    compatibilityDocuments.splice(0,compatibilityDocuments.length,improved,doc(90),doc(1,{topic:"Different"}));
    assert.deepEqual((await getRelatedDocuments(doc(99))).map(d=>d.id),[id(90),id(1),id(80)]);
  } finally {
    compatibilityDocuments.splice(0,compatibilityDocuments.length,...original);
    if(oldUrl===undefined)delete process.env.NEXT_PUBLIC_SUPABASE_URL;else process.env.NEXT_PUBLIC_SUPABASE_URL=oldUrl;
    if(oldKey===undefined)delete process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;else process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=oldKey;
  }
});

test("admin document pages and duplicate-name category lists have an ID tie-break", async () => {
  const rows=Array.from({length: 25},(_,i)=>toRow(doc(25-i,{updatedAt:"2024-01-01T00:00:00Z"})));
  await withServer(rows, async requests => {
    const client=createClient("https://unit-test.invalid","sb_publishable_TESTONLY12345678901234567890",{auth:{persistSession:false}}) as AdminClient;
    const first=await getAdminDocuments(client), second=await getAdminDocuments(client,"","",2);
    assert.deepEqual(first.documents.map(d=>d.id),Array.from({length:20},(_,i)=>id(i+1)));
    assert.deepEqual(second.documents.map(d=>d.id),Array.from({length:5},(_,i)=>id(i+21)));
    assert.equal(documentRequests(requests).at(-1)?.searchParams.get("order"),"updated_at.desc,id.asc");
    await getCategories(client);
    for(const name of ["subjects","courses"]) assert.equal(requests.find(url=>url.pathname.endsWith('/'+name))?.searchParams.get("order"),"name.asc,id.asc");
  });
});

test("duplicate category names have deterministic identity ordering, including legacy null IDs", () => {
  const categories = [
    doc(4,{subject:"Shared",subjectSlug:"second",subjectId:id(2),course:"Same",courseSlug:"course-b",courseId:id(4)}),
    doc(3,{subject:"Shared",subjectSlug:"first",subjectId:id(1),course:"Same",courseSlug:"course-a",courseId:id(3)}),
  ];
  assert.deepEqual(deriveFacets(categories).subjects.map(s=>s.id),[id(1),id(2)]);
  assert.deepEqual(deriveFacets(categories).courses.map(c=>c.id),[id(3),id(4)]);
  const legacy=categories.map(d=>({...d,subjectId:null,courseId:null}));
  assert.deepEqual(deriveFacets(legacy).subjects.map(s=>s.slug),["first","second"]);
  assert.deepEqual(deriveFacets(legacy).courses.map(c=>c.slug),["course-a","course-b"]);
});


test("ranked RPC results retain their returned order instead of being re-sorted by ID", async () => {
  const ranked = [toRow(doc(99,{title:"High relevance"})),toRow(doc(1,{title:"Low relevance"}))];
  await withServer(ranked, async requests => {
    const library=await queryCatalog({...DEFAULT_FILTERS,q:"matching"});
    const palette=await searchCatalog("matching");
    assert.deepEqual(library.documents.map(d=>d.id),[id(99),id(1)]);
    assert.deepEqual(palette.documents.map(d=>d.id),[id(99),id(1)]);
    assert.equal(library.searchLimitation,undefined);
    assert.equal(palette.searchLimited,false);
    assert.equal(documentRequests(requests).length,0);
  }, ranked);
});
