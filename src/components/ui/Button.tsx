'use client';

import { useRef, type ReactNode } from 'react';
import { gsap } from '@/lib/gsap';
import { cn } from '@/lib/utils';
import { Magnetic } from './Magnetic';

type Variant = 'primary' | 'secondary' | 'ghost';

/**
 * The site's one button.
 *
 * Composed of three layers so hover, press and focus can each animate
 * independently without fighting:
 *   1. the shell (border, glass, magnetic transform)
 *   2. a fill that wipes up from the bottom edge on hover
 *   3. a ripple spawned at the exact pointer position on press
 *
 * Renders as <a> when `href` is given, <button> otherwise — never a div, so
 * keyboard and screen-reader behaviour is free.
 */
export function Button({
  children,
  href,
  onClick,
  variant = 'primary',
  className,
  type = 'button',
  disabled,
  ariaLabel,
}: {
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  variant?: Variant;
  className?: string;
  type?: 'button' | 'submit';
  disabled?: boolean;
  ariaLabel?: string;
}) {
  const shell = useRef<HTMLSpanElement>(null);
  const fill = useRef<HTMLSpanElement>(null);

  const spawnRipple = (e: React.PointerEvent<HTMLElement>) => {
    const el = shell.current;
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const rect = el.getBoundingClientRect();
    const ripple = document.createElement('span');
    // Big enough to always cover the far corner from wherever it was clicked.
    const size = Math.hypot(rect.width, rect.height) * 2;

    ripple.className = 'pointer-events-none absolute rounded-full';
    Object.assign(ripple.style, {
      width: `${size}px`,
      height: `${size}px`,
      left: `${e.clientX - rect.left - size / 2}px`,
      top: `${e.clientY - rect.top - size / 2}px`,
      background: variant === 'primary' ? 'rgba(255,255,255,0.28)' : 'rgba(232,30,38,0.3)',
    });

    el.appendChild(ripple);
    gsap.fromTo(
      ripple,
      { scale: 0, opacity: 1 },
      { scale: 1, opacity: 0, duration: 0.9, ease: 'power3.out', onComplete: () => ripple.remove() }
    );
  };

  const onEnter = () => {
    if (!fill.current) return;
    gsap.fromTo(fill.current, { yPercent: 101 }, { yPercent: 0, duration: 0.62, ease: 'expo.out' });
  };

  const onLeave = () => {
    if (!fill.current) return;
    gsap.to(fill.current, { yPercent: -101, duration: 0.5, ease: 'expo.out' });
  };

  const base =
    'group relative isolate inline-flex items-center justify-center gap-3 overflow-hidden rounded-[var(--radius-pill)] px-8 py-4 font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.2em] transition-colors duration-300 disabled:pointer-events-none disabled:opacity-40';

  const variants: Record<Variant, string> = {
    primary: 'bg-[var(--color-red)] text-white glow-red',
    secondary: 'border border-[var(--line-strong)] text-[var(--fg)] surface-glass hover:border-[var(--color-red)]',
    ghost: 'text-[var(--fg-muted)] hover:text-[var(--fg)]',
  };

  const fills: Record<Variant, string> = {
    primary: 'bg-[var(--color-red-hot)]',
    secondary: 'bg-[var(--color-red)]',
    ghost: 'bg-transparent',
  };

  const content = (
    <span ref={shell} className={cn(base, variants[variant], className)}>
      {/* Hover wipe — sits behind the label, above the background. */}
      <span ref={fill} aria-hidden className={cn('absolute inset-0 -z-10 translate-y-full', fills[variant])} />
      <span className="relative z-10 transition-colors duration-300 group-hover:text-white">{children}</span>
      {/* Directional cue that nudges forward on hover. */}
      <span
        aria-hidden
        className="relative z-10 block h-px w-5 origin-left bg-current transition-transform duration-500 [transition-timing-function:var(--ease-out-expo)] group-hover:scale-x-150"
      />
    </span>
  );

  const interaction = {
    onPointerDown: spawnRipple,
    onPointerEnter: onEnter,
    onPointerLeave: onLeave,
    'data-cursor': 'link' as const,
  };

  return (
    <Magnetic strength={0.28} innerStrength={0.14}>
      {href ? (
        <a href={href} aria-label={ariaLabel} onClick={onClick} {...interaction}>
          {content}
        </a>
      ) : (
        <button type={type} disabled={disabled} aria-label={ariaLabel} onClick={onClick} {...interaction}>
          {content}
        </button>
      )}
    </Magnetic>
  );
}
