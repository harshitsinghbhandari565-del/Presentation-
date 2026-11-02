export const HERO_LINES = ["Less searching.", "More <em>learning.</em>"];
export function buildHero(root, impl) {
  root.innerHTML = `
  <div class="ak-hero" data-impl="${impl}">
    <div class="ak-curtain" aria-hidden="true"><span>Harshit Presentation Hub</span></div>
    <p class="ak-eyebrow">A little more organised · curated study resources</p>
    <h1 class="ak-title">${HERO_LINES.map((l, i) => `<span class="ak-line"><i>${l}</i></span>`).join("")}</h1>
    <p class="ak-sub">Presentations, notes and worksheets from Drive, Docs, Slides and Dropbox — one address, filters that remember themselves, and a link you can actually send.</p>
    <p class="ak-cta"><a class="ak-button" href="#library">Browse the library</a> <button class="ak-quiet" data-demo="palette">⌘K</button></p>
  </div>
  <style id="ak-hero-style">
    .ak-hero{position:relative;min-height:70vh;display:grid;align-content:center;gap:18px;overflow:hidden;padding:40px 0}
    .ak-curtain{position:absolute;inset:0;background:var(--bg);display:grid;place-items:center;
      font:600 12px/1 var(--font-ui);letter-spacing:.3em;text-transform:uppercase;color:var(--text-muted);z-index:3}
    .ak-eyebrow{margin:0;font-size:11.5px;letter-spacing:.16em;text-transform:uppercase;color:var(--accent)}
    .ak-title{margin:0;font-family:var(--font-display);font-weight:500;font-size:clamp(38px,8.5vw,86px);line-height:1.02;letter-spacing:-.025em}
    .ak-line{display:block;overflow:hidden}
    .ak-line>i{display:block;font-style:normal;will-change:transform}
    .ak-title em{font-style:italic;color:var(--accent)}
    .ak-sub{margin:0;max-width:52ch;color:var(--text-secondary);font-size:clamp(15px,1.6vw,17px)}
    .ak-cta{display:flex;gap:10px;align-items:center;margin-top:6px}
    .ak-button{display:inline-flex;align-items:center;gap:8px;background:var(--accent);color:#08090d;text-decoration:none;
      font-weight:650;padding:12px 18px;border-radius:12px;min-height:44px;transition:transform var(--motion-micro) var(--ease-default)}
    .ak-button:hover{transform:translateY(-1px)}
    .ak-quiet{background:none;border:1px solid var(--border);color:var(--text-secondary);border-radius:12px;padding:12px 14px;min-height:44px;cursor:pointer}
    @media (prefers-reduced-motion: reduce){.ak-line>i{transform:none !important}.ak-curtain{display:none}}
    html[data-motion=reduce] .ak-curtain{display:none}
  </style>`;
  return {
    curtain: root.querySelector(".ak-curtain"), title: root.querySelector(".ak-title"),
    sub: root.querySelector(".ak-sub"), cta: root.querySelector(".ak-cta"),
  };
}
