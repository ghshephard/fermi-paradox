import { describe, expect, test } from 'bun:test';
import { logUniformLog10, mulberry32, standardNormal } from './distributions';
import {
  PAPER_DEFAULTS,
  POINT_DEFAULTS,
  classicResult,
  log10Fl,
  runMonteCarlo,
} from './drake';

describe('distributions', () => {
  test('seeded RNG is reproducible', () => {
    const a = mulberry32(42);
    const b = mulberry32(42);
    for (let i = 0; i < 10; i++) expect(a()).toBe(b());
  });

  test('log-uniform stays in range with the expected mean', () => {
    const rng = mulberry32(1);
    let sum = 0;
    for (let i = 0; i < 100_000; i++) {
      const v = logUniformLog10(rng, -3, 1);
      expect(v).toBeGreaterThanOrEqual(-3);
      expect(v).toBeLessThan(1);
      sum += v;
    }
    expect(sum / 100_000).toBeCloseTo(-1, 1);
  });

  test('standard normal has mean 0 and sd 1', () => {
    const rng = mulberry32(2);
    let sum = 0;
    let sumSq = 0;
    const n = 200_000;
    for (let i = 0; i < n; i++) {
      const z = standardNormal(rng);
      sum += z;
      sumSq += z * z;
    }
    expect(sum / n).toBeCloseTo(0, 1);
    expect(Math.sqrt(sumSq / n)).toBeCloseTo(1, 1);
  });
});

describe('drake model', () => {
  test('f_l = 1 - e^-λVt', () => {
    expect(log10Fl(0)).toBeCloseTo(Math.log10(1 - Math.exp(-1)), 10);
    expect(log10Fl(-20)).toBe(-20);
    expect(log10Fl(400)).toBe(0);
  });

  test('classic mode uses geometric midpoints', () => {
    const r = classicResult(POINT_DEFAULTS);
    expect(r.n).toBeGreaterThan(1000);
    expect(r.pAtLeastOneOther).toBeCloseTo(1, 6);
  });

  test('Monte Carlo with paper defaults reproduces the paper', () => {
    const s = runMonteCarlo(PAPER_DEFAULTS, 200_000, 1);
    // Paper: P(N<1) = 52%, P(N<1e-10) ≈ 38%, median 0.32, mean 27 million.
    expect(s.pAloneGalaxy).toBeGreaterThan(0.5);
    expect(s.pAloneGalaxy).toBeLessThan(0.54);
    expect(s.pAloneUniverse).toBeGreaterThan(0.36);
    expect(s.pAloneUniverse).toBeLessThan(0.4);
    expect(10 ** s.medianLog10N).toBeGreaterThan(0.2);
    expect(10 ** s.medianLog10N).toBeLessThan(0.5);
    expect(s.meanN).toBeGreaterThan(2.3e7);
    expect(s.meanN).toBeLessThan(3.2e7);
  });

  test('histogram accounts for every sample', () => {
    const s = runMonteCarlo(PAPER_DEFAULTS, 10_000, 3);
    const total = s.histogram.counts.reduce((a, b) => a + b, 0) + s.histogram.underflow + s.histogram.overflow;
    expect(total).toBe(10_000);
  });
});
