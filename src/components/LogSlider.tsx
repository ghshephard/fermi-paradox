import type { CSSProperties } from 'react';

interface Props {
  value: number;
  domain: [number, number];
  step: number;
  label: string;
  onChange(value: number): void;
}

/** A slider over a base-10 log domain (or any linear domain the caller formats). */
export function LogSlider({ value, domain, step, label, onChange }: Props) {
  const [min, max] = domain;
  const fill = ((value - min) / (max - min)) * 100;
  return (
    <input
      className="slider"
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      aria-label={label}
      style={{ '--fill-start': '0%', '--fill-end': `${fill}%` } as CSSProperties}
      onChange={(e) => onChange(Number(e.target.value))}
    />
  );
}
