import type { Metadata, Viewport } from 'next';
import { Archivo, Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';

import { site, seoKeywords } from '@/lib/site';
import { ThemeProvider, themeInitScript } from '@/components/providers/ThemeProvider';
import { SmoothScrollProvider } from '@/components/providers/SmoothScrollProvider';
import { Cursor } from '@/components/ui/Cursor';
import { Grain } from '@/components/layout/Grain';
import { Nav } from '@/components/layout/Nav';
import { Preloader } from '@/components/layout/Preloader';
import { ScrollProgress } from '@/components/layout/ScrollProgress';
import { Footer } from '@/components/layout/Footer';
import { JsonLd } from '@/components/seo/JsonLd';

/* -------------------------------------------------------------------------- */
/* FONTS                                                                       */
/* Self-hosted at build time by next/font — no render-blocking request to       */
/* Google, no layout shift, and `display: swap` so text paints immediately.     */
/* -------------------------------------------------------------------------- */

const archivo = Archivo({
  subsets: ['latin'],
  variable: '--font-archivo',
  display: 'swap',
  // Variable axis: one file covers every weight the display scale uses.
  weight: ['400', '600', '700', '800', '900'],
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const mono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono-tech',
  display: 'swap',
  weight: ['400', '500'],
});

/* -------------------------------------------------------------------------- */
/* METADATA                                                                    */
/* -------------------------------------------------------------------------- */

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — Commercial Vehicle Accident Repair | Tamil Nadu & Kerala`,
    template: `%s — ${site.name}`,
  },
  description: site.description,
  keywords: seoKeywords,
  applicationName: site.name,
  authors: [{ name: site.name }],
  creator: site.name,
  publisher: site.name,
  alternates: { canonical: '/' },
  category: 'Automotive Repair',
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: site.url,
    siteName: site.name,
    title: `${site.name} — Commercial Vehicle Accident Repair. Engineered to Perfection.`,
    description: site.description,
    images: [
      {
        url: '/brand/og.png',
        width: 1200,
        height: 630,
        alt: `${site.name} — Commercial Vehicle Accident Repair`,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${site.name} — Commercial Vehicle Accident Repair`,
    description: site.description,
    images: ['/brand/og.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
  },
  formatDetection: { telephone: true, address: true },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  // Matches the theme so the mobile browser chrome blends into the page.
  // Brand gray is the default ground, so it leads.
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#a6a6a6' },
    { media: '(prefers-color-scheme: dark)', color: '#08090a' },
  ],
};

/* -------------------------------------------------------------------------- */

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    /*
      The font variables MUST live on <html>, not <body>.
      globals.css declares `--font-display: var(--font-archivo), …` on :root.
      Custom properties resolve their var() references on the element where
      they are declared — so if --font-archivo only existed on <body>, the
      :root declaration would reference an undefined variable, compute to the
      guaranteed-invalid value, and inherit as invalid to every descendant.
      Every heading would silently fall back to system UI.
    */
    <html
      lang="en-IN"
      className={`${archivo.variable} ${inter.variable} ${mono.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/*
          Runs before first paint so the correct theme is on <html> already —
          without it the page flashes dark then snaps to light. suppressHydration
          on <html> is required because this script mutates the attribute that
          React is about to reconcile.
        */}
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="antialiased">
        <JsonLd />

        <ThemeProvider>
          <SmoothScrollProvider>
            <Preloader />
            <Cursor />
            <Grain />
            <Nav />
            <ScrollProgress />

            {/* Target of the skip link. */}
            <main id="main">{children}</main>

            <Footer />
          </SmoothScrollProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
