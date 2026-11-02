import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { signOut } from "@/app/admin/actions";

export const dynamic = "force-dynamic";

export default function LogoutErrorPage() {
  return (
    <section className="admin-setup">
      <ShieldAlert size={32} color="var(--danger)" aria-hidden="true" />
      <h1>Sign-out was not confirmed.</h1>
      <p role="alert">
        The authentication provider could not confirm sign-out. Your session may
        still be active, including on other devices. Retry sign-out. If it still
        fails, close this browser and check your connection before trying again.
      </p>
      <div className="editor-actions" style={{ marginTop: 24 }}>
        <form action={signOut}>
          <button className="button button-primary">Retry sign out</button>
        </form>
        <Link href="/admin/login" className="button button-secondary">
          Authentication status
        </Link>
      </div>
    </section>
  );
}