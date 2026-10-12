import type {
  ActivityId,
  ActivityRegistry,
  ChemistryRepository,
  Course,
  CurriculumEvidence,
  CurriculumSession,
  CurriculumTarget,
  LearningReviewPolicy,
  MarkingPolicy,
  PlatformView,
  Question,
  QuestionProvider,
  QuestionRef,
  StudentAttempt,
  TeacherCatalogueEntry,
} from '../contracts/index.ts';
import type { CurriculumLaunchRequest } from '../contracts/landing.ts';
import type { LoadingTicket } from '../loading/coordinator.ts';
import { createChemistryRepository } from '../persistence/index.ts';
import { createCourseMastery } from '../domain/mastery/index.ts';
import {
  bindRevisionQuestion,
  createRevisionSession,
  resumeRevisionSession,
  revisionScheduler,
  selectPracticeQuestion,
} from '../domain/session/index.ts';
import { sameRevisionSelection } from '../shell/navigation-view.ts';
import { productionRegistry } from './registry.ts';
import { prepareQuestionTools, type PreparedQuestionTools } from './question-tools.ts';
import { teacherCatalogue } from '../ui/teacher-catalogue.ts';
import { teacherSubtopic } from './question-heading.ts';
import { gradedActivityId } from './graded-question.ts';
import { questionLookupInput } from '../content/question-display-identity.ts';

export interface PreparedTeacher {
  readonly activityId: ActivityId;
  readonly rows: readonly TeacherCatalogueEntry[];
  readonly question: Question;
  readonly subtopic: string;
  readonly tools: PreparedQuestionTools;
  readonly selectedKey: string;
  readonly initialGroup?: string;
}

