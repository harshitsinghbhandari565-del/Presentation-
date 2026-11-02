// Shared lab runtime. Research-only. Every experiment uses it so reduced-motion / fallback / stats
// behaviour is identical across the lab (and testable headlessly).
export const q = (s, r = document) => r.querySelector(s);
export const qa = (s, r = document) => [...r.querySelectorAll(s)];
export const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

const params = new URLSearchParams(typeof location !== "undefined" && location?.search ? location.search : "");
let forcedFallback = params.get("fallback") === "1";
export const prefs = {
  get reduced() { return document.documentElement.dataset.motion === "reduce"
    || (force("reduce") ?? (typeof matchMedia === "function" ? matchMedia("(prefers-reduced-motion: reduce)").matches : false)); },
  get fallback() { return forcedFallback; },
  set fallback(v) { forcedFallback = !!v; },
  get stats() { return false; },
  get theme() { try { return globalThis.localStorage?.getItem("lab.theme") || "dark"; } catch { return "dark"; } },
};
function force(kind) { return params.get("motion") === kind ? true : null; }

export function hasWebGL() {
  if (prefs.fallback) return false;
  return !!(glContext(document.createElement("canvas"), "webgl2") || glContext(document.createElement("canvas"), "webgl"));
}
/** getContext can THROW (privacy-blocked canvas, headless DOMs, some in-app webviews) — never let it reach boot(). */
export function glContext(canvas, type = "webgl2") {
  try {
    if (!canvas || typeof canvas.getContext !== "function") return null;
    return canvas.getContext(type);
  } catch { return null; }
}
/** Feature detection that must never throw: CSS.supports is absent in some DOM shims and throws on bad syntax. */
export function supports(prop, value) {
  try { return typeof CSS !== "undefined" && typeof CSS.supports === "function" ? !!CSS.supports(prop, value) : false; }
  catch { return false; }
}
export const canViewTransition = () => supports("view-transition-name", "auto") && typeof document.startViewTransition === "function";
export function mq(query) {
  try { return typeof matchMedia === "function" ? !!matchMedia(query).matches : false; } catch { return false; }
}
/** "API missing" must NOT be read as "weak device" — Safari and Firefox have no deviceMemory. */
export function lowPower() {
  const mem = navigator.deviceMemory ?? 8;
  const cores = navigator.hardwareConcurrency ?? 8;
  const conn = navigator.connection;
  const slow = !!conn && /(^|-)2g$/.test(conn.effectiveType ?? "");
  return mem <= 4 || cores <= 2 || slow || mq("(pointer: coarse)");
}
export function dprCap(high = 1.5, low = 1) { return Math.min(devicePixelRatio || 1, lowPower() ? low : high); }

/** Toolbar: reduced-motion + fallback + theme + stats. Same keys in every experiment. */
export function chrome({ onReduced, onFallback, onTheme } = {}) {
  const bar = document.createElement("div");
  bar.className = "toolbar";
  bar.innerHTML = `<span><kbd>R</kbd> reduced · <kbd>F</kbd> fallback · <kbd>G</kbd> stats · <kbd>T</kbd> theme</span>
    <button data-k=reduce aria-pressed=${prefs.reduced}>reduced-motion</button>
    <button data-k=fallback aria-pressed=${prefs.fallback}>force fallback</button>
    <button data-k=theme>theme: ${prefs.theme}</button>
    <button data-k=stats aria-pressed=${prefs.stats}>fps</button>`;
  document.body.appendChild(bar);
  const fps = document.createElement("div");
  fps.className = "fps"; fps.textContent = "— fps";
  document.body.appendChild(fps);
  let last = performance.now(), frames = 0;
  (function tick(t) { frames++; if (t - last > 500) { fps.textContent = Math.round(frames * 1000 / (t - last)) + " fps"; frames = 0; last = t; } requestAnimationFrame(tick); })(performance.now());
  const set = (k, v) => {
    if (k === "reduce") { document.documentElement.dataset.motion = v ? "reduce" : "no-preference"; onReduced?.(v); }
    if (k === "fallback") { prefs.fallback = v; onFallback?.(v); }
    if (k === "stats") document.body.dataset.stats = v ? "1" : "0";
    if (k === "theme") { document.documentElement.dataset.theme = v; localStorage.setItem("lab.theme", v); }
  };
  bar.addEventListener("click", e => {
    const k = e.target.dataset?.k; if (!k) return;
    if (k === "theme") { const n = document.documentElement.dataset.theme === "light" ? "dark" : "light"; set(k, n); e.target.textContent = "theme: " + n; return; }
    set(k, e.target.getAttribute("aria-pressed") !== "true");
    e.target.setAttribute("aria-pressed", String(e.target.getAttribute("aria-pressed") === "true"));
  });
  addEventListener("keydown", e => {
    const map = { r: "reduce", f: "fallback", g: "stats" };
    const k = map[e.key.toLowerCase()]; if (!k) return;
    const btn = bar.querySelector(`[data-k=${k}]`); btn?.click();
  });
  set("reduce", prefs.reduced);
  return { set };
}

/** Reduced-motion-aware reveal used by several experiments (CSS-first: one class, no JS timeline). */
export function cssReveal(root = document) {
  const style = document.createElement("style");
  style.textContent = `
  [data-reveal]{opacity:0;transform:translateY(var(--move-sm,8px));
    animation:ak-reveal 450ms var(--ease-out-soft,cubic-bezier(.22,1,.36,1)) both;
    animation-timeline:view(); animation-range:entry 0% entry 60%}
  @supports not (animation-timeline: view()){[data-reveal]{opacity:1;transform:none;animation:none}}
  @keyframes ak-reveal{to{opacity:1;transform:none}}
  @media (prefers-reduced-motion: reduce){[data-reveal]{animation:none;opacity:1;transform:none}}
  html[data-motion=reduce] [data-reveal]{animation:none;opacity:1;transform:none}`;
  document.head.appendChild(style);
  qa("[data-reveal]", root).forEach((el, i) => { el.style.animationDelay = `${i * 60}ms`; });
}

/** Run a construction that may throw in hostile environments (blocked canvas, old engines, SSR) and fall back. */
export function safe(fn, fallback) { try { return fn(); } catch { return fallback; } }

