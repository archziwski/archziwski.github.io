import { useEffect, useRef } from "react";

// ————————————————————————————————————————————————
// Bass Ripple Arka Planı — yüklenen bass-ripple.html
// shader'ının React portu; monokrom arch temasine boyandi:
// siyah zemin üzerinde gümüş/krom ızgara, vuruşta öne
// çıkan saf beyaz vurgu ışığı ve beyaz delik sızıntısı.
// Fare/dokunmatik takip'li dalgaciklar window'dan dinlenir,
// kanvas pointer-events:none ile içerikle çakışmaz.
// ————————————————————————————————————————————————

const VERT_SRC = "attribute vec2 a_pos; void main(){gl_Position=vec4(a_pos,0,1);}";

const FRAG_SRC = `
precision highp float;
uniform float u_time;
uniform vec2 u_res;
uniform float u_bassFreq;
uniform float u_bassIntensity;
uniform vec2 u_mouse;

#define PI 3.14159265359
#define TAU 6.28318530718

// ── Hash / noise ──
float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1,0)), f.x),
             mix(hash(i + vec2(0,1)), hash(i + vec2(1,1)), f.x), f.y);
}

// ── Rotation ──
mat2 rot2(float a) {
  float c = cos(a), s = sin(a);
  return mat2(c, -s, s, c);
}

// ── Beat-synced displacement ──
float displacement(vec2 p, float t, float bassFreq, float intensity) {
  float period = 1.0 / max(bassFreq, 0.01);
  float phase = t / period;
  float beatFrac = fract(phase);

  float envelope = exp(-beatFrac * 3.5);
  float prevEnv = exp(-(beatFrac + 1.0) * 3.5);
  float prevEnv2 = exp(-(beatFrac + 2.0) * 3.5);

  float dist = length(p);
  float angle = atan(p.y, p.x);

  float wave1 = sin(dist * 14.0 - beatFrac * 22.0) * envelope;
  float wave2 = sin(dist * 9.0 - (beatFrac + 1.0) * 16.0) * prevEnv * 0.6;
  float wave3 = sin(dist * 6.0 - (beatFrac + 2.0) * 12.0) * prevEnv2 * 0.3;
  float standing = (sin(p.x * 18.0) * sin(p.y * 18.0)) * envelope * 0.3;

  float radialMode = sin(dist * 22.0) * cos(angle * 3.0) * envelope * 0.2;
  radialMode += sin(dist * 16.0) * cos(angle * 5.0 + 1.0) * prevEnv * 0.1;

  vec2 offCenter = vec2(0.3 * sin(t * 0.2), 0.25 * cos(t * 0.25));
  float dist2 = length(p - offCenter);
  float wave6 = sin(dist2 * 12.0 - beatFrac * 18.0) * envelope * 0.35;

  float mouseWave = 0.0;
  if (u_mouse.x > 0.0) {
    vec2 mouseNorm = (u_mouse / u_res - 0.5) * vec2(u_res.x / u_res.y, 1.0);
    float mouseDist = length(p - mouseNorm);
    mouseWave = sin(mouseDist * 16.0 - beatFrac * 20.0) * envelope * 0.7;
    mouseWave += sin(mouseDist * 10.0 - (beatFrac + 1.0) * 14.0) * prevEnv * 0.4;
    mouseWave *= 1.0 / (1.0 + mouseDist * 3.0);
  }

  float dome = (1.0 - smoothstep(0.0, 1.0, dist)) * envelope * 0.8;

  float h = (wave1 + wave2 + wave3 + standing + radialMode + wave6 + mouseWave + dome) * intensity;

  float idle = sin(dist * 8.0 + t * 3.0) * 0.03 * (1.0 - envelope);
  idle += sin(dist * 5.0 - t * 1.5) * 0.015 * (1.0 - envelope);
  h += idle * intensity;

  return h;
}

vec3 calcNormal(vec2 p, float t, float bassFreq, float intensity, float hc) {
  float eps = 0.002;
  float hx = displacement(p + vec2(eps, 0.0), t, bassFreq, intensity);
  float hy = displacement(p + vec2(0.0, eps), t, bassFreq, intensity);
  vec3 n = normalize(vec3(-(hx - hc) / eps * 0.35, -(hy - hc) / eps * 0.35, 1.0));
  return n;
}

// ── Hexagonal grid distance ──
vec3 hexGrid(vec2 p, float scale) {
  p *= scale;
  vec2 r = vec2(1.0, 1.732);
  vec2 h = r * 0.5;
  vec2 a = mod(p, r) - h;
  vec2 b = mod(p - h, r) - h;
  vec2 g;
  if (dot(a, a) < dot(b, b)) {
    g = a;
  } else {
    g = b;
  }
  float edgeDist = 0.5 - max(abs(g.x) * 1.0 + abs(g.y) * 0.577, abs(g.y) * 1.155);
  vec2 cellId = p - g;
  return vec3(edgeDist, cellId);
}

float fresnel(float cosTheta, float f0) {
  return f0 + (1.0 - f0) * pow(1.0 - cosTheta, 5.0);
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_res;
  float aspect = u_res.x / u_res.y;
  float t = u_time;

  vec2 cuv = vec2((uv.x - 0.5) * aspect, uv.y - 0.5);

  // Kamera — hafif eksen dışı, yavaş sürüklenme
  float camDriftX = sin(t * 0.15) * 0.03;
  float camDriftY = cos(t * 0.12) * 0.02;

  float tiltAngle = 0.35 + camDriftY;
  float foreshorten = 0.7 + camDriftY * 0.5;

  vec2 meshUV = cuv;
  meshUV.x += camDriftX;
  meshUV.y = meshUV.y / foreshorten;
  meshUV.y += 0.08;
  meshUV = rot2(0.06 + sin(t * 0.08) * 0.02) * meshUV;

  float h = displacement(meshUV, t, u_bassFreq, u_bassIntensity);
  vec3 N = calcNormal(meshUV, t, u_bassFreq, u_bassIntensity, h);

  // Altıgen ızgara
  float meshScale = 45.0;
  vec3 hex = hexGrid(meshUV + N.xy * 0.003, meshScale);
  float hexEdge = hex.x;

  float wireWidth = 0.06;
  float wire = 1.0 - smoothstep(0.0, wireWidth, hexEdge);
  float hole = smoothstep(wireWidth, wireWidth + 0.02, hexEdge);

  vec2 microGrid = fract(meshUV * meshScale * 3.0 + N.xy * 0.01);
  float microWire = smoothstep(0.04, 0.0, min(microGrid.x, microGrid.y));
  microWire += smoothstep(0.04, 0.0, min(1.0 - microGrid.x, 1.0 - microGrid.y));
  microWire *= 0.15;

  // ── Işıklar (monokrom arch paleti: gri taban, beyaz vurgu) ──
  vec3 V = normalize(vec3(-cuv.x * 0.3, -cuv.y * 0.3 + 0.2, 1.0));

  float period = 1.0 / max(u_bassFreq, 0.01);
  float bFrac = fract(t / period);
  float bEnv = exp(-bFrac * 3.5);

  // Ana ışık — mor, yüzeyi süpürür
  vec3 L1 = normalize(vec3(0.4 + sin(t * 0.25) * 0.4, 0.6 + cos(t * 0.18) * 0.3, 1.0));
  float NdL1 = max(dot(N, L1), 0.0);
  vec3 H1 = normalize(L1 + V);
  float NdH1 = max(dot(N, H1), 0.0);
  float spec1 = pow(NdH1, 180.0);
  float spec1med = pow(NdH1, 50.0);
  float spec1soft = pow(NdH1, 12.0);
  vec3 lightCol1 = vec3(0.92, 0.92, 1.0);

  // Dolgu — koyu menekşe, soldan
  vec3 L2 = normalize(vec3(-0.8 + sin(t * 0.15) * 0.2, 0.4, 0.8));
  float NdL2 = max(dot(N, L2), 0.0);
  vec3 H2 = normalize(L2 + V);
  float NdH2 = max(dot(N, H2), 0.0);
  float spec2 = pow(NdH2, 120.0);
  float spec2soft = pow(NdH2, 25.0);
  vec3 lightCol2 = vec3(0.55, 0.55, 0.62);

  // Vurgu ışığı — saf beyaz, vuruşla hareket eder; öne çıkan parlaklık
  vec3 L3 = normalize(vec3(0.3 + bEnv * 0.3, -0.6, 0.6));
  float NdL3 = max(dot(N, L3), 0.0);
  vec3 H3 = normalize(L3 + V);
  float NdH3 = max(dot(N, H3), 0.0);
  float spec3 = pow(NdH3, 90.0);
  float spec3soft = pow(NdH3, 18.0);
  vec3 lightCol3 = vec3(1.0, 1.0, 1.0);

  vec3 L4 = normalize(vec3(0.0, 0.1, 1.0));
  float NdL4 = max(dot(N, L4), 0.0);

  float NdV = max(dot(N, V), 0.0);
  float rim = pow(1.0 - NdV, 4.0);
  vec3 rimCol = vec3(0.85, 0.85, 0.92);

  // ── Malzeme: gümüş/krom metal ──
  vec3 baseColor = vec3(0.40, 0.40, 0.44);
  baseColor += vec3(0.040, 0.040, 0.045) * noise(meshUV * 30.0);
  baseColor += vec3(0.022, 0.022, 0.026) * noise(meshUV * 80.0 + 5.0);

  float f0 = 0.75;
  float fres = fresnel(NdV, f0);

  vec3 diffuse = baseColor * (NdL1 * lightCol1 * 1.0 + NdL2 * lightCol2 * 0.5 + NdL3 * lightCol3 * 0.25 + NdL4 * 0.4);
  diffuse += baseColor * 0.24;
  vec3 hemiAmb = mix(vec3(0.040, 0.040, 0.045), vec3(0.090, 0.090, 0.100), N.y * 0.5 + 0.5);
  diffuse += hemiAmb;

  vec3 specular = vec3(0.0);
  specular += spec1 * lightCol1 * 4.2;
  specular += spec1med * lightCol1 * 1.4;
  specular += spec1soft * lightCol1 * 0.25;
  specular += spec2 * lightCol2 * 3.0;
  specular += spec2soft * lightCol2 * 0.5;
  specular += spec3 * lightCol3 * 3.6;
  specular += spec3soft * lightCol3 * 0.4;
  specular *= fres;
  specular *= 1.0 + bEnv * 1.0 * u_bassIntensity;

  float wireCenter = abs(hexEdge - wireWidth * 0.5) / max(wireWidth, 0.001);
  float aniso = pow(max(1.0 - wireCenter, 0.0), 3.0);
  specular += aniso * wire * vec3(0.45, 0.45, 0.50) * fres * 0.5;

  vec3 wireCol = diffuse + specular;
  wireCol += rim * rimCol * 0.8;
  wireCol += microWire * vec3(0.14, 0.14, 0.16) * fres;

  // ── Delik içi — derin karanlık ──
  vec3 holeCol = vec3(0.012, 0.012, 0.014);
  float coneRefl = max(dot(N, vec3(0.0, 0.0, 1.0)), 0.0);
  holeCol += vec3(0.032, 0.032, 0.036) * coneRefl;

  float conePush = max(h * 0.4, 0.0);
  holeCol += vec3(0.065, 0.065, 0.072) * conePush;
  // Vuruşta deliklerden beyaz ışık sızması
  holeCol += vec3(0.45, 0.45, 0.50) * bEnv * 0.55 * u_bassIntensity;
  // Kısık gri yaka sızması
  holeCol += vec3(0.16, 0.16, 0.19) * bEnv * 0.25 * u_bassIntensity;

  vec3 col = mix(holeCol, wireCol, wire);
  col += microWire * vec3(0.020, 0.020, 0.022) * (1.0 - hole * 0.7);

  // Vuruş yıkaması — gri tonlar arasında salınır
  vec3 beatColor = mix(vec3(0.30, 0.30, 0.34), vec3(0.16, 0.16, 0.18), sin(t * 0.4) * 0.5 + 0.5);
  col += beatColor * bEnv * 0.055 * u_bassIntensity;

  // Ortam yansıması — gri stüdyo
  vec3 refl = reflect(-V, N);
  vec3 envCol = vec3(0.022, 0.022, 0.026);
  envCol += vec3(0.14, 0.14, 0.16) * pow(max(refl.y, 0.0), 2.0);
  envCol += vec3(0.19, 0.19, 0.22) * pow(max(-refl.x, 0.0), 2.0);
  envCol += vec3(0.23, 0.23, 0.27) * pow(max(-refl.y, 0.0), 3.0);
  // Softbox — beyaz stüdyo lekesi
  float softbox = pow(max(dot(refl, normalize(vec3(0.2, 0.8, 0.5))), 0.0), 8.0);
  envCol += vec3(0.55, 0.55, 0.62) * softbox;
  envCol *= 1.0 + bEnv * 0.5 * u_bassIntensity;
  col += envCol * fres * wire * 0.7;

  // ── Post ──
  vec2 vc = uv - 0.5;
  float vig = 1.0 - dot(vc, vc) * 1.7;
  vig = smoothstep(0.0, 1.0, vig);
  col *= vig;

  float dofDist = length(cuv);
  float dof = smoothstep(0.3, 0.8, dofDist);
  col = mix(col, col * vec3(0.75, 0.75, 0.78), dof * 0.3);

  float grain = hash(gl_FragCoord.xy + fract(t * 7.3) * 100.0);
  col += (grain - 0.5) * 0.018;

  float ca = dofDist * 0.003;
  col.r += (hash(gl_FragCoord.xy * 0.5 + 1.0) - 0.5) * ca;
  col.b += (hash(gl_FragCoord.xy * 0.5 + 2.0) - 0.5) * ca;

  col = col / (col + vec3(1.5));
  col = pow(max(col, vec3(0.0)), vec3(0.88));

  gl_FragColor = vec4(col, 1.0);
}
`;

