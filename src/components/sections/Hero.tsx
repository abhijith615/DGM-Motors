'use client';

import { useRef } from 'react';
import { gsap, ScrollTrigger, SplitText } from '@/lib/gsap';
import { useIsomorphicLayoutEffect } from '@/hooks/useIsomorphicLayoutEffect';
import { onReady } from '@/lib/ready';
import { hero, media } from '@/lib/site';
import { Button } from '@/components/ui/Button';
import { BackgroundVideo } from '@/components/media/BackgroundVideo';

export function Hero() {
  const root = useRef<HTMLElement>(null);
  const headline = useRef<HTMLHeadingElement>(null);

  /* --- intro, sequenced off the preloader -------------------------------- */

  useIsomorphicLayoutEffect(() => {
    const el = root.current;
    const h = headline.current;
    if (!el || !h) return;

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        // Everything starts hidden. If JS fails after this point the CSS
        // reduced-motion block still guarantees visible text.
        gsap.set('[data-hero-fade]', { autoAlpha: 0, y: 24 });

        let split: SplitText | undefined;
        let unsubscribe = () => {};
        let tl: gsap.core.Timeline | undefined;

        // Split only once the webfont is resolved — otherwise the line boxes
        // are measured against the fallback and the masks clip wrongly.
        document.fonts.ready.then(() => {
          split = SplitText.create(h, {
            type: 'lines,chars',
            mask: 'lines',
            aria: 'auto',
            autoSplit: true,
            onSplit: (self) => {
              tl = gsap.timeline({ paused: true });

              tl.from(self.chars, {
                yPercent: 120,
                rotate: 5,
                duration: 1.3,
                ease: 'expo.out',
                // Sweeps left-to-right across the whole block rather than
                // restarting per line — reads as one gesture.
                stagger: { each: 0.016, from: 'start' },
              })
                .to('[data-hero-fade]', { autoAlpha: 1, y: 0, duration: 1.1, stagger: 0.09, ease: 'expo.out' }, 0.45)
                .from('[data-hero-rule]', { scaleX: 0, duration: 1.4, ease: 'expo.out' }, 0.3);

              unsubscribe = onReady(() => tl?.play());
              return tl;
            },
          });
        });

        return () => {
          unsubscribe();
          tl?.kill();
          split?.revert();
        };
      });

      /* --- scroll exit: type sinks and fades as the section leaves ------- */

      mm.add('(prefers-reduced-motion: no-preference) and (min-width: 768px)', () => {
        gsap.to('[data-hero-content]', {
          yPercent: -14,
          autoAlpha: 0,
          ease: 'none',
          scrollTrigger: {
            trigger: el,
            start: 'top top',
            end: 'bottom top',
            // A little scrub smoothing decouples the parallax from raw wheel
            // deltas, which is what stops it feeling twitchy on a trackpad.
            scrub: 0.6,
          },
        });
      });

      return () => mm.revert();
    }, root);

    return () => {
      ctx.revert();
      ScrollTrigger.refresh();
    };
  }, []);

  return (
    <section
      ref={root}
      id="hero"
      aria-label="Introduction"
      // `on-dark` is what lets shared components (Button, Magnetic links) sit
      // on the black hero while the rest of the page is brand gray — without
      // it the secondary button's --fg would resolve to ink on black.
      className="on-dark relative min-h-[100svh] w-full overflow-hidden bg-[var(--color-void)] text-white"
    >
      {/* Portrait cut on phones, landscape on everything else — only the
          matching file is ever downloaded (see BackgroundVideo). */}
      <BackgroundVideo
        eager
        sources={[
          { src: media.hero.mobile, poster: media.hero.posterMobile, media: '(max-width: 767px)' },
          { src: media.hero.desktop, poster: media.hero.posterDesktop },
        ]}
      />

      {/* Legibility floor. Sized against pure white, not the average frame —
          see .hero-scrim in globals.css. */}
      <div aria-hidden className="hero-scrim absolute inset-0" />

      {/* pt-32 on phones: the bar is ~77px tall there, so the previous pt-24
          left only 27px of air between it and the eyebrow — the two read as one
          crowded block. 128px gives ~51px of clear space. */}
      <div className="shell relative z-10 flex min-h-[100svh] flex-col justify-between pb-8 pt-32 md:pt-28">
        <div data-hero-content>
          {/* --- eyebrow --- */}
          <div data-hero-fade className="mb-8 flex items-center gap-4 md:mb-12">
            <span className="relative flex h-1.5 w-1.5 shrink-0">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--color-red)] opacity-70" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[var(--color-red)]" />
            </span>
            <p className="font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.24em] text-white/90 md:text-[11px]">
              {hero.eyebrow}
            </p>
          </div>

          {/* --- headline ---
              Three display lines carry the proposition; the accent line sits
              alongside the short third line at a fraction of the size, which
              is what turns a sentence into a composition. */}
          <h1 ref={headline} className="t-display text-hero">
            <span className="block">{hero.headline[0]}</span>
            <span className="block">{hero.headline[1]}</span>
            <span className="block">
              {hero.headline[2].replace('.', '')}
              <span className="text-[var(--color-red)]">.</span>
            </span>
          </h1>

          {/* Near-white, not a grey: this line is pushed to the right of the
              hero, which is both the brightest part of the footage and where
              the scrim is lightest. Every supporting element in this section is
              now white-based for the same reason — with ~30% more of the video
              showing through, grey text no longer clears AA against the
              footage's bright frames. Hierarchy comes from size and tracking
              instead of colour, which is the correct way to build it over
              moving imagery. */}
          <p
            data-hero-fade
            className="t-display mt-5 text-[clamp(0.95rem,1.85vw,1.9rem)] leading-none tracking-[-0.02em] text-white/85 md:-mt-[0.35em] md:pl-[max(38%,22rem)]"
          >
            Engineered to <span className="text-white">Perfection</span>
            <span className="text-[var(--color-red)]">.</span>
          </p>

          <div data-hero-rule className="mt-9 h-px w-full origin-left bg-white/12 md:mt-12" />

          {/* --- supporting copy + actions --- */}
          <div className="grid-swiss mt-8 gap-y-10 md:mt-12">
            <p
              data-hero-fade
              className="col-span-12 max-w-[62ch] text-lead text-white/90 md:col-span-6 lg:col-span-5"
            >
              {hero.sub}
            </p>

            <div
              data-hero-fade
              className="col-span-12 flex flex-wrap items-start gap-3 md:col-span-6 md:justify-end lg:col-span-7"
            >
              <Button href={hero.primaryCta.href} variant="primary">
                {hero.primaryCta.label}
              </Button>
              <Button href={hero.secondaryCta.href} variant="secondary">
                {hero.secondaryCta.label}
              </Button>
            </div>
          </div>
        </div>

        {/* --- bottom rail --- */}
        <div data-hero-fade className="mt-10 flex items-end justify-between gap-8 border-t border-white/10 pt-5">
          <Marquee />
          <ScrollCue />
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */

