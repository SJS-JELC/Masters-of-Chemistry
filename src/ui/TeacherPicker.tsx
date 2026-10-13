import { questionDisplayCode } from '../content/question-display-identity.ts';
import { useMemo, useState } from 'react';
import type {
  ActivityId,
  ActivityRegistry,
  Course,
  QuestionRef,
  TeacherCatalogueEntry,
} from '../contracts/index.ts';

/** Ready catalogue only; its host retains the old catalogue/question during preparation. */
export function TeacherPicker({
  course,
  registry,
  activityId,
  onActivity,
  onQuestion,
  onLookup,
  catalogue,
  selectedKey,
  initialGroup,
}: {
  readonly course: Course;
  readonly registry: ActivityRegistry;
  readonly activityId: ActivityId;
  readonly onActivity: (id: ActivityId) => void;
  readonly onQuestion: (ref: QuestionRef) => void;
  readonly onLookup: (code: string) => void;
  readonly catalogue: readonly TeacherCatalogueEntry[];
  readonly selectedKey: string;
  readonly initialGroup?: string;
}) {
  const [search, setSearch] = useState(initialGroup ?? '');
  const [level, setLevel] = useState('all');
  const [code, setCode] = useState('');
  const registrations = registry.curriculumFor(course);
  const filtered = useMemo(() => {
    const words = search.toLowerCase().trim().split(/\s+/);
    return catalogue.filter(
      (row) =>
        (!initialGroup || search !== initialGroup || row.group === initialGroup) &&
        (level === 'all' || String(row.ref.level) === level) &&
        words.every((word) =>
          (
            row.label +
            ' ' +
            row.group +
            ' ' +
            row.ref.questionId +
            ' ' +
            questionDisplayCode({
              course,
              activityId: row.ref.activityId,
              questionId: row.ref.questionId,
              seed: row.ref.seed,
            })
          )
            .toLowerCase()
            .includes(word),
        ),
    );
  }, [catalogue, search, level, initialGroup, course]);
  return (
    <section className="teacher-picker" aria-label="Teacher question catalogue">
      <h2>Teacher question catalogue</h2>
      <p>
        Choose any source question or generator configuration. Search names, routes and canonical
        codes. Checked answers appear immediately.
      </p>
      <div className="teacher-picker-controls">
        <label>
          Activity
          <select
            aria-label="Teacher activity"
            value={activityId}
            onChange={(event) => onActivity(event.target.value as ActivityId)}
          >
            {registrations.map((item) => (
              <option key={item.id} value={item.id}>
                {item.title}
              </option>
            ))}
          </select>
        </label>
        <label>
          Level
          <select
            aria-label="Teacher level filter"
            value={level}
            onChange={(event) => setLevel(event.target.value)}
          >
            <option value="all">All source levels</option>
            {[1, 2, 3].map((value) => (
              <option key={value} value={value}>
                Level {value}
              </option>
            ))}
          </select>
        </label>
        <label>
          Search catalogue
          <input
            type="search"
            aria-label="Search teacher catalogue"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </label>
      </div>
      <p role="status" data-testid="teacher-catalogue-count">
        {filtered.length} of {catalogue.length} source questions or configurations
      </p>
      <label>
        Question or configuration
        <select
          aria-label="Teacher question"
          value={filtered.some((row) => row.key === selectedKey) ? selectedKey : ''}
          disabled={!filtered.length}
          onChange={(event) => {
            const row = catalogue.find((item) => item.key === event.target.value);
            if (row) onQuestion(row.ref);
          }}
        >
          <option value="">Select a question</option>
          {filtered.map((row) => (
            <option key={row.key} value={row.key}>
              {row.label}
            </option>
          ))}
        </select>
      </label>
      <form
        className="teacher-code"
        onSubmit={(event) => {
          event.preventDefault();
          onLookup(code);
        }}
      >
        <label>
          Open canonical question code
          <input
            aria-label="Question code"
            value={code}
            onChange={(event) => setCode(event.target.value)}
            placeholder="Canonical question code"
          />
        </label>
        <button type="submit" disabled={!code.trim()}>
          Open question code
        </button>
      </form>
    </section>
  );
}
