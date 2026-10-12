import { createRoot } from 'react-dom/client';
import { useState } from 'react';
import { DotCrossEditor } from '../../src/editors/dot-and-cross/index.ts';
import { QuestionPlayer } from '../../src/ui/QuestionPlayer.tsx';
import { EnergeticsPracticalPilot } from '../../src/ui/EnergeticsPracticalPilot.tsx';
import { createActiveClock, browserClockSample } from '../../src/domain/timing/active-clock.ts';
import { createAttemptController } from '../../src/domain/attempt/attempt.ts';
import { createRepository } from '../../src/persistence/repository.ts';
import { recallFacts } from '../../src/recall/facts.ts';
import { recallFields, createRecallMarkingPolicy } from '../../src/recall/marking.ts';
import { createRecallProvider, recallRef } from '../../src/recall/provider.ts';
import { createRecallSession } from '../../src/recall/scheduler.ts';
import { formulaeRef, formulaeQuestion } from '../../src/activities/igcse/formulae/provider.ts';
import { equationsRef, equationsQuestion } from '../../src/activities/igcse/equations/provider.ts';
import { equationsMarking } from '../../src/activities/igcse/equations/marking.ts';
import { bondQuestion, bondRef } from '../../src/activities/igcse/bond-enthalpy/provider.ts';
import { bondMarking } from '../../src/activities/igcse/bond-enthalpy/marking.ts';
import { formulaeMarking } from '../../src/activities/igcse/formulae/marking.ts';
import {
  practicalRef,
  practicalProvider,
} from '../../src/activities/igcse/energetics-practical/provider.ts';
import {
  practicalMarking,
  practicalLearningReview,
} from '../../src/activities/igcse/energetics-practical/marking.ts';
import { dotCrossProvider, getRecord } from '../../src/activities/alevel/dot-and-cross/provider.ts';
import { dotCrossMarking } from '../../src/activities/alevel/dot-and-cross/marking.ts';
import '../../src/styles/platform.css';
const params = new URLSearchParams(location.search),
  kind = params.get('kind') ?? 'recall',
  course =
    kind === 'dot'
      ? 'alevel'
      : kind === 'recall'
        ? params.get('course') === 'alevel'
          ? 'alevel'
          : 'igcse'
        : 'igcse';
const fact = recallFacts.find((f) => f.course === course)!;
const q =
  kind === 'drawing'
    ? bondQuestion(bondRef('BE-0000E8'))
    : kind === 'balance' || kind === 'states'
      ? equationsQuestion(equationsRef(kind === 'balance' ? 'EQ-00000T' : 'EQ-00000U'))
      : kind === 'formula' || kind === 'reference'
        ? formulaeQuestion(formulaeRef('FO-00000T'))
        : kind === 'practical' || kind === 'pilot'
          ? practicalProvider.restore(practicalRef('EP-BJLHC1'))
          : kind === 'dot'
            ? dotCrossProvider.restore(
                dotCrossProvider.select({
                  activityId: 'alevel/dot-and-cross',
                  gemId: 'l6-t2-1-3',
                  level: 1,
                  seed: 0,
                  previousQuestionIds: [],
                }),
              )
            : createRecallProvider(recallFacts, course).restore(recallRef(course, fact.id));
const referencePolicy = {
  mark(question: any) {
    const points = question.parts.map((p: any) => ({
      partId: p.id,
      pointId: p.id,
      earned: 0,
      available: p.marks,
      message: 'Review your wording.',
      learningReview: {
        kind: 'valid-alternative',
        eligible: true,
        modelAnswer: 'Fixture reference answer',
        rubric: [{ kind: 'text', text: 'Checked fixture wording' }],
      },
    }));
    return {
      accepted: true,
      marks: {
        earned: 0,
        available: points.reduce((n: number, p: any) => n + p.available, 0),
        points,
      },
    };
  },
  masteryScore() {
    return 0;
  },
};
const policy =
  kind === 'drawing'
    ? bondMarking
    : kind === 'reference'
      ? referencePolicy
      : kind === 'balance' || kind === 'states'
        ? equationsMarking
        : kind === 'formula'
          ? formulaeMarking
          : kind === 'practical' || kind === 'pilot'
            ? practicalMarking
            : kind === 'dot'
              ? dotCrossMarking
              : createRecallMarkingPolicy(recallFacts);
const namespace = { course, profileId: 'followup-lock-browser' },
  repo = createRepository(
    'masters-of-chemistry-alpha-v2-followup-lock-' + params.get('run') + '-' + kind + '-' + course,
  );
let count = Number(
    sessionStorage.getItem(
      'followup-lock-index-' + params.get('run') + '-' + kind + '-' + course,
    ) ?? 0,
  ),
  attemptId = 'followup-lock-' + kind + '-' + course + '-' + count;
let pending = Promise.resolve(),
  commands: any[] = [],
  result: any,
  saveError: any;
const loaded =
  kind === 'recall'
    ? await repo.loadRecallAttempt(namespace, attemptId)
    : await repo.loadAttempt(namespace, attemptId);
