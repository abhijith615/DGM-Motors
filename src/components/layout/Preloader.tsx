'use client';

import { useRef, useState } from 'react';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import { useIsomorphicLayoutEffect } from '@/hooks/useIsomorphicLayoutEffect';
import { Logo } from '@/components/ui/Logo';
import { markReady } from '@/lib/ready';

/**
 * Entry curtain.
 *
 * Deliberately short (~1.6s worst case) and hard-capped — a preloader that
 * outlives the actual load is theatre that costs the user time. It exists to
 * hide layout settling and font swap, then gets out of the way.
 *
 * Scroll is locked while it's up so the hero animation always plays from the
 * top, and released the instant the curtain starts lifting.
 */
export function Preloader() {
  const root = useRef<HTMLDivElement>(null);
  const counter = useRef<HTMLSpanElement>(null);
  const barFill = useRef<HTMLSpanElement>(null);
  const [done, setDone] = useState(false);

  useIsomorphicLayoutEffect(() => {
    const el = root.current;
    if (!el) return;

    // Reduced motion: no curtain at all.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setDone(true);
      document.documentElement.dataset.loaded = 'true';
      markReady();
      return;
    }

    document.body.style.overflow = 'hidden';
    window.scrollTo(0, 0);

    const ctx = gsap.context(() => {
      const progress = { value: 0 };

      const tl = gsap.timeline({
        onComplete: () => {
          setDone(true);
          document.documentElement.dataset.loaded = 'true';
          // Layout has changed underneath every trigger created so far.
          ScrollTrigger.refresh();
        },
      });

      tl.to(progress, {
        value: 100,
        duration: 1.25,
        ease: 'power2.inOut',
        onUpdate: () => {
          const v = Math.round(progress.value);
          if (counter.current) counter.current.textContent = String(v).padStart(3, '0');
        },
      })
        .to(barFill.current, { scaleX: 1, duration: 1.25, ease: 'power2.inOut' }, 0)
        .to('[data-preloader-mark]', { autoAlpha: 1, duration: 0.6 }, 0.1)
        // Release scroll as the curtain begins to move, not after — the page is
        // already usable underneath.
        .add(() => {
          document.body.style.overflow = '';
        })
        .to('[data-preloader-inner]', { autoAlpha: 0, y: -20, duration: 0.5, ease: 'power2.in' }, '+=0.1')
        .to(el, { yPercent: -100, duration: 1, ease: 'expo.inOut' }, '-=0.2')
        // Start the hero intro while the curtain is still travelling. The
        // overlap is what makes the entry feel like one continuous move rather
        // than two animations queued back to back.
        .add(markReady, '-=0.75');
    }, root);

    return () => {
      document.body.style.overflow = '';
      ctx.revert();
    };
  }, []);

  if (done) return null;

  return (
    <div
      ref={root}
      // aria-hidden + no focusable content: screen readers go straight to the
      // page, which is already fully rendered behind this.
      aria-hidden
      className="fixed inset-0 z-[1000] flex flex-col items-center justify-center bg-[var(--bg)]"
    >
      <div data-preloader-inner className="flex w-full flex-col items-center gap-10 px-8">
        <div data-preloader-mark className="invisible">
          <Logo variant="stacked" width={200} className="h-24 w-auto md:h-32" priority />
        </div>

        <div className="flex w-full max-w-md items-center gap-5">
          <span className="h-px flex-1 overflow-hidden bg-[var(--line)]">
            <span ref={barFill} className="block h-px w-full origin-left scale-x-0 bg-[var(--color-red)]" />
          </span>
          <span
            ref={counter}
            className="font-[family-name:var(--font-mono)] text-[11px] tabular-nums tracking-[0.2em] text-[var(--fg-subtle)]"
          >
            000
          </span>
        </div>
      </div>
    </div>
  );
}
