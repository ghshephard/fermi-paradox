import { useMemo } from 'react';
import { useResults } from '../hooks/useResults';
import { formatFromLog10, formatNumber, formatPercent } from '../lib/format';
import { classicResult } from '../model/drake';
import { useStore } from '../store';
import { Histogram } from './Histogram';

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="stat">
      <span className="stat-label">{label}</span>
      <span className="stat-value">{value}</span>
      {hint && <span className="stat-hint">{hint}</span>}
    </div>
  );
}

function PaperDetails() {
  const summary = useStore((s) => s.summary);
  if (!summary) return null;
  return (
    <>
      <div className="stats">
        <Stat label="Median N" value={formatFromLog10(summary.medianLog10N)} hint="half of samples fall below" />
        <Stat label="Mean N" value={formatNumber(summary.meanN)} hint="dominated by rare optimistic draws" />
      </div>
      <Histogram data={summary.histogram} samples={summary.samples} />
      <p className="note">
        {summary.medianLog10N < 0
          ? 'The mean is large while the median is below one: a few optimistic draws dominate the average, but most plausible galaxies are empty.'
          : 'A few optimistic draws pull the mean far above the median, so the average alone overstates how crowded a typical galaxy is.'}{' '}
        Based on {summary.samples.toLocaleString()} simulated galaxies.
      </p>
    </>
  );
}

function ClassicDetails() {
  const point = useStore((s) => s.point);
  const result = useMemo(() => classicResult(point), [point]);
  return (
    <>
      <div className="stats">
        <Stat label="N (expected civilizations)" value={formatFromLog10(result.log10N)} hint="in the Milky Way" />
      </div>
      <p className="note">
        Multiplying single best guesses gives one definite N. With the paper's midpoints that N is in
        the thousands, so an empty sky looks almost impossible: that is the Fermi paradox. Switch to{' '}
        <strong>Paper mode</strong> to see how admitting uncertainty changes the picture.
      </p>
    </>
  );
}

export function ResultsPanel() {
  const mode = useStore((s) => s.mode);
  const running = useStore((s) => s.running);
  const results = useResults();

  return (
    <section className="panel results-panel" aria-live="polite">
      <h2>
        The odds
        {mode === 'paper' && running && <span className="running">simulating…</span>}
      </h2>
      {results ? (
        <>
          <div className="headline">
            <span className="headline-value">{formatPercent(results.pOther)}</span>
            <span className="headline-label">
              chance that at least one other detectable civilization exists in the Milky Way
            </span>
          </div>
          <div className="stats">
            <Stat label="Alone in the Milky Way" value={formatPercent(results.pAloneGalaxy)} />
            <Stat label="Alone in the observable universe" value={formatPercent(results.pAloneUniverse)} />
          </div>
          {mode === 'paper' ? <PaperDetails /> : <ClassicDetails />}
        </>
      ) : (
        <p className="note">Running the first simulation…</p>
      )}
    </section>
  );
}
