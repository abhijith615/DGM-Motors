'use client';

import { useRef, type ReactNode } from 'react';
import { gsap } from '@/lib/gsap';
import { cn } from '@/lib/utils';

/**
 * Magnetic attraction wrapper.
 *
 * While the pointer is inside an invisible padded field around the child, the
 * child is pulled toward it — and the inner content is pulled *further*, which
 * produces a subtle parallax between a button's body and its label. Release
 * returns on an elastic spring rather than a linear ease, so it settles like a
 * physical object.
 */
export function Magnetic({
  children,
  strength = 0.35,
  innerStrength = 0.18,
  className,
}: {
  children: ReactNode;
  /** How far the body follows the pointer, as a fraction of the offset. */
  strength?: number;
  /** Extra pull applied to the inner content, for internal parallax. */
  innerStrength?: number;
  className?: string;
}) {
  // Always a span: valid inside block *and* inline contexts, so this never
  // produces invalid nesting wherever it's dropped.
  const root = useRef<HTMLSpanElement>(null);
  const inner = useRef<HTMLSpanElement>(null);

  const onMove = (e: React.PointerEvent) => {
    const el = root.current;
    const innerEl = inner.current;
    if (!el || !innerEl) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    // Coarse pointers "hover" only by tapping — magnetism there is just jitter.
    if (e.pointerType !== 'mouse') return;

    const rect = el.getBoundingClientRect();
    const offsetX = e.clientX - (rect.left + rect.width / 2);
    const offsetY = e.clientY - (rect.top + rect.height / 2);

    gsap.to(el, { x: offsetX * strength, y: offsetY * strength, duration: 0.9, ease: 'power3.out' });
    gsap.to(innerEl, { x: offsetX * innerStrength, y: offsetY * innerStrength, duration: 1.1, ease: 'power3.out' });
  };

  const onLeave = () => {
    const el = root.current;
    const innerEl = inner.current;
    if (!el || !innerEl) return;
    gsap.to([el, innerEl], { x: 0, y: 0, duration: 1.2, ease: 'elastic.out(1, 0.35)' });
  };

  return (
    <span
      ref={root}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      className={cn('inline-block will-change-transform', className)}
    >
      <span ref={inner} className="block will-change-transform">
        {children}
      </span>
    </span>
  );
}
