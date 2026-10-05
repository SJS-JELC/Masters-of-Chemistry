import { useEffect, useId, useRef, useState } from 'react';
import type { PointerEvent, KeyboardEvent, CSSProperties } from 'react';
import type { EditorSurfaceProps } from '../../ui/EditorFrame.tsx';
import type { TitrationCurveState } from '../../contracts/editors.ts';
import { getRecord } from '../../activities/alevel/ph-titration-curves/provider.ts';
import { curve, pieces, indicators, answer } from '../../chemistry/titration-curve/core.js';
import { constrain, selectPiece } from '../../chemistry/titration-curve/engine.ts';
import './titration.css';
type Anchor = 'initialPH' | 'equivalenceVolume' | 'finalPH';
const X0 = 76,
  X1 = 780,
  Y0 = 32,
  Y1 = 370;

/** Keep incomplete keyboard text local; the curve receives only completed valid anchors. */
function AnchorInput({
  label,
  value,
  min,
  max,
  step,
  readOnly,
  onCommit,
}: {
  readonly label: string;
  readonly value: number;
  readonly min: number;
  readonly max: number;
  readonly step: number;
  readonly readOnly: boolean;
  readonly onCommit: (value: number) => number;
}) {
  const format = (number: number) => String(Number(number.toFixed(1)));
  const [draft, setDraft] = useState(() => format(value));
  const [error, setError] = useState('');
  const dirty = useRef(false);
  const descriptionId = useId();
  useEffect(() => {
    setDraft(format(value));
    setError('');
    dirty.current = false;
  }, [value, readOnly]);
  function finish() {
    if (readOnly || !dirty.current) return;
    dirty.current = false;
    const trimmed = draft.trim(),
      parsed = Number(trimmed);
    const valid =
      /^(?:\d+(?:\.\d*)?|\.\d+)$/.test(trimmed) &&
      Number.isFinite(parsed) &&
      parsed >= min &&
      parsed <= max &&
      Math.abs(parsed / step - Math.round(parsed / step)) < 1e-7;
    if (!valid) {
      setDraft(format(value));
      setError(
        `Enter a value from ${min} to ${max} in steps of ${step}. The previous curve value, ${format(value)}, has been kept.`,
      );
      return;
    }
    const committed = onCommit(parsed);
    setDraft(format(committed));
    setError(
      Math.abs(committed - parsed) > 1e-7
        ? `The selected curve section limits this anchor to ${format(committed)}.`
        : '',
    );
  }
  return (
    <label>
      {label}
      <input
        aria-label={label}
        type="text"
        inputMode="decimal"
        value={draft}
        disabled={readOnly}
        aria-invalid={error ? true : undefined}
        aria-describedby={descriptionId}
        onChange={(event) => {
          dirty.current = true;
          setDraft(event.target.value);
          setError('');
        }}
        onBlur={finish}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            event.preventDefault();
            finish();
          } else if (event.key === 'Escape') {
            event.preventDefault();
            dirty.current = false;
            setDraft(format(value));
            setError('');
          }
        }}
      />
      <small id={descriptionId} className="support-note" role={error ? 'status' : undefined}>
        {error || 'Type a value, then press Enter or leave the field to update the curve.'}
      </small>
    </label>
  );
}

