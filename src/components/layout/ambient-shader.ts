const VERTEX = `attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}`;
const FRAGMENT = `precision mediump float;uniform vec2 r;uniform float t;uniform vec3 c;
float h(vec2 x){return fract(sin(dot(x,vec2(127.1,311.7)))*43758.5453);}
float n(vec2 x){vec2 i=floor(x),f=fract(x);f=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y);}
void main(){vec2 u=gl_FragCoord.xy/r;float m=n(u*3.+vec2(t*.05,-t*.03));float g=smoothstep(.2,.95,u.y)*.55+.2*m;float v=smoothstep(1.25,.2,length(u-vec2(.78,.72)));vec3 col=mix(vec3(.02,.025,.045),c,g*v*.16);gl_FragColor=vec4(col,1.);}`;

/** Mount one decorative GL pass. Returns cleanup, or undefined on any failure. */
export function mountAmbient(canvas: HTMLCanvasElement): (() => void) | undefined {
  let gl: WebGLRenderingContext | null = null;
  try {
    gl = canvas.getContext("webgl", { alpha: false, antialias: false, depth: false, stencil: false, powerPreference: "low-power" }) as WebGLRenderingContext | null;
  } catch {
    return undefined;
  }
  if (!gl) return undefined;
  const context = gl;
  let program: WebGLProgram | null = null;
  let buffer: WebGLBuffer | null = null;
  let frame = 0;
  let visible = true;
  let disposed = false;
  let last = 0;
  let io: IntersectionObserver | undefined;
  let uniformR: WebGLUniformLocation | null = null;
  let uniformT: WebGLUniformLocation | null = null;
  let uniformC: WebGLUniformLocation | null = null;

  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 1.25);
    const width = Math.max(1, Math.floor(canvas.clientWidth * dpr));
    const height = Math.max(1, Math.floor(canvas.clientHeight * dpr));
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width; canvas.height = height;
      context.viewport(0, 0, width, height);
    }
  };
  const accent = () => {
    const light = document.documentElement.dataset.theme === "light";
    context.uniform3f(uniformC, light ? 0.32 : 0.55, light ? 0.35 : 0.58, light ? 0.78 : 1.0);
  };
  function tick(now: number) {
    if (disposed) return;
    cancelAnimationFrame(frame);
    if (!visible || document.visibilityState !== "visible") return;
    if (now - last < 50) { frame = requestAnimationFrame(tick); return; }
    last = now;
    resize(); accent();
    context.uniform2f(uniformR, canvas.width, canvas.height);
    context.uniform1f(uniformT, now / 1000);
    context.drawArrays(context.TRIANGLES, 0, 3);
    canvas.dataset.state = "ready";
    frame = requestAnimationFrame(tick);
  }
  const onVisibility = () => { visible = document.visibilityState === "visible"; if (visible) tick(performance.now()); };
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
    canvas.dataset.state = "fallback";
  };

  try {
    const compile = (type: number, source: string) => {
      const shader = context.createShader(type);
      if (!shader) throw new Error("shader");
      context.shaderSource(shader, source); context.compileShader(shader);
      if (!context.getShaderParameter(shader, context.COMPILE_STATUS)) { context.deleteShader(shader); throw new Error("shader"); }
      return shader;
    };
    const vs = compile(context.VERTEX_SHADER, VERTEX);
    const fs = compile(context.FRAGMENT_SHADER, FRAGMENT);
    program = context.createProgram();
    if (!program) throw new Error("program");
    context.attachShader(program, vs); context.attachShader(program, fs); context.linkProgram(program);
    context.deleteShader(vs); context.deleteShader(fs);
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
    uniformC = context.getUniformLocation(program, "c");
    canvas.addEventListener("webglcontextlost", onLost);
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("resize", resize);
    io = new IntersectionObserver(entries => {
      visible = entries[0]?.isIntersecting ?? false;
      if (visible) tick(performance.now());
    });
    io.observe(canvas);
    resize(); accent(); tick(performance.now());
    return cleanup;
  } catch {
    cleanup();
    return undefined;
  }
}
