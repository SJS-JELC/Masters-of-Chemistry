import type { CurriculumSession, PlatformView, StudentAttempt } from '../contracts/index.ts';
import type { CurriculumLaunchRequest } from '../contracts/landing.ts';

/** A continuation never creates identity or chooses a replacement question. */
export function canContinueStoredSession({
  session,
  attempt,
  view,
  launchRequest,
  ready,
  setupOpen,
  departing = false,
}: {
  readonly session: CurriculumSession | null;
  readonly attempt: StudentAttempt | null;
  readonly view: PlatformView;
  readonly launchRequest: CurriculumLaunchRequest | undefined;
  readonly ready: boolean;
  readonly setupOpen: boolean;
  readonly departing?: boolean;
}): boolean {
  if (departing || !ready || setupOpen || launchRequest || !session || !attempt || view !== session.kind)
    return false;
  return session.kind === 'revision'
    ? session.current?.attemptId === attempt.attemptId
    : session.currentAttemptId === attempt.attemptId;
}
