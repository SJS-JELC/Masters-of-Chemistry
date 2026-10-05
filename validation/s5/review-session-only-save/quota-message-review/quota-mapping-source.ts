export class InvalidData extends Error {}
export class EvidenceConflict extends Error {}
function failure(error: unknown): StorageFailure {
  if (error instanceof EvidenceConflict)
    return { code: 'conflict', message: error.message, retryable: false };
  if (error instanceof InvalidData)
    return { code: 'invalid-data', message: error.message, retryable: false };
  const name = error && typeof error === 'object' && 'name' in error ? String(error.name) : '';
  if (name === 'QuotaExceededError' || name === 'QuotaExceeded')
    return {
      code: 'quota',
      message: 'Storage is full. Your current work remains in memory; free space and retry.',
      retryable: true,
    };
  return {
    code: 'unavailable',
    message:
      'Browser storage is unavailable. Your current work remains in memory; retry saving when storage is available.',
    retryable: true,
  };
}
export {failure};