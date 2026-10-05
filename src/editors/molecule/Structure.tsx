import { useEffect, useMemo, useState } from 'react';
import type { MoleculeGraph } from '../../contracts/editors.ts';
import { core } from '../../chemistry/molecule/engine.ts';
import { bondLines, endpoint, labelFor } from '../../chemistry/molecule/depiction.ts';
import type { Representation } from '../../chemistry/molecule/depiction.ts';
export function Structure({
  graph,
  view,
  interactive = false,
  invalid = [],
  onSelect,
}: {
  graph: MoleculeGraph;
  view: Representation;
  interactive?: boolean;
  invalid?: readonly number[];
  onSelect?: (id: number) => void;
}) {
  const [font, setFont] = useState(0);
  useEffect(() => {
    let live = true;
    void document.fonts.ready.then(() => {
      if (live) setFont(1);
    });
    return () => {
      live = false;
    };
  }, []);
  const measure = useMemo(() => {
    const context = document.createElement('canvas').getContext('2d');
    return (text: string, size: number) => {
      if (!context) return text.length * size * 0.65;
      context.font = `700 ${size}px Comfortaa`;
      return context.measureText(text).width;
    };
  }, [font]);
  const labels = new Map(graph.atoms.map((a) => [a.id, labelFor(a, graph, view, measure)]));
  return (
    <>
      <g className="molecule-bonds">
        {graph.bonds.map((b) => {
          const a = graph.atoms.find((a) => a.id === b.a)!,
            c = graph.atoms.find((a) => a.id === b.b)!;
          return (
            <g
              key={`${b.a}:${b.b}`}
              className="bond-node"
              data-bond={`${b.a}:${b.b}`}
              tabIndex={interactive ? 0 : undefined}
              role={interactive ? 'button' : undefined}
              aria-label={
                interactive
                  ? `${['Single', 'Double', 'Triple'][b.order - 1]} bond between atom ${b.a} and atom ${b.b}`
                  : undefined
              }
            >
              <line className="bond-hit" x1={a.x} y1={a.y} x2={c.x} y2={c.y} />
              {bondLines(
                endpoint(a, c, labels.get(a.id)!),
                endpoint(c, a, labels.get(c.id)!),
                b.order,
              ).map((line, i) => (
                <line key={i} className="bond-line" {...line} />
              ))}
            </g>
          );
        })}
      </g>
      <g className="molecule-atoms">
        {graph.atoms.map((a) => {
          const label = labels.get(a.id),
            hs = core.hydrogens(graph, a);
          return (
            <g
              key={a.id}
              data-atom={a.id}
              className={`atom-node${invalid.includes(a.id) ? ' invalid' : ''}`}
              tabIndex={interactive ? 0 : undefined}
              role={interactive ? 'button' : undefined}
              aria-label={
                interactive
                  ? `${core.names[a.element]} atom ${a.id}, ${hs >= 0 ? `${hs} implicit hydrogen${hs === 1 ? '' : 's'}` : 'too many bonds'}`
                  : undefined
              }
              onFocus={() => onSelect?.(a.id)}
            >
              <circle className="atom-hit" cx={a.x} cy={a.y} r={24} />
              <circle className="focus-ring" cx={a.x} cy={a.y} r={24} />
              {label && (
                <text className={`atom-label element-${a.element}`} x={label.x} y={a.y}>
                  {label.chunks
                    .filter((c) => c.text)
                    .map((c, i) => (
                      <tspan key={i} className={c.sub ? 'atom-subscript' : undefined}>
                        {c.text}
                      </tspan>
                    ))}
                  {a.charge ? (
                    <tspan className="atom-charge">{a.charge > 0 ? '+' : '−'}</tspan>
                  ) : null}
                </text>
              )}
              {invalid.includes(a.id) && (
                <text className="invalid-mark" x={a.x + 26} y={a.y - 20}>
                  !
                </text>
              )}
            </g>
          );
        })}
      </g>
    </>
  );
}
