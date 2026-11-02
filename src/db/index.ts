import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

const globalForDb = globalThis as typeof globalThis & { __presentationHealthPool?: Pool };
export function getHealthDatabase() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) return null;
  const pool = globalForDb.__presentationHealthPool ?? new Pool({ connectionString, max: 2, connectionTimeoutMillis: 3000, idleTimeoutMillis: 10000 });
  if (process.env.NODE_ENV !== "production") globalForDb.__presentationHealthPool = pool;
  return drizzle(pool);
}
