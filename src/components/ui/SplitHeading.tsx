'use client';

import { createElement, useRef, type ReactNode } from 'react';
import { gsap, ScrollTrigger, SplitText } from '@/lib/gsap';
import { useIsomorphicLayoutEffect } from '@/hooks/useIsomorphicLayoutEffect';
import { cn } from '@/lib/utils';

type Mode = 'chars' | 'lines' | 'words';

/**
 * Scroll-triggered text reveal built on GSAP SplitText.
 *
 * Three things make this production-safe rather than demo-safe:
 *
 *  1. It waits for `document.fonts.ready`. Splitting before the webfont lands
 *     measures fallback metrics, so lines break in the wrong places and the
 *     mask clips mid-glyph.
 *  2. `autoSplit` re-splits on resize and re-runs `onSplit`, so line masks stay
 *     correct through orientation changes without a manual resize listener.
 *  3. `aria: 'auto'` puts the original string on the parent as an aria-label and
 *     hides the fragments — screen readers hear one sentence, not 40 letters.
 *
 * Reduced motion is handled by gsap.matchMedia: no split happens at all, so the
 * text is simply present.
 */
export function SplitHeading({
  children,
  as = 'h2',
  mode = 'lines',
  className,
  delay = 0,
  stagger,
  start = 'top 85%',
  once = true,
  id,
}: {
  children: ReactNode;
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'div' | 'span';
  /** Needed when a section labels itself with `aria-labelledby`. */
  id?: string;
  /** `chars` for hero-scale drama, `lines` for editorial copy. */
  mode?: Mode;
  className?: string;
  delay?: number;
  stagger?: number;
  /** ScrollTrigger start position. */
  start?: string;
  once?: boolean;
}) {
  const ref = useRef<HTMLElement>(null);

  useIsomorphicLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        let split: SplitText | undefined;
        let cancelled = false;

        // Hide up front so there is no flash of unmasked text between paint
        // and font-load. The `visibility` (not opacity) keeps layout stable.
        gsap.set(el, { autoAlpha: 0 });

        document.fonts.ready.then(() => {
          if (cancelled) return;
          gsap.set(el, { autoAlpha: 1 });

          split = SplitText.create(el, {
            type: mode === 'chars' ? 'lines,chars' : mode === 'words' ? 'lines,words' : 'lines',
            // Wraps each line in its own overflow:hidden box — the clip that
            // makes text look like it rises out of the page.
            mask: 'lines',
            autoSplit: true,
            aria: 'auto',
            linesClass: 'split-line',
            onSplit: (self) => {
              const targets = mode === 'chars' ? self.chars : mode === 'words' ? self.words : self.lines;

              return gsap.from(targets, {
                yPercent: 118,
                // A touch of rotation stops the rise from reading as a flat
                // slide; it's below conscious notice but reads as craft.
                rotate: mode === 'chars' ? 4 : 2,
                duration: mode === 'chars' ? 1.15 : 1.3,
                ease: 'expo.out',
                stagger: stagger ?? (mode === 'chars' ? 0.022 : 0.09),
                delay,
                scrollTrigger: {
                  trigger: el,
                  start,
                  once,
                  // ScrollTrigger must re-measure after a re-split changes height.
                  invalidateOnRefresh: true,
                },
              });
            },
          });

          ScrollTrigger.refresh();
        });

        return () => {
          cancelled = true;
          split?.revert();
        };
      });

      // Preference is "reduce" — leave the DOM completely untouched.
      mm.add('(prefers-reduced-motion: reduce)', () => {
        gsap.set(el, { autoAlpha: 1 });
      });

      return () => mm.revert();
    }, ref);

    return () => ctx.revert();
  }, [mode, delay, stagger, start, once]);

  return createElement(as, { ref, id, className: cn(className), 'data-split': '' }, children);
}
