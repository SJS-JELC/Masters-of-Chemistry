import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { DotCrossEditor } from '../../../../src/editors/dot-and-cross/DotCrossEditor.tsx';
import { bank as aBank } from '../../../../src/activities/alevel/dot-and-cross/bank.js';
import { bank as iBank } from '../../../../src/activities/igcse/dot-and-cross/bank.js';
import { check } from '../../../../src/chemistry/dot-and-cross/core.js';
import { modelSVG } from '../../../../src/chemistry/dot-and-cross/model.ts';
import '../../../../src/styles/platform.css';
const query = new URLSearchParams(location.search),
  course = query.get('course') || 'alevel',
  id = query.get('question') || 'h2o';
const source = (course === 'alevel' ? aBank : iBank).find((q) => q.id === id)!;
const record =
  course === 'alevel'
    ? source
    : {
        ...source,
        displayFormula: source.formula,
        totalCharge: 0,
        namedSpecies: false,
        practiceCategory: source.category,
      };
const initial = {
  kind: 'dot-and-cross',
  ...(query.get('empty') === '1'
    ? { atoms: [], electrons: [], groups: [] }
    : structuredClone(record.reference)),
  circles: query.get('circles') !== '0',
};
function App() {
  const [state, setState] = useState<any>(initial),
    [feedback, setFeedback] = useState<any>(null),
    [readonly, setReadonly] = useState(false),
    [answer, setAnswer] = useState(false);
  (window as any).editorHarness = {
    snapshot: () => structuredClone(state),
    set: (value: any) => {
      setState(structuredClone(value));
      setFeedback(null);
    },
    setReadOnly: setReadonly,
    semanticCommits: (window as any).commits || [],
  };
  const pane = (
    <>
      <div className="actions">
        <button
          type="button"
          data-dot-action="check"
          className={feedback?.correct ? '' : 'primary'}
          onClick={() => setFeedback(check(state, record as any))}
        >
          Check diagram
        </button>
        <button type="button" disabled={!feedback} onClick={() => setAnswer(true)}>
          Show answer
        </button>
        <button
          type="button"
          data-dot-action="next"
          className={feedback?.correct ? 'primary' : ''}
          disabled={!feedback}
        >
          Next question →
        </button>
      </div>
      {feedback && (
        <>
          <h3 className={`feedback-title ${feedback.correct ? 'pass' : 'fail'}`}>
            {feedback.correct ? 'Correct diagram' : 'Keep building'}
          </h3>
          <ul className="feedback-list">
            {feedback.criteria
              .filter((c: any) => !(c.id === 'state-valid' && c.passed))
              .map((c: any) => (
                <li key={c.id} className={c.passed ? 'pass' : 'fail'}>
                  {c.passed ? '✓' : '○'} {c.message || c.label}
                </li>
              ))}
          </ul>
        </>
      )}
    </>
  );
  return (
    <main style={{ padding: '24px' }}>
      <DotCrossEditor
        part={
          {
            id: 'diagram',
            kind: 'dot-and-cross',
            marks: 1,
            required: true,
            dependsOn: [],
            prompt: [],
            markingPolicyId: `${course === 'igcse' ? 'igcse-' : ''}dot-cross:${id}`,
            initial,
          } as any
        }
        response={state}
        readOnly={readonly}
        onResponse={(value) => {
          (window as any).commits ??= [];
          (window as any).commits.push(structuredClone(value));
          setState(value);
          setFeedback(null);
        }}
        workspaceAside={pane}
      />
      {answer && (
        <dialog
          open
          style={{
            background: '#10152f',
            padding: 20,
            maxWidth: 1000,
            width: 'calc(100% - 24px)',
            color: 'white',
            borderRadius: 20,
            position: 'fixed',
            inset: 0,
            margin: 'auto',
          }}
        >
          <button onClick={() => setAnswer(false)}>Close</button>
          <h3>Checked answer</h3>
          <div
            dangerouslySetInnerHTML={{
              __html: modelSVG(record as any, { circles: state.circles }),
            }}
          />
        </dialog>
      )}
    </main>
  );
}
createRoot(document.getElementById('root')!).render(<App />);
