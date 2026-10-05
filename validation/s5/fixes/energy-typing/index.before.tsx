import { DiagramViewport } from '../../ui/DiagramViewport.tsx';
import { useId, useRef, useState } from 'react';
import type { PointerEvent, KeyboardEvent } from 'react';
import type { EditorSurfaceProps } from '../../ui/EditorFrame.tsx';
import type { EnergyProfileState, EnergyAnchor, EnergyArrowEnd } from '../../contracts/editors.ts';
import { record } from '../../activities/igcse/energy-enthalpy/provider.ts';
import { endY, initialProfile } from '../../chemistry/energy-profile/index.ts';
import { profileSVG } from '../../chemistry/energy-profile/svg.ts';
const clone = (m: EnergyProfileState): EnergyProfileState => structuredClone(m);
const clamp = (y: number) => Math.max(55, Math.min(340, y));
type Target =
  | { kind: 'level'; level: EnergyAnchor }
  | { kind: 'end'; name: 'ea' | 'delta'; end: 'head' | 'tail' }
  | { kind: 'shaft'; name: 'ea' | 'delta' };
export function EnergyProfileEditor({ part, response, readOnly, onResponse }: EditorSurfaceProps) {
  const q = record(part.markingPolicyId.split(':')[1] ?? ''),
    e = q.editor!;
  const initial = part.kind === 'energy-profile' ? part.initial : initialProfile(q);
  const m = response?.kind === 'energy-profile' ? response : initial;
  const [draft, setDraft] = useState<EnergyProfileState | null>(null),
    [history, setHistory] = useState<EnergyProfileState[]>([]);
  const [status, setStatus] = useState(''),
    drag = useRef<{ target: Target; base: EnergyProfileState; x: number; y: number } | null>(null),
    live = useRef<EnergyProfileState | null>(null);
  const svg = useRef<SVGSVGElement>(null),
    id = useId(),
    shown = draft ?? m;
  const save = (next: EnergyProfileState) => {
    if (readOnly) return;
    setHistory((h) => [...h.slice(-79), clone(m)]);
    onResponse(next);
  };
  const movable = (k: EnergyAnchor) => !e.fixed && !(k === 'r' && e.fixedR);
  const place = (
    target: Target,
    x: number,
    y: number,
    base: EnergyProfileState,
  ): EnergyProfileState => {
    if (target.kind === 'level') {
      if (!movable(target.level)) return base;
      let level = clamp(y);
      if (e.type === 'catalyst' && target.level !== 'peak') {
        const expected = target.level === 'r' ? 220 : 300;
        if (Math.abs(level - expected) < 14) level = expected;
      }
      return { ...base, [target.level]: level };
    }
    const a = base.arrows[target.name];
    if (!a) return base;
    const next = { ...a, x: Math.max(85, Math.min(590, x)) };
    if (target.kind === 'end') {
      const candidates: EnergyAnchor[] = e.type === 'levels' ? ['r', 'p'] : ['r', 'p', 'peak'];
      const nearest = candidates.sort((a, b) => Math.abs(base[a] - y) - Math.abs(base[b] - y))[0]!;
      const tolerance = (18 * 640) / (svg.current?.getBoundingClientRect().width ?? 640);
      const end: EnergyArrowEnd =
        Math.abs(base[nearest] - y) <= tolerance ? { anchor: nearest } : { y: clamp(y) };
      return { ...base, arrows: { ...base.arrows, [target.name]: { ...next, [target.end]: end } } };
    }
    const d = drag.current;
    const dy = y - (d?.y ?? y);
    return {
      ...base,
      arrows: {
        ...base.arrows,
        [target.name]: {
          ...next,
          tail: { y: clamp(endY(base, a.tail) + dy) },
          head: { y: clamp(endY(base, a.head) + dy) },
        },
      },
    };
  };
  const point = (event: PointerEvent) => {
    const rect = svg.current!.getBoundingClientRect();
    return {
      x: ((event.clientX - rect.left) * 640) / rect.width,
      y: ((event.clientY - rect.top) * 415) / rect.height,
    };
  };
  const down = (event: PointerEvent<SVGElement>, target: Target) => {
    if (readOnly || event.button > 0) return;
    if (target.kind === 'level' && !movable(target.level)) {
      setStatus('This energy level is supplied and fixed.');
      return;
    }
    event.preventDefault();
    const p = point(event);
    drag.current = { target, base: clone(m), ...p };
    live.current = clone(m);
    svg.current?.setPointerCapture(event.pointerId);
  };
  const move = (event: PointerEvent<SVGSVGElement>) => {
    const d = drag.current;
    if (!d) return;
    const p = point(event),
      next = place(d.target, p.x, p.y, d.base);
    live.current = next;
    setDraft(next);
  };
  const up = (event: PointerEvent<SVGSVGElement>) => {
    if (!drag.current) return;
    drag.current = null;
    setDraft(null);
    if (live.current) save(live.current);
    live.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId))
      event.currentTarget.releasePointerCapture(event.pointerId);
    setStatus('Profile changed.');
  };
  const key = (event: KeyboardEvent<SVGElement>, target: Target) => {
    if (readOnly) return;
    if (!event.key.startsWith('Arrow')) return;
    event.preventDefault();
    if (target.kind === 'level') {
      if (movable(target.level))
        save({
          ...m,
          [target.level]: clamp(
            m[target.level] + (event.key === 'ArrowUp' ? -20 : event.key === 'ArrowDown' ? 20 : 0),
          ),
        });
      return;
    }
    const a = m.arrows[target.name];
    if (!a) return;
    const dx = event.key === 'ArrowLeft' ? -10 : event.key === 'ArrowRight' ? 10 : 0,
      dy = event.key === 'ArrowUp' ? -20 : event.key === 'ArrowDown' ? 20 : 0;
    save({
      ...m,
      arrows: {
        ...m.arrows,
        [target.name]:
          target.kind === 'end'
            ? { ...a, x: a.x + dx, [target.end]: { y: clamp(endY(m, a[target.end]) + dy) } }
            : { ...a, x: a.x + dx },
      },
    });
  };
  const arrowChange = (name: 'ea' | 'delta', end: 'head' | 'tail', value: string) => {
    const a = m.arrows[name];
    if (!a) return;
    save({
      ...m,
      arrows: {
        ...m.arrows,
        [name]: {
          ...a,
          [end]: value === 'free' ? { y: endY(m, a[end]) } : { anchor: value as EnergyAnchor },
        },
      },
    });
  };
  const endpointControl = (name: 'ea' | 'delta', end: 'head' | 'tail') => {
    const a = m.arrows[name];
    if (!a) return null;
    const endpoint = a[end],
      value = 'anchor' in endpoint ? endpoint.anchor : 'free';
    return (
      <div key={end}>
        <label htmlFor={`${id}-${name}-${end}`}>
          {end === 'head' ? 'Arrowhead' : 'Tail'}
          <select
            aria-label={end === 'head' ? 'Arrowhead' : 'Tail'}
            id={`${id}-${name}-${end}`}
            disabled={readOnly}
            value={value}
            onChange={(event) => arrowChange(name, end, event.target.value)}
          >
            <option value="free">Free position</option>
            <option value="r">Left energy level</option>
            <option value="p">Right energy level</option>
            {e.type !== 'levels' && <option value="peak">Peak</option>}
          </select>
        </label>
        {value === 'free' && (
          <label>
            Endpoint screen y
            <input
              type="number"
              min={55}
              max={340}
              disabled={readOnly}
              value={endY(m, endpoint)}
              onChange={(event) =>
                save({
                  ...m,
                  arrows: {
                    ...m.arrows,
                    [name]: { ...a, [end]: { y: clamp(Number(event.target.value)) } },
                  },
                })
              }
            />
          </label>
        )}
      </div>
    );
  };
  return (
    <div className="energy-profile-editor">
      <p>
        Drag a level or an arrow endpoint, or use the controls below. Focus a graph handle and use
        arrow keys. An attached endpoint follows its energy level. On narrow screens, swipe across
        empty graph space or scroll horizontally to see the full profile.
      </p>
      <div className="action-row">
        <button
          type="button"
          disabled={readOnly || !history.length}
          onClick={() => {
            const previous = history.at(-1);
            if (previous) {
              setHistory((h) => h.slice(0, -1));
              onResponse(previous);
            }
          }}
        >
          Undo profile edit
        </button>
        <button type="button" disabled={readOnly} onClick={() => save(initial)}>
          Reset profile
        </button>
        {e.arrows
          .filter((name) => !m.arrows[name])
          .map((name) => (
            <button
              type="button"
              disabled={readOnly}
              key={name}
              onClick={() =>
                save({
                  ...m,
                  arrows: {
                    ...m.arrows,
                    [name]: {
                      x: name === 'ea' ? (e.eaX ?? 285) : 560,
                      tail: { y: 255 },
                      head: { y: 165 },
                    },
                  },
                })
              }
            >
              Add {name === 'ea' ? 'activation energy' : 'enthalpy change'} arrow
            </button>
          ))}
      </div>
      <DiagramViewport label="Energy profile">
        <div
          className="energy-graph"
          style={{ position: 'relative', maxWidth: 760, margin: 'auto' }}
        >
          <div aria-hidden="true" dangerouslySetInnerHTML={{ __html: profileSVG(shown, e) }} />
          <svg
            ref={svg}
            viewBox="0 0 640 415"
            aria-label="Editable energy profile"
            role="group"
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              touchAction: 'pan-x',
            }}
            onPointerMove={move}
            onPointerUp={up}
            onPointerCancel={() => {
              drag.current = null;
              live.current = null;
              setDraft(null);
            }}
          >
            {(['r', 'p', ...(e.type === 'levels' ? [] : ['peak'])] as EnergyAnchor[]).map(
              (level) => (
                <circle
                  style={{ touchAction: 'none' }}
                  key={level}
                  cx={level === 'r' ? 155 : level === 'p' ? 465 : 320}
                  cy={shown[level]}
                  r={17}
                  fill={readOnly ? 'transparent' : '#087b9b33'}
                  stroke={readOnly ? 'none' : '#087b9b'}
                  tabIndex={readOnly ? -1 : 0}
                  role="button"
                  aria-label={`${level === 'r' ? 'Left' : level === 'p' ? 'Right' : 'Peak'} energy level${movable(level) ? ', use up and down keys' : ', fixed'}`}
                  onPointerDown={(event) => down(event, { kind: 'level', level })}
                  onKeyDown={(event) => key(event, { kind: 'level', level })}
                />
              ),
            )}
            {Object.entries(shown.arrows).map(
              ([name, a]) =>
                a && (
                  <g key={name}>
                    <line
                      style={{ touchAction: 'none' }}
                      x1={a.x}
                      x2={a.x}
                      y1={endY(shown, a.tail)}
                      y2={endY(shown, a.head)}
                      stroke="transparent"
                      strokeWidth={24}
                      tabIndex={readOnly ? -1 : 0}
                      role="button"
                      aria-label={`${name === 'ea' ? 'Activation energy' : 'Enthalpy change'} arrow position`}
                      onPointerDown={(event) =>
                        down(event, { kind: 'shaft', name: name as 'ea' | 'delta' })
                      }
                      onKeyDown={(event) =>
                        key(event, { kind: 'shaft', name: name as 'ea' | 'delta' })
                      }
                    />
                    {(['head', 'tail'] as const).map((end) => (
                      <circle
                        style={{ touchAction: 'none' }}
                        key={end}
                        cx={a.x}
                        cy={endY(shown, a[end])}
                        r={13}
                        fill={readOnly ? 'transparent' : '#ffffff77'}
                        stroke={readOnly ? 'none' : end === 'head' ? '#006944' : '#856000'}
                        tabIndex={readOnly ? -1 : 0}
                        role="button"
                        aria-label={`${name === 'ea' ? 'Activation energy' : 'Enthalpy change'} ${end === 'head' ? 'arrowhead' : 'tail'}, use arrow keys or endpoint controls`}
                        onPointerDown={(event) =>
                          down(event, { kind: 'end', name: name as 'ea' | 'delta', end })
                        }
                        onKeyDown={(event) =>
                          key(event, { kind: 'end', name: name as 'ea' | 'delta', end })
                        }
                      />
                    ))}
                  </g>
                ),
            )}
          </svg>
        </div>
      </DiagramViewport>
      <p role="status">{status}</p>
      <p>
        {shown.left || 'Unlabelled'} is the left level; {shown.right || 'unlabelled'} is the right
        level. The right level is{' '}
        {shown.p < shown.r ? 'higher' : shown.p > shown.r ? 'lower' : 'equal'} in energy. Arrow
        endpoints:{' '}
        {Object.entries(shown.arrows)
          .map(([name, a]) =>
            a
              ? `${name}: ${'anchor' in a.tail ? a.tail.anchor : 'free'} to ${'anchor' in a.head ? a.head.anchor : 'free'}`
              : '',
          )
          .join('; ')}
        .
      </p>
      <fieldset disabled={readOnly}>
        <legend>Keyboard, touch and non-drag profile controls</legend>
        <p>Screen y is 55 near the top and 340 near the bottom; a smaller y means higher energy.</p>
        {(['r', 'p', ...(e.type === 'levels' ? [] : ['peak'])] as EnergyAnchor[]).map((level) => (
          <label key={level}>
            {level === 'r' ? 'Left' : level === 'p' ? 'Right' : 'Peak'} level screen y
            <input
              aria-label={`${level === 'r' ? 'Left' : level === 'p' ? 'Right' : 'Peak'} level screen y`}
              type="number"
              min={55}
              max={340}
              disabled={!movable(level)}
              value={m[level]}
              onChange={(event) => save({ ...m, [level]: clamp(Number(event.target.value)) })}
            />
          </label>
        ))}
        {e.formula &&
          (['left', 'right'] as const).map((side) => (
            <label key={side}>
              {side === 'left' ? 'Left' : 'Right'} formula label
              <select
                aria-label={`${side === 'left' ? 'Left' : 'Right'} formula label`}
                value={m[side]}
                onChange={(event) => {
                  const value = event.target.value,
                    other = side === 'left' ? 'right' : 'left';
                  save({
                    ...m,
                    [side]: value,
                    ...(value && m[other] === value ? { [other]: '' } : {}),
                  });
                }}
              >
                <option value="">Place label</option>
                {e.formula?.map((f) => (
                  <option key={f}>{f}</option>
                ))}
              </select>
            </label>
          ))}
        {e.axes &&
          (['vertical', 'horizontal'] as const).map((axis) => (
            <label key={axis}>
              {axis === 'vertical' ? 'Vertical' : 'Horizontal'} axis label
              <input
                aria-label={`${axis === 'vertical' ? 'Vertical' : 'Horizontal'} axis label`}
                value={m[axis]}
                onChange={(event) => save({ ...m, [axis]: event.target.value })}
              />
            </label>
          ))}
        {e.pathLabel && (
          <label>
            New pathway label
            <input
              aria-label="New pathway label"
              value={m.pathLabel}
              onChange={(event) => save({ ...m, pathLabel: event.target.value })}
            />
          </label>
        )}
        {e.arrows.map(
          (name) =>
            m.arrows[name] && (
              <fieldset key={name}>
                <legend>{name === 'ea' ? 'Activation energy' : 'Enthalpy change'} arrow</legend>
                {endpointControl(name, 'tail')}
                {endpointControl(name, 'head')}
                <label>
                  Arrow x position
                  <input
                    aria-label="Arrow x position"
                    type="number"
                    min={85}
                    max={590}
                    value={m.arrows[name]?.x ?? 0}
                    onChange={(event) => {
                      const a = m.arrows[name];
                      if (a)
                        save({
                          ...m,
                          arrows: {
                            ...m.arrows,
                            [name]: {
                              ...a,
                              x: Math.max(85, Math.min(590, Number(event.target.value))),
                            },
                          },
                        });
                    }}
                  />
                </label>
                <button
                  type="button"
                  onClick={() => {
                    const arrows = { ...m.arrows };
                    delete arrows[name];
                    save({ ...m, arrows });
                  }}
                >
                  Remove {name === 'ea' ? 'activation energy' : 'enthalpy change'} arrow
                </button>
              </fieldset>
            ),
        )}
      </fieldset>
    </div>
  );
}
