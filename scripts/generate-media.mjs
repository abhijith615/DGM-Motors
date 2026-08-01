/**
 * Turns the raw creatives in `New Creatives/` into web-ready assets in
 * `public/`.
 *
 *   node scripts/generate-media.mjs
 *
 * WHY THIS EXISTS
 * The supplied masters are near-broadcast quality: the three 10-second clips
 * run at 9–12 Mbps (≈42 MB together) and the stills are 2048² PNGs at ~6 MB
 * each. Shipping those raw would put ~80 MB in front of a first-time visitor
 * and destroy the hero's LCP. Everything here is derived, so the masters never
 * need to reach the browser — or the repository.
 *
 * VIDEO  → H.264 MP4, no audio track, +faststart, CRF-encoded.
 *   · H.264 rather than VP9/AV1 on purpose: these are looping background
 *     videos, and H.264 is the only codec with universal *hardware* decode.
 *     Software-decoding VP9 in a loop is a measurable battery drain on phones,
 *     which costs more than the bytes it saves.
 *   · Audio is stripped outright — the videos are muted by definition.
 *   · +faststart moves the moov atom to the front so playback can begin
 *     before the file has finished downloading.
 *
 * POSTER → first meaningful frame as WebP. Gives an instant paint before the
 *   video is ready, and is the *only* thing shown under prefers-reduced-motion.
 *
 * STILLS → WebP at 1000px. Cards render ~325px wide, so 1000px covers 3× DPR
 *   and next/image still generates smaller responsive variants from it.
 */

import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { mkdir, readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import ffmpegPath from 'ffmpeg-static';

const run = promisify(execFile);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const p = (...s) => path.join(root, ...s);

const SRC = p('New Creatives');
const OUT_VIDEO = p('public', 'video');
const OUT_IMG = p('public', 'services');

await mkdir(OUT_VIDEO, { recursive: true });
await mkdir(OUT_IMG, { recursive: true });

const mb = async (file) => (await stat(file)).size / 1048576;

/* -------------------------------------------------------------------------- */
/* VIDEO                                                                       */
/* -------------------------------------------------------------------------- */

const VIDEOS = [
  { in: 'Hero section desktop view video.mp4', out: 'hero-desktop', width: 1920, crf: 28 },
  { in: 'Hero section mobile view video.mp4', out: 'hero-mobile', width: 1080, crf: 28 },
  { in: 'Section1 Engineering Excellence video.mp4', out: 'excellence', width: 1920, crf: 28 },
];

async function encode({ in: input, out, width, crf }) {
  const src = path.join(SRC, input);
  const dst = path.join(OUT_VIDEO, `${out}.mp4`);
  const poster = path.join(OUT_VIDEO, `${out}-poster.webp`);

  const before = await mb(src);

  await run(ffmpegPath, [
    '-y',
    '-i', src,
    '-an',                                   // drop audio entirely
    '-vf', `scale=${width}:-2:flags=lanczos`, // -2 keeps height even (H.264 requires it)
    '-c:v', 'libx264',
    '-profile:v', 'high',
    '-level', '4.1',                          // safe ceiling for mobile hardware decoders
    '-preset', 'slow',                        // build-time cost only; better bytes-per-quality
    '-crf', String(crf),
    '-pix_fmt', 'yuv420p',                    // required for Safari / QuickTime
    '-movflags', '+faststart',
    dst,
  ]);

  // Grab the poster a second in — frame 0 of a fade-in is usually black.
  await run(ffmpegPath, ['-y', '-ss', '1', '-i', src, '-frames:v', '1', '-vf', `scale=${Math.round(width / 2)}:-2`, poster]);

  const after = await mb(dst);
  const posterKb = ((await stat(poster)).size / 1024).toFixed(0);

  console.log(
    `  ${out.padEnd(16)} ${before.toFixed(1)} MB → ${after.toFixed(2)} MB ` +
      `(−${(100 - (after / before) * 100).toFixed(0)}%)   poster ${posterKb} KB`
  );
}

console.log('\nVideo (H.264, no audio, faststart):');
for (const video of VIDEOS) await encode(video);

/* -------------------------------------------------------------------------- */
/* SERVICE STILLS                                                              */
/* -------------------------------------------------------------------------- */

/** "Accident Repair.png" → "accident-repair" — matches the service ids. */
const slug = (file) =>
  path
    .parse(file)
    .name.toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

console.log('\nService stills (WebP, 1000px):');

const stills = (await readdir(SRC)).filter((f) => /\.(png|jpe?g)$/i.test(f)).sort();

for (const file of stills) {
  const src = path.join(SRC, file);
  const dst = path.join(OUT_IMG, `${slug(file)}.webp`);

  await sharp(src)
    .resize({ width: 1000, height: 1000, fit: 'cover', withoutEnlargement: true })
    .webp({ quality: 80, effort: 5 })
    .toFile(dst);

  const before = await mb(src);
  const after = (await stat(dst)).size / 1024;
  console.log(`  ${slug(file).padEnd(28)} ${before.toFixed(1)} MB → ${after.toFixed(0)} KB`);
}

/* -------------------------------------------------------------------------- */

const total = async (dir) =>
  (await Promise.all((await readdir(dir)).map((f) => stat(path.join(dir, f))))).reduce((s, x) => s + x.size, 0) /
  1048576;

console.log(
  `\nShipped: ${(await total(OUT_VIDEO)).toFixed(1)} MB video + ${(await total(OUT_IMG)).toFixed(1)} MB stills\n`
);
