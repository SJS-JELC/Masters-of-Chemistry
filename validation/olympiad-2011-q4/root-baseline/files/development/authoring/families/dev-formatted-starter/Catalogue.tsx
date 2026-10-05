import { useState } from 'react';
import { FoundationApp } from '../../../../src/foundation/ActivityHost.tsx';
import { Content } from '../../../../src/ui/Content.tsx';
import { ResponseControl } from '../../../../src/ui/ResponseControl.tsx';
import type { Responses, QuestionRef } from '../../../../src/contracts/index.ts';
import { proofRegistry } from './registry.ts';
import { proofQuestion, proofRef, dilutionValues } from './family.ts';
/** A01 imports this entry only in DEV. It never belongs to a course release. */
export function DevelopmentCatalogue() {
  const [example, setExample] = useState<QuestionRef>(proofRef(1, 0)),
    [responses, setResponses] = useState<Responses>({});
  if (!import.meta.env.DEV) return null;
  const q = proofQuestion(example),
    values = dilutionValues(example);
  return (
    <>
      <section
        style={{ padding: '1rem', maxWidth: '70rem', margin: 'auto' }}
        aria-label="Developer component catalogue"
      >
        <h1>Development authoring catalogue</h1>
        <p>
          Independently authored fixed and seeded questions. This proof is excluded from student
          releases. The live host below uses the existing attempt, clock, repository and revision
          scheduler.
        </p>
        <details>
          <summary>Component examples and checked model</summary>
          <label>
            Example variant{' '}
            <select
              aria-label="Example variant"
              value={example.level}
              onChange={(e) => {
                setExample(
                  proofRef(e.target.value === '1' ? 1 : e.target.value === '2' ? 2 : 3, 24),
                );
                setResponses({});
              }}
            >
              <option value="1">Fixed with built-in scaffold</option>
              <option value="2">Seeded without scaffold (seed24)</option>
              <option value="3">Inverse dilution application (seed24)</option>
            </select>
          </label>
          <Content
            blocks={[
              { kind: 'text', text: 'Content: text, scientific formulae and responsive table' },
              { kind: 'formula', text: 'HCl(aq) → H⁺(aq) + Cl⁻(aq)' },
              {
                kind: 'table',
                headers: ['Quantity', 'Value'],
                rows: [
                  ['Initial volume', `${values.initialVolume} cm³`],
                  ['Checked final volume', `${values.finalVolume} cm³`],
                ],
              },
            ]}
          />
          {q.parts.map((part) => (
            <section key={part.id}>
              <Content blocks={part.prompt} />
              <ResponseControl
                part={part}
                response={responses[part.id]}
                readOnly={false}
                onResponse={(response) => setResponses((v) => ({ ...v, [part.id]: response }))}
              />
            </section>
          ))}
          <h2>Teacher model</h2>
          <Content blocks={q.workedAnswer} />
          <p>
            These local component controls create no evidence. Use the host below for actual
            assessment.
          </p>
        </details>
      </section>
      <FoundationApp course="alevel" registry={proofRegistry} />
    </>
  );
}
