import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
const routes = { landing: '.next/server/app/index.html', library: '.next/server/app/library.html', about: '.next/server/app/about.html' };
const out = {};
for (const [name, file] of Object.entries(routes)) {
  if (!fs.existsSync(file)) continue;
  const html = fs.readFileSync(file, 'utf8');
  const refs = [...new Set([...html.matchAll(/\/_next\/static\/[^"'\s]+\.js/g)].map(m => m[0]))];
  let raw = 0, gzip = 0;
  const files = [];
  for (const ref of refs) {
    const p = path.join('.next', ref.replace('/_next/', ''));
    if (!fs.existsSync(p)) continue;
    const b = fs.readFileSync(p);
    raw += b.length; gzip += zlib.gzipSync(b, { level: 9 }).length;
    files.push({ ref, raw: b.length, gzip: zlib.gzipSync(b, { level: 9 }).length });
  }
  out[name] = { initialScriptCount: refs.length, rawKB: +(raw/1024).toFixed(1), gzipKB: +(gzip/1024).toFixed(1), files };
}
console.log(JSON.stringify(out, null, 2));
