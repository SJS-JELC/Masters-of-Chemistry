import { fixedIdentity } from '../../content/canonical-identity.ts';

const alevelIdentity = fixedIdentity('DAC');

/** Layout exceptions use source species IDs; public question/marking IDs stay canonical. */
export function editorLayoutQuestionId(markingPolicyId: string): string {
  const id = markingPolicyId.replace(/^(?:igcse-)?dot-cross:/, '');
  return !markingPolicyId.startsWith('igcse-dot-cross:') && id.startsWith('DAC-')
    ? alevelIdentity.sourceId(id)
    : id;
}
