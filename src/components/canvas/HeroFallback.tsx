/**
 * CSS-only stand-in for the WebGL hero.
 *
 * Lives in its own module *specifically* so it can be imported statically
 * without pulling three.js with it. Importing any named export from
 * `HeroCanvas.tsx` would put that module — and therefore @react-three/fiber,
 * drei and three — into the static graph, silently undoing the dynamic import
 * and adding ~150 KB gzip to first load.
 *
 * Shown on touch devices, narrow viewports, reduced-motion, machines without
 * WebGL2, and as the loading state while the real canvas streams in. It's the
 * same three-shaft composition rendered with gradients, so the transition
 * between it and the live scene is barely perceptible.
 */
export function HeroFallback() {
  return (
    <div aria-hidden className="absolute inset-0 overflow-hidden bg-[var(--color-void)]">
      {/* Wide central shaft — cool/white key */}
      <div
        className="absolute -top-1/4 left-1/2 h-[150%] w-[46vw] -translate-x-1/2 opacity-[0.14] blur-3xl"
        style={{
          background: 'linear-gradient(180deg, rgba(200,212,216,0.9), transparent 72%)',
          clipPath: 'polygon(38% 0, 62% 0, 100% 100%, 0 100%)',
        }}
      />
      {/* Narrow red flanker */}
      <div
        className="absolute -top-1/4 right-[12%] h-[140%] w-[26vw] opacity-[0.22] blur-3xl"
        style={{
          background: 'linear-gradient(190deg, rgba(232,30,38,0.95), transparent 68%)',
          clipPath: 'polygon(42% 0, 58% 0, 96% 100%, 4% 100%)',
        }}
      />
      {/* Second cool flanker, left */}
      <div
        className="absolute -top-1/4 left-[16%] h-[130%] w-[18vw] opacity-[0.09] blur-3xl"
        style={{
          background: 'linear-gradient(170deg, rgba(200,212,216,0.9), transparent 70%)',
          clipPath: 'polygon(40% 0, 60% 0, 92% 100%, 8% 100%)',
        }}
      />
      {/* Floor bounce */}
      <div className="absolute inset-x-0 bottom-0 h-1/3 bg-[radial-gradient(ellipse_at_50%_120%,rgba(232,30,38,0.18),transparent_65%)]" />
      {/* Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_35%,rgba(0,0,0,0.75))]" />
    </div>
  );
}
