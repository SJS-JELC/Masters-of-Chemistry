import { useState } from 'react';
import type { AttemptCommand, CorrectionFeedback, PlayerAttempt } from '../contracts/attempt.ts';
import { questionActionState } from './action-state.ts';
import './shared-actions.css';

export function useQuestionActions({
  attempt,
  correctionFeedback,
  onCommand,
  onNext,
  ready = true,
  canNext = true,
  canCorrect = true,
  onShowAnswer,
  modelAnswerVisible = false,
}: {
  attempt: PlayerAttempt;
  correctionFeedback?: CorrectionFeedback | undefined;
  onCommand: (command: AttemptCommand) => void;
  onNext: () => void;
  ready?: boolean;
  canNext?: boolean;
  canCorrect?: boolean;
  onShowAnswer?: () => void;
  modelAnswerVisible?: boolean;
}) {
  const [clearRevision, setClearRevision] = useState(0);
  const attemptKey = attempt.mode === 'student' ? attempt.attemptId : attempt.mode;
  const [modelVisibleFor, setModelVisibleFor] = useState<string | null>(null);
  const state = questionActionState(attempt, correctionFeedback, {
    ready,
    canNext,
    canCorrect,
    modelAnswerVisible: modelAnswerVisible || modelVisibleFor === attemptKey,
  });
  const check = () => {
    if (state.checkEnabled)
      onCommand(
        attempt.mode === 'student' && attempt.phase === 'assessed'
          ? { kind: 'check-correction' }
          : { kind: 'submit', at: Date.now() },
      );
  };
  const clear = () => {
    if (!state.clearEnabled) return;
    onCommand({ kind: 'clear' });
    // Reset transient editor drafts/undo/working feedback as well as the owned response.
    setClearRevision((value) => value + 1);
  };
  const acknowledgeModelAnswer = (supportId = 'model-answer-reference') => {
    if (attempt.mode !== 'student') return;
    setModelVisibleFor(attemptKey);
    onCommand({
      kind: 'assist',
      assistance: {
        kind: attempt.phase === 'assessed' ? 'worked-answer' : 'reveal',
        supportId,
        at: Date.now(),
      },
    });
  };
  const giveUp = () => {
    if (!state.giveUpEnabled) return;
    acknowledgeModelAnswer('worked-answer');
    onShowAnswer?.();
  };
  const next = () => {
    if (state.nextEnabled) onNext();
  };
  return {
    state,
    acknowledgeModelAnswer,
    check,
    clear,
    giveUp,
    next,
    clearRevision,
    defaultAction: () => (state.primary === 'next' ? next() : check()),
  };
}

export type QuestionActionsController = ReturnType<typeof useQuestionActions>;

/** The one curriculum question-end row. Specialist review controls remain in their own panels. */
export function QuestionActions({
  actions,
  variant = 'full',
}: {
  actions: QuestionActionsController;
  variant?: 'full' | 'check-next';
}) {
  return (
    <div className="question-actions" role="group" aria-label="Question actions">
      <button
        type="button"
        data-question-action="check"
        className={actions.state.primary === 'check' ? 'primary' : ''}
        disabled={!actions.state.checkEnabled}
        onClick={actions.check}
      >
        Check
      </button>
      {variant === 'full' && (
        <>
          <button
            type="button"
            data-question-action="clear"
            disabled={!actions.state.clearEnabled}
            onClick={actions.clear}
          >
            Clear
          </button>
          <button
            type="button"
            data-question-action="give-up"
            disabled={!actions.state.giveUpEnabled}
            onClick={actions.giveUp}
          >
            Model answer
          </button>
        </>
      )}
      <button
        type="button"
        data-question-action="next"
        className={actions.state.primary === 'next' ? 'primary' : ''}
        disabled={!actions.state.nextEnabled}
        onClick={actions.next}
      >
        Next
      </button>
    </div>
  );
}
