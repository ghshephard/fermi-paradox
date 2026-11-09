import { create } from 'zustand';
import {
  PAPER_DEFAULTS,
  POINT_DEFAULTS,
  type Abiogenesis,
  type LogRange,
  type MonteCarloSummary,
  type PaperParams,
  type ParamKey,
  type PointParams,
  type RangeKey,
} from './model/drake';

export type Mode = 'paper' | 'classic';

export const SAMPLES = 200_000;

interface State {
  mode: Mode;
  paper: PaperParams;
  point: PointParams;
  seed: number;
  summary: MonteCarloSummary | null;
  running: boolean;
  setMode(mode: Mode): void;
  setRange(key: RangeKey, range: LogRange): void;
  setAbiogenesis(patch: Partial<Abiogenesis>): void;
  setPoint(key: ParamKey, value: number): void;
  resetPaper(): void;
  resetPoint(): void;
  rerun(): void;
  setSummary(summary: MonteCarloSummary): void;
}

export const useStore = create<State>((set) => ({
  mode: 'paper',
  paper: PAPER_DEFAULTS,
  point: POINT_DEFAULTS,
  seed: 1,
  summary: null,
  running: false,
  setMode: (mode) => set({ mode }),
  setRange: (key, range) =>
    set((s) => ({ paper: { ...s.paper, ranges: { ...s.paper.ranges, [key]: range } } })),
  setAbiogenesis: (patch) =>
    set((s) => ({ paper: { ...s.paper, abiogenesis: { ...s.paper.abiogenesis, ...patch } } })),
  setPoint: (key, value) => set((s) => ({ point: { ...s.point, [key]: value } })),
  resetPaper: () => set({ paper: PAPER_DEFAULTS, seed: 1 }),
  resetPoint: () => set({ point: POINT_DEFAULTS }),
  rerun: () => set((s) => ({ seed: s.seed + 1 })),
  setSummary: (summary) => set({ summary, running: false }),
}));
