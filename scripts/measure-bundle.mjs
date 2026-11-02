import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

// Fetch complete production responses, including dynamically streamed routes.
// Static .next/server/app/library.html does not exist for this dynamic route.
const flag = process.argv.indexOf('--base-url');
const baseURL = flag >= 0 ? process.argv[flag + 1] : 'http://localhost:3000';
if (!baseURL) throw new Error('--base-url requires a production-server origin');
const routes = { landing: '/', about: '/about', library: '/library' };
const gzip = bytes => zlib.gzipSync(bytes, { level: 9 }).length;
const kb = bytes => +(bytes / 1024).toFixed(1);

function measureRefs(html, extension) {
  const refs = [...new Set([...html.matchAll(new RegExp(`/_next/static/[^\"'\\s<>]+\\.${extension}`, 'g'))].map(match => match[0]))];
  const files = refs.map(ref => {
    const file = path.join('.next', ref.replace('/_next/', ''));
    if (!fs.existsSync(file)) throw new Error(`Referenced production asset is missing: ${file}. Rebuild and restart the server.`);
    const bytes = fs.readFileSync(file);
    return { ref, raw: bytes.length, gzip: gzip(bytes) };
  });
  return {
    count: files.length,
    rawKB: kb(files.reduce((sum, file) => sum + file.raw, 0)),
    gzipKB: kb(files.reduce((sum, file) => sum + file.gzip, 0)),
    files,
  };
}

const chunkDirectory = '.next/static/chunks';
if (!fs.existsSync(chunkDirectory)) throw new Error('Run npm run build first');
const chunks = fs.readdirSync(chunkDirectory).filter(file => file.endsWith('.js')).map(file => {
  const ref = `/_next/static/chunks/${file}`;
  const bytes = fs.readFileSync(path.join(chunkDirectory, file));
  return { ref, raw: bytes.length, gzip: gzip(bytes), shader: bytes.includes('gl_FragCoord.xy/r'), three: bytes.includes('WebGLRenderer') };
});
const out = {
  baseURL,
  boundary: 'Unique JS/CSS assets referenced in complete production HTML (script references and preloads); gzip level 9. JS and CSS are separate. Fonts, HTML/RSC payload and later interaction requests are excluded. Lazy chunks are identified from client build content and reported separately.',
  routes: {},
  lazyChunks: {},
};
for (const [name, route] of Object.entries(routes)) {
  const response = await fetch(new URL(route, baseURL));
  if (!response.ok) throw new Error(`${route}: HTTP ${response.status}`);
  const html = await response.text();
  const js = measureRefs(html, 'js');
  const css = measureRefs(html, 'css');
  if (!js.count) throw new Error(`${route}: no initial JS references found`);
  const initialRefs = new Set(js.files.map(file => file.ref));
  const initialContents = js.files.map(file => fs.readFileSync(path.join('.next', file.ref.replace('/_next/', '')), 'utf8'));
  out.routes[name] = {
    route,
    source: 'complete production HTTP response',
    initialJS: js,
    initialCSS: css,
    initialJSPlusCSSGzipKB: kb(js.files.reduce((sum, file) => sum + file.gzip, 0) + css.files.reduce((sum, file) => sum + file.gzip, 0)),
    lazyShaderReferencedInitially: chunks.some(chunk => chunk.shader && initialRefs.has(chunk.ref)),
    lazyThreeReferencedInitially: chunks.some(chunk => chunk.three && initialRefs.has(chunk.ref)),
    threeMarkerInInitialJS: initialContents.some(content => content.includes('WebGLRenderer')),
  };
}
for (const [name, marker] of [['ambientShader', 'shader'], ['threeShelf', 'three']]) {
  const matches = chunks.filter(chunk => chunk[marker]);
  if (!matches.length) throw new Error(`Could not identify lazy ${name} chunk`);
  out.lazyChunks[name] = {
    files: matches.map(({ ref, raw, gzip }) => ({ ref, rawKB: kb(raw), gzipKB: kb(gzip) })),
    gzipKB: kb(matches.reduce((sum, file) => sum + file.gzip, 0)),
  };
}
console.log(JSON.stringify(out, null, 2));
