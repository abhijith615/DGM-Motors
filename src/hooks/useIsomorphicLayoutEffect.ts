import { useEffect, useLayoutEffect } from 'react';

/**
 * useLayoutEffect that doesn't warn during SSR. GSAP setup must run before
 * paint (to avoid a flash of un-animated content), so layout effect is correct
 * on the client — but React logs a warning if it runs on the server.
 */
export const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;
