import { redirect } from "next/navigation";
import { getServerClient } from "@/lib/supabase/server";
import { administratorAccessRedirect, resolveAdministratorAccess } from "./authorization";

export async function getAdminSession() {
  const client = await getServerClient();
  if (!client) return null;
  const access = await resolveAdministratorAccess({
    getVerifiedUser: async () => client.auth.getUser(),
    getMembership: async userId => client
      .from("administrators")
      .select("user_id")
      .eq("user_id", userId)
      .maybeSingle(),
  });
  return { client, ...access };
}

export async function requireAdministrator() {
  const session = await getAdminSession();
  const destination = administratorAccessRedirect(session);
  if (destination) redirect(destination);
  if (!session?.user) redirect("/admin/login");
  return { client: session.client, user: session.user };
}
