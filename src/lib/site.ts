/**
 * SINGLE SOURCE OF TRUTH for every piece of copy, contact detail and data set
 * on the site. Nothing is hardcoded in components.
 *
 * ⚠️  BEFORE LAUNCH — replace every value marked `TODO:` below with the real
 *     business details. They are the only placeholders in the codebase.
 */

export const site = {
  name: 'DGM Motors',
  legalName: 'DGM Motors',
  tagline: 'Engineered to Perfection',

  /** Used for canonical URLs, sitemap, JSON-LD. TODO: set the live domain. */
  url: 'https://www.dgmmotors.in',

  description:
    'Commercial vehicle accident repair, truck body building, fabrication, chassis straightening, mechanical and electrical repairs across Tamil Nadu and Kerala. Insurance-authorised workshop with on-site emergency support.',

  contact: {
    /** TODO: real numbers. Keep E.164 in `tel`/`whatsapp`, pretty in `label`. */
    phone: { tel: '+919000000000', label: '+91 90000 00000' },
    whatsapp: { number: '919000000000', label: 'WhatsApp Us' },
    email: 'service@dgmmotors.in', // TODO
    hours: 'Mon – Sat · 09:00 – 20:00 IST',
    emergency: '24 / 7 breakdown & recovery desk',
  },

  address: {
    // TODO: exact street address.
    street: 'Industrial Estate',
    locality: 'Coimbatore',
    region: 'Tamil Nadu',
    postalCode: '641021',
    country: 'IN',
    countryName: 'India',
    /** TODO: exact workshop coordinates — also drives the embedded map. */
    lat: 11.0168,
    lng: 76.9558,
  },

  social: {
    // TODO: real profiles. Empty strings are filtered out of the UI.
    instagram: '',
    facebook: '',
    youtube: '',
    linkedin: '',
  },

  serviceAreas: ['Tamil Nadu', 'Kerala'],
} as const;

/** Google Maps embed URL derived from the coordinates above — no API key needed. */
export const mapEmbedUrl = `https://www.google.com/maps?q=${site.address.lat},${site.address.lng}&z=14&output=embed`;

export const whatsappUrl = `https://wa.me/${site.contact.whatsapp.number}?text=${encodeURIComponent(
  "Hello DGM Motors — I'd like to request an inspection for my commercial vehicle."
)}`;

/* -------------------------------------------------------------------------- */
/* NAVIGATION                                                                  */
/* -------------------------------------------------------------------------- */

export const navLinks = [
  { label: 'Excellence', href: '#excellence', index: '01' },
  { label: 'Process', href: '#process', index: '02' },
  { label: 'Services', href: '#services', index: '03' },
  { label: 'Why DGM', href: '#why', index: '04' },
  { label: 'Workshop', href: '#workshop', index: '05' },
  { label: 'Contact', href: '#contact', index: '06' },
] as const;

/* -------------------------------------------------------------------------- */
/* HERO                                                                        */
/* -------------------------------------------------------------------------- */

export const hero = {
  eyebrow: 'Tamil Nadu · Kerala — Commercial Vehicle Specialists',
  /**
   * Broken across lines deliberately — the break IS the composition. Three
   * short, near-equal measures set at display scale, with the second line the
   * longest so the block reads as a solid mass rather than a ragged paragraph.
   * The accent line is set much smaller as a deliberate counterpoint.
   */
  headline: ['Commercial', 'Vehicle Accident', 'Repair.'],
  headlineAccent: 'Engineered to Perfection.',
  sub: 'Complete commercial vehicle accident repair solutions, body building, fabrication, mechanical and electrical repairs, insurance claim assistance, and on-location support across Tamil Nadu and Kerala.',
  primaryCta: { label: 'Request Inspection', href: '#contact' },
  secondaryCta: { label: 'Explore Services', href: '#services' },
  /** Ticker along the bottom edge of the hero. */
  marquee: [
    'Accident Repair',
    'Body Building',
    'Fabrication',
    'Chassis Straightening',
    'Insurance Claims',
    'On-Site Recovery',
  ],
} as const;

/* -------------------------------------------------------------------------- */
/* 02 — ENGINEERING EXCELLENCE                                                 */
/* -------------------------------------------------------------------------- */

