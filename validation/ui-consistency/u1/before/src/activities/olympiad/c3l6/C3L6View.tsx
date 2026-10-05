import { Fragment, useRef, useState } from 'react';
import type {
  C3BSlot,
  C3BUnitId,
  C3CSlot,
  C3L6Challenge,
  C3L6Progress,
  ChallengeCommand,
} from '../../../contracts/olympiad.ts';
import { Content } from '../../../ui/Content.tsx';
import { QuestionLevelPill } from '../../../ui/QuestionLevelPill.tsx';
import { MoleculeEditor, MoleculePreview } from '../../../editors/molecule/index.ts';
import { blankMolecule } from '../../../chemistry/molecule/engine.ts';
import { stageUnlocked, c3Fingerprint, bFingerprint, cFingerprint } from './policy.ts';
import './c3l6.css';
import { c3HydrazoneQualification as qualification } from './qualification.ts';
import { c3KErratum, sourceBank } from './source-bank.ts';
export interface C3L6ViewProps {
  readonly challenge: C3L6Challenge;
  readonly progress: C3L6Progress;
  readonly readOnly: boolean;
  readonly onCommand: (command: ChallengeCommand) => void;
  readonly status?: string;
  readonly error?: string;
}
const stages = ['intro', 'a', 'b', 'c'] as const;
const locations: Record<C3CSlot, readonly [number, number]> = {
  R: [16, 260],
  S: [318, 50],
  T: [318, 260],
  U: [318, 470],
  V: [610, 470],
  W: [16, 680],
  X: [318, 680],
  Y: [610, 680],
  Z: [470, 910],
};
export function C3L6View({
  challenge,
  progress,
  readOnly,
  onCommand,
  status,
  error,
}: C3L6ViewProps) {
  const [reviewStage, setReviewStage] = useState<C3L6Progress['stage']>('intro'),
    [reviewB, setReviewB] = useState<C3BSlot>('A'),
    [reviewC, setReviewC] = useState<C3CSlot>('R');
  const editorPanel = useRef<HTMLElement>(null);
  const restartDialog = useRef<HTMLDialogElement>(null);
  const showEditor = () => {
    if ((editorPanel.current?.parentElement?.clientWidth ?? innerWidth) < 900)
      requestAnimationFrame(() => editorPanel.current?.scrollIntoView({ block: 'start' }));
  };
  const stage = readOnly ? reviewStage : progress.stage,
    b = readOnly ? reviewB : progress.selected.b,
    c = readOnly ? reviewC : progress.selected.c;
  const navigate = (s: C3L6Progress['stage']) => {
    if (readOnly) setReviewStage(s);
    else onCommand({ kind: 'navigate', stage: s });
    requestAnimationFrame(() => window.scrollTo({ top: 0, left: 0, behavior: 'instant' }));
  };
  const selectB = (slotId: C3BSlot) => {
    if (readOnly) setReviewB(slotId);
    else onCommand({ kind: 'select-slot', stage: 'b', slotId });
    showEditor();
  };
  const selectC = (slotId: C3CSlot) => {
    if (readOnly) setReviewC(slotId);
    else onCommand({ kind: 'select-slot', stage: 'c', slotId });
    showEditor();
  };
  const bUnit = challenge.hydrolysis.find((u) => u.slots.some((s) => s.id === b))!,
    bSlot = bUnit.slots.find((s) => s.id === b)!,
    cSlot = challenge.network.slots.find((s) => s.id === c)!;
  const bCheck = progress.unitChecks[bUnit.unitId],
    cCheck = progress.slotChecks[c];
  const bLocked =
      bCheck?.passed &&
      bCheck.drawingFingerprint === bFingerprint(challenge, progress, bUnit.unitId),
    cLocked = cCheck?.passed && cCheck.drawingFingerprint === cFingerprint(progress, c);
  const drawing =
    stage === 'b'
      ? readOnly
        ? { kind: 'molecule' as const, graph: bSlot.alternatives[0]!.graph, history: [] }
        : (progress.drawingsB[b] ?? blankMolecule())
      : readOnly
        ? { kind: 'molecule' as const, graph: cSlot.alternatives[0]!.graph, history: [] }
        : (progress.drawingsC[c] ?? blankMolecule());
  const introText = challenge.introduction.filter((block) => block.kind === 'text');
  const equilibrium = () => (
    <span
      className="digitised-equilibrium"
      role="img"
      aria-label="Hydrolysis forwards: add water; reverse: remove water"
    >
      <span>
        + H<sub>2</sub>O
      </span>
      <svg viewBox="0 0 100 26" aria-hidden="true">
        <path
          d="M2 8H96L88 2M98 18H4L12 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span>
        − H<sub>2</sub>O
      </span>
    </span>
  );
  const renderBUnit = (id: C3BUnitId) => {
    const unit = challenge.hydrolysis.find((u) => u.unitId === id)!,
      check = progress.unitChecks[id],
      current = check?.drawingFingerprint === bFingerprint(challenge, progress, id);
    return (
      <div className="b-answer-group" data-step={id}>
        <div className="b-step-controls">
          {!readOnly && (
            <button
              type="button"
              className="unit-check"
              aria-label={`Check reaction ${id}`}
              disabled={
                !!check?.passed ||
                unit.slots.some((s) => !progress.drawingsB[s.id]?.graph.atoms.length)
              }
              onClick={() => onCommand({ kind: 'check-b-unit', unitId: id })}
            >
              Check
            </button>
          )}
          <p className="unit-feedback" role="status">
            {!readOnly && current
              ? check.passed
                ? 'Step correct.'
                : 'Check this step again.'
              : ''}
          </p>
        </div>
        <div className="digitised-products">
          {unit.slots.map((slot, i) => (
            <span className="product-pair" key={slot.id}>
              {i > 0 && (
                <span className="b-plus" aria-hidden="true">
                  +
                </span>
              )}
              <span className="digitised-product" data-b-slot={slot.id}>
                {(slot.id === 'J' || slot.id === 'M') && <span className="b-coefficient">2 ×</span>}
                <button
                  type="button"
                  className={`answer-slot${!readOnly && current ? (check.passed ? ' is-correct' : ' is-incorrect') : ''}`}
                  aria-pressed={b === slot.id}
                  aria-label={`${check?.passed ? 'View completed' : 'Edit'} structure ${slot.id}`}
                  onClick={() => selectB(slot.id)}
                >
                  <span className="slot-label">{slot.id}</span>
                  <span className="slot-preview">
                    {readOnly || progress.drawingsB[slot.id]?.graph.atoms.length ? (
                      <MoleculePreview
                        graph={
                          readOnly
                            ? slot.alternatives[0]!.graph
                            : progress.drawingsB[slot.id]!.graph
                        }
                        label={`Structure ${slot.id}`}
                      />
                    ) : (
                      'Click to draw'
                    )}
                  </span>
                  {!readOnly && current && (
                    <span className="answer-status" aria-hidden="true">
                      {check.passed ? '✓' : '?'}
                    </span>
                  )}
                </button>
                <span className="digitised-mass">
                  M<sub>r</sub> = {slot.mass}
                </span>
              </span>
            </span>
          ))}
        </div>
      </div>
    );
  };
  const renderStart = (id: C3BUnitId, title: string, mass: number) => {
    const image = challenge.hydrolysis
      .find((u) => u.unitId === id)!
      .context.find((block) => block.kind === 'image');
    return (
      <div className="digitised-start">
        <figure className="digitised-molecule">
          {image?.kind === 'image' && <img src={image.src} alt={image.alt} />}
        </figure>
        <p>{title}</p>
        <p className="digitised-mass">({mass})</p>
      </div>
    );
  };
  const repeated = (id: C3BSlot) => {
    const slot = challenge.hydrolysis.flatMap((u) => u.slots).find((s) => s.id === id)!,
      graph = readOnly ? slot.alternatives[0]!.graph : progress.drawingsB[id]?.graph;
    return (
      <div className="b-reagent" data-b-repeat={id} aria-label={`Saved reagent ${id}`}>
        <span className="repeat-label">{id}</span>
        <span className="repeat-molecule">
          {graph && <MoleculePreview graph={graph} label={`Saved reagent ${id}`} />}
        </span>
      </div>
    );
  };
  return (
    <article className="c3l6">
      <header className="c3-question-introduction">
        <QuestionLevelPill course="alevel" olympiad />
        <p>
          Use functional-group levels, molecular masses and reaction relationships to identify
          structures.
        </p>
        {readOnly && <p>Teacher review · reference answers · progress is not saved</p>}
      </header>
      {progress.historicalOutcome && (
        <aside aria-label="Historical outcome and current validation">
          <h2>Historical outcome retained</h2>
          <p>
            The earlier source policy recorded part (b) as{' '}
            {progress.historicalOutcome.raw.completed.b ? 'complete' : 'incomplete'} and part (c) as{' '}
            {progress.historicalOutcome.raw.completed.c ? 'complete' : 'incomplete'}. The original
            answers, drawings and checks remain saved as history.
          </p>
          <p>
            Current validation: part (b) {progress.completed.b ? 'complete' : 'incomplete'}; part
            (c) {progress.completed.c ? 'complete' : 'incomplete'}. The earlier K structure does not
            satisfy the corrected hydration policy.
          </p>
          <details>
            <summary>Inspect the retained historical record</summary>
            <pre style={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>
              {JSON.stringify(progress.historicalOutcome.raw, null, 2)}
            </pre>
          </details>
        </aside>
      )}
      <nav className="c3-nav" aria-label="Challenge stages">
        {stages.map((s) => (
          <button
            key={s}
            disabled={!readOnly && !stageUnlocked(progress, s)}
            aria-pressed={s === stage}
            onClick={() => navigate(s)}
          >
            {s === 'intro'
              ? 'Introduction'
              : `Part (${s})${progress.completed[s] ? ' · Complete' : ''}`}
          </button>
        ))}
      </nav>
      {!readOnly && (
        <>
          <button onClick={() => restartDialog.current?.showModal()}>Restart challenge</button>
          <dialog ref={restartDialog} aria-labelledby="c3-restart-title">
            <h2 id="c3-restart-title">Restart this challenge?</h2>
            <p>This clears the saved drawings and completion for this challenge.</p>
            {progress.historicalOutcome && (
              <p>The retained historical outcome will remain saved.</p>
            )}
            <div className="c3-nav">
              <button autoFocus onClick={() => restartDialog.current?.close()}>
                Cancel restart
              </button>
              <button
                onClick={() => {
                  restartDialog.current?.close();
                  onCommand({ kind: 'restart' });
                }}
              >
                Confirm restart
              </button>
            </div>
          </dialog>
        </>
      )}
      <p className="c3-status" role="status">
        {error ||
          status ||
          (!readOnly && progress.completed.c
            ? 'All three parts complete. Your saved structures remain available for review.'
            : '')}
      </p>
      {stage === 'intro' && (
        <section className="c3-intro">
          <h2>This question is about classifying simple organic reactions</h2>
          <Content blocks={introText.slice(1, 2)} />
          {[1, 2, 3].map((level) => (
            <section className="level" key={level}>
              <h2>Level {level} functional groups</h2>
              <p>
                The circled carbon has {level} bond{level > 1 ? 's' : ''} to electronegative atoms;
                a double bond counts twice.
              </p>
              <div className="c3-examples">
                {challenge.introduction
                  .filter((b) => b.kind === 'image')
                  .slice((level - 1) * 5, level * 5)
                  .map((block, i) => (
                    <figure key={i}>
                      {block.kind === 'image' && <img src={block.src} alt={block.alt} />}
                    </figure>
                  ))}
              </div>
            </section>
          ))}
          <Content blocks={introText.slice(2, 3)} />
          <div className="boxed">
            <Content blocks={introText.slice(3, 4)} />
          </div>
          <Content blocks={introText.slice(4)} />
          <button onClick={() => navigate('a')}>Start part (a)</button>
        </section>
      )}
      {stage === 'a' && (
        <section className="digitised-a">
          <h2>Part (a): classify the reactions</h2>
          <p>
            Each reaction uses a single reagent. No carbon–carbon bonds are broken or formed. Choose
            oxidation, reduction or hydrolysis.
          </p>
          {challenge.classifications.map((item) => (
            <article className="digitised-reaction" key={item.id}>
              <span className="reaction-label">{item.label}</span>
              <div className="a-scheme">
                <div className="a-component-group">
                  {item.reaction
                    .filter((block) => block.kind === 'image')
                    .slice(0, 1)
                    .map(
                      (block, i) =>
                        block.kind === 'image' && (
                          <img key={i} className="a-molecule" src={block.src} alt={block.alt} />
                        ),
                    )}
                </div>
                <span className="a-arrow" aria-hidden="true">
                  →
                </span>
                <div className="a-component-group">
                  {item.reaction
                    .filter((block) => block.kind === 'image')
                    .slice(1)
                    .map((block, i) => (
                      <Fragment key={i}>
                        {i > 0 && (
                          <span className="a-plus" aria-hidden="true">
                            +
                          </span>
                        )}
                        {block.kind === 'image' && (
                          <img className="a-molecule" src={block.src} alt={block.alt} />
                        )}
                      </Fragment>
                    ))}
                </div>
              </div>
              <fieldset
                className="classification-row"
                key={item.id}
                disabled={readOnly || progress.completed.a}
              >
                <legend>Reaction {item.label}</legend>
                <div className="c3-classification">
                  {(['oxidation', 'reduction', 'hydrolysis'] as const).map((value) => (
                    <label key={value}>
                      <input
                        type="radio"
                        name={`c3-${item.id}`}
                        checked={
                          (readOnly ? item.answer : progress.classifications[item.id]) === value
                        }
                        onChange={() => onCommand({ kind: 'classify', id: item.id, value })}
                      />
                      {value}
                    </label>
                  ))}
                </div>
              </fieldset>
            </article>
          ))}
          {!readOnly && (
            <>
              <button
                disabled={
                  progress.completed.a ||
                  !challenge.classifications.every((a) => progress.classifications[a.id])
                }
                onClick={() => onCommand({ kind: 'check-a' })}
              >
                Check part (a)
              </button>
              <p>
                {progress.aCheck
                  ? `${progress.aCheck.correct} of ${progress.aCheck.total} correct${progress.aCheck.drawingFingerprint !== c3Fingerprint(progress.classifications) ? ' · answers changed; check again.' : '.'}`
                  : 'Complete all ten answers before checking.'}
              </p>
              {progress.completed.a && (
                <button onClick={() => navigate('b')}>Continue to part (b)</button>
              )}
            </>
          )}
        </section>
      )}
      {(stage === 'b' || stage === 'c') && (
        <div className="c3-drawing-layout">
          <section className="c3-source">
            {stage === 'b' ? (
              <>
                <h2>Part (b): hydrolysis products</h2>
                <p>{qualification.student.optionalPartBIntroduction}</p>
                <p className="c3-scroll-guidance">
                  Scroll each scheme horizontally to see the connected products. With a keyboard,
                  focus the scheme and use the left and right arrow keys.
                </p>
                {readOnly && (
                  <aside aria-labelledby="c3-source-note">
                    <h3 id="c3-source-note">Teacher source note</h3>
                    <p>{qualification.teacher.note}</p>
                    <p>
                      <a href={qualification.teacher.citation}>PubChem CID 9548611</a>
                    </p>
                    <p>{qualification.teacher.provenanceNote}</p>
                  </aside>
                )}
                <div className="digitised-b">
                  <article className="digitised-reaction">
                    <h3>(i)</h3>
                    <div
                      className="b-scheme-scroll"
                      tabIndex={0}
                      role="region"
                      aria-label="Reaction i"
                    >
                      <div className="b-reaction-row">
                        {renderStart('b-i', 'An alarm pheromone in the honey bee', 102)}
                        {equilibrium()}
                        {renderBUnit('b-i')}
                      </div>
                    </div>
                  </article>
                  <article className="digitised-reaction">
                    <h3>(ii)</h3>
                    <div
                      className="b-scheme-scroll"
                      tabIndex={0}
                      role="region"
                      aria-label="Reaction ii"
                    >
                      <div className="b-reaction-row">
                        {renderStart('b-ii', 'A sex pheromone of the olive fly', 156)}
                        {equilibrium()}
                        {renderBUnit('b-ii')}
                      </div>
                    </div>
                  </article>
                  <article className="digitised-reaction">
                    <h3>(iii)</h3>
                    <div
                      className="b-scheme-scroll"
                      tabIndex={0}
                      role="region"
                      aria-label="Reaction iii"
                    >
                      <div className="b-reaction-row">
                        {renderStart('b-iii', qualification.student.label, 114)}
                        {equilibrium()}
                        {renderBUnit('b-iii')}
                      </div>
                    </div>
                  </article>
                  <article className="digitised-reaction">
                    <h3>(iv)</h3>
                    <div
                      className="b-scheme-scroll"
                      tabIndex={0}
                      role="region"
                      aria-label="Allantoin reaction sequence"
                    >
                      <div className="b-connected-chain">
                        {renderStart(
                          'b-iv-1',
                          'Allantoin – an excretory product found in the urine of most mammals except higher primates',
                          158,
                        )}
                        {equilibrium()}
                        {renderBUnit('b-iv-1')}
                        {equilibrium()}
                        {renderBUnit('b-iv-2')}
                      </div>
                    </div>
                    <div
                      className="b-scheme-scroll"
                      tabIndex={0}
                      role="region"
                      aria-label="Hydrolysis of H"
                    >
                      <div className="b-reaction-row b-followup">
                        {repeated('H')}
                        {equilibrium()}
                        {renderBUnit('b-iv-3')}
                      </div>
                    </div>
                    <div
                      className="b-scheme-scroll"
                      tabIndex={0}
                      role="region"
                      aria-label="Hydrolysis of J"
                    >
                      <div className="b-reaction-row b-followup">
                        {repeated('J')}
                        {equilibrium()}
                        {renderBUnit('b-iv-4')}
                      </div>
                    </div>
                  </article>
                </div>
                {!readOnly && progress.completed.b && (
                  <button onClick={() => navigate('c')}>Continue to part (c)</button>
                )}
              </>
            ) : (
              <>
                <h2>Part (c): reaction network</h2>
                <p>
                  The scheme below contains mystery organic compounds R–Z. Draw their structures.
                </p>
                <p>Use the following hints to help you.</p>
                <ul className="digitised-hints">
                  <li>All compounds R–Z contain only carbon, hydrogen and oxygen.</li>
                  <li>
                    <strong>Each carbon atom is bonded to exactly one other carbon atom.</strong>
                  </li>
                  <li>There are no C=C (double) or C≡C (triple) bonds in any compound.</li>
                  <li>
                    It is usually more thermodynamically stable for a carbon to have a double bond
                    to oxygen than two single bonds to hydroxyl (OH) groups.
                  </li>
                </ul>
                <div
                  className="c3-network-scroll"
                  tabIndex={0}
                  role="region"
                  aria-label="Reaction network; scroll horizontally on small screens"
                >
                  <div className="c3-network">
                    {challenge.network.context
                      .filter((block) => block.kind === 'image')
                      .map(
                        (block, i) =>
                          block.kind === 'image' && (
                            <img
                              className="c3-network-image"
                              key={i}
                              src={block.src}
                              alt={block.alt}
                            />
                          ),
                      )}
                    {challenge.network.slots.map((slot) => {
                      const [x, y] = locations[slot.id];
                      return (
                        <div
                          className="c-answer-node"
                          key={slot.id}
                          style={{ left: x, top: y - 50 }}
                        >
                          <button
                            type="button"
                            className="c-check"
                            aria-label={`Check structure ${slot.id}`}
                            disabled={
                              readOnly ||
                              !!progress.slotChecks[slot.id]?.passed ||
                              !progress.drawingsC[slot.id]?.graph.atoms.length
                            }
                            onClick={() => onCommand({ kind: 'check-c-slot', slotId: slot.id })}
                          >
                            Check
                          </button>
                          <button
                            className="c3-network-node"
                            key={slot.id}
                            aria-label={`Select structure ${slot.id}`}
                            aria-pressed={c === slot.id}
                            onClick={() => selectC(slot.id)}
                          >
                            <strong>
                              {slot.id}
                              {progress.slotChecks[slot.id]?.passed ? ' ✓' : ''}
                            </strong>
                            {(readOnly || progress.drawingsC[slot.id]?.graph.atoms.length) && (
                              <MoleculePreview
                                graph={
                                  readOnly
                                    ? slot.alternatives[0]!.graph
                                    : progress.drawingsC[slot.id]!.graph
                                }
                                label={`Structure ${slot.id}`}
                              />
                            )}
                          </button>
                          {!readOnly &&
                            progress.slotChecks[slot.id]?.drawingFingerprint ===
                              cFingerprint(progress, slot.id) && (
                              <span className="c-slot-status" role="status">
                                {progress.slotChecks[slot.id]?.passed ? 'Correct' : 'Try again'}
                              </span>
                            )}
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className="c3-network-controls">
                  {challenge.network.slots.map((slot) => (
                    <button
                      key={slot.id}
                      aria-pressed={c === slot.id}
                      onClick={() => selectC(slot.id)}
                    >
                      {slot.id}
                      {progress.slotChecks[slot.id]?.passed ? ' ✓' : ''}
                    </button>
                  ))}
                </div>
              </>
            )}
          </section>
          <section ref={editorPanel} className="c3-editor-panel">
            <h2>
              Structure {stage === 'b' ? b : c}
              {stage === 'b' ? ` · Mr ${bSlot.mass}` : ''}
            </h2>
            <MoleculeEditor
              key={String(readOnly)}
              value={drawing}
              readOnly={readOnly || !!(stage === 'b' ? bLocked : cLocked)}
              label={`Draw structure ${stage === 'b' ? b : c}`}
              onChange={(d) =>
                stage === 'b'
                  ? onCommand({ kind: 'draw-b', slotId: b, drawing: d })
                  : onCommand({ kind: 'draw-c', slotId: c, drawing: d })
              }
            />
            {stage === 'c' && !readOnly && (
              <>
                {cCheck?.drawingFingerprint === cFingerprint(progress, c) && (
                  <p>{cCheck.passed ? 'Structure correct.' : 'Check the atoms and bonds again.'}</p>
                )}
              </>
            )}
            {readOnly && (
              <details open>
                <summary>Reference structures and accepted alternatives</summary>
                {(stage === 'b' ? bSlot : cSlot).alternatives.map((a, i) => (
                  <figure key={i}>
                    <MoleculePreview graph={a.graph} label={`Accepted alternative ${i + 1}`} />
                    <figcaption>
                      {a.formula}
                      {i ? ' · Alternative ' + (i + 1) : ''}
                    </figcaption>
                  </figure>
                ))}
              </details>
            )}
            {readOnly && stage === 'b' && b === 'K' && (
              <details open aria-label="K source erratum">
                <summary>Source erratum · excluded K alternative</summary>
                <p>{c3KErratum.note}</p>
                <MoleculePreview
                  graph={
                    sourceBank.stages.b.answers
                      .find((s) => s.id === 'K')!
                      .alternatives.find((a) => a.smiles === c3KErratum.rejectedSourceSmiles)!.graph
                  }
                  label="Rejected source alternative: aldehyde retained, orthoacid formed"
                />
              </details>
            )}
          </section>
        </div>
      )}
    </article>
  );
}
