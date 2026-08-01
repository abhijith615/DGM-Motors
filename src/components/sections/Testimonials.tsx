'use client';

import { useRef } from 'react';
import { gsap } from '@/lib/gsap';
import { useIsomorphicLayoutEffect } from '@/hooks/useIsomorphicLayoutEffect';
import { testimonials } from '@/lib/site';
import { SectionHeader } from '@/components/ui/SectionHeader';

/**
 * TESTIMONIALS — scroll-linked horizontal rail.
 *
 * Deliberately *not* an autoplaying carousel. The brief's motion rule is that
 * everything responds to scroll, and a rail that drifts only while the user
 * moves keeps them in control: no timer to race, nothing sliding away mid-read,
 * and no infinite animation burning a compositor thread off-screen.
 *
 * The whole rail is one transform driven by a single scrubbed tween.
 */
export function Testimonials() {
  const root = useRef<HTMLElement>(null);
  const rail = useRef<HTMLUListElement>(null);

  useIsomorphicLayoutEffect(() => {
    const el = root.current;
    const track = rail.current;
    if (!el || !track) return;

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      mm.add('(min-width: 768px) and (prefers-reduced-motion: no-preference)', () => {
        // Travel = however much the rail overflows, plus a margin so the last
        // card clears the right edge. Computed in a function for refresh-safety.
        const travel = () => Math.max(0, track.scrollWidth - window.innerWidth + 96);

        gsap.fromTo(
          track,
          { x: () => Math.min(120, travel() * 0.08) },
          {
            x: () => -travel(),
            ease: 'none',
            scrollTrigger: {
              trigger: el,
              start: 'top bottom',
              end: 'bottom top',
              scrub: 1,
              invalidateOnRefresh: true,
            },
          }
        );
      });

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.from('[data-quote]', {
          autoAlpha: 0,
          y: 40,
          duration: 1.1,
          stagger: 0.1,
          ease: 'expo.out',
          scrollTrigger: { trigger: el, start: 'top 78%', once: true },
        });
      });

      return () => mm.revert();
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={root}
      aria-labelledby="testimonials-heading"
      className="relative overflow-hidden border-t border-[var(--line)] bg-[var(--bg-raised)] py-[var(--spacing-section)]"
    >
      <div className="shell">
        <SectionHeader index="—" label="In Their Words" />
        <h2 id="testimonials-heading" className="sr-only">
          Customer testimonials
        </h2>
      </div>

      <ul
        ref={rail}
        className="mt-14 flex w-max gap-6 px-(--spacing-gutter) will-change-transform md:mt-20 md:gap-10"
      >
        {testimonials.map((testimonial) => (
          <li
            key={testimonial.id}
            data-quote
            className="flex w-[min(86vw,44rem)] shrink-0 flex-col justify-between border-t border-[var(--line-strong)] pt-8"
          >
            <blockquote>
              {/* Oversized opening mark set as a graphic element, not punctuation. */}
              <span aria-hidden className="t-display block text-6xl leading-none text-[var(--color-red)]">
                “
              </span>
              <p className="mt-4 text-[clamp(1.25rem,2.35vw,2.1rem)] font-medium leading-[1.3] tracking-[-0.02em] text-[var(--fg)]">
                {testimonial.quote}
              </p>
            </blockquote>

            <footer className="mt-10 flex items-center gap-4">
              <span className="h-px w-10 bg-[var(--color-red)]" />
              <span>
                <span className="block font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.18em] text-[var(--fg)]">
                  {testimonial.author}
                </span>
                <span className="mt-1 block font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.18em] text-[var(--fg-subtle)]">
                  {testimonial.role}
                </span>
              </span>
            </footer>
          </li>
        ))}
      </ul>
    </section>
  );
}
