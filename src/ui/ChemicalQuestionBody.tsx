import type {
  ChemicalEquationSpecies,
  Question,
  Response,
  Responses,
} from '../contracts/question.ts';
import { ChemicalEntry, ChemicalNotation, ChemicalProse } from './ChemicalEntry.tsx';
import type { ResponseStatus } from './current-feedback.ts';
import { Content } from './Content.tsx';

export function ChemicalWorkedAnswer({ question }: { readonly question: Question }) {
  return (
    <div className="chemical-worked-answer">
      <Content blocks={question.workedAnswer} />
    </div>
  );
}

export function ChemicalQuestionBody({
  question,
  responses,
  student,
  readOnly,
  status,
  onResponse,
}: {
  readonly question: Question;
  readonly responses: Responses;
  readonly student: boolean;
  readonly readOnly: boolean;
  readonly status: (partId: string) => ResponseStatus | undefined;
  readonly onResponse: (partId: string, response: Response) => void;
}) {
  const presentation = question.chemicalPresentation;
  if (!presentation) return null;
  if (presentation.kind === 'formula' || presentation.kind === 'equation-writing') {
    const part = question.parts.find((part) => part.kind === 'text');
    if (!part || part.kind !== 'text') throw Error('Chemical entry requires a text response part.');
    const response = responses[part.id];
    return (
      <div className={`chemical-question-body chemical-question-${presentation.kind}`}>
        {presentation.kind === 'equation-writing' && (
          <>
            <p className="chemical-paragraph">
              <ChemicalProse value={presentation.prompt} />
            </p>
            <p className="chemical-entry-help">Type -&gt; for the reaction arrow.</p>
          </>
        )}
        {student && (
          <ChemicalEntry
            mode={presentation.kind === 'formula' ? 'formula' : 'equation'}
            value={response?.kind === 'text' ? response.value : ''}
            label={
              presentation.kind === 'formula' ? 'Compound formula' : 'Balanced symbol equation'
            }
            readOnly={readOnly}
            status={status(part.id)}
            onChange={(value) => onResponse(part.id, { kind: 'text', value })}
          />
        )}
      </div>
    );
  }
  const species = (item: ChemicalEquationSpecies, index: number, side: string) => {
    const coefficient = item.coefficient;
    const coefficientPart =
      coefficient.kind === 'response'
        ? question.parts.find((part) => part.id === coefficient.partId)
        : undefined;
    if (coefficient.kind === 'response' && coefficientPart?.kind !== 'numeric')
      throw Error('Chemical coefficient requires a numeric response part.');
    const response = coefficientPart ? responses[coefficientPart.id] : undefined;
    const modelCoefficient =
      coefficient.kind === 'fixed'
        ? coefficient.value
        : coefficientPart?.kind === 'numeric'
          ? coefficientPart.acceptance.expected
          : 1;
    const statePart = item.statePartId
      ? question.parts.find((part) => part.id === item.statePartId)
      : undefined;
    const stateResponse = statePart ? responses[statePart.id] : undefined;
    return (
      <span className="chemical-species" key={`${side}-${index}`}>
        {index > 0 && (
          <span className="chemical-plus" aria-hidden="true">
            +
          </span>
        )}
        {student && coefficient.kind === 'response' && coefficient.readOnly ? (
          <span className="chemical-coefficient-mirror">
            {response?.kind === 'numeric' && response.raw.trim() ? response.raw : '1'}
          </span>
        ) : student && coefficientPart?.kind === 'numeric' ? (
          <input
            className="chemical-coefficient"
            data-answer-input="true"
            inputMode="text"
            autoComplete="off"
            aria-label={`${side} ${index + 1} coefficient for ${item.formula}`}
            value={response?.kind === 'numeric' ? response.raw : ''}
            readOnly={readOnly}
            data-response-status={status(coefficientPart.id)}
            aria-invalid={status(coefficientPart.id) === 'incorrect' ? true : undefined}
            onChange={(event) =>
              onResponse(coefficientPart.id, {
                kind: 'numeric',
                raw: event.target.value,
                unit: coefficientPart.unit,
              })
            }
          />
        ) : (
          modelCoefficient !== 1 && (
            <span className="chemical-model-coefficient">{modelCoefficient}</span>
          )
        )}
        <span className="chemical-species-formula">
          <ChemicalNotation value={item.formula} />
        </span>
        {statePart?.kind === 'choice' ? (
          student ? (
            <span className="chemical-state-entry">
              <input
                type="text"
                className="chemical-state"
                data-answer-input="true"
                data-state-input="true"
                aria-label={`${side} ${index + 1} state for ${item.formula}`}
                value={stateResponse?.kind === 'choice' ? (stateResponse.selected[0] ?? '') : ''}
                autoComplete="off"
                autoCapitalize="off"
                spellCheck={false}
                readOnly={readOnly}
                data-response-status={status(statePart.id)}
                aria-invalid={status(statePart.id) === 'incorrect' ? true : undefined}
                onChange={(event) => {
                  const value = event.target.value;
                  onResponse(statePart.id, { kind: 'choice', selected: value ? [value] : [] });
                }}
              />
            </span>
          ) : (
            <span>({statePart.acceptedOptionSets[0]?.[0]})</span>
          )
        ) : (
          item.state && <span>({item.state})</span>
        )}
      </span>
    );
  };
  const rows = presentation.kind === 'equation-rows' ? presentation.rows : [presentation];
  return (
    <div className="chemical-question-body chemical-question-equation-row">
      {presentation.prompt && (
        <p className="chemical-paragraph">
          <ChemicalProse value={presentation.prompt} />
        </p>
      )}
      {rows.map((row, rowIndex) => (
        <section className="chemical-equation-row" key={rowIndex}>
          {presentation.kind === 'equation-rows' && (
            <h3>{row.task === 'balance' ? 'Balance' : 'State symbols'}</h3>
          )}
          <div
            className="chemical-equation"
            aria-label={row.task === 'states' ? 'State symbol equation' : 'Chemical equation'}
          >
            <span className="chemical-equation-side">
              {row.reactants.map((item, i) => species(item, i, 'Reactant'))}
            </span>
            <span className="chemical-arrow" aria-label="reacts to form">
              →
            </span>
            <span className="chemical-equation-side">
              {row.products.map((item, i) => species(item, i, 'Product'))}
            </span>
          </div>
        </section>
      ))}
    </div>
  );
}
