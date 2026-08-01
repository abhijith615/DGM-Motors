'use client';

/**
 * Single GSAP entry point. Every client component imports from here so plugins
 * are registered exactly once and never during SSR (ScrollTrigger touches
 * `document` at registration time).
 */

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
import { SplitText } from 'gsap/SplitText';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger, ScrollToPlugin, SplitText);

  // House defaults — every tween inherits the brand's motion character unless
  // it explicitly overrides. This is what makes the pacing feel consistent.
  gsap.defaults({ ease: 'expo.out', duration: 1.1 });

  // Sub-pixel transforms are what separate "smooth" from "almost smooth".
  gsap.config({ force3D: true, nullTargetWarn: false });

  ScrollTrigger.config({
    // Resize handling only — ignore the visual-viewport churn that mobile
    // browsers emit while the URL bar collapses, which otherwise causes a
    // full refresh mid-scroll.
    ignoreMobileResize: true,
  });
}

export { gsap, ScrollTrigger, ScrollToPlugin, SplitText };

/** The site's shared easing vocabulary, mirrored from globals.css. */
export const EASE = {
  out: 'expo.out',
  inOut: 'expo.inOut',
  quart: 'power4.out',
  soft: 'power2.out',
} as const;
