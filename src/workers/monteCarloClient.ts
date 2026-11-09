import type { MonteCarloSummary, PaperParams } from '../model/drake';
import type { MonteCarloRequest, MonteCarloResponse } from './monteCarlo.worker';

export interface MonteCarloRunner {
  request(params: PaperParams, samples: number, seed: number): void;
  dispose(): void;
}

/** Debounces requests while sliders move and drops responses superseded by newer requests. */
export function createMonteCarloRunner(
  onResult: (summary: MonteCarloSummary) => void,
  debounceMs = 120,
): MonteCarloRunner {
  const worker = new Worker(new URL('./monteCarlo.worker.ts', import.meta.url), { type: 'module' });
  let latestId = 0;
  let timer: ReturnType<typeof setTimeout> | undefined;

  worker.onmessage = (e: MessageEvent<MonteCarloResponse>) => {
    if (e.data.id === latestId) onResult(e.data.summary);
  };

  return {
    request(params, samples, seed) {
      clearTimeout(timer);
      timer = setTimeout(() => {
        const message: MonteCarloRequest = { id: ++latestId, params, samples, seed };
        worker.postMessage(message);
      }, debounceMs);
    },
    dispose() {
      clearTimeout(timer);
      worker.terminate();
    },
  };
}
