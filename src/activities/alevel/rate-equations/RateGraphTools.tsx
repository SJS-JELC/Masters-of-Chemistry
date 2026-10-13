import { useEffect, useId, useRef, useState } from 'react';
import type { KeyboardEvent, PointerEvent } from 'react';
import type { RateGraph } from './types.ts';
import { graphPlot, tangentGeometry } from './tangent-geometry.ts';
import { concentrationAt, curveTimeAt, gradientAt } from './graphs.ts';
import './graph-tools.css';
import { defaultRateGraphWorkspace, restoreRateGraphWorkspace } from './workspace-state.ts';
import { sameRateGraphWorkspace, type RateGraphWorkspaceState } from '../../../contracts/workspace.ts';

const clamp = (value: number, low: number, high: number) => Math.min(high, Math.max(low, value));
const numericText = (value: number) => value === 0 ? '0' : Number(value.toPrecision(5)).toString();
const fmt = (value: number): string => {
  if (value !== 0 && (Math.abs(value) < 0.001 || Math.abs(value) >= 100000)) {
    const [coefficient, power] = value.toExponential(4).split('e');
    const exponent = String(Number(power)).replace(/[-0-9]/g, char => char === '-' ? '⁻' : '⁰¹²³⁴⁵⁶⁷⁸⁹'[Number(char)]!);
    return `${Number(coefficient)} × 10${exponent}`;
  }
  return numericText(value);
};
const { width: W, height: H, left: LEFT, right: RIGHT, top: TOP, bottom: BOTTOM } = graphPlot;
type Reading = { x: number; y: number };
type Box = { x: number; y: number; width: number; height: number };
const overlap = (a: Box, b: Box) => Math.max(0, Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x)) * Math.max(0, Math.min(a.y + a.height, b.y + b.height) - Math.max(a.y, b.y));

/** Optional controlled unmarked workspace. The host owns attempt persistence;
 * live dragging remains local and a marker determines its tangent analytically. */