/**
 * Capability ticker.
 *
 * Two identical copies translated by -50% in a CSS animation: when the first
 * copy has travelled its own width the second is exactly where the first
 * started, so the loop is seamless with no JS and no layout thrash.
 */
function Marquee() {
  const items = [...hero.marquee, ...hero.marquee];

  return (
    <div className="fade-x min-w-0 flex-1 overflow-hidden" aria-hidden>
      <div className="flex w-max animate-[dgm-marquee_38s_linear_infinite] items-center gap-8 will-change-transform hover:[animation-play-state:paused]">
        {items.map((item, i) => (
          <span key={i} className="flex shrink-0 items-center gap-8">
            <span className="font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.2em] text-white/90">
              {item}
            </span>
            <span className="h-1 w-1 rotate-45 bg-[var(--color-red)]" />
          </span>
        ))}
      </div>
    </div>
  );
}

function ScrollCue() {
  return (
    <a
      href="#excellence"
      data-cursor="link"
      aria-label="Scroll to Engineering Excellence"
      className="group hidden shrink-0 items-center gap-3 md:flex"
    >
      <span className="font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.2em] text-white/90">
        Scroll
      </span>
      <span className="relative block h-10 w-px overflow-hidden bg-white/15">
        {/* A red pip that repeatedly falls down the rail — a directional hint
            that costs one transform. */}
        <span className="absolute inset-x-0 top-0 block h-3 animate-[dgm-drop_2.2s_var(--ease-in-out-quint)_infinite] bg-[var(--color-red)]" />
      </span>
    </a>
  );
}
