'use client';

import { useEffect, useRef } from 'react';
import { gsap } from '@/lib/gsap';

/**
 * Premium magnetic cursor.
 *
 * Two bodies with different spring constants:
 *   · the DOT tracks the pointer almost exactly (fast, taut)
 *   · the RING lags behind on a softer spring and does the morphing
 * The delta between them is what reads as "weight" — a single element, however
 * well eased, always feels like a sticker following the mouse.
 *
 * Elements opt into behaviours declaratively:
 *   data-cursor="link"   → ring expands, dot collapses
 *   data-cursor="view"   → ring expands large and reveals its label
 *   data-cursor="drag"   → ring becomes a wide horizontal pill
 *   data-cursor-label    → text revealed inside the ring
 *
 * Everything is written straight to transforms via gsap.quickTo — no React
 * state in the pointer path, so this costs nothing per frame.
 */
export function Cursor() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    // Touch and coarse pointers keep the native cursor (there isn't one).
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const dotEl = dot.current;
    const ringEl = ring.current;
    const labelEl = label.current;
    if (!dotEl || !ringEl || !labelEl) return;

    document.documentElement.classList.add('has-custom-cursor');

    // quickTo keeps a single tween alive per property instead of allocating a
    // new one per mousemove — this is the difference between smooth and GC-y.
    const dotX = gsap.quickTo(dotEl, 'x', { duration: 0.16, ease: 'power3.out' });
    const dotY = gsap.quickTo(dotEl, 'y', { duration: 0.16, ease: 'power3.out' });
    const ringX = gsap.quickTo(ringEl, 'x', { duration: 0.55, ease: 'power3.out' });
    const ringY = gsap.quickTo(ringEl, 'y', { duration: 0.55, ease: 'power3.out' });

    let visible = false;

    const onMove = (e: PointerEvent) => {
      if (!visible) {
        visible = true;
        gsap.to([dotEl, ringEl], { autoAlpha: 1, duration: 0.3 });
        // Jump both bodies to the pointer so they don't fly in from 0,0.
        gsap.set([dotEl, ringEl], { x: e.clientX, y: e.clientY });
      }
      dotX(e.clientX);
      dotY(e.clientY);
      ringX(e.clientX);
      ringY(e.clientY);
    };

    /* --- state morphing ------------------------------------------------- */

    const setState = (state: string | null, text: string) => {
      const ringInner = ringEl.firstElementChild as HTMLElement;

      if (state === 'view') {
        labelEl.textContent = text;
        gsap.to(ringInner, { width: 88, height: 88, borderWidth: 0, backgroundColor: 'var(--color-red)', duration: 0.5 });
        gsap.to(labelEl, { autoAlpha: 1, y: 0, duration: 0.4, delay: 0.05 });
        gsap.to(dotEl, { scale: 0, duration: 0.3 });
      } else if (state === 'drag') {
        labelEl.textContent = text;
        gsap.to(ringInner, { width: 104, height: 44, borderWidth: 1, backgroundColor: 'transparent', duration: 0.5 });
        gsap.to(labelEl, { autoAlpha: 1, y: 0, duration: 0.4, delay: 0.05 });
        gsap.to(dotEl, { scale: 0, duration: 0.3 });
      } else if (state === 'link') {
        gsap.to(ringInner, { width: 56, height: 56, borderWidth: 1, backgroundColor: 'transparent', duration: 0.5 });
        gsap.to(labelEl, { autoAlpha: 0, y: 6, duration: 0.2 });
        gsap.to(dotEl, { scale: 0, duration: 0.3 });
      } else {
        gsap.to(ringInner, { width: 34, height: 34, borderWidth: 1, backgroundColor: 'transparent', duration: 0.5 });
        gsap.to(labelEl, { autoAlpha: 0, y: 6, duration: 0.2 });
        gsap.to(dotEl, { scale: 1, duration: 0.3 });
      }
    };

    const onOver = (e: PointerEvent) => {
      const target = (e.target as Element | null)?.closest?.('[data-cursor]') as HTMLElement | null;
      setState(target?.dataset.cursor ?? null, target?.dataset.cursorLabel ?? '');
    };

    // Pressing anywhere gives a small physical "click in".
    const onDown = () => gsap.to(ringEl, { scale: 0.82, duration: 0.2 });
    const onUp = () => gsap.to(ringEl, { scale: 1, duration: 0.45, ease: 'elastic.out(1, 0.5)' });
    const onLeave = () => {
      visible = false;
      gsap.to([dotEl, ringEl], { autoAlpha: 0, duration: 0.25 });
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerover', onOver, { passive: true });
    window.addEventListener('pointerdown', onDown);
    window.addEventListener('pointerup', onUp);
    document.addEventListener('pointerleave', onLeave);

    return () => {
      document.documentElement.classList.remove('has-custom-cursor');
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerover', onOver);
      window.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointerup', onUp);
      document.removeEventListener('pointerleave', onLeave);
    };
  }, []);

  return (
    // aria-hidden: this is pure decoration layered over a fully usable page.
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[9999] hidden md:block">
      <div
        ref={dot}
        className="invisible absolute left-0 top-0 -ml-[3px] -mt-[3px] h-[6px] w-[6px] rounded-full bg-[var(--color-red)]"
      />
      <div ref={ring} className="invisible absolute left-0 top-0 mix-blend-[var(--cursor-blend)]">
        {/* Inner body is what morphs. The -50% translate keeps it centred on
            the pointer no matter what size it animates to. */}
        <div className="grid -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-white/70 [block-size:34px] [inline-size:34px]">
          <span
            ref={label}
            className="invisible whitespace-nowrap font-[family-name:var(--font-mono)] text-[9px] uppercase tracking-[0.18em] text-white"
          />
        </div>
      </div>
    </div>
  );
}
