'use client';

/**
 * "The curtain is up" signal.
 *
 * The hero's intro must not play while the preloader is covering it, otherwise
 * the best animation on the site happens where nobody can see it. The preloader
 * calls `markReady()` as it lifts; hero elements subscribe with `onReady()`.
 *
 * The latched flag matters: a component that mounts *after* the event fired
 * (route re-entry, a lazily-hydrated island) would otherwise wait forever and
 * stay invisible.
 */

const FLAG = '__dgmReady';
export const READY_EVENT = 'dgm:ready';

type ReadyWindow = Window & { [FLAG]?: boolean };

export function markReady() {
  if (typeof window === 'undefined') return;
  (window as ReadyWindow)[FLAG] = true;
  window.dispatchEvent(new Event(READY_EVENT));
}

/**
 * Returns an unsubscribe function. Fires immediately if already ready.
 *
 * The fallback timer is not optional. Subscribers hide themselves and wait for
 * this signal, so anything that stops the preloader from finishing — a thrown
 * error in its timeline, a tab backgrounded before rAF ever ran — would leave
 * the hero permanently invisible. Failing open after 3s means the worst case is
 * a missed animation, never missing content.
 */
export function onReady(callback: () => void): () => void {
  if (typeof window === 'undefined') return () => {};

  if ((window as ReadyWindow)[FLAG]) {
    callback();
    return () => {};
  }

  let fired = false;
  const run = () => {
    if (fired) return;
    fired = true;
    callback();
  };

  const timer = window.setTimeout(run, 3000);
  window.addEventListener(READY_EVENT, run, { once: true });

  return () => {
    window.clearTimeout(timer);
    window.removeEventListener(READY_EVENT, run);
  };
}
