'use client';

import { useRef } from 'react';
import { gsap } from '@/lib/gsap';
import { useIsomorphicLayoutEffect } from '@/hooks/useIsomorphicLayoutEffect';
import { cn, formatStat } from '@/lib/utils';

/**
 * Odometer-style counter that runs once when scrolled into view.
 *
 * Writes to textContent directly instead of React state — a 2.2s count at 60fps
 * is ~130 renders per counter, which on a row of five would be 650 renders for
 * a purely visual effect.
 *
 * `tabular-nums` is essential: without it the number's width jitters as digits
 * change and the whole row twitches.
 */
export function Counter({
  value,
  suffix = '',
  prefix = '',
  duration = 2.2,
  className,
  suffixClassName,
}: {
  value: number;
  suffix?: string;
  prefix?: string;
  duration?: number;
  className?: string;
  /** For word suffixes that would otherwise be as wide as the number itself. */
  suffixClassName?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);

  useIsomorphicLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const counter = { n: 0 };
        gsap.to(counter, {
          n: value,
          duration,
          ease: 'power3.out',
          onUpdate: () => {
            el.textContent = formatStat(Math.round(counter.n));
          },
          scrollTrigger: { trigger: el, start: 'top 88%', once: true },
        });
      });

      // Reduced motion: the final number is already in the markup, do nothing.
      return () => mm.revert();
    }, ref);

    return () => ctx.revert();
  }, [value, duration]);

  return (
    <span className={cn('tabular-nums', className)}>
      {prefix}
      {/* Server-renders the final value so it's correct with JS off and for
          crawlers; the tween overwrites it from 0 on the client. */}
      <span ref={ref}>{formatStat(value)}</span>
      {/* --accent-text, not --color-red. These counters sit on the brand-gray
          band in section 01, where vivid red is 1.86:1 — below even the 3:1
          large-text floor. --accent-text is the palette's legible red for both
          themes (4.6:1 on gray, 11:1 on white, 5.6:1 on the dark ground). */}
      {suffix && <span className={cn('text-[var(--accent-text)]', suffixClassName)}>{suffix}</span>}
    </span>
  );
}
