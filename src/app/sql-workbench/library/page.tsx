import Link from "next/link";
import { getPublicClient } from "@/lib/supabase/public";
import OpenSharedQuery from "@/components/sql-workbench/OpenSharedQuery";

export const dynamic = "force-dynamic";
export const metadata = { title: "Shared SQL queries" };
type Row = { id: string; title: string; description: string; dialect: string; sql_text: string };
export default async function SharedQueries({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q.trim().slice(0, 100) : "";
  const dialect = typeof params.dialect === "string" && ["sqlite", "postgresql", "mysql"].includes(params.dialect) ? params.dialect : "";
  const page = Math.max(1, Math.min(1000, typeof params.page === "string" ? Math.floor(Number(params.page) || 1) : 1));
  const pageUrl = (target: number) => { const query = new URLSearchParams(); if (q) query.set("q", q); if (dialect) query.set("dialect", dialect); query.set("page", String(target)); return `/sql-workbench/library?${query.toString()}`; };
  const client = getPublicClient();
  let rows: Row[] = [], unavailable = !client, hasMore = false;
  if (client) {
    let request = client.from("shared_sql_queries").select("id,title,description,dialect,sql_text").eq("publication_status", "published").order("updated_at", { ascending: false }).order("id").range((page - 1) * 10, (page - 1) * 10 + 10);
    if (q) request = request.ilike("title", `%${q.replace(/[\\%_]/g, "\\$&")}%`);
    if (dialect) request = request.eq("dialect", dialect);
    const { data, error } = await request;
    unavailable = Boolean(error); const results = (data ?? []) as Row[]; hasMore = results.length > 10; rows = results.slice(0, 10);
  }
  return <div className="container inner-page"><div className="page-intro"><div className="eyebrow">SQL LEARNING LAB</div><h1>Shared queries.</h1><p>Administrator-published examples. Opening one never runs it automatically.</p></div>
    <Link href="/sql-workbench" className="text-link">← Back to workbench</Link>
    <form className="admin-search sql-library-search"><input name="q" defaultValue={q} maxLength={100} placeholder="Search titles" aria-label="Search query titles" /><select name="dialect" defaultValue={dialect} aria-label="Filter by dialect"><option value="">All dialects</option><option value="sqlite">SQLite</option><option value="postgresql">PostgreSQL</option><option value="mysql">MySQL</option></select><button className="button button-secondary">Search</button></form>
    {unavailable ? <div className="sql-notice">Shared queries are not configured or are temporarily unavailable. Your local workbench remains available.</div> : rows.length ? <div className="sql-library-list">{rows.map(row => <article key={row.id} className="editor-panel"><div className="eyebrow">{row.dialect}</div><h2>{row.title}</h2><p>{row.description}</p><pre><code>{row.sql_text}</code></pre>{row.dialect === "sqlite" ? <OpenSharedQuery sql={row.sql_text} /> : <p>Execution for this dialect is not available yet.</p>}</article>)}</div> : <p>No matching published queries.</p>}
    {!unavailable && <nav className="sql-pagination" aria-label="Shared query pages">{page > 1 && <Link className="button button-secondary" href={pageUrl(page - 1)}>Previous</Link>}<span>Page {page}</span>{hasMore && <Link className="button button-secondary" href={pageUrl(page + 1)}>Next</Link>}</nav>}
  </div>;
}
