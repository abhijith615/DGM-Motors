'use client';

import { useCallback, useRef, useState } from 'react';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import { useIsomorphicLayoutEffect } from '@/hooks/useIsomorphicLayoutEffect';
import { useTheme } from '@/components/providers/ThemeProvider';
import { navLinks, site, whatsappUrl } from '@/lib/site';
import { cn } from '@/lib/utils';
import { Logo } from '@/components/ui/Logo';
import { Magnetic } from '@/components/ui/Magnetic';

export function Nav() {
  const bar = useRef<HTMLElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const { theme, toggle } = useTheme();

  /* --- show / hide on scroll direction ---------------------------------- */

  useIsomorphicLayoutEffect(() => {
    const el = bar.current;
    if (!el) return;

    // `data-stuck` is LEGIBILITY-CRITICAL, not decoration: unstuck the bar is
    // .on-dark (light type for the black hero), stuck it rejoins the page
    // theme (ink type on a gray bar). If it ever failed to flip, the links
    // would render #A6A6A6 on the #A6A6A6 page — a 1:1 contrast ratio.
    //
    // So it runs off a plain passive scroll listener rather than a
    // ScrollTrigger callback. ScrollTrigger is excellent, but it depends on the
    // GSAP ticker and the Lenis proxy both running; this needs to be true even
    // if animation never ticks at all.
    const setStuck = () => {
      el.dataset.stuck = window.scrollY > 120 ? 'true' : 'false';
    };

    setStuck();
    window.addEventListener('scroll', setStuck, { passive: true });

    const ctx = gsap.context(() => {
      // Decorative only: slide away when scrolling down, return when scrolling
      // up — the reading position is never obstructed but the nav is always one
      // gesture away. Safe to lose.
      const show = gsap.quickTo(el, 'yPercent', { duration: 0.5, ease: 'expo.out' });

      ScrollTrigger.create({
        start: 'top -120',
        end: 99999,
        onUpdate: (self) => {
          show(self.direction === 1 && self.scroll() > 300 ? -110 : 0);
        },
      });
    }, bar);

    return () => {
      window.removeEventListener('scroll', setStuck);
      ctx.revert();
    };
  }, []);

  /* --- mobile panel ------------------------------------------------------ */

  useIsomorphicLayoutEffect(() => {
    const el = panel.current;
    if (!el) return;

    const items = el.querySelectorAll('[data-menu-item]');

    // Division of labour, deliberately:
    //   · the panel's CLIP, pointer-events, inert and aria state are pure CSS
    //     driven by React state (see className below) — so the menu opens and
    //     closes correctly even if GSAP never ticks
    //   · GSAP only staggers the items in, which is polish
    // Everything load-bearing therefore survives an animation failure, and
    // nothing depends on an onComplete callback that an interrupted tween
    // would never fire.
    document.body.style.overflow = open ? 'hidden' : '';

    if (open) {
      gsap.fromTo(
        items,
        { yPercent: 110, autoAlpha: 0 },
        { yPercent: 0, autoAlpha: 1, duration: 0.7, stagger: 0.05, ease: 'expo.out', delay: 0.15, overwrite: true }
      );
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  /* --- close on Escape ---------------------------------------------------- */

  useIsomorphicLayoutEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  /* --- anchor navigation -------------------------------------------------- */

  const goTo = useCallback((href: string) => {
    setOpen(false);
    const target = document.querySelector(href);
    if (!target) return;

    gsap.to(window, {
      duration: 1.5,
      ease: 'expo.inOut',
      scrollTo: { y: target as HTMLElement, offsetY: 0, autoKill: true },
    });
  }, []);

  /* ----------------------------------------------------------------------- */

  return (
    <>
      {/* Bypass block — first stop for keyboard users, visually hidden until focused. */}
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-6 focus:top-6 focus:z-[1000] focus:rounded-full focus:bg-[var(--color-red)] focus:px-6 focus:py-3 focus:font-[family-name:var(--font-mono)] focus:text-[11px] focus:uppercase focus:tracking-[0.2em] focus:text-white"
      >
        Skip to content
      </a>

      {/*
        `on-dark` while the bar is over the hero, dropped once it sticks.

        The hero is a black photographic band in BOTH themes, but the rest of
        the page is brand gray — so a nav that simply used --fg would be dark
        type on a dark hero at the top of every visit. Toggling the class swaps
        the whole token set for the subtree instead of colouring each child
        twice, and the colour transition rides the existing background fade.
      */}
      <header
        ref={bar}
        data-stuck="false"
        // --bg-blur is 92% opaque: the stuck bar can sit over the black hero,
        // the brand gray or a white band while the type inside it is ink, and a
        // nearly opaque ground makes that one contrast ratio instead of three.
        className="group/nav nav-bar on-dark fixed inset-x-0 top-0 z-[500] transition-colors duration-500 data-[stuck=true]:bg-[var(--bg-blur)] data-[stuck=true]:backdrop-blur-xl"
      >
        <div className="h-px w-full bg-[var(--line)] opacity-0 transition-opacity duration-500 group-data-[stuck=true]/nav:opacity-100" />

        <div className="shell flex items-center justify-between py-5 md:py-6">
          <a
            href="#hero"
            onClick={(e) => {
              e.preventDefault();
              goTo('#hero');
            }}
            data-cursor="link"
            aria-label={`${site.name} — home`}
            className="relative z-10 block"
          >
            <Logo priority width={260} className="h-7 w-auto md:h-8" />
          </a>

          {/* --- desktop links --- */}
          <nav aria-label="Primary" className="hidden items-center gap-1 lg:flex">
            {navLinks.map((link) => (
              <Magnetic key={link.href} strength={0.2} innerStrength={0.1}>
                <a
                  href={link.href}
                  onClick={(e) => {
                    e.preventDefault();
                    goTo(link.href);
                  }}
                  data-cursor="link"
                  className="group/link relative block overflow-hidden px-4 py-2 font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.18em] text-[var(--fg-muted)] transition-colors hover:text-[var(--fg)]"
                >
                  {/* Two stacked copies: the label rolls up and its clone rolls
                      in from below. Cheaper and crisper than a crossfade. */}
                  <span className="mask-line">
                    <span className="block transition-transform duration-500 [transition-timing-function:var(--ease-out-expo)] group-hover/link:-translate-y-full">
                      {link.label}
                    </span>
                  </span>
                  <span aria-hidden className="mask-line absolute inset-x-4 top-2">
                    <span className="block translate-y-full text-[var(--fg)] transition-transform duration-500 [transition-timing-function:var(--ease-out-expo)] group-hover/link:translate-y-0">
                      {link.label}
                    </span>
                  </span>
                </a>
              </Magnetic>
            ))}
          </nav>

          <div className="flex items-center gap-2 md:gap-3">
            <ThemeToggle theme={theme} onToggle={toggle} />

            <Magnetic strength={0.25} innerStrength={0.12} className="hidden sm:block">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                data-cursor="link"
                className="flex items-center gap-2.5 rounded-[var(--radius-pill)] border border-[var(--line-strong)] px-5 py-2.5 font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.18em] text-[var(--fg)] transition-colors hover:border-[var(--color-red)] hover:text-[var(--accent-text)]"
              >
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--color-red)] opacity-75" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[var(--color-red)]" />
                </span>
                24/7 Recovery
              </a>
            </Magnetic>

            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? 'Close menu' : 'Open menu'}
              data-cursor="link"
              className="relative z-[600] grid h-11 w-11 place-items-center rounded-full border border-[var(--line-strong)] lg:hidden"
            >
              <span className="relative block h-3 w-4">
                <span
                  className={cn(
                    'absolute left-0 block h-px w-full bg-[var(--fg)] transition-all duration-[400ms] [transition-timing-function:var(--ease-out-expo)]',
                    open ? 'top-1.5 rotate-45' : 'top-0'
                  )}
                />
                <span
                  className={cn(
                    'absolute left-0 block h-px w-full bg-[var(--fg)] transition-all duration-[400ms] [transition-timing-function:var(--ease-out-expo)]',
                    open ? 'top-1.5 -rotate-45' : 'top-3'
                  )}
                />
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* --- mobile / tablet menu --- */}
      <div
        id="mobile-menu"
        ref={panel}
        // `inert` takes the whole panel out of the tab order AND the
        // accessibility tree while closed — the one attribute that makes an
        // off-screen menu genuinely closed rather than merely invisible.
        inert={!open}
        aria-hidden={!open}
        className={cn(
          'fixed inset-0 z-[550] flex flex-col justify-center bg-[var(--bg)] transition-[clip-path] duration-[800ms] [transition-timing-function:var(--ease-in-out-quint)] lg:hidden',
          open
            ? 'pointer-events-auto [clip-path:inset(0_0_0%_0)]'
            : 'pointer-events-none [clip-path:inset(0_0_100%_0)]'
        )}
      >
        <div className="shell">
          <p className="t-meta mb-10">Navigation</p>
          <ul className="space-y-1">
            {navLinks.map((link) => (
              <li key={link.href} className="overflow-hidden">
                <a
                  data-menu-item
                  href={link.href}
                  onClick={(e) => {
                    e.preventDefault();
                    goTo(link.href);
                  }}
                  className="group/m flex items-baseline gap-5 py-2"
                >
                  <span className="font-[family-name:var(--font-mono)] text-[10px] tracking-[0.2em] text-[var(--fg-subtle)]">
                    {link.index}
                  </span>
                  <span className="t-display text-[clamp(2.25rem,11vw,4rem)] leading-[0.95] tracking-[-0.03em] transition-colors group-hover/m:text-[var(--accent-text)]">
                    {link.label}
                  </span>
                </a>
              </li>
            ))}
          </ul>

          <div className="mt-14 flex flex-col gap-2 border-t border-[var(--line)] pt-8">
            <a href={`tel:${site.contact.phone.tel}`} className="t-display text-xl tracking-tight">
              {site.contact.phone.label}
            </a>
            <a href={`mailto:${site.contact.email}`} className="text-sm text-[var(--fg-muted)]">
              {site.contact.email}
            </a>
            <p className="t-meta mt-4">{site.contact.emergency}</p>
          </div>
        </div>
      </div>
    </>
  );
}

