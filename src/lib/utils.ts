import clsx, { type ClassValue } from 'clsx';

export const cn = (...inputs: ClassValue[]) => clsx(inputs);

/** Formats large stat values with Indian-friendly grouping. */
export const formatStat = (n: number) => n.toLocaleString('en-IN');
