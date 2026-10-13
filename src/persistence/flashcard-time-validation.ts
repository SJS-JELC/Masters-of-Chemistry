import type { FlashcardStudyTime } from '../contracts/flashcard-time.ts';
import type { ImportBatch } from '../contracts/repository.ts';
import {
  array,
  id,
  keys,
  record,
  requireData,
  safeJson,
  same,
  validateNamespace,
} from './validation.ts';

/** Study records have no scores, assessments or mastery fields. */
export function validateFlashcardStudyTime(value: unknown): asserts value is FlashcardStudyTime {
  safeJson(value);
  const saved = record(value, 'flashcard study time');
  keys(saved, [
    'kind',
    'id',
    'namespace',
    'sessionId',
    'scopeKey',
    'dayStart',
    'activeMs',
    'cardLimitMs',
    'updatedAt',
  ]);
  validateNamespace(saved.namespace);
  requireData(
    saved.kind === 'flashcards' && id(saved.sessionId) && id(saved.id),
    'Invalid flashcard study identity',
  );
  requireData(
    typeof saved.scopeKey === 'string' &&
      saved.scopeKey.length > 0 &&
      saved.scopeKey.length <= 10000,
    'Invalid flashcard study scope',
  );
  requireData(
    typeof saved.dayStart === 'number' &&
      Number.isSafeInteger(saved.dayStart) &&
      saved.dayStart > 0,
    'Invalid flashcard study day',
  );
  const day = new Date(saved.dayStart);
  // This is midnight in the recording timezone, which can differ from the device
  // timezone after travelling/importing. Never rewrite its stable identity.
  requireData(Number.isFinite(+day), 'Invalid flashcard study date');
  requireData(
    saved.id === `${saved.sessionId}:${saved.dayStart}`,
    'Flashcard study ID does not match its card run and day',
  );
  requireData(
    typeof saved.activeMs === 'number' &&
      Number.isSafeInteger(saved.activeMs) &&
      saved.activeMs >= 0 &&
      saved.activeMs <= 15000,
    'Invalid flashcard active duration',
  );
  requireData(saved.cardLimitMs === 15000, 'Invalid flashcard per-card limit');
  requireData(
    typeof saved.updatedAt === 'number' &&
      Number.isSafeInteger(saved.updatedAt) &&
      Number.isFinite(+new Date(saved.updatedAt)) &&
      saved.updatedAt >= saved.dayStart,
    'Invalid flashcard update time',
  );
}

export function validateImportedFlashcardStudyTime(batch: ImportBatch): void {
  if (batch.flashcardStudyTime === undefined) return;
  const seen = new Set<string>();
  for (const value of array(batch.flashcardStudyTime, 'flashcard study time')) {
    validateFlashcardStudyTime(value);
    requireData(same(value.namespace, batch.namespace), 'Flashcard import namespace mismatch');
    requireData(!seen.has(value.id), 'Duplicate flashcard import ID');
    seen.add(value.id);
  }
}
