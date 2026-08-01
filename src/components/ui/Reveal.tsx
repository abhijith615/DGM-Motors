'use client';

import { useRef, type ElementType, type ReactNode } from 'react';
import { gsap } from '@/lib/gsap';
import { useIsomorphicLayoutEffect } from '@/hooks/useIsomorphicLayoutEffect';
import { cn } from '@/lib/utils';

type Variant = 'rise' | 'clip' | 'fade' | 'scale';

/**
 * Generic scroll reveal for anything that isn't text.
 *
 * `clip` is the house variant — a clip-path wipe reads as a machined edge
 * passing over the element rather than a fade, which is what keeps the site
 * feeling engineered rather than soft.
 */
export function Reveal({
  children,
  variant = 'rise',
  delay = 0,
  duration = 1.2,
  stagger = 0,
  start = 'top 88%',
  className,
  as = 'div',
}: {
  children: ReactNode;
  variant?: Variant;
  delay?: number;
  duration?: number;
  /** When > 0, direct children are staggered instead of the wrapper animating. */
  stagger?: number;
  start?: string;
  className?: string;
  as?: ElementType;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useIsomorphicLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const targets = stagger > 0 ? Array.from(el.children) : el;

        const from: gsap.TweenVars = {
          rise: { y: 56, autoAlpha: 0 },
          clip: { clipPath: 'inset(0 0 100% 0)', y: 28 },
          fade: { autoAlpha: 0 },
          scale: { scale: 1.08, autoAlpha: 0 },
        }[variant];

        const to: gsap.TweenVars = {
          rise: { y: 0, autoAlpha: 1 },
          clip: { clipPath: 'inset(0 0 0% 0)', y: 0 },
          fade: { autoAlpha: 1 },
          scale: { scale: 1, autoAlpha: 1 },
        }[variant];

        gsap.fromTo(targets, from, {
          ...to,
          duration,
          delay,
          stagger,
          ease: 'expo.out',
          scrollTrigger: { trigger: el, start, once: true },
        });
      });

      return () => mm.revert();
    }, ref);

    return () => ctx.revert();
  }, [variant, delay, duration, stagger, start]);

  // Cast to a concrete intrinsic element so ref/className typecheck; the
  // runtime value is whatever `as` was given.
  const Component = as as 'div';

  return (
    <Component ref={ref} data-reveal="" className={cn(className)}>
      {children}
    </Component>
  );
}
