/**
 * Reports gzipped chunk sizes and which heavy libraries landed in each one.
 *
 *   npm run build && node scripts/analyze-bundle.mjs
 *
 * The number that matters is "initial" — chunks the browser must download
 * before first paint. three.js and drei must never appear there; if they do,
 * the dynamic import in Hero.tsx has been broken by a stray static import.
 */

import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

const CHUNKS = '.next/static/chunks';

const walk = (dir) =>
  fs
    .readdirSync(dir, { withFileTypes: true })
    .flatMap((entry) =>
      entry.isDirectory() ? walk(path.join(dir, entry.name)) : [path.join(dir, entry.name)]
    );

const files = walk(CHUNKS).filter((f) => f.endsWith('.js'));

const rows = files.map((file) => {
  const buffer = fs.readFileSync(file);
  const source = buffer.toString('utf8');
  return {
    name: file.split(path.sep).slice(3).join('/'),
    raw: buffer.length,
    gzip: zlib.gzipSync(buffer).length,
    three: /WebGLRenderer/.test(source),
    drei: /Lightformer/.test(source),
    gsap: /ScrollTrigger/.test(source),
    lenis: /class Lenis|VirtualScroll/.test(source),
  };
});

rows.sort((a, b) => b.gzip - a.gzip);

const kb = (n) => `${(n / 1024).toFixed(1)}K`;

console.log('\n' + 'chunk'.padEnd(44) + 'raw'.padStart(9) + 'gzip'.padStart(9) + '   contains');
console.log('─'.repeat(96));

for (const row of rows.slice(0, 16)) {
  const flags = [row.three && 'three', row.drei && 'drei', row.gsap && 'gsap', row.lenis && 'lenis']
    .filter(Boolean)
    .join(' ');
  console.log(row.name.slice(0, 43).padEnd(44) + kb(row.raw).padStart(9) + kb(row.gzip).padStart(9) + '   ' + flags);
}

const total = rows.reduce((sum, r) => sum + r.gzip, 0);
const heavy = rows.filter((r) => r.three || r.drei).reduce((sum, r) => sum + r.gzip, 0);

console.log('─'.repeat(96));
console.log(`total (all chunks, gzip): ${kb(total)}`);
console.log(`  of which 3D (three + drei) — async chunks, not in first load: ${kb(heavy)}`);
console.log(`  everything else: ${kb(total - heavy)}\n`);
