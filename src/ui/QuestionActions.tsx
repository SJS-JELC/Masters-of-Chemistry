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
}: {
  attempt: PlayerAttempt;
  correctionFeedback?: CorrectionFeedback | undefined;
  onCommand: (command: AttemptCommand) => void;
  onNext: () => void;
  ready?: boolean;
  canNext?: boolean;
  canCorrect?: boolean;
  onShowAnswer?: () => void;
}) {
  const [clearRevision, setClearRevision] = useState(0);
  const state = questionActionState(attempt, correctionFeedback, { ready, canNext, canCorrect });
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
  const giveUp = () => {
    if (!state.giveUpEnabled) return;
    onCommand({
      kind: 'assist',
      assistance: {
        kind:
          attempt.mode === 'student' && attempt.phase === 'assessed' ? 'worked-answer' : 'reveal',
        supportId: 'worked-answer',
        at: Date.now(),
      },
    });
    onShowAnswer?.();
  };
  const next = () => {
    if (state.nextEnabled) onNext();
  };
  return {
    state,
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
export function QuestionActions({ actions }: { actions: QuestionActionsController }) {
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
        Give Up
      </button>
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
