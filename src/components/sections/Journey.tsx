'use client';

import { useRef, useState } from 'react';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import { useIsomorphicLayoutEffect } from '@/hooks/useIsomorphicLayoutEffect';
import { journey } from '@/lib/site';
import { SectionHeader } from '@/components/ui/SectionHeader';

/**
 * THE REPAIR JOURNEY — horizontal scroll-driven storytelling.
 *
 * Desktop: the section pins and ten stages travel horizontally, driven by
 * vertical scroll. Per-stage entrance animations use GSAP's `containerAnimation`
 * so they fire off *horizontal* position within the pinned track rather than
 * page scroll — without it, every panel would animate at once the moment the
 * section pinned.
 *
 * Below 1024px it degrades to a plain vertical list. A pinned horizontal track
 * on a touch device fights the user's scroll direction and is a well-known
 * usability failure, so it isn't a fallback — it's the correct design there.
 */
export function Journey() {
  const root = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLOListElement>(null);
  const bar = useRef<HTMLSpanElement>(null);
  const [active, setActive] = useState(0);

  useIsomorphicLayoutEffect(() => {
    const el = root.current;
    const rail = track.current;
    if (!el || !rail) return;

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      mm.add('(min-width: 1024px) and (prefers-reduced-motion: no-preference)', () => {
        // Functions, not values: re-evaluated on every ScrollTrigger.refresh()
        // so the distance stays correct through resizes and font swaps.
        const distance = () => rail.scrollWidth - window.innerWidth;

        const scrub = gsap.to(rail, {
          x: () => -distance(),
          ease: 'none',
          scrollTrigger: {
            trigger: el,
            pin: true,
            // Scrub with a little smoothing so the track glides rather than
            // snapping to raw wheel deltas.
            scrub: 0.8,
            start: 'top top',
            end: () => `+=${distance()}`,
            invalidateOnRefresh: true,
            // Pre-empts the pin by a frame, removing the 1px jump some browsers
            // show when a pin engages mid-scroll.
            anticipatePin: 1,
            onUpdate: (self) => {
              const i = Math.round(self.progress * (journey.length - 1));
              setActive((current) => (current === i ? current : i));
            },
          },
        });

        // Progress rail.
        gsap.fromTo(
          bar.current,
          { scaleX: 0 },
          {
            scaleX: 1,
            ease: 'none',
            scrollTrigger: {
              trigger: el,
              start: 'top top',
              end: () => `+=${distance()}`,
              scrub: true,
              invalidateOnRefresh: true,
            },
          }
        );

        // Per-stage reveals, keyed to horizontal travel.
        const panels = gsap.utils.toArray<HTMLElement>('[data-stage]', rail);

        panels.forEach((panel) => {
          gsap.from(panel.querySelectorAll('[data-stage-el]'), {
            yPercent: 40,
            autoAlpha: 0,
            duration: 1,
            stagger: 0.07,
            ease: 'expo.out',
            scrollTrigger: {
              trigger: panel,
              containerAnimation: scrub,
              start: 'left 78%',
              once: true,
            },
          });

          // The ghost index counter-moves, giving each panel internal depth.
          gsap.fromTo(
            panel.querySelector('[data-stage-ghost]'),
            { xPercent: 12 },
            {
              xPercent: -12,
              ease: 'none',
              scrollTrigger: {
                trigger: panel,
                containerAnimation: scrub,
                start: 'left right',
                end: 'right left',
                scrub: true,
              },
            }
          );
        });

        return () => {
          // matchMedia cleanup kills the tweens; the pin spacer goes with them.
          ScrollTrigger.refresh();
        };
      });

      /* --- mobile / reduced motion: simple vertical reveals --- */
      mm.add('(max-width: 1023px) and (prefers-reduced-motion: no-preference)', () => {
        gsap.utils.toArray<HTMLElement>('[data-stage]', rail).forEach((panel) => {
          gsap.from(panel.querySelectorAll('[data-stage-el]'), {
            y: 32,
            autoAlpha: 0,
            duration: 0.9,
            stagger: 0.06,
            ease: 'expo.out',
            scrollTrigger: { trigger: panel, start: 'top 82%', once: true },
          });
        });
      });

      return () => mm.revert();
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <section id="process" aria-labelledby="process-heading" className="relative border-t border-[var(--line)] bg-[var(--bg-raised)]">
      {/* Header sits outside the pinned element — pinning a container that also
          holds the heading would drag it along for ten screens of scroll. */}
      <div className="shell pt-[var(--spacing-section)]">
        <SectionHeader index="02" label="The Repair Journey" />
        <h2 id="process-heading" className="t-display text-display mt-10 max-w-[16ch]">
          Ten stages.
          <br />
          One standard.
        </h2>
      </div>

      <div ref={root} className="relative mt-16 lg:mt-24 lg:h-[100svh] lg:overflow-hidden">
        {/* --- the track --- */}
        <ol
          ref={track}
          className="flex flex-col gap-16 px-(--spacing-gutter) lg:h-full lg:w-max lg:flex-row lg:items-center lg:gap-0 lg:px-0"
        >
          {journey.map((stage, i) => (
            <li
              key={stage.id}
              data-stage
              className="group relative flex shrink-0 flex-col justify-center lg:h-full lg:w-[clamp(30rem,46vw,44rem)] lg:border-r lg:border-[var(--line)] lg:px-(--spacing-gutter)"
            >
              {/* Oversized ghost index — type as texture.
                  Only ABSOLUTE from lg up, where each panel is a full-height
                  column and the numeral can sit behind vertically-centred
                  content. Below that the panels are short and stacked, so it
                  stays in the flow as a right-aligned block and simply pushes
                  the copy down — the layout guarantees no collision instead of
                  a padding value that would have to be re-tuned per breakpoint.
                  (It previously overlapped every title on mobile: the clamp
                  floor of 7rem was *larger* than 20vw at 375px, so it never
                  actually shrank.) */}
              <span
                data-stage-ghost
                aria-hidden
                className="t-display pointer-events-none mb-2 block select-none text-right text-[clamp(3rem,13vw,7rem)] leading-none tracking-[-0.06em] text-transparent lg:absolute lg:-top-2 lg:right-6 lg:mb-0 lg:text-[clamp(7rem,20vw,17rem)]"
                style={{ WebkitTextStroke: '1px var(--line-strong)' }}
              >
                {stage.index}
              </span>

              <div className="relative max-w-[34rem]">
                <div data-stage-el className="mb-7 flex items-center gap-4">
                  <StageMark index={i} />
                  <span className="font-[family-name:var(--font-mono)] text-[10px] tabular-nums tracking-[0.2em] text-[var(--accent-text)]">
                    {stage.index} / {String(journey.length).padStart(2, '0')}
                  </span>
                </div>

                <h3 data-stage-el className="t-display text-headline tracking-[-0.03em]">
                  {stage.title}
                </h3>

                <span data-stage-el className="mt-6 block h-px w-16 bg-[var(--color-red)]" />

                <p data-stage-el className="mt-6 max-w-[42ch] text-lead text-[var(--fg-muted)]">
                  {stage.body}
                </p>

                <p
                  data-stage-el
                  className="mt-8 font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.18em] text-[var(--fg-subtle)]"
                >
                  {stage.detail}
                </p>
              </div>
            </li>
          ))}
        </ol>

        {/* --- progress rail (desktop only: it tracks the pinned scrub) --- */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 hidden items-center gap-6 px-(--spacing-gutter) pb-10 lg:flex"
        >
          <span className="font-[family-name:var(--font-mono)] text-[10px] tabular-nums tracking-[0.2em] text-[var(--fg)]">
            {journey[active].index}
          </span>
          <span className="relative block h-px flex-1 bg-[var(--line-strong)]">
            <span ref={bar} className="absolute inset-0 block origin-left scale-x-0 bg-[var(--color-red)]" />
          </span>
          <span className="font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.2em] text-[var(--fg-subtle)]">
            {journey[active].title}
          </span>
        </div>
      </div>

      <div className="h-[var(--spacing-section)]" />
    </section>
  );
}

/* -------------------------------------------------------------------------- */

/**
 * A small technical glyph that gains complexity as the journey progresses —
 * one filled bar per completed stage. Cheap, deterministic, and it gives each
 * panel a unique mark without ten bespoke illustrations.
 */
function StageMark({ index }: { index: number }) {
  return (
    <svg viewBox="0 0 44 12" aria-hidden className="h-3 w-11">
      {Array.from({ length: 10 }, (_, i) => (
        <rect
          key={i}
          x={i * 4.4}
          y={i <= index ? 0 : 4}
          width="2"
          height={i <= index ? 12 : 4}
          fill={i <= index ? 'var(--color-red)' : 'var(--line-strong)'}
        />
      ))}
    </svg>
  );
}
