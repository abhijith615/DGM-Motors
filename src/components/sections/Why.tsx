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

        <SplitHeading as="h2" id="why-heading" mode="lines" className="t-display text-display mt-10 max-w-[14ch]">
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
              {/* Grey wash rising from the baseline. Every text token on the
                  row already clears AA against it, so nothing needs a
                  hover-only colour — which is what previously broke, since the
                  red accents vanished into a red field. */}
              <span
                aria-hidden
                className="absolute inset-0 -z-10 translate-y-full bg-[var(--row-highlight)] transition-transform duration-700 [transition-timing-function:var(--ease-out-expo)] group-hover:translate-y-0"
              />

              <div className="grid-swiss items-baseline gap-y-4 py-9 md:py-11">
                {/* index */}
                <span className="col-span-2 font-[family-name:var(--font-mono)] text-[10px] tabular-nums tracking-[0.2em] text-[var(--fg-subtle)] md:col-span-1">
                  {String(i + 1).padStart(2, '0')}
                </span>

                {/* counter / display value */}
                <span className="col-span-10 min-w-0 md:col-span-3">
                  {pillar.value === null ? (
                    /* A word, not a metric. At the numeric scale "Authorised"
                       measures 450px in a 312px column and runs straight over
                       the title, so word values get their own smaller size. */
                    <span className="t-display block text-[clamp(1.35rem,2.6vw,2.3rem)] leading-none tracking-[-0.03em] text-balance">
                      {pillar.display}
                    </span>
                  ) : (
                    <span className="t-display block text-[clamp(2.25rem,5vw,4.25rem)] leading-none tracking-[-0.04em]">
                      <Counter
                        value={pillar.value}
                        suffix={pillar.suffix}
                        prefix={pillar.prefix}
                        // A word suffix (" States") is as wide as the number
                        // itself at full scale; em-relative keeps it in
                        // proportion at every breakpoint.
                        suffixClassName={/[a-z]{2,}/i.test(pillar.suffix ?? '') ? 'text-[0.4em]' : undefined}
                      />
                    </span>
                  )}
                </span>

                {/* title */}
                <h3 className="col-span-12 text-title md:col-span-4 md:pr-6">
                  <span className="inline-block transition-transform duration-700 [transition-timing-function:var(--ease-out-expo)] md:group-hover:translate-x-2">
                    {pillar.title}
                  </span>
                </h3>

                {/* body */}
                <p className="col-span-12 max-w-[46ch] text-sm leading-relaxed text-[var(--fg-muted)] md:col-span-4">
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
