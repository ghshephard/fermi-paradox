import type { ReactNode } from 'react';
import { formatFromLog10 } from '../lib/format';
import {
  ABIOGENESIS_DOMAIN,
  PARAMS,
  PARAM_ORDER,
  type ParamInfo,
  type RangeKey,
} from '../model/drake';
import { useStore } from '../store';
import { LogSlider } from './LogSlider';
import { RangeSlider } from './RangeSlider';

function ParamSymbol({ info }: { info: ParamInfo }) {
  return (
    <span className="param-symbol">
      {info.symbol.base}
      {info.symbol.sub && <sub>{info.symbol.sub}</sub>}
    </span>
  );
}

function ParamRow({ info, value, children }: { info: ParamInfo; value: string; children: ReactNode }) {
  return (
    <div className="param-row">
      <div className="param-header">
        <ParamSymbol info={info} />
        <span className="param-name">
          {info.name}
          <button type="button" className="info" aria-label={`About ${info.name}`}>
            i<span className="tooltip" role="tooltip">{info.description}</span>
          </button>
        </span>
        <span className="param-value">
          {value}
          {info.unit && <span className="param-unit"> {info.unit}</span>}
        </span>
      </div>
      {children}
    </div>
  );
}

function PaperControls() {
  const paper = useStore((s) => s.paper);
  const setRange = useStore((s) => s.setRange);
  const setAbiogenesis = useStore((s) => s.setAbiogenesis);
  const { medianLog10, sigmaDecades } = paper.abiogenesis;

  return PARAM_ORDER.map((key) => {
    const info = PARAMS[key];
    if (key === 'fl') {
      return (
        <ParamRow key={key} info={info} value="1 − e^(−λVt)">
          <div className="sub-control">
            <div className="sub-label">
              <span>Median abiogenesis events per planet</span>
              <span>{formatFromLog10(medianLog10)}</span>
            </div>
            <LogSlider
              value={medianLog10}
              domain={ABIOGENESIS_DOMAIN.medianLog10}
              step={0.5}
              label="Median abiogenesis rate"
              onChange={(v) => setAbiogenesis({ medianLog10: v })}
            />
          </div>
          <div className="sub-control">
            <div className="sub-label">
              <span>Uncertainty (standard deviation)</span>
              <span>{sigmaDecades} orders of magnitude</span>
            </div>
            <LogSlider
              value={sigmaDecades}
              domain={ABIOGENESIS_DOMAIN.sigmaDecades}
              step={1}
              label="Abiogenesis uncertainty"
              onChange={(v) => setAbiogenesis({ sigmaDecades: v })}
            />
          </div>
        </ParamRow>
      );
    }
    const range = paper.ranges[key as RangeKey];
    return (
      <ParamRow
        key={key}
        info={info}
        value={`${formatFromLog10(range[0])} – ${formatFromLog10(range[1])}`}
      >
        <RangeSlider
          value={range}
          domain={info.domain}
          step={info.step}
          label={info.name}
          onChange={(r) => setRange(key as RangeKey, r)}
        />
      </ParamRow>
    );
  });
}

function ClassicControls() {
  const point = useStore((s) => s.point);
  const setPoint = useStore((s) => s.setPoint);
  return PARAM_ORDER.map((key) => {
    const info = PARAMS[key];
    return (
      <ParamRow key={key} info={info} value={formatFromLog10(point[key])}>
        <LogSlider
          value={point[key]}
          domain={info.domain}
          step={info.step}
          label={info.name}
          onChange={(v) => setPoint(key, v)}
        />
      </ParamRow>
    );
  });
}

export function ParameterPanel() {
  const mode = useStore((s) => s.mode);
  const resetPaper = useStore((s) => s.resetPaper);
  const resetPoint = useStore((s) => s.resetPoint);
  const rerun = useStore((s) => s.rerun);

  return (
    <section className="panel parameter-panel" aria-label="Drake equation parameters">
      <h2>
        {mode === 'paper' ? 'Uncertainty ranges' : 'Point estimates'}
        <span className="panel-hint">
          {mode === 'paper'
            ? 'Each value is drawn log-uniformly from its range'
            : 'One best guess per factor'}
        </span>
      </h2>
      <p className="equation" aria-label="N equals R star times f p times n e times f l times f i times f c times L">
        N = R<sub>★</sub> · f<sub>p</sub> · n<sub>e</sub> · f<sub>l</sub> · f<sub>i</sub> · f
        <sub>c</sub> · L
      </p>
      <div className="params">{mode === 'paper' ? <PaperControls /> : <ClassicControls />}</div>
      <div className="panel-actions">
        <button type="button" className="btn" onClick={mode === 'paper' ? resetPaper : resetPoint}>
          Reset to paper defaults
        </button>
        {mode === 'paper' && (
          <button type="button" className="btn btn--ghost" onClick={rerun}>
            Re-run simulation
          </button>
        )}
      </div>
    </section>
  );
}
