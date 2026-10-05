import { useEffect, useRef } from 'react';
import type { KeyboardEvent } from 'react';
import type { QuestionActionsController } from './QuestionActions.tsx';

const selector = 'input[data-answer-input],textarea[data-answer-input]';
function enabledFields(node: HTMLElement) {
  return Array.from(node.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>(selector)).filter(
    (field) =>
      !field.disabled &&
      !field.readOnly &&
      !field.closest('fieldset:disabled,dialog,[data-question-keyboard="ignore"]') &&
      field.getClientRects().length > 0,
  );
}

/** Answer inputs opt in; native buttons, selects, editors and dialogs retain their own shortcuts. */
export function useQuestionKeyboard(
  identity: string,
  enabled: boolean,
  actions: QuestionActionsController,
) {
  const ref = useRef<HTMLElement>(null);
  const focusedIdentity = useRef<string | null>(null);
  useEffect(() => {
    if (!enabled || focusedIdentity.current === identity || !ref.current) return;
    const node = ref.current;
    const focusFirst = (deferred = false) => {
      const first = enabledFields(node)[0];
      if (!first) return false;
      focusedIdentity.current = identity;
      // Do not steal focus if the pupil already chose an editor control while it loaded.
      if (!deferred || !node.contains(document.activeElement)) first.focus({ preventScroll: true });
      return true;
    };
    if (focusFirst()) return;
    if (!node.querySelector('[role="status"]')) {
      focusedIdentity.current = identity;
      return;
    }
    // Lazy editor inputs may appear after this player has committed.
    const observer = new MutationObserver(() => {
      if (focusFirst(true)) observer.disconnect();
    });
    observer.observe(node, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [identity, enabled]);
  const onKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (
      !enabled ||
      event.key !== 'Enter' ||
      event.defaultPrevented ||
      event.shiftKey ||
      event.altKey ||
      event.ctrlKey ||
      event.metaKey ||
      event.repeat ||
      event.nativeEvent.isComposing ||
      event.nativeEvent.keyCode === 229
    )
      return;
    const target = event.target;
    if (
      !(target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) ||
      !target.matches(selector) ||
      target.closest('dialog,[data-question-keyboard="ignore"]')
    )
      return;
    const fields = enabledFields(event.currentTarget);
    const index = fields.indexOf(target);
    if (index < 0) return;
    event.preventDefault();
    if (actions.state.primary === 'next') actions.defaultAction();
    else if (fields[index + 1]) fields[index + 1]!.focus();
    else actions.defaultAction();
  };
  return { ref, onKeyDown };
}
