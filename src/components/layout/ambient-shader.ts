import { isMotionPaused, subscribeMotionPaused } from "./motion-state";

const VERTEX = `attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}`;

const FRAGMENT = `#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
uniform vec2 r;
uniform float t;
uniform vec3 c;
uniform vec3 b;
uniform vec2 m;
uniform float s;

float h(vec2 x){return fract(sin(dot(x,vec2(127.1,311.7)))*43758.5453123);}
float n(vec2 x){
  vec2 i=floor(x),f=fract(x);
  f=f*f*(3.-2.*f);
  return mix(mix(h(i),h(i+vec2(1.,0.)),f.x),mix(h(i+vec2(0.,1.)),h(i+vec2(1.,1.)),f.x),f.y);
}
float fbm(vec2 p){
  float v=0.,a=.5;
  mat2 rot=mat2(.8,-.6,.6,.8);
  for(int i=0;i<4;i++){v+=a*n(p);p=rot*p*2.03+vec2(1.7,9.2);a*=.5;}
  return v;
}
void main(){
  vec2 u=gl_FragCoord.xy/r;
  float aspect=r.x/max(r.y,1.);
  vec2 p=vec2((u.x-.5)*aspect,u.y-.5+s*.12);

  float slow=t*.075;
  vec2 q=vec2(fbm(p*1.6+vec2(slow,-.6*slow)),fbm(p*1.6+vec2(-.5*slow,slow)+3.1));
  vec2 w=vec2(fbm(p*2.2+1.4*q+vec2(1.7,9.2)+slow*.7),fbm(p*2.2+1.4*q+vec2(8.3,2.8)-slow*.5));
  float silk=fbm(p*1.9+w*.85);

  // Diagonal volumetric studio light beams from upper-right
  vec2 origin=vec2(.42*aspect,.58)+((m-.5)*vec2(.18,.12));
  vec2 dir=p-origin;
  float dist=length(dir);
  float angle=atan(dir.y,dir.x+1e-5);
  float rays=n(vec2(angle*5.5+slow*1.1,dist*1.4-slow*.6))*.65+n(vec2(angle*11.-slow*.8,dist*2.2))*.35;
  float cone=smoothstep(1.55,.08,dist)*smoothstep(-.98,-.15,sin(angle));
  float beam=pow(clamp(rays,.0001,1.),1.8)*cone;

  // Horizon depth glow + cursor halo
  vec2 cursor=vec2((m.x-.5)*aspect,m.y-.5);
  float halo=exp(-dot(p-cursor,p-cursor)*4.2)*.28;
  float ribbon=smoothstep(.30,.78,silk)*smoothstep(1.35,.15,length(p-vec2(.18*aspect,.12)));

  // Blend studio accent & secondarymint/violet harmonic into theme background
  vec3 secondary=mix(c,vec3(.42,.82,.76),.28);
  float lumaBg=dot(b,vec3(.299,.587,.114));
  float intensity=mix(.34,.18,smoothstep(.2,.8,lumaBg));

  vec3 col=b;
  col=mix(col,c,clamp((ribbon*.65+beam*.75+halo)*intensity,0.,.52));
  col+=secondary*beam*intensity*.32;

  // Subtle filmic grain to prevent 8-bit gradient banding
  float dither=(h(gl_FragCoord.xy+fract(t))-0.5)/255.0;
  gl_FragColor=vec4(clamp(col+dither,0.,1.),1.);
}`;

export type RGB = readonly [number, number, number];
const FALLBACK_ACCENT: RGB = [165 / 255, 170 / 255, 1];
const FALLBACK_BG: RGB = [9 / 255, 11 / 255, 16 / 255];

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
      return percentage ? (number / 100) * 255 : number;
    });
    if (channels.length === 3 && channels.every(channel => Number.isFinite(channel) && channel >= 0 && channel <= 255)) {
      return channels.map(channel => channel / 255) as unknown as RGB;
    }
  }
  return fallback;
}

