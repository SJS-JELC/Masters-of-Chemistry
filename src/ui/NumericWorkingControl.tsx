import { useId, useState } from 'react';
import type { NumericWorkingToken, QuestionPart, ResponseFor } from '../contracts/question.ts';

type NumericPart = Extract<QuestionPart, { kind: 'numeric' }>;
/** Matches original thermochemistry working-field parsing, independently of final marking. */
export function workingNumber(raw: string): number {
  const match = raw
    .replace(/,/g, '')
    .replace(/\u2212/g, '-')
    .match(/[+-]?(?:\d+(?:\.\d*)?|\.\d+)/);
  return match ? Number(match[0]) : NaN;
}
export function NumericWorkingControl({
  part,
  response,
  readOnly,
  assisted,
  onResponse,
  onRequestSupport,
  source,
}: {
  readonly part: NumericPart;
  readonly response: ResponseFor<'numeric'> | undefined;
  readonly readOnly: boolean;
  readonly assisted: boolean;
  readonly onResponse: (response: ResponseFor<'numeric'>) => void;
  readonly onRequestSupport?: () => void;
  readonly source?: {
    family: string;
    label: string;
    symbol: string;
    index: number;
    single?: boolean;
    result?: 'correct' | 'incorrect';
  };
}) {
  const id = useId(),
    [localOpen, setLocalOpen] = useState(
      assisted || Object.keys(response?.working ?? {}).length > 0,
    );
  const values = response?.working ?? {};
  const [checked, setChecked] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const framework = part.workingFramework,
    opened = localOpen || (readOnly && Object.keys(values).length > 0),
    raw = response?.raw ?? '';
  const fields =
    framework?.rows
      .flatMap((row) =>
        row.right.kind === 'tokens'
          ? row.right.tokens
          : [...row.right.numerator, ...row.right.denominator],
      )
      .filter((token) => typeof token !== 'string') ?? [];
  const finalInFramework = fields.some((field) => field.finalResponse);
  const update = (value: string) =>
    onResponse({
      kind: 'numeric',
      raw: value,
      unit: part.unit,
      ...(response?.working ? { working: response.working } : {}),
    });
  const tokens = (items: readonly NumericWorkingToken[]) =>
    items.map((token, index) =>
      typeof token === 'string' ? (
        <span key={index}>{token}</span>
      ) : (
        <label
          className={
            source
              ? `working-entry${token.finalResponse ? ' scaffold-final-slot' : ''}`
              : 'working-field'
          }
          key={token.id}
        >
          <span className="visually-hidden">
            {token.finalResponse ? 'Final answer' : `Working number ${token.id}`}
          </span>
          <input
            data-answer-input="true"
            className={
              source
                ? `${token.finalResponse ? 'response-input' : 'working-input'}${checked ? (!(token.finalResponse ? raw : (values[token.id] ?? '')).trim() ? ' unanswered' : Math.abs(workingNumber(token.finalResponse ? raw : (values[token.id] ?? '')) - token.expected) <= token.tolerance ? ' correct' : ' incorrect') : ''}`
                : undefined
            }
            aria-label={token.finalResponse ? 'Final answer' : `Working number ${token.id}`}
            inputMode={part.inputMode ?? 'decimal'}
            readOnly={readOnly}
            value={token.finalResponse ? raw : (values[token.id] ?? '')}
            onChange={(event) => {
              setFeedback(null);
              setChecked(false);
              if (token.finalResponse) update(event.target.value);
              else
                onResponse({
                  kind: 'numeric',
                  raw,
                  unit: part.unit,
                  working: { ...values, [token.id]: event.target.value },
                });
            }}
          />
          {source && (
            <span className="working-marker">
              {checked
                ? Math.abs(
                    workingNumber(token.finalResponse ? raw : (values[token.id] ?? '')) -
                      token.expected,
                  ) <= token.tolerance
                  ? '✓'
                  : '✗'
                : ''}
            </span>
          )}
        </label>
      ),
    );
  const check = () => {
    setChecked(true);
    let correct = 0,
      empty = 0;
    for (const field of fields) {
      const value = field.finalResponse ? raw : (values[field.id] ?? '');
      if (!value.trim()) empty++;
      else if (Math.abs(workingNumber(value) - field.expected) <= field.tolerance) correct++;
    }
    setFeedback(
      `${correct} of ${fields.length} values correct${empty ? `; ${empty} unanswered` : ''}. This working check does not change your marks.`,
    );
  };
  if (source) {
    const input = (
      <input
        data-answer-input="true"
        id={id}
        className={`response-input${source.result ? ` pupil-${source.result}` : ''}`}
        aria-invalid={source.result === 'incorrect' ? true : undefined}
        aria-label={source.label}
        inputMode={part.inputMode ?? 'decimal'}
        autoComplete="off"
        spellCheck={false}
        readOnly={readOnly}
        value={raw}
        onChange={(e) => update(e.target.value)}
      />
    );
    const acid = source.family === 'acid';
    return (
      <section
        className={
          acid
            ? `response-row${source.single ? ' single-response' : ''}${source.result ? ` ${source.result}` : ''}`
            : 'exam-part'
        }
      >
        <p className={acid ? 'response-prompt' : 'exam-part-question'}>
          {(!acid || !source.single) && (
            <span className={acid ? 'part-label' : 'exam-part-label'}>
              {acid
                ? String.fromCharCode(97 + source.index)
                : `(${String.fromCharCode(97 + source.index)})`}
            </span>
          )}
          <label htmlFor={id}>{source.label}</label>
          {framework && !readOnly && (
            <button
              type="button"
              className="scaffold-toggle"
              aria-label="Show working framework"
              aria-expanded={opened}
              onClick={() => {
                if (!opened) onRequestSupport?.();
                setLocalOpen(!opened);
              }}
            >
              ?
            </button>
          )}
        </p>
        {framework && opened && (
          <div className="working-scaffold">
            <div className="math-block scaffold-block">
              {framework.rows.map((row, i) => (
                <div className="source-math-row" key={i}>
                  <span className="math-lhs">{row.left}</span>
                  <span className="math-equals">=</span>
                  <span className="math-rhs">
                    {row.right.kind === 'tokens' ? (
                      tokens(row.right.tokens)
                    ) : (
                      <span className="fraction">
                        <span className="fraction-top">{tokens(row.right.numerator)}</span>
                        <span className="fraction-bottom">{tokens(row.right.denominator)}</span>
                      </span>
                    )}
                  </span>
                </div>
              ))}
            </div>
            {!readOnly && (
              <div className="scaffold-actions">
                <button type="button" onClick={check}>
                  Check working
                </button>
                <p className="scaffold-feedback" aria-live="polite">
                  {feedback}
                </p>
              </div>
            )}
          </div>
        )}
        {(!opened || !finalInFramework) && (
          <div className={acid ? 'answer-line' : 'response-row'}>
            <span className={acid ? 'response-symbol' : 'response-symbol'}>
              {source.symbol}
              {acid ? ' =' : ''}
            </span>
            {input}
            <span className={acid ? 'unit' : 'response-unit'}>{part.unit}</span>
          </div>
        )}
        <p className="response-feedback" aria-live="polite">
          {source.result === 'correct'
            ? 'Correct.'
            : source.result === 'incorrect'
              ? 'Check this value.'
              : ''}
        </p>
      </section>
    );
  }
  return (
    <div className="numeric-working-control">
      {(!framework || !opened || !finalInFramework) && (
        <label className="response-label" htmlFor={id}>
          Your answer {part.unit && <span className="unit">({part.unit})</span>}
          <input
            data-answer-input="true"
            id={id}
            inputMode={part.inputMode ?? 'decimal'}
            readOnly={readOnly}
            value={raw}
            onChange={(event) => update(event.target.value)}
          />
        </label>
      )}
      {framework && !opened && !readOnly && onRequestSupport && (
        <button
          type="button"
          onClick={() => {
            onRequestSupport();
            setLocalOpen(true);
          }}
        >
          Show working framework
        </button>
      )}
      {framework && opened && (
        <section className="working-framework" aria-label="Working framework">
          <p className="support-note">
            Fill in the working values. The final answer remains your assessed response. This
            framework is requested support.
          </p>
          {framework.rows.map((row, index) => (
            <div className="working-row" key={index}>
              <span>{row.left}</span>
              <span aria-hidden="true">=</span>
              <span>
                {row.right.kind === 'tokens' ? (
                  tokens(row.right.tokens)
                ) : (
                  <span className="working-fraction">
                    <span>{tokens(row.right.numerator)}</span>
                    <span>{tokens(row.right.denominator)}</span>
                  </span>
                )}
              </span>
            </div>
          ))}
          {!readOnly && (
            <button type="button" onClick={check}>
              Check working
            </button>
          )}
          {feedback && <p role="status">{feedback}</p>}
        </section>
      )}
    </div>
  );
}