export interface CurriculumRuntime {
  readonly provider: QuestionProvider;
  readonly policy: MarkingPolicy;
  readonly learningReviewPolicy?: LearningReviewPolicy;
}
export interface PreparedCurriculum {
  readonly course: Course;
  readonly databaseName: string;
  readonly view: PlatformView;
  readonly history: readonly CurriculumEvidence[];
  readonly session: CurriculumSession | null;
  readonly attempt: StudentAttempt | null;
  readonly question: Question | null;
  readonly runtime: CurriculumRuntime | null;
  readonly tools: PreparedQuestionTools | null;
  readonly setupOpen: boolean;
  readonly launchId?: string;
  readonly teacher?: PreparedTeacher;
}
export interface PrepareCurriculumInput {
  readonly course: Course;
  readonly databaseName: string;
  readonly view: PlatformView;
  readonly ticket: LoadingTicket;
  readonly launchRequest?: CurriculumLaunchRequest;
  readonly initialActivityId?: ActivityId;
  readonly reviewRef?: QuestionRef;
  readonly initialTeacherGroup?: 'ionic' | 'covalent';
  readonly masterySessionId?: string;
  readonly url?: string;
  readonly registry?: ActivityRegistry;
  /** Bounded test seam; callers retain ownership of supplied repositories. */
  readonly repository?: ChemistryRepository;
  readonly prepareTools?: typeof prepareQuestionTools;
}
const drafts = new Map<string, { attempt: StudentAttempt; session: CurriculumSession }>();
function current(input: PrepareCurriculumInput): void {
  if (input.ticket.signal.aborted || !input.ticket.isCurrent())
    throw new DOMException('Navigation cancelled', 'AbortError');
}
async function loadRuntime(registry: ActivityRegistry, id: ActivityId): Promise<CurriculumRuntime> {
  const registration = registry.get(id);
  if (!registration || registration.strand !== 'curriculum')
    throw Error('This activity is not available.');
  const [provider, policy, learningReviewPolicy] = await Promise.all([
    registration.provider(),
    registration.marking(),
    registration.learningReview?.(),
  ]);
  return { provider, policy, ...(learningReviewPolicy ? { learningReviewPolicy } : {}) };
}
export async function prepareTeacher(input: {
  course: Course;
  registry: ActivityRegistry;
  ticket: LoadingTicket;
  activityId?: ActivityId;
  reviewRef?: QuestionRef;
  code?: string;
  initialGroup?: string;
  prepareTools?: typeof prepareQuestionTools;
}): Promise<PreparedTeacher> {
  const assertCurrent = () => {
    if (input.ticket.signal.aborted || !input.ticket.isCurrent())
      throw new DOMException('Preview cancelled', 'AbortError');
  };
  assertCurrent();
  let ref = input.reviewRef;
  if (input.code && !ref) {
    for (const registration of input.registry.curriculumFor(input.course)) {
      const provider = await registration.provider();
      assertCurrent();
      const found = provider.resolveLink(
        questionLookupInput(input.course, registration.id, input.code),
      );
      if (found) {
        ref = found;
        break;
      }
    }
    if (!ref)
      throw Error('Question code not recognised. Enter a complete canonical question code.');
  }
  const activityId = ref
    ? gradedActivityId(ref.activityId)
    : (input.activityId ?? input.registry.curriculumFor(input.course)[0]!.id);
  const runtime = await loadRuntime(input.registry, activityId);
  assertCurrent();
  const standard = input.registry !== productionRegistry;
  const sourceRows = standard ? [] : await teacherCatalogue(activityId);
  assertCurrent();
  const applicable =
    sourceRows.length > 0 &&
    runtime.provider.coverage
      .filter((value) => value.kind === 'fixed')
      .every((value) =>
        value.questionIds.every((id) => sourceRows.some((row) => row.ref.questionId === id)),
      ) &&
    (() => {
      try {
        runtime.provider.restore(sourceRows[0]!.ref);
        return true;
      } catch {
        return false;
      }
    })();
  const registration = input.registry.get(activityId);
  if (!registration || registration.strand !== 'curriculum') throw Error('Activity unavailable');
  const rows: readonly TeacherCatalogueEntry[] = applicable
    ? sourceRows
    : runtime.provider.coverage.flatMap((coverage) =>
        coverage.kind === 'fixed'
          ? coverage.questionIds.map((id) => {
              const found = runtime.provider.resolveLink(id);
              if (!found) throw Error('Missing fixed question route');
              return { key: id, label: runtime.provider.restore(found).title, ref: found };
            })
          : coverage.families.flatMap((family) =>
              family.levels.map((level) => {
                const gem = registration.gems.find((item) => item.supportedLevels.includes(level));
                if (!gem) throw Error('Generated family has no registered level');
                const found =
                  runtime.provider.resolveLink(family.templateId) ??
                  runtime.provider.select({
                    activityId,
                    gemId: gem.id,
                    level,
                    seed: 1,
                    previousQuestionIds: [],
                  });
                return {
                  key: family.templateId + ':' + level,
                  label: `${family.templateId} / Level ${level}`,
                  ref: found,
                };
              }),
            ),
      );
  const first = input.initialGroup
    ? (rows.find((row) => row.group === input.initialGroup) ?? rows[0])
    : rows[0];
  ref ??= first?.ref;
  if (!ref) throw Error('No supported teacher question is available.');
  const question = runtime.provider.restore(ref);
  const [subtopic, tools] = await Promise.all([
    standard
      ? Promise.resolve(
          registration.gems.length === 1 ? registration.gems[0]!.label : question.title,
        )
      : teacherSubtopic(input.registry, question),
    (input.prepareTools ?? prepareQuestionTools)(question, { standard }),
  ]);
  assertCurrent();
  return {
    activityId,
    rows,
    question,
    subtopic,
    tools,
    selectedKey:
      rows.find((row) => row.ref.questionId === ref!.questionId && row.ref.level === ref!.level)
        ?.key ?? '',
    ...(input.initialGroup ? { initialGroup: input.initialGroup } : {}),
  };
}
/** Cancellation resumes only the same session; obsolete writes never publish host state. */
export async function persistCurriculumResume(
  session: CurriculumSession,
  repository: Pick<ChemistryRepository, 'saveSession'>,
  ticket: LoadingTicket,
  requiredWrites: readonly (() => Promise<
    import('../contracts/repository.ts').RepositoryResult<unknown>
  >)[] = [],
): Promise<CurriculumSession | null> {
  if (ticket.signal.aborted || !ticket.isCurrent()) return null;
  for (const write of requiredWrites) {
    const recovered = await ticket.persist(write);
    if (ticket.signal.aborted || !ticket.isCurrent()) return null;
    if (!recovered.ok) throw Error(recovered.error.message);
  }
  const resumed =
    session.kind === 'revision' ? resumeRevisionSession(session) : { ...session, paused: false };
  const result = await ticket.persist(() => repository.saveSession(resumed));
  if (ticket.signal.aborted || !ticket.isCurrent()) return null;
  if (!result.ok) throw Error(result.error.message);
  return resumed;
}
/** Prepare data and durable identity without publishing React state or creating a clock. */
export async function prepareCurriculum(
  input: PrepareCurriculumInput,
): Promise<PreparedCurriculum> {
  const registry = input.registry ?? productionRegistry;
  const repository = input.repository ?? createChemistryRepository(input.databaseName);
  const namespace = { course: input.course, profileId: 'local' };
  const check = <T>(result: import('../contracts/repository.ts').RepositoryResult<T>): T => {
    current(input);
    if (!result.ok) throw Error(result.error.message);
    return result.value;
  };
  try {
    current(input);
    const history = check(await repository.curriculumHistory(namespace));
    if (input.view === 'teacher') {
      const code = input.url
        ? new URL(input.url, 'http://localhost').searchParams.get('review')
        : undefined;
      const teacher = await prepareTeacher({
        course: input.course,
        registry,
        ticket: input.ticket,
        ...(input.initialActivityId ? { activityId: input.initialActivityId } : {}),
        ...(input.reviewRef ? { reviewRef: input.reviewRef } : {}),
        ...(code ? { code } : {}),
        ...(input.initialTeacherGroup ? { initialGroup: input.initialTeacherGroup } : {}),
        ...(input.prepareTools ? { prepareTools: input.prepareTools } : {}),
      });
      current(input);
      return {
        course: input.course,
        databaseName: input.databaseName,
        view: input.view,
        history,
        session: null,
        attempt: null,
        question: null,
        runtime: null,
        tools: null,
        setupOpen: false,
        teacher,
      };
    }
    let session = check(
      await repository.loadSession(namespace, input.masterySessionId ?? 'current-session'),
    );
    let attempt: StudentAttempt | null = null;
    const attemptId =
      session?.kind === 'revision' ? session.current?.attemptId : session?.currentAttemptId;
    if (attemptId) {
      attempt = check(await repository.loadAttempt(namespace, attemptId));
      if (!attempt) throw Error('The saved session references a missing attempt.');
    }
    const request = input.launchRequest;
    const samePractice =
      request?.kind === 'practice' &&
      !!input.masterySessionId &&
      session?.kind === 'practice' &&
      session.id === input.masterySessionId &&
      attempt;
    const sameRevision =
      request?.kind === 'revision' &&
      session?.kind === 'revision' &&
      session.status !== 'complete' &&
      sameRevisionSelection(
        session.levels.map((value) => value.target),
        request.targets,
      ) &&
      attempt;
    let runtime: CurriculumRuntime | null = null;
    let question: Question | null = null;
    let key: string | undefined;
    if (request && !samePractice && !sameRevision) {
      key = `${input.databaseName}:${input.masterySessionId ?? 'current-session'}:${request.id}`;
      const draft = drafts.get(key);
      if (draft) {
        attempt = draft.attempt;
        session = draft.session;
      } else {
        const summaries = registry
          .curriculumFor(input.course)
          .flatMap((registration) =>
            registration.gems.flatMap((gem) =>
              gem.supportedLevels.map((level) =>
                createCourseMastery(input.course).summarize(history, gem.mastery, level),
              ),
            ),
          );
        const id = crypto.randomUUID(),
          seed = crypto.getRandomValues(new Uint32Array(1))[0] || 1;
        let target: CurriculumTarget, ref: StudentAttempt['ref'];
        if (request.kind === 'revision') {
          const initial = createRevisionSession({
            namespace,
            id: input.masterySessionId ?? 'current-session',
            selected: request.targets,
            settings: registry
              .curriculumFor(input.course)
              .flatMap((registration) => registration.gems.map((gem) => gem.mastery)),
            summaries,
            now: Date.now(),
          });
          const next = revisionScheduler.next(initial, summaries, Date.now(), id);
          if (!next.current) throw Error('Choose a supported revision topic before continuing.');
          target = next.current.target;
          runtime = await loadRuntime(registry, target.activityId);
          current(input);
          ref = {
            ...runtime.provider.select({
              ...target,
              seed,
              previousQuestionIds: next.previous
                .filter((value) => value.target.activityId === target.activityId)
                .map((value) => value.ref.questionId),
            }),
            activityId: target.activityId,
          };
          session = bindRevisionQuestion(next, ref);
        } else {
          target = request.target;
          runtime = await loadRuntime(registry, target.activityId);
          current(input);
          const choice = selectPracticeQuestion({
            session: {
              kind: 'practice',
              namespace,
              id: input.masterySessionId ?? 'current-session',
              target,
              selection: request.selection,
              currentAttemptId: null,
              previousQuestionIds: [],
            },
            provider: runtime.provider,
            seed,
            summaries,
          });
          if (!choice) throw Error('All supported levels are already mastered.');
          target = choice.session.target;
          ref = choice.ref;
          session = { ...choice.session, currentAttemptId: id };
        }
        question = runtime.provider.restore(ref);
        const registration = registry.get(ref.activityId);
        if (!registration || registration.strand !== 'curriculum')
          throw Error('Unsupported timing activity');
        attempt = {
          mode: 'student',
          namespace,
          attemptId: id,
          ref,
          target,
          currentResponses: {},
          assistance: [],
          phase: 'answering',
          timing: {
            attemptId: id,
            activeMs: 0,
            idleLimitMs: registration.idleAllowance(question),
            finished: false,
          },
        };
        drafts.set(key, { attempt, session });
      }
    }
    if (attempt) {
      runtime ??= await loadRuntime(registry, attempt.ref.activityId);
      current(input);
      question ??= runtime.provider.restore(attempt.ref);
    }
    const tools = question
      ? await (input.prepareTools ?? prepareQuestionTools)(question, {
          standard: registry !== productionRegistry,
        })
      : null;
    current(input);
    if (attempt && session && (request || input.view === session.kind)) {
      session =
        session.kind === 'revision'
          ? resumeRevisionSession(session)
          : { ...session, paused: false };
      const durableAttempt = attempt,
        durableSession = session;
      const saved = await input.ticket.persist(() =>
        repository.saveCurriculum({ attempt: durableAttempt, session: durableSession }),
      );
      check(saved);
    }
    current(input);
    if (key) drafts.delete(key);
    return {
      course: input.course,
      databaseName: input.databaseName,
      view: input.view,
      history,
      session,
      attempt,
      question,
      runtime,
      tools,
      setupOpen: !attempt || (!request && session?.kind !== input.view),
      ...(request ? { launchId: request.id } : {}),
    };
  } finally {
    if (!input.repository) repository.close?.();
  }
}
