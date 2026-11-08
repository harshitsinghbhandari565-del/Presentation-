import { defineConfig } from "drizzle-kit";

/**
 * Local Drizzle Kit config with a fail-closed security gate.
 *
 * Replaces the credential-bearing `drizzle.config.json` so that no secret is
 * committed. The connection target is read from `DRIZZLE_DATABASE_URL` and
 * validated before it reaches drizzle-kit:
 *
 *  - `DATABASE_URL` is never referenced (no ambient libpq fallback).
 *  - Any env var whose name starts with `PG` (case-insensitive) is rejected,
 *    because libpq would otherwise let those values override the URL.
 *  - The host must be a numeric loopback: `127.0.0.1`, `localhost`, `[::1]`.
 *  - The port must be numeric and in range (1-65535).
 *  - The database name must be exactly one path segment (no `/`, `?`, `#`).
 *  - Percent-encoding is decoded exactly once, must be canonical-uppercase,
 *    NFC-normalised, and free of control characters.
 *  - `ssl` is pinned to `false` (loopback plaintext only).
 *  - `dbCredentials` carries explicit fields (no `url` key) so nothing
 *    downstream can re-parse a looser connection string.
 */

const LOOPBACK_HOSTS = ["127.0.0.1", "localhost", "[::1]"] as const;

const URL_PATTERN =
  /^postgres(?:ql)?:\/\/([^:@/?#]+):([^:@/?#]+)@(\[::1\]|localhost|127\.0\.0\.1):(\d{1,5})\/([^/?#]+)$/;

export interface DrizzleCredentials {
  host: string;
  database: string;
  user: string;
  password: string;
}

function decodePart(part: string): string {
  // Canonical-uppercase percent-encoding: reject lowercase hex letters.
  if (/%[0-9A-Fa-f]*[a-f]/.test(part)) {
    throw new Error("Percent-encoding must use uppercase hex digits.");
  }
  // Every `%` must be followed by exactly two hex digits.
  if (/%(?![0-9A-Fa-f]{2})/.test(part)) {
    throw new Error("Invalid percent-encoding in connection URL part.");
  }
  let decoded: string;
  try {
    decoded = decodeURIComponent(part);
  } catch {
    throw new Error("Malformed percent-encoding in connection URL part.");
  }
  // Decoded text must already be in canonical NFC form (reject decomposed).
  if (decoded !== decoded.normalize("NFC")) {
    throw new Error("Decoded text must be in NFC canonical form.");
  }
  // Reject C0/C1 control characters.
  if (/[\u0000-\u001f\u007f-\u009f]/.test(decoded)) {
    throw new Error("Control characters are not allowed in connection URL parts.");
  }
  return decoded;
}

export function validateDrizzleConfig(
  env: NodeJS.ProcessEnv = process.env,
): DrizzleCredentials {
  // Reject any PG* environment variable (case-insensitive) because libpq would
  // let those values override the connection URL.
  for (const key of Object.keys(env)) {
    if (/^pg/i.test(key)) {
      throw new Error(
        `Refusing to run with PG* environment variable "${key}" set; it could override the connection URL.`,
      );
    }
  }

  const raw = env.DRIZZLE_DATABASE_URL;
  if (!raw || raw.trim() === "") {
    throw new Error("DRIZZLE_DATABASE_URL is required for the local Drizzle workflow.");
  }

  const match = URL_PATTERN.exec(raw);
  if (!match) {
    throw new Error(
      "DRIZZLE_DATABASE_URL must be a loopback postgres URL: postgresql://user:password@127.0.0.1:5432/dbname",
    );
  }

  const [, userRaw, passwordRaw, hostRaw, portRaw, databaseRaw] = match;

  const user = decodePart(userRaw);
  const password = decodePart(passwordRaw);
  const database = decodePart(databaseRaw);

  // M-3 closure: reject path separators / traversal in the database name
  // (the raw URL has one segment, but percent-encoding can smuggle `/`).
  if (database.includes("/") || database.includes("\\") || database.includes("..")) {
    throw new Error("Database name must not contain path separators or traversal sequences.");
  }

  if (!user || !password || !database) {
    throw new Error("Connection URL parts must be non-empty.");
  }

  const port = Number(portRaw);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error("Port must be a numeric value between 1 and 65535.");
  }

  if (!LOOPBACK_HOSTS.includes(hostRaw as (typeof LOOPBACK_HOSTS)[number])) {
    throw new Error("Host must be a numeric loopback address.");
  }

  // Map symbolic loopback hosts to their numeric form so the driver never
  // re-parses a bracketed literal.
  const host =
    hostRaw === "localhost" ? "127.0.0.1" : hostRaw === "[::1]" ? "::1" : hostRaw;

  return { host, database, user, password };
}

const credentials = validateDrizzleConfig();

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema.ts",
  dbCredentials: {
    host: credentials.host,
    database: credentials.database,
    user: credentials.user,
    password: credentials.password,
    ssl: false,
  },
});