export const excellence = {
  index: '01',
  eyebrow: 'Engineering Excellence',
  headline: 'Precision is not\na finish. It is\nthe method.',
  body: [
    'A damaged chassis does not forgive approximation. Every vehicle that enters our bay is measured against factory datum points before a single panel is touched — and measured again before it leaves.',
    'Hydraulic straightening benches, calibrated jigs, certified welding procedures and a documented inspection trail. The result is a vehicle returned to specification, not merely returned to service.',
  ],
  /** Animated on scroll into view. `suffix` renders in red. */
  stats: [
    { value: 18, suffix: '+', label: 'Years in commercial repair' },
    { value: 6200, suffix: '+', label: 'Vehicles restored' },
    { value: 40, suffix: 'k', label: 'Sq. ft. covered workshop' },
    { value: 98, suffix: '%', label: 'Claims settled first-pass' },
  ],
  /** Technical spec strip — reads like a data sheet. */
  specs: [
    ['Straightening tolerance', '± 1.5 mm to datum'],
    ['Weld procedure', 'MIG / MAG · certified'],
    ['Paint system', '2K polyurethane, baked'],
    ['Load classes serviced', 'LCV · ICV · MCV · HCV'],
  ],
} as const;

/* -------------------------------------------------------------------------- */
/* 03 — THE REPAIR JOURNEY (horizontal scroll)                                 */
/* -------------------------------------------------------------------------- */

export type JourneyStage = {
  id: string;
  index: string;
  title: string;
  body: string;
  /** Rendered as a monospace spec line under the copy. */
  detail: string;
};

export const journey: JourneyStage[] = [
  {
    id: 'accident',
    index: '01',
    title: 'Accident',
    body: 'The call comes in at any hour. Our recovery desk logs the incident, dispatches support and secures the vehicle before further damage compounds the claim.',
    detail: 'Response · 24/7 dispatch',
  },
  {
    id: 'inspection',
    index: '02',
    title: 'Inspection',
    body: 'Structural survey against factory datum. Impact path traced through the frame. Every deviation photographed, measured and entered into the repair file.',
    detail: 'Survey · datum measurement',
  },
  {
    id: 'frame',
    index: '03',
    title: 'Frame Straightening',
    body: 'The chassis is mounted to the bench and drawn back to specification under controlled hydraulic load — pulled slowly, released, re-measured, pulled again.',
    detail: 'Hydraulic bench · ± 1.5 mm',
  },
  {
    id: 'body',
    index: '04',
    title: 'Body Repair',
    body: 'Panels are reformed where they can be saved and replaced where they cannot. Nothing is filled over damage that should have been worked out.',
    detail: 'Panel beating · alignment',
  },
  {
    id: 'fabrication',
    index: '05',
    title: 'Fabrication',
    body: 'Sections cut, formed and jig-fitted in-house. Load beds, cabins, tippers and containers built to the duty cycle the vehicle actually runs.',
    detail: 'In-house · jig-fitted',
  },
  {
    id: 'welding',
    index: '06',
    title: 'Manual Welding',
    body: 'Structural joints laid by hand by certified welders. Penetration verified, spatter dressed, every seam treated as a load path — because it is one.',
    detail: 'MIG / MAG · certified',
  },
  {
    id: 'painting',
    index: '07',
    title: 'Painting',
    body: 'Surface prepared, primed and sealed, then finished in a 2K polyurethane system and baked. Colour matched to the original under controlled light.',
    detail: '2K PU · baked booth',
  },
  {
    id: 'assembly',
    index: '08',
    title: 'Assembly',
    body: 'Mechanical, electrical and trim reinstated. Harnesses routed to original paths, torque values recorded, fluids replaced to service schedule.',
    detail: 'Torque logged · to spec',
  },
  {
    id: 'quality',
    index: '09',
    title: 'Quality Check',
    body: 'Independent sign-off against the original inspection file. Geometry re-measured, systems tested, road trial completed before approval.',
    detail: 'Re-measured · road trial',
  },
  {
    id: 'delivery',
    index: '10',
    title: 'Delivery',
    body: 'Handover with the complete repair record and claim documentation. The vehicle returns to the fleet at specification — and back to earning.',
    detail: 'Full record · claim closed',
  },
];

/* -------------------------------------------------------------------------- */
/* 04 — SERVICES                                                               */
/* -------------------------------------------------------------------------- */

export type Service = {
  id: string;
  index: string;
  title: string;
  body: string;
  points: string[];
  /**
   * Built artefact from `scripts/generate-media.mjs` — the 2048² PNG masters in
   * `New Creatives/` are resized to 1000px WebP. Filenames are the slugified
   * master names, which is why they match the `id` above.
   */
  image: string;
};

