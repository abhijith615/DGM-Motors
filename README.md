<div align="center">

# DGM MOTORS

**Commercial Vehicle Accident Repair. Engineered to Perfection.**

Tamil Nadu · Kerala

</div>

---

An immersive, single-page marketing site for a commercial vehicle accident repair
workshop. Built for scroll-driven storytelling at a sustained 60 FPS, with a WebGL
hero, a pinned horizontal process narrative, and a design system that ships both a
dark and a light theme.

## Stack

| Layer | Choice | Why |
|---|---|---|
| Framework | **Next.js 15** (App Router) + React 19 | Static prerender, per-route code splitting, first-class metadata API |
| Language | **TypeScript** (strict) | — |
| Styling | **Tailwind CSS v4** (CSS-first `@theme`) | Whole design system lives in one file, no JS config to drift |
| Animation | **GSAP 3.15** + ScrollTrigger, ScrollToPlugin, SplitText | The only toolkit that does pinning, scrubbing and text splitting correctly together |
| Smooth scroll | **Lenis** | Driven by GSAP's ticker so ScrollTrigger never reads a stale position |
| 3D | **three.js** + React Three Fiber + drei | Volumetric hero, custom GLSL |

## Quick start

```bash
npm install
```

```bash
npm run dev
```

Then open <http://localhost:3000>.

| Script | Does |
|---|---|
| `npm run dev` | Dev server with HMR |
| `npm run build` | Production build |
| `npm start` | Serve the production build |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint |

---

## ⚠️ Before you launch — the only things you must edit

Everything below lives in **[`src/lib/site.ts`](src/lib/site.ts)**. It is the single
source of truth for all copy, contact details and data on the page — no component
hardcodes content. Search the file for `TODO:`.

1. **`site.url`** — the live domain. Drives canonical URLs, the sitemap, OG tags and JSON-LD.
2. **`site.contact`** — phone (`tel` in E.164, `label` for display), WhatsApp number, email, hours.
3. **`site.address`** — street address and **`lat` / `lng`**. The coordinates drive the embedded Google Map (no API key needed).
4. **`site.social`** — profile URLs. Empty strings are filtered out of the UI automatically.
5. **`testimonials`** — replace with real, attributable, permissioned customer quotes.
6. **Statistics** in `excellence.stats` and `pillars` — these are plausible placeholders. **Verify every number before publishing**; they are trust claims.

---

## Adding real photography

The site currently renders **generated industrial plates** — art-directed SVG
compositions (technical line-work, metal gradients, registration marks) drawn from a
fixed seed. No workshop photography was supplied, and shipping grey boxes or
hot-linked stock would have undercut the rest of the design.

To swap in real photos:

1. Drop images into `public/workshop/` (recommended: 2000px on the long edge, JPEG/WebP).
2. Add a `src` to the matching entry in the `plates` array in `src/lib/site.ts`:

```ts
{ id: 'bay-01', caption: 'Main repair bay', meta: 'Coimbatore · Bay 01',
  span: 'wide', seed: 11, variant: 'bay',
  src: '/workshop/bay-01.jpg' },   // ← add this line
```

`Plate` prefers `src` whenever present. Nothing else changes — parallax, hover zoom,
the lightbox and `next/image` optimisation all work identically.

---

## The enquiry form

There is no backend in this project. Rather than a dead form or a fake success state,
submitting **composes a structured WhatsApp message** and hands off to the number in
`site.contact.whatsapp` — which is how this business actually receives enquiries, and
works from the moment the site goes live.

To post to a server instead, replace the body of `handleSubmit` in
[`src/components/sections/Contact.tsx`](src/components/sections/Contact.tsx). Validation,
error state, focus management and the live region are already in place:

```ts
const response = await fetch('/api/enquiry', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ name, phone, vehicle, enquiry, message }),
});
setSent(response.ok);
```

---

## Brand assets

The two source logos live in `brand-source/`. Everything the site ships is derived
from them:

```bash
node scripts/generate-brand-assets.mjs
```

Produces the trimmed web logos, the favicon and Apple touch icon, and the 1200×630
Open Graph card. Re-run it if the logos change.

The lockup is used as supplied rather than redrawn as a vector, so the mark on the
site is exactly on-brand. `next/image` resizes the 2 MB masters down to the rendered
size and serves AVIF/WebP, so the browser receives a few KB.

---

## Architecture

```
src/
├─ app/
│  ├─ layout.tsx          Fonts, metadata, providers, chrome
│  ├─ page.tsx            Section composition (the page's argument)
│  ├─ globals.css         ★ The entire design system
│  ├─ sitemap.ts · robots.ts · manifest.ts
│  └─ icon.png · apple-icon.png
├─ components/
│  ├─ canvas/             WebGL — HeroCanvas (gate), HeroScene, HeroFallback
│  │  └─ shaders/         GLSL: volumetric light, GPU dust
│  ├─ gallery/            Plate (generated imagery), Lightbox
│  ├─ layout/             Nav, Footer, Preloader, Grain, ScrollProgress
│  ├─ providers/          SmoothScrollProvider (Lenis⟷GSAP), ThemeProvider
│  ├─ sections/           The eight page sections
│  ├─ seo/                JSON-LD
│  └─ ui/                 Button, Magnetic, Cursor, SplitHeading, Reveal, Counter…
├─ hooks/
└─ lib/                   site.ts (all content), gsap.ts, ready.ts, utils.ts
```

