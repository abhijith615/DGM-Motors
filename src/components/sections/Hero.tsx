'use client';

import dynamic from 'next/dynamic';
import { useRef } from 'react';
import { gsap, ScrollTrigger, SplitText } from '@/lib/gsap';
import { useIsomorphicLayoutEffect } from '@/hooks/useIsomorphicLayoutEffect';
import { onReady } from '@/lib/ready';
import { hero } from '@/lib/site';
import { Button } from '@/components/ui/Button';
import { HeroFallback } from '@/components/canvas/HeroFallback';

/**
 * The WebGL hero is ~150 KB gzip of three.js + drei. Loading it lazily and
 * client-only keeps it off the critical path entirely — the headline paints
 * from HTML + CSS while three streams in behind it.
 *
 * Note the fallback is imported from its OWN module, not from HeroCanvas.
 * Pulling any named export out of HeroCanvas would put three.js back in the
 * static graph and make this dynamic import decorative.
 */
const HeroCanvas = dynamic(() => import('@/components/canvas/HeroCanvas'), {
  ssr: false,
  loading: () => <HeroFallback />,
});

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
      className="relative min-h-[100svh] w-full overflow-hidden bg-[var(--color-void)] text-white"
    >
      <HeroCanvas />

      {/* Legibility floor under the type — the shader is dark but not uniformly. */}
      <div
        aria-hidden
        className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,9,10,0.55)_0%,transparent_28%,transparent_52%,rgba(8,9,10,0.88)_100%)]"
      />

      <div className="shell relative z-10 flex min-h-[100svh] flex-col justify-between pb-8 pt-24 md:pt-28">
        <div data-hero-content>
          {/* --- eyebrow --- */}
          <div data-hero-fade className="mb-8 flex items-center gap-4 md:mb-12">
            <span className="relative flex h-1.5 w-1.5 shrink-0">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--color-red)] opacity-70" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[var(--color-red)]" />
            </span>
            <p className="font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.24em] text-[var(--color-gray)] md:text-[11px]">
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

          <p
            data-hero-fade
            className="t-display mt-5 text-[clamp(0.95rem,1.85vw,1.9rem)] leading-none tracking-[-0.02em] text-[#8d9699] md:-mt-[0.35em] md:pl-[max(38%,22rem)]"
          >
            Engineered to <span className="text-white">Perfection</span>
            <span className="text-[var(--color-red)]">.</span>
          </p>

          <div data-hero-rule className="mt-9 h-px w-full origin-left bg-white/12 md:mt-12" />

          {/* --- supporting copy + actions --- */}
          <div className="grid-swiss mt-8 gap-y-10 md:mt-12">
            <p
              data-hero-fade
              className="col-span-12 max-w-[62ch] text-lead text-[var(--color-gray)] md:col-span-6 lg:col-span-5"
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
            <span className="font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.2em] text-[var(--color-gray)]">
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
      <span className="font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.2em] text-[var(--color-gray)]">
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
