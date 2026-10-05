import json
import sys
from pathlib import Path
from collections import Counter
from xml.etree import ElementTree
from rdkit import Chem, rdBase
from rdkit.Chem import rdMolDescriptors

here = Path(__file__).resolve().parent
species = [("carbon monoxide", "[C-]#[O+]", 1), ("hydrogen", "[H][H]", 2), ("methanol", "CO", 1)]
records = []
for name, smiles, coefficient in species:
    molecule = Chem.MolFromSmiles(smiles)
    assert molecule is not None
    Chem.SanitizeMol(molecule)
    explicit = Chem.AddHs(molecule)
    atoms = Counter(atom.GetSymbol() for atom in explicit.GetAtoms())
    records.append(dict(name=name, smiles=smiles, coefficient=coefficient,
                        canonicalSmiles=Chem.MolToSmiles(molecule), formula=rdMolDescriptors.CalcMolFormula(molecule),
                        atomCounts=dict(atoms), formalCharge=Chem.GetFormalCharge(molecule),
                        atomFormalCharges=[dict(element=atom.GetSymbol(), charge=atom.GetFormalCharge()) for atom in molecule.GetAtoms()],
                        bonds=[dict(elements=[bond.GetBeginAtom().GetSymbol(),bond.GetEndAtom().GetSymbol()],order=bond.GetBondTypeAsDouble()) for bond in explicit.GetBonds()]))
assert records[0]["formula"] == "CO"
assert records[0]["formalCharge"] == 0
assert records[0]["atomFormalCharges"] == [dict(element="C", charge=-1), dict(element="O", charge=1)]
assert records[0]["bonds"][0]["order"] == 3
reactants = Counter(records[0]["atomCounts"])
reactants.update({element: count*2 for element,count in records[1]["atomCounts"].items()})
assert dict(reactants) == records[2]["atomCounts"] == {"C":1,"O":1,"H":4}
assert all(record["formalCharge"] == 0 for record in records)
for filename in ["original-reaction.svg", "reviewed-reaction.svg"]:
    svg = ElementTree.fromstring((here/filename).read_text(encoding="utf-8"))
    assert svg.tag == "{http://www.w3.org/2000/svg}svg"
    assert svg.attrib["viewBox"] == "0 0 883 190"
svg = ElementTree.fromstring((here/"reviewed-reaction.svg").read_text(encoding="utf-8"))
negative = [element for element in svg.iter() if element.attrib.get("data-reviewed-charge") == "carbon-minus"]
assert len(negative) == 1
assert negative[0].attrib["class"] == "atom-0"
report = dict(status="PASS", pythonVersion=sys.version, rdkitVersion=rdBase.rdkitVersion,
              purpose="Read-only supplementary molecular/formal-charge/atom/bond/XML invariants; no depictions or global assets generated.",
              exactManagedProfileUsed=False, species=records, balancedReaction=True, netChargeBothSides=0,
              xml=["original-reaction.svg","reviewed-reaction.svg"])
(here/"chemistry-check.json").write_text(json.dumps(report,indent=2)+"\n", encoding="utf-8")
print(json.dumps(report))
