"use client";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { LockKeyhole, ArrowRight, LoaderCircle } from "lucide-react";
import { getBrowserClient } from "@/lib/supabase/browser";
export default function LoginForm() {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const router = useRouter();
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(""); setBusy(true);
    const client = getBrowserClient();
    if (!client) { setError("Administrator authentication is not configured."); setBusy(false); return; }
    const form = new FormData(event.currentTarget);
    try {
      const { error } = await client.auth.signInWithPassword({ email: String(form.get("email")).trim(), password: String(form.get("password")) });
      if (error) { setError("Email or password could not be verified. Please try again."); setBusy(false); return; }
      router.replace("/admin"); router.refresh();
    } catch { setError("Sign-in is temporarily unavailable. Please try again."); setBusy(false); }
  }
  return <section className="login-card"><LockKeyhole size={28} strokeWidth={1.4} color="var(--accent)" /><h1>Administrator sign-in</h1><p>A private space to curate the learning collection. Students don’t need an account.</p>{error && <p className="form-alert" role="alert">{error}</p>}<form onSubmit={submit}><label className="form-field"><span>Email address</span><input name="email" type="email" autoComplete="username" required maxLength={254} placeholder="you@example.com" /></label><label className="form-field"><span>Password</span><input name="password" type="password" autoComplete="current-password" required maxLength={256} placeholder="Your administrator password" /></label><button className="button button-primary" disabled={busy}>{busy ? <LoaderCircle size={17} className="spin" /> : <ArrowRight size={17} />}{busy ? "Signing in…" : "Sign in securely"}</button></form><p className="fine-print">Access is limited to explicitly authorized administrators. Contact the hub owner if you need access.</p></section>;
}
