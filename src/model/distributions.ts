export type Rng = () => number;

/** Small, fast seeded PRNG (mulberry32) returning floats in [0, 1). */
export function mulberry32(seed: number): Rng {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function uniform(rng: Rng, lo: number, hi: number): number {
  return lo + (hi - lo) * rng();
}

/**
 * Draws from a log-uniform distribution between 10^lo and 10^hi and returns
 * the base-10 logarithm of the draw, so callers can stay in log space.
 */
export function logUniformLog10(rng: Rng, lo: number, hi: number): number {
  return uniform(rng, lo, hi);
}

/** Standard normal draw via the Box-Muller transform. */
export function standardNormal(rng: Rng): number {
  let u = 0;
  while (u === 0) u = rng();
  const v = rng();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

/**
 * Draws from a log-normal distribution and returns the base-10 logarithm of
 * the draw: log10(X) ~ Normal(medianLog10, sigmaDecades).
 */
export function logNormalLog10(rng: Rng, medianLog10: number, sigmaDecades: number): number {
  return medianLog10 + sigmaDecades * standardNormal(rng);
}
