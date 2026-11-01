import { redirect } from "next/navigation";
import { getServerClient } from "@/lib/supabase/server";

export async function getAdminSession() {
  const client = await getServerClient();
  if (!client) return null;
  const { data: { user }, error } = await client.auth.getUser();
  if (error || !user) return { client, user: null, isAdministrator: false };
  const { data, error: membershipError } = await client.from("administrators").select("user_id").eq("user_id", user.id).maybeSingle();
  return { client, user, isAdministrator: !membershipError && Boolean(data) };
}
export async function requireAdministrator() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");
  if (!session.user) redirect("/admin/login");
  if (!session.isAdministrator) redirect("/admin/access-denied");
  return { client: session.client, user: session.user };
}
