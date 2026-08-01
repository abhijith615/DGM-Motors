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
}: {
  value: number;
  suffix?: string;
  prefix?: string;
  duration?: number;
  className?: string;
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
      {suffix && <span className="text-[var(--color-red)]">{suffix}</span>}
    </span>
  );
}
