import { formatPercent, formatPow10 } from '../lib/format';
import { UNIVERSE_THRESHOLD_LOG10, type Histogram as HistogramData } from '../model/drake';

const W = 600;
const H = 220;
const PAD = { left: 12, right: 12, top: 28, bottom: 32 };

interface Props {
  data: HistogramData;
  samples: number;
}

/** Distribution of log10(N) across Monte Carlo samples. */
export function Histogram({ data, samples }: Props) {
  const { min, binWidth, counts, underflow } = data;
  const max = min + counts.length * binWidth;
  const peak = Math.max(1, ...counts);
  const plotW = W - PAD.left - PAD.right;
  const plotH = H - PAD.top - PAD.bottom;
  const x = (v: number) => PAD.left + ((v - min) / (max - min)) * plotW;
  const barW = plotW / counts.length;

  const ticks: number[] = [];
  for (let t = Math.ceil(min / 10) * 10; t <= max; t += 10) ticks.push(t);

  const zoneClass = (binStart: number) =>
    binStart < UNIVERSE_THRESHOLD_LOG10 ? 'bar bar--universe' : binStart < 0 ? 'bar bar--galaxy' : 'bar bar--crowded';

  return (
    <figure className="histogram">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Histogram of the number of civilizations N on a log scale">
        {counts.map((c, i) => {
          const h = (c / peak) * plotH;
          const start = min + i * binWidth;
          return (
            <rect
              key={i}
              className={zoneClass(start)}
              x={PAD.left + i * barW + 0.5}
              y={PAD.top + plotH - h}
              width={Math.max(barW - 1, 0.5)}
              height={h}
            />
          );
        })}

        <line className="axis" x1={PAD.left} x2={W - PAD.right} y1={PAD.top + plotH} y2={PAD.top + plotH} />
        {ticks.map((t) => (
          <g key={t}>
            <line className="tick" x1={x(t)} x2={x(t)} y1={PAD.top + plotH} y2={PAD.top + plotH + 5} />
            <text className="tick-label" x={x(t)} y={H - 10} textAnchor="middle">
              {formatPow10(t)}
            </text>
          </g>
        ))}

        <line className="marker" x1={x(0)} x2={x(0)} y1={PAD.top - 6} y2={PAD.top + plotH} />
        <text className="marker-label" x={x(0) + 4} y={PAD.top - 12}>
          N = 1
        </text>
        <line
          className="marker marker--universe"
          x1={x(UNIVERSE_THRESHOLD_LOG10)}
          x2={x(UNIVERSE_THRESHOLD_LOG10)}
          y1={PAD.top - 6}
          y2={PAD.top + plotH}
        />
        <text className="marker-label" x={x(UNIVERSE_THRESHOLD_LOG10) - 4} y={PAD.top - 12} textAnchor="end">
          alone in the universe
        </text>
      </svg>
      <figcaption>
        <span className="legend legend--universe">alone in observable universe</span>
        <span className="legend legend--galaxy">alone in Milky Way</span>
        <span className="legend legend--crowded">company in the galaxy</span>
        {underflow > 0 && (
          <span className="legend-note">
            {formatPercent(underflow / samples)} of samples fall below {formatPow10(min)} (off chart)
          </span>
        )}
      </figcaption>
    </figure>
  );
}
