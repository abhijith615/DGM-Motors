import Image from 'next/image';
import type { Plate as PlateData } from '@/lib/site';
import { seededRandom } from '@/lib/utils';

/**
 * ART-DIRECTED IMAGE PLATE
 *
 * No workshop photography was supplied with this project, and shipping grey
 * boxes or hot-linked stock would undercut everything else on the page. So each
 * plate is a *generated* industrial composition: technical line-work, metal
 * gradients, registration marks and a subject silhouette, drawn as SVG from a
 * fixed seed so it renders identically on server and client.
 *
 * ▸ TO USE REAL PHOTOGRAPHY: drop a file at `/public/workshop/<id>.jpg` and set
 *   `src` on the corresponding entry in `lib/site.ts`. This component prefers
 *   `src` whenever present — no other change is needed anywhere.
 *
 * These are deliberately abstract rather than fake-photographic: an obvious
 * diagram is honest, an AI-ish pseudo-photo of a workshop that doesn't exist
 * is not.
 */
export function Plate({ plate, sizes, priority = false }: { plate: PlateData; sizes?: string; priority?: boolean }) {
  if (plate.src) {
    return (
      <Image
        src={plate.src}
        alt={plate.caption}
        fill
        sizes={sizes ?? '(max-width: 768px) 100vw, 50vw'}
        priority={priority}
        className="object-cover"
      />
    );
  }

  return <GeneratedPlate plate={plate} />;
}

/* -------------------------------------------------------------------------- */

