import { useEffect, useRef, useState } from 'react';
import type { KeyboardEvent, PointerEvent } from 'react';
import type {
  MoleculeElement,
  MoleculeGraph,
  MoleculeState,
  Point,
} from '../../contracts/editors.ts';
import { blankMolecule, core, moleculeEngine } from '../../chemistry/molecule/engine.ts';
import type { MoleculeCommand } from '../../chemistry/molecule/engine.ts';
import {
  applyTarget,
  destination,
  gestureGraph,
  LENGTH,
  STEP,
} from '../../chemistry/molecule/interaction.ts';
import type { MoleculeTarget } from '../../chemistry/molecule/interaction.ts';
import { bondLines, drawingViewBox, thumbnailViewBox } from '../../chemistry/molecule/depiction.ts';
import type { Representation } from '../../chemistry/molecule/depiction.ts';
import { Structure } from './Structure.tsx';
import { MoleculeInspector } from './MoleculeInspector.tsx';
import './molecule.css';
const elements: MoleculeElement[] = ['C', 'O', 'N', 'Cl', 'F', 'H'];
function targetOf(node: EventTarget | null): MoleculeTarget | null {
  const e = node instanceof Element ? node : null,
    a = e?.closest('[data-atom]'),
    b = e?.closest('[data-bond]');
  if (a) return { kind: 'atom', id: Number(a.getAttribute('data-atom')) };
  if (b) {
    const [x, y] = b.getAttribute('data-bond')!.split(':').map(Number);
    return { kind: 'bond', a: x!, b: y! };
  }
  return null;
}
export function MoleculePreview({
  graph,
  label = 'Saved molecular structure',
}: {
  graph: MoleculeGraph;
  label?: string;
}) {
  return (
    <svg
      className="molecule-preview stage-preview"
      viewBox={thumbnailViewBox(graph)}
      role="img"
      aria-label={label}
    >
      <Structure graph={graph} view="skeletal" />
    </svg>
  );
}
export interface MoleculeEditorProps {
  readonly value: MoleculeState;
  readonly onChange: (value: MoleculeState) => void;
  readonly readOnly: boolean;
  readonly label?: string;
}
interface Drag {
  pointerId: number;
  target: MoleculeTarget | null;
  start: Point;
  end: Point;
  screenX: number;
  screenY: number;
  moved: boolean;
}
export function MoleculeEditor({
  value = blankMolecule(),
  onChange,
  readOnly,
  label = 'Molecular drawing',
}: MoleculeEditorProps) {
  const [element, setElement] = useState<MoleculeElement>('C'),
    [order, setOrder] = useState<1 | 2 | 3>(1),
    [chain, setChain] = useState(false),
    [erasing, setErasing] = useState(false),
    [view, setView] = useState<Representation>('skeletal'),
    [selected, setSelected] = useState<number | null>(null),
    [message, setMessage] = useState(''),
    [drag, setDrag] = useState<Drag | null>(null),
    [keyboard, setKeyboard] = useState<{ id: number; angle: number } | null>(null);
  const [size, setSize] = useState({ w: 600, h: 400 }),
    [manual, setManual] = useState<ReturnType<typeof drawingViewBox> | null>(null),
    canvas = useRef<SVGSVGElement>(null),
    gesture = useRef<Drag | null>(null),
    state = useRef(value),
    locked = useRef(readOnly);
  state.current = value;
  locked.current = readOnly;
  const graph = value.graph,
    valid = core.validate(graph),
    viewport = manual ?? drawingViewBox(graph, size.w, size.h);
  const cancel = () => {
    const g = gesture.current;
    gesture.current = null;
    if (g && canvas.current?.hasPointerCapture(g.pointerId))
      canvas.current.releasePointerCapture(g.pointerId);
    setDrag(null);
    setKeyboard(null);
  };
  useEffect(() => {
    const node = canvas.current;
    if (!node) return;
    const observer = new ResizeObserver(() => {
      const r = node.getBoundingClientRect();
      setSize({ w: r.width || 600, h: r.height || 400 });
      gesture.current = null;
      setDrag(null);
      setKeyboard(null);
    });
    observer.observe(node.parentElement!);
    return () => {
      observer.disconnect();
      gesture.current = null;
    };
  }, []);
  useEffect(() => {
    if (readOnly) cancel();
  }, [readOnly]);
  useEffect(() => {
    cancel();
    setSelected(null);
  }, [label]);
  useEffect(() => {
    setManual(null);
  }, [graph]);
  const focus = (t: MoleculeTarget | null) =>
    requestAnimationFrame(() => {
      const node = t
        ? canvas.current?.querySelector<SVGElement>(
            t.kind === 'atom' ? `[data-atom="${t.id}"]` : `[data-bond="${t.a}:${t.b}"]`,
          )
        : canvas.current;
      node?.focus({ preventScroll: true });
    });
  const send = (cmd: MoleculeCommand, announcement = '') => {
    if (locked.current) return false;
    try {
      const before = state.current,
        next = moleculeEngine.apply(before, cmd);
      if (next === before) {
        if (announcement) setMessage(announcement);
        return false;
      }
      state.current = next;
      onChange(next);
      setMessage(announcement);
      return true;
    } catch (e) {
      setMessage(String(e));
      return false;
    }
  };
  const commit = (g: MoleculeGraph, text = '') => send({ kind: 'commit-graph', graph: g }, text),
    scale = () => canvas.current?.getScreenCTM()?.a || 1;
  const point = (e: { clientX: number; clientY: number }): Point => {
    const m = canvas.current?.getScreenCTM();
    if (!m) return { x: 0, y: 0 };
    const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(m.inverse());
    return { x: p.x, y: p.y };
  };
  const choose = (e: MoleculeElement) => {
      cancel();
      setElement(e);
      setChain(false);
      setErasing(false);
    },
    toggleChain = () => {
      cancel();
      setChain(!chain || erasing);
      setElement('C');
      setOrder(1);
      setErasing(false);
    };
  const grow = (id: number, end: Point) => {
    const start = state.current.graph.atoms.find((a) => a.id === id);
    if (!start) return;
    const next = gestureGraph(
      state.current.graph,
      { target: { kind: 'atom', id }, start },
      end,
      element,
      order,
      false,
      scale(),
    );
    if (commit(next, 'Bond added.'))
      focus({ kind: 'atom', id: destination(state.current.graph, start, end, scale()).id ?? next.atoms.at(-1)!.id });
    else
      setMessage(
        'That space is occupied or those atoms are already connected. Tap a bond to change its order.',
      );
  };
  const apply = (t: MoleculeTarget | null, p: Point) => {
    const before = state.current.graph,
      next = applyTarget(before, t, p, element, erasing);
    if (
      commit(
        next,
        erasing
          ? 'Removed.'
          : t?.kind === 'bond'
            ? 'Bond order changed.'
            : `${core.names[element]} added or changed.`,
      )
    ) {
      if (!t) focus({ kind: 'atom', id: next.atoms.at(-1)!.id });
      else if (erasing) focus(null);
    } else if (core.heavyCount(before) >= core.LIMIT)
      setMessage('This canvas holds up to twenty heavy atoms. Erase an atom to make room.');
  };
  const keyDown = (e: KeyboardEvent<SVGSVGElement>) => {
    if (readOnly) return;
    const t = targetOf(e.target);
    if (e.key === 'Escape') {
      e.preventDefault();
      cancel();
      return;
    }
    if (['Delete', 'Backspace'].includes(e.key) && t) {
      e.preventDefault();
      cancel();
      commit(core.remove(state.current.graph, t), 'Removed.');
      focus(null);
      return;
    }
    if (e.key.startsWith('Arrow') && t?.kind === 'atom' && !erasing) {
      e.preventDefault();
      let a = keyboard?.id === t.id ? keyboard.angle : -STEP;
      if (e.key === 'ArrowLeft') a -= STEP;
      if (e.key === 'ArrowRight') a += STEP;
      if (e.key === 'ArrowUp') a = -Math.PI / 2;
      if (e.key === 'ArrowDown') a = Math.PI / 2;
      setKeyboard({ id: t.id, angle: a });
      return;
    }
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (keyboard) {
        const a = state.current.graph.atoms.find((a) => a.id === keyboard.id)!;
        grow(a.id, {
          x: a.x + LENGTH * Math.cos(keyboard.angle),
          y: a.y + LENGTH * Math.sin(keyboard.angle),
        });
        setKeyboard(null);
      } else apply(t, { x: 0, y: 0 });
    }
  };
  const preview = (() => {
    if (drag?.moved && !erasing && (chain || !drag.target))
      return gestureGraph(graph, drag, drag.end, element, order, chain, scale());
    let start, end;
    if (drag?.moved && drag.target?.kind === 'atom' && !erasing) {
      start = graph.atoms.find((a) => a.id === (drag.target as { id: number }).id);
      if (start) end = destination(graph, start, drag.end, scale());
    } else if (keyboard) {
      start = graph.atoms.find((a) => a.id === keyboard.id);
      if (start)
        end = destination(
          graph,
          start,
          {
            x: start.x + LENGTH * Math.cos(keyboard.angle),
            y: start.y + LENGTH * Math.sin(keyboard.angle),
          },
          scale(),
        );
    }
    return start && end ? { start, end } : null;
  })();
  const down = (e: PointerEvent<SVGSVGElement>) => {
    if (readOnly || !e.isPrimary || e.button !== 0 || gesture.current) return;
    e.preventDefault();
    setKeyboard(null);
    const t = targetOf(e.target),
      p = point(e);
    if (t?.kind === 'atom') setSelected(t.id);
    focus(t);
    const g = {
      pointerId: e.pointerId,
      target: t,
      start: p,
      end: p,
      screenX: e.clientX,
      screenY: e.clientY,
      moved: false,
    };
    gesture.current = g;
    setDrag(g);
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const move = (e: PointerEvent<SVGSVGElement>) => {
    const g = gesture.current;
    if (!g || g.pointerId !== e.pointerId) return;
    const next = {
      ...g,
      end: point(e),
      moved: g.moved || Math.hypot(e.clientX - g.screenX, e.clientY - g.screenY) > 9,
    };
    gesture.current = next;
    setDrag(next);
  };
  const up = (e: PointerEvent<SVGSVGElement>) => {
    const g = gesture.current;
    if (!g || g.pointerId !== e.pointerId) return;
    const end = point(e),
      r = e.currentTarget.getBoundingClientRect();
    cancel();
    if (
      readOnly ||
      e.clientX < r.left ||
      e.clientX > r.right ||
      e.clientY < r.top ||
      e.clientY > r.bottom
    )
      return;
    if (g.moved && !erasing && (chain || !g.target)) {
      if (Math.hypot(e.clientX - g.screenX, e.clientY - g.screenY) >= 18) {
        const next = gestureGraph(state.current.graph, g, end, element, order, chain, scale());
        if (
          commit(next, chain ? 'Carbon chain added. Undo removes this whole drag.' : 'Bond added.')
        )
          focus({ kind: 'atom', id: next.atoms.at(-1)!.id });
      }
    } else if (g.moved && g.target?.kind === 'atom' && !erasing) {
      if (Math.hypot(e.clientX - g.screenX, e.clientY - g.screenY) >= 18) grow(g.target.id, end);
    } else if (!g.moved) apply(g.target, g.start);
  };
  const zoom = (factor: number) => {
    cancel();
    setManual({
      x: viewport.x + (viewport.w * (1 - factor)) / 2,
      y: viewport.y + (viewport.h * (1 - factor)) / 2,
      w: Math.max(160, Math.min(2560, viewport.w * factor)),
      h: Math.max(110, Math.min(2000, viewport.h * factor)),
    });
  };
  return (
    <section
      className="molecule-editor"
      aria-label={label}
      onKeyDown={(e) => {
        if (readOnly || e.altKey) return;
        if (e.ctrlKey || e.metaKey) {
          if (e.key.toLowerCase() === 'z' && !e.shiftKey) {
            e.preventDefault();
            cancel();
            send({ kind: 'undo' }, 'Last edit undone.');
          }
          return;
        }
        if (/INPUT|TEXTAREA|SELECT/.test((e.target as Element).tagName)) return;
        const keys: Record<string, MoleculeElement> = {
            c: 'C',
            o: 'O',
            n: 'N',
            f: 'F',
            l: 'Cl',
            h: 'H',
          },
          k = e.key.toLowerCase();
        if (keys[k]) choose(keys[k]);
        if (k === '3') toggleChain();
        if (k === 'e') {
          cancel();
          setErasing(!erasing);
        }
      }}
    >
      <p className="drawing-instruction">
        Tap to place an atom, or drag to draw a bond. Choose Chain to draw several carbons.
      </p>
      <div className="drawing-card">
        <div className="editor-bar">
          <div className="tools" role="toolbar" aria-label="Drawing tools">
            <div className="tool-group" role="group" aria-label="Element">
              {elements.map((e) => (
                <button
                  type="button"
                  key={e}
                  className="tool atom-tool"
                  data-element={e}
                  disabled={readOnly}
                  aria-label={core.names[e]}
                  title={`${core.names[e]} (${e === 'Cl' ? 'L' : e})`}
                  aria-pressed={element === e && !erasing && !chain}
                  onClick={() => choose(e)}
                >
                  {e}
                </button>
              ))}
            </div>
            <span className="divider" aria-hidden="true" />
            <button
              type="button"
              className="tool"
              aria-label="Carbon chain"
              title="Toggle carbon chain (3)"
              disabled={readOnly}
              aria-pressed={chain && !erasing}
              onClick={toggleChain}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="m2 16 5-8 5 8 5-8 5 8" />
              </svg>
            </button>
            <button
              type="button"
              className="tool"
              aria-label="Erase"
              title="Erase (E)"
              disabled={readOnly}
              aria-pressed={erasing}
              onClick={() => {
                cancel();
                setErasing(!erasing);
              }}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="m13 4 7 7-9 9H7l-4-4L13 4Zm-7 9 7 7M11 20h10" />
              </svg>
            </button>
            <button
              type="button"
              className="tool"
              aria-label="Undo"
              title="Undo (Ctrl+Z)"
              disabled={readOnly || !value.history.length}
              onClick={() => {
                cancel();
                send({ kind: 'undo' }, 'Last edit undone.');
              }}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M9 5 4 10l5 5M4 10h10a6 6 0 0 1 0 12" transform="translate(0 -2)" />
              </svg>
            </button>
          </div>
          <button
            type="button"
            className="clean-button"
            disabled={readOnly || graph.atoms.length < 2}
            onClick={() => {
              cancel();
              send(
                { kind: 'clean' },
                'Layout tidied. Connections are unchanged. Undo restores the original layout.',
              );
            }}
          >
            Clean up
          </button>
          <button
            type="button"
            className="clear-button"
            disabled={readOnly || !graph.atoms.length}
            onClick={() => {
              cancel();
              send({ kind: 'clear' }, 'Canvas cleared. Undo will restore it.');
              setSelected(null);
            }}
          >
            Clear structure
          </button>
          <div className="view-switch" role="group" aria-label="Formula representation">
            {(['skeletal', 'structural'] as const).map((v) => (
              <button
                type="button"
                key={v}
                data-view={v}
                aria-pressed={view === v}
                onClick={() => {
                  cancel();
                  setView(v);
                }}
              >
                {v === 'skeletal' ? 'Skeletal' : 'Structural'}
              </button>
            ))}
          </div>
        </div>
        <div className="canvas-wrap">
          <svg
            ref={canvas}
            className={`molecule-workspace${erasing ? ' erasing' : ''}`}
            tabIndex={0}
            viewBox={`${viewport.x} ${viewport.y} ${viewport.w} ${viewport.h}`}
            role="group"
            aria-label={`${label}. Molecule drawing area. Drag to grow bonds. Arrow keys on an atom preview a bond; Enter commits.`}
            onPointerDown={down}
            onPointerMove={move}
            onPointerUp={up}
            onPointerCancel={cancel}
            onLostPointerCapture={() => {
              if (gesture.current) cancel();
            }}
            onKeyDown={keyDown}
            onBlur={() => setKeyboard(null)}
          >
            <title>Your molecule</title>
            <Structure
              graph={graph}
              view={view}
              interactive
              invalid={valid.atoms ?? []}
              onSelect={setSelected}
            />
            <g className="mechanism-annotations" />
            <g className="molecule-gesture-preview" aria-hidden="true">
              {preview &&
                ('atoms' in preview ? (
                  <g className="ghost">
                    {preview.bonds.slice(graph.bonds.length).map((b, i) => {
                      const a = preview.atoms.find((a) => a.id === b.a)!,
                        c = preview.atoms.find((a) => a.id === b.b)!;
                      return bondLines(a, c, b.order).map((line, j) => (
                        <line key={`${i}-${j}`} className="bond-line" {...line} />
                      ));
                    })}
                    {preview.atoms.slice(graph.atoms.length).map((a) => (
                      <circle key={a.id} cx={a.x} cy={a.y} r={5} className="preview-end" />
                    ))}
                  </g>
                ) : (
                  <g className="ghost">
                    {bondLines(preview.start, preview.end, order).map((line, i) => (
                      <line key={i} className="bond-line" {...line} />
                    ))}
                    <circle cx={preview.end.x} cy={preview.end.y} r={5} className="preview-end" />
                    {preview.end.id !== undefined && (
                      <circle
                        cx={preview.end.x}
                        cy={preview.end.y}
                        r={25}
                        className="preview-target"
                      />
                    )}
                  </g>
                ))}
            </g>
          </svg>
        </div>
      </div>
      <details className="drawing-help">
        <summary>Drawing help</summary>
        <p>
          Choose an element, then tap to place it or drag from an atom to extend the structure. Tap
          a bond to change its order. Join existing atoms to close a ring. Hydrogens are added
          automatically; the H tool draws them explicitly.
        </p>
        <p>
          Keyboard: C/O/N/F/H choose an element; L selects chlorine; 3 toggles Chain; E selects
          Erase. Tab reaches the canvas, atoms and bonds. Enter places or changes an atom; arrow
          keys on an atom preview a bond and Enter commits it. Delete erases, Ctrl+Z undoes, and
          Escape cancels.
        </p>
      </details>
      <details className="molecule-alternatives">
        <summary>Alternative controls and view</summary>
        <div className="molecule-tools molecule-view-tools">
          <button
            type="button"
            onClick={() => {
              cancel();
              setManual(null);
            }}
          >
            Fit molecule
          </button>
          <button type="button" onClick={() => zoom(0.8)}>
            Zoom in
          </button>
          <button type="button" onClick={() => zoom(1.25)}>
            Zoom out
          </button>
          {(['left', 'right', 'up', 'down'] as const).map((d) => (
            <button
              type="button"
              key={d}
              aria-label={`Pan ${d}`}
              onClick={() => {
                cancel();
                setManual({
                  ...viewport,
                  x:
                    viewport.x +
                    (d === 'left' ? -viewport.w / 4 : d === 'right' ? viewport.w / 4 : 0),
                  y:
                    viewport.y + (d === 'up' ? -viewport.h / 4 : d === 'down' ? viewport.h / 4 : 0),
                });
              }}
            >
              {d === 'left' ? '←' : d === 'right' ? '→' : d === 'up' ? '↑' : '↓'}
            </button>
          ))}
        </div>
        <MoleculeInspector
          graph={graph}
          selected={selected}
          element={element}
          order={order}
          readOnly={readOnly}
          choose={choose}
          setOrder={(n) => {
            cancel();
            setOrder(n);
          }}
          setSelected={(n) => {
            cancel();
            setSelected(n);
          }}
          send={send}
          grow={grow}
        />
        <p>{valid.kind === 'valid' ? `Formula: ${core.formula(graph)}` : valid.message}</p>
      </details>
      <p className="molecule-announcement" role="status" aria-live="polite">
        {message}
      </p>
      {readOnly && (
        <p className="molecule-readonly">Review only. This structure cannot be changed.</p>
      )}
    </section>
  );
}
