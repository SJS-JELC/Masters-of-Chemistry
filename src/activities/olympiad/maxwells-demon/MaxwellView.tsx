import { useState, useId, useRef, useEffect } from 'react';
import type { MaxwellProgress, MaxwellCommand, Level } from '../../../contracts/index.ts';
import {
  categories,
  classifications,
  networkData,
  networkEdges,
  parameters,
  parameterRows,
  level2Tasks,
  level3Tasks,
  levelIds,
  type NumericTask,
  enthalpyLabels,
} from './content.ts';
import { toggleCategory, acceptsNumericEdit, acceptsNumericDeletion } from './policy.ts';
import './maxwell.css';
const networkPositions: Record<string, [number, number]> = {
  A: [80, 80],
  B: [380, 80],
  E: [730, 80],
  C: [380, 330],
  D: [80, 540],
  F: [730, 540],
  G: [1040, 330],
  I: [1040, 650],
};
function Network({
  progress,
  readOnly,
  checked,
  answer,
}: {
  progress: MaxwellProgress;
  readOnly: boolean;
  checked: MaxwellProgress['checks'][2];
  answer: (id: string, value: string) => void;
}) {
  const marker = useId().replace(/:/g, '');
  return (
    <figure className="maxwell-network">
      <div
        className="maxwell-network-scroll"
        tabIndex={0}
        role="region"
        aria-label="Hess network map; scroll horizontally on small screens"
      >
        <div className="maxwell-network-canvas">
          <svg
            viewBox="0 0 1120 740"
            role="img"
            aria-label="Twelve directed conversions between hypothetical species A, B, C, D, E, F, G and I"
          >
            <defs>
              <marker id={marker} markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
                <path d="M0 0L8 4L0 8" fill="currentColor" />
              </marker>
            </defs>
            {networkEdges.map(([a, b]) => {
              const [x, y] = networkPositions[a]!,
                [u, v] = networkPositions[b]!,
                d = Math.hypot(u - x, v - y),
                dx = (u - x) / d,
                dy = (v - y) / d,
                endX = u - 34 * dx,
                endY = v - 34 * dy;
              return (
                <g key={a + b} data-edge={a + b}>
                  <path
                    d={'M' + (x + 30 * dx) + ',' + (y + 30 * dy) + ' L' + endX + ',' + endY}
                    markerEnd={'url(#' + marker + ')'}
                  />
                </g>
              );
            })}
            {Object.entries(networkPositions).map(([s, [x, y]]) => (
              <g key={s}>
                <circle cx={x} cy={y} r="27" />
                <text x={x} y={y + 9} textAnchor="middle">
                  {s}
                </text>
              </g>
            ))}
          </svg>
          {networkEdges.map(([a, b], i) => {
            const t = level2Tasks[i]!,
              [x, y] = networkPositions[a]!,
              [u, v] = networkPositions[b]!,
              correct = checked?.correct.includes(t.id);
            return (
              <div
                className="maxwell-map-field"
                key={t.id}
                data-task-id={t.id}
                style={{
                  left: ((x + u) / 2 / 1120) * 100 + '%',
                  top: ((y + v) / 2 / 740) * 100 + '%',
                }}
              >
                <input
                  id={t.id}
                  type="text"
                  inputMode="text"
                  autoComplete="off"
                  disabled={readOnly}
                  value={
                    readOnly
                      ? (Number(t.answer) > 0 ? '+' : '') + t.answer
                      : (progress.responses[t.id] ?? '')
                  }
                  aria-label={t.label}
                  aria-invalid={checked ? !correct : undefined}
                  aria-describedby={checked ? t.id + '-assessment' : undefined}
                  className={
                    checked
                      ? correct
                        ? 'maxwell-map-correct'
                        : 'maxwell-map-incorrect'
                      : undefined
                  }
                  onChange={(e) => answer(t.id, e.target.value)}
                  onFocus={(e) =>
                    e.currentTarget.scrollIntoView({ block: 'nearest', inline: 'center' })
                  }
                />
                {checked && (
                  <span id={t.id + '-assessment'} className="maxwell-sr-only">
                    {correct ? 'Correct' : 'Incorrect or unanswered'}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
      <figcaption>
        <span className="maxwell-scroll-guidance">
          Scroll the map sideways; focusing a box brings it into view.
        </span>
      </figcaption>
    </figure>
  );
}
export function MaxwellView({
  progress,
  readOnly,
  onCommand,
  status,
}: {
  progress: MaxwellProgress;
  readOnly: boolean;
  onCommand: (c: MaxwellCommand) => void;
  status?: string;
}) {
  const [teacherLevel, setTeacherLevel] = useState<Level>(1),
    [teacherIntroduction, setTeacherIntroduction] = useState(true),
    level = readOnly ? teacherLevel : progress.level,
    introduction = readOnly ? teacherIntroduction : (progress.introduction ?? false),
    restartDialog = useRef<HTMLDialogElement>(null),
    partHeading = useRef<HTMLHeadingElement>(null),
    partOpening = useRef<HTMLParagraphElement>(null);
  useEffect(() => {
    if (!introduction) {
      const target = level === 3 ? partOpening.current : partHeading.current;
      target?.focus({ preventScroll: true });
      target?.scrollIntoView({ block: 'start' });
    }
  }, [level, introduction]);
  const navigate = (l: Level) =>
    readOnly
      ? (setTeacherIntroduction(false), setTeacherLevel(l))
      : onCommand({ kind: 'maxwell-level', level: l });
  const showIntroduction = () =>
    readOnly ? setTeacherIntroduction(true) : onCommand({ kind: 'maxwell-introduction' });
  const checked = readOnly ? undefined : progress.checks[level];
  const answer = (id: string, value: string) => onCommand({ kind: 'maxwell-answer', id, value });
  const numericInput = (t: NumericTask) => (
    <input
      id={t.id}
      type="text"
      inputMode="text"
      autoComplete="off"
      disabled={readOnly}
      value={readOnly ? (t.model ?? String(t.answer)) : (progress.responses[t.id] ?? '')}
      aria-label={t.label}
      maxLength={100}
      onBeforeInput={(e) => {
        const data = (e.nativeEvent as InputEvent).data;
        if (data) {
          const input = e.currentTarget;
          const next =
            input.value.slice(0, input.selectionStart ?? input.value.length) +
            data +
            input.value.slice(input.selectionEnd ?? input.value.length);
          if (!acceptsNumericEdit(next)) e.preventDefault();
        }
      }}
      onPaste={(e) => {
        const input = e.currentTarget;
        const next =
          input.value.slice(0, input.selectionStart ?? input.value.length) +
          e.clipboardData.getData('text') +
          input.value.slice(input.selectionEnd ?? input.value.length);
        if (!acceptsNumericEdit(next)) e.preventDefault();
      }}
      onChange={(e) => {
        if (
          acceptsNumericEdit(e.target.value) ||
          ((e.nativeEvent as InputEvent).inputType?.startsWith('delete') &&
            acceptsNumericDeletion(progress.responses[t.id] ?? '', e.target.value))
        )
          answer(t.id, e.target.value);
      }}
    />
  );
  return (
    <article className="maxwell-challenge">
      <nav className="maxwell-nav" aria-label="Challenge stages">
        <button type="button" aria-pressed={introduction} onClick={showIntroduction}>
          Introduction
        </button>
        {([1, 2, 3] as const).map((l) => (
          <button
            key={l}
            type="button"
            aria-pressed={!introduction && level === l}
            onClick={() => navigate(l)}
          >
            Part ({['a', 'b', 'c'][l - 1]})
          </button>
        ))}
        {!readOnly && (
          <button
            className="maxwell-restart"
            type="button"
            onClick={() => restartDialog.current?.showModal()}
          >
            Restart challenge
          </button>
        )}
      </nav>
      {!readOnly && (
        <dialog ref={restartDialog} aria-labelledby="maxwell-restart-title">
          <h2 id="maxwell-restart-title">Restart this challenge?</h2>
          <p>This clears only the saved answers and completion for Maxwell’s Demon.</p>
          <div className="maxwell-nav">
            <button autoFocus type="button" onClick={() => restartDialog.current?.close()}>
              Cancel restart
            </button>
            <button
              type="button"
              onClick={() => {
                restartDialog.current?.close();
                onCommand({ kind: 'restart' });
              }}
            >
              Confirm restart
            </button>
          </div>
        </dialog>
      )}
      {introduction && (
        <section className="maxwell-intro">
          <header>
            <h1>Standard Enthalpies</h1>
            <p>
              It is helpful in chemistry to group together standard processes to give banks of
              reference data for working out other enthalpy changes.
            </p>
          </header>
          <section className="maxwell-reference">
            <div className="maxwell-reference-grid">
              {categories.map((c) => (
                <section key={c.id}>
                  <h3>{c.name}</h3>
                  <p>{c.definition}</p>
                  <p className="maxwell-equation">{c.example}</p>
                </section>
              ))}
            </div>
          </section>
        </section>
      )}
      {!introduction && (
        <section
          className="maxwell-part"
          aria-labelledby={level === 3 ? 'maxwell-c-opening' : 'maxwell-level-heading'}
        >
          {level !== 3 && (
            <h2 id="maxwell-level-heading" ref={partHeading} tabIndex={-1}>
              {level === 1 ? 'Classify the Standard Enthalpy' : 'Hess’ hypothetical network'}
            </h2>
          )}
          {level === 1 && (
            <>
              <div className="maxwell-classifications">
                {classifications.map((t) => {
                  const selected = readOnly
                    ? [...t.answers]
                    : (progress.responses[t.id] ?? '').split('|').filter(Boolean);
                  return (
                    <section
                      className="maxwell-classification"
                      key={t.id}
                      data-task-id={t.id}
                      role="group"
                      aria-labelledby={t.id + '-equation'}
                    >
                      <h3 id={t.id + '-equation'} className="maxwell-classification-equation">
                        {t.equation}
                      </h3>
                      <div className="maxwell-options">
                        {categories.map((c) => {
                          const label =
                            c.id === 'bond' && t.id === 'l1-bond'
                              ? {
                                  sub: 'diss',
                                  standard: true,
                                  name: 'Standard F–F bond dissociation enthalpy (exact diatomic example)',
                                }
                              : enthalpyLabels[c.id];
                          return (
                            <button
                              type="button"
                              key={c.id}
                              disabled={readOnly}
                              aria-pressed={selected.includes(c.id)}
                              onClick={() =>
                                answer(t.id, toggleCategory(progress.responses[t.id], c.id))
                              }
                            >
                              <span className="maxwell-symbol">
                                Δ<sub>{label.sub}</sub>H{label.standard && <sup>°</sup>}
                              </span>
                              <span>{label.name}</span>
                            </button>
                          );
                        })}
                      </div>
                    </section>
                  );
                })}
              </div>
            </>
          )}
          {level === 2 && (
            <section className="maxwell-panel maxwell-map-panel">
              <p>
                A key application of the first law of thermodynamics is that the enthalpy change
                associated with a chemical process is independent of the route taken. In other
                words, the overall enthalpy change for A → B must equal that for A → C → B, provided
                the initial and final states are the same.
              </p>
              <p>
                Some different chemical species are shown below with the possible conversions
                between them. Fill in the enthalpy change boxes to complete the map.
              </p>
              <div className="maxwell-map-layout">
                <Network
                  progress={progress}
                  readOnly={readOnly}
                  checked={checked}
                  answer={answer}
                />
                <div className="maxwell-table-scroll">
                  <table>
                    <caption>Hypothetical supplied data · ΔH / kJ mol⁻¹</caption>
                    <thead>
                      <tr>
                        <th>Conversion</th>
                        <th>ΔH / kJ mol⁻¹</th>
                      </tr>
                    </thead>
                    <tbody>
                      {networkData.map(([eq, n]) => (
                        <tr key={eq}>
                          <td>{eq}</td>
                          <td>
                            {n > 0 ? '+' : ''}
                            {n}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          )}
          {level === 3 && (
            <section className="maxwell-panel maxwell-fluorocarbon">
              <p id="maxwell-c-opening" ref={partOpening} tabIndex={-1}>
                Perfluorodecalin (C₁₀F₁₈) contains two fused, saturated six-membered carbon rings.
                It has 11 C–C bonds and 18 C–F bonds. Link the following enthalpy changes to deduce
                the C–F bond enthalpy, j.
              </p>
              <p
                className="maxwell-reaction"
                aria-label="C₁₀F₁₈(l) + 9H₂O(l) + 5½O₂(g) → 10CO₂(g) + 18HF(aq)"
              >
                <span>C₁₀F₁₈(l)</span>
                <span>+ 9H₂O(l)</span>
                <span>+ 5½O₂(g)</span>
                <span>→ 10CO₂(g)</span>
                <span>+ 18HF(aq)</span>
              </p>
              <div className="maxwell-table-scroll">
                <table className="maxwell-thermochemistry-table">
                  <thead>
                    <tr>
                      <th>Thermodynamic quantity</th>
                      <th>Symbol</th>
                      <th>
                        Value / kJ mol<sup>−1</sup>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {parameterRows.map(([symbol, name, value, sub]) => (
                      <tr key={symbol}>
                        <td>
                          <span className="maxwell-symbol">
                            Δ<sub>{sub}</sub>H<sup>°</sup>
                          </span>{' '}
                          — {name}
                        </td>
                        <td>{symbol}</td>
                        <td>{value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p>i) Work out the value of j in terms of the other enthalpy changes.</p>
              <div
                className="maxwell-inline-equation"
                aria-label="Expression for C–F bond enthalpy j"
              >
                <span className="maxwell-expression-label">j (C–F bond enthalpy) =</span>
                {level3Tasks.slice(0, 9).map((t, index) => (
                  <span className="maxwell-coefficient-term" key={t.id} data-task-id={t.id}>
                    {index > 0 && <span aria-hidden="true">+</span>}
                    {numericInput(t)}
                    <span aria-hidden="true">{parameters[index]![0]}</span>
                  </span>
                ))}
              </div>
              <p>ii) Work out the value of j.</p>
              <div
                className="maxwell-inline-equation maxwell-result-equation"
                data-task-id={level3Tasks[9]!.id}
              >
                <span className="maxwell-expression-label">j (C–F bond enthalpy) =</span>
                <span className="maxwell-result-term">
                  {numericInput(level3Tasks[9]!)}
                  <span>
                    kJ mol<sup>−1</sup>
                  </span>
                </span>
              </div>
              <details>
                <summary>Hess-cycle scaffold</summary>
                <p>
                  Find the formation enthalpy of C₁₀F₁₈(l) from the reaction. Convert the liquid to
                  gas. Compare gaseous perfluorodecalin with 10C(g) + 18F(g); atomising the gas
                  breaks 11 C–C bonds and 18 C–F bonds. Remember that h dissociates F₂, whereas
                  atomising 18 fluorine atoms requires 9F₂.
                </p>
              </details>
            </section>
          )}
        </section>
      )}
      {!introduction && (
        <footer className="maxwell-actions">
          {!readOnly && (
            <>
              <button type="button" onClick={() => onCommand({ kind: 'maxwell-check' })}>
                Check Part ({['a', 'b', 'c'][level - 1]})
              </button>
            </>
          )}
          {checked && (
            <p role="status">
              {checked.correct.length} / {levelIds(level).length} questions correct
            </p>
          )}
          {!readOnly &&
            checked &&
            checked.correct.length === levelIds(level).length &&
            level < 3 && (
              <button type="button" onClick={() => navigate((level + 1) as Level)}>
                Next part
              </button>
            )}
          {status && <p>{status}</p>}
        </footer>
      )}
    </article>
  );
}