### Design system

`globals.css` is organised in three tiers and is the only place colour is defined:

1. **`@theme static`** — brand primitives (`--color-red`, the gunmetal ramp), the fluid
   type scale, easing curves, spacing. `static` is required, not stylistic: Tailwind v4
   only emits theme variables it sees used by a *utility class*, and much of this system
   is consumed as `var(…)` inside the component layer, which the scanner doesn't count.
2. **Semantic tokens** — `--bg`, `--fg`, `--line`, `--accent-text`… Components reference
   only these, so the whole site re-themes from one block.
3. **Component primitives** — `.shell`, `.grid-swiss`, `.t-display`, `.surface-metal`.

### Motion

One easing vocabulary (`--ease-out-expo` is the house curve) shared between CSS and
GSAP defaults, so everything feels like one machine. Every scroll animation is created
inside `gsap.context()` + `gsap.matchMedia()` and reverted on unmount.

---

## Performance

| Metric | Result |
|---|---|
| First Load JS | **176 kB** |
| three.js + drei | **~146 kB gzip — async, never in first load** |
| Page chunk | 14 kB |

```bash
npm run build && node scripts/analyze-bundle.mjs
```

Reports gzipped chunk sizes and flags which chunk each heavy library landed in.

**Watch out:** importing *any* named export from `HeroCanvas.tsx` puts three.js back
into the static graph and silently adds ~150 kB to first load. That is why
`HeroFallback` lives in its own module. The analyzer script exists to catch exactly
this regression.

Other measures:
- WebGL hero is `next/dynamic` + `ssr: false`, behind a capability gate (skipped on
  touch/narrow viewports, without WebGL2, under 4 cores, or with reduced motion).
- `frameloop` flips to `'never'` when the hero scrolls out of view or the tab is hidden.
- DPR capped at 1.75; the HDR environment is built in-scene from `<Lightformer>`s
  (`frames={1}`) so there is no `.hdr` download and no CDN dependency.
- Particles animate entirely in the vertex shader — the CPU never touches the buffer.
- Scroll progress is read through a **ref**, not state, so the render loop doesn't
  re-render React 60×/second.
- Fonts self-hosted by `next/font` with `display: swap`.

---

## Accessibility

- **Keyboard:** skip link, visible focus rings throughout, full focus trap in the
  lightbox with focus restored to the trigger on close, arrow-key navigation.
- **Screen readers:** SplitText runs with `aria: 'auto'`, so split headlines are
  announced as one sentence, not forty letters. Decorative layers (cursor, grain,
  ghost numerals, scroll rail) are `aria-hidden`. Form errors use `aria-invalid` +
  `aria-describedby`; submission status is a polite live region.
- **Reduced motion:** honoured at three levels — Lenis doesn't initialise (smooth
  scroll is itself unrequested motion), GSAP `matchMedia` blocks never build, and a
  CSS block guarantees anything GSAP would have revealed is visible.
- **Contrast:** every text pair meets **WCAG AA**. Small red labels use
  `--accent-text` (a lifted red on dark, a deep red on light) because brand red is
  4.4:1 on black — fine for display type, one notch short for 10px labels.

### Theme

Dark is the default for everyone; the nav toggle opts into light and persists the
choice. There is deliberately no `prefers-color-scheme` auto-switch — the volumetric
hero, metal surfaces and red key light are all built for a black ground, and light is
a legible alternative rather than an equal twin. A blocking inline script applies the
stored theme before first paint so there's no flash.

---

## SEO

- Full metadata: canonical, Open Graph, Twitter card, keywords, `en-IN` locale.
- **JSON-LD** `AutoRepair` + `LocalBusiness` with address, geo, opening hours,
  `areaServed` and the complete service catalogue — these are local-intent queries,
  so the structured data does more work than any amount of copy.
- `sitemap.xml`, `robots.txt`, web manifest generated by the App Router.
- Semantic landmarks, one `h1`, `h2` per section, real `<address>`, `<blockquote>`,
  `<figure>`/`<figcaption>`.

Targeting: Commercial Vehicle Repair Tamil Nadu · Truck Accident Repair · Truck Body
Building · Truck Fabrication · Commercial Vehicle Workshop · Insurance Authorized
Workshop · Fleet Repair · Mechanical Repairs · Electrical Repairs · Commercial
Vehicle Service Kerala.

---

## Deploy

Static-prerendered — deploys anywhere Next.js runs. On Vercel it's zero-config:

```bash
npx vercel
```

Set `site.url` to the production domain first, or the canonical tags and sitemap will
point at the placeholder.
