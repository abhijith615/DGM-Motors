'use client';

import { useRef } from 'react';
import { gsap } from '@/lib/gsap';
import { useIsomorphicLayoutEffect } from '@/hooks/useIsomorphicLayoutEffect';
import { excellence, media } from '@/lib/site';
import { SplitHeading } from '@/components/ui/SplitHeading';
import { Reveal } from '@/components/ui/Reveal';
import { Counter } from '@/components/ui/Counter';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { BackgroundVideo } from '@/components/media/BackgroundVideo';

export function Excellence() {
  const root = useRef<HTMLElement>(null);

  useIsomorphicLayoutEffect(() => {
    const el = root.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        // No parallax on the film: it needs an over-sized inner element to have
        // travel, and over-sizing is exactly what crops the frame.

        // Spec rows tick in like a readout.
        gsap.from('[data-spec-row]', {
          xPercent: -3,
          autoAlpha: 0,
          duration: 0.9,
          stagger: 0.08,
          ease: 'expo.out',
          scrollTrigger: { trigger: '[data-spec]', start: 'top 85%', once: true },
        });
      });

      return () => mm.revert();
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={root}
      id="excellence"
      aria-labelledby="excellence-heading"
      className="relative border-t border-[var(--line)] bg-[var(--bg)] py-[var(--spacing-section)]"
    >
      <div className="shell">
        <SectionHeader index={excellence.index} label={excellence.eyebrow} />

        {/* Headline and supporting copy share one row; the film then runs the
            full grid width beneath them. The previous layout put a tall 4:5
            media column beside a shorter text column, which left a large void
            under the text on wide screens. */}
        <div className="grid-swiss mt-14 items-end gap-y-10 md:mt-20">
          <div className="col-span-12 lg:col-span-7">
            <SplitHeading
              as="h2"
              id="excellence-heading"
              mode="lines"
              className="t-display text-display"
              // Pre-broken so the three statements land as three lines at every
              // width — this is a composition, not a paragraph.
            >
              {excellence.headline.split('\n').map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </SplitHeading>
          </div>

          <Reveal variant="rise" stagger={0.12} className="col-span-12 space-y-6 lg:col-span-5" delay={0.15}>
            {excellence.body.map((paragraph) => (
              <p key={paragraph.slice(0, 24)} className="text-lead text-[var(--fg-muted)]">
                {paragraph}
              </p>
            ))}
          </Reveal>
        </div>

        {/* --- workshop film ---
            16:9 frame for a 16:9 source, so object-cover fits it exactly and
            nothing is cropped. There is deliberately no parallax here: the
            effect requires an over-sized inner element, and over-sizing is what
            crops the picture. */}
        <Reveal variant="clip" duration={1.5} className="mt-14 md:mt-20">
          <figure className="relative aspect-video w-full overflow-hidden rounded-[var(--radius-panel)] border border-[var(--line)]">
            <BackgroundVideo sources={[{ src: media.excellence.src, poster: media.excellence.poster }]} />

            {/* Scrim sized for legibility over the footage's bright frames. */}
            <figcaption className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 bg-linear-to-t from-black/92 via-black/55 to-transparent p-5 pt-14 md:p-7 md:pt-20">
              <span className="font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.18em] text-white">
                Accident damage, as received
              </span>
              <span className="font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.18em] text-[var(--color-red-hot)]">
                Intake bay
              </span>
            </figcaption>
          </figure>
        </Reveal>

        {/* --- statistics --- */}
        <div className="mt-24 border-t border-[var(--line)] pt-12 md:mt-32">
          <dl className="grid grid-cols-2 gap-x-6 gap-y-12 lg:grid-cols-4">
            {excellence.stats.map((stat) => (
              <Reveal key={stat.label} variant="rise" as="div" className="group">
                <dt className="sr-only">{stat.label}</dt>
                <dd>
                  <span className="t-display block text-[clamp(2.5rem,5.4vw,4.75rem)] leading-none tracking-[-0.04em]">
                    <Counter value={stat.value} suffix={stat.suffix} />
                  </span>
                  <span className="mt-4 block h-px w-full origin-left bg-[var(--line-strong)] transition-transform duration-700 [transition-timing-function:var(--ease-out-expo)] group-hover:scale-x-100 lg:scale-x-[0.35] lg:group-hover:scale-x-100" />
                  <span className="mt-4 block max-w-[22ch] font-[family-name:var(--font-mono)] text-[10px] uppercase leading-relaxed tracking-[0.16em] text-[var(--fg-subtle)]">
                    {stat.label}
                  </span>
                </dd>
              </Reveal>
            ))}
          </dl>
        </div>

        {/* --- spec sheet --- */}
        <div data-spec className="mt-20 md:mt-28">
          <p className="t-meta mb-6">Technical Reference</p>
          <dl className="border-t border-[var(--line)]">
            {excellence.specs.map(([key, value]) => (
              <div
                key={key}
                data-spec-row
                className="group flex flex-col gap-1 border-b border-[var(--line)] py-5 transition-colors hover:bg-[var(--glass)] md:flex-row md:items-baseline md:gap-8 md:px-2"
              >
                <dt className="w-full font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.18em] text-[var(--fg-subtle)] md:w-64 md:shrink-0">
                  {key}
                </dt>
                <dd className="text-title text-[var(--fg)] transition-transform duration-500 [transition-timing-function:var(--ease-out-expo)] md:group-hover:translate-x-2">
                  {value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
