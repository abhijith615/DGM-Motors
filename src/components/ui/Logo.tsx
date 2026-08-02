import Image from 'next/image';
import { cn } from '@/lib/utils';
import { site } from '@/lib/site';

/**
 * The DGM Motors lockup.
 *
 * Uses the supplied artwork rather than a redrawn vector so the mark is exactly
 * on-brand. The source files are 2 MB masters; `next/image` resizes them to the
 * rendered size and serves AVIF/WebP, so the browser receives a few KB.
 *
 * `priority` on the nav instance only — it's above the fold and would otherwise
 * pop in after hydration.
 */
export function Logo({
  variant = 'horizontal',
  className,
  priority = false,
  width,
}: {
  variant?: 'horizontal' | 'stacked';
  className?: string;
  priority?: boolean;
  /** Intrinsic width hint passed to the optimiser. */
  width?: number;
}) {
  const horizontal = variant === 'horizontal';
  const w = width ?? (horizontal ? 300 : 220);

  return (
    <Image
      src={horizontal ? '/brand/logo-horizontal.png' : '/brand/logo-stacked.png'}
      alt={`${site.name} — ${site.tagline}`}
      width={w}
      height={Math.round(horizontal ? (w * 257) / 1000 : (w * 744) / 794)}
      priority={priority}
      // Decorative-adjacent but it *is* the company name, so it stays in the
      // accessibility tree with a real alt.
      //
      // No default h-*/w-* here: callers always set their own, and a base size
      // that merely *loses* a specificity race is worse than none at all.
      className={cn('select-none object-contain', className)}
      draggable={false}
    />
  );
}

