import { useStore, type Mode } from '../store';

const OPTIONS: { mode: Mode; label: string; hint: string }[] = [
  { mode: 'paper', label: 'Paper mode', hint: 'uncertainty + Monte Carlo' },
  { mode: 'classic', label: 'Classic Drake', hint: 'point estimates' },
];

export function ModeToggle() {
  const mode = useStore((s) => s.mode);
  const setMode = useStore((s) => s.setMode);
  return (
    <div className="mode-toggle" role="tablist" aria-label="Calculation mode">
      {OPTIONS.map((o) => (
        <button
          key={o.mode}
          type="button"
          role="tab"
          aria-selected={mode === o.mode}
          className={mode === o.mode ? 'active' : undefined}
          onClick={() => setMode(o.mode)}
        >
          <span>{o.label}</span>
          <small>{o.hint}</small>
        </button>
      ))}
    </div>
  );
}
