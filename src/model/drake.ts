import { logNormalLog10, logUniformLog10, mulberry32 } from './distributions';

export type ParamKey = 'R' | 'fp' | 'ne' | 'fl' | 'fi' | 'fc' | 'L';
export type RangeKey = Exclude<ParamKey, 'fl'>;

/** [lo, hi] as base-10 logarithms. */
export type LogRange = [number, number];

export interface ParamInfo {
  key: ParamKey;
  symbol: { base: string; sub?: string };
  name: string;
  description: string;
  unit?: string;
  /** Slider domain as base-10 logarithms. */
  domain: LogRange;
  step: number;
}

export const PARAM_ORDER: ParamKey[] = ['R', 'fp', 'ne', 'fl', 'fi', 'fc', 'L'];
export const RANGE_KEYS: RangeKey[] = ['R', 'fp', 'ne', 'fi', 'fc', 'L'];

export const PARAMS: Record<ParamKey, ParamInfo> = {
  R: {
    key: 'R',
    symbol: { base: 'R', sub: '★' },
    name: 'Star formation rate',
    description: 'Average number of new stars formed in the Milky Way each year.',
    unit: 'stars / yr',
    domain: [-2, 3],
    step: 0.05,
  },
  fp: {
    key: 'fp',
    symbol: { base: 'f', sub: 'p' },
    name: 'Stars with planets',
    description: 'Fraction of those stars that host planetary systems.',
    domain: [-3, 0],
    step: 0.05,
  },
  ne: {
    key: 'ne',
    symbol: { base: 'n', sub: 'e' },
    name: 'Habitable planets per system',
    description:
      'Number of Earth-like (rocky, habitable-zone) planets per system that has planets.',
    domain: [-3, 1],
    step: 0.05,
  },
  fl: {
    key: 'fl',
    symbol: { base: 'f', sub: 'l' },
    name: 'Planets where life arises',
    description:
      'Fraction of habitable planets where life emerges. The paper models this physically as f_l = 1 − e^(−λVt): an abiogenesis rate λ acting on a volume V of prebiotic material for time t. Our uncertainty about λVt spans many orders of magnitude.',
    domain: [-60, 0],
    step: 0.1,
  },
  fi: {
    key: 'fi',
    symbol: { base: 'f', sub: 'i' },
    name: 'Life that becomes intelligent',
    description: 'Fraction of life-bearing planets that go on to develop intelligence.',
    domain: [-10, 0],
    step: 0.05,
  },
  fc: {
    key: 'fc',
    symbol: { base: 'f', sub: 'c' },
    name: 'Intelligence that becomes detectable',
    description:
      'Fraction of intelligent civilizations that develop technology releasing detectable signs of their existence.',
    domain: [-10, 0],
    step: 0.05,
  },
  L: {
    key: 'L',
    symbol: { base: 'L' },
    name: 'Detectable lifetime',
    description: 'How long such civilizations remain detectable.',
    unit: 'years',
    domain: [0, 11],
    step: 0.05,
  },
};

export interface Abiogenesis {
  /** log10 of the median of λVt (expected abiogenesis events per habitable planet). */
  medianLog10: number;
  /** Standard deviation of log10(λVt), in orders of magnitude. */
  sigmaDecades: number;
}

export const ABIOGENESIS_DOMAIN = {
  medianLog10: [-50, 10] as LogRange,
  sigmaDecades: [0, 100] as LogRange,
};

export interface PaperParams {
  ranges: Record<RangeKey, LogRange>;
  abiogenesis: Abiogenesis;
}

/** Point estimates, stored as base-10 logarithms. */
export type PointParams = Record<ParamKey, number>;

/** Table 1 of Sandberg, Drexler & Ord (2018), arXiv:1806.02404. */
export const PAPER_DEFAULTS: PaperParams = {
  ranges: {
    R: [0, 2],
    fp: [-1, 0],
    ne: [-1, 0],
    fi: [-3, 0],
    fc: [-2, 0],
    L: [2, 10],
  },
  abiogenesis: { medianLog10: 0, sigmaDecades: 50 },
};

