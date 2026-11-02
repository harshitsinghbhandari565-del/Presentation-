import { redirect } from "next/navigation";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getAdminSession } from "@/lib/admin/auth";
import AdminSetup from "@/components/admin/AdminSetup";
import LoginForm from "@/components/admin/LoginForm";

export const dynamic = "force-dynamic";

export default async function AdminLoginPage() {
  if (!isSupabaseConfigured()) return <AdminSetup />;
  const session = await getAdminSession();
  if (session?.user) redirect(session.isAdministrator ? "/admin" : "/admin/access-denied");
  return <LoginForm />;
}