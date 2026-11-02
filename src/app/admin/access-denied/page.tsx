import Link from "next/link";
import { redirect } from "next/navigation";
import { ShieldAlert } from "lucide-react";
import { signOut } from "@/app/admin/actions";
import { getAdminSession } from "@/lib/admin/auth";

export const dynamic = "force-dynamic";

export default async function AccessDeniedPage() {
  const session = await getAdminSession();
  if (!session?.user) redirect("/admin/login");
  if (session.isAdministrator) redirect("/admin");
  return (
    <section className="admin-setup">
      <ShieldAlert size={32} color="var(--danger)" aria-hidden="true" />
      <h1>Administrator access required.</h1>
      <p>
        You are signed in, but this account does not currently have confirmed
        permission to manage the collection. If you expected access, ask the hub
        owner to verify your administrator membership. Signing in alone does not
        grant administrative permissions.
      </p>
      <div className="editor-actions" style={{ marginTop: 24 }}>
        <Link href="/library" className="button button-secondary">Public library</Link>
        <form action={signOut}><button className="button button-primary">Sign out</button></form>
      </div>
    </section>
  );
}