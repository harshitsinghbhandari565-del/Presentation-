# Future SQL execution options (research; nothing provisioned)

Research based on vendor pages available 2026-11-07. Pricing and free-tier terms may change; re-check before any commitment. Public access must remain free and no paid service should be provisioned without owner approval. These options require an independent threat model and testing; none is implemented here.

## PostgreSQL

- [PGlite](https://pglite.dev/docs/about) is PostgreSQL compiled to WASM and can run in a browser. The PGlite core is single-connection; browser-local sessions could avoid public SQL hitting a hosted application database. Validate extensions, lifecycle, database import/export, mobile memory and worker termination before calling it supported. The project already uses PGlite for local policy tests, not as a workbench engine.
- [Neon pricing](https://neon.com/pricing) describes a $0 free tier, with project compute/storage limits and suspension on exhausted free compute; Launch is usage-based. A hosted option would require independent per-visitor isolation, unprivileged roles, connection control, quotas, teardown, abuse prevention and spend controls. A shared hosted instance must not be assumed safe for arbitrary public SQL. Do not run visitor SQL on the website's Supabase application database.

## MySQL

- [MySQL Community Server](https://dev.mysql.com/doc/refman/8.4/en/docker-mysql-getting-started.html) has official container images. Actual MySQL would require separately isolated managed/container infrastructure, restricted network egress, strict resource quotas, per-session credentials and lifecycle cleanup. No persistent MySQL server should be assumed available inside Vercel Functions.
- [TiDB Cloud Starter](https://www.pingcap.com/tidb-cloud-starter-pricing-details/) advertises an eligible free allowance and paid usage for scalable instances; throttling applies when a free quota is exhausted. It is MySQL-compatible, **not identical to MySQL**. Its [HTTP serverless driver](https://docs.pingcap.com/developer/serverless-driver/) documents single-statement and row limits, and is backend-only. Evaluate feature and security requirements before treating it as an option. Avoid browser-exposed credentials or a shared untrusted execution database.

## Deployment constraints and cost

[Vercel function limits](https://vercel.com/docs/functions/limitations) are per invocation and plan-dependent; a function is not a persistent isolated database instance. Fixed free quotas do not guarantee uptime or capacity. Estimate memory, compute, storage, transfer, concurrency and worst-case abuse; choose a hard no-overage limit and obtain explicit approval before creating resources. Per-session VM/container sandboxing requires more than a SQL blacklist or timeout: enforce CPU, memory, disk, network, credential, process and tenant isolation, and verify cleanup under failure.