/* -------------------------------------------------------------------------- */

function ThemeToggle({ theme, onToggle }: { theme: 'dark' | 'light'; onToggle: () => void }) {
  return (
    <Magnetic strength={0.3} innerStrength={0.15}>
      <button
        type="button"
        onClick={onToggle}
        data-cursor="link"
        aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
        className="grid h-11 w-11 place-items-center rounded-full border border-[var(--line-strong)] text-[var(--fg-muted)] transition-colors hover:border-[var(--color-red)] hover:text-[var(--fg)]"
      >
        {/* A single glyph that rotates between states rather than swapping icons —
            avoids a layout flash and reads as one object turning over. */}
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden>
          <circle
            cx="12"
            cy="12"
            r="6"
            stroke="currentColor"
            strokeWidth="1.5"
            className="origin-center transition-transform duration-700 [transition-timing-function:var(--ease-out-expo)]"
            style={{ transform: theme === 'dark' ? 'scale(0.72)' : 'scale(1)' }}
          />
          <path
            d="M12 1.5v3M12 19.5v3M22.5 12h-3M4.5 12h-3M19.4 4.6l-2.1 2.1M6.7 17.3l-2.1 2.1M19.4 19.4l-2.1-2.1M6.7 6.7 4.6 4.6"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            className="origin-center transition-all duration-700 [transition-timing-function:var(--ease-out-expo)]"
            style={{
              opacity: theme === 'light' ? 1 : 0,
              transform: theme === 'light' ? 'rotate(0deg)' : 'rotate(-90deg) scale(0.5)',
            }}
          />
        </svg>
      </button>
    </Magnetic>
  );
}
