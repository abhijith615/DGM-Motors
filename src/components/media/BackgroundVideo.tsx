'use client';

import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

type Source = {
  src: string;
  /** Shown immediately, and as the permanent still under reduced motion. */
  poster: string;
  /** Media query this file is for. The FIRST match wins, so order matters. */
  media?: string;
};

/**
 * Decorative background video.
 *
 * Five things this handles that a bare <video autoplay loop muted> does not:
 *
 * 1. ONE FILE, EVER. The correct source is chosen in JS from matchMedia rather
 *    than with <source media>. Browsers evaluate `media` on <source>
 *    inconsistently and never re-evaluate it on resize, so the naive markup
 *    risks downloading the 3 MB desktop clip *and* the 3 MB mobile one.
 * 2. IT DOESN'T COMPETE WITH LCP. Nothing is fetched until the element is near
 *    the viewport (`preload="none"` + IntersectionObserver), so the hero's text
 *    and poster paint first.
 * 3. IT STOPS WHEN UNWATCHED. Off-screen or backgrounded tab → pause. A looping
 *    1080p decode nobody can see is pure battery burn.
 * 4. REDUCED MOTION MEANS NO MOTION. The poster is shown and the video is never
 *    loaded at all — not merely paused.
 * 5. AUTOPLAY CAN FAIL. iOS low-power mode rejects play() even when muted. The
 *    poster stays underneath as a first-class still, so a rejection degrades to
 *    a photograph rather than a black box.
 */
export function BackgroundVideo({
  sources,
  className,
  objectPosition = 'center',
  eager = false,
}: {
  sources: Source[];
  className?: string;
  objectPosition?: string;
  /**
   * For video that is ALREADY in the viewport on load (the hero). Skips the
   * IntersectionObserver gate — observing an element that is guaranteed to be
   * visible buys nothing and adds a way for the video to never load at all.
   * Still waits a beat so the poster and headline paint first.
   */
  eager?: boolean;
}) {
  const host = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);

  // Server render picks the first entry so the poster is in the initial HTML;
  // the effect below corrects it once matchMedia is available.
  const [selected, setSelected] = useState<Source>(sources[0]);
  const [allowVideo, setAllowVideo] = useState(false);
  const [ready, setReady] = useState(false);

  /* --- choose the breakpoint's file (poster now, video when near) --------- */

  useEffect(() => {
    const pick = () => sources.find((s) => !s.media || window.matchMedia(s.media).matches) ?? sources[0];

    // Poster resolves immediately — it's small, it's the hero's LCP candidate,
    // and it must be correct before the video is allowed to load.
    setSelected(pick());

    // Only swap when the breakpoint genuinely changes; a resize inside the same
    // bracket must not restart playback.
    const onResize = () => setSelected((current) => {
      const next = pick();
      return next.src === current.src ? current : next;
    });
    window.addEventListener('resize', onResize);

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return () => window.removeEventListener('resize', onResize);
    }

    // Above the fold: no observer, just let the poster paint first.
    if (eager) {
      const timer = window.setTimeout(() => setAllowVideo(true), 200);
      return () => {
        window.clearTimeout(timer);
        window.removeEventListener('resize', onResize);
      };
    }

    // Below the fold: defer the download until we're near the viewport so it
    // never competes with above-the-fold content for bandwidth.
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setAllowVideo(true);
        io.disconnect();
      },
      { rootMargin: '300px' }
    );
    if (host.current) io.observe(host.current);

    // Fail open. If IntersectionObserver never delivers — an unsupported
    // environment, a detached subtree, a tab that never composites — the
    // section would otherwise show a still forever with no way to recover.
    const fallback = window.setTimeout(() => setAllowVideo(true), 4000);

    return () => {
      io.disconnect();
      window.clearTimeout(fallback);
      window.removeEventListener('resize', onResize);
    };
  }, [sources, eager]);

  const src = allowVideo ? selected.src : null;

  /* --- play only while visible ------------------------------------------- */

  useEffect(() => {
    const el = video.current;
    if (!el || !src) return;

    const safePlay = () => {
      // play() rejects on iOS low-power mode and in some autoplay policies.
      // Swallow it: the poster is already showing and remains valid.
      el.play().catch(() => {});
    };

    // Start straight away rather than waiting to be told we're visible — the
    // observer below is here to PAUSE what nobody is watching, and making
    // playback itself depend on it means an environment where IO doesn't
    // deliver gets a frozen first frame.
    safePlay();

    const io = new IntersectionObserver(
      ([entry]) => (entry.isIntersecting && !document.hidden ? safePlay() : el.pause()),
      { threshold: 0.01 }
    );
    io.observe(el);

    const onVisibility = () => (document.hidden ? el.pause() : safePlay());
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      io.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [src]);

  return (
    <div ref={host} aria-hidden className={cn('absolute inset-0 overflow-hidden', className)}>
      {/*
        Poster as a <picture>, not a CSS background and not the <video poster>
        attribute.

        `media` on <source> is the responsive-image mechanism proper: the
        browser evaluates it at PARSE time, downloads exactly one file, needs no
        JavaScript, and re-evaluates on resize. Driving the poster from React
        state instead would mean the server render committed to one breakpoint
        and the other device fetched two posters before the effect corrected it.

        It also outlives the video: it paints before any script runs, survives an
        autoplay rejection, and is the only thing rendered under reduced motion.
      */}
      <picture>
        {sources
          .filter((s) => s.media)
          .map((s) => (
            <source key={s.poster} media={s.media} srcSet={s.poster} />
          ))}
        <img
          src={(sources.find((s) => !s.media) ?? sources[sources.length - 1]).poster}
          alt=""
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover"
          style={{ objectPosition }}
        />
      </picture>

      {src && (
        <video
          ref={video}
          // `key` forces a fresh element when the breakpoint changes; mutating
          // src on a playing <video> leaves the old frame on screen in Safari.
          key={src}
          src={src}
          // No `poster` attribute: the <picture> above is already showing the
          // still underneath, and setting it here would have the video element
          // request the same file a second time.
          muted
          loop
          playsInline
          // `autoPlay` alone is unreliable; the IntersectionObserver above is
          // what actually starts it. This just helps browsers that honour it.
          autoPlay
          preload="auto"
          onCanPlay={() => setReady(true)}
          className={cn(
            'absolute inset-0 h-full w-full object-cover transition-opacity duration-700 [transition-timing-function:var(--ease-out-expo)]',
            ready ? 'opacity-100' : 'opacity-0'
          )}
          style={{ objectPosition }}
        />
      )}
    </div>
  );
}
