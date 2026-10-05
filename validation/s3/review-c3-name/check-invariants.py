"""Narrow independent naming/hydrolysis invariants; no asset regeneration."""
import json, platform
from collections import Counter
from pathlib import Path
from rdkit import Chem, rdBase
from rdkit.Chem import rdMolDescriptors

HERE = Path(__file__).resolve().parent
PROJECT = HERE.parents[2]
bank = json.loads((PROJECT / 'src/activities/olympiad/c3l6/bank.json').read_text(encoding='utf-8'))
weights = {'H': 1, 'C': 12, 'N': 14, 'O': 16}
def describe(smiles):
    mol = Chem.MolFromSmiles(smiles)
    assert mol is not None
    atoms = Counter(a.GetSymbol() for a in Chem.AddHs(mol).GetAtoms())
    return {'smiles': Chem.MolToSmiles(mol), 'formula': rdMolDescriptors.CalcMolFormula(mol),
            'nominalMr': sum(weights[k]*v for k,v in atoms.items()),
            'formalCharge': Chem.GetFormalCharge(mol), 'atoms': dict(atoms)}

model = describe('CC(C)=NN(C)C=O')
gyromitrin = describe('C/C=N/N(C)C=O')
assert (model['formula'],model['nominalMr']) == ('C5H10N2O',114)
assert (gyromitrin['formula'],gyromitrin['nominalMr']) == ('C4H8N2O',100)
products = []
for slot in bank['stages']['b']['answers']:
    if slot['id'] not in ['D','E','F']:
        continue
    answer = slot['alternatives'][0]
    graph = answer['graph']
    rw = Chem.RWMol(); ids = {}
    for atom in graph['atoms']:
        a = Chem.Atom(atom['element']); a.SetFormalCharge(atom.get('charge',0))
        if 'h' in atom:
            a.SetNumExplicitHs(atom['h']); a.SetNoImplicit(True)
        ids[atom['id']] = rw.AddAtom(a)
    for bond in graph['bonds']:
        rw.AddBond(ids[bond['a']],ids[bond['b']],{1:Chem.BondType.SINGLE,2:Chem.BondType.DOUBLE,3:Chem.BondType.TRIPLE}[bond['order']])
    mol = rw.GetMol(); Chem.SanitizeMol(mol)
    result = describe(Chem.MolToSmiles(mol))
    assert result['smiles'] == Chem.MolToSmiles(Chem.MolFromSmiles(answer['smiles']))
    assert result['formula'] == answer['formula']
    assert result['nominalMr'] == slot['mass']
    products.append({'slot':slot['id'],**result})
assert [p['nominalMr'] for p in products] == [58,46,46]
def balance(reagent,ps):
    left = Counter(reagent['atoms']) + Counter({'H':4,'O':2})
    right = sum((Counter(p['atoms']) for p in ps),Counter())
    assert left == right
    assert reagent['formalCharge'] == sum(p['formalCharge'] for p in ps) == 0
    assert reagent['nominalMr'] + 36 == sum(p['nominalMr'] for p in ps)
    return {'atoms':dict(left),'charge':0,'leftNominalMass':reagent['nominalMr']+36,'rightNominalMass':sum(p['nominalMr'] for p in ps)}
ethanal = describe('CC=O')
output = {'status':'PASS','pythonVersion':platform.python_version(),'rdkitVersion':rdBase.rdkitVersion,
          'depictedModel':model,'primaryGyromitrinStructure':gyromitrin,'existingProducts':products,
          'modelCompleteHydrolysis':balance(model,products),
          'authenticGyromitrinCompleteHydrolysis':balance(gyromitrin,[ethanal,*products[1:]]),
          'replacementWouldRequireD':ethanal,
          'scope':'Existing interpreter read-only supplementary invariants, not managed asset regeneration; manual interpretation and render review recorded separately.'}
(HERE/'invariant-results.json').write_text(json.dumps(output,indent=2)+'\n',encoding='utf-8')
print(json.dumps({'status':output['status'],'python':output['pythonVersion'],'rdkit':output['rdkitVersion'],'modelMr':114,'gyromitrinMr':100,'modelHydrolysisMass':150,'gyromitrinHydrolysisMass':136}))
