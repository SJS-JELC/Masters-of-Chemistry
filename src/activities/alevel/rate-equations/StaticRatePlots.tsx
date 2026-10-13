import { useId } from 'react';
import type { StaticRatePlot } from './types.ts';
import './graph-tools.css';

const format = (value: number) => {
  if (value === 0) return '0';
  if (Math.abs(value) < 0.001 || Math.abs(value) >= 10000) {
    const [coefficient, exponent] = value.toExponential(2).split('e');
    const power = String(Number(exponent)).replace(/[-0-9]/g, c => c === '-' ? '⁻' : '⁰¹²³⁴⁵⁶⁷⁸⁹'[Number(c)]!);
    return `${Number(coefficient)} × 10${power}`;
  }
  return Number(value.toPrecision(3)).toString();
};
function StaticPlot({ plot }: { readonly plot: StaticRatePlot }) {
  const id = useId(), W = 680, H = 400, left = 170, right = 28, top = 22, bottom = 72;
  const px = (x: number) => left + x / plot.maxX * (W - left - right);
  const py = (y: number) => H - bottom - y / plot.maxY * (H - top - bottom);
  const path = plot.points.map(({ x, y }, i) => `${i ? 'L' : 'M'}${px(x)},${py(y)}`).join(' ');
  return <figure className="rate-static-plot">
    <figcaption>{plot.title}</figcaption>
    <div className="rate-graph-plot-scroll" tabIndex={0} role="region" aria-label={`${plot.title}; scroll horizontally on small screens`}>
    <svg className="rate-static-svg" viewBox={`0 0 ${W} ${H}`} role="img" aria-labelledby={`${id}-title ${id}-description`}>
      <title id={`${id}-title`}>{plot.title}</title>
      <desc id={`${id}-description`}>{plot.xLabel} on the horizontal axis; {plot.yLabel} on the vertical axis. The plotted evidence is also available as a data table.</desc>
      <defs><clipPath id={`${id}-clip`}><rect x={left} y={top} width={W - left - right} height={H - top - bottom} /></clipPath></defs>
      {Array.from({ length: 5 }, (_, i) => {
        const x = plot.maxX * i / 4, y = plot.maxY * i / 4;
        return <g key={i} className="rate-graph-grid">
          <line x1={px(x)} x2={px(x)} y1={top} y2={H - bottom} />
          <line x1={left} x2={W - right} y1={py(y)} y2={py(y)} />
          <text x={px(x)} y={H - bottom + 24} textAnchor="middle">{format(x)}</text>
          <text x={left - 10} y={py(y) + 5} textAnchor="end">{format(y)}</text>
        </g>;
      })}
      <path className="rate-graph-axis" d={`M${left},${top}V${H - bottom}H${W - right}`} />
      <text className="rate-graph-axis-label" x={(left + W - right) / 2} y={H - 18} textAnchor="middle">{plot.xLabel}</text>
      <text className="rate-graph-axis-label" transform={`translate(22 ${(top + H - bottom) / 2}) rotate(-90)`} textAnchor="middle">{plot.yLabel}</text>
      <path className="rate-graph-curve" clipPath={`url(#${id}-clip)`} d={path} />
    </svg>
    </div>
    <table className="rate-static-accessible-data"><caption>{plot.title}: plotted readings</caption><thead><tr><th>{plot.xLabel}</th><th>{plot.yLabel}</th></tr></thead>
      <tbody>{plot.points.filter((_, i) => i % 20 === 0).map(({ x, y }, i) => <tr key={i}><td>{format(x)}</td><td>{format(y)}</td></tr>)}</tbody>
    </table>
  </figure>;
}
/** Evidence plots are regenerated from the ref, with no marker or attempt state. */
export function StaticRatePlots({ plots }: { readonly plots: readonly StaticRatePlot[] }) {
  return <section className="rate-static-plots" aria-label="Kinetic evidence graphs">{plots.map(plot => <StaticPlot key={plot.id} plot={plot} />)}</section>;
}