export const services: Service[] = [
  {
    id: 'accident-repair',
    index: '01',
    title: 'Accident Repair',
    body: 'End-to-end restoration of collision-damaged commercial vehicles, from structural survey through to final road trial.',
    points: ['Structural survey', 'Impact path tracing', 'Full documentation'],
    image: '/services/accident-repair.webp',
  },
  {
    id: 'body-building',
    index: '02',
    title: 'Body Building',
    body: 'Load bodies, cabins, tippers and containers built to the duty cycle and payload the vehicle actually runs.',
    points: ['Load bodies', 'Tippers & containers', 'Cabin building'],
    image: '/services/body-building.webp',
  },
  {
    id: 'fabrication',
    index: '03',
    title: 'Fabrication',
    body: 'In-house cutting, forming and jig-fitting of structural sections, brackets, sub-frames and custom assemblies.',
    points: ['Sub-frames', 'Custom assemblies', 'Jig-fitted accuracy'],
    image: '/services/fabrication.webp',
  },
  {
    id: 'mechanical',
    index: '04',
    title: 'Mechanical Repairs',
    body: 'Engine, transmission, axle, steering, suspension and braking work carried out to manufacturer torque and clearance specification.',
    points: ['Engine & transmission', 'Axles & suspension', 'Braking systems'],
    image: '/services/mechanical-repairs.webp',
  },
  {
    id: 'electrical',
    index: '05',
    title: 'Electrical Repairs',
    body: 'Harness repair and replacement, lighting, charging, starting and instrumentation faults traced to the circuit.',
    points: ['Harness repair', 'Charging & starting', 'Fault diagnosis'],
    image: '/services/electrical-repairs.webp',
  },
  {
    id: 'chassis',
    index: '06',
    title: 'Chassis Straightening',
    body: 'Hydraulic bench straightening under controlled load, drawn back to factory datum and verified by measurement.',
    points: ['Hydraulic bench', '± 1.5 mm to datum', 'Verified by measurement'],
    image: '/services/chassis-straightening.webp',
  },
  {
    id: 'insurance',
    index: '07',
    title: 'Insurance Repairs',
    body: 'Authorised workshop procedures with surveyor coordination, estimate preparation and complete claim documentation.',
    points: ['Surveyor coordination', 'Estimate preparation', 'Claim documentation'],
    image: '/services/insurance-repairs.webp',
  },
  {
    id: 'onsite',
    index: '08',
    title: 'On-Site Emergency Repairs',
    body: 'Mobile teams dispatched to breakdown and accident locations across Tamil Nadu and Kerala, day or night.',
    points: ['24/7 dispatch', 'Mobile workshop', 'Recovery support'],
    image: '/services/on-site-emergency-repairs.webp',
  },
];

/* -------------------------------------------------------------------------- */
/* 05 — WHY DGM MOTORS                                                         */
/* -------------------------------------------------------------------------- */

export type Pillar = {
  id: string;
  /** Counter target. `null` renders the `display` string statically instead. */
  value: number | null;
  display?: string;
  suffix?: string;
  prefix?: string;
  title: string;
  body: string;
};

export const pillars: Pillar[] = [
  {
    id: 'technicians',
    value: 45,
    suffix: '+',
    title: 'Experienced Technicians',
    body: 'Panel beaters, certified welders, mechanics and auto-electricians who have spent their careers on commercial vehicles — not passenger cars.',
  },
  {
    id: 'equipment',
    value: 12,
    suffix: '',
    title: 'Advanced Equipment',
    body: 'Hydraulic straightening benches, calibrated measuring jigs, a baked paint booth and dedicated fabrication bays running in parallel.',
  },
  {
    id: 'insurance',
    value: null,
    display: 'Authorised',
    title: 'Insurance Authorised',
    body: 'Recognised workshop procedures, direct surveyor coordination and claim documentation prepared to settle first-pass.',
  },
  {
    id: 'turnaround',
    value: 72,
    suffix: 'h',
    title: 'Fast Turnaround',
    body: 'Parallel bay scheduling and in-house fabrication remove the two things that usually stall a repair: queueing and outsourcing.',
  },
  {
    id: 'coverage',
    value: 2,
    suffix: ' States',
    title: 'Tamil Nadu & Kerala Coverage',
    body: 'Recovery and on-site teams positioned to reach breakdowns across both states, with the workshop as the fixed point behind them.',
  },
];

/* -------------------------------------------------------------------------- */
/* 06 — WORKSHOP GALLERY                                                       */
/* -------------------------------------------------------------------------- */

/**
 * Each plate renders as a generated industrial composition (see
 * `components/gallery/Plate.tsx`). To use real photography instead, drop a
 * file at `/public/workshop/<id>.jpg` and set `src` — the component prefers
 * `src` whenever it is present.
 */
export type Plate = {
  id: string;
  caption: string;
  meta: string;
  /** Masonry weight. */
  span: 'tall' | 'wide' | 'square';
  /** Seeds the generated composition so it stays stable between renders. */
  seed: number;
  variant: 'chassis' | 'weld' | 'panel' | 'booth' | 'bay' | 'detail';
  src?: string;
};

