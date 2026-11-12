import Link from "next/link";
import { requireAdministrator } from "@/lib/admin/auth";
import { saveSharedQuery } from "./actions";
export const dynamic = "force-dynamic";
export default async function QueryAdmin({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { client } = await requireAdministrator(); const params = await searchParams;
  const { data, error } = await client.from("shared_sql_queries").select("id,title,dialect,publication_status,updated_at").order("updated_at", { ascending: false }).limit(100);
  return <><div className="admin-heading"><div><h1>Shared SQL queries.</h1><p>Only administrators can publish. Private browser drafts are not uploaded.</p></div><Link className="button button-secondary" href="/admin">Back to admin</Link></div>
    {params.error && <p className="form-alert" role="alert">Unable to save. Check your fields, public disclosure confirmation and database setup.</p>}
    {error ? <div className="sql-notice">Shared-query storage is not configured or is unavailable. The proposed migration must be reviewed and explicitly approved before deployment.</div> : <>
      <section className="editor-panel"><h2>Save a new query</h2><p className="fine-print">Queries marked published are public. Never publish sensitive SQL or credentials.</p>
        <form action={saveSharedQuery}><label className="form-field"><span>Title</span><input name="title" required maxLength={120} /></label><label className="form-field"><span>Description</span><textarea name="description" maxLength={1000} /></label><label className="form-field"><span>SQL</span><textarea name="sql_text" required maxLength={100000} /></label><label className="form-field"><span>Dialect</span><select name="dialect"><option value="sqlite">SQLite</option><option value="postgresql">PostgreSQL</option><option value="mysql">MySQL</option></select></label><label className="form-field"><span>Status</span><select name="publication_status"><option value="draft">Draft</option><option value="published">Published</option><option value="archived">Archived</option></select></label><label><input type="checkbox" name="confirm_public" value="yes" /> I understand published SQL is public.</label><p><button className="button button-primary">Save query</button></p></form>
      </section><div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Title</th><th>Dialect</th><th>Status</th><th>Manage</th></tr></thead><tbody>{(data ?? []).map(row => <tr key={row.id}><td>{row.title}</td><td>{row.dialect}</td><td>{row.publication_status}</td><td><Link href={`/admin/sql-queries/${row.id}`}>Edit and history</Link></td></tr>)}</tbody></table></div>
    </>}
  </>;
}
