const VERTEX = `attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}`;
const FRAGMENT = `precision mediump float;uniform vec2 r;uniform float t;uniform vec3 c;uniform vec3 b;
float h(vec2 x){return fract(sin(dot(x,vec2(127.1,311.7)))*43758.5453);}\nfloat n(vec2 x){vec2 i=floor(x),f=fract(x);f=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y);}\nvoid main(){vec2 u=gl_FragCoord.xy/r;float m=n(u*3.+vec2(t*.05,-t*.03));float g=smoothstep(.2,.95,u.y)*.55+.2*m;float v=smoothstep(1.25,.2,length(u-vec2(.78,.72)));vec3 col=mix(b,c,g*v*.16);gl_FragColor=vec4(col,1.);}`;

type RGB = readonly [number, number, number];
const FALLBACK_ACCENT: RGB = [0.5, 0.52, 0.8];
const FALLBACK_BG: RGB = [0.035, 0.043, 0.063];

/** Parse the site's hex/RGB colour tokens without executing CSS or using a GPU. */
export function parseCssColor(value: string, fallback: RGB): RGB {
  const text = value.trim().toLowerCase();
  const hex = /^#([\da-f]{3}|[\da-f]{6})$/.exec(text)?.[1];
  if (hex) {
    const full = hex.length === 3 ? [...hex].map(character => character + character).join("") : hex;
    return [0, 2, 4].map(offset => parseInt(full.slice(offset, offset + 2), 16) / 255) as unknown as RGB;
  }
  const rgb = /^rgba?\(([^)]+)\)$/.exec(text)?.[1];
  if (rgb) {
    const channels = rgb.split(/[\s,/]+/).filter(Boolean).slice(0, 3).map(channel => {
      if (!/^(?:\d+(?:\.\d+)?|\.\d+)%?$/.test(channel)) return Number.NaN;
      const percentage = channel.endsWith("%");
      const number = Number.parseFloat(channel);
      return percentage ? number / 100 * 255 : number;
    });
    if (channels.length === 3 && channels.every(channel => Number.isFinite(channel) && channel >= 0 && channel <= 255)) {
      return channels.map(channel => channel / 255) as unknown as RGB;
    }
  }
  return fallback;
}

/** Mount one decorative GL pass. Returns cleanup, or undefined on any failure. */
export function mountAmbient(canvas: HTMLCanvasElement): (() => void) | undefined {
  let gl: WebGLRenderingContext | null = null;
  try {
    gl = canvas.getContext("webgl", {
      alpha: false, antialias: false, depth: false, stencil: false,
      powerPreference: "low-power", failIfMajorPerformanceCaveat: true,
    }) as WebGLRenderingContext | null;
  } catch {
    return undefined;
  }
  if (!gl) return undefined;
  const context = gl;
  let program: WebGLProgram | null = null;
  let buffer: WebGLBuffer | null = null;
  const shaders: WebGLShader[] = [];
  let frame = 0;
  let inView = true;
  let disposed = false;
  let last = 0;
  let io: IntersectionObserver | undefined;
  let uniformR: WebGLUniformLocation | null = null;
  let uniformT: WebGLUniformLocation | null = null;

  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 1.25);
    const width = Math.max(1, Math.floor(canvas.clientWidth * dpr));
    const height = Math.max(1, Math.floor(canvas.clientHeight * dpr));
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width; canvas.height = height;
      context.viewport(0, 0, width, height);
    }
  };
  function tick(now: number) {
    if (disposed) return;
    cancelAnimationFrame(frame);
    if (!inView || document.visibilityState !== "visible") return;
    if (now - last < 50) { frame = requestAnimationFrame(tick); return; }
    last = now;
    resize();
    context.uniform2f(uniformR, canvas.width, canvas.height);
    context.uniform1f(uniformT, now / 1000);
    context.drawArrays(context.TRIANGLES, 0, 3);
    canvas.dataset.state = "ready";
    frame = requestAnimationFrame(tick);
  }
  const onVisibility = () => { if (document.visibilityState === "visible" && inView) tick(performance.now()); };
  const onLost = (event: Event) => { event.preventDefault(); cleanup(); };
  const cleanup = () => {
    if (disposed) return;
    disposed = true;
    cancelAnimationFrame(frame);
    document.removeEventListener("visibilitychange", onVisibility);
    window.removeEventListener("resize", resize);
    canvas.removeEventListener("webglcontextlost", onLost);
    io?.disconnect();
    if (buffer) context.deleteBuffer(buffer);
    if (program) context.deleteProgram(program);
    shaders.forEach(shader => context.deleteShader(shader));
    canvas.dataset.state = "fallback";
  };

  try {
    const compile = (type: number, source: string) => {
      const shader = context.createShader(type);
      if (!shader) throw new Error("shader");
      shaders.push(shader);
      context.shaderSource(shader, source); context.compileShader(shader);
      if (!context.getShaderParameter(shader, context.COMPILE_STATUS)) throw new Error("shader");
      return shader;
    };
    const vs = compile(context.VERTEX_SHADER, VERTEX);
    const fs = compile(context.FRAGMENT_SHADER, FRAGMENT);
    program = context.createProgram();
    if (!program) throw new Error("program");
    context.attachShader(program, vs); context.attachShader(program, fs); context.linkProgram(program);
    if (!context.getProgramParameter(program, context.LINK_STATUS)) throw new Error("link");
    context.useProgram(program);
    buffer = context.createBuffer();
    context.bindBuffer(context.ARRAY_BUFFER, buffer);
    context.bufferData(context.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), context.STATIC_DRAW);
    const loc = context.getAttribLocation(program, "p");
    context.enableVertexAttribArray(loc);
    context.vertexAttribPointer(loc, 2, context.FLOAT, false, 0, 0);
    uniformR = context.getUniformLocation(program, "r");
    uniformT = context.getUniformLocation(program, "t");
    // AmbientGL remounts on data-theme changes. Read/cache the cascade once
    // per mount, never parse colours in the animation loop. The grid is a
    // separate CSS layer above this intentionally opaque background pass.
    const styles = getComputedStyle(document.documentElement);
    const accent = parseCssColor(styles.getPropertyValue("--accent"), FALLBACK_ACCENT);
    const background = parseCssColor(styles.getPropertyValue("--bg"), FALLBACK_BG);
    context.uniform3f(context.getUniformLocation(program, "c"), ...accent);
    context.uniform3f(context.getUniformLocation(program, "b"), ...background);
    canvas.addEventListener("webglcontextlost", onLost);
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("resize", resize);
    io = new IntersectionObserver(entries => {
      inView = entries[0]?.isIntersecting ?? false;
      if (inView) tick(performance.now());
    });
    io.observe(canvas);
    resize(); tick(performance.now());
    return cleanup;
  } catch {
    cleanup();
    return undefined;
  }
}
