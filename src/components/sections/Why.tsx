'use client';

import { useRef } from 'react';
import { gsap } from '@/lib/gsap';
import { useIsomorphicLayoutEffect } from '@/hooks/useIsomorphicLayoutEffect';
import { pillars, site } from '@/lib/site';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { SplitHeading } from '@/components/ui/SplitHeading';
import { Counter } from '@/components/ui/Counter';

/**
 * WHY DGM — five pillars as an editorial list.
 *
 * Each row is a hairline-separated band; hovering wipes a red field up from the
 * baseline and inverts the type. It's the same gesture as the primary button,
 * scaled to full width — repeating one idea at different sizes is what makes a
 * design system feel authored rather than assembled.
 */
export function Why() {
  const root = useRef<HTMLElement>(null);

  useIsomorphicLayoutEffect(() => {
    const el = root.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.from('[data-pillar]', {
          yPercent: 18,
          autoAlpha: 0,
          duration: 1.1,
          stagger: 0.08,
          ease: 'expo.out',
          scrollTrigger: { trigger: '[data-pillars]', start: 'top 82%', once: true },
        });
      });

      return () => mm.revert();
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={root}
      id="why"
      aria-labelledby="why-heading"
      className="relative border-t border-[var(--line)] bg-[var(--bg-raised)] py-[var(--spacing-section)]"
    >
      <div className="shell">
        <SectionHeader index="04" label={`Why ${site.name}`} />

        <SplitHeading as="h2" id="why-heading" mode="lines" className="t-display text-display mt-10 max-w-[14ch] text-gradient-steel">
          Reasons that
          <br />
          survive scrutiny.
        </SplitHeading>

        <ul data-pillars className="mt-16 border-t border-[var(--line)] md:mt-24">
          {pillars.map((pillar, i) => (
            <li
              key={pillar.id}
              data-pillar
              data-cursor="link"
              className="group relative isolate overflow-hidden border-b border-[var(--line)]"
            >
              {/* Red wipe rising from the baseline. */}
              <span
                aria-hidden
                className="absolute inset-0 -z-10 translate-y-full bg-[var(--color-red)] transition-transform duration-700 [transition-timing-function:var(--ease-out-expo)] group-hover:translate-y-0"
              />

              <div className="grid-swiss items-baseline gap-y-4 py-9 transition-colors duration-500 group-hover:text-white md:py-11">
                {/* index */}
                <span className="col-span-2 font-[family-name:var(--font-mono)] text-[10px] tabular-nums tracking-[0.2em] text-[var(--fg-subtle)] transition-colors duration-500 group-hover:text-white/70 md:col-span-1">
                  {String(i + 1).padStart(2, '0')}
                </span>

                {/* counter / display value */}
                <span className="col-span-10 md:col-span-3">
                  <span className="t-display block text-[clamp(2.25rem,5vw,4.25rem)] leading-none tracking-[-0.04em]">
                    {pillar.value === null ? (
                      pillar.display
                    ) : (
                      <Counter value={pillar.value} suffix={pillar.suffix} prefix={pillar.prefix} />
                    )}
                  </span>
                </span>

                {/* title */}
                <h3 className="col-span-12 text-title md:col-span-4 md:pr-6">
                  <span className="inline-block transition-transform duration-700 [transition-timing-function:var(--ease-out-expo)] md:group-hover:translate-x-2">
                    {pillar.title}
                  </span>
                </h3>

                {/* body */}
                <p className="col-span-12 max-w-[46ch] text-sm leading-relaxed text-[var(--fg-muted)] transition-colors duration-500 group-hover:text-white/85 md:col-span-4">
                  {pillar.body}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
