'use client';

import { Reveal } from './Reveal';
import { cn } from '@/lib/utils';

/**
 * The repeating section marker: index number, hairline rule, label.
 *
 * Used at the top of every section so the page reads as a numbered technical
 * document. The rule draws itself in on entry, which is the site's quietest and
 * most-repeated motion signature.
 */
export function SectionHeader({
  index,
  label,
  align = 'left',
  className,
}: {
  index: string;
  label: string;
  align?: 'left' | 'between';
  className?: string;
}) {
  return (
    <Reveal variant="fade" duration={0.9}>
      <div
        className={cn(
          'flex items-center gap-5',
          align === 'between' && 'justify-between',
          className
        )}
      >
        <span className="font-[family-name:var(--font-mono)] text-[10px] tabular-nums tracking-[0.2em] text-[var(--accent-text)]">
          [{index}]
        </span>

        <span className="rule is-inview max-w-24 flex-1" />

        <span className="font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.22em] text-[var(--fg-subtle)]">
          {label}
        </span>
      </div>
    </Reveal>
  );
}
