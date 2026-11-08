"use client";
import { useActionState, useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Archive, Trash2 } from "lucide-react";
import { archiveDocument, permanentlyDeleteDocument, type ActionState } from "@/app/admin/actions";
export default function DeleteDocumentDialog({ id, slug, title }: { id: string; slug: string; title: string }) {
  const router = useRouter();
  const dialog = useRef<HTMLDialogElement>(null);
  const [permanent, setPermanent] = useState(false);
  const [archiveState, archiveAction, archiveBusy] = useActionState(archiveDocument.bind(null, id), {} as ActionState);
  const [deleteState, deleteAction, deleteBusy] = useActionState(permanentlyDeleteDocument.bind(null, id), {} as ActionState);
  const state = permanent ? deleteState : archiveState;
  useEffect(() => { if (deleteState.deleted) { dialog.current?.close(); router.replace("/admin?deleted=1"); router.refresh(); } }, [deleteState.deleted, router]);
  return <><button className="delete-button" aria-label={`Remove ${title}`} title="Archive or delete resource" onClick={() => { setPermanent(false); dialog.current?.showModal(); }}><Archive size={15} /></button><dialog ref={dialog} className="confirm-dialog" aria-labelledby={`remove-title-${id}`}><h2 id={`remove-title-${id}`}>{permanent ? "Permanently delete?" : "Remove from the library?"}</h2><p>{permanent ? "This permanently deletes the metadata, not the original external document. This cannot be undone. Consider archiving instead." : <>Archive <strong>{title}</strong> to hide it from students. Its metadata is retained and can be restored from Edit.</>}</p>{state.error && <p className="form-alert" role="alert">{state.error}</p>}{state.success && <p className="form-success" role="status">{state.success}</p>}<form action={permanent ? deleteAction : archiveAction}>{permanent && <label className="form-field"><span>Type the slug to confirm: {slug}</span><input name="confirmation" autoComplete="off" required pattern={slug.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")} /></label>}<div className="editor-actions"><button type="button" className="button button-secondary" onClick={() => dialog.current?.close()}>{state.success ? "Close" : "Cancel"}</button>{!state.success && <button className="button button-danger" disabled={archiveBusy || deleteBusy}>{permanent ? <Trash2 size={15} /> : <Archive size={15} />}{archiveBusy || deleteBusy ? "Working…" : permanent ? "Delete permanently" : "Archive resource"}</button>}</div></form>{!permanent && !archiveState.success && <button className="text-link" style={{ marginTop: 15, fontSize: 11 }} onClick={() => setPermanent(true)}>Permanently delete instead</button>}</dialog></>;
}
