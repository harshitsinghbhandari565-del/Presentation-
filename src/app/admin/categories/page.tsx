import Link from "next/link";
import { ArrowLeft, FolderOpen, ShieldCheck } from "lucide-react";
import { requireAdministrator } from "@/lib/admin/auth";
import { getCategories } from "@/lib/admin/repository";
import CategoryForm from "@/components/admin/CategoryForm";
export const dynamic = "force-dynamic";
export default async function AdminCategoriesPage() {
  const { client } = await requireAdministrator();
  const categories = await getCategories(client);
  return <><div className="admin-heading"><div><div className="eyebrow"><ShieldCheck size={14} />PRIVATE ADMINISTRATION</div><h1>A place for every subject.</h1><p>Manage the subjects and courses used to organize your collection.</p></div><Link href="/admin" className="button button-secondary"><ArrowLeft size={15} />Admin library</Link></div><nav className="admin-nav" aria-label="Admin navigation"><Link href="/admin"><FolderOpen size={15} />Resources</Link><Link href="/admin/categories" className="active"><FolderOpen size={15} />Subjects & courses</Link></nav><div className="admin-notice">Categories are kept when resources are edited. Rename them here instead of creating duplicates. Categories referenced by a resource cannot be deleted at the database level.</div><div className="category-grid">{(["subjects", "courses"] as const).map(kind => <section className="editor-panel" key={kind}><h2>{kind === "subjects" ? "Subjects" : "Courses"}</h2><p>{categories[kind].length} categor{categories[kind].length === 1 ? "y" : "ies"}</p>{categories[kind].map(category => <details key={category.id}><summary className="category-item"><span>{category.name}<small>{category.slug}</small></span><span className="text-link" style={{ fontSize: 11 }}>Edit</span></summary><CategoryForm kind={kind} category={category} /></details>)}<CategoryForm kind={kind} /></section>)}</div></>;
}
