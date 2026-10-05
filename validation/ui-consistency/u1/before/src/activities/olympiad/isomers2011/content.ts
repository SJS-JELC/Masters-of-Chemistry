import type { IsomerChallenge, IsomerBox, MoleculeGraph } from '../../../contracts/index.ts';
import { clean } from '../../../chemistry/molecule/layout.ts';
// Atom and edge lists are explicit source-reviewed constitutional graphs.
// Coordinates only provide initial teacher depictions; they do not affect marking.
function graph(elements: string, edges: readonly (readonly [number, number])[]): MoleculeGraph {
  return clean({
    atoms: elements.split('').map((element, i) => ({ id: i + 1, element: element as 'C' | 'O', x: 60 + (i % 3) * 76, y: 80 + Math.floor(i / 3) * 76 })),
    bonds: edges.map(([a, b]) => ({ a, b, order: 1 })),
  });
}
export const isomerBoxes: readonly IsomerBox[] = ['1', '2', '3', '4', '5', '6', '7'];
export const isomerChallenge: IsomerChallenge = {
  activityId: 'alevel/olympiad-2011-q4',
  answers: [
    { id: '1', name: 'Butan-1-ol', smiles: 'CCCCO', graph: graph('CCCCO', [[1,2],[2,3],[3,4],[4,5]]) },
    { id: '2', name: 'Butan-2-ol', smiles: 'CCC(C)O', graph: graph('CCCCO', [[1,2],[2,3],[3,4],[3,5]]) },
    { id: '3', name: '2-Methylpropan-1-ol', smiles: 'CC(C)CO', graph: graph('CCCCO', [[1,2],[2,3],[2,4],[4,5]]) },
    { id: '4', name: '2-Methylpropan-2-ol', smiles: 'CC(C)(C)O', graph: graph('CCCCO', [[1,2],[2,3],[2,4],[2,5]]) },
    { id: '5', name: 'Ethoxyethane', smiles: 'CCOCC', graph: graph('CCOCC', [[1,2],[2,3],[3,4],[4,5]]) },
    { id: '6', name: '1-Methoxypropane', smiles: 'CCCOC', graph: graph('CCCOC', [[1,2],[2,3],[3,4],[4,5]]) },
    { id: '7', name: '2-Methoxypropane', smiles: 'COC(C)C', graph: graph('COCCC', [[1,2],[2,3],[3,4],[3,5]]) },
  ],
};