function GeneratedPlate({ plate }: { plate: PlateData }) {
  const uid = `p${plate.seed}`;

  // A little seeded variation so no two plates of the same variant match.
  const rand = seededRandom(plate.seed);
  const tilt = (rand() - 0.5) * 6;
  const offset = rand() * 40;

  return (
    <svg
      viewBox="0 0 400 300"
      preserveAspectRatio="xMidYMid slice"
      role="img"
      aria-label={plate.caption}
      className="absolute inset-0 h-full w-full"
    >
      <defs>
        {/* Raking metal light — the same 135° key used by .surface-metal in CSS. */}
        <linearGradient id={`${uid}-metal`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#242b2e" />
          <stop offset="38%" stopColor="#12171a" />
          <stop offset="72%" stopColor="#0c1012" />
          <stop offset="100%" stopColor="#1c2427" />
        </linearGradient>

        <linearGradient id={`${uid}-sheen`} x1="0" y1="0" x2="1" y2="0.6">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="45%" stopColor="#ffffff" stopOpacity="0.11" />
          <stop offset="58%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>

        <radialGradient id={`${uid}-hot`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor="#ffe7d6" stopOpacity="0.95" />
          <stop offset="28%" stopColor="#e81e26" stopOpacity="0.75" />
          <stop offset="100%" stopColor="#e81e26" stopOpacity="0" />
        </radialGradient>

        <radialGradient id={`${uid}-vig`} cx="0.5" cy="0.45" r="0.75">
          <stop offset="55%" stopColor="#000000" stopOpacity="0" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0.72" />
        </radialGradient>

        <pattern id={`${uid}-grid`} width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M20 0H0V20" fill="none" stroke="#ffffff" strokeOpacity="0.05" strokeWidth="0.5" />
        </pattern>

        {/* Per-plate grain. Keeps flat gradients from banding at large sizes. */}
        <filter id={`${uid}-grain`} x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
      </defs>

      {/* --- ground --- */}
      <rect width="400" height="300" fill={`url(#${uid}-metal)`} />
      <rect width="400" height="300" fill={`url(#${uid}-grid)`} />

      {/* --- subject --- */}
      <g transform={`rotate(${tilt} 200 150)`}>
        <Subject variant={plate.variant} uid={uid} offset={offset} seed={plate.seed} />
      </g>

      {/* --- finishing passes --- */}
      <rect width="400" height="300" fill={`url(#${uid}-sheen)`} />
      <rect width="400" height="300" fill={`url(#${uid}-vig)`} />
      <rect width="400" height="300" filter={`url(#${uid}-grain)`} opacity="0.14" />

      {/* Registration marks — the detail that makes it read as an instrument
          plate rather than an abstract gradient. */}
      <g stroke="#ffffff" strokeOpacity="0.28" strokeWidth="0.75" fill="none">
        <path d="M12 12h10M12 12v10" />
        <path d="M388 12h-10M388 12v10" />
        <path d="M12 288h10M12 288v-10" />
        <path d="M388 288h-10M388 288v-10" />
      </g>
    </svg>
  );
}

/* -------------------------------------------------------------------------- */

function Subject({
  variant,
  uid,
  offset,
  seed,
}: {
  variant: PlateData['variant'];
  uid: string;
  offset: number;
  seed: number;
}) {
  // Own generator, seeded from the plate — NOT the parent's.
  //
  // A PRNG closure is stateful, so passing one across a component boundary
  // makes the child's output depend on how many times it has already been
  // called. React renders components twice in development (StrictMode) and may
  // re-render either component independently, so a shared generator produces
  // different values on server and client and hydration blows up. Deriving a
  // fresh sequence here keeps render pure.
  const rand = seededRandom(seed * 31 + 7);

  const steel = '#3d484c';
  const edge = '#77848a';

  switch (variant) {
    /* Ladder frame in perspective: two rails, crossmembers, datum ticks. */
    case 'chassis':
      return (
        <g>
          <g fill={steel} stroke={edge} strokeWidth="0.75">
            <path d="M30 118 L370 104 L370 122 L30 138 Z" />
            <path d="M30 186 L370 196 L370 214 L30 206 Z" />
          </g>
          {Array.from({ length: 7 }, (_, i) => {
            const x = 55 + i * 48;
            const t = (x - 30) / 340;
            return (
              <rect
                key={i}
                x={x}
                y={132 - t * 12}
                width="9"
                height={62 + t * 20}
                fill="#2a3236"
                stroke={edge}
                strokeWidth="0.5"
                strokeOpacity="0.7"
              />
            );
          })}
          {/* Datum measurement callout */}
          <g stroke="#e81e26" strokeWidth="1">
            <path d="M200 96 L200 66" />
            <path d="M194 70 L200 62 L206 70" fill="none" />
          </g>
          <circle cx="200" cy="113" r="4" fill="none" stroke="#e81e26" strokeWidth="1.25" />
        </g>
      );

    /* Weld bead: a hot seam with a hard specular core and spatter. */
    case 'weld':
      return (
        <g>
          <path d="M0 168 Q100 150 200 164 T400 152" fill="none" stroke="#1a2023" strokeWidth="26" />
          <path d="M0 168 Q100 150 200 164 T400 152" fill="none" stroke="#e81e26" strokeWidth="4" strokeOpacity="0.8" />
          <path d="M0 168 Q100 150 200 164 T400 152" fill="none" stroke="#ffd9c4" strokeWidth="1.4" />
          <circle cx={150 + offset} cy="160" r="72" fill={`url(#${uid}-hot)`} />
          {Array.from({ length: 16 }, (_, i) => {
            const a = rand() * Math.PI * 2;
            const d = 18 + rand() * 74;
            return (
              <circle
                key={i}
                cx={150 + offset + Math.cos(a) * d}
                cy={160 + Math.sin(a) * d * 0.55}
                r={0.6 + rand() * 1.5}
                fill="#ffcdb3"
                opacity={0.35 + rand() * 0.5}
              />
            );
          })}
        </g>
      );

    /* Overlapping sheet with a hard fold and a raking highlight. */
    case 'panel':
      return (
        <g>
          <path d="M-10 210 L180 92 L420 138 L420 320 L-10 320 Z" fill="#1b2225" stroke={edge} strokeWidth="0.6" />
          <path d="M-10 210 L180 92 L420 138" fill="none" stroke={edge} strokeWidth="1.6" strokeOpacity="0.9" />
          <path d="M60 320 L235 118" fill="none" stroke="#ffffff" strokeOpacity="0.09" strokeWidth="18" />
          <path d="M180 92 L200 300" fill="none" stroke="#0a0d0e" strokeWidth="2" />
          <rect x="286" y="176" width="46" height="3" fill="#e81e26" />
        </g>
      );

    /* Paint booth: banks of vertical lights in a bright volume. */
    case 'booth':
      return (
        <g>
          <rect x="34" y="30" width="332" height="240" fill="#161b1e" stroke={edge} strokeWidth="0.6" />
          {Array.from({ length: 6 }, (_, i) => (
            <rect key={i} x={54 + i * 58} y="46" width="14" height="208" fill="#ffffff" opacity={0.1 + rand() * 0.12} />
          ))}
          <rect x="34" y="30" width="332" height="240" fill={`url(#${uid}-hot)`} opacity="0.16" />
          <rect x="120" y="150" width="170" height="104" fill="#0e1214" stroke={edge} strokeWidth="0.6" />
          <rect x="120" y="150" width="170" height="6" fill="#e81e26" opacity="0.85" />
        </g>
      );

    /* Workshop bay: gantry, floor grid, vehicle mass. */
    case 'bay':
      return (
        <g>
          {/* Roof structure */}
          <g stroke={edge} strokeWidth="0.8" fill="none" strokeOpacity="0.75">
            <path d="M0 54 L400 42" />
            <path d="M0 74 L400 60" />
            {Array.from({ length: 9 }, (_, i) => (
              <path key={i} d={`M${i * 50} ${54 - i * 1.5} L${i * 50} ${74 - i * 1.6}`} />
            ))}
          </g>
          {/* Floor */}
          <path d="M0 300 L400 300 L400 214 L0 236 Z" fill="#0b0e0f" />
          <g stroke="#ffffff" strokeOpacity="0.07" strokeWidth="0.6">
            {Array.from({ length: 8 }, (_, i) => (
              <path key={i} d={`M${-40 + i * 70} 300 L${60 + i * 46} 224`} />
            ))}
          </g>
          {/* Vehicle mass */}
          <g fill="#1d2427" stroke={edge} strokeWidth="0.7">
            <path d="M96 224 L96 150 L152 128 L200 128 L200 224 Z" />
            <path d="M200 224 L200 140 L322 140 L322 224 Z" />
          </g>
          <circle cx="132" cy="226" r="15" fill="#0a0d0e" stroke={edge} strokeWidth="0.8" />
          <circle cx="290" cy="226" r="15" fill="#0a0d0e" stroke={edge} strokeWidth="0.8" />
          <rect x="200" y="140" width="122" height="4" fill="#e81e26" opacity="0.9" />
          {/* Overhead light pool */}
          <ellipse cx="210" cy="238" rx="150" ry="30" fill="#ffffff" opacity="0.045" />
        </g>
      );

    /* Measurement detail: crosshair, tolerance ring, scale ticks. */
    case 'detail':
    default:
      return (
        <g>
          <circle cx="200" cy="150" r="76" fill="none" stroke={edge} strokeWidth="0.8" strokeOpacity="0.6" />
          <circle cx="200" cy="150" r="44" fill="none" stroke="#e81e26" strokeWidth="1.1" />
          <circle cx="200" cy="150" r="3" fill="#e81e26" />
          <path d="M200 40 L200 260 M90 150 L310 150" stroke={edge} strokeWidth="0.6" strokeOpacity="0.55" />
          {Array.from({ length: 24 }, (_, i) => {
            const a = (i / 24) * Math.PI * 2;
            const r1 = 76;
            const r2 = i % 6 === 0 ? 66 : 71;
            return (
              <path
                key={i}
                d={`M${200 + Math.cos(a) * r1} ${150 + Math.sin(a) * r1} L${200 + Math.cos(a) * r2} ${150 + Math.sin(a) * r2}`}
                stroke={edge}
                strokeWidth="0.7"
                strokeOpacity="0.8"
              />
            );
          })}
          <rect x="150" y="242" width="100" height="1" fill={edge} fillOpacity="0.6" />
        </g>
      );
  }
}
