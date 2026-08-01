'use client';

import { useRef, useState } from 'react';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import { useIsomorphicLayoutEffect } from '@/hooks/useIsomorphicLayoutEffect';
import { navLinks } from '@/lib/site';

/**
 * Right-edge scroll rail: a progress line plus the current section index.
 *
 * The line is driven by a scrub'd ScrollTrigger writing scaleY, so it's a
 * single composited transform for the whole page. The section label is React
 * state, but it only changes six times across the entire document.
 */
export function ScrollProgress() {
  const rail = useRef<HTMLSpanElement>(null);
  const [active, setActive] = useState(0);

  const root = useRef<HTMLDivElement>(null);

  useIsomorphicLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.to(rail.current, {
        scaleY: 1,
        ease: 'none',
        scrollTrigger: { start: 0, end: 'max', scrub: 0.4 },
      });

      // Hidden while the hero is on screen. The rail is a content-wayfinding
      // aid, and the hero is a black band in both themes — the page's dark
      // type would be invisible on it anyway.
      gsap.set(root.current, { autoAlpha: 0 });
      ScrollTrigger.create({
        trigger: '#hero',
        start: 'bottom 80%',
        onEnter: () => gsap.to(root.current, { autoAlpha: 1, duration: 0.5 }),
        onLeaveBack: () => gsap.to(root.current, { autoAlpha: 0, duration: 0.3 }),
      });

      // One trigger per section, reporting which is currently in the viewport's
      // middle band. `toggleActions` isn't used — we just read the callbacks.
      navLinks.forEach((link, i) => {
        const el = document.querySelector(link.href);
        if (!el) return;

        ScrollTrigger.create({
          trigger: el as HTMLElement,
          start: 'top 50%',
          end: 'bottom 50%',
          onToggle: (self) => self.isActive && setActive(i),
        });
      });
    });

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={root}
      aria-hidden
      className="pointer-events-none fixed right-6 top-1/2 z-[450] hidden -translate-y-1/2 flex-col items-center gap-4 xl:flex"
    >
      <span className="font-[family-name:var(--font-mono)] text-[10px] tabular-nums tracking-[0.2em] text-[var(--fg)]">
        {navLinks[active].index}
      </span>

      <span className="relative block h-40 w-px bg-[var(--line-strong)]">
        <span ref={rail} className="absolute inset-0 block origin-top scale-y-0 bg-[var(--color-red)]" />
      </span>

      {/* Vertical section label — sideways type is a Swiss-poster device and
          doubles as a wayfinding cue. */}
      <span
        className="font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.24em] text-[var(--fg-subtle)]"
        style={{ writingMode: 'vertical-rl' }}
      >
        {navLinks[active].label}
      </span>
    </div>
  );
}
