"""Independent RDKit validation of every retained source alternative, without regeneration."""
import json
import platform
import xml.etree.ElementTree as ET
from pathlib import Path
from rdkit import Chem, rdBase
from rdkit.Chem import rdMolDescriptors

ROOT = Path(__file__).resolve().parents[3]
bank = json.loads((ROOT / 'src/activities/olympiad/c3l6/bank.json').read_text(encoding='utf-8'))
results = []
for stage in ['b', 'c']:
    for slot in bank['stages'][stage]['answers']:
        for index, answer in enumerate(slot['alternatives']):
            graph = answer['graph']
            builder = Chem.RWMol()
            ids = {}
            for atom in graph['atoms']:
                a = Chem.Atom(atom['element'])
                a.SetFormalCharge(atom.get('charge', 0))
                if 'h' in atom:
                    a.SetNumExplicitHs(atom['h'])
                    a.SetNoImplicit(True)
                ids[atom['id']] = builder.AddAtom(a)
            for bond in graph['bonds']:
                builder.AddBond(ids[bond['a']], ids[bond['b']], {1: Chem.BondType.SINGLE, 2: Chem.BondType.DOUBLE, 3: Chem.BondType.TRIPLE}[bond['order']])
            mol = builder.GetMol()
            Chem.SanitizeMol(mol)
            reference = Chem.MolFromSmiles(answer['smiles'])
            assert reference is not None
            graph_smiles, ref_smiles = Chem.MolToSmiles(mol), Chem.MolToSmiles(reference)
            formula = rdMolDescriptors.CalcMolFormula(mol)
            assert graph_smiles == ref_smiles, (stage, slot['id'], index, graph_smiles, ref_smiles)
            assert formula == answer['formula'], (stage, slot['id'], formula)
            mass = sum(a.GetAtomicNum() and {1: 1, 6: 12, 7: 14, 8: 16, 9: 19, 17: 35}[a.GetAtomicNum()] for a in Chem.AddHs(mol).GetAtoms())
            if 'mass' in slot:
                assert mass == slot['mass'], (stage, slot['id'], mass)
            if stage == 'c':
                for atom in mol.GetAtoms():
                    if atom.GetSymbol() == 'C':
                        assert sum(n.GetSymbol() == 'C' for n in atom.GetNeighbors()) == 1
                assert all(not (b.GetBeginAtom().GetSymbol() == b.GetEndAtom().GetSymbol() == 'C' and b.GetBondType() != Chem.BondType.SINGLE) for b in mol.GetBonds())
            results.append({'stage': stage, 'id': slot['id'], 'alternative': index + 1, 'formula': formula, 'canonicalSmiles': graph_smiles, 'nominalMass': mass, 'unspecifiedChiralCentres': Chem.FindMolChiralCenters(mol, includeUnassigned=True)})
assert len(results) == 23
svgs = list((ROOT / 'src/activities/olympiad/c3l6/assets/digitised').rglob('*.svg'))
for svg in svgs:
    ET.parse(svg)
output = {'status': 'PASS', 'pythonVersion': platform.python_version(), 'rdkitVersion': rdBase.rdkitVersion, 'all23GraphSmilesFormulaChecks': results, 'validSourceSvgXmlFiles': len(svgs), 'scope': 'Supplementary read-only existing-interpreter invariant checks, not managed regeneration. Accompanying substantive chemistry/render review required.'}
source_compound = Chem.MolFromSmiles('CC(C)=NN(C)C=O')
gyromitrin = Chem.MolFromSmiles('C/C=N/N(C)C=O')
assert rdMolDescriptors.CalcMolFormula(source_compound) == 'C5H10N2O'
assert rdMolDescriptors.CalcMolFormula(gyromitrin) == 'C4H8N2O'
output['sourceNamingIssue'] = {'depictedBiiiSmiles': Chem.MolToSmiles(source_compound), 'depictedFormula': rdMolDescriptors.CalcMolFormula(source_compound), 'depictedNominalMass': 114, 'pubchemCID': 9548611, 'pubchemSmiles': Chem.MolToSmiles(gyromitrin), 'pubchemFormula': rdMolDescriptors.CalcMolFormula(gyromitrin), 'pubchemNominalMass': 100, 'status': 'APPROVED_BOUNDED_MODEL_QUALIFICATION', 'independentDisposition': 'validation/s3/review-c3-name/wording-disposition.json'}
(ROOT / 'validation/s3/c3l6/rdkit-results.json').write_text(json.dumps(output, indent=2) + '\n', encoding='utf-8')
print(json.dumps({'status': 'PASS', 'rdkitVersion': rdBase.rdkitVersion, 'alternatives': len(results)}))
