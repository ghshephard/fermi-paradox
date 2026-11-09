import { runMonteCarlo, type MonteCarloSummary, type PaperParams } from '../model/drake';

export interface MonteCarloRequest {
  id: number;
  params: PaperParams;
  samples: number;
  seed: number;
}

export interface MonteCarloResponse {
  id: number;
  summary: MonteCarloSummary;
}

const ctx = self as unknown as Worker;

ctx.onmessage = (e: MessageEvent<MonteCarloRequest>) => {
  const { id, params, samples, seed } = e.data;
  const response: MonteCarloResponse = { id, summary: runMonteCarlo(params, samples, seed) };
  ctx.postMessage(response);
};
