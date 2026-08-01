import clsx, { type ClassValue } from 'clsx';

export const cn = (...inputs: ClassValue[]) => clsx(inputs);

export const clamp = (v: number, min: number, max: number) => Math.min(Math.max(v, min), max);

/**
 * Deterministic PRNG. Generated artwork (gallery plates, particle fields) must
 * produce identical output on server and client or React will scream about a
 * hydration mismatch — so no Math.random anywhere in render.
 */
export const seededRandom = (seed: number) => {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
};

/** Formats large stat values with Indian-friendly grouping. */
export const formatStat = (n: number) => n.toLocaleString('en-IN');
