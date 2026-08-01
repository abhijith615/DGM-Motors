/**
 * Full-page film grain.
 *
 * An inline SVG feTurbulence rendered once into a fixed layer — no image
 * request, no per-frame cost, and it composites on the GPU. This is what stops
 * large flat gunmetal fields from banding, and it's most of why the page reads
 * as photographed rather than drawn.
 *
 * Static by design: animated grain is a constant repaint of the whole viewport.
 */
export function Grain() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[400] mix-blend-overlay"
      style={{ opacity: 'var(--grain-opacity)' }}
    >
      <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
        <filter id="dgm-grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.82" numOctaves="3" stitchTiles="stitch" />
          {/* Desaturate: coloured noise reads as a broken screen, not film. */}
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#dgm-grain)" />
      </svg>
    </div>
  );
}