/** Geometric midpoints of the paper's ranges; f_l uses the paper's median of 0.63. */
export const POINT_DEFAULTS: PointParams = {
  ...(Object.fromEntries(
    RANGE_KEYS.map((k) => {
      const [lo, hi] = PAPER_DEFAULTS.ranges[k];
      return [k, (lo + hi) / 2];
    }),
  ) as Record<RangeKey, number>),
  fl: log10Fl(PAPER_DEFAULTS.abiogenesis.medianLog10),
};

/** The paper treats N < 10^-10 per galaxy as being alone in the observable universe. */
export const UNIVERSE_THRESHOLD_LOG10 = -10;

/** log10 of f_l = 1 − e^(−λVt), given log10(λVt). */
export function log10Fl(log10Rate: number): number {
  // For tiny rates f_l ≈ λVt; computing 10^log10Rate directly would underflow.
  if (log10Rate < -8) return log10Rate;
  return Math.log10(-Math.expm1(-(10 ** log10Rate)));
}

export interface ClassicResult {
  log10N: number;
  n: number;
  pAtLeastOneOther: number;
  pAloneGalaxy: number;
  pAloneUniverse: number;
}

/** Point-estimate Drake equation with Poisson probabilities. */
export function classicResult(p: PointParams): ClassicResult {
  const log10N = PARAM_ORDER.reduce((sum, k) => sum + p[k], 0);
  const n = 10 ** log10N;
  const pAloneGalaxy = Math.exp(-n);
  return {
    log10N,
    n,
    pAtLeastOneOther: -Math.expm1(-n),
    pAloneGalaxy,
    pAloneUniverse: Math.exp(-(10 ** (log10N - UNIVERSE_THRESHOLD_LOG10))),
  };
}

export const HISTOGRAM = { min: -40, max: 15, binWidth: 0.5 };

export interface Histogram {
  min: number;
  binWidth: number;
  counts: number[];
  underflow: number;
  overflow: number;
}

export interface MonteCarloSummary {
  samples: number;
  pAloneGalaxy: number;
  pAloneUniverse: number;
  medianLog10N: number;
  meanN: number;
  histogram: Histogram;
}

export function runMonteCarlo(params: PaperParams, samples: number, seed: number): MonteCarloSummary {
  const rng = mulberry32(seed);
  const logs = new Float64Array(samples);
  const binCount = Math.round((HISTOGRAM.max - HISTOGRAM.min) / HISTOGRAM.binWidth);
  const counts = new Array<number>(binCount).fill(0);
  let underflow = 0;
  let overflow = 0;
  let aloneGalaxy = 0;
  let aloneUniverse = 0;
  let sumN = 0;
  const { medianLog10, sigmaDecades } = params.abiogenesis;

  for (let i = 0; i < samples; i++) {
    let s = 0;
    for (const k of RANGE_KEYS) {
      const [lo, hi] = params.ranges[k];
      s += logUniformLog10(rng, lo, hi);
    }
    s += log10Fl(logNormalLog10(rng, medianLog10, sigmaDecades));

    logs[i] = s;
    if (s < 0) aloneGalaxy++;
    if (s < UNIVERSE_THRESHOLD_LOG10) aloneUniverse++;
    sumN += 10 ** s;

    const bin = Math.floor((s - HISTOGRAM.min) / HISTOGRAM.binWidth);
    if (bin < 0) underflow++;
    else if (bin >= binCount) overflow++;
    else counts[bin]++;
  }

  logs.sort();
  return {
    samples,
    pAloneGalaxy: aloneGalaxy / samples,
    pAloneUniverse: aloneUniverse / samples,
    medianLog10N: logs[Math.floor(samples / 2)],
    meanN: sumN / samples,
    histogram: { min: HISTOGRAM.min, binWidth: HISTOGRAM.binWidth, counts, underflow, overflow },
  };
}
