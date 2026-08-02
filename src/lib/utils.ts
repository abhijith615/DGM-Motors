import clsx, { type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Class combiner.
 *
 * `twMerge` is not optional here. clsx alone just concatenates, so a component
 * that sets a default and accepts an override ends up emitting BOTH — e.g.
 * `h-auto … h-7` or `inline-block … hidden`. Both land in the class attribute
 * with equal specificity, so the winner is whichever Tailwind happened to emit
 * later in the stylesheet, not the one the caller asked for.
 *
 * That silently broke two things at once: the nav logo rendered at its
 * intrinsic 148px (41% of a 360px screen) because `h-auto` beat `h-7`, and the
 * "24/7 Recovery" pill ignored `hidden sm:block` because `inline-block` beat
 * `hidden`. twMerge resolves conflicts by keeping the LAST one, which is what
 * every caller already assumed was happening.
 */
export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

/** Formats large stat values with Indian-friendly grouping. */
export const formatStat = (n: number) => n.toLocaleString('en-IN');
