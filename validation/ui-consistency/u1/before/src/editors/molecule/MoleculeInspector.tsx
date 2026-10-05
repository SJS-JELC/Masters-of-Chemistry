import { useState } from 'react';
import type { MoleculeElement, MoleculeGraph, Point } from '../../contracts/editors.ts';
import type { MoleculeCommand } from '../../chemistry/molecule/engine.ts';
import { LENGTH } from '../../chemistry/molecule/interaction.ts';
export function MoleculeInspector({
  graph,
  selected,
  element,
  order,
  readOnly,
  choose,
  setOrder,
  setSelected,
  send,
  grow,
}: {
  graph: MoleculeGraph;
  selected: number | null;
  element: MoleculeElement;
  order: 1 | 2 | 3;
  readOnly: boolean;
  choose: (e: MoleculeElement) => void;
  setOrder: (n: 1 | 2 | 3) => void;
  setSelected: (n: number | null) => void;
  send: (c: MoleculeCommand) => boolean;
  grow: (id: number, p: Point) => void;
}) {
  const [target, setTarget] = useState(''),
    [angle, setAngle] = useState('0'),
    atom = graph.atoms.find((a) => a.id === selected);
  return (
    <div className="molecule-inspector">
      <label>
        New element
        <select
          aria-label="New element"
          disabled={readOnly}
          value={element}
          onChange={(e) => choose(e.target.value as MoleculeElement)}
        >
          {['C', 'O', 'N', 'Cl', 'F', 'H'].map((e) => (
            <option key={e}>{e}</option>
          ))}
        </select>
      </label>
      <label>
        Bond order
        <select
          aria-label="Bond order"
          disabled={readOnly}
          value={order}
          onChange={(e) => setOrder(Number(e.target.value) as 1 | 2 | 3)}
        >
          {[1, 2, 3].map((n) => (
            <option key={n} value={n}>
              {['Single', 'Double', 'Triple'][n - 1]}
            </option>
          ))}
        </select>
      </label>
      <label>
        Direction
        <select
          aria-label="Extension direction"
          disabled={readOnly}
          value={angle}
          onChange={(e) => setAngle(e.target.value)}
        >
          {Array.from({ length: 12 }, (_, i) => i * 30).map((n) => (
            <option key={n} value={n}>
              {n}°
            </option>
          ))}
        </select>
      </label>
      <label>
        Selected atom
        <select
          aria-label="Selected atom"
          value={atom?.id ?? ''}
          onChange={(e) => setSelected(e.target.value ? Number(e.target.value) : null)}
        >
          <option value="">None / detached new atom</option>
          {graph.atoms.map((a) => (
            <option key={a.id} value={a.id}>
              {a.id}: {a.element}
            </option>
          ))}
        </select>
      </label>
      <button
        type="button"
        disabled={readOnly}
        onClick={() =>
          atom
            ? grow(atom.id, {
                x: atom.x + LENGTH * Math.cos((Number(angle) * Math.PI) / 180),
                y: atom.y + LENGTH * Math.sin((Number(angle) * Math.PI) / 180),
              })
            : send({ kind: 'add', element, point: { x: 0, y: 0 }, order })
        }
      >
        {atom ? 'Extend selected atom' : 'Add atom'}
      </button>
      {atom && (
        <>
          <button
            type="button"
            disabled={readOnly}
            onClick={() => send({ kind: 'element', id: atom.id, element })}
          >
            Change selected to {element}
          </button>
          <button
            type="button"
            disabled={readOnly}
            onClick={() => {
              send({ kind: 'delete-atom', id: atom.id });
              setSelected(null);
            }}
          >
            Delete atom
          </button>
          <label>
            Charge
            <select
              aria-label="Atom charge"
              disabled={readOnly}
              value={atom.charge ?? 0}
              onChange={(e) =>
                send({ kind: 'charge', id: atom.id, charge: Number(e.target.value) as -1 | 0 | 1 })
              }
            >
              {[-1, 0, 1].map((n) => (
                <option key={n} value={n}>
                  {n === 0 ? 'Neutral' : n === 1 ? '+1' : '−1'}
                </option>
              ))}
            </select>
          </label>
          <label>
            Hydrogens
            <select
              aria-label="Attached hydrogen count"
              disabled={readOnly}
              value={atom.h ?? 'auto'}
              onChange={(e) =>
                send({
                  kind: 'hydrogens',
                  id: atom.id,
                  h:
                    e.target.value === 'auto'
                      ? 'auto'
                      : (Number(e.target.value) as 0 | 1 | 2 | 3 | 4),
                })
              }
            >
              <option value="auto">Automatic</option>
              {[0, 1, 2, 3, 4].map((n) => (
                <option key={n}>{n}</option>
              ))}
            </select>
          </label>
          <label>
            Connect to atom
            <select
              aria-label="Bond target"
              disabled={readOnly}
              value={target}
              onChange={(e) => setTarget(e.target.value)}
            >
              <option value="">Choose atom</option>
              {graph.atoms
                .filter((a) => a.id !== atom.id)
                .map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.id}: {a.element}
                  </option>
                ))}
            </select>
          </label>
          <button
            type="button"
            disabled={
              readOnly || !graph.atoms.some((a) => a.id === Number(target) && a.id !== atom.id)
            }
            onClick={() => send({ kind: 'bond', a: atom.id, b: Number(target), order })}
          >
            Set / close bond
          </button>
          <button
            type="button"
            disabled={
              readOnly ||
              !graph.bonds.some(
                (b) =>
                  (b.a === atom.id && b.b === Number(target)) ||
                  (b.b === atom.id && b.a === Number(target)),
              )
            }
            onClick={() => send({ kind: 'delete-bond', a: atom.id, b: Number(target) })}
          >
            Delete bond
          </button>
        </>
      )}
    </div>
  );
}
