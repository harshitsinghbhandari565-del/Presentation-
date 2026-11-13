# Empty SQLite database

At the owner's request, the seven bundled fictional sample databases and the sample picker were removed. Each workbench page opens a **new empty in-memory SQLite database** in its own browser worker; no tables or rows are preloaded. Write and run SQLite `CREATE TABLE` statements to build a schema from scratch. The database explorer and autocomplete update after successful SQL execution.

**New empty database** and **Reset database** both ask for confirmation before replacing the current temporary database, including imported data and open transactions. SQL tabs and history are not erased by this operation. Cancelling leaves the current database intact. Existing saved browser-session SQL drafts are also preserved; old drafts that refer to removed sample tables will need to be edited.

The database is not saved on the server and is discarded on refresh, navigation away, stop, or timeout. Export the database (up to 5 MiB) before leaving if you want to keep it; it can later be restored through the existing SQLite import control. SQL tabs/history are browser-session-only and are not a secure vault. Public shared queries remain separate and are never executed automatically. No production Supabase data or schema was changed for this feature.

Run `npm run check` and the SQL Workbench Playwright tests to verify the engine, empty initial schema, creation and replacement, isolation, draft retention, exports/imports, accessibility and other existing controls. Worker timeouts and output caps are not hard CPU or memory quotas.

An additional, separate experimental MariaDB browser mode is documented in [SQL_WORKBENCH_MARIADB.md](SQL_WORKBENCH_MARIADB.md). It is not MySQL and does not alter this SQLite sandbox.
