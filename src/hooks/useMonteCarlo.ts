import { useEffect } from 'react';
import { SAMPLES, useStore } from '../store';
import { createMonteCarloRunner } from '../workers/monteCarloClient';

/** Re-runs the simulation in a worker whenever the paper-mode parameters or seed change. */
export function useMonteCarlo() {
  useEffect(() => {
    const runner = createMonteCarloRunner((summary) => useStore.getState().setSummary(summary));
    const run = () => {
      const { paper, seed } = useStore.getState();
      useStore.setState({ running: true });
      runner.request(paper, SAMPLES, seed);
    };

    run();
    const unsubscribe = useStore.subscribe((s, prev) => {
      if (s.paper !== prev.paper || s.seed !== prev.seed) run();
    });
    return () => {
      unsubscribe();
      runner.dispose();
    };
  }, []);
}