const BASS_FREQ = 0.34;
const BASS_INTENSITY = 0.9;

export default function BassRippleBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl", {
      alpha: false,
      antialias: false,
      preserveDrawingBuffer: false,
    });
    if (!gl) return;

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let running = true;
    let raf = 0;
    let bassFreq = BASS_FREQ;
    let bassIntensity = BASS_INTENSITY;

    const compile = (type: number, src: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
        console.error(gl.getShaderInfoLog(s));
      }
      return s;
    };

    const prog = gl.createProgram()!;
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT_SRC));
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG_SRC));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      console.error(gl.getProgramInfoLog(prog));
    }
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 3, -1, -1, 3]),
      gl.STATIC_DRAW,
    );
    const aPos = gl.getAttribLocation(prog, "a_pos");
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const uTime = gl.getUniformLocation(prog, "u_time");
    const uRes = gl.getUniformLocation(prog, "u_res");
    const uBassFreq = gl.getUniformLocation(prog, "u_bassFreq");
    const uBassIntensity = gl.getUniformLocation(prog, "u_bassIntensity");
    const uMouse = gl.getUniformLocation(prog, "u_mouse");

    let mouseX = -1.0;
    let mouseY = -1.0;
    // Arka plan olduğu için işaretçiyi window'dan dinle;
    // içer pointer-events kanvasa hiç gelmez.
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    let needsResize = true;

    const resize = () => {
      needsResize = false;
      const w = Math.round(canvas.clientWidth * dpr);
      const h = Math.round(canvas.clientHeight * dpr);
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
      gl.viewport(0, 0, canvas.width, canvas.height);
    };

    let first = true;
    const render = (now: number) => {
      if (!running) return;
      if (needsResize) resize();
      // Uniform'lar program başına state'tir; StrictMode'daki ikinci mount
      // boyut değişmediği için resize if'ine girmez — o yüzden u_res
      // her karede, koşulsuz set edilir.
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform1f(uTime, prefersReduced ? 0.0 : now * 0.001);
      gl.uniform1f(uBassFreq, bassFreq);
      gl.uniform1f(uBassIntensity, bassIntensity);
      gl.uniform2f(uMouse, mouseX, mouseY);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      if (first) {
        // tanılama: ilk kare çizildi
        canvas.dataset.bass = "ok";
        first = false;
      }
      raf = requestAnimationFrame(render);
    };

    const onResize = () => {
      needsResize = true;
    };
    const onPointerMove = (e: PointerEvent) => {
      mouseX = e.clientX * dpr;
      mouseY = (canvas.clientHeight - e.clientY) * dpr;
    };
    const onPointerUp = (e: PointerEvent) => {
      if (e.pointerType === "touch") {
        mouseX = -1.0;
        mouseY = -1.0;
      }
    };
    const onVisibility = () => {
      if (document.hidden) {
        running = false;
      } else {
        running = true;
        raf = requestAnimationFrame(render);
      }
    };

    window.addEventListener("resize", onResize);
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerup", onPointerUp, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);

    resize();
    raf = requestAnimationFrame(render);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0">
      <canvas ref={canvasRef} className="block h-full w-full" />
    </div>
  );
}