function initial() {
  return {
    mode: 'student',
    namespace,
    attemptId,
    ref: q.ref,
    target:
      kind === 'recall'
        ? { kind: 'recall', course, activityId: q.ref.activityId, factId: fact.id, level: 1 }
        : {
            course,
            activityId: q.ref.activityId,
            gemId:
              kind === 'drawing'
                ? 'lower-10-4'
                : kind === 'balance' || kind === 'states'
                  ? 'fourth-16-2'
                  : kind === 'formula' || kind === 'reference'
                    ? 'fourth-16-1'
                    : kind === 'dot'
                      ? 'l6-t2-1-3'
                      : 'lower-10-2',
            level: q.ref.level,
          },
    phase: 'answering',
    currentResponses: {},
    assistance: [],
    timing: { attemptId, activeMs: 0, idleLimitMs: 60000, finished: false },
  };
}
function controller(state: any) {
  return createAttemptController({
    question: q,
    state,
    policy,
    ...(kind === 'practical' || kind === 'pilot'
      ? { learningReviewPolicy: practicalLearningReview }
      : kind === 'reference'
        ? {
            learningReviewPolicy: {
              review(_q: any, _f: any, a: any, _r: any, decisions: any) {
                return { kind: 'post-assessment-learning', decisions, reviewedMarks: a.marks };
              },
            },
          }
        : {}),
    clock: createActiveClock({
      attemptId: state.attemptId,
      idleLimitMs: 60000,
      now: browserClockSample,
      ...(state.phase === 'answering' ? { saved: state.timing } : { completed: true }),
    }),
  });
}
let c = controller(loaded.ok && loaded.value ? loaded.value : initial());
let session =
  kind === 'recall'
    ? createRecallSession(
        namespace,
        'followup-lock-session',
        'recall-practice',
        recallFacts.filter((f) => f.course === course).map((f) => f.id),
      )
    : undefined;
if (session) session = { ...session, currentAttemptId: attemptId, currentFactId: fact.id };
function save() {
  const state = c.state();
  pending = pending.then(async () => {
    const r =
      kind === 'recall'
        ? await repo.saveRecall({ attempt: state, session })
        : await repo.saveCurriculum({ attempt: state });
    if (!r.ok) saveError = r.error;
    return r;
  });
}
function Host() {
  const [state, setState] = useState(c.state()),
    [correction, setCorrection] = useState<any>();
  function dispatch(command: any) {
    commands.push(command.kind);
    result = c.dispatch(command);
    if (result.accepted) {
      setState(c.state());
      setCorrection(result.correctionFeedback);
      save();
    }
  }
  function next() {
    count++;
    attemptId = 'followup-lock-' + kind + '-' + course + '-' + count;
    sessionStorage.setItem(
      'followup-lock-index-' + params.get('run') + '-' + kind + '-' + course,
      String(count),
    );
    c = controller(initial());
    if (session) session = { ...session, currentAttemptId: attemptId };
    setState(c.state());
    setCorrection(undefined);
  }
  Object.assign(window, {
    lock: {
      state: () => c.state(),
      question: q,
      commands,
      dispatch,
      next,
      result: () => result,
      flush: () => pending,
      error: () => saveError,
      correct() {
        if (kind === 'recall')
          for (const f of recallFields(fact))
            dispatch({
              kind: 'respond',
              partId: f.id,
              response: { kind: 'text', value: f.answer },
            });
        else if (kind === 'formula' || kind === 'reference')
          dispatch({
            kind: 'respond',
            partId: q.parts[0]!.id,
            response: { kind: 'text', value: 'Cu(NO3)2' },
          });
        else if (kind === 'dot')
          dispatch({
            kind: 'respond',
            partId: q.parts[0]!.id,
            response: { kind: 'dot-and-cross', ...getRecord(q.ref.questionId).reference },
          });
      },
      async erasePanelLatch() {
        await pending;
        const copy = { ...c.state() };
        delete copy.modelAnswerPanelShown;
        return kind === 'recall'
          ? repo.saveRecall({ attempt: copy, session })
          : repo.saveCurriculum({ attempt: copy });
      },
      async eraseLatch() {
        await pending;
        const old = c.state(),
          copy = { ...old };
        delete copy.modelAnswerShown;
        return kind === 'recall'
          ? repo.saveRecall({ attempt: copy, session })
          : repo.saveCurriculum({ attempt: copy });
      },
      async savedAttempt(id: string) {
        await pending;
        return kind === 'recall'
          ? repo.loadRecallAttempt(namespace, id)
          : repo.loadAttempt(namespace, id);
      },
      async savedSession() {
        await pending;
        return repo.loadRecallSession(namespace, 'followup-lock-session');
      },
    },
  });
  const view =
    params.get('mode') === 'teacher'
      ? { mode: 'teacher', ref: q.ref, currentResponses: {} }
      : state;
  const Player = kind === 'pilot' ? EnergeticsPracticalPilot : QuestionPlayer;
  return (
    <Player
      key={attemptId}
      question={q}
      attempt={view as any}
      onCommand={dispatch}
      onNext={next}
      saveStatus={{ kind: 'saved' }}
      correctionFeedback={correction}
      learningReviewEnabled={true}
      renderEditor={(props) => <DotCrossEditor {...props} />}
    />
  );
}
createRoot(document.getElementById('root')!).render(<Host />);
