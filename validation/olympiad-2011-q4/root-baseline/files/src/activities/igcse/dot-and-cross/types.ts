import type { BankRecord } from '../../../chemistry/dot-and-cross/types.ts';
export interface IgcseRecord
  extends Omit<BankRecord, 'displayFormula' | 'totalCharge' | 'namedSpecies' | 'practiceCategory'> {
  readonly smiles: string | null;
  readonly viewBox: Readonly<{
    width: number;
    height: number;
    atomRadius: number;
    hydrogenRadius: number;
    bondLength: number;
    shellOverlap: number;
  }>;
  readonly electronSlots: Readonly<Record<string, unknown>>;
}
/** Supply common model metadata without changing the preserved original record. */
export const referenceRecord = (record: IgcseRecord): BankRecord => ({
  ...record,
  displayFormula: record.formula,
  totalCharge: 0,
  namedSpecies: false,
  practiceCategory: record.category === 'ionic' ? 'ionic' : 'covalent',
});
