/**
 * Volumetric light shader.
 *
 * Renders the hero's atmosphere on a single backdrop quad: three light shafts
 * raking down through drifting particulate, a floor bounce, vignette and an
 * ordered dither.
 *
 * This is a *screen-space approximation*, not real volumetrics — no raymarching
 * through a density field, no shadow map sampling. On a full-viewport quad that
 * would cost more than the rest of the frame combined. Instead each shaft is an
 * analytic cone in UV space, masked by 3-octave value noise. Visually it holds
 * up because the shafts are soft and the grain overlay hides the difference,
 * and it runs in well under a millisecond on integrated graphics.
 */

export const volumetricVertex = /* glsl */ `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const volumetricFragment = /* glsl */ `
  precision highp float;

  varying vec2 vUv;

  uniform float uTime;
  uniform float uScroll;      // 0 → 1 page progress
  uniform vec2  uMouse;       // -1 → 1, smoothed
  uniform float uAspect;
  uniform float uIntensity;   // master fade, lets the scene dim on exit
  uniform vec3  uRed;
  uniform vec3  uCool;
  uniform vec3  uBase;

  /* ---- value noise ------------------------------------------------------ */

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    // Quintic smoothstep — C2 continuous, so the fbm has no visible grid creases.
    vec2 u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);
    return mix(
      mix(hash(i + vec2(0.0, 0.0)), hash(i + vec2(1.0, 0.0)), u.x),
      mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
      u.y
    );
  }

  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < 3; i++) {
      v += a * noise(p);
      p *= 2.03;   // non-integer lacunarity avoids octaves aligning
      a *= 0.5;
    }
    return v;
  }

  /* ---- one light shaft --------------------------------------------------
     origin is where the shaft enters frame, dir its travel direction.
     Intensity falls off with perpendicular distance (the cone) and with
     distance travelled (the throw), then gets chewed up by drifting noise so
     it reads as light through dust rather than a gradient.                  */

  float shaft(vec2 uv, vec2 origin, vec2 dir, float width, float throwLen, float seed) {
    vec2 d = uv - origin;
    float along = dot(d, dir);
    if (along < 0.0) return 0.0;

    vec2 perp = d - dir * along;
    float dist = length(perp);

    // Cone widens as it travels.
    float w = width * (1.0 + along * 1.35);
    float core = 1.0 - smoothstep(0.0, w, dist);
    core = pow(core, 2.4);

    float fade = 1.0 - smoothstep(0.0, throwLen, along);

    // Particulate drifting *across* the beam, plus slow crawl along it.
    float dust = fbm(vec2(dist * 6.0 + seed, along * 3.2 - uTime * 0.09));
    dust = mix(0.72, 1.28, dust);

    return core * fade * dust;
  }

  void main() {
    // Work in aspect-corrected space so shafts stay circular in section, and
    // let the pointer push the whole volume a little (very subtle parallax).
    vec2 uv = vUv;
    uv.x *= uAspect;
    uv += uMouse * vec2(0.035, 0.02);

    float t = uTime * 0.05;

    /* --- three shafts, deliberately not symmetrical --- */

    float s1 = shaft(uv, vec2(0.22 * uAspect, 1.18), normalize(vec2(0.30, -1.0)), 0.085, 1.55, 0.0);
    float s2 = shaft(uv, vec2(0.78 * uAspect, 1.22), normalize(vec2(-0.22, -1.0)), 0.062, 1.40, 13.7);
    float s3 = shaft(uv, vec2(0.52 * uAspect, 1.30), normalize(vec2(0.04, -1.0)), 0.145, 1.85, 29.1);

    // Slow breathing so the scene is never completely still, but far too slow
    // to register as an animation loop.
    s1 *= 0.85 + 0.15 * sin(t * 1.7);
    s2 *= 0.80 + 0.20 * sin(t * 2.3 + 1.9);
    s3 *= 0.90 + 0.10 * sin(t * 1.1 + 0.6);

    vec3 col = uBase;

    // The wide central shaft is cool/white; the narrow flankers carry the red.
    col += uCool * s3 * 0.55;
    col += uCool * s1 * 0.30;
    col += uRed  * s2 * 0.85;
    col += uRed  * s1 * 0.22;

    /* --- ambient haze pooling toward the floor --- */
    float haze = fbm(uv * 1.6 + vec2(t * 0.35, -t * 0.12));
    col += uCool * haze * 0.035 * (1.0 - vUv.y);

    /* --- floor bounce: a dim red pool that grows as the user scrolls in --- */
    float floorGlow = pow(1.0 - vUv.y, 3.0);
    col += uRed * floorGlow * (0.05 + uScroll * 0.10);

    /* --- vignette --- */
    vec2 v = vUv - 0.5;
    float vig = 1.0 - dot(v, v) * 1.25;
    col *= clamp(vig, 0.0, 1.0);

    col *= uIntensity;

    // Ordered dither. Without it these long, very dark gradients band badly on
    // 8-bit displays — the single cheapest quality win in the whole scene.
    float dither = (hash(gl_FragCoord.xy) - 0.5) / 255.0;
    col += dither;

    gl_FragColor = vec4(col, 1.0);
  }
`;
