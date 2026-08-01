'use client';

import { createContext, useContext, useEffect, useRef, type ReactNode } from 'react';
import Lenis from 'lenis';
import { gsap, ScrollTrigger } from '@/lib/gsap';

const LenisContext = createContext<Lenis | null>(null);

/** Access the Lenis instance (e.g. to `scrollTo` a section from the nav). */
export const useLenis = () => useContext(LenisContext);

/**
 * Lenis ⟷ GSAP integration.
 *
 * The critical detail: Lenis must be driven BY GSAP's ticker rather than its
 * own RAF loop. Two independent loops means ScrollTrigger reads positions that
 * Lenis has already moved past, which shows up as pinned sections juddering by
 * a frame. One loop, one source of truth.
 */
export function SmoothScrollProvider({ children }: { children: ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    // Users who asked for less motion get native scrolling — smooth scrolling
    // is itself motion they didn't ask for, and it hijacks their input.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const lenis = new Lenis({
      duration: 1.15,
      // Exponential ease-out: fast pickup, long settle. This curve is most of
      // what people perceive as "expensive" scrolling.
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      // Never smooth touch — it fights the platform's own momentum and is the
      // single most common cause of "this site feels broken on mobile".
      syncTouch: false,
      touchMultiplier: 1.6,
      wheelMultiplier: 1,
    });

    lenisRef.current = lenis;

    // Keep ScrollTrigger's cached positions in sync with Lenis' virtual scroll.
    lenis.on('scroll', ScrollTrigger.update);

    const raf = (time: number) => lenis.raf(time * 1000); // GSAP ticks in seconds
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0); // don't let GSAP "catch up" and skip frames

    return () => {
      gsap.ticker.remove(raf);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  return <LenisContext.Provider value={lenisRef.current}>{children}</LenisContext.Provider>;
}