export function TitrationCurveEditor({
  part,
  response,
  readOnly,
  onResponse,
  workspaceAside,
}: EditorSurfaceProps) {
  if (part.kind !== 'titration-curve') throw Error('Titration editor needs a titration part.');
  const q = getRecord(part.markingPolicyId.replace(/^titration:/, ''));
  const [preview, setPreview] = useState<TitrationCurveState | null>(null);
  const state =
    preview ??
    (response?.kind === 'titration-curve'
      ? response
      : readOnly
        ? { ...answer(q), kind: 'titration-curve' as const }
        : part.initial);
  const latest = useRef(state);
  latest.current = state;
  const drag = useRef<{ field: Anchor; pointer: number } | null>(null);
  const svg = useRef<SVGSVGElement>(null);
  const unique = useId().replace(/:/g, '');
  const glowId = `tc-glow-${unique}`;
  const [history, setHistory] = useState<readonly TitrationCurveState[]>([]);
  useEffect(() => {
    setHistory([]);
    setPreview(null);
    drag.current = null;
  }, [q.id, readOnly]);
  const commit = (patch: Partial<TitrationCurveState>, record = true) => {
    if (readOnly) return;
    const old = latest.current,
      next = constrain(q, { ...old, ...patch });
    latest.current = next;
    if (record) {
      setHistory((h) => [...h.slice(-99), old]);
      onResponse(next);
    } else setPreview(next);
  };
  const x = (v: number) => X0 + (v / q.maxVolume) * (X1 - X0),
    y = (ph: number) => Y1 - (ph / 14) * (Y1 - Y0),
    plotted = curve(q, state);
  const path = (points: readonly { v: number; pH: number }[]) =>
    points.map((p, i) => `${i ? 'L' : 'M'}${x(p.v).toFixed(2)},${y(p.pH).toFixed(2)}`).join(' ');
  function pointer(event: PointerEvent<SVGSVGElement>) {
    const current = drag.current,
      matrix = svg.current?.getScreenCTM();
    if (!current || current.pointer !== event.pointerId || !matrix) return;
    const p = new DOMPoint(event.clientX, event.clientY).matrixTransform(matrix.inverse());
    commit(
      {
        [current.field]:
          current.field === 'equivalenceVolume'
            ? ((p.x - X0) / (X1 - X0)) * q.maxVolume
            : ((Y1 - p.y) / (Y1 - Y0)) * 14,
      },
      false,
    );
  }
  function key(event: KeyboardEvent<SVGCircleElement>, field: Anchor) {
    const increase = field === 'equivalenceVolume' ? 'ArrowRight' : 'ArrowUp',
      decrease = field === 'equivalenceVolume' ? 'ArrowLeft' : 'ArrowDown';
    if (event.key !== increase && event.key !== decrease) return;
    event.preventDefault();
    commit({
      [field]:
        state[field] +
        (event.key === increase ? 1 : -1) * (field === 'equivalenceVolume' ? 0.5 : 0.1),
    });
  }
  const handle = (field: Anchor, label: string, cx: number, cy: number) => (
    <g>
      <circle cx={cx} cy={cy} r={10} className="handle-ring" />
      <circle
        className="chart-handle"
        data-anchor={field}
        cx={cx}
        cy={cy}
        r={6}
        tabIndex={readOnly ? -1 : 0}
        role="slider"
        aria-label={label}
        aria-disabled={readOnly}
        aria-valuenow={state[field]}
        aria-valuemin={field === 'equivalenceVolume' ? 0.5 : 0}
        aria-valuemax={field === 'equivalenceVolume' ? q.maxVolume - 0.5 : 14}
        aria-valuetext={
          field === 'equivalenceVolume'
            ? `${state[field].toFixed(1)} cm³`
            : `pH ${state[field].toFixed(1)}`
        }
        onKeyDown={(e) => {
          if (!readOnly) key(e, field);
        }}
        onPointerDown={(e) => {
          if (readOnly) return;
          e.preventDefault();
          setHistory((h) => [...h.slice(-99), state]);
          drag.current = { field, pointer: e.pointerId };
          svg.current?.setPointerCapture(e.pointerId);
        }}
      />
    </g>
  );
  return (
    <div className="titration-workspace">
      <section className="builder-layout" aria-label="Titration curve builder">
        <aside className="piece-panel" aria-label="Curve halves and indicator choices">
          {(['before', 'after'] as const).map((side) => (
            <div className="piece-group" key={side}>
              <h3>{side === 'before' ? 'Before' : 'After'} equivalence</h3>
              <div
                className="piece-grid"
                role="group"
                aria-label={side + ' equivalence curve choices'}
              >
                {pieces
                  .filter((piece) => piece.side === side)
                  .map((piece) => {
                    const low = Math.min(...piece.points.map((p) => p[1])),
                      high = Math.max(...piece.points.map((p) => p[1]));
                    const schematic: Record<string, string> = {
                      'after-strong-base': 'M9 91 V17 Q9 9 17 9 H111',
                      'after-strong-acid': 'M9 9 V83 Q9 91 17 91 H111',
                    };
                    const thumbnail =
                      schematic[piece.id] ??
                      piece.points
                        .map(
                          (p, i) =>
                            (i ? 'L' : 'M') +
                            ' ' +
                            (9 + p[0] * 102).toFixed(1) +
                            ' ' +
                            (91 - ((p[1] - low) / (high - low || 1)) * 82).toFixed(1),
                        )
                        .join(' ');
                    return (
                      <button
                        type="button"
                        className="piece-choice"
                        data-piece={piece.id}
                        key={piece.id}
                        disabled={readOnly}
                        aria-pressed={state[side] === piece.id}
                        aria-label={piece.label + '. Select as ' + side + ' equivalence section'}
                        onClick={() => {
                          const next = selectPiece(q, latest.current, side, piece.id);
                          commit(next);
                        }}
                      >
                        <svg viewBox="0 0 120 100" aria-hidden="true">
                          <path className="piece-path" d={thumbnail} />
                        </svg>
                      </button>
                    );
                  })}
              </div>
            </div>
          ))}
          <section className="indicator-panel" aria-label="Suitable indicator">
            <h3>Suitable indicator</h3>
            <p className="indicator-direction">Acid → Alkali</p>
            <div className="indicator-options" role="group" aria-label="Suitable indicator">
              {indicators.map((item) => (
                <button
                  type="button"
                  key={item.id}
                  disabled={readOnly}
                  className={'indicator-choice' + (item.range ? '' : ' no-indicator')}
                  data-indicator={item.id}
                  style={
                    {
                      '--acid-colour': item.acidSwatch,
                      '--alkali-colour': item.alkaliSwatch,
                    } as CSSProperties
                  }
                  aria-pressed={state.indicator === item.id}
                  aria-label={
                    item.range
                      ? item.name +
                        ', pH ' +
                        item.range.join(' to ') +
                        ', ' +
                        item.acidColour?.toLowerCase() +
                        ' in acid, ' +
                        item.alkaliColour?.toLowerCase() +
                        ' in alkali'
                      : item.name
                  }
                  onClick={() => commit({ indicator: item.id })}
                >
                  <strong>{item.name}</strong>
                  {item.range && (
                    <>
                      <span>
                        pH {item.range[0].toFixed(1)}–{item.range[1].toFixed(1)}
                      </span>
                      <small className="indicator-colours">
                        <span>{item.acidColour}</span>
                        <span>{item.alkaliColour}</span>
                      </small>
                    </>
                  )}
                </button>
              ))}
            </div>
          </section>
        </aside>
        <section className="graph-panel" aria-label="Shape, scale and key points">
          <div className="panel-heading graph-heading">
            <div>
              <p className="kicker">02 · ANCHOR THE CURVE</p>
              <h2>Shape, scale and key points</h2>
            </div>
            <span className={'status-text' + (state.before && state.after ? ' ready' : '')}>
              {readOnly
                ? 'Read-only curve'
                : state.before && state.after
                  ? 'Curve ready to check'
                  : 'Choose both curve halves'}
            </span>
          </div>
          <div className="chart-wrap">
            <svg
              className="tc-chart"
              ref={svg}
              viewBox="0 0 820 460"
              role="group"
              aria-label={'pH curve; volume of ' + q.titrantName + ' added'}
              onPointerMove={pointer}
              onPointerUp={(event) => {
                if (drag.current) {
                  onResponse(latest.current);
                  if (svg.current?.hasPointerCapture(event.pointerId))
                    svg.current.releasePointerCapture(event.pointerId);
                }
                drag.current = null;
                setPreview(null);
              }}
              onPointerCancel={() => {
                if (drag.current) onResponse(latest.current);
                drag.current = null;
                setPreview(null);
              }}
            >
              <defs>
                <filter id={glowId}>
                  <feGaussianBlur stdDeviation="4" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
              <g className="chart-grid">
                {Array.from({ length: 8 }, (_, i) => i * 2).map((ph) => (
                  <line key={ph} x1={X0} x2={X1} y1={y(ph)} y2={y(ph)} className="grid-line" />
                ))}
                {Array.from({ length: 6 }, (_, i) => (q.maxVolume * i) / 5).map((v) => (
                  <line key={v} x1={x(v)} x2={x(v)} y1={Y0} y2={Y1} className="grid-line" />
                ))}
                <line x1={X0} x2={X1} y1={Y1} y2={Y1} className="axis-line" />
                <line x1={X0} x2={X0} y1={Y0} y2={Y1} className="axis-line" />
              </g>
              <g className="chart-labels">
                {Array.from({ length: 8 }, (_, i) => i * 2).map((ph) => (
                  <text key={ph} x={X0 - 12} y={y(ph) + 4} className="tick-label" textAnchor="end">
                    {ph}
                  </text>
                ))}
                {Array.from({ length: 6 }, (_, i) => (q.maxVolume * i) / 5).map((v) => (
                  <text key={v} x={x(v)} y={Y1 + 22} className="tick-label" textAnchor="middle">
                    {v.toFixed(1)}
                  </text>
                ))}
                <text x={(X0 + X1) / 2} y={430} className="axis-label" textAnchor="middle">
                  Volume of {q.titrantName} added / cm³
                </text>
                <text
                  x={18}
                  y={(Y0 + Y1) / 2}
                  textAnchor="middle"
                  transform="rotate(-90 18 201)"
                  className="axis-label"
                >
                  pH
                </text>
              </g>
              <g className="chart-guides">
                {(state.before || state.after) && (
                  <circle
                    cx={x(state.equivalenceVolume)}
                    cy={y(plotted.equivalencePH)}
                    r={5}
                    className="curve-join"
                  />
                )}
                <line
                  x1={X0 - 8}
                  x2={X0}
                  y1={y(state.initialPH)}
                  y2={y(state.initialPH)}
                  className="guide"
                />
                <text
                  x={X0 + 9}
                  y={y(state.initialPH) - 9}
                  className="guide-label"
                  textAnchor="start"
                >
                  initial pH {state.initialPH.toFixed(1)}
                </text>
                <line
                  x1={x(state.equivalenceVolume)}
                  x2={x(state.equivalenceVolume)}
                  y1={y(plotted.equivalencePH)}
                  y2={Y1}
                  className="guide-eq"
                />
                <text
                  x={
                    x(state.equivalenceVolume) < 205
                      ? Math.min(470, x(state.equivalenceVolume) + 7)
                      : x(state.equivalenceVolume) - 7
                  }
                  y={y(plotted.equivalencePH) - 9}
                  className="guide-label"
                  textAnchor={x(state.equivalenceVolume) < 205 ? 'start' : 'end'}
                >
                  equivalence {state.equivalenceVolume.toFixed(1)} cm³ · pH{' '}
                  {plotted.equivalencePH.toFixed(1)}
                </text>
                <line
                  x1={X1}
                  x2={X0}
                  y1={y(state.finalPH)}
                  y2={y(state.finalPH)}
                  className="guide"
                />
                <text x={X1 - 9} y={y(state.finalPH) - 9} textAnchor="end" className="guide-label">
                  final pH {state.finalPH.toFixed(1)}
                </text>
              </g>
              <path
                d={path(plotted.before)}
                className="curve curve-before"
                filter={'url(#' + glowId + ')'}
              />
              <path
                d={path(plotted.after)}
                className="curve curve-after"
                filter={'url(#' + glowId + ')'}
              />
              <g filter={'url(#' + glowId + ')'}>
                {handle('initialPH', 'Initial pH anchor', X0, y(state.initialPH))}
                {handle(
                  'equivalenceVolume',
                  'Equivalence volume anchor',
                  x(state.equivalenceVolume),
                  y(plotted.equivalencePH),
                )}
                {handle('finalPH', 'Final pH anchor', X1, y(state.finalPH))}
              </g>
            </svg>
          </div>
          <p className="keyboard-help">
            Drag a glowing handle, or focus it and use <kbd>↑</kbd>
            <kbd>↓</kbd> <kbd>←</kbd>
            <kbd>→</kbd>. pH snaps to 0.1; volume snaps to 0.5 cm³.{' '}
            <span className="mobile-hint">Swipe the graph sideways on a small screen.</span>
          </p>
          <details className="tc-alternatives">
            <summary>Keyboard and non-drag controls</summary>
            <fieldset disabled={readOnly} className="tc-numeric">
              <legend>Curve anchors</legend>
              {(
                [
                  { field: 'initialPH', label: 'Initial pH' },
                  { field: 'equivalenceVolume', label: 'Equivalence volume / cm³' },
                  { field: 'finalPH', label: 'Final pH' },
                ] as const
              ).map(({ field, label }) => (
                <AnchorInput
                  key={q.id + ':' + field}
                  label={label}
                  value={state[field]}
                  min={field === 'equivalenceVolume' ? 0.5 : 0}
                  max={field === 'equivalenceVolume' ? q.maxVolume - 0.5 : 14}
                  step={field === 'equivalenceVolume' ? 0.5 : 0.1}
                  readOnly={readOnly}
                  onCommit={(value) => {
                    const next = constrain(q, { ...latest.current, [field]: value });
                    commit({ [field]: value });
                    return next[field];
                  }}
                />
              ))}
            </fieldset>
            <button
              type="button"
              disabled={readOnly || !history.length}
              onClick={() => {
                const old = history.at(-1);
                if (old) {
                  setHistory((h) => h.slice(0, -1));
                  latest.current = old;
                  onResponse(old);
                }
              }}
            >
              Undo curve edit
            </button>
          </details>
        </section>
      </section>
      {workspaceAside && <div className="tc-shared-answer">{workspaceAside}</div>}
    </div>
  );
}