export interface RateGraphToolsProps {
  readonly snapConcentration?: boolean;
  readonly compact?: boolean;
  readonly graph: RateGraph;
  readonly assessed: boolean;
  readonly state?: RateGraphWorkspaceState;
  readonly onStateChange?: (state: RateGraphWorkspaceState) => void;
}
export function RateGraphTools({ graph, assessed, state, onStateChange, compact = false, snapConcentration = false }: RateGraphToolsProps) {
  const id = useId();
  const [local, setLocal] = useState(() => restoreRateGraphWorkspace(graph, state));
  const [dragMarker, setDragMarker] = useState<number | null>(null);
  const current = restoreRateGraphWorkspace(graph, state ?? local);
  const hasTangentToggle = compact || graph.kind === 'arrhenius';
  const showTangent = !hasTangentToggle || current.tangentAdded === true;
  const snapTime = (value: number) => {
    if (snapConcentration && graph.kind === 'concentration') {
      const minimum = Math.ceil(concentrationAt(graph, graph.maxTime) * 1000);
      const maximum = Math.round(graph.initial * 1000);
      const concentration = clamp(Math.round(concentrationAt(graph, clamp(value, 0, graph.maxTime)) * 1000), minimum, maximum) / 1000;
      return clamp(curveTimeAt(graph, concentration), 0, graph.maxTime);
    }
    if (compact && graph.kind === 'concentration') {
      const stepsPerUnit = graph.timeUnit === 'min' ? 10 : 2;
      return clamp(Math.round(value * stepsPerUnit), 0, Math.floor(graph.maxTime * stepsPerUnit + 1e-9)) / stepsPerUnit;
    }
    return value;
  };
  const currentRef = useRef(current);
  currentRef.current = current;
  const change = (next: RateGraphWorkspaceState) => {
    const checked = restoreRateGraphWorkspace(graph, next);
    if (sameRateGraphWorkspace(currentRef.current, checked)) return;
    currentRef.current = checked;
    setLocal(checked);
    onStateChange?.(checked);
  };
  const marker = snapTime(dragMarker ?? current.marker), extended = current.extended, readings = current.readings;
  const setMarker = (marker: number) => change({ ...currentRef.current, marker: snapTime(marker) });
  const setExtended = (extended: boolean) => change({ ...currentRef.current, extended });
  const setReadings = (readings: RateGraphWorkspaceState['readings']) => change({ ...currentRef.current, readings });
  useEffect(() => {
    // A new analytical graph starts fresh even in an unkeyed DEV/local host.
    setLocal(defaultRateGraphWorkspace(graph));
    setDragMarker(null);
    setDragging(false);
  }, [graph]);
  const [dragging, setDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const plotRef = useRef<HTMLDivElement>(null);
  const [visiblePlot, setVisiblePlot] = useState({ min: LEFT, max: W - RIGHT });
  const measureVisiblePlot = () => {
    const plot = plotRef.current, svg = plot?.querySelector('svg');
    if (!plot || !svg || !svg.clientWidth) return;
    const factor = W / svg.clientWidth;
    setVisiblePlot({ min: Math.max(LEFT, plot.scrollLeft * factor), max: Math.min(W - RIGHT, (plot.scrollLeft + plot.clientWidth) * factor) });
  };
  useEffect(() => {
    const plot = plotRef.current;
    if (!plot) return;
    const observer = new ResizeObserver(measureVisiblePlot);
    observer.observe(plot); measureVisiblePlot();
    return () => observer.disconnect();
  }, []);
  const concentration = graph.kind === 'concentration';
  const xMin = concentration ? 0 : extended ? 0 : graph.minX;
  const xMax = concentration ? graph.maxTime : graph.maxX;
  const xScale = graph.kind === 'arrhenius' && graph.scaledX ? 1000 : 1;
  const valueAt = (x: number) => graph.kind === 'concentration' ? concentrationAt(graph, x) : graph.intercept + graph.gradient * x;
  const markerX = clamp(marker, xMin, xMax);
  const markerY = valueAt(markerX);
  const slope = gradientAt(graph, markerX);
  const yMin = concentration ? 0 : Math.floor(Math.min(valueAt(xMin), valueAt(xMax)) - 1);
  const yMax = concentration ? graph.initial * 1.1 : Math.ceil(Math.max(valueAt(xMin), valueAt(xMax)) + 1);
  const px = (x: number) => LEFT + (x - xMin) / (xMax - xMin) * (W - LEFT - RIGHT);
  const py = (y: number) => H - BOTTOM - (y - yMin) / (yMax - yMin) * (H - TOP - BOTTOM);
  const tangentY = (x: number) => markerY + slope * (x - markerX);
  // Inset the analytic segment, then use a fixed fraction of its visible span.
  // No response/state controls its endpoints; both remain on the tangent.
  const { tangentMin, tangentMax, firstX, secondX, firstY, secondY, dx, dy } =
    tangentGeometry(xMin, xMax, yMin, yMax, markerX, markerY, slope, concentration);
  const xUnit = graph.kind === 'concentration' ? graph.timeUnit : 'K⁻¹';
  const xLabel = graph.kind === 'concentration' ? `Time / ${graph.timeUnit}` : graph.scaledX ? '(1/T) / (10⁻³ K⁻¹)' : '(1/T) / K⁻¹';
  const yLabel = concentration ? '[A] / mol dm⁻³' : 'ln(k) / s⁻¹';
  const readout = (reading: Reading) => `${concentration ? 't' : '1/T'} = ${fmt(reading.x)} ${xUnit}; ${concentration ? '[A]' : 'ln k'} = ${fmt(reading.y)}${concentration ? ' mol dm⁻³' : ''}`;
  const boxAt = (x: number, y: number, width: number, height: number): Box => ({ x: clamp(x, LEFT + 5, W - RIGHT - width - 5), y: clamp(y, TOP + 5, H - BOTTOM - height - 5), width, height });
  const deltaXLines = concentration ? [`Δt = ${fmt(dx)} ${xUnit}`] : [`Δ(1/T) = ${fmt(dx)}`, 'K⁻¹'];
  const deltaYLines = concentration ? [`Δ[A] = ${fmt(dy)}`, 'mol dm⁻³'] : [`Δln(k) = ${fmt(dy)}`];
  let deltaXBox = boxAt((px(firstX) + px(secondX)) / 2 - 125, py(firstY) - (concentration ? 42 : 65), 250, concentration ? 36 : 58);
  let deltaYBox = boxAt(px(secondX) + 12, (py(firstY) + py(secondY)) / 2 - (concentration ? 29 : 18), concentration ? 220 : 285, concentration ? 58 : 36);
  const coordinateLines = [
    `${concentration ? 't' : '1/T'} = ${fmt(markerX)} ${xUnit}`,
    concentration ? `[A] = ${fmt(markerY)} mol dm⁻³` : `ln(k) = ${fmt(markerY)}`,
  ];
  const markerPX = px(markerX), markerPY = py(markerY);
  const triangleBox: Box = { x: px(firstX), y: py(firstY), width: px(secondX) - px(firstX), height: py(secondY) - py(firstY) };
  const coordinateCandidates = [[markerPX + 14, markerPY - 74], [markerPX + 14, markerPY + 14], [markerPX - 314, markerPY - 74], [markerPX - 314, markerPY + 14]];
  const coordinateScore = (box: Box) => {
    const closestX = clamp(markerPX, box.x, box.x + box.width), closestY = clamp(markerPY, box.y, box.y + box.height);
    const coversMarker = Math.hypot(markerPX - closestX, markerPY - closestY) < 12;
    let lineCollisions = 0;
    for (let i = 0; i <= 8; i++) {
      const screenX = box.x + box.width * i / 8;
      const x = xMin + (screenX - LEFT) / (W - LEFT - RIGHT) * (xMax - xMin);
      const curveY = py(valueAt(x));
      if (curveY >= box.y && curveY <= box.y + box.height) lineCollisions++;
    }
    return (coversMarker ? 100000 : 0) + overlap(box, deltaXBox) * 4 + overlap(box, deltaYBox) * 4 + overlap(box, triangleBox) * 0.2 + lineCollisions * 400;
  };
  const coordinateBox = coordinateCandidates.map(([x, y]) => {
    const box = boxAt(x!, y!, 300, 64);
    // The coordinate box fits in the visible scroll slice, not just the SVG.
    // Delta labels and the curve remain part of the full scrollable plot.
    const visibleMin = visiblePlot.min + 5, visibleMax = visiblePlot.max - box.width - 5;
    return visibleMax >= visibleMin ? { ...box, x: clamp(box.x, visibleMin, visibleMax) } : box;
  }).sort((a, b) => coordinateScore(a) - coordinateScore(b))[0]!;
  // Prefer the nearby marker box, then move a delta label if those boxes collide.
  // This is particularly useful when the true-intercept marker is at x = 0.
  const clearOfCoordinate = (box: Box, other: Box) => {
    if (!overlap(box, coordinateBox)) return box;
    const candidates = [box,
      boxAt(coordinateBox.x + coordinateBox.width + 12, box.y, box.width, box.height),
      boxAt(coordinateBox.x - box.width - 12, box.y, box.width, box.height),
      boxAt(box.x, coordinateBox.y + coordinateBox.height + 12, box.width, box.height),
      boxAt(box.x, coordinateBox.y - box.height - 12, box.width, box.height),
    ];
    const score = (candidate: Box) => overlap(candidate, coordinateBox) * 20 + overlap(candidate, other) * 20 + overlap(candidate, triangleBox) * .5 + Math.hypot(candidate.x - box.x, candidate.y - box.y);
    return candidates.sort((a, b) => score(a) - score(b))[0]!;
  };
  deltaXBox = clearOfCoordinate(deltaXBox, deltaYBox);
  deltaYBox = clearOfCoordinate(deltaYBox, deltaXBox);
  const coordinateFromPointer = (event: PointerEvent<SVGSVGElement>) => {
    const svg = event.currentTarget;
    const screen = svg.createSVGPoint(); screen.x = event.clientX; screen.y = event.clientY;
    const transform = svg.getScreenCTM();
    if (!transform) return markerX;
    const local = screen.matrixTransform(transform.inverse());
    return xMin + (local.x - LEFT) / (W - LEFT - RIGHT) * (xMax - xMin);
  };
  const beginDrag = (event: PointerEvent<SVGCircleElement | SVGLineElement>) => {
    event.preventDefault();
    const svg = event.currentTarget.ownerSVGElement, transform = svg?.getScreenCTM();
    if (svg && transform) {
      const point = svg.createSVGPoint(); point.x = event.clientX; point.y = event.clientY;
      const local = point.matrixTransform(transform.inverse());
      const pointerX = xMin + (local.x - LEFT) / (W - LEFT - RIGHT) * (xMax - xMin);
      setDragOffset(pointerX - markerX);
    }
    setDragging(true); svg?.setPointerCapture(event.pointerId);
  };
  const move = (event: PointerEvent<SVGSVGElement>) => {
    if (!dragging) return;
    const x = coordinateFromPointer(event);
    setDragMarker(snapTime(clamp(x - dragOffset, xMin, xMax)));
  };
  const finishDrag = () => {
    if (dragMarker !== null) setMarker(dragMarker);
    setDragMarker(null);
    setDragging(false);
  };
  const keyboardMove = (event: KeyboardEvent<SVGCircleElement>) => {
    const direction = event.key === 'ArrowRight' || event.key === 'ArrowUp' ? 1 : event.key === 'ArrowLeft' || event.key === 'ArrowDown' ? -1 : 0;
    if (!direction && event.key !== 'Home' && event.key !== 'End') return;
    event.preventDefault(); event.stopPropagation();
    if (snapConcentration && graph.kind === 'concentration' && direction) {
      const minimum = Math.ceil(concentrationAt(graph, graph.maxTime) * 1000);
      const maximum = Math.round(graph.initial * 1000);
      const nextConcentration = clamp(Math.round(markerY * 1000) - direction * (event.shiftKey ? 10 : 1), minimum, maximum) / 1000;
      setMarker(curveTimeAt(graph, nextConcentration));
      return;
    }
    const step = compact && graph.kind === 'concentration'
      ? (graph.timeUnit === 'min' ? 0.1 : 0.5) * (event.shiftKey ? 10 : 1)
      : (xMax - xMin) / (event.shiftKey ? 20 : 200);
    const next = event.key === 'Home' ? xMin : event.key === 'End' ? xMax : markerX + direction * step;
    setMarker(clamp(next, xMin, xMax));
  };
  const path = Array.from({ length: 161 }, (_, index) => {
    const x = xMin + (xMax - xMin) * index / 160;
    return `${index ? 'L' : 'M'}${px(x)},${py(valueAt(x))}`;
  }).join(' ');
  const pin = (index: number) => setReadings(index === 0 ? [{ x: markerX, y: markerY }, readings[1]] : [readings[0], { x: markerX, y: markerY }]);
  const input = (label: string, value: number, change: (value: number) => void, min?: number, max?: number) => <label className="rate-graph-field">{label}<input type="number" step="any" value={numericText(value)} min={min} max={max} onChange={event => { const next = event.currentTarget.valueAsNumber; if (Number.isFinite(next)) change(next); }} /></label>;
  const labelBox = (box: Box, lines: string[], className: string) => <g className={`rate-graph-label ${className}`} pointerEvents="none"><rect x={box.x} y={box.y} width={box.width} height={box.height} rx={7} />{lines.map((line, i) => <text key={line} x={box.x + 12} y={box.y + 25 + i * 25}>{line}</text>)}</g>;

  return <section className="rate-graph-tools" aria-label={concentration ? 'Concentration–time measuring workspace' : 'Arrhenius measuring workspace'}>
    <div className={hasTangentToggle ? 'rate-graph-with-toggle' : undefined}>
    {hasTangentToggle && <div className="rate-graph-toggle-buttons"><button className="rate-tangent-toggle" type="button" aria-label="Show tangent" aria-pressed={showTangent}
      onClick={() => change({ ...currentRef.current, tangentAdded: !showTangent })}>
      {showTangent ? 'Remove tangent' : 'Add tangent'}
    </button>
    {graph.kind === 'arrhenius' && <button type="button" aria-pressed={extended} onClick={() => setExtended(!extended)}>
      Extend the line to 1/T = 0
    </button>}
    </div>}
    <div ref={plotRef} onScroll={measureVisiblePlot} className="rate-graph-plot-scroll" tabIndex={0} role="region" aria-label="Graph plot; scroll horizontally on small screens">
    <svg className="rate-graph-svg" viewBox={`0 0 ${W} ${H}`} aria-labelledby={`${id}-title ${id}-description`} onPointerMove={move} onPointerUp={finishDrag} onPointerCancel={finishDrag} onLostPointerCapture={finishDrag}>
      <title id={`${id}-title`}>{concentration ? 'Concentration of A against time' : 'Arrhenius line'}</title>
      <desc id={`${id}-description`}>Cyan graph and draggable mint marker. {showTangent ? 'A mint tangent and yellow gradient triangle show signed coordinate changes.' : 'Use Add tangent to show the tangent and gradient triangle.'} Marker coordinates appear inside the plot. Use arrow keys on the marker to move it.{!compact && ' Numeric alternatives to dragging are below.'}</desc>
      <defs><clipPath id={`${id}-clip`}><rect x={LEFT} y={TOP} width={W - LEFT - RIGHT} height={H - TOP - BOTTOM} /></clipPath></defs>
      {Array.from({ length: 6 }, (_, i) => {
        const x = xMin + (xMax - xMin) * i / 5, y = yMin + (yMax - yMin) * i / 5;
        return <g key={i} className="rate-graph-grid"><line x1={px(x)} x2={px(x)} y1={TOP} y2={H - BOTTOM} /><line x1={LEFT} x2={W - RIGHT} y1={py(y)} y2={py(y)} /><text x={px(x)} y={H - BOTTOM + 24} textAnchor="middle">{fmt(x * xScale)}</text><text x={LEFT - 12} y={py(y) + 5} textAnchor="end">{fmt(y)}</text></g>;
      })}
      <path className="rate-graph-axis" d={`M${LEFT},${TOP}V${H - BOTTOM}H${W - RIGHT}`} />
      <text className="rate-graph-axis-label" x={(LEFT + W - RIGHT) / 2} y={H - 20} textAnchor="middle">{xLabel}</text>
      <text className="rate-graph-axis-label" transform={`translate(24 ${(TOP + H - BOTTOM) / 2}) rotate(-90)`} textAnchor="middle">{yLabel}</text>
      <g clipPath={`url(#${id}-clip)`}>
        <path className="rate-graph-curve" d={path} />
        {showTangent && <line className="rate-graph-tangent" x1={px(xMin)} y1={py(tangentY(xMin))} x2={px(xMax)} y2={py(tangentY(xMax))} />}
        <path className="rate-graph-marker-guide" d={`M${px(markerX)},${H - BOTTOM}V${py(markerY)}H${LEFT}`} />
        {!compact && readings.map((reading, index) => reading && <g key={index} className="rate-graph-pin"><path d={`M${px(reading.x)},${H - BOTTOM}V${py(reading.y)}H${LEFT}`} /><circle cx={px(reading.x)} cy={py(reading.y)} r={5} /><text x={px(reading.x) + 9} y={py(reading.y) - 10}>{index + 1}</text></g>)}
      </g>
      {showTangent && <><path className="rate-graph-triangle" d={`M${px(firstX)},${py(firstY)}H${px(secondX)}V${py(secondY)}Z`} />
      <line className="rate-graph-tangent-hit" x1={px(tangentMin)} y1={py(tangentY(tangentMin))} x2={px(tangentMax)} y2={py(tangentY(tangentMax))} onPointerDown={beginDrag} aria-label="Draggable tangent; moves the marker along the graph" />
      <line className="rate-graph-label-guide" x1={(px(firstX) + px(secondX)) / 2} y1={py(firstY)} x2={clamp((px(firstX) + px(secondX)) / 2, deltaXBox.x, deltaXBox.x + deltaXBox.width)} y2={clamp(py(firstY), deltaXBox.y, deltaXBox.y + deltaXBox.height)} />
      <line className="rate-graph-label-guide" x1={px(secondX)} y1={(py(firstY) + py(secondY)) / 2} x2={clamp(px(secondX), deltaYBox.x, deltaYBox.x + deltaYBox.width)} y2={clamp((py(firstY) + py(secondY)) / 2, deltaYBox.y, deltaYBox.y + deltaYBox.height)} />
      {labelBox(deltaXBox, deltaXLines, 'rate-graph-delta-x')}
      {labelBox(deltaYBox, deltaYLines, 'rate-graph-delta-y')}
      </>}
      {labelBox(coordinateBox, coordinateLines, 'rate-graph-coordinate-box')}
      <circle className="rate-graph-handle rate-graph-handle-marker" cx={markerPX} cy={markerPY} r={8} tabIndex={0} role="slider" aria-label={concentration ? 'Concentration–time marker' : 'Arrhenius coordinate marker'} aria-valuemin={xMin * xScale} aria-valuemax={xMax * xScale} aria-valuenow={markerX * xScale} aria-valuetext={readout({ x: markerX, y: markerY })} onPointerDown={beginDrag} onKeyDown={keyboardMove} />
    </svg>
    </div>
    </div>
    {!compact && Boolean(graph.kind !== 'arrhenius') && <><div className="rate-graph-readings" aria-live="polite">
      <p><strong>Marker:</strong> {readout({ x: markerX, y: markerY })}</p>
      <p><strong>Triangle:</strong> Δ{graph.kind === 'arrhenius' && graph.scaledX ? '(1000/T)' : concentration ? 't' : '(1/T)'} = {fmt(dx * xScale)} {xUnit}; Δ{concentration ? '[A]' : 'ln k'} = {fmt(dy)}{concentration ? ' mol dm⁻³' : ''}.</p>
      {graph.kind === 'arrhenius' && graph.scaledX && <p>Δ(1/T) = {fmt(dx)} K⁻¹.</p>}
      {assessed && <p className="rate-graph-assessed"><strong>After assessment:</strong> {concentration ? `Tangent gradient = ${fmt(slope)} mol dm⁻³ ${xUnit}⁻¹; rate of disappearance = ${fmt(-slope)} mol dm⁻³ ${xUnit}⁻¹.` : `Gradient against 1/T = ${fmt(slope)} K${graph.scaledX ? `; displayed-axis gradient = ${fmt(slope / 1000)} K` : ''}.`}</p>}
    </div>
    <div className="rate-graph-controls">
      {input(graph.kind === 'concentration' ? `Marker time / ${xUnit}` : graph.scaledX ? 'Marker 1000/T / K⁻¹' : 'Marker 1/T / K⁻¹', markerX * xScale, value => setMarker(clamp(value / xScale, xMin, xMax)), xMin * xScale, xMax * xScale)}
      {graph.kind === 'concentration' && input('Marker [A] / mol dm⁻³', markerY, value => { if (value > 0) setMarker(clamp(curveTimeAt(graph, Math.min(value, graph.initial)), xMin, xMax)); }, concentrationAt(graph, graph.maxTime), graph.initial)}
    </div>
    {concentration && <div className="rate-graph-pin-controls">
      <p>Initial [A]₀ = {fmt(graph.initial)} mol dm⁻³ at t = 0.</p>
      {[0, 1].map(index => <div key={index}><button type="button" onClick={() => pin(index)}>Pin reading {index + 1}</button><span>{readings[index] ? readout(readings[index]) : 'No reading pinned'}</span></div>)}
      {readings[0] && readings[1] && <p>Time from start to reading 1 = {fmt(readings[0].x)} {xUnit}; time from reading 1 to reading 2 = {fmt(readings[1].x - readings[0].x)} {xUnit}.</p>}
      <button type="button" onClick={() => setReadings([null, null])}>Clear pinned readings</button>
    </div>}
    </>}
  </section>;
}
