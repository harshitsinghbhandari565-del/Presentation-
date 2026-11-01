"use client";
import { useActionState, useState } from "react";
import { Save, LoaderCircle } from "lucide-react";
import { saveCategory, type ActionState } from "@/app/admin/actions";
import type { Category } from "@/lib/admin/repository";
import { slugify } from "@/lib/urls";
export default function CategoryForm({ kind, category }: { kind: "subjects" | "courses"; category?: Category }) {
  const [name, setName] = useState(category?.name ?? "");
  const [slug, setSlug] = useState(category?.slug ?? "");
  const [touched, setTouched] = useState(Boolean(category));
  const [state, action, pending] = useActionState(saveCategory.bind(null, kind), {} as ActionState);
  return <form action={action} className="category-form">{category && <input type="hidden" name="id" value={category.id} />}{!category && <h3>Add {kind === "subjects" ? "a subject" : "a course"}</h3>}{state.error && <p className="form-alert" role="alert">{state.error}</p>}{state.success && <p className="form-success" role="status">{state.success}</p>}<div className="form-row"><label className="form-field"><span>Name</span><input name="name" value={name} required minLength={2} maxLength={80} onChange={event => { setName(event.target.value); if (!touched) setSlug(slugify(event.target.value)); }} /></label><label className="form-field"><span>Slug</span><input name="slug" value={slug} required maxLength={100} pattern="[a-z0-9]+(-[a-z0-9]+)*" onChange={event => { setTouched(true); setSlug(event.target.value); }} /></label></div><button className="button button-secondary" disabled={pending}>{pending ? <LoaderCircle size={15} className="spin" /> : <Save size={15} />}{pending ? "Saving…" : category ? "Save category" : "Add category"}</button></form>;
}
