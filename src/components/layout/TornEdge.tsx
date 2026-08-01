import { seededRandom } from '@/lib/utils';

/**
 * TORN RED BAND
 *
 * The reference's signature gesture: a ragged band of vivid red tearing across
 * the full width where one section meets the next. It's the one place the
 * palette's red gets to be a large field rather than a detail, and it does the
 * work of separating two bands of gray without a rule or a gap.
 *
 * Built as one SVG path with a `preserveAspectRatio="none"` viewBox so it
 * stretches to any width without re-generating geometry — no resize listener,
 * no layout cost, and it scales from 375px to ultrawide.
 *
 * The tear is generated once at module scope from a fixed seed, so the server
 * and client render byte-identical markup (a `Math.random()` here would be a
 * guaranteed hydration mismatch).
 */

const W = 1440;
const H = 120;

/** Ragged polyline across `width`, oscillating around `baseline`. */
function tear(seed: number, baseline: number, amplitude: number, steps: number) {
  const rand = seededRandom(seed);
  const points: string[] = [`0 ${baseline + (rand() - 0.5) * amplitude}`];

  for (let i = 1; i <= steps; i++) {
    const x = (W / steps) * i;
    // Mixing a large slow wobble with an occasional sharp spike is what makes
    // it read as torn paper rather than a sine wave.
    const spike = rand() < 0.22 ? (rand() - 0.5) * amplitude * 2.1 : 0;
    const y = baseline + (rand() - 0.5) * amplitude + spike;
    points.push(`${x.toFixed(1)} ${y.toFixed(1)}`);
  }

  return points;
}

// Top edge tears into the section above; bottom edge tears into the one below.
const TOP = tear(4711, H * 0.34, H * 0.34, 34);
const BOTTOM = tear(9127, H * 0.72, H * 0.26, 30).reverse();

const PATH = `M ${TOP.join(' L ')} L ${BOTTOM.join(' L ')} Z`;

export function TornEdge({ className }: { className?: string }) {
  return (
    <div aria-hidden className={['relative w-full overflow-hidden', className].filter(Boolean).join(' ')}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        className="block h-14 w-full md:h-24"
        // Negative margins let the band bite into the sections either side so
        // there is never a hairline of background showing through the tear.
        style={{ marginBlock: '-1px' }}
      >
        <path d={PATH} fill="var(--color-red)" />
      </svg>
    </div>
  );
}
