import type { CSSProperties } from 'react';
import type { LogRange } from '../model/drake';

interface Props {
  value: LogRange;
  domain: LogRange;
  step: number;
  label: string;
  onChange(value: LogRange): void;
}

/** Dual-handle slider selecting a [lo, hi] range on a base-10 log scale. */
export function RangeSlider({ value, domain, step, label, onChange }: Props) {
  const [min, max] = domain;
  const [lo, hi] = value;
  const pct = (v: number) => ((v - min) / (max - min)) * 100;
  const style = { '--fill-start': `${pct(lo)}%`, '--fill-end': `${pct(hi)}%` } as CSSProperties;

  return (
    <div className="range-slider" style={style}>
      <div className="range-track" />
      <input
        className="slider slider--dual"
        type="range"
        min={min}
        max={max}
        step={step}
        value={lo}
        aria-label={`${label} minimum`}
        onChange={(e) => onChange([Math.min(Number(e.target.value), hi), hi])}
      />
      <input
        className="slider slider--dual"
        type="range"
        min={min}
        max={max}
        step={step}
        value={hi}
        aria-label={`${label} maximum`}
        onChange={(e) => onChange([lo, Math.max(Number(e.target.value), lo)])}
      />
    </div>
  );
}
