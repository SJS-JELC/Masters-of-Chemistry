import type { CSSProperties } from 'react';
import type { EditorSurfaceProps } from '../../ui/EditorFrame.tsx';
import type { ElectronConfigurationState, OrbitalSpin } from '../../contracts/index.ts';
import { data } from '../../chemistry/electron-configuration/data.js';
import { getVariant } from '../../chemistry/electron-configuration/identity.ts';
import {
  abbreviation,
  boxes,
  energyOrder,
  explanation,
  same,
} from '../../chemistry/electron-configuration/core.js';
import { apply, blankState } from '../../chemistry/electron-configuration/engine.ts';
import { spinText, spinArrow } from '../../chemistry/electron-configuration/display.ts';
import type { Command } from '../../chemistry/electron-configuration/engine.ts';
import { PeriodicReference } from './PeriodicReference.tsx';
import './styles.css';

type Species = (typeof data.species)[number];
function Symbol({ item }: { item: Species }) {
  return (
    <>
      {item.symbol}
      {!!item.charge && (
        <sup>
          {Math.abs(item.charge) === 1 ? '' : Math.abs(item.charge)}
          {item.charge > 0 ? '+' : '−'}
        </sup>
      )}
    </>
  );
}
function Notation({
  counts,
  core = '',
  framed = true,
}: {
  counts: readonly number[];
  core?: string;
  framed?: boolean;
}) {
  const content = (
    <div className="notation">
      {core && <span>[{core}]</span>}
      {counts.map((count, index) =>
        count ? (
          <span key={index}>
            {data.subshells[index]}
            <sup>{count}</sup>
          </span>
        ) : null,
      )}
    </div>
  );
  return framed ? <div className="configuration-display">{content}</div> : content;
}
/** Source levels-app.js diagram DOM and quarter-height placement; checked marking is unchanged. */
function OrbitalDiagram({
  spins,
  energy,
  disabled,
  onSpin,
}: {
  spins: ElectronConfigurationState['boxes'] | readonly (readonly OrbitalSpin[])[];
  energy: boolean;
  disabled: boolean;
  onSpin?: (index: number, orbital: number, value: OrbitalSpin) => void;
}) {
  const indices = energy ? energyOrder() : data.subshells.map((_label, i) => i);
  const steps: Record<string, number> = {
    '1s': 0,
    '2s': 4,
    '2p': 6,
    '3s': 8,
    '3p': 10,
    '4s': 12,
    '3d': 13,
    '4p': 14,
  };
  return (
    <>
      <div
        className={`orbital-scroll${energy ? ' energy-scroll' : ''}`}
        tabIndex={0}
        role="region"
        aria-label={
          energy
            ? 'Orbital energy diagram with separate s, p and d columns; scroll sideways if needed'
            : 'Horizontal orbital diagram; scroll to see all subshells'
        }
      >
        <div
          className={energy ? 'energy-diagram' : 'orbital-row'}
          style={energy ? ({ '--energy-columns': 3 } as CSSProperties) : undefined}
        >
          {energy && (
            <div className="energy-axis">
              <span>Increasing energy</span>
            </div>
          )}
          {indices.map((index) => {
            const label = data.subshells[index]!;
            const orbitalBoxes = (
              <div className="orbital-boxes">
                {spins[index]!.map((spin, orbital) => {
                  const aria = `${label}, orbital ${orbital + 1}: ${spinText[spin]}`;
                  const className = `orbital${spin ? ' filled' : ''}`;
                  return onSpin ? (
                    <button
                      type="button"
                      key={orbital}
                      className={className}
                      disabled={disabled}
                      aria-label={aria}
                      data-orbital={`${index}:${orbital}`}
                      onClick={() =>
                        onSpin(index, orbital, spin === 0 || spin === 2 ? 1 : spin === 3 ? 0 : 3)
                      }
                      onKeyDown={(event) => {
                        const value = ({ '0': 0, '1': 1, '2': 3, d: 2, D: 2 } as const)[
                          event.key as '0' | '1' | '2' | 'd' | 'D'
                        ];
                        if (value !== undefined) {
                          event.preventDefault();
                          onSpin(index, orbital, value);
                        }
                        if (event.key === ' ' && event.shiftKey) {
                          event.preventDefault();
                          onSpin(index, orbital, spin === 0 ? 3 : spin === 3 ? 1 : 0);
                        }
                      }}
                    >
                      {spinArrow[spin]}
                    </button>
                  ) : (
                    <span key={orbital} className={className} role="img" aria-label={aria}>
                      {spinArrow[spin]}
                    </span>
                  );
                })}
              </div>
            );
            return energy ? (
              <div
                key={index}
                className="energy-level"
                data-subshell={label}
                style={{
                  gridColumn: 'spd'.indexOf(label[1]!) + 1,
                  gridRow: `${14 - steps[label]! + 1} / span 4`,
                }}
              >
                <span className="orbital-label">{label}</span>
                <div className="energy-track">{orbitalBoxes}</div>
              </div>
            ) : (
              <div key={index} className="orbital-group">
                {orbitalBoxes}
                <span className="orbital-label">{label}</span>
              </div>
            );
          })}
        </div>
      </div>
      {!energy && (
        <p className="editor-note">Subshells are in notation order. Scroll sideways if needed.</p>
      )}
    </>
  );
}
/** Presentation for the shared player's checked answer; no assessment or state ownership. */
export function ElectronConfigurationReference({ questionId }: { questionId: string }) {
  const q = getVariant(questionId);
  if (q.kind === 'bonus')
    return (
      <div className="ec-source ec-reference-answer">
        {q.options.map((id) => {
          const item = data.species.find((item) => item.id === id)!;
          return (
            <div className="answer-view" key={id}>
              <h3>
                <Symbol item={item} />{' '}
                {same(item.counts, q.counts) ? '✓ Matches' : '— Different configuration'}
              </h3>
              <Notation counts={item.counts} framed={false} />
            </div>
          );
        })}
      </div>
    );
  const item = data.species.find((item) => item.id === q.speciesId)!;
  const short = abbreviation(item);
  return (
    <div className="ec-source ec-reference-answer">
      <h3>
        {item.name} · <Symbol item={item} />
      </h3>
      <div className="answer-explanation">
        {explanation(item).map((line, index) => (
          <p key={index}>{line}</p>
        ))}
      </div>
      <div className="answer-view">
        <h3>Full notation</h3>
        <Notation counts={item.counts} framed={false} />
      </div>
      <div className="answer-view">
        <h3>Abbreviated notation</h3>
        {short.core ? (
          <Notation counts={short.counts} core={short.core} framed={false} />
        ) : (
          <p className="editor-note">
            There is no preceding noble-gas core for this atom. Use full notation.
          </p>
        )}
      </div>
      <div className="answer-view">
        <h3>Boxes in a row</h3>
        <OrbitalDiagram spins={boxes(item.counts)} energy={false} disabled />
      </div>
      <div className="answer-view">
        <h3>Boxes on energy levels</h3>
        <OrbitalDiagram spins={boxes(item.counts)} energy disabled />
      </div>
    </div>
  );
}
export function ElectronConfigurationEditor({
  part,
  response,
  readOnly,
  onResponse,
  workspaceAside,
}: EditorSurfaceProps) {
  const q = getVariant(part.markingPolicyId.split(':').at(-1)!);
  const state =
    response?.kind === 'electron-configuration'
      ? response
      : part.initial.kind === 'electron-configuration'
        ? part.initial
        : blankState();
  const send = (command: Command) => {
    if (!readOnly) onResponse(apply(state, command));
  };
  const item =
    q.kind === 'main' ? data.species.find((item) => item.id === q.speciesId)! : undefined;
  const orbital =
    q.kind === 'main' && (q.representation === 'row' || q.representation === 'energy');
  const short = item ? abbreviation(item) : undefined;
  return (
    <div className="ec-source ec-workspace">
      <PeriodicReference />
      {q.kind === 'bonus' ? (
        <>
          <p className="question-subtitle">
            Select every species with exactly this electron configuration. This question contributes
            to your Level 3 score.
          </p>
          <Notation counts={q.counts} />
          <div className="bonus-options">
            {q.options.map((id) => {
              const choice = data.species.find((item) => item.id === id)!;
              return (
                <label className="bonus-option" key={id}>
                  <span>
                    <span className="symbol">
                      <Symbol item={choice} />
                    </span>
                    <small>
                      {choice.name} · atomic number {choice.z}
                    </small>
                  </span>
                  <input
                    type="checkbox"
                    disabled={readOnly}
                    checked={state.selectedSpeciesIds.includes(id)}
                    onChange={() => send({ kind: 'select', id })}
                    aria-label={`${choice.name}, charge ${choice.charge ? `${Math.abs(choice.charge)}${choice.charge > 0 ? '+' : '−'}` : '0'}`}
                  />
                </label>
              );
            })}
          </div>
        </>
      ) : q.direction === 'identify' ? (
        <>
          <p className="question-subtitle">
            {item!.charge ? (
              <>
                This ion has charge{' '}
                <strong>
                  {Math.abs(item!.charge)}
                  {item!.charge > 0 ? '+' : '−'}
                </strong>
                . Which element does it belong to?
              </>
            ) : (
              'This configuration belongs to a neutral atom. Which element is it?'
            )}
          </p>
          {orbital ? (
            <OrbitalDiagram
              spins={boxes(item!.counts)}
              energy={q.representation === 'energy'}
              disabled
            />
          ) : (
            <Notation
              counts={q.representation === 'short' ? short!.counts : item!.counts}
              core={q.representation === 'short' ? short!.core : ''}
            />
          )}
          <label className="identity-entry">
            <span>Element name or symbol</span>
            <input
              type="text"
              maxLength={80}
              autoComplete="off"
              autoCapitalize="off"
              spellCheck={false}
              disabled={readOnly}
              value={state.identity}
              onChange={(event) => send({ kind: 'identity', value: event.target.value })}
            />
          </label>
        </>
      ) : (
        <>
          <div className="species-card">
            <div className="species-symbol">
              <Symbol item={item!} />
            </div>
            <div>
              <p className="species-name">
                {item!.name}
                {item!.charge ? ' ion' : ' atom'}
              </p>
              <p className="species-detail">
                Atomic number {item!.z} ·{' '}
                {item!.charge
                  ? `Charge ${Math.abs(item!.charge)}${item!.charge > 0 ? '+' : '−'}`
                  : 'Neutral atom'}
              </p>
            </div>
          </div>
          {orbital ? (
            <>
              <p className="editor-note">
                Tap a box or press Space to cycle empty → ↑ → ↑↓ → empty. Keyboard: 1 = ↑, 2 = ↑↓, 0
                = empty, D = ↓. Shift+Space cycles backwards.
              </p>
              <OrbitalDiagram
                spins={state.boxes}
                energy={q.representation === 'energy'}
                disabled={readOnly}
                onSpin={(index, orbital, value) => send({ kind: 'spin', index, orbital, value })}
              />
              <details className="ec-alternatives">
                <summary>Set spins without cycling</summary>
                <div className="ec-spin-alternatives">
                  {data.subshells.flatMap((label, index) =>
                    state.boxes[index]!.map((spin, orbital) => (
                      <label key={`${index}-${orbital}`}>
                        {label} orbital {orbital + 1}
                        <select
                          aria-label={`${label} orbital ${orbital + 1}`}
                          disabled={readOnly}
                          value={spin}
                          onChange={(event) =>
                            send({
                              kind: 'spin',
                              index,
                              orbital,
                              value: Number(event.target.value) as OrbitalSpin,
                            })
                          }
                        >
                          {spinText.map((text, value) => (
                            <option key={value} value={value}>
                              {text}
                            </option>
                          ))}
                        </select>
                      </label>
                    )),
                  )}
                </div>
              </details>
            </>
          ) : (
            <>
              {q.representation === 'short' && (
                <label className="core-select">
                  Noble-gas core
                  <select
                    aria-label="Noble-gas core"
                    disabled={readOnly}
                    value={state.core}
                    onChange={(event) => send({ kind: 'core', value: event.target.value })}
                  >
                    <option value="">Choose a core</option>
                    {Object.keys(data.cores).map((core) => (
                      <option key={core} value={core}>
                        {core}
                      </option>
                    ))}
                  </select>
                </label>
              )}
              <p className="editor-note">
                Enter the number of electrons in each{' '}
                {q.representation === 'short' ? 'remaining ' : ''}subshell. Leave unused subshells
                blank or enter 0.
              </p>
              <div className="notation-editor">
                {data.subshells.map((label, index) =>
                  data.cores[state.core]?.[index] ? null : (
                    <label className="subshell-entry" key={label}>
                      {label}
                      <input
                        aria-label={`Electrons in ${label}`}
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={2}
                        autoComplete="off"
                        disabled={readOnly}
                        value={state.counts[index]}
                        onChange={(event) =>
                          send({ kind: 'count', index, value: event.target.value })
                        }
                      />
                    </label>
                  ),
                )}
              </div>
            </>
          )}
          <button
            className="ec-clear"
            type="button"
            disabled={readOnly}
            onClick={() => send({ kind: 'clear' })}
          >
            Clear answer
          </button>
        </>
      )}
      {workspaceAside}
    </div>
  );
}