export const plates: Plate[] = [
  { id: 'bay-01', caption: 'Main repair bay', meta: 'Coimbatore · Bay 01', span: 'wide', seed: 11, variant: 'bay' },
  { id: 'chassis-01', caption: 'Chassis on the straightening bench', meta: 'Hydraulic bench', span: 'tall', seed: 27, variant: 'chassis' },
  { id: 'weld-01', caption: 'Structural seam, laid by hand', meta: 'MIG / MAG', span: 'square', seed: 44, variant: 'weld' },
  { id: 'panel-01', caption: 'Panel forming', meta: 'Body shop', span: 'square', seed: 58, variant: 'panel' },
  { id: 'booth-01', caption: 'Baked paint booth', meta: '2K polyurethane', span: 'tall', seed: 63, variant: 'booth' },
  { id: 'detail-01', caption: 'Datum measurement point', meta: '± 1.5 mm', span: 'square', seed: 79, variant: 'detail' },
  { id: 'bay-02', caption: 'Fabrication bay', meta: 'In-house forming', span: 'wide', seed: 88, variant: 'bay' },
  { id: 'chassis-02', caption: 'Sub-frame assembly', meta: 'Jig-fitted', span: 'square', seed: 95, variant: 'chassis' },
];

/* -------------------------------------------------------------------------- */
/* 07 — TESTIMONIALS                                                           */
/* -------------------------------------------------------------------------- */

export type Testimonial = {
  id: string;
  quote: string;
  author: string;
  role: string;
};

/** TODO: replace with attributable, permissioned customer quotes before launch. */
export const testimonials: Testimonial[] = [
  {
    id: 't1',
    quote:
      'Two of our tippers went in after a highway collision. They came back straight, documented and settled on the first claim submission. That is not normal in this trade.',
    author: 'Fleet Operator',
    role: 'Aggregates transport · Coimbatore',
  },
  {
    id: 't2',
    quote:
      'What separates DGM is the measuring. They showed me the numbers before the work and the numbers after. I have never been handed a repair file like that.',
    author: 'Transport Contractor',
    role: 'Container haulage · Salem',
  },
  {
    id: 't3',
    quote:
      'Our breakdown was outside Palakkad at eleven at night. Their team reached us, secured the vehicle and had it on the bench the next morning.',
    author: 'Logistics Manager',
    role: 'FMCG distribution · Kerala',
  },
  {
    id: 't4',
    quote:
      'They built the load body to the duty cycle we actually run, not to a catalogue. Three years on it has not cracked at a single joint.',
    author: 'Owner-Operator',
    role: 'Steel transport · Erode',
  },
];

/* -------------------------------------------------------------------------- */
/* 08 — CONTACT                                                                */
/* -------------------------------------------------------------------------- */

export const contact = {
  index: '06',
  eyebrow: 'Request Inspection',
  headline: "Bring us\nthe damage.",
  body: 'Send the vehicle details and we will respond with an inspection slot, an indicative scope and — where a claim is involved — the documentation you will need.',
  vehicleTypes: ['LCV', 'ICV', 'MCV', 'HCV', 'Tipper', 'Trailer', 'Bus', 'Other'],
  enquiryTypes: [
    'Accident repair',
    'Body building',
    'Fabrication',
    'Mechanical / electrical',
    'Insurance claim',
    'Fleet maintenance',
    'On-site emergency',
  ],
} as const;

/* -------------------------------------------------------------------------- */
/* MEDIA                                                                       */
/* -------------------------------------------------------------------------- */

/**
 * Every video path the site uses. All of these are BUILT ARTEFACTS — the
 * masters live in `New Creatives/` and are compressed by
 * `node scripts/generate-media.mjs`. Re-run that script if a master changes;
 * do not point these at the originals (they are 9–12 Mbps).
 */
export const media = {
  hero: {
    desktop: '/video/hero-desktop.mp4',
    mobile: '/video/hero-mobile.mp4',
    posterDesktop: '/video/hero-desktop-poster.webp',
    posterMobile: '/video/hero-mobile-poster.webp',
  },
  excellence: {
    src: '/video/excellence.mp4',
    poster: '/video/excellence-poster.webp',
  },
} as const;

/* -------------------------------------------------------------------------- */
/* SEO                                                                         */
/* -------------------------------------------------------------------------- */

export const seoKeywords = [
  'Commercial Vehicle Repair Tamil Nadu',
  'Truck Accident Repair',
  'Truck Body Building',
  'Truck Fabrication',
  'Commercial Vehicle Workshop',
  'Insurance Authorized Workshop',
  'Fleet Repair',
  'Mechanical Repairs',
  'Electrical Repairs',
  'Commercial Vehicle Service Kerala',
  'Chassis Straightening',
  'Lorry Body Building Coimbatore',
  'Commercial Vehicle Accident Repair',
];
