// The GPL-licensed MariaDB binary is copied unmodified at build time rather
// than committed to this repository. See docs/SQL_WORKBENCH_MARIADB.md.
import { cp, mkdir } from "node:fs/promises";
const target = new URL("../public/sql/mariadb/", import.meta.url);
await mkdir(target, { recursive: true });
for (const name of ["index.mjs", "lite4mariadb.js", "lite4mariadb.wasm"]) {
  await cp(new URL(`../node_modules/lite4mariadb/dist/${name}`, import.meta.url), new URL(name, target));
}
await cp(new URL("../node_modules/lite4mariadb/COPYING", import.meta.url), new URL("COPYING.txt", target));
