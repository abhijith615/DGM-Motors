/**
 * Derives every brand asset the site ships from the two source logo files.
 *
 *   node scripts/generate-brand-assets.mjs
 *
 * The sources are ~2 MB transparent PNGs with a large empty margin and a baked
 * red glow. This trims the margin, produces right-sized raster variants, the
 * favicon/app icons, and the Open Graph card. Re-run it if the logos change.
 */

import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const p = (...s) => path.join(root, ...s);

const SRC_H = p('brand-source', 'logo-horizontal.png');
const SRC_S = p('brand-source', 'logo-stacked.png');

const BG = { r: 8, g: 9, b: 10, alpha: 1 }; // --color-void

await mkdir(p('public', 'brand'), { recursive: true });

/** Trim fully-transparent padding, keeping a little breathing room. */
const trimmed = (src) => sharp(src).trim({ threshold: 8 });

/* ---- 1. Web logo variants (transparent, for nav / footer / preloader) ---- */

await trimmed(SRC_H)
  .resize({ width: 1000, withoutEnlargement: true })
  .png({ compressionLevel: 9, palette: true, quality: 92 })
  .toFile(p('public', 'brand', 'logo-horizontal.png'));

await trimmed(SRC_S)
  .resize({ width: 800, withoutEnlargement: true })
  .png({ compressionLevel: 9, palette: true, quality: 92 })
  .toFile(p('public', 'brand', 'logo-stacked.png'));

/* ---- 2. App icons ------------------------------------------------------- */

// Favicon: square, on the site's own background so it reads on any browser UI.
await sharp({
  create: { width: 512, height: 512, channels: 4, background: BG },
})
  .composite([
    {
      input: await trimmed(SRC_S).resize({ width: 400, height: 400, fit: 'inside' }).png().toBuffer(),
      gravity: 'center',
    },
  ])
  .png({ compressionLevel: 9 })
  .toFile(p('src', 'app', 'icon.png'));

await sharp({
  create: { width: 180, height: 180, channels: 4, background: BG },
})
  .composite([
    {
      input: await trimmed(SRC_S).resize({ width: 142, height: 142, fit: 'inside' }).png().toBuffer(),
      gravity: 'center',
    },
  ])
  .png({ compressionLevel: 9 })
  .toFile(p('src', 'app', 'apple-icon.png'));

/* ---- 3. Open Graph card ------------------------------------------------- */

const OG_W = 1200;
const OG_H = 630;

// Background furniture drawn as SVG: a corner grid, a red rule, hairlines.
// No text here — text is composited from the logo raster so the card never
// depends on a font being installed on the machine that runs this script.
const furniture = Buffer.from(`
<svg xmlns="http://www.w3.org/2000/svg" width="${OG_W}" height="${OG_H}">
  <defs>
    <linearGradient id="glow" x1="0" y1="1" x2="1" y2="0">
      <stop offset="0%" stop-color="#E81E26" stop-opacity="0.22"/>
      <stop offset="55%" stop-color="#E81E26" stop-opacity="0.04"/>
      <stop offset="100%" stop-color="#E81E26" stop-opacity="0"/>
    </linearGradient>
    <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
      <path d="M60 0H0V60" fill="none" stroke="#FFFFFF" stroke-opacity="0.045" stroke-width="1"/>
    </pattern>
  </defs>
  <rect width="${OG_W}" height="${OG_H}" fill="#08090A"/>
  <rect width="${OG_W}" height="${OG_H}" fill="url(#grid)"/>
  <rect width="${OG_W}" height="${OG_H}" fill="url(#glow)"/>
  <rect x="0" y="${OG_H - 10}" width="${OG_W}" height="10" fill="#E81E26"/>
  <rect x="72" y="${OG_H - 132}" width="${OG_W - 144}" height="1" fill="#FFFFFF" fill-opacity="0.14"/>

  <g font-family="Arial Black, Arial Bold, Arial, sans-serif" font-weight="900">
    <text x="72" y="418" font-size="54" fill="#FFFFFF" letter-spacing="-1.6">COMMERCIAL VEHICLE</text>
    <text x="72" y="478" font-size="54" fill="#FFFFFF" letter-spacing="-1.6">ACCIDENT REPAIR<tspan fill="#E81E26">.</tspan></text>
  </g>
  <g font-family="Consolas, Menlo, Courier New, monospace">
    <text x="72" y="${OG_H - 62}" font-size="19" fill="#A6A6A6" letter-spacing="4.4">ENGINEERED TO PERFECTION</text>
    <text x="${OG_W - 72}" y="${OG_H - 62}" font-size="19" fill="#6D797D" letter-spacing="4.4" text-anchor="end">TAMIL NADU &#183; KERALA</text>
  </g>
</svg>`);

const ogLogo = await trimmed(SRC_H).resize({ width: 720, fit: 'inside' }).png().toBuffer();

await sharp(furniture)
  .composite([{ input: ogLogo, top: 150, left: 72 }])
  .png({ compressionLevel: 9 })
  .toFile(p('public', 'brand', 'og.png'));

/* ---- Report ------------------------------------------------------------- */

const report = async (rel) => {
  const meta = await sharp(p(...rel.split('/'))).metadata();
  const { size } = await sharp(p(...rel.split('/'))).toBuffer({ resolveWithObject: true }).then((r) => r.info);
  console.log(`  ${rel.padEnd(34)} ${String(meta.width).padStart(5)}×${String(meta.height).padEnd(5)} ${(size / 1024).toFixed(0)} KB`);
};

console.log('\nGenerated brand assets:');
for (const f of [
  'public/brand/logo-horizontal.png',
  'public/brand/logo-stacked.png',
  'public/brand/og.png',
  'src/app/icon.png',
  'src/app/apple-icon.png',
]) {
  await report(f);
}
console.log('');
