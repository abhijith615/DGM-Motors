'use client';

import { useEffect, useRef } from 'react';

/**
 * Global scroll progress (0 → 1) exposed as a *ref*, deliberately not state.
 *
 * The WebGL scenes read this every frame. Routing it through React state would
 * re-render the tree ~60× a second and destroy the frame budget; a ref lets the
 * render loop sample it for free.
 */
export function useScrollProgressRef() {
  const progress = useRef(0);

  useEffect(() => {
    let frame = 0;

    const read = () => {
      frame = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      progress.current = max > 0 ? window.scrollY / max : 0;
    };

    const onScroll = () => {
      // rAF-coalesced: scroll events can fire faster than we can paint.
      if (!frame) frame = requestAnimationFrame(read);
    };

    read();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });

    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  return progress;
}
