'use client';

import { useCallback, useRef, useState } from 'react';
import { gsap } from '@/lib/gsap';
import { useIsomorphicLayoutEffect } from '@/hooks/useIsomorphicLayoutEffect';
import { plates } from '@/lib/site';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { SplitHeading } from '@/components/ui/SplitHeading';
import { Plate } from '@/components/gallery/Plate';
import { Lightbox } from '@/components/gallery/Lightbox';

/**
 * WORKSHOP — masonry gallery with layered parallax and a lightbox.
 *
 * Masonry is done with an explicit grid + row/col spans rather than CSS columns
 * so reading order stays left-to-right, top-to-bottom. CSS `columns` reflows
 * content vertically, which puts the DOM order at odds with the visual order
 * and makes keyboard tabbing jump around the screen.
 */
export function Workshop() {
  const root = useRef<HTMLElement>(null);
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  useIsomorphicLayoutEffect(() => {
    const el = root.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      // Parallax is desktop-only: on a phone the tiles are full-width and the
      // effect just costs battery for a few pixels of travel.
      mm.add('(min-width: 768px) and (prefers-reduced-motion: no-preference)', () => {
        gsap.utils.toArray<HTMLElement>('[data-tile]', el).forEach((tile, i) => {
          const inner = tile.querySelector('[data-tile-inner]');
          if (!inner) return;

          // Alternating depth: neighbouring tiles drift at different rates, so
          // the grid separates into planes instead of moving as one sheet.
          const depth = i % 3 === 0 ? 16 : i % 3 === 1 ? 9 : 13;

          gsap.fromTo(
            inner,
            { yPercent: -depth },
            {
              yPercent: depth,
              ease: 'none',
              scrollTrigger: { trigger: tile, start: 'top bottom', end: 'bottom top', scrub: true },
            }
          );
        });
      });

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.from('[data-tile]', {
          clipPath: 'inset(0 0 100% 0)',
          duration: 1.4,
          ease: 'expo.out',
          stagger: { each: 0.08, from: 'start' },
          scrollTrigger: { trigger: '[data-gallery]', start: 'top 84%', once: true },
        });
      });

      return () => mm.revert();
    }, root);

    return () => ctx.revert();
  }, []);

  const step = useCallback((delta: number) => {
    setOpenIndex((current) => {
      if (current === null) return current;
      // Wrap at both ends so the viewer never dead-ends.
      return (current + delta + plates.length) % plates.length;
    });
  }, []);

  return (
    <section
      ref={root}
      id="workshop"
      aria-labelledby="workshop-heading"
      className="relative border-t border-[var(--line)] bg-[var(--bg)] py-[var(--spacing-section)]"
    >
      <div className="shell">
        <SectionHeader index="05" label="Workshop Experience" />

        <div className="mt-10 flex flex-col justify-between gap-8 md:flex-row md:items-end">
          <SplitHeading as="h2" id="workshop-heading" mode="lines" className="t-display text-display max-w-[12ch] text-gradient-steel">
            Inside the
            <br />
            building.
          </SplitHeading>
          <p className="max-w-[36ch] text-lead text-[var(--fg-muted)] md:text-right">
            Parallel bays, a dedicated fabrication floor and a baked booth — the
            capacity behind the turnaround.
          </p>
        </div>
      </div>

      {/* Edge-to-edge: the gallery deliberately breaks the shell's max width. */}
      <div data-gallery className="mt-16 grid grid-cols-2 gap-2 px-2 md:mt-20 md:grid-cols-4 md:gap-3 md:px-3">
        {plates.map((plate, i) => (
          <button
            key={plate.id}
            type="button"
            data-tile
            data-cursor="view"
            data-cursor-label="View"
            onClick={() => setOpenIndex(i)}
            aria-label={`View image: ${plate.caption}`}
            className={[
              'group relative isolate overflow-hidden rounded-[var(--radius-panel)] bg-[var(--bg-panel)]',
              plate.span === 'tall' ? 'row-span-2 aspect-3/4 md:aspect-auto' : '',
              plate.span === 'wide' ? 'col-span-2 aspect-3/2' : '',
              plate.span === 'square' ? 'aspect-square' : '',
            ].join(' ')}
          >
            {/* Oversized so parallax travel never reveals an edge, and scaled
                further on hover for the zoom. */}
            <span
              data-tile-inner
              className="absolute inset-x-0 -inset-y-[18%] block transition-transform duration-[1.2s] [transition-timing-function:var(--ease-out-expo)] group-hover:scale-[1.06]"
            >
              <Plate plate={plate} sizes="(max-width: 768px) 50vw, 25vw" />
            </span>

            {/* Dim veil that lifts on hover. */}
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-black/25 opacity-100 transition-opacity duration-700 group-hover:opacity-0"
            />

            {/* Caption scrim. Deliberately heavier than it needs to be for the
                generated plates: it guarantees AA for the caption over ANY
                image dropped in later, including a bright paint-booth shot. */}
            <span className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 bg-linear-to-t from-black/92 via-black/55 to-transparent p-4 pt-12 text-left">
              <span className="translate-y-1 font-[family-name:var(--font-mono)] text-[9px] uppercase tracking-[0.16em] text-white/95 transition-transform duration-700 [transition-timing-function:var(--ease-out-expo)] group-hover:translate-y-0 md:text-[10px]">
                {plate.caption}
              </span>
              {/* --color-red-hot, not --accent-text: this label sits on the
                  image's black gradient in BOTH themes, so it must not follow
                  the theme. --accent-text resolves to the deep red in light
                  mode, which is 2:1 on black. */}
              <span className="hidden shrink-0 font-[family-name:var(--font-mono)] text-[9px] uppercase tracking-[0.16em] text-[var(--color-red-hot)] md:block">
                {plate.meta}
              </span>
            </span>
          </button>
        ))}
      </div>

      <Lightbox index={openIndex} onClose={() => setOpenIndex(null)} onStep={step} />
    </section>
  );
}
