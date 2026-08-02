'use client';

import { testimonials, type Testimonial } from '@/lib/site';
import { SectionHeader } from '@/components/ui/SectionHeader';

/**
 * TESTIMONIALS — cards on a continuously scrolling rail.
 *
 * The rail is a pure CSS marquee: three copies of the set translated by exactly
 * one copy width, which loops seamlessly. No JS, no scroll listener, no layout
 * reads — it runs on the compositor and costs nothing per frame.
 *
 * Why three copies: with two (translate -50%) the loop only holds while a single
 * copy is at least as wide as the viewport. Four cards stop satisfying that
 * somewhere past 1850px and a gap opens on the right. Three copies moving
 * -33.3333% only needs copy-width ≥ viewport/2.
 *
 * Accessibility:
 *  · only the first copy is exposed; copies 2–3 are aria-hidden so a screen
 *    reader hears four quotes, not twelve
 *  · motion pauses on hover AND on keyboard focus-within, so it can be read
 *  · under prefers-reduced-motion the animation is dropped entirely and the
 *    rail becomes a normal horizontal scroll container the user drives
 */
export function Testimonials() {
  // Three copies. Only the first is real to assistive tech.
  const copies = [0, 1, 2];

  return (
    <section
      aria-labelledby="testimonials-heading"
      className="relative overflow-hidden border-t border-[var(--line)] bg-[var(--bg-raised)] py-[var(--spacing-section)]"
    >
      <div className="shell">
        <SectionHeader index="—" label="In Their Words" />
        <h2 id="testimonials-heading" className="sr-only">
          Customer testimonials
        </h2>
      </div>

      <div
        className="fade-x group mt-14 overflow-x-auto md:mt-20 [&::-webkit-scrollbar]:hidden [scrollbar-width:none] motion-reduce:overflow-x-auto"
        // Native horizontal scrolling is always available as a fallback; under
        // reduced motion it becomes the only way to move the rail.
        tabIndex={0}
        role="group"
        aria-label="Customer testimonials, scrollable"
      >
        <ul className="flex w-max animate-[dgm-marquee-third_60s_linear_infinite] gap-5 px-(--spacing-gutter) will-change-transform group-hover:[animation-play-state:paused] group-focus-within:[animation-play-state:paused] motion-reduce:animate-none md:gap-6">
          {copies.map((copy) =>
            testimonials.map((testimonial) => (
              <Card
                key={`${copy}-${testimonial.id}`}
                testimonial={testimonial}
                // Copies 2 and 3 exist only to make the loop seamless.
                duplicate={copy > 0}
              />
            ))
          )}
        </ul>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */

function Card({ testimonial, duplicate }: { testimonial: Testimonial; duplicate: boolean }) {
  return (
    <li
      {...(duplicate ? { 'aria-hidden': true } : {})}
      // Fixed width is load-bearing: the loop maths depends on every copy of the
      // set measuring the same, so cards must not flex.
      className="flex w-[min(84vw,25rem)] shrink-0 flex-col justify-between rounded-[var(--radius-card)] border border-[var(--line)] bg-[var(--color-gray-pale)] p-7 md:p-8"
    >
      <blockquote>
        {/* Oversized opening mark, set as a graphic element rather than punctuation. */}
        <span aria-hidden className="t-display block text-5xl leading-none text-[var(--color-red)]">
          &ldquo;
        </span>
        <p className="mt-3 text-[1.0625rem] leading-[1.5] text-[var(--fg)] md:text-lg">{testimonial.quote}</p>
      </blockquote>

      <footer className="mt-8 flex items-center gap-4 border-t border-[var(--line)] pt-5">
        <span className="h-px w-8 shrink-0 bg-[var(--color-red)]" />
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
  );
}
