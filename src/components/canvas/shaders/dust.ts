/**
 * Floating industrial dust.
 *
 * All motion happens in the vertex shader from a single `uTime` uniform — the
 * CPU never touches the position buffer, so 2,000 motes cost one draw call and
 * no per-frame allocation. Each mote carries its own phase/speed/scale in
 * attributes, which is what stops the field from pulsing in unison.
 */

export const dustVertex = /* glsl */ `
  attribute float aScale;
  attribute float aSpeed;
  attribute float aPhase;

  uniform float uTime;
  uniform float uPixelRatio;
  uniform float uScroll;

  varying float vAlpha;
  varying float vSeed;

  void main() {
    vec3 pos = position;

    // Rise, wrapping back to the bottom of the volume. Taking mod of the whole
    // travel keeps it seamless without a respawn pass.
    float travel = uTime * aSpeed * 0.35 + aPhase * 14.0;
    pos.y = mod(pos.y + travel, 14.0) - 7.0;

    // Lateral sway — two incommensurate frequencies so it never looks periodic.
    pos.x += sin(uTime * 0.28 * aSpeed + aPhase * 6.28) * 0.42;
    pos.z += cos(uTime * 0.21 * aSpeed + aPhase * 4.19) * 0.34;

    // Push the field back as the user scrolls, adding depth to the exit.
    pos.z -= uScroll * 2.5;

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;

    // Perspective-correct sizing: motes shrink with distance like real particles.
    gl_PointSize = aScale * uPixelRatio * (34.0 / -mvPosition.z);

    // Fade at the near and far planes so nothing pops in or out of existence.
    float depth = -mvPosition.z;
    vAlpha = smoothstep(1.0, 4.0, depth) * (1.0 - smoothstep(11.0, 17.0, depth));
    vSeed = aPhase;
  }
`;

export const dustFragment = /* glsl */ `
  precision mediump float;

  uniform vec3 uColorCool;
  uniform vec3 uColorWarm;

  varying float vAlpha;
  varying float vSeed;

  void main() {
    // Round the point sprite and give it a soft falloff.
    vec2 c = gl_PointCoord - 0.5;
    float d = dot(c, c);
    if (d > 0.25) discard;

    float falloff = 1.0 - smoothstep(0.0, 0.25, d);
    falloff = pow(falloff, 1.8);

    // Roughly one mote in six catches the red key light.
    vec3 col = mix(uColorCool, uColorWarm, step(0.84, vSeed));

    gl_FragColor = vec4(col, falloff * vAlpha * 0.62);
  }
`;