/** Mount one decorative volumetric GL pass. Returns cleanup, or undefined on failure. */
export function mountAmbient(canvas: HTMLCanvasElement): (() => void) | undefined {
  let gl: WebGLRenderingContext | null = null;
  try {
    gl = (canvas.getContext("webgl", {
      alpha: false,
      antialias: false,
      depth: false,
      stencil: false,
      powerPreference: "low-power",
      failIfMajorPerformanceCaveat: true,
    }) ??
      canvas.getContext("webgl", {
        alpha: false,
        antialias: false,
        depth: false,
        stencil: false,
        powerPreference: "low-power",
      })) as WebGLRenderingContext | null;
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
  let paused = isMotionPaused();
  let frozenTime = 0;
  let io: IntersectionObserver | undefined;
  let unsubscribePause: (() => void) | undefined;

  let uniformR: WebGLUniformLocation | null = null;
  let uniformT: WebGLUniformLocation | null = null;
  let uniformM: WebGLUniformLocation | null = null;
  let uniformS: WebGLUniformLocation | null = null;

  let targetMX = 0.72;
  let targetMY = 0.68;
  let currentMX = 0.72;
  let currentMY = 0.68;
  let scrollProgress = 0;

  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const width = Math.max(1, Math.floor(canvas.clientWidth * dpr));
    const height = Math.max(1, Math.floor(canvas.clientHeight * dpr));
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
      context.viewport(0, 0, width, height);
    }
  };

  const drawFrame = (timeSeconds: number) => {
    resize();
    currentMX += (targetMX - currentMX) * 0.08;
    currentMY += (targetMY - currentMY) * 0.08;
    context.uniform2f(uniformR, canvas.width, canvas.height);
    context.uniform1f(uniformT, timeSeconds);
    context.uniform2f(uniformM, currentMX, currentMY);
    context.uniform1f(uniformS, scrollProgress);
    context.drawArrays(context.TRIANGLES, 0, 3);
    canvas.dataset.state = "ready";
  };

  function tick(now: number) {
    if (disposed) return;
    cancelAnimationFrame(frame);
    if (!inView || document.visibilityState !== "visible") return;
    if (paused) {
      drawFrame(frozenTime);
      return;
    }
    if (now - last < 33) {
      frame = requestAnimationFrame(tick);
      return;
    }
    last = now;
    frozenTime = now / 1000;
    drawFrame(frozenTime);
    frame = requestAnimationFrame(tick);
  }

  const onPointer = (event: PointerEvent) => {
    if (paused) return;
    const rect = canvas.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;
    targetMX = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));
    targetMY = Math.min(1, Math.max(0, 1 - (event.clientY - rect.top) / rect.height));
  };

  const onScroll = () => {
    scrollProgress = Math.min(1, Math.max(0, window.scrollY / Math.max(window.innerHeight, 600)));
    if (paused && inView && document.visibilityState === "visible") {
      drawFrame(frozenTime);
    }
  };

  const onVisibility = () => {
    if (document.visibilityState === "visible" && inView && !paused) {
      tick(performance.now());
    }
  };

  const onLost = (event: Event) => {
    event.preventDefault();
    cleanup();
  };

  const cleanup = () => {
    if (disposed) return;
    disposed = true;
    cancelAnimationFrame(frame);
    unsubscribePause?.();
    document.removeEventListener("visibilitychange", onVisibility);
    window.removeEventListener("resize", resize);
    window.removeEventListener("pointermove", onPointer);
    window.removeEventListener("scroll", onScroll);
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
      context.shaderSource(shader, source);
      context.compileShader(shader);
      if (!context.getShaderParameter(shader, context.COMPILE_STATUS)) throw new Error("shader");
      return shader;
    };
    const vs = compile(context.VERTEX_SHADER, VERTEX);
    const fs = compile(context.FRAGMENT_SHADER, FRAGMENT);
    program = context.createProgram();
    if (!program) throw new Error("program");
    context.attachShader(program, vs);
    context.attachShader(program, fs);
    context.linkProgram(program);
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
    uniformM = context.getUniformLocation(program, "m");
    uniformS = context.getUniformLocation(program, "s");

    const styles = getComputedStyle(document.documentElement);
    const accent = parseCssColor(styles.getPropertyValue("--accent"), FALLBACK_ACCENT);
    const background = parseCssColor(styles.getPropertyValue("--bg"), FALLBACK_BG);
    context.uniform3f(context.getUniformLocation(program, "c"), ...accent);
    context.uniform3f(context.getUniformLocation(program, "b"), ...background);

    canvas.addEventListener("webglcontextlost", onLost);
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onPointer, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });

    unsubscribePause = subscribeMotionPaused(() => {
      paused = isMotionPaused();
      if (!paused && inView && document.visibilityState === "visible") {
        last = 0;
        tick(performance.now());
      }
    });

    if (typeof IntersectionObserver !== "undefined") {
      io = new IntersectionObserver(entries => {
        inView = entries[0]?.isIntersecting ?? false;
        if (inView) tick(performance.now());
      });
      io.observe(canvas);
    }

    onScroll();
    resize();
    tick(performance.now());
    return cleanup;
  } catch {
    cleanup();
    return undefined;
  }
}
