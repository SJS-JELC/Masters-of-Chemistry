import { useRef, useState } from 'react';
import type { IsomerBox, IsomerChallenge, IsomerCommand, IsomerProgress } from '../../../contracts/index.ts';
import { blankMolecule } from '../../../chemistry/molecule/engine.ts';
import { MoleculeEditor, MoleculePreview } from '../../../editors/molecule/index.ts';
import { isomerBoxes } from './content.ts';
import spectrum from './assets/compound-3.svg';
import '../c3l6/c3l6.css';
import './isomers.css';

export function IsomerView({ challenge, progress, readOnly, onCommand }: {
  readonly challenge: IsomerChallenge; readonly progress: IsomerProgress; readonly readOnly: boolean;
  readonly onCommand: (command: IsomerCommand) => void;
}) {
  const [teacherBox, setTeacherBox] = useState<IsomerBox>('1');
  const zoom = useRef<HTMLDialogElement>(null), restart = useRef<HTMLDialogElement>(null), editor = useRef<HTMLElement>(null);
  const selected = readOnly ? teacherBox : progress.selected;
  const answer = challenge.answers.find(a => a.id === selected)!;
  const drawing = readOnly ? { kind: 'molecule' as const, graph: answer.graph, history: [] } : progress.drawings[selected] ?? blankMolecule();
  const select = (box: IsomerBox) => {
    if (readOnly) setTeacherBox(box); else onCommand({ kind: 'select-box', box });
    if (innerWidth < 900) requestAnimationFrame(() => editor.current?.scrollIntoView({ block: 'start' }));
  };
  return <article className="c3l6 isomers2011" aria-label="UK Chemistry Olympiad 2011 question 4">
    <header><h1>Seven isomers</h1><p>UK Chemistry Olympiad · 2011 · Question 4</p></header>
    <section className="isomer-clues" aria-labelledby="isomer-clues-title">
      <h2 id="isomer-clues-title">Use the evidence to identify compounds 1–7</h2>
      <p>Each compound has molecular formula C<sub>4</sub>H<sub>10</sub>O. Draw its structure in its numbered box. All seven boxes are available immediately.</p>
      <ul>
        <li>Compounds 5–7 boil at lower temperatures than compounds 1–4.</li>
        <li>Compounds 1–4 have a broad infrared absorption around 3300 cm<sup>−1</sup>.</li>
        <li>Compound 2 can exist as optical isomers. You do not need to draw stereochemistry.</li>
        <li>The proton NMR spectrum and relative integrals of compound 3 are shown below.</li>
        <li>Compounds 4 and 5 each have two proton environments.</li>
        <li>Compound 5 gives a triplet at δ 1.21 ppm with relative integral 3 and a quartet at δ 3.47 ppm with relative integral 2.</li>
        <li>The carbon-13 NMR spectra of compounds 6 and 7 have four and three signals respectively.</li>
      </ul>
      <figure className="isomer-spectrum"><button type="button" aria-label="Enlarge compound 3 NMR spectrum" onClick={() => zoom.current?.showModal()}><img src={spectrum} alt="Compound 3 proton NMR spectrum with relative integrals" /></button></figure>
      <details className="isomer-guide"><summary>General NMR guide</summary>
        <p>Protons in the same chemical environment produce one signal. Symmetry can make atoms equivalent. The chemical shift, δ in ppm, depends on the environment.</p>
        <p>The area under each proton signal is proportional to the number of protons it represents. Relative integrals give a ratio, which may need scaling to the molecular formula.</p>
        <p>For simple first-order splitting by n equivalent neighbouring protons, a signal has n + 1 lines: a singlet, doublet, triplet or quartet for 0, 1, 2 or 3 neighbours. Couplings and overlapping signals can give more complex patterns. Exchangeable O–H protons may show variable shifts and splitting.</p>
        <p>In a proton-decoupled carbon-13 spectrum, each distinct carbon environment gives one signal. Equivalent carbons share a signal.</p>
      </details>
    </section>
    <div className="isomer-work">
      <section aria-label="Seven compound boxes">
        <div className="isomer-boxes">{isomerBoxes.map(box => {
          const graph = readOnly ? challenge.answers.find(a => a.id === box)!.graph : progress.drawings[box]?.graph;
          return <button type="button" key={box} data-isomer-box={box}
            className={`answer-slot${!readOnly && progress.check ? progress.completed ? ' is-correct' : ' is-incorrect' : ''}`}
            aria-label={`${readOnly || progress.completed ? 'View' : 'Edit'} compound ${box}`} aria-pressed={selected === box} onClick={() => select(box)}>
            <span className="slot-label">{box}</span><span className="slot-preview">{graph?.atoms.length ? <MoleculePreview graph={graph} label={`Compound ${box} drawing`} /> : 'Click to draw'}</span>
            {!readOnly && progress.check && <span className="answer-status" aria-hidden="true">{progress.completed ? '✓' : '?'}</span>}
          </button>;
        })}</div>
        {!readOnly && <div className="isomer-assessment">
          <button type="button" disabled={progress.completed || !Object.values(progress.drawings).some(d => d.graph.atoms.length)} onClick={() => onCommand({ kind: 'check' })}>Check</button>
          <p role="status" aria-live="polite">{progress.check ? `${progress.check.fullyCorrect} fully correct; ${progress.check.wrongPlace} correct but in the wrong place.` : ''}</p>
          {progress.completed && <button type="button" onClick={() => restart.current?.showModal()}>Restart challenge</button>}
        </div>}
      </section>
      <section ref={editor} className="isomer-editor" aria-label={`Compound ${selected} editor`}>
        <h2>Compound {selected}</h2>
        <MoleculeEditor key={`${readOnly ? 'teacher' : 'pupil'}-${selected}`} value={drawing} readOnly={readOnly || progress.completed} label={`Compound ${selected}`} onChange={value => onCommand({ kind: 'draw', box: selected, drawing: value })} />
        {readOnly && <p className="isomer-teacher-answer">Teacher reference: {answer.name}</p>}
      </section>
    </div>
    <dialog ref={zoom} className="isomer-zoom" aria-label="Enlarged compound 3 NMR spectrum"><button type="button" autoFocus onClick={() => zoom.current?.close()}>Close spectrum</button><div tabIndex={0} aria-label="Scroll enlarged spectrum"><img src={spectrum} alt="Enlarged compound 3 proton NMR spectrum with relative integrals" /></div></dialog>
    <dialog ref={restart} aria-label="Restart this challenge"><p>Clear the seven drawings and this challenge's completion?</p><button type="button" onClick={() => restart.current?.close()}>Keep drawings</button><button type="button" onClick={() => { onCommand({ kind: 'restart' }); restart.current?.close(); }}>Restart</button></dialog>
  </article>;
}
