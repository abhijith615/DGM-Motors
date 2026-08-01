<div align="center">

# DGM MOTORS

**Commercial Vehicle Accident Repair. Engineered to Perfection.**

Tamil Nadu · Kerala

</div>

---

An immersive, single-page marketing site for a commercial vehicle accident repair
workshop. Built for scroll-driven storytelling at a sustained 60 FPS, with a
full-bleed video hero, a pinned horizontal process narrative, and a single-theme
design system built on brand gray and vivid red.

## Stack

| Layer | Choice | Why |
|---|---|---|
| Framework | **Next.js 15** (App Router) + React 19 | Static prerender, per-route code splitting, first-class metadata API |
| Language | **TypeScript** (strict) | — |
| Styling | **Tailwind CSS v4** (CSS-first `@theme`) | Whole design system lives in one file, no JS config to drift |
| Animation | **GSAP 3.15** + ScrollTrigger, ScrollToPlugin, SplitText | The only toolkit that does pinning, scrubbing and text splitting correctly together |
| Smooth scroll | **Lenis** | Driven by GSAP's ticker so ScrollTrigger never reads a stale position |
| Media | Compressed H.264 + WebP, built by script | See *Creatives pipeline* below |

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
2. **`site.contact.email`** — still a guess. (Phone and WhatsApp are the real number.)
3. **`site.address.lat` / `lng`** — currently *approximate* (Karuppur/Salem, not the yard).
   They feed only the JSON-LD `geo` property; the embedded map is geocoded from the
   address string, so what visitors see is already correct. For the exact pin,
   right-click the workshop in Google Maps — the lat,lng is the first menu item.
4. **`site.social`** — profile URLs. Empty strings are filtered out of the UI automatically.
5. **`testimonials`** — replace with real, attributable, permissioned customer quotes.
6. **Statistics** in `excellence.stats` and `pillars` — these are plausible placeholders. **Verify every number before publishing**; they are trust claims.

✅ Address and phone are the real business details.

---

## Creatives pipeline

The raw masters live in `New Creatives/` and are **never shipped**. Everything the
browser receives is derived:

```bash
node scripts/generate-media.mjs
```

| | Master | Shipped |
|---|---|---|
| 3 × 10s clips | 42 MB @ 9–12 Mbps | **9.5 MB** H.264, no audio, `+faststart` |
| 8 service stills | 36 MB of 2048² PNG | **1.0 MB** WebP @ 1000px |

Re-run the script whenever a master changes. Paths are declared once in
`media` and `services[].image` in `src/lib/site.ts` — never point those at the
originals.

**Why H.264 and not VP9/AV1:** these are looping background videos. H.264 is the
only codec with universal *hardware* decode; software-decoding a loop is a
measurable battery drain on phones, which costs more than the bytes it saves.

### How the video is delivered

`BackgroundVideo` handles the five things a bare `<video autoplay loop muted>`
does not:

- **One file, ever.** The hero has a landscape and a portrait cut; the source is
  chosen in JS from `matchMedia`, because browsers evaluate `media` on `<source>`
  inconsistently for video and never re-evaluate it on resize.
- **The poster is a `<picture>`,** not a CSS background and not `<video poster>`.
  `media` on `<source>` *is* reliable for images: evaluated at parse time,
  exactly one file fetched, no JS, correct in SSR.
- **It doesn't compete with LCP.** Below-the-fold video waits for an
  IntersectionObserver (with a 4s fail-open). The hero passes `eager` — it's
  always in view, so observing it only adds a way to never load.
- **It stops when unwatched.** Off-screen or hidden tab → pause.
- **Reduced motion means no motion.** The video is never loaded, only the poster.

Autoplay rejection (iOS low-power mode) degrades to the poster, not a black box.

## Swapping the service imagery

All eight capability cards in section 03 use the supplied stills. To change one,
drop a new master in `New Creatives/` under the same name, re-run
`node scripts/generate-media.mjs`, and the path in `services[].image` keeps
working — the filenames are slugified from the masters.

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
│  ├─ media/              BackgroundVideo (responsive, lazy, pause-when-unwatched)
│  ├─ layout/             Nav, Footer, Preloader, Grain, ScrollProgress
│  ├─ providers/          SmoothScrollProvider (Lenis⟷GSAP)
│  ├─ sections/           The seven page sections
│  ├─ seo/                JSON-LD
│  └─ ui/                 Button, Magnetic, Cursor, SplitHeading, Reveal, Counter…
├─ hooks/
└─ lib/                   site.ts (all content), gsap.ts, ready.ts, utils.ts
```

### Palette

Two brand colours, plus white:

| | | Role |
|---|---|---|
| Brand gray | `#A6A6A6` | The page ground. Sections alternate this with white, which is what produces the banded rhythm. |
| Vivid red | `#E81E26` | Fills, rules, tick marks, display-scale accents. |
| White | `#FFFFFF` | Alternating bands and cards. |

**The one rule that shapes everything:** `#A6A6A6` is a *mid* gray, so it is
unforgiving.

- Dark text on it tops out around 7.6:1, so the type hierarchy is compressed
  into `#141414` / `#2B2B2B` / `#3B3B3B` — all of which clear AA.
- **Vivid red is only 1.86:1 on it.** On a gray ground red may be a fill, a
  rule, an icon or display-scale type — never small text. Small red labels use
  `--accent-text` (`#7A0D12`, 4.6:1 on gray, 11:1 on white).

This is the same discipline the reference uses: its red is buttons, tick marks,
the torn band and big headlines, never body copy.

The hero stays black in both themes. Anything sitting on it — or on a full-bleed
image overlay — gets the `.on-dark` class, which swaps the text tokens locally so
one set of component classes works over both the gray page and a photograph.

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
| Page chunk | 13.5 kB |
| Video shipped | 9.5 MB (lazy, never blocking) |

```bash
npm run build && node scripts/analyze-bundle.mjs
```

Reports gzipped chunk sizes and flags which chunk each heavy library landed in.

Other measures:
- All video is compressed, lazy, paused when unwatched, and skipped entirely under
  reduced motion (see *Creatives pipeline*).
- Service stills are pre-sized WebP served through `next/image` responsive variants.
- Scroll progress is read through a **ref**, not state, so the render loop does not
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

**Single theme.** Gray + red is the brand, so there is no dark variant, no toggle,
no stored preference and no prefers-color-scheme switch — and therefore no theme
flash to guard against.

Do not confuse this with `.on-dark`, which is a *local* context for content sitting
on the hero or on photography. Those surfaces are dark regardless, so anything
inside them is pinned to light type and --color-red-hot.

Verified at **0 AA failures** across 219 text nodes.

**When re-auditing, force the scroll-reveals visible first.** Everything below the
fold sits at `opacity: 0` until GSAP reveals it, and a contrast checker that skips
invisible elements will silently skip most of the page — which is exactly how a
1.86:1 red-on-grey stat suffix survived three earlier passes:

```js
document.querySelectorAll('[data-reveal],[data-split],[data-pillar],[data-service-card],[data-quote],[data-spec-row],[data-hero-fade],[data-stage-el]')
  .forEach(el => { el.style.opacity = '1'; el.style.visibility = 'visible'; el.style.transform = 'none'; });
```

Text over photography or video can't be checked this way at all — the DOM says
"white on white" because it can't see the image. Those are verified separately by
compositing the real scrim over the real pixels and sampling the brightest one.

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
