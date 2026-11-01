import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { signOut } from "@/app/admin/actions";
export default function AccessDeniedPage() {
  return <section className="admin-setup"><ShieldAlert size={32} color="var(--danger)" /><h2>Administrator access required.</h2><p>You are signed in, but this account has not been authorized to manage the collection. Ask the hub owner to grant access. Signing in alone does not grant administrative permissions.</p><div className="editor-actions" style={{ marginTop: 24 }}><Link href="/library" className="button button-secondary">Public library</Link><form action={signOut}><button className="button button-primary">Sign out</button></form></div></section>;
}
