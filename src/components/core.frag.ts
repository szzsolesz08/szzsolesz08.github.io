export const VERT = /* glsl */ `#version 300 es
in vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }
`

export const FRAG = /* glsl */ `#version 300 es
precision highp float;

uniform vec2  uRes;
uniform float uTime;
uniform vec2  uMouse;
uniform float uDescent;
uniform float uReturn;
uniform float uEnergy;
uniform float uPulse;

out vec4 outColor;

// ---------- noise ----------
float hash(vec3 p) {
  p = fract(p * 0.3183099 + 0.1);
  p *= 17.0;
  return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
}

float noise(vec3 x) {
  vec3 i = floor(x);
  vec3 f = fract(x);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(mix(hash(i + vec3(0,0,0)), hash(i + vec3(1,0,0)), f.x),
                 mix(hash(i + vec3(0,1,0)), hash(i + vec3(1,1,0)), f.x), f.y),
             mix(mix(hash(i + vec3(0,0,1)), hash(i + vec3(1,0,1)), f.x),
                 mix(hash(i + vec3(0,1,1)), hash(i + vec3(1,1,1)), f.x), f.y), f.z);
}

float fbm(vec3 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 5; i++) {
    v += a * noise(p);
    p = p * 2.03 + vec3(1.7, 9.2, 3.1);
    a *= 0.5;
  }
  return v;
}

mat3 rotY(float a) { float c = cos(a), s = sin(a); return mat3(c,0.,-s, 0.,1.,0., s,0.,c); }
mat3 rotX(float a) { float c = cos(a), s = sin(a); return mat3(1.,0.,0., 0.,c,s, 0.,-s,c); }

// ---------- star field ----------
vec3 stars(vec2 uv, float t, float depthShift, float redness) {
  vec3 col = vec3(0.0);
  for (int layer = 0; layer < 3; layer++) {
    float fl = float(layer);
    float scale = 28.0 + fl * 22.0;
    vec2 drift = vec2(t * 0.004 * (fl + 1.0), t * 0.002) + uMouse * 0.015 * (fl + 1.0);
    // Pushing through the core streams the field outward.
    vec2 p = uv * (1.0 - depthShift * 0.35 * (fl + 1.0)) + drift;
    vec2 g = floor(p * scale);
    vec2 f = fract(p * scale) - 0.5;
    float h = hash(vec3(g, fl * 13.0));
    if (h > 0.93) {
      vec2 o = vec2(hash(vec3(g, 3.0 + fl)), hash(vec3(g, 7.0 + fl))) - 0.5;
      float d = length(f - o * 0.7);
      float tw = 0.6 + 0.4 * sin(t * (1.0 + h * 3.0) + h * 40.0);
      float b = smoothstep(0.08, 0.0, d) * tw * (0.35 + fl * 0.25);
      vec3 tint = mix(vec3(0.85, 0.83, 0.9), vec3(1.0, 0.32, 0.2), redness * h);
      col += tint * b;
    }
  }
  return col;
}

void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * uRes) / uRes.y;
  float t = uTime;

  float desc = clamp(uDescent, 0.0, 1.0);
  float ret = clamp(uReturn, 0.0, 1.0);
  float approach = desc * desc * (3.0 - 2.0 * desc);

  // Core radius: grows as you dive in, returns small at the end of the page.
  float baseR = min(0.19, 0.3 * (uRes.x / uRes.y));
  float R = mix(baseR, 3.2, pow(approach, 2.4));
  R = mix(R, baseR * 0.82, ret);
  float present = max(1.0 - smoothstep(0.82, 1.0, desc), ret);

  // Cursor gravity: the core leans towards you and the space bends.
  vec2 center = uMouse * mix(0.05, 0.02, ret) * (1.0 - approach);
  vec2 toMouse = uv - uMouse;
  float md = length(toMouse);
  vec2 bend = -normalize(toMouse + 1e-5) * 0.012 / (md * md * 40.0 + 1.0) * (1.0 + uEnergy * 3.0);
  vec2 p = uv - center + bend * (1.0 - approach);

  vec3 col = vec3(0.012, 0.009, 0.016);

  float redness = smoothstep(0.55, 1.0, desc) * (1.0 - ret * 0.6);
  col += stars(uv + bend * 2.0, t, approach, redness);

  float dist = length(p);
  float energy = uEnergy + uPulse;

  // Surface wobble
  vec2 dir = p / (dist + 1e-5);
  float wob = (fbm(vec3(dir * 1.7, t * 0.18)) - 0.5) * 0.06 * (1.0 + energy * 1.8);
  float rr = R * (1.0 + wob);

  // ---------- corona ----------
  float edge = dist - rr;
  // Sample on the unit circle, not the raw angle, so there is no seam at +-PI.
  float streak = fbm(vec3(dir * 2.2, edge * 6.0 / R - t * 0.35 + t * 0.12));
  float corona = exp(-max(edge, 0.0) / (R * (0.22 + 0.25 * energy))) * (0.55 + 0.9 * streak);
  corona *= smoothstep(-0.02, 0.0, edge);
  vec3 coronaCol = mix(vec3(0.55, 0.02, 0.03), vec3(1.0, 0.28, 0.12), streak);
  col += coronaCol * corona * 0.9 * present * max(1.0 - smoothstep(0.55, 0.9, desc), ret);

  // ---------- body ----------
  if (dist < rr) {
    float z = sqrt(max(rr * rr - dist * dist, 0.0));
    vec3 n = normalize(vec3(p, z));
    vec3 q = rotY(t * 0.12 + uMouse.x * 0.6) * rotX(-uMouse.y * 0.5) * n;
    float f1 = fbm(q * 2.4 + vec3(0.0, 0.0, t * 0.15));
    float f2 = fbm(q * 4.5 + f1 * 2.4 - vec3(t * 0.22));
    float cells = smoothstep(0.35, 0.8, f2);
    vec3 deep = vec3(0.22, 0.0, 0.01);
    vec3 mid = vec3(0.85, 0.07, 0.04);
    vec3 hot = vec3(1.0, 0.62, 0.42);
    vec3 surf = mix(deep, mid, cells);
    surf += hot * pow(f2, 4.0) * (1.6 + energy * 2.0);
    float light = 0.45 + 0.75 * max(dot(n, normalize(vec3(-0.45, 0.55, 0.75))), 0.0);
    float fres = pow(1.0 - n.z, 2.5);
    surf = surf * light + vec3(1.0, 0.25, 0.1) * fres * 0.9;
    float aa = smoothstep(0.0, 1.5 / uRes.y, rr - dist);
    // Once the core fills the view, its surface gives way to the interior.
    float surfaceFade = max(1.0 - smoothstep(0.35, 0.7, desc), ret);
    col = mix(col, surf, aa * present * surfaceFade);
  }

  // ---------- interior: the tunnel ----------
  float inside = smoothstep(0.38, 0.62, desc) * (1.0 - smoothstep(0.8, 1.0, desc));
  if (inside > 0.001) {
    float r = length(uv) + 1e-3;
    float a = atan(uv.y, uv.x);
    float depth = 0.32 / r + t * (0.6 + desc * 1.4);
    float w = fbm(vec3(cos(a) * 2.0, sin(a) * 2.0, depth));
    float w2 = fbm(vec3(cos(a) * 3.0, sin(a) * 3.0, depth * 1.7 + t * 0.2));
    float rings = smoothstep(0.55, 0.95, w2);
    vec3 tun = mix(vec3(0.18, 0.0, 0.01), vec3(1.0, 0.2, 0.08), w * w);
    tun += vec3(1.0, 0.55, 0.35) * rings * 0.6;
    tun *= smoothstep(0.0, 0.5, r);
    col = mix(col, tun, inside);
  }

  // ---------- embers after the descent ----------
  float after = smoothstep(0.85, 1.0, desc) * (1.0 - ret);
  if (after > 0.001) {
    vec2 e = uv * 7.0 + vec2(0.0, t * 0.12);
    vec2 g = floor(e);
    vec2 f = fract(e) - 0.5;
    float h = hash(vec3(g, 41.0));
    if (h > 0.86) {
      vec2 o = vec2(sin(t * 0.3 + h * 20.0), cos(t * 0.25 + h * 13.0)) * 0.25;
      float d = length(f - o);
      col += vec3(1.0, 0.25, 0.12) * smoothstep(0.05, 0.0, d) * 0.55 * after * (0.5 + 0.5 * sin(t + h * 30.0));
    }
    col += vec3(0.09, 0.0, 0.005) * smoothstep(1.2, 0.0, length(uv - vec2(0.0, -0.7))) * after;
  }

  // Pulse flash
  col += vec3(1.0, 0.2, 0.08) * uPulse * 0.25 * exp(-dist * 3.0) * present;

  // Vignette and film grain keep the void from banding.
  col *= 1.0 - 0.35 * pow(length(uv * vec2(0.8, 1.0)), 2.2);
  col += (hash(vec3(gl_FragCoord.xy, t)) - 0.5) * 0.012;

  outColor = vec4(max(col, 0.0), 1.0);
}
`
