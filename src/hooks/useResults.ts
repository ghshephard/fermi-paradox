import { useMemo } from 'react';
import { classicResult } from '../model/drake';
import { useStore } from '../store';

export interface Results {
  pOther: number;
  pAloneGalaxy: number;
  pAloneUniverse: number;
  /** log10 of the N shown in the galaxy: the median in paper mode, the point value in classic mode. */
  displayLog10N: number;
}

/** Headline probabilities for whichever mode is active, or null while the first simulation runs. */
export function useResults(): Results | null {
  const mode = useStore((s) => s.mode);
  const point = useStore((s) => s.point);
  const summary = useStore((s) => s.summary);
  const classic = useMemo(() => classicResult(point), [point]);

  if (mode === 'classic') {
    return {
      pOther: classic.pAtLeastOneOther,
      pAloneGalaxy: classic.pAloneGalaxy,
      pAloneUniverse: classic.pAloneUniverse,
      displayLog10N: classic.log10N,
    };
  }
  if (!summary) return null;
  return {
    pOther: 1 - summary.pAloneGalaxy,
    pAloneGalaxy: summary.pAloneGalaxy,
    pAloneUniverse: summary.pAloneUniverse,
    displayLog10N: summary.medianLog10N,
  };
}
