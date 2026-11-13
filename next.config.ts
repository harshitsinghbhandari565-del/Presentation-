import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // Development only. Arena previews are reverse-proxied through e2b.app.
  allowedDevOrigins: ["*.e2b.app", "localhost", "127.0.0.1"],
  async headers() {
    return [{
      source: "/sql-workbench/mariadb",
      headers: [
        { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
        { key: "Cross-Origin-Embedder-Policy", value: "require-corp" },
      ],
    }, {
      source: "/sql/mariadb/:path*",
      headers: [{ key: "Cross-Origin-Embedder-Policy", value: "require-corp" }],
    }, {
      source: "/sql/mariadb-worker.mjs",
      headers: [{ key: "Cross-Origin-Embedder-Policy", value: "require-corp" }],
    }, {
      source: "/:path*",
      headers: [
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
      ],
    }];
  },
};

export default nextConfig;
