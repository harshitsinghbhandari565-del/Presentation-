import { getHealthDatabase } from "@/db";
import { sql } from "drizzle-orm";
export const dynamic = "force-dynamic";

export async function GET() {
  const headers = { "Cache-Control": "no-store" };
  const db = getHealthDatabase();
  if (!db) return Response.json({ ok: false, database: "not_configured" }, { status: 503, headers });
  try {
    await db.execute(sql`select 1`);
    return Response.json({ ok: true, database: "connected" }, { headers });
  } catch {
    return Response.json({ ok: false, database: "unavailable" }, { status: 503, headers });
  }
}
