/* Complete source bank, deterministic extraction; no page runtime. */
export const bank=[
  {
    "id": "h2",
    "name": "Hydrogen",
    "formula": "H2",
    "displayFormula": "H2",
    "totalCharge": 0,
    "namedSpecies": false,
    "category": "covalent",
    "practiceCategory": "covalent",
    "extension": false,
    "grades": [
      1
    ],
    "scope": "specification",
    "atlasEvidence": null,
    "smiles": "[H][H]",
    "prompt": "Draw any valid neutral isomer with this molecular formula, as one connected molecule. Show outer-shell electrons only. Each shared pair needs one dot and one cross; use one symbol for the non-bonding electrons on each atom. Inner shells and molecular shape are not assessed.",
    "explanation": "Shared pairs contain one electron from each atom. Hydrogen has two electrons around it; shared and non-bonding electrons give every other atom eight. Bonds: 1 × H–H (1 shared pair). No non-bonding electrons.",
    "sourceRefs": [
      "Edexcel International GCSE Chemistry specification Issue 3 (September 2024), sections 1.40 and 1.46; accessed 2026-09-12",
      "https://qualifications.pearson.com/content/dam/pdf/International%20GCSE/Chemistry/2017/specification-and-sample-assessments/international-gcse-chemistry-2017-specification.pdf"
    ],
    "reference": {
      "atoms": [
        {
          "id": "H1",
          "element": "H",
          "x": 472,
          "y": 325
        },
        {
          "id": "H2",
          "element": "H",
          "x": 528,
          "y": 325
        }
      ],
      "electrons": [
        {
          "id": "e1",
          "symbol": "dot",
          "anchor": {
            "kind": "bond",
            "a": "H1",
            "b": "H2",
            "slot": 0
          }
        },
        {
          "id": "e2",
          "symbol": "cross",
          "anchor": {
            "kind": "bond",
            "a": "H1",
            "b": "H2",
            "slot": 1
          }
        }
      ],
      "groups": []
    },
    "viewBox": {
      "width": 1000,
      "height": 650,
      "atomRadius": 64,
      "hydrogenRadius": 40,
      "bondLength": 104,
      "shellOverlap": 24
    },
    "electronSlots": {
      "atom": {
        "directions": [
          -100,
          -80,
          -10,
          10,
          80,
          100,
          170,
          190
        ],
        "radius": 64,
        "hydrogenRadius": 40
      },
      "bond": {
        "maxPairs": 3,
        "centredInOverlap": true,
        "perpendicularOffsets": [
          -5,
          5
        ],
        "pairSpacing": 22
      }
    },
    "marking": {
      "cationShells": "empty-or-retained-full-shell",
      "geometryChecked": false,
      "speciesSpecific": false
    },
    "prerequisiteOrder": 0
  },
  {
    "id": "cl2",
    "name": "Chlorine",
    "formula": "Cl2",
    "displayFormula": "Cl2",
    "totalCharge": 0,
    "namedSpecies": false,
    "category": "covalent",
    "practiceCategory": "covalent",
    "extension": false,
    "grades": [
      1
    ],
    "scope": "specification",
    "atlasEvidence": null,
    "smiles": "ClCl",
    "prompt": "Draw any valid neutral isomer with this molecular formula, as one connected molecule. Show outer-shell electrons only. Each shared pair needs one dot and one cross; use one symbol for the non-bonding electrons on each atom. Inner shells and molecular shape are not assessed.",
    "explanation": "Shared pairs contain one electron from each atom. Hydrogen has two electrons around it; shared and non-bonding electrons give every other atom eight. Bonds: 1 × Cl–Cl (1 shared pair). Non-bonding inventory: 2 × Cl: 6 non-bonding electrons.",
    "sourceRefs": [
      "Edexcel International GCSE Chemistry specification Issue 3 (September 2024), sections 1.40 and 1.46; accessed 2026-09-12",
      "https://qualifications.pearson.com/content/dam/pdf/International%20GCSE/Chemistry/2017/specification-and-sample-assessments/international-gcse-chemistry-2017-specification.pdf"
    ],
    "reference": {
      "atoms": [
        {
          "id": "Cl1",
          "element": "Cl",
          "x": 448,
          "y": 325
        },
        {
          "id": "Cl2",
          "element": "Cl",
          "x": 552,
          "y": 325
        }
      ],
      "electrons": [
        {
          "id": "e3",
          "symbol": "dot",
          "anchor": {
            "kind": "bond",
            "a": "Cl1",
            "b": "Cl2",
            "slot": 0
          }
        },
        {
          "id": "e4",
          "symbol": "cross",
          "anchor": {
            "kind": "bond",
            "a": "Cl1",
            "b": "Cl2",
            "slot": 1
          }
        },
        {
          "id": "e5",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "Cl1",
            "slot": 0
          }
        },
        {
          "id": "e6",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "Cl1",
            "slot": 1
          }
        },
        {
          "id": "e7",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "Cl1",
            "slot": 4
          }
        },
        {
          "id": "e8",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "Cl1",
            "slot": 5
          }
        },
        {
          "id": "e9",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "Cl1",
            "slot": 6
          }
        },
        {
          "id": "e10",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "Cl1",
            "slot": 7
          }
        },
        {
          "id": "e11",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "Cl2",
            "slot": 0
          }
        },
        {
          "id": "e12",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "Cl2",
            "slot": 1
          }
        },
        {
          "id": "e13",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "Cl2",
            "slot": 2
          }
        },
        {
          "id": "e14",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "Cl2",
            "slot": 3
          }
        },
        {
          "id": "e15",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "Cl2",
            "slot": 4
          }
        },
        {
          "id": "e16",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "Cl2",
            "slot": 5
          }
        }
      ],
      "groups": []
    },
    "viewBox": {
      "width": 1000,
      "height": 650,
      "atomRadius": 64,
      "hydrogenRadius": 40,
      "bondLength": 104,
      "shellOverlap": 24
    },
    "electronSlots": {
      "atom": {
        "directions": [
          -100,
          -80,
          -10,
          10,
          80,
          100,
          170,
          190
        ],
        "radius": 64,
        "hydrogenRadius": 40
      },
      "bond": {
        "maxPairs": 3,
        "centredInOverlap": true,
        "perpendicularOffsets": [
          -5,
          5
        ],
        "pairSpacing": 22
      }
    },
    "marking": {
      "cationShells": "empty-or-retained-full-shell",
      "geometryChecked": false,
      "speciesSpecific": false
    },
    "prerequisiteOrder": 1
  },
  {
    "id": "hcl",
    "name": "Hydrogen chloride",
    "formula": "HCl",
    "displayFormula": "HCl",
    "totalCharge": 0,
    "namedSpecies": false,
    "category": "covalent",
    "practiceCategory": "covalent",
    "extension": false,
    "grades": [
      1
    ],
    "scope": "specification",
    "atlasEvidence": [
      {
        "questionId": "2025-june-1r-q8bi",
        "observedBand": "5-6",
        "basis": "resources/past-paper-atlas/data/atlas.json classification.band",
        "relationship": "diagram motif; original practice prompt"
      }
    ],
    "smiles": "[H]Cl",
    "prompt": "Draw any valid neutral isomer with this molecular formula, as one connected molecule. Show outer-shell electrons only. Each shared pair needs one dot and one cross; use one symbol for the non-bonding electrons on each atom. Inner shells and molecular shape are not assessed.",
    "explanation": "Shared pairs contain one electron from each atom. Hydrogen has two electrons around it; shared and non-bonding electrons give every other atom eight. Bonds: 1 × Cl–H (1 shared pair). Non-bonding inventory: 1 × Cl: 6 non-bonding electrons.",
    "sourceRefs": [
      "Edexcel International GCSE Chemistry specification Issue 3 (September 2024), sections 1.40 and 1.46; accessed 2026-09-12",
      "https://qualifications.pearson.com/content/dam/pdf/International%20GCSE/Chemistry/2017/specification-and-sample-assessments/international-gcse-chemistry-2017-specification.pdf",
      "resources/past-paper-atlas/data/atlas.json#2025-june-1r-q8bi"
    ],
    "reference": {
      "atoms": [
        {
          "id": "H1",
          "element": "H",
          "x": 472,
          "y": 325
        },
        {
          "id": "Cl1",
          "element": "Cl",
          "x": 552,
          "y": 325
        }
      ],
      "electrons": [
        {
          "id": "e17",
          "symbol": "dot",
          "anchor": {
            "kind": "bond",
            "a": "H1",
            "b": "Cl1",
            "slot": 0
          }
        },
        {
          "id": "e18",
          "symbol": "cross",
          "anchor": {
            "kind": "bond",
            "a": "H1",
            "b": "Cl1",
            "slot": 1
          }
        },
        {
          "id": "e19",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "Cl1",
            "slot": 0
          }
        },
        {
          "id": "e20",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "Cl1",
            "slot": 1
          }
        },
        {
          "id": "e21",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "Cl1",
            "slot": 2
          }
        },
        {
          "id": "e22",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "Cl1",
            "slot": 3
          }
        },
        {
          "id": "e23",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "Cl1",
            "slot": 4
          }
        },
        {
          "id": "e24",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "Cl1",
            "slot": 5
          }
        }
      ],
      "groups": []
    },
    "viewBox": {
      "width": 1000,
      "height": 650,
      "atomRadius": 64,
      "hydrogenRadius": 40,
      "bondLength": 104,
      "shellOverlap": 24
    },
    "electronSlots": {
      "atom": {
        "directions": [
          -100,
          -80,
          -10,
          10,
          80,
          100,
          170,
          190
        ],
        "radius": 64,
        "hydrogenRadius": 40
      },
      "bond": {
        "maxPairs": 3,
        "centredInOverlap": true,
        "perpendicularOffsets": [
          -5,
          5
        ],
        "pairSpacing": 22
      }
    },
    "marking": {
      "cationShells": "empty-or-retained-full-shell",
      "geometryChecked": false,
      "speciesSpecific": false
    },
    "prerequisiteOrder": 2
  },
  {
    "id": "h2o",
    "name": "Water",
    "formula": "H2O",
    "displayFormula": "H2O",
    "totalCharge": 0,
    "namedSpecies": false,
    "category": "covalent",
    "practiceCategory": "covalent",
    "extension": false,
    "grades": [
      2
    ],
    "scope": "specification",
    "atlasEvidence": null,
    "smiles": "O",
    "prompt": "Draw any valid neutral isomer with this molecular formula, as one connected molecule. Show outer-shell electrons only. Each shared pair needs one dot and one cross; use one symbol for the non-bonding electrons on each atom. Inner shells and molecular shape are not assessed.",
    "explanation": "Shared pairs contain one electron from each atom. Hydrogen has two electrons around it; shared and non-bonding electrons give every other atom eight. Bonds: 2 × H–O (1 shared pair). Non-bonding inventory: 1 × O: 4 non-bonding electrons.",
    "sourceRefs": [
      "Edexcel International GCSE Chemistry specification Issue 3 (September 2024), sections 1.40 and 1.46; accessed 2026-09-12",
      "https://qualifications.pearson.com/content/dam/pdf/International%20GCSE/Chemistry/2017/specification-and-sample-assessments/international-gcse-chemistry-2017-specification.pdf"
    ],
    "reference": {
      "atoms": [
        {
          "id": "O1",
          "element": "O",
          "x": 500,
          "y": 325
        },
        {
          "id": "H1",
          "element": "H",
          "x": 420,
          "y": 325
        },
        {
          "id": "H2",
          "element": "H",
          "x": 580,
          "y": 325
        }
      ],
      "electrons": [
        {
          "id": "e25",
          "symbol": "dot",
          "anchor": {
            "kind": "bond",
            "a": "O1",
            "b": "H1",
            "slot": 0
          }
        },
        {
          "id": "e26",
          "symbol": "cross",
          "anchor": {
            "kind": "bond",
            "a": "O1",
            "b": "H1",
            "slot": 1
          }
        },
        {
          "id": "e27",
          "symbol": "dot",
          "anchor": {
            "kind": "bond",
            "a": "O1",
            "b": "H2",
            "slot": 0
          }
        },
        {
          "id": "e28",
          "symbol": "cross",
          "anchor": {
            "kind": "bond",
            "a": "O1",
            "b": "H2",
            "slot": 1
          }
        },
        {
          "id": "e29",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "O1",
            "slot": 0
          }
        },
        {
          "id": "e30",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "O1",
            "slot": 1
          }
        },
        {
          "id": "e31",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "O1",
            "slot": 4
          }
        },
        {
          "id": "e32",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "O1",
            "slot": 5
          }
        }
      ],
      "groups": []
    },
    "viewBox": {
      "width": 1000,
      "height": 650,
      "atomRadius": 64,
      "hydrogenRadius": 40,
      "bondLength": 104,
      "shellOverlap": 24
    },
    "electronSlots": {
      "atom": {
        "directions": [
          -100,
          -80,
          -10,
          10,
          80,
          100,
          170,
          190
        ],
        "radius": 64,
        "hydrogenRadius": 40
      },
      "bond": {
        "maxPairs": 3,
        "centredInOverlap": true,
        "perpendicularOffsets": [
          -5,
          5
        ],
        "pairSpacing": 22
      }
    },
    "marking": {
      "cationShells": "empty-or-retained-full-shell",
      "geometryChecked": false,
      "speciesSpecific": false
    },
    "prerequisiteOrder": 3
  },
  {
    "id": "nh3",
    "name": "Ammonia",
    "formula": "NH3",
    "displayFormula": "NH3",
    "totalCharge": 0,
    "namedSpecies": false,
    "category": "covalent",
    "practiceCategory": "covalent",
    "extension": false,
    "grades": [
      2
    ],
    "scope": "specification",
    "atlasEvidence": [
      {
        "questionId": "2022-june-1-q10a",
        "observedBand": "5-6",
        "basis": "resources/past-paper-atlas/data/atlas.json classification.band",
        "relationship": "diagram motif; original practice prompt"
      },
      {
        "questionId": "2021-june-1-q8biii",
        "observedBand": "7-8",
        "basis": "resources/past-paper-atlas/data/atlas.json classification.band",
        "relationship": "diagram motif; original practice prompt"
      }
    ],
    "smiles": "N",
    "prompt": "Draw any valid neutral isomer with this molecular formula, as one connected molecule. Show outer-shell electrons only. Each shared pair needs one dot and one cross; use one symbol for the non-bonding electrons on each atom. Inner shells and molecular shape are not assessed.",
    "explanation": "Shared pairs contain one electron from each atom. Hydrogen has two electrons around it; shared and non-bonding electrons give every other atom eight. Bonds: 3 × H–N (1 shared pair). Non-bonding inventory: 1 × N: 2 non-bonding electrons.",
    "sourceRefs": [
      "Edexcel International GCSE Chemistry specification Issue 3 (September 2024), sections 1.40 and 1.46; accessed 2026-09-12",
      "https://qualifications.pearson.com/content/dam/pdf/International%20GCSE/Chemistry/2017/specification-and-sample-assessments/international-gcse-chemistry-2017-specification.pdf",
      "resources/past-paper-atlas/data/atlas.json#2022-june-1-q10a",
      "resources/past-paper-atlas/data/atlas.json#2021-june-1-q8biii"
    ],
    "reference": {
      "atoms": [
        {
          "id": "N1",
          "element": "N",
          "x": 500,
          "y": 325
        },
        {
          "id": "H1",
          "element": "H",
          "x": 420,
          "y": 325
        },
        {
          "id": "H2",
          "element": "H",
          "x": 500,
          "y": 405
        },
        {
          "id": "H3",
          "element": "H",
          "x": 580,
          "y": 325
        }
      ],
      "electrons": [
        {
          "id": "e33",
          "symbol": "dot",
          "anchor": {
            "kind": "bond",
            "a": "N1",
            "b": "H1",
            "slot": 0
          }
        },
        {
          "id": "e34",
          "symbol": "cross",
          "anchor": {
            "kind": "bond",
            "a": "N1",
            "b": "H1",
            "slot": 1
          }
        },
        {
          "id": "e35",
          "symbol": "dot",
          "anchor": {
            "kind": "bond",
            "a": "N1",
            "b": "H2",
            "slot": 0
          }
        },
        {
          "id": "e36",
          "symbol": "cross",
          "anchor": {
            "kind": "bond",
            "a": "N1",
            "b": "H2",
            "slot": 1
          }
        },
        {
          "id": "e37",
          "symbol": "dot",
          "anchor": {
            "kind": "bond",
            "a": "N1",
            "b": "H3",
            "slot": 0
          }
        },
        {
          "id": "e38",
          "symbol": "cross",
          "anchor": {
            "kind": "bond",
            "a": "N1",
            "b": "H3",
            "slot": 1
          }
        },
        {
          "id": "e39",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "N1",
            "slot": 0
          }
        },
        {
          "id": "e40",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "N1",
            "slot": 1
          }
        }
      ],
      "groups": []
    },
    "viewBox": {
      "width": 1000,
      "height": 650,
      "atomRadius": 64,
      "hydrogenRadius": 40,
      "bondLength": 104,
      "shellOverlap": 24
    },
    "electronSlots": {
      "atom": {
        "directions": [
          -100,
          -80,
          -10,
          10,
          80,
          100,
          170,
          190
        ],
        "radius": 64,
        "hydrogenRadius": 40
      },
      "bond": {
        "maxPairs": 3,
        "centredInOverlap": true,
        "perpendicularOffsets": [
          -5,
          5
        ],
        "pairSpacing": 22
      }
    },
    "marking": {
      "cationShells": "empty-or-retained-full-shell",
      "geometryChecked": false,
      "speciesSpecific": false
    },
    "prerequisiteOrder": 4
  },
  {
    "id": "ch4",
    "name": "Methane",
    "formula": "CH4",
    "displayFormula": "CH4",
    "totalCharge": 0,
    "namedSpecies": false,
    "category": "covalent",
    "practiceCategory": "covalent",
    "extension": false,
    "grades": [
      2
    ],
    "scope": "specification",
    "atlasEvidence": null,
    "smiles": "C",
    "prompt": "Draw any valid neutral isomer with this molecular formula, as one connected molecule. Show outer-shell electrons only. Each shared pair needs one dot and one cross; use one symbol for the non-bonding electrons on each atom. Inner shells and molecular shape are not assessed.",
    "explanation": "Shared pairs contain one electron from each atom. Hydrogen has two electrons around it; shared and non-bonding electrons give every other atom eight. Bonds: 4 × C–H (1 shared pair). No non-bonding electrons.",
    "sourceRefs": [
      "Edexcel International GCSE Chemistry specification Issue 3 (September 2024), sections 1.40 and 1.46; accessed 2026-09-12",
      "https://qualifications.pearson.com/content/dam/pdf/International%20GCSE/Chemistry/2017/specification-and-sample-assessments/international-gcse-chemistry-2017-specification.pdf"
    ],
    "reference": {
      "atoms": [
        {
          "id": "C1",
          "element": "C",
          "x": 500,
          "y": 325
        },
        {
          "id": "H1",
          "element": "H",
          "x": 420,
          "y": 325
        },
        {
          "id": "H2",
          "element": "H",
          "x": 500,
          "y": 245
        },
        {
          "id": "H3",
          "element": "H",
          "x": 500,
          "y": 405
        },
        {
          "id": "H4",
          "element": "H",
          "x": 580,
          "y": 325
        }
      ],
      "electrons": [
        {
          "id": "e41",
          "symbol": "dot",
          "anchor": {
            "kind": "bond",
            "a": "C1",
            "b": "H1",
            "slot": 0
          }
        },
        {
          "id": "e42",
          "symbol": "cross",
          "anchor": {
            "kind": "bond",
            "a": "C1",
            "b": "H1",
            "slot": 1
          }
        },
        {
          "id": "e43",
          "symbol": "dot",
          "anchor": {
            "kind": "bond",
            "a": "C1",
            "b": "H2",
            "slot": 0
          }
        },
        {
          "id": "e44",
          "symbol": "cross",
          "anchor": {
            "kind": "bond",
            "a": "C1",
            "b": "H2",
            "slot": 1
          }
        },
        {
          "id": "e45",
          "symbol": "dot",
          "anchor": {
            "kind": "bond",
            "a": "C1",
            "b": "H3",
            "slot": 0
          }
        },
        {
          "id": "e46",
          "symbol": "cross",
          "anchor": {
            "kind": "bond",
            "a": "C1",
            "b": "H3",
            "slot": 1
          }
        },
        {
          "id": "e47",
          "symbol": "dot",
          "anchor": {
            "kind": "bond",
            "a": "C1",
            "b": "H4",
            "slot": 0
          }
        },
        {
          "id": "e48",
          "symbol": "cross",
          "anchor": {
            "kind": "bond",
            "a": "C1",
            "b": "H4",
            "slot": 1
          }
        }
      ],
      "groups": []
    },
    "viewBox": {
      "width": 1000,
      "height": 650,
      "atomRadius": 64,
      "hydrogenRadius": 40,
      "bondLength": 104,
      "shellOverlap": 24
    },
    "electronSlots": {
      "atom": {
        "directions": [
          -100,
          -80,
          -10,
          10,
          80,
          100,
          170,
          190
        ],
        "radius": 64,
        "hydrogenRadius": 40
      },
      "bond": {
        "maxPairs": 3,
        "centredInOverlap": true,
        "perpendicularOffsets": [
          -5,
          5
        ],
        "pairSpacing": 22
      }
    },
    "marking": {
      "cationShells": "empty-or-retained-full-shell",
      "geometryChecked": false,
      "speciesSpecific": false
    },
    "prerequisiteOrder": 5
  },
  {
    "id": "o2",
    "name": "Oxygen",
    "formula": "O2",
    "displayFormula": "O2",
    "totalCharge": 0,
    "namedSpecies": false,
    "category": "covalent",
    "practiceCategory": "covalent",
    "extension": false,
    "grades": [
      1
    ],
    "scope": "specification",
    "atlasEvidence": null,
    "smiles": "O=O",
    "prompt": "Draw any valid neutral isomer with this molecular formula, as one connected molecule. Show outer-shell electrons only. Each shared pair needs one dot and one cross; use one symbol for the non-bonding electrons on each atom. Inner shells and molecular shape are not assessed.",
    "explanation": "Shared pairs contain one electron from each atom. Hydrogen has two electrons around it; shared and non-bonding electrons give every other atom eight. Bonds: 1 × O–O (2 shared pairs). Non-bonding inventory: 2 × O: 4 non-bonding electrons.",
    "sourceRefs": [
      "Edexcel International GCSE Chemistry specification Issue 3 (September 2024), sections 1.40 and 1.46; accessed 2026-09-12",
      "https://qualifications.pearson.com/content/dam/pdf/International%20GCSE/Chemistry/2017/specification-and-sample-assessments/international-gcse-chemistry-2017-specification.pdf"
    ],
    "reference": {
      "atoms": [
        {
          "id": "O1",
          "element": "O",
          "x": 448,
          "y": 325
        },
        {
          "id": "O2",
          "element": "O",
          "x": 552,
          "y": 325
        }
      ],
      "electrons": [
        {
          "id": "e49",
          "symbol": "dot",
          "anchor": {
            "kind": "bond",
            "a": "O1",
            "b": "O2",
            "slot": 0
          }
        },
        {
          "id": "e50",
          "symbol": "cross",
          "anchor": {
            "kind": "bond",
            "a": "O1",
            "b": "O2",
            "slot": 1
          }
        },
        {
          "id": "e51",
          "symbol": "dot",
          "anchor": {
            "kind": "bond",
            "a": "O1",
            "b": "O2",
            "slot": 2
          }
        },
        {
          "id": "e52",
          "symbol": "cross",
          "anchor": {
            "kind": "bond",
            "a": "O1",
            "b": "O2",
            "slot": 3
          }
        },
        {
          "id": "e53",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "O1",
            "slot": 0
          }
        },
        {
          "id": "e54",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "O1",
            "slot": 1
          }
        },
        {
          "id": "e55",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "O1",
            "slot": 4
          }
        },
        {
          "id": "e56",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "O1",
            "slot": 5
          }
        },
        {
          "id": "e57",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "O2",
            "slot": 0
          }
        },
        {
          "id": "e58",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "O2",
            "slot": 1
          }
        },
        {
          "id": "e59",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "O2",
            "slot": 2
          }
        },
        {
          "id": "e60",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "O2",
            "slot": 3
          }
        }
      ],
      "groups": []
    },
    "viewBox": {
      "width": 1000,
      "height": 650,
      "atomRadius": 64,
      "hydrogenRadius": 40,
      "bondLength": 104,
      "shellOverlap": 24
    },
    "electronSlots": {
      "atom": {
        "directions": [
          -100,
          -80,
          -10,
          10,
          80,
          100,
          170,
          190
        ],
        "radius": 64,
        "hydrogenRadius": 40
      },
      "bond": {
        "maxPairs": 3,
        "centredInOverlap": true,
        "perpendicularOffsets": [
          -5,
          5
        ],
        "pairSpacing": 22
      }
    },
    "marking": {
      "cationShells": "empty-or-retained-full-shell",
      "geometryChecked": false,
      "speciesSpecific": false
    },
    "prerequisiteOrder": 6
  },
  {
    "id": "n2",
    "name": "Nitrogen",
    "formula": "N2",
    "displayFormula": "N2",
    "totalCharge": 0,
    "namedSpecies": false,
    "category": "covalent",
    "practiceCategory": "covalent",
    "extension": false,
    "grades": [
      2,
      3
    ],
    "scope": "specification",
    "atlasEvidence": [
      {
        "questionId": "2024-june-1-q7(b)",
        "observedBand": "7-8",
        "basis": "resources/past-paper-atlas/data/atlas.json classification.band",
        "relationship": "diagram motif; original practice prompt"
      },
      {
        "questionId": "2022-jan-1-q10ai",
        "observedBand": "9",
        "basis": "resources/past-paper-atlas/data/atlas.json classification.band",
        "relationship": "diagram motif; original practice prompt"
      }
    ],
    "smiles": "N#N",
    "prompt": "Draw any valid neutral isomer with this molecular formula, as one connected molecule. Show outer-shell electrons only. Each shared pair needs one dot and one cross; use one symbol for the non-bonding electrons on each atom. Inner shells and molecular shape are not assessed.",
    "explanation": "Shared pairs contain one electron from each atom. Hydrogen has two electrons around it; shared and non-bonding electrons give every other atom eight. Bonds: 1 × N–N (3 shared pairs). Non-bonding inventory: 2 × N: 2 non-bonding electrons.",
    "sourceRefs": [
      "Edexcel International GCSE Chemistry specification Issue 3 (September 2024), sections 1.40 and 1.46; accessed 2026-09-12",
      "https://qualifications.pearson.com/content/dam/pdf/International%20GCSE/Chemistry/2017/specification-and-sample-assessments/international-gcse-chemistry-2017-specification.pdf",
      "resources/past-paper-atlas/data/atlas.json#2024-june-1-q7(b)",
      "resources/past-paper-atlas/data/atlas.json#2022-jan-1-q10ai"
    ],
    "reference": {
      "atoms": [
        {
          "id": "N1",
          "element": "N",
          "x": 448,
          "y": 325
        },
        {
          "id": "N2",
          "element": "N",
          "x": 552,
          "y": 325
        }
      ],
      "electrons": [
        {
          "id": "e61",
          "symbol": "dot",
          "anchor": {
            "kind": "bond",
            "a": "N1",
            "b": "N2",
            "slot": 0
          }
        },
        {
          "id": "e62",
          "symbol": "cross",
          "anchor": {
            "kind": "bond",
            "a": "N1",
            "b": "N2",
            "slot": 1
          }
        },
        {
          "id": "e63",
          "symbol": "dot",
          "anchor": {
            "kind": "bond",
            "a": "N1",
            "b": "N2",
            "slot": 2
          }
        },
        {
          "id": "e64",
          "symbol": "cross",
          "anchor": {
            "kind": "bond",
            "a": "N1",
            "b": "N2",
            "slot": 3
          }
        },
        {
          "id": "e65",
          "symbol": "dot",
          "anchor": {
            "kind": "bond",
            "a": "N1",
            "b": "N2",
            "slot": 4
          }
        },
        {
          "id": "e66",
          "symbol": "cross",
          "anchor": {
            "kind": "bond",
            "a": "N1",
            "b": "N2",
            "slot": 5
          }
        },
        {
          "id": "e67",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "N1",
            "slot": 0
          }
        },
        {
          "id": "e68",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "N1",
            "slot": 1
          }
        },
        {
          "id": "e69",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "N2",
            "slot": 0
          }
        },
        {
          "id": "e70",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "N2",
            "slot": 1
          }
        }
      ],
      "groups": []
    },
    "viewBox": {
      "width": 1000,
      "height": 650,
      "atomRadius": 64,
      "hydrogenRadius": 40,
      "bondLength": 104,
      "shellOverlap": 24
    },
    "electronSlots": {
      "atom": {
        "directions": [
          -100,
          -80,
          -10,
          10,
          80,
          100,
          170,
          190
        ],
        "radius": 64,
        "hydrogenRadius": 40
      },
      "bond": {
        "maxPairs": 3,
        "centredInOverlap": true,
        "perpendicularOffsets": [
          -5,
          5
        ],
        "pairSpacing": 22
      }
    },
    "marking": {
      "cationShells": "empty-or-retained-full-shell",
      "geometryChecked": false,
      "speciesSpecific": false
    },
    "prerequisiteOrder": 7
  },
  {
    "id": "co2",
    "name": "Carbon dioxide",
    "formula": "CO2",
    "displayFormula": "CO2",
    "totalCharge": 0,
    "namedSpecies": false,
    "category": "covalent",
    "practiceCategory": "covalent",
    "extension": false,
    "grades": [
      2
    ],
    "scope": "specification",
    "atlasEvidence": [
      {
        "questionId": "2020-jan-1r-q10ai",
        "observedBand": "5-6",
        "basis": "resources/past-paper-atlas/data/atlas.json classification.band",
        "relationship": "diagram motif; original practice prompt"
      }
    ],
    "smiles": "O=C=O",
    "prompt": "Draw any valid neutral isomer with this molecular formula, as one connected molecule. Show outer-shell electrons only. Each shared pair needs one dot and one cross; use one symbol for the non-bonding electrons on each atom. Inner shells and molecular shape are not assessed.",
    "explanation": "Shared pairs contain one electron from each atom. Hydrogen has two electrons around it; shared and non-bonding electrons give every other atom eight. Bonds: 2 × C–O (2 shared pairs). Non-bonding inventory: 2 × O: 4 non-bonding electrons.",
    "sourceRefs": [
      "Edexcel International GCSE Chemistry specification Issue 3 (September 2024), sections 1.40 and 1.46; accessed 2026-09-12",
      "https://qualifications.pearson.com/content/dam/pdf/International%20GCSE/Chemistry/2017/specification-and-sample-assessments/international-gcse-chemistry-2017-specification.pdf",
      "resources/past-paper-atlas/data/atlas.json#2020-jan-1r-q10ai"
    ],
    "reference": {
      "atoms": [
        {
          "id": "C1",
          "element": "C",
          "x": 500,
          "y": 325
        },
        {
          "id": "O1",
          "element": "O",
          "x": 396,
          "y": 325
        },
        {
          "id": "O2",
          "element": "O",
          "x": 604,
          "y": 325
        }
      ],
      "electrons": [
        {
          "id": "e71",
          "symbol": "dot",
          "anchor": {
            "kind": "bond",
            "a": "C1",
            "b": "O1",
            "slot": 0
          }
        },
        {
          "id": "e72",
          "symbol": "cross",
          "anchor": {
            "kind": "bond",
            "a": "C1",
            "b": "O1",
            "slot": 1
          }
        },
        {
          "id": "e73",
          "symbol": "dot",
          "anchor": {
            "kind": "bond",
            "a": "C1",
            "b": "O1",
            "slot": 2
          }
        },
        {
          "id": "e74",
          "symbol": "cross",
          "anchor": {
            "kind": "bond",
            "a": "C1",
            "b": "O1",
            "slot": 3
          }
        },
        {
          "id": "e75",
          "symbol": "dot",
          "anchor": {
            "kind": "bond",
            "a": "C1",
            "b": "O2",
            "slot": 0
          }
        },
        {
          "id": "e76",
          "symbol": "cross",
          "anchor": {
            "kind": "bond",
            "a": "C1",
            "b": "O2",
            "slot": 1
          }
        },
        {
          "id": "e77",
          "symbol": "dot",
          "anchor": {
            "kind": "bond",
            "a": "C1",
            "b": "O2",
            "slot": 2
          }
        },
        {
          "id": "e78",
          "symbol": "cross",
          "anchor": {
            "kind": "bond",
            "a": "C1",
            "b": "O2",
            "slot": 3
          }
        },
        {
          "id": "e79",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "O1",
            "slot": 0
          }
        },
        {
          "id": "e80",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "O1",
            "slot": 1
          }
        },
        {
          "id": "e81",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "O1",
            "slot": 4
          }
        },
        {
          "id": "e82",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "O1",
            "slot": 5
          }
        },
        {
          "id": "e83",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "O2",
            "slot": 0
          }
        },
        {
          "id": "e84",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "O2",
            "slot": 1
          }
        },
        {
          "id": "e85",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "O2",
            "slot": 2
          }
        },
        {
          "id": "e86",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "O2",
            "slot": 3
          }
        }
      ],
      "groups": []
    },
    "viewBox": {
      "width": 1000,
      "height": 650,
      "atomRadius": 64,
      "hydrogenRadius": 40,
      "bondLength": 104,
      "shellOverlap": 24
    },
    "electronSlots": {
      "atom": {
        "directions": [
          -100,
          -80,
          -10,
          10,
          80,
          100,
          170,
          190
        ],
        "radius": 64,
        "hydrogenRadius": 40
      },
      "bond": {
        "maxPairs": 3,
        "centredInOverlap": true,
        "perpendicularOffsets": [
          -5,
          5
        ],
        "pairSpacing": 22
      }
    },
    "marking": {
      "cationShells": "empty-or-retained-full-shell",
      "geometryChecked": false,
      "speciesSpecific": false
    },
    "prerequisiteOrder": 8
  },
  {
    "id": "c2h6",
    "name": "Ethane",
    "formula": "C2H6",
    "displayFormula": "C2H6",
    "totalCharge": 0,
    "namedSpecies": false,
    "category": "covalent",
    "practiceCategory": "covalent",
    "extension": false,
    "grades": [
      2,
      3
    ],
    "scope": "specification",
    "atlasEvidence": null,
    "smiles": "CC",
    "prompt": "Draw any valid neutral isomer with this molecular formula, as one connected molecule. Show outer-shell electrons only. Each shared pair needs one dot and one cross; use one symbol for the non-bonding electrons on each atom. Inner shells and molecular shape are not assessed.",
    "explanation": "Shared pairs contain one electron from each atom. Hydrogen has two electrons around it; shared and non-bonding electrons give every other atom eight. Bonds: 1 × C–C (1 shared pair); 6 × C–H (1 shared pair). No non-bonding electrons.",
    "sourceRefs": [
      "Edexcel International GCSE Chemistry specification Issue 3 (September 2024), sections 1.40 and 1.46; accessed 2026-09-12",
      "https://qualifications.pearson.com/content/dam/pdf/International%20GCSE/Chemistry/2017/specification-and-sample-assessments/international-gcse-chemistry-2017-specification.pdf"
    ],
    "reference": {
      "atoms": [
        {
          "id": "C1",
          "element": "C",
          "x": 448,
          "y": 325
        },
        {
          "id": "C2",
          "element": "C",
          "x": 552,
          "y": 325
        },
        {
          "id": "H1",
          "element": "H",
          "x": 368,
          "y": 325
        },
        {
          "id": "H2",
          "element": "H",
          "x": 448,
          "y": 245
        },
        {
          "id": "H3",
          "element": "H",
          "x": 448,
          "y": 405
        },
        {
          "id": "H4",
          "element": "H",
          "x": 632,
          "y": 325
        },
        {
          "id": "H5",
          "element": "H",
          "x": 552,
          "y": 245
        },
        {
          "id": "H6",
          "element": "H",
          "x": 552,
          "y": 405
        }
      ],
      "electrons": [
        {
          "id": "e87",
          "symbol": "dot",
          "anchor": {
            "kind": "bond",
            "a": "C1",
            "b": "C2",
            "slot": 0
          }
        },
        {
          "id": "e88",
          "symbol": "cross",
          "anchor": {
            "kind": "bond",
            "a": "C1",
            "b": "C2",
            "slot": 1
          }
        },
        {
          "id": "e89",
          "symbol": "dot",
          "anchor": {
            "kind": "bond",
            "a": "C1",
            "b": "H1",
            "slot": 0
          }
        },
        {
          "id": "e90",
          "symbol": "cross",
          "anchor": {
            "kind": "bond",
            "a": "C1",
            "b": "H1",
            "slot": 1
          }
        },
        {
          "id": "e91",
          "symbol": "dot",
          "anchor": {
            "kind": "bond",
            "a": "C1",
            "b": "H2",
            "slot": 0
          }
        },
        {
          "id": "e92",
          "symbol": "cross",
          "anchor": {
            "kind": "bond",
            "a": "C1",
            "b": "H2",
            "slot": 1
          }
        },
        {
          "id": "e93",
          "symbol": "dot",
          "anchor": {
            "kind": "bond",
            "a": "C1",
            "b": "H3",
            "slot": 0
          }
        },
        {
          "id": "e94",
          "symbol": "cross",
          "anchor": {
            "kind": "bond",
            "a": "C1",
            "b": "H3",
            "slot": 1
          }
        },
        {
          "id": "e95",
          "symbol": "dot",
          "anchor": {
            "kind": "bond",
            "a": "C2",
            "b": "H4",
            "slot": 0
          }
        },
        {
          "id": "e96",
          "symbol": "cross",
          "anchor": {
            "kind": "bond",
            "a": "C2",
            "b": "H4",
            "slot": 1
          }
        },
        {
          "id": "e97",
          "symbol": "dot",
          "anchor": {
            "kind": "bond",
            "a": "C2",
            "b": "H5",
            "slot": 0
          }
        },
        {
          "id": "e98",
          "symbol": "cross",
          "anchor": {
            "kind": "bond",
            "a": "C2",
            "b": "H5",
            "slot": 1
          }
        },
        {
          "id": "e99",
          "symbol": "dot",
          "anchor": {
            "kind": "bond",
            "a": "C2",
            "b": "H6",
            "slot": 0
          }
        },
        {
          "id": "e100",
          "symbol": "cross",
          "anchor": {
            "kind": "bond",
            "a": "C2",
            "b": "H6",
            "slot": 1
          }
        }
      ],
      "groups": []
    },
    "viewBox": {
      "width": 1000,
      "height": 650,
      "atomRadius": 64,
      "hydrogenRadius": 40,
      "bondLength": 104,
      "shellOverlap": 24
    },
    "electronSlots": {
      "atom": {
        "directions": [
          -100,
          -80,
          -10,
          10,
          80,
          100,
          170,
          190
        ],
        "radius": 64,
        "hydrogenRadius": 40
      },
      "bond": {
        "maxPairs": 3,
        "centredInOverlap": true,
        "perpendicularOffsets": [
          -5,
          5
        ],
        "pairSpacing": 22
      }
    },
    "marking": {
      "cationShells": "empty-or-retained-full-shell",
      "geometryChecked": false,
      "speciesSpecific": false
    },
    "prerequisiteOrder": 9
  },
  {
    "id": "c2h4",
    "name": "Ethene",
    "formula": "C2H4",
    "displayFormula": "C2H4",
    "totalCharge": 0,
    "namedSpecies": false,
    "category": "covalent",
    "practiceCategory": "covalent",
    "extension": false,
    "grades": [
      2,
      3
    ],
    "scope": "specification",
    "atlasEvidence": [
      {
        "questionId": "2023-june-1-q4aii",
        "observedBand": "7-8",
        "basis": "resources/past-paper-atlas/data/atlas.json classification.band",
        "relationship": "diagram motif; original practice prompt"
      }
    ],
    "smiles": "C=C",
    "prompt": "Draw any valid neutral isomer with this molecular formula, as one connected molecule. Show outer-shell electrons only. Each shared pair needs one dot and one cross; use one symbol for the non-bonding electrons on each atom. Inner shells and molecular shape are not assessed.",
    "explanation": "Shared pairs contain one electron from each atom. Hydrogen has two electrons around it; shared and non-bonding electrons give every other atom eight. Bonds: 1 × C–C (2 shared pairs); 4 × C–H (1 shared pair). No non-bonding electrons.",
    "sourceRefs": [
      "Edexcel International GCSE Chemistry specification Issue 3 (September 2024), sections 1.40 and 1.46; accessed 2026-09-12",
      "https://qualifications.pearson.com/content/dam/pdf/International%20GCSE/Chemistry/2017/specification-and-sample-assessments/international-gcse-chemistry-2017-specification.pdf",
      "resources/past-paper-atlas/data/atlas.json#2023-june-1-q4aii"
    ],
    "reference": {
      "atoms": [
        {
          "id": "C1",
          "element": "C",
          "x": 448,
          "y": 325
        },
        {
          "id": "C2",
          "element": "C",
          "x": 552,
          "y": 325
        },
        {
          "id": "H1",
          "element": "H",
          "x": 378.73079414043593,
          "y": 284.97779217002966
        },
        {
          "id": "H2",
          "element": "H",
          "x": 378.73079414043593,
          "y": 365.02220782997034
        },
        {
          "id": "H3",
          "element": "H",
          "x": 621.2692058595641,
          "y": 284.97779217002966
        },
        {
          "id": "H4",
          "element": "H",
          "x": 621.2692058595641,
          "y": 365.02220782997034
        }
      ],
      "electrons": [
        {
          "id": "e101",
          "symbol": "dot",
          "anchor": {
            "kind": "bond",
            "a": "C1",
            "b": "C2",
            "slot": 0
          }
        },
        {
          "id": "e102",
          "symbol": "cross",
          "anchor": {
            "kind": "bond",
            "a": "C1",
            "b": "C2",
            "slot": 1
          }
        },
        {
          "id": "e103",
          "symbol": "dot",
          "anchor": {
            "kind": "bond",
            "a": "C1",
            "b": "C2",
            "slot": 2
          }
        },
        {
          "id": "e104",
          "symbol": "cross",
          "anchor": {
            "kind": "bond",
            "a": "C1",
            "b": "C2",
            "slot": 3
          }
        },
        {
          "id": "e105",
          "symbol": "dot",
          "anchor": {
            "kind": "bond",
            "a": "C1",
            "b": "H1",
            "slot": 0
          }
        },
        {
          "id": "e106",
          "symbol": "cross",
          "anchor": {
            "kind": "bond",
            "a": "C1",
            "b": "H1",
            "slot": 1
          }
        },
        {
          "id": "e107",
          "symbol": "dot",
          "anchor": {
            "kind": "bond",
            "a": "C1",
            "b": "H2",
            "slot": 0
          }
        },
        {
          "id": "e108",
          "symbol": "cross",
          "anchor": {
            "kind": "bond",
            "a": "C1",
            "b": "H2",
            "slot": 1
          }
        },
        {
          "id": "e109",
          "symbol": "dot",
          "anchor": {
            "kind": "bond",
            "a": "C2",
            "b": "H3",
            "slot": 0
          }
        },
        {
          "id": "e110",
          "symbol": "cross",
          "anchor": {
            "kind": "bond",
            "a": "C2",
            "b": "H3",
            "slot": 1
          }
        },
        {
          "id": "e111",
          "symbol": "dot",
          "anchor": {
            "kind": "bond",
            "a": "C2",
            "b": "H4",
            "slot": 0
          }
        },
        {
          "id": "e112",
          "symbol": "cross",
          "anchor": {
            "kind": "bond",
            "a": "C2",
            "b": "H4",
            "slot": 1
          }
        }
      ],
      "groups": []
    },
    "viewBox": {
      "width": 1000,
      "height": 650,
      "atomRadius": 64,
      "hydrogenRadius": 40,
      "bondLength": 104,
      "shellOverlap": 24
    },
    "electronSlots": {
      "atom": {
        "directions": [
          -100,
          -80,
          -10,
          10,
          80,
          100,
          170,
          190
        ],
        "radius": 64,
        "hydrogenRadius": 40
      },
      "bond": {
        "maxPairs": 3,
        "centredInOverlap": true,
        "perpendicularOffsets": [
          -5,
          5
        ],
        "pairSpacing": 22
      }
    },
    "marking": {
      "cationShells": "empty-or-retained-full-shell",
      "geometryChecked": false,
      "speciesSpecific": false
    },
    "prerequisiteOrder": 10
  },
  {
    "id": "ch3cl",
    "name": "Chloromethane",
    "formula": "CH3Cl",
    "displayFormula": "CH3Cl",
    "totalCharge": 0,
    "namedSpecies": false,
    "category": "covalent",
    "practiceCategory": "covalent",
    "extension": false,
    "grades": [
      2
    ],
    "scope": "specification",
    "atlasEvidence": [
      {
        "questionId": "2020-nov-1-q5biv",
        "observedBand": "5-6",
        "basis": "resources/past-paper-atlas/data/atlas.json classification.band",
        "relationship": "diagram motif; original practice prompt"
      }
    ],
    "smiles": "CCl",
    "prompt": "Draw any valid neutral isomer with this molecular formula, as one connected molecule. Show outer-shell electrons only. Each shared pair needs one dot and one cross; use one symbol for the non-bonding electrons on each atom. Inner shells and molecular shape are not assessed.",
    "explanation": "Shared pairs contain one electron from each atom. Hydrogen has two electrons around it; shared and non-bonding electrons give every other atom eight. Bonds: 1 × C–Cl (1 shared pair); 3 × C–H (1 shared pair). Non-bonding inventory: 1 × Cl: 6 non-bonding electrons.",
    "sourceRefs": [
      "Edexcel International GCSE Chemistry specification Issue 3 (September 2024), sections 1.40 and 1.46; accessed 2026-09-12",
      "https://qualifications.pearson.com/content/dam/pdf/International%20GCSE/Chemistry/2017/specification-and-sample-assessments/international-gcse-chemistry-2017-specification.pdf",
      "resources/past-paper-atlas/data/atlas.json#2020-nov-1-q5biv"
    ],
    "reference": {
      "atoms": [
        {
          "id": "C1",
          "element": "C",
          "x": 448,
          "y": 325
        },
        {
          "id": "Cl1",
          "element": "Cl",
          "x": 552,
          "y": 325
        },
        {
          "id": "H1",
          "element": "H",
          "x": 368,
          "y": 325
        },
        {
          "id": "H2",
          "element": "H",
          "x": 410.3529411764706,
          "y": 254.41176470588235
        },
        {
          "id": "H3",
          "element": "H",
          "x": 410.3529411764706,
          "y": 395.5882352941177
        }
      ],
      "electrons": [
        {
          "id": "e113",
          "symbol": "dot",
          "anchor": {
            "kind": "bond",
            "a": "C1",
            "b": "Cl1",
            "slot": 0
          }
        },
        {
          "id": "e114",
          "symbol": "cross",
          "anchor": {
            "kind": "bond",
            "a": "C1",
            "b": "Cl1",
            "slot": 1
          }
        },
        {
          "id": "e115",
          "symbol": "dot",
          "anchor": {
            "kind": "bond",
            "a": "C1",
            "b": "H1",
            "slot": 0
          }
        },
        {
          "id": "e116",
          "symbol": "cross",
          "anchor": {
            "kind": "bond",
            "a": "C1",
            "b": "H1",
            "slot": 1
          }
        },
        {
          "id": "e117",
          "symbol": "dot",
          "anchor": {
            "kind": "bond",
            "a": "C1",
            "b": "H2",
            "slot": 0
          }
        },
        {
          "id": "e118",
          "symbol": "cross",
          "anchor": {
            "kind": "bond",
            "a": "C1",
            "b": "H2",
            "slot": 1
          }
        },
        {
          "id": "e119",
          "symbol": "dot",
          "anchor": {
            "kind": "bond",
            "a": "C1",
            "b": "H3",
            "slot": 0
          }
        },
        {
          "id": "e120",
          "symbol": "cross",
          "anchor": {
            "kind": "bond",
            "a": "C1",
            "b": "H3",
            "slot": 1
          }
        },
        {
          "id": "e121",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "Cl1",
            "slot": 0
          }
        },
        {
          "id": "e122",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "Cl1",
            "slot": 1
          }
        },
        {
          "id": "e123",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "Cl1",
            "slot": 2
          }
        },
        {
          "id": "e124",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "Cl1",
            "slot": 3
          }
        },
        {
          "id": "e125",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "Cl1",
            "slot": 4
          }
        },
        {
          "id": "e126",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "Cl1",
            "slot": 5
          }
        }
      ],
      "groups": []
    },
    "viewBox": {
      "width": 1000,
      "height": 650,
      "atomRadius": 64,
      "hydrogenRadius": 40,
      "bondLength": 104,
      "shellOverlap": 24
    },
    "electronSlots": {
      "atom": {
        "directions": [
          -100,
          -80,
          -10,
          10,
          80,
          100,
          170,
          190
        ],
        "radius": 64,
        "hydrogenRadius": 40
      },
      "bond": {
        "maxPairs": 3,
        "centredInOverlap": true,
        "perpendicularOffsets": [
          -5,
          5
        ],
        "pairSpacing": 22
      }
    },
    "marking": {
      "cationShells": "empty-or-retained-full-shell",
      "geometryChecked": false,
      "speciesSpecific": false
    },
    "prerequisiteOrder": 11
  },
  {
    "id": "chloroethene",
    "name": "Chloroethene",
    "formula": "C2H3Cl",
    "displayFormula": "C2H3Cl",
    "totalCharge": 0,
    "namedSpecies": false,
    "category": "covalent",
    "practiceCategory": "covalent",
    "extension": false,
    "grades": [
      2,
      3
    ],
    "scope": "specification",
    "atlasEvidence": [
      {
        "questionId": "2025-june-1-q9ai",
        "observedBand": "7-8",
        "basis": "resources/past-paper-atlas/data/atlas.json classification.band",
        "relationship": "diagram motif; original practice prompt"
      }
    ],
    "smiles": "C=CCl",
    "prompt": "Draw any valid neutral isomer with this molecular formula, as one connected molecule. Show outer-shell electrons only. Each shared pair needs one dot and one cross; use one symbol for the non-bonding electrons on each atom. Inner shells and molecular shape are not assessed.",
    "explanation": "Shared pairs contain one electron from each atom. Hydrogen has two electrons around it; shared and non-bonding electrons give every other atom eight. Bonds: 1 × C–C (2 shared pairs); 3 × C–H (1 shared pair); 1 × C–Cl (1 shared pair). Non-bonding inventory: 1 × Cl: 6 non-bonding electrons.",
    "sourceRefs": [
      "Edexcel International GCSE Chemistry specification Issue 3 (September 2024), sections 1.40 and 1.46; accessed 2026-09-12",
      "https://qualifications.pearson.com/content/dam/pdf/International%20GCSE/Chemistry/2017/specification-and-sample-assessments/international-gcse-chemistry-2017-specification.pdf",
      "resources/past-paper-atlas/data/atlas.json#2025-june-1-q9ai"
    ],
    "reference": {
      "atoms": [
        {
          "id": "C1",
          "element": "C",
          "x": 448,
          "y": 325
        },
        {
          "id": "C2",
          "element": "C",
          "x": 552,
          "y": 325
        },
        {
          "id": "Cl1",
          "element": "Cl",
          "x": 656,
          "y": 325
        },
        {
          "id": "H1",
          "element": "H",
          "x": 378.73079414043593,
          "y": 284.97779217002966
        },
        {
          "id": "H2",
          "element": "H",
          "x": 378.73079414043593,
          "y": 365.02220782997034
        },
        {
          "id": "H3",
          "element": "H",
          "x": 552,
          "y": 405
        }
      ],
      "electrons": [
        {
          "id": "e127",
          "symbol": "dot",
          "anchor": {
            "kind": "bond",
            "a": "C1",
            "b": "C2",
            "slot": 0
          }
        },
        {
          "id": "e128",
          "symbol": "cross",
          "anchor": {
            "kind": "bond",
            "a": "C1",
            "b": "C2",
            "slot": 1
          }
        },
        {
          "id": "e129",
          "symbol": "dot",
          "anchor": {
            "kind": "bond",
            "a": "C1",
            "b": "C2",
            "slot": 2
          }
        },
        {
          "id": "e130",
          "symbol": "cross",
          "anchor": {
            "kind": "bond",
            "a": "C1",
            "b": "C2",
            "slot": 3
          }
        },
        {
          "id": "e131",
          "symbol": "dot",
          "anchor": {
            "kind": "bond",
            "a": "C1",
            "b": "H1",
            "slot": 0
          }
        },
        {
          "id": "e132",
          "symbol": "cross",
          "anchor": {
            "kind": "bond",
            "a": "C1",
            "b": "H1",
            "slot": 1
          }
        },
        {
          "id": "e133",
          "symbol": "dot",
          "anchor": {
            "kind": "bond",
            "a": "C1",
            "b": "H2",
            "slot": 0
          }
        },
        {
          "id": "e134",
          "symbol": "cross",
          "anchor": {
            "kind": "bond",
            "a": "C1",
            "b": "H2",
            "slot": 1
          }
        },
        {
          "id": "e135",
          "symbol": "dot",
          "anchor": {
            "kind": "bond",
            "a": "C2",
            "b": "Cl1",
            "slot": 0
          }
        },
        {
          "id": "e136",
          "symbol": "cross",
          "anchor": {
            "kind": "bond",
            "a": "C2",
            "b": "Cl1",
            "slot": 1
          }
        },
        {
          "id": "e137",
          "symbol": "dot",
          "anchor": {
            "kind": "bond",
            "a": "C2",
            "b": "H3",
            "slot": 0
          }
        },
        {
          "id": "e138",
          "symbol": "cross",
          "anchor": {
            "kind": "bond",
            "a": "C2",
            "b": "H3",
            "slot": 1
          }
        },
        {
          "id": "e139",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "Cl1",
            "slot": 0
          }
        },
        {
          "id": "e140",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "Cl1",
            "slot": 1
          }
        },
        {
          "id": "e141",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "Cl1",
            "slot": 2
          }
        },
        {
          "id": "e142",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "Cl1",
            "slot": 3
          }
        },
        {
          "id": "e143",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "Cl1",
            "slot": 4
          }
        },
        {
          "id": "e144",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "Cl1",
            "slot": 5
          }
        }
      ],
      "groups": []
    },
    "viewBox": {
      "width": 1000,
      "height": 650,
      "atomRadius": 64,
      "hydrogenRadius": 40,
      "bondLength": 104,
      "shellOverlap": 24
    },
    "electronSlots": {
      "atom": {
        "directions": [
          -100,
          -80,
          -10,
          10,
          80,
          100,
          170,
          190
        ],
        "radius": 64,
        "hydrogenRadius": 40
      },
      "bond": {
        "maxPairs": 3,
        "centredInOverlap": true,
        "perpendicularOffsets": [
          -5,
          5
        ],
        "pairSpacing": 22
      }
    },
    "marking": {
      "cationShells": "empty-or-retained-full-shell",
      "geometryChecked": false,
      "speciesSpecific": false
    },
    "prerequisiteOrder": 12
  },
  {
    "id": "f2",
    "name": "Fluorine",
    "formula": "F2",
    "displayFormula": "F2",
    "totalCharge": 0,
    "namedSpecies": false,
    "category": "covalent",
    "practiceCategory": "covalent",
    "extension": false,
    "grades": [
      1
    ],
    "scope": "specification",
    "atlasEvidence": null,
    "smiles": "FF",
    "prompt": "Draw any valid neutral isomer with this molecular formula, as one connected molecule. Show outer-shell electrons only. Each shared pair needs one dot and one cross; use one symbol for the non-bonding electrons on each atom. Inner shells and molecular shape are not assessed.",
    "explanation": "Shared pairs contain one electron from each atom. Hydrogen has two electrons around it; shared and non-bonding electrons give every other atom eight. Bonds: 1 × F–F (1 shared pair). Non-bonding inventory: 2 × F: 6 non-bonding electrons.",
    "sourceRefs": [
      "Edexcel International GCSE Chemistry specification Issue 3 (September 2024), sections 1.40 and 1.46; accessed 2026-09-12",
      "https://qualifications.pearson.com/content/dam/pdf/International%20GCSE/Chemistry/2017/specification-and-sample-assessments/international-gcse-chemistry-2017-specification.pdf"
    ],
    "reference": {
      "atoms": [
        {
          "id": "F1",
          "element": "F",
          "x": 448,
          "y": 325
        },
        {
          "id": "F2",
          "element": "F",
          "x": 552,
          "y": 325
        }
      ],
      "electrons": [
        {
          "id": "e145",
          "symbol": "dot",
          "anchor": {
            "kind": "bond",
            "a": "F1",
            "b": "F2",
            "slot": 0
          }
        },
        {
          "id": "e146",
          "symbol": "cross",
          "anchor": {
            "kind": "bond",
            "a": "F1",
            "b": "F2",
            "slot": 1
          }
        },
        {
          "id": "e147",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "F1",
            "slot": 0
          }
        },
        {
          "id": "e148",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "F1",
            "slot": 1
          }
        },
        {
          "id": "e149",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "F1",
            "slot": 2
          }
        },
        {
          "id": "e150",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "F1",
            "slot": 3
          }
        },
        {
          "id": "e151",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "F1",
            "slot": 4
          }
        },
        {
          "id": "e152",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "F1",
            "slot": 5
          }
        },
        {
          "id": "e153",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "F2",
            "slot": 0
          }
        },
        {
          "id": "e154",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "F2",
            "slot": 1
          }
        },
        {
          "id": "e155",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "F2",
            "slot": 2
          }
        },
        {
          "id": "e156",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "F2",
            "slot": 3
          }
        },
        {
          "id": "e157",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "F2",
            "slot": 4
          }
        },
        {
          "id": "e158",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "F2",
            "slot": 5
          }
        }
      ],
      "groups": []
    },
    "viewBox": {
      "width": 1000,
      "height": 650,
      "atomRadius": 64,
      "hydrogenRadius": 40,
      "bondLength": 104,
      "shellOverlap": 24
    },
    "electronSlots": {
      "atom": {
        "directions": [
          -100,
          -80,
          -10,
          10,
          80,
          100,
          170,
          190
        ],
        "radius": 64,
        "hydrogenRadius": 40
      },
      "bond": {
        "maxPairs": 3,
        "centredInOverlap": true,
        "perpendicularOffsets": [
          -5,
          5
        ],
        "pairSpacing": 22
      }
    },
    "marking": {
      "cationShells": "empty-or-retained-full-shell",
      "geometryChecked": false,
      "speciesSpecific": false
    },
    "prerequisiteOrder": 13
  },
  {
    "id": "br2",
    "name": "Bromine",
    "formula": "Br2",
    "displayFormula": "Br2",
    "totalCharge": 0,
    "namedSpecies": false,
    "category": "covalent",
    "practiceCategory": "covalent",
    "extension": false,
    "grades": [
      1
    ],
    "scope": "specification",
    "atlasEvidence": null,
    "smiles": "BrBr",
    "prompt": "Draw any valid neutral isomer with this molecular formula, as one connected molecule. Show outer-shell electrons only. Each shared pair needs one dot and one cross; use one symbol for the non-bonding electrons on each atom. Inner shells and molecular shape are not assessed.",
    "explanation": "Shared pairs contain one electron from each atom. Hydrogen has two electrons around it; shared and non-bonding electrons give every other atom eight. Bonds: 1 × Br–Br (1 shared pair). Non-bonding inventory: 2 × Br: 6 non-bonding electrons.",
    "sourceRefs": [
      "Edexcel International GCSE Chemistry specification Issue 3 (September 2024), sections 1.40 and 1.46; accessed 2026-09-12",
      "https://qualifications.pearson.com/content/dam/pdf/International%20GCSE/Chemistry/2017/specification-and-sample-assessments/international-gcse-chemistry-2017-specification.pdf"
    ],
    "reference": {
      "atoms": [
        {
          "id": "Br1",
          "element": "Br",
          "x": 448,
          "y": 325
        },
        {
          "id": "Br2",
          "element": "Br",
          "x": 552,
          "y": 325
        }
      ],
      "electrons": [
        {
          "id": "e159",
          "symbol": "dot",
          "anchor": {
            "kind": "bond",
            "a": "Br1",
            "b": "Br2",
            "slot": 0
          }
        },
        {
          "id": "e160",
          "symbol": "cross",
          "anchor": {
            "kind": "bond",
            "a": "Br1",
            "b": "Br2",
            "slot": 1
          }
        },
        {
          "id": "e161",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "Br1",
            "slot": 0
          }
        },
        {
          "id": "e162",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "Br1",
            "slot": 1
          }
        },
        {
          "id": "e163",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "Br1",
            "slot": 2
          }
        },
        {
          "id": "e164",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "Br1",
            "slot": 3
          }
        },
        {
          "id": "e165",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "Br1",
            "slot": 4
          }
        },
        {
          "id": "e166",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "Br1",
            "slot": 5
          }
        },
        {
          "id": "e167",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "Br2",
            "slot": 0
          }
        },
        {
          "id": "e168",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "Br2",
            "slot": 1
          }
        },
        {
          "id": "e169",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "Br2",
            "slot": 2
          }
        },
        {
          "id": "e170",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "Br2",
            "slot": 3
          }
        },
        {
          "id": "e171",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "Br2",
            "slot": 4
          }
        },
        {
          "id": "e172",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "Br2",
            "slot": 5
          }
        }
      ],
      "groups": []
    },
    "viewBox": {
      "width": 1000,
      "height": 650,
      "atomRadius": 64,
      "hydrogenRadius": 40,
      "bondLength": 104,
      "shellOverlap": 24
    },
    "electronSlots": {
      "atom": {
        "directions": [
          -100,
          -80,
          -10,
          10,
          80,
          100,
          170,
          190
        ],
        "radius": 64,
        "hydrogenRadius": 40
      },
      "bond": {
        "maxPairs": 3,
        "centredInOverlap": true,
        "perpendicularOffsets": [
          -5,
          5
        ],
        "pairSpacing": 22
      }
    },
    "marking": {
      "cationShells": "empty-or-retained-full-shell",
      "geometryChecked": false,
      "speciesSpecific": false
    },
    "prerequisiteOrder": 14
  },
  {
    "id": "i2",
    "name": "Iodine",
    "formula": "I2",
    "displayFormula": "I2",
    "totalCharge": 0,
    "namedSpecies": false,
    "category": "covalent",
    "practiceCategory": "covalent",
    "extension": false,
    "grades": [
      1
    ],
    "scope": "specification",
    "atlasEvidence": null,
    "smiles": "II",
    "prompt": "Draw any valid neutral isomer with this molecular formula, as one connected molecule. Show outer-shell electrons only. Each shared pair needs one dot and one cross; use one symbol for the non-bonding electrons on each atom. Inner shells and molecular shape are not assessed.",
    "explanation": "Shared pairs contain one electron from each atom. Hydrogen has two electrons around it; shared and non-bonding electrons give every other atom eight. Bonds: 1 × I–I (1 shared pair). Non-bonding inventory: 2 × I: 6 non-bonding electrons.",
    "sourceRefs": [
      "Edexcel International GCSE Chemistry specification Issue 3 (September 2024), sections 1.40 and 1.46; accessed 2026-09-12",
      "https://qualifications.pearson.com/content/dam/pdf/International%20GCSE/Chemistry/2017/specification-and-sample-assessments/international-gcse-chemistry-2017-specification.pdf"
    ],
    "reference": {
      "atoms": [
        {
          "id": "I1",
          "element": "I",
          "x": 448,
          "y": 325
        },
        {
          "id": "I2",
          "element": "I",
          "x": 552,
          "y": 325
        }
      ],
      "electrons": [
        {
          "id": "e173",
          "symbol": "dot",
          "anchor": {
            "kind": "bond",
            "a": "I1",
            "b": "I2",
            "slot": 0
          }
        },
        {
          "id": "e174",
          "symbol": "cross",
          "anchor": {
            "kind": "bond",
            "a": "I1",
            "b": "I2",
            "slot": 1
          }
        },
        {
          "id": "e175",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "I1",
            "slot": 0
          }
        },
        {
          "id": "e176",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "I1",
            "slot": 1
          }
        },
        {
          "id": "e177",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "I1",
            "slot": 2
          }
        },
        {
          "id": "e178",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "I1",
            "slot": 3
          }
        },
        {
          "id": "e179",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "I1",
            "slot": 4
          }
        },
        {
          "id": "e180",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "I1",
            "slot": 5
          }
        },
        {
          "id": "e181",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "I2",
            "slot": 0
          }
        },
        {
          "id": "e182",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "I2",
            "slot": 1
          }
        },
        {
          "id": "e183",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "I2",
            "slot": 2
          }
        },
        {
          "id": "e184",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "I2",
            "slot": 3
          }
        },
        {
          "id": "e185",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "I2",
            "slot": 4
          }
        },
        {
          "id": "e186",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "I2",
            "slot": 5
          }
        }
      ],
      "groups": []
    },
    "viewBox": {
      "width": 1000,
      "height": 650,
      "atomRadius": 64,
      "hydrogenRadius": 40,
      "bondLength": 104,
      "shellOverlap": 24
    },
    "electronSlots": {
      "atom": {
        "directions": [
          -100,
          -80,
          -10,
          10,
          80,
          100,
          170,
          190
        ],
        "radius": 64,
        "hydrogenRadius": 40
      },
      "bond": {
        "maxPairs": 3,
        "centredInOverlap": true,
        "perpendicularOffsets": [
          -5,
          5
        ],
        "pairSpacing": 22
      }
    },
    "marking": {
      "cationShells": "empty-or-retained-full-shell",
      "geometryChecked": false,
      "speciesSpecific": false
    },
    "prerequisiteOrder": 15
  },
  {
    "id": "hf",
    "name": "Hydrogen fluoride",
    "formula": "HF",
    "displayFormula": "HF",
    "totalCharge": 0,
    "namedSpecies": false,
    "category": "covalent",
    "practiceCategory": "covalent",
    "extension": false,
    "grades": [
      1
    ],
    "scope": "specification",
    "atlasEvidence": null,
    "smiles": "[H]F",
    "prompt": "Draw any valid neutral isomer with this molecular formula, as one connected molecule. Show outer-shell electrons only. Each shared pair needs one dot and one cross; use one symbol for the non-bonding electrons on each atom. Inner shells and molecular shape are not assessed.",
    "explanation": "Shared pairs contain one electron from each atom. Hydrogen has two electrons around it; shared and non-bonding electrons give every other atom eight. Bonds: 1 × F–H (1 shared pair). Non-bonding inventory: 1 × F: 6 non-bonding electrons.",
    "sourceRefs": [
      "Edexcel International GCSE Chemistry specification Issue 3 (September 2024), sections 1.40 and 1.46; accessed 2026-09-12",
      "https://qualifications.pearson.com/content/dam/pdf/International%20GCSE/Chemistry/2017/specification-and-sample-assessments/international-gcse-chemistry-2017-specification.pdf"
    ],
    "reference": {
      "atoms": [
        {
          "id": "H1",
          "element": "H",
          "x": 472,
          "y": 325
        },
        {
          "id": "F1",
          "element": "F",
          "x": 552,
          "y": 325
        }
      ],
      "electrons": [
        {
          "id": "e187",
          "symbol": "dot",
          "anchor": {
            "kind": "bond",
            "a": "H1",
            "b": "F1",
            "slot": 0
          }
        },
        {
          "id": "e188",
          "symbol": "cross",
          "anchor": {
            "kind": "bond",
            "a": "H1",
            "b": "F1",
            "slot": 1
          }
        },
        {
          "id": "e189",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "F1",
            "slot": 0
          }
        },
        {
          "id": "e190",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "F1",
            "slot": 1
          }
        },
        {
          "id": "e191",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "F1",
            "slot": 2
          }
        },
        {
          "id": "e192",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "F1",
            "slot": 3
          }
        },
        {
          "id": "e193",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "F1",
            "slot": 4
          }
        },
        {
          "id": "e194",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "F1",
            "slot": 5
          }
        }
      ],
      "groups": []
    },
    "viewBox": {
      "width": 1000,
      "height": 650,
      "atomRadius": 64,
      "hydrogenRadius": 40,
      "bondLength": 104,
      "shellOverlap": 24
    },
    "electronSlots": {
      "atom": {
        "directions": [
          -100,
          -80,
          -10,
          10,
          80,
          100,
          170,
          190
        ],
        "radius": 64,
        "hydrogenRadius": 40
      },
      "bond": {
        "maxPairs": 3,
        "centredInOverlap": true,
        "perpendicularOffsets": [
          -5,
          5
        ],
        "pairSpacing": 22
      }
    },
    "marking": {
      "cationShells": "empty-or-retained-full-shell",
      "geometryChecked": false,
      "speciesSpecific": false
    },
    "prerequisiteOrder": 16
  },
  {
    "id": "hbr",
    "name": "Hydrogen bromide",
    "formula": "HBr",
    "displayFormula": "HBr",
    "totalCharge": 0,
    "namedSpecies": false,
    "category": "covalent",
    "practiceCategory": "covalent",
    "extension": false,
    "grades": [
      1
    ],
    "scope": "specification",
    "atlasEvidence": null,
    "smiles": "[H]Br",
    "prompt": "Draw any valid neutral isomer with this molecular formula, as one connected molecule. Show outer-shell electrons only. Each shared pair needs one dot and one cross; use one symbol for the non-bonding electrons on each atom. Inner shells and molecular shape are not assessed.",
    "explanation": "Shared pairs contain one electron from each atom. Hydrogen has two electrons around it; shared and non-bonding electrons give every other atom eight. Bonds: 1 × Br–H (1 shared pair). Non-bonding inventory: 1 × Br: 6 non-bonding electrons.",
    "sourceRefs": [
      "Edexcel International GCSE Chemistry specification Issue 3 (September 2024), sections 1.40 and 1.46; accessed 2026-09-12",
      "https://qualifications.pearson.com/content/dam/pdf/International%20GCSE/Chemistry/2017/specification-and-sample-assessments/international-gcse-chemistry-2017-specification.pdf"
    ],
    "reference": {
      "atoms": [
        {
          "id": "H1",
          "element": "H",
          "x": 472,
          "y": 325
        },
        {
          "id": "Br1",
          "element": "Br",
          "x": 552,
          "y": 325
        }
      ],
      "electrons": [
        {
          "id": "e195",
          "symbol": "dot",
          "anchor": {
            "kind": "bond",
            "a": "H1",
            "b": "Br1",
            "slot": 0
          }
        },
        {
          "id": "e196",
          "symbol": "cross",
          "anchor": {
            "kind": "bond",
            "a": "H1",
            "b": "Br1",
            "slot": 1
          }
        },
        {
          "id": "e197",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "Br1",
            "slot": 0
          }
        },
        {
          "id": "e198",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "Br1",
            "slot": 1
          }
        },
        {
          "id": "e199",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "Br1",
            "slot": 2
          }
        },
        {
          "id": "e200",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "Br1",
            "slot": 3
          }
        },
        {
          "id": "e201",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "Br1",
            "slot": 4
          }
        },
        {
          "id": "e202",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "Br1",
            "slot": 5
          }
        }
      ],
      "groups": []
    },
    "viewBox": {
      "width": 1000,
      "height": 650,
      "atomRadius": 64,
      "hydrogenRadius": 40,
      "bondLength": 104,
      "shellOverlap": 24
    },
    "electronSlots": {
      "atom": {
        "directions": [
          -100,
          -80,
          -10,
          10,
          80,
          100,
          170,
          190
        ],
        "radius": 64,
        "hydrogenRadius": 40
      },
      "bond": {
        "maxPairs": 3,
        "centredInOverlap": true,
        "perpendicularOffsets": [
          -5,
          5
        ],
        "pairSpacing": 22
      }
    },
    "marking": {
      "cationShells": "empty-or-retained-full-shell",
      "geometryChecked": false,
      "speciesSpecific": false
    },
    "prerequisiteOrder": 17
  },
  {
    "id": "hi",
    "name": "Hydrogen iodide",
    "formula": "HI",
    "displayFormula": "HI",
    "totalCharge": 0,
    "namedSpecies": false,
    "category": "covalent",
    "practiceCategory": "covalent",
    "extension": false,
    "grades": [
      1
    ],
    "scope": "specification",
    "atlasEvidence": null,
    "smiles": "[H]I",
    "prompt": "Draw any valid neutral isomer with this molecular formula, as one connected molecule. Show outer-shell electrons only. Each shared pair needs one dot and one cross; use one symbol for the non-bonding electrons on each atom. Inner shells and molecular shape are not assessed.",
    "explanation": "Shared pairs contain one electron from each atom. Hydrogen has two electrons around it; shared and non-bonding electrons give every other atom eight. Bonds: 1 × H–I (1 shared pair). Non-bonding inventory: 1 × I: 6 non-bonding electrons.",
    "sourceRefs": [
      "Edexcel International GCSE Chemistry specification Issue 3 (September 2024), sections 1.40 and 1.46; accessed 2026-09-12",
      "https://qualifications.pearson.com/content/dam/pdf/International%20GCSE/Chemistry/2017/specification-and-sample-assessments/international-gcse-chemistry-2017-specification.pdf"
    ],
    "reference": {
      "atoms": [
        {
          "id": "H1",
          "element": "H",
          "x": 472,
          "y": 325
        },
        {
          "id": "I1",
          "element": "I",
          "x": 552,
          "y": 325
        }
      ],
      "electrons": [
        {
          "id": "e203",
          "symbol": "dot",
          "anchor": {
            "kind": "bond",
            "a": "H1",
            "b": "I1",
            "slot": 0
          }
        },
        {
          "id": "e204",
          "symbol": "cross",
          "anchor": {
            "kind": "bond",
            "a": "H1",
            "b": "I1",
            "slot": 1
          }
        },
        {
          "id": "e205",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "I1",
            "slot": 0
          }
        },
        {
          "id": "e206",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "I1",
            "slot": 1
          }
        },
        {
          "id": "e207",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "I1",
            "slot": 2
          }
        },
        {
          "id": "e208",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "I1",
            "slot": 3
          }
        },
        {
          "id": "e209",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "I1",
            "slot": 4
          }
        },
        {
          "id": "e210",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "I1",
            "slot": 5
          }
        }
      ],
      "groups": []
    },
    "viewBox": {
      "width": 1000,
      "height": 650,
      "atomRadius": 64,
      "hydrogenRadius": 40,
      "bondLength": 104,
      "shellOverlap": 24
    },
    "electronSlots": {
      "atom": {
        "directions": [
          -100,
          -80,
          -10,
          10,
          80,
          100,
          170,
          190
        ],
        "radius": 64,
        "hydrogenRadius": 40
      },
      "bond": {
        "maxPairs": 3,
        "centredInOverlap": true,
        "perpendicularOffsets": [
          -5,
          5
        ],
        "pairSpacing": 22
      }
    },
    "marking": {
      "cationShells": "empty-or-retained-full-shell",
      "geometryChecked": false,
      "speciesSpecific": false
    },
    "prerequisiteOrder": 18
  },
  {
    "id": "h2s",
    "name": "Hydrogen sulfide",
    "formula": "H2S",
    "displayFormula": "H2S",
    "totalCharge": 0,
    "namedSpecies": false,
    "category": "covalent",
    "practiceCategory": "covalent",
    "extension": false,
    "grades": [
      2
    ],
    "scope": "specification",
    "atlasEvidence": null,
    "smiles": "S",
    "prompt": "Draw any valid neutral isomer with this molecular formula, as one connected molecule. Show outer-shell electrons only. Each shared pair needs one dot and one cross; use one symbol for the non-bonding electrons on each atom. Inner shells and molecular shape are not assessed.",
    "explanation": "Shared pairs contain one electron from each atom. Hydrogen has two electrons around it; shared and non-bonding electrons give every other atom eight. Bonds: 2 × H–S (1 shared pair). Non-bonding inventory: 1 × S: 4 non-bonding electrons.",
    "sourceRefs": [
      "Edexcel International GCSE Chemistry specification Issue 3 (September 2024), sections 1.40 and 1.46; accessed 2026-09-12",
      "https://qualifications.pearson.com/content/dam/pdf/International%20GCSE/Chemistry/2017/specification-and-sample-assessments/international-gcse-chemistry-2017-specification.pdf"
    ],
    "reference": {
      "atoms": [
        {
          "id": "S1",
          "element": "S",
          "x": 500,
          "y": 325
        },
        {
          "id": "H1",
          "element": "H",
          "x": 420,
          "y": 325
        },
        {
          "id": "H2",
          "element": "H",
          "x": 580,
          "y": 325
        }
      ],
      "electrons": [
        {
          "id": "e211",
          "symbol": "dot",
          "anchor": {
            "kind": "bond",
            "a": "S1",
            "b": "H1",
            "slot": 0
          }
        },
        {
          "id": "e212",
          "symbol": "cross",
          "anchor": {
            "kind": "bond",
            "a": "S1",
            "b": "H1",
            "slot": 1
          }
        },
        {
          "id": "e213",
          "symbol": "dot",
          "anchor": {
            "kind": "bond",
            "a": "S1",
            "b": "H2",
            "slot": 0
          }
        },
        {
          "id": "e214",
          "symbol": "cross",
          "anchor": {
            "kind": "bond",
            "a": "S1",
            "b": "H2",
            "slot": 1
          }
        },
        {
          "id": "e215",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "S1",
            "slot": 0
          }
        },
        {
          "id": "e216",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "S1",
            "slot": 1
          }
        },
        {
          "id": "e217",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "S1",
            "slot": 4
          }
        },
        {
          "id": "e218",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "S1",
            "slot": 5
          }
        }
      ],
      "groups": []
    },
    "viewBox": {
      "width": 1000,
      "height": 650,
      "atomRadius": 64,
      "hydrogenRadius": 40,
      "bondLength": 104,
      "shellOverlap": 24
    },
    "electronSlots": {
      "atom": {
        "directions": [
          -100,
          -80,
          -10,
          10,
          80,
          100,
          170,
          190
        ],
        "radius": 64,
        "hydrogenRadius": 40
      },
      "bond": {
        "maxPairs": 3,
        "centredInOverlap": true,
        "perpendicularOffsets": [
          -5,
          5
        ],
        "pairSpacing": 22
      }
    },
    "marking": {
      "cationShells": "empty-or-retained-full-shell",
      "geometryChecked": false,
      "speciesSpecific": false
    },
    "prerequisiteOrder": 19
  },
  {
    "id": "h2o2",
    "name": "Hydrogen peroxide",
    "formula": "H2O2",
    "displayFormula": "H2O2",
    "totalCharge": 0,
    "namedSpecies": false,
    "category": "covalent",
    "practiceCategory": "covalent",
    "extension": false,
    "grades": [
      2
    ],
    "scope": "specification",
    "atlasEvidence": [
      {
        "questionId": "2023-nov-1-q6b",
        "observedBand": "7-8",
        "basis": "resources/past-paper-atlas/data/atlas.json classification.band",
        "relationship": "diagram motif; original practice prompt"
      }
    ],
    "smiles": "OO",
    "prompt": "Draw any valid neutral isomer with this molecular formula, as one connected molecule. Show outer-shell electrons only. Each shared pair needs one dot and one cross; use one symbol for the non-bonding electrons on each atom. Inner shells and molecular shape are not assessed.",
    "explanation": "Shared pairs contain one electron from each atom. Hydrogen has two electrons around it; shared and non-bonding electrons give every other atom eight. Bonds: 1 × O–O (1 shared pair); 2 × H–O (1 shared pair). Non-bonding inventory: 2 × O: 4 non-bonding electrons.",
    "sourceRefs": [
      "Edexcel International GCSE Chemistry specification Issue 3 (September 2024), sections 1.40 and 1.46; accessed 2026-09-12",
      "https://qualifications.pearson.com/content/dam/pdf/International%20GCSE/Chemistry/2017/specification-and-sample-assessments/international-gcse-chemistry-2017-specification.pdf",
      "resources/past-paper-atlas/data/atlas.json#2023-nov-1-q6b"
    ],
    "reference": {
      "atoms": [
        {
          "id": "O1",
          "element": "O",
          "x": 448,
          "y": 325
        },
        {
          "id": "O2",
          "element": "O",
          "x": 552,
          "y": 325
        },
        {
          "id": "H1",
          "element": "H",
          "x": 368,
          "y": 325
        },
        {
          "id": "H2",
          "element": "H",
          "x": 632,
          "y": 325
        }
      ],
      "electrons": [
        {
          "id": "e219",
          "symbol": "dot",
          "anchor": {
            "kind": "bond",
            "a": "O1",
            "b": "O2",
            "slot": 0
          }
        },
        {
          "id": "e220",
          "symbol": "cross",
          "anchor": {
            "kind": "bond",
            "a": "O1",
            "b": "O2",
            "slot": 1
          }
        },
        {
          "id": "e221",
          "symbol": "dot",
          "anchor": {
            "kind": "bond",
            "a": "O1",
            "b": "H1",
            "slot": 0
          }
        },
        {
          "id": "e222",
          "symbol": "cross",
          "anchor": {
            "kind": "bond",
            "a": "O1",
            "b": "H1",
            "slot": 1
          }
        },
        {
          "id": "e223",
          "symbol": "dot",
          "anchor": {
            "kind": "bond",
            "a": "O2",
            "b": "H2",
            "slot": 0
          }
        },
        {
          "id": "e224",
          "symbol": "cross",
          "anchor": {
            "kind": "bond",
            "a": "O2",
            "b": "H2",
            "slot": 1
          }
        },
        {
          "id": "e225",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "O1",
            "slot": 0
          }
        },
        {
          "id": "e226",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "O1",
            "slot": 1
          }
        },
        {
          "id": "e227",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "O1",
            "slot": 2
          }
        },
        {
          "id": "e228",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "O1",
            "slot": 3
          }
        },
        {
          "id": "e229",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "O2",
            "slot": 0
          }
        },
        {
          "id": "e230",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "O2",
            "slot": 1
          }
        },
        {
          "id": "e231",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "O2",
            "slot": 2
          }
        },
        {
          "id": "e232",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "O2",
            "slot": 3
          }
        }
      ],
      "groups": []
    },
    "viewBox": {
      "width": 1000,
      "height": 650,
      "atomRadius": 64,
      "hydrogenRadius": 40,
      "bondLength": 104,
      "shellOverlap": 24
    },
    "electronSlots": {
      "atom": {
        "directions": [
          -100,
          -80,
          -10,
          10,
          80,
          100,
          170,
          190
        ],
        "radius": 64,
        "hydrogenRadius": 40
      },
      "bond": {
        "maxPairs": 3,
        "centredInOverlap": true,
        "perpendicularOffsets": [
          -5,
          5
        ],
        "pairSpacing": 22
      }
    },
    "marking": {
      "cationShells": "empty-or-retained-full-shell",
      "geometryChecked": false,
      "speciesSpecific": false
    },
    "prerequisiteOrder": 20
  },
  {
    "id": "n2h4",
    "name": "Hydrazine",
    "formula": "N2H4",
    "displayFormula": "N2H4",
    "totalCharge": 0,
    "namedSpecies": false,
    "category": "covalent",
    "practiceCategory": "covalent",
    "extension": false,
    "grades": [
      2
    ],
    "scope": "specification",
    "atlasEvidence": [
      {
        "questionId": "2023-jan-2-q7a",
        "observedBand": "7-8",
        "basis": "resources/past-paper-atlas/data/atlas.json classification.band",
        "relationship": "diagram motif; original practice prompt"
      }
    ],
    "smiles": "NN",
    "prompt": "Draw any valid neutral isomer with this molecular formula, as one connected molecule. Show outer-shell electrons only. Each shared pair needs one dot and one cross; use one symbol for the non-bonding electrons on each atom. Inner shells and molecular shape are not assessed.",
    "explanation": "Shared pairs contain one electron from each atom. Hydrogen has two electrons around it; shared and non-bonding electrons give every other atom eight. Bonds: 1 × N–N (1 shared pair); 4 × H–N (1 shared pair). Non-bonding inventory: 2 × N: 2 non-bonding electrons.",
    "sourceRefs": [
      "Edexcel International GCSE Chemistry specification Issue 3 (September 2024), sections 1.40 and 1.46; accessed 2026-09-12",
      "https://qualifications.pearson.com/content/dam/pdf/International%20GCSE/Chemistry/2017/specification-and-sample-assessments/international-gcse-chemistry-2017-specification.pdf",
      "resources/past-paper-atlas/data/atlas.json#2023-jan-2-q7a"
    ],
    "reference": {
      "atoms": [
        {
          "id": "N1",
          "element": "N",
          "x": 448,
          "y": 325
        },
        {
          "id": "N2",
          "element": "N",
          "x": 552,
          "y": 325
        },
        {
          "id": "H1",
          "element": "H",
          "x": 378.70515311611194,
          "y": 285.02220372083383
        },
        {
          "id": "H2",
          "element": "H",
          "x": 378.70515311611194,
          "y": 364.97779627916617
        },
        {
          "id": "H3",
          "element": "H",
          "x": 621.294846883888,
          "y": 285.02220372083383
        },
        {
          "id": "H4",
          "element": "H",
          "x": 621.294846883888,
          "y": 364.97779627916617
        }
      ],
      "electrons": [
        {
          "id": "e233",
          "symbol": "dot",
          "anchor": {
            "kind": "bond",
            "a": "N1",
            "b": "N2",
            "slot": 0
          }
        },
        {
          "id": "e234",
          "symbol": "cross",
          "anchor": {
            "kind": "bond",
            "a": "N1",
            "b": "N2",
            "slot": 1
          }
        },
        {
          "id": "e235",
          "symbol": "dot",
          "anchor": {
            "kind": "bond",
            "a": "N1",
            "b": "H1",
            "slot": 0
          }
        },
        {
          "id": "e236",
          "symbol": "cross",
          "anchor": {
            "kind": "bond",
            "a": "N1",
            "b": "H1",
            "slot": 1
          }
        },
        {
          "id": "e237",
          "symbol": "dot",
          "anchor": {
            "kind": "bond",
            "a": "N1",
            "b": "H2",
            "slot": 0
          }
        },
        {
          "id": "e238",
          "symbol": "cross",
          "anchor": {
            "kind": "bond",
            "a": "N1",
            "b": "H2",
            "slot": 1
          }
        },
        {
          "id": "e239",
          "symbol": "dot",
          "anchor": {
            "kind": "bond",
            "a": "N2",
            "b": "H3",
            "slot": 0
          }
        },
        {
          "id": "e240",
          "symbol": "cross",
          "anchor": {
            "kind": "bond",
            "a": "N2",
            "b": "H3",
            "slot": 1
          }
        },
        {
          "id": "e241",
          "symbol": "dot",
          "anchor": {
            "kind": "bond",
            "a": "N2",
            "b": "H4",
            "slot": 0
          }
        },
        {
          "id": "e242",
          "symbol": "cross",
          "anchor": {
            "kind": "bond",
            "a": "N2",
            "b": "H4",
            "slot": 1
          }
        },
        {
          "id": "e243",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "N1",
            "slot": 0
          }
        },
        {
          "id": "e244",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "N1",
            "slot": 1
          }
        },
        {
          "id": "e245",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "N2",
            "slot": 0
          }
        },
        {
          "id": "e246",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "N2",
            "slot": 1
          }
        }
      ],
      "groups": []
    },
    "viewBox": {
      "width": 1000,
      "height": 650,
      "atomRadius": 64,
      "hydrogenRadius": 40,
      "bondLength": 104,
      "shellOverlap": 24
    },
    "electronSlots": {
      "atom": {
        "directions": [
          -100,
          -80,
          -10,
          10,
          80,
          100,
          170,
          190
        ],
        "radius": 64,
        "hydrogenRadius": 40
      },
      "bond": {
        "maxPairs": 3,
        "centredInOverlap": true,
        "perpendicularOffsets": [
          -5,
          5
        ],
        "pairSpacing": 22
      }
    },
    "marking": {
      "cationShells": "empty-or-retained-full-shell",
      "geometryChecked": false,
      "speciesSpecific": false
    },
    "prerequisiteOrder": 21
  },
  {
    "id": "c2h5cl",
    "name": "Chloroethane",
    "formula": "C2H5Cl",
    "displayFormula": "C2H5Cl",
    "totalCharge": 0,
    "namedSpecies": false,
    "category": "covalent",
    "practiceCategory": "covalent",
    "extension": false,
    "grades": [
      3
    ],
    "scope": "specification",
    "atlasEvidence": null,
    "smiles": "CCCl",
    "prompt": "Draw any valid neutral isomer with this molecular formula, as one connected molecule. Show outer-shell electrons only. Each shared pair needs one dot and one cross; use one symbol for the non-bonding electrons on each atom. Inner shells and molecular shape are not assessed.",
    "explanation": "Shared pairs contain one electron from each atom. Hydrogen has two electrons around it; shared and non-bonding electrons give every other atom eight. Bonds: 1 × C–C (1 shared pair); 1 × C–Cl (1 shared pair); 5 × C–H (1 shared pair). Non-bonding inventory: 1 × Cl: 6 non-bonding electrons.",
    "sourceRefs": [
      "Edexcel International GCSE Chemistry specification Issue 3 (September 2024), sections 1.40 and 1.46; accessed 2026-09-12",
      "https://qualifications.pearson.com/content/dam/pdf/International%20GCSE/Chemistry/2017/specification-and-sample-assessments/international-gcse-chemistry-2017-specification.pdf"
    ],
    "reference": {
      "atoms": [
        {
          "id": "C1",
          "element": "C",
          "x": 400,
          "y": 325
        },
        {
          "id": "C2",
          "element": "C",
          "x": 504,
          "y": 325
        },
        {
          "id": "Cl1",
          "element": "Cl",
          "x": 608,
          "y": 325
        },
        {
          "id": "H1",
          "element": "H",
          "x": 320,
          "y": 325
        },
        {
          "id": "H2",
          "element": "H",
          "x": 400,
          "y": 405
        },
        {
          "id": "H3",
          "element": "H",
          "x": 400,
          "y": 245
        },
        {
          "id": "H4",
          "element": "H",
          "x": 504,
          "y": 245
        },
        {
          "id": "H5",
          "element": "H",
          "x": 504,
          "y": 405
        }
      ],
      "electrons": [
        {
          "id": "e247",
          "symbol": "dot",
          "anchor": {
            "kind": "bond",
            "a": "C1",
            "b": "C2",
            "slot": 0
          }
        },
        {
          "id": "e248",
          "symbol": "cross",
          "anchor": {
            "kind": "bond",
            "a": "C1",
            "b": "C2",
            "slot": 1
          }
        },
        {
          "id": "e249",
          "symbol": "dot",
          "anchor": {
            "kind": "bond",
            "a": "C2",
            "b": "Cl1",
            "slot": 0
          }
        },
        {
          "id": "e250",
          "symbol": "cross",
          "anchor": {
            "kind": "bond",
            "a": "C2",
            "b": "Cl1",
            "slot": 1
          }
        },
        {
          "id": "e251",
          "symbol": "dot",
          "anchor": {
            "kind": "bond",
            "a": "C1",
            "b": "H1",
            "slot": 0
          }
        },
        {
          "id": "e252",
          "symbol": "cross",
          "anchor": {
            "kind": "bond",
            "a": "C1",
            "b": "H1",
            "slot": 1
          }
        },
        {
          "id": "e253",
          "symbol": "dot",
          "anchor": {
            "kind": "bond",
            "a": "C1",
            "b": "H2",
            "slot": 0
          }
        },
        {
          "id": "e254",
          "symbol": "cross",
          "anchor": {
            "kind": "bond",
            "a": "C1",
            "b": "H2",
            "slot": 1
          }
        },
        {
          "id": "e255",
          "symbol": "dot",
          "anchor": {
            "kind": "bond",
            "a": "C1",
            "b": "H3",
            "slot": 0
          }
        },
        {
          "id": "e256",
          "symbol": "cross",
          "anchor": {
            "kind": "bond",
            "a": "C1",
            "b": "H3",
            "slot": 1
          }
        },
        {
          "id": "e257",
          "symbol": "dot",
          "anchor": {
            "kind": "bond",
            "a": "C2",
            "b": "H4",
            "slot": 0
          }
        },
        {
          "id": "e258",
          "symbol": "cross",
          "anchor": {
            "kind": "bond",
            "a": "C2",
            "b": "H4",
            "slot": 1
          }
        },
        {
          "id": "e259",
          "symbol": "dot",
          "anchor": {
            "kind": "bond",
            "a": "C2",
            "b": "H5",
            "slot": 0
          }
        },
        {
          "id": "e260",
          "symbol": "cross",
          "anchor": {
            "kind": "bond",
            "a": "C2",
            "b": "H5",
            "slot": 1
          }
        },
        {
          "id": "e261",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "Cl1",
            "slot": 0
          }
        },
        {
          "id": "e262",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "Cl1",
            "slot": 1
          }
        },
        {
          "id": "e263",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "Cl1",
            "slot": 2
          }
        },
        {
          "id": "e264",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "Cl1",
            "slot": 3
          }
        },
        {
          "id": "e265",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "Cl1",
            "slot": 4
          }
        },
        {
          "id": "e266",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "Cl1",
            "slot": 5
          }
        }
      ],
      "groups": []
    },
    "viewBox": {
      "width": 1000,
      "height": 650,
      "atomRadius": 64,
      "hydrogenRadius": 40,
      "bondLength": 104,
      "shellOverlap": 24
    },
    "electronSlots": {
      "atom": {
        "directions": [
          -100,
          -80,
          -10,
          10,
          80,
          100,
          170,
          190
        ],
        "radius": 64,
        "hydrogenRadius": 40
      },
      "bond": {
        "maxPairs": 3,
        "centredInOverlap": true,
        "perpendicularOffsets": [
          -5,
          5
        ],
        "pairSpacing": 22
      }
    },
    "marking": {
      "cationShells": "empty-or-retained-full-shell",
      "geometryChecked": false,
      "speciesSpecific": false
    },
    "prerequisiteOrder": 22
  },
  {
    "id": "c2h5br",
    "name": "Bromoethane",
    "formula": "C2H5Br",
    "displayFormula": "C2H5Br",
    "totalCharge": 0,
    "namedSpecies": false,
    "category": "covalent",
    "practiceCategory": "covalent",
    "extension": false,
    "grades": [
      3
    ],
    "scope": "specification",
    "atlasEvidence": null,
    "smiles": "CCBr",
    "prompt": "Draw any valid neutral isomer with this molecular formula, as one connected molecule. Show outer-shell electrons only. Each shared pair needs one dot and one cross; use one symbol for the non-bonding electrons on each atom. Inner shells and molecular shape are not assessed.",
    "explanation": "Shared pairs contain one electron from each atom. Hydrogen has two electrons around it; shared and non-bonding electrons give every other atom eight. Bonds: 1 × C–C (1 shared pair); 1 × Br–C (1 shared pair); 5 × C–H (1 shared pair). Non-bonding inventory: 1 × Br: 6 non-bonding electrons.",
    "sourceRefs": [
      "Edexcel International GCSE Chemistry specification Issue 3 (September 2024), sections 1.40 and 1.46; accessed 2026-09-12",
      "https://qualifications.pearson.com/content/dam/pdf/International%20GCSE/Chemistry/2017/specification-and-sample-assessments/international-gcse-chemistry-2017-specification.pdf"
    ],
    "reference": {
      "atoms": [
        {
          "id": "C1",
          "element": "C",
          "x": 400,
          "y": 325
        },
        {
          "id": "C2",
          "element": "C",
          "x": 504,
          "y": 325
        },
        {
          "id": "Br1",
          "element": "Br",
          "x": 608,
          "y": 325
        },
        {
          "id": "H1",
          "element": "H",
          "x": 320,
          "y": 325
        },
        {
          "id": "H2",
          "element": "H",
          "x": 400,
          "y": 405
        },
        {
          "id": "H3",
          "element": "H",
          "x": 400,
          "y": 245
        },
        {
          "id": "H4",
          "element": "H",
          "x": 504,
          "y": 245
        },
        {
          "id": "H5",
          "element": "H",
          "x": 504,
          "y": 405
        }
      ],
      "electrons": [
        {
          "id": "e267",
          "symbol": "dot",
          "anchor": {
            "kind": "bond",
            "a": "C1",
            "b": "C2",
            "slot": 0
          }
        },
        {
          "id": "e268",
          "symbol": "cross",
          "anchor": {
            "kind": "bond",
            "a": "C1",
            "b": "C2",
            "slot": 1
          }
        },
        {
          "id": "e269",
          "symbol": "dot",
          "anchor": {
            "kind": "bond",
            "a": "C2",
            "b": "Br1",
            "slot": 0
          }
        },
        {
          "id": "e270",
          "symbol": "cross",
          "anchor": {
            "kind": "bond",
            "a": "C2",
            "b": "Br1",
            "slot": 1
          }
        },
        {
          "id": "e271",
          "symbol": "dot",
          "anchor": {
            "kind": "bond",
            "a": "C1",
            "b": "H1",
            "slot": 0
          }
        },
        {
          "id": "e272",
          "symbol": "cross",
          "anchor": {
            "kind": "bond",
            "a": "C1",
            "b": "H1",
            "slot": 1
          }
        },
        {
          "id": "e273",
          "symbol": "dot",
          "anchor": {
            "kind": "bond",
            "a": "C1",
            "b": "H2",
            "slot": 0
          }
        },
        {
          "id": "e274",
          "symbol": "cross",
          "anchor": {
            "kind": "bond",
            "a": "C1",
            "b": "H2",
            "slot": 1
          }
        },
        {
          "id": "e275",
          "symbol": "dot",
          "anchor": {
            "kind": "bond",
            "a": "C1",
            "b": "H3",
            "slot": 0
          }
        },
        {
          "id": "e276",
          "symbol": "cross",
          "anchor": {
            "kind": "bond",
            "a": "C1",
            "b": "H3",
            "slot": 1
          }
        },
        {
          "id": "e277",
          "symbol": "dot",
          "anchor": {
            "kind": "bond",
            "a": "C2",
            "b": "H4",
            "slot": 0
          }
        },
        {
          "id": "e278",
          "symbol": "cross",
          "anchor": {
            "kind": "bond",
            "a": "C2",
            "b": "H4",
            "slot": 1
          }
        },
        {
          "id": "e279",
          "symbol": "dot",
          "anchor": {
            "kind": "bond",
            "a": "C2",
            "b": "H5",
            "slot": 0
          }
        },
        {
          "id": "e280",
          "symbol": "cross",
          "anchor": {
            "kind": "bond",
            "a": "C2",
            "b": "H5",
            "slot": 1
          }
        },
        {
          "id": "e281",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "Br1",
            "slot": 0
          }
        },
        {
          "id": "e282",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "Br1",
            "slot": 1
          }
        },
        {
          "id": "e283",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "Br1",
            "slot": 2
          }
        },
        {
          "id": "e284",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "Br1",
            "slot": 3
          }
        },
        {
          "id": "e285",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "Br1",
            "slot": 4
          }
        },
        {
          "id": "e286",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "Br1",
            "slot": 5
          }
        }
      ],
      "groups": []
    },
    "viewBox": {
      "width": 1000,
      "height": 650,
      "atomRadius": 64,
      "hydrogenRadius": 40,
      "bondLength": 104,
      "shellOverlap": 24
    },
    "electronSlots": {
      "atom": {
        "directions": [
          -100,
          -80,
          -10,
          10,
          80,
          100,
          170,
          190
        ],
        "radius": 64,
        "hydrogenRadius": 40
      },
      "bond": {
        "maxPairs": 3,
        "centredInOverlap": true,
        "perpendicularOffsets": [
          -5,
          5
        ],
        "pairSpacing": 22
      }
    },
    "marking": {
      "cationShells": "empty-or-retained-full-shell",
      "geometryChecked": false,
      "speciesSpecific": false
    },
    "prerequisiteOrder": 23
  },
  {
    "id": "c2h5i",
    "name": "Iodoethane",
    "formula": "C2H5I",
    "displayFormula": "C2H5I",
    "totalCharge": 0,
    "namedSpecies": false,
    "category": "covalent",
    "practiceCategory": "covalent",
    "extension": false,
    "grades": [
      3
    ],
    "scope": "specification",
    "atlasEvidence": null,
    "smiles": "CCI",
    "prompt": "Draw any valid neutral isomer with this molecular formula, as one connected molecule. Show outer-shell electrons only. Each shared pair needs one dot and one cross; use one symbol for the non-bonding electrons on each atom. Inner shells and molecular shape are not assessed.",
    "explanation": "Shared pairs contain one electron from each atom. Hydrogen has two electrons around it; shared and non-bonding electrons give every other atom eight. Bonds: 1 × C–C (1 shared pair); 1 × C–I (1 shared pair); 5 × C–H (1 shared pair). Non-bonding inventory: 1 × I: 6 non-bonding electrons.",
    "sourceRefs": [
      "Edexcel International GCSE Chemistry specification Issue 3 (September 2024), sections 1.40 and 1.46; accessed 2026-09-12",
      "https://qualifications.pearson.com/content/dam/pdf/International%20GCSE/Chemistry/2017/specification-and-sample-assessments/international-gcse-chemistry-2017-specification.pdf"
    ],
    "reference": {
      "atoms": [
        {
          "id": "C1",
          "element": "C",
          "x": 400,
          "y": 325
        },
        {
          "id": "C2",
          "element": "C",
          "x": 504,
          "y": 325
        },
        {
          "id": "I1",
          "element": "I",
          "x": 608,
          "y": 325
        },
        {
          "id": "H1",
          "element": "H",
          "x": 320,
          "y": 325
        },
        {
          "id": "H2",
          "element": "H",
          "x": 400,
          "y": 405
        },
        {
          "id": "H3",
          "element": "H",
          "x": 400,
          "y": 245
        },
        {
          "id": "H4",
          "element": "H",
          "x": 504,
          "y": 245
        },
        {
          "id": "H5",
          "element": "H",
          "x": 504,
          "y": 405
        }
      ],
      "electrons": [
        {
          "id": "e287",
          "symbol": "dot",
          "anchor": {
            "kind": "bond",
            "a": "C1",
            "b": "C2",
            "slot": 0
          }
        },
        {
          "id": "e288",
          "symbol": "cross",
          "anchor": {
            "kind": "bond",
            "a": "C1",
            "b": "C2",
            "slot": 1
          }
        },
        {
          "id": "e289",
          "symbol": "dot",
          "anchor": {
            "kind": "bond",
            "a": "C2",
            "b": "I1",
            "slot": 0
          }
        },
        {
          "id": "e290",
          "symbol": "cross",
          "anchor": {
            "kind": "bond",
            "a": "C2",
            "b": "I1",
            "slot": 1
          }
        },
        {
          "id": "e291",
          "symbol": "dot",
          "anchor": {
            "kind": "bond",
            "a": "C1",
            "b": "H1",
            "slot": 0
          }
        },
        {
          "id": "e292",
          "symbol": "cross",
          "anchor": {
            "kind": "bond",
            "a": "C1",
            "b": "H1",
            "slot": 1
          }
        },
        {
          "id": "e293",
          "symbol": "dot",
          "anchor": {
            "kind": "bond",
            "a": "C1",
            "b": "H2",
            "slot": 0
          }
        },
        {
          "id": "e294",
          "symbol": "cross",
          "anchor": {
            "kind": "bond",
            "a": "C1",
            "b": "H2",
            "slot": 1
          }
        },
        {
          "id": "e295",
          "symbol": "dot",
          "anchor": {
            "kind": "bond",
            "a": "C1",
            "b": "H3",
            "slot": 0
          }
        },
        {
          "id": "e296",
          "symbol": "cross",
          "anchor": {
            "kind": "bond",
            "a": "C1",
            "b": "H3",
            "slot": 1
          }
        },
        {
          "id": "e297",
          "symbol": "dot",
          "anchor": {
            "kind": "bond",
            "a": "C2",
            "b": "H4",
            "slot": 0
          }
        },
        {
          "id": "e298",
          "symbol": "cross",
          "anchor": {
            "kind": "bond",
            "a": "C2",
            "b": "H4",
            "slot": 1
          }
        },
        {
          "id": "e299",
          "symbol": "dot",
          "anchor": {
            "kind": "bond",
            "a": "C2",
            "b": "H5",
            "slot": 0
          }
        },
        {
          "id": "e300",
          "symbol": "cross",
          "anchor": {
            "kind": "bond",
            "a": "C2",
            "b": "H5",
            "slot": 1
          }
        },
        {
          "id": "e301",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "I1",
            "slot": 0
          }
        },
        {
          "id": "e302",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "I1",
            "slot": 1
          }
        },
        {
          "id": "e303",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "I1",
            "slot": 2
          }
        },
        {
          "id": "e304",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "I1",
            "slot": 3
          }
        },
        {
          "id": "e305",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "I1",
            "slot": 4
          }
        },
        {
          "id": "e306",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "I1",
            "slot": 5
          }
        }
      ],
      "groups": []
    },
    "viewBox": {
      "width": 1000,
      "height": 650,
      "atomRadius": 64,
      "hydrogenRadius": 40,
      "bondLength": 104,
      "shellOverlap": 24
    },
    "electronSlots": {
      "atom": {
        "directions": [
          -100,
          -80,
          -10,
          10,
          80,
          100,
          170,
          190
        ],
        "radius": 64,
        "hydrogenRadius": 40
      },
      "bond": {
        "maxPairs": 3,
        "centredInOverlap": true,
        "perpendicularOffsets": [
          -5,
          5
        ],
        "pairSpacing": 22
      }
    },
    "marking": {
      "cationShells": "empty-or-retained-full-shell",
      "geometryChecked": false,
      "speciesSpecific": false
    },
    "prerequisiteOrder": 24
  },
  {
    "id": "c2h5f",
    "name": "Fluoroethane",
    "formula": "C2H5F",
    "displayFormula": "C2H5F",
    "totalCharge": 0,
    "namedSpecies": false,
    "category": "covalent",
    "practiceCategory": "covalent",
    "extension": false,
    "grades": [
      3
    ],
    "scope": "specification",
    "atlasEvidence": null,
    "smiles": "CCF",
    "prompt": "Draw any valid neutral isomer with this molecular formula, as one connected molecule. Show outer-shell electrons only. Each shared pair needs one dot and one cross; use one symbol for the non-bonding electrons on each atom. Inner shells and molecular shape are not assessed.",
    "explanation": "Shared pairs contain one electron from each atom. Hydrogen has two electrons around it; shared and non-bonding electrons give every other atom eight. Bonds: 1 × C–C (1 shared pair); 1 × C–F (1 shared pair); 5 × C–H (1 shared pair). Non-bonding inventory: 1 × F: 6 non-bonding electrons.",
    "sourceRefs": [
      "Edexcel International GCSE Chemistry specification Issue 3 (September 2024), sections 1.40 and 1.46; accessed 2026-09-12",
      "https://qualifications.pearson.com/content/dam/pdf/International%20GCSE/Chemistry/2017/specification-and-sample-assessments/international-gcse-chemistry-2017-specification.pdf"
    ],
    "reference": {
      "atoms": [
        {
          "id": "C1",
          "element": "C",
          "x": 400,
          "y": 325
        },
        {
          "id": "C2",
          "element": "C",
          "x": 504,
          "y": 325
        },
        {
          "id": "F1",
          "element": "F",
          "x": 608,
          "y": 325
        },
        {
          "id": "H1",
          "element": "H",
          "x": 320,
          "y": 325
        },
        {
          "id": "H2",
          "element": "H",
          "x": 400,
          "y": 405
        },
        {
          "id": "H3",
          "element": "H",
          "x": 400,
          "y": 245
        },
        {
          "id": "H4",
          "element": "H",
          "x": 504,
          "y": 245
        },
        {
          "id": "H5",
          "element": "H",
          "x": 504,
          "y": 405
        }
      ],
      "electrons": [
        {
          "id": "e307",
          "symbol": "dot",
          "anchor": {
            "kind": "bond",
            "a": "C1",
            "b": "C2",
            "slot": 0
          }
        },
        {
          "id": "e308",
          "symbol": "cross",
          "anchor": {
            "kind": "bond",
            "a": "C1",
            "b": "C2",
            "slot": 1
          }
        },
        {
          "id": "e309",
          "symbol": "dot",
          "anchor": {
            "kind": "bond",
            "a": "C2",
            "b": "F1",
            "slot": 0
          }
        },
        {
          "id": "e310",
          "symbol": "cross",
          "anchor": {
            "kind": "bond",
            "a": "C2",
            "b": "F1",
            "slot": 1
          }
        },
        {
          "id": "e311",
          "symbol": "dot",
          "anchor": {
            "kind": "bond",
            "a": "C1",
            "b": "H1",
            "slot": 0
          }
        },
        {
          "id": "e312",
          "symbol": "cross",
          "anchor": {
            "kind": "bond",
            "a": "C1",
            "b": "H1",
            "slot": 1
          }
        },
        {
          "id": "e313",
          "symbol": "dot",
          "anchor": {
            "kind": "bond",
            "a": "C1",
            "b": "H2",
            "slot": 0
          }
        },
        {
          "id": "e314",
          "symbol": "cross",
          "anchor": {
            "kind": "bond",
            "a": "C1",
            "b": "H2",
            "slot": 1
          }
        },
        {
          "id": "e315",
          "symbol": "dot",
          "anchor": {
            "kind": "bond",
            "a": "C1",
            "b": "H3",
            "slot": 0
          }
        },
        {
          "id": "e316",
          "symbol": "cross",
          "anchor": {
            "kind": "bond",
            "a": "C1",
            "b": "H3",
            "slot": 1
          }
        },
        {
          "id": "e317",
          "symbol": "dot",
          "anchor": {
            "kind": "bond",
            "a": "C2",
            "b": "H4",
            "slot": 0
          }
        },
        {
          "id": "e318",
          "symbol": "cross",
          "anchor": {
            "kind": "bond",
            "a": "C2",
            "b": "H4",
            "slot": 1
          }
        },
        {
          "id": "e319",
          "symbol": "dot",
          "anchor": {
            "kind": "bond",
            "a": "C2",
            "b": "H5",
            "slot": 0
          }
        },
        {
          "id": "e320",
          "symbol": "cross",
          "anchor": {
            "kind": "bond",
            "a": "C2",
            "b": "H5",
            "slot": 1
          }
        },
        {
          "id": "e321",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "F1",
            "slot": 0
          }
        },
        {
          "id": "e322",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "F1",
            "slot": 1
          }
        },
        {
          "id": "e323",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "F1",
            "slot": 2
          }
        },
        {
          "id": "e324",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "F1",
            "slot": 3
          }
        },
        {
          "id": "e325",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "F1",
            "slot": 4
          }
        },
        {
          "id": "e326",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "F1",
            "slot": 5
          }
        }
      ],
      "groups": []
    },
    "viewBox": {
      "width": 1000,
      "height": 650,
      "atomRadius": 64,
      "hydrogenRadius": 40,
      "bondLength": 104,
      "shellOverlap": 24
    },
    "electronSlots": {
      "atom": {
        "directions": [
          -100,
          -80,
          -10,
          10,
          80,
          100,
          170,
          190
        ],
        "radius": 64,
        "hydrogenRadius": 40
      },
      "bond": {
        "maxPairs": 3,
        "centredInOverlap": true,
        "perpendicularOffsets": [
          -5,
          5
        ],
        "pairSpacing": 22
      }
    },
    "marking": {
      "cationShells": "empty-or-retained-full-shell",
      "geometryChecked": false,
      "speciesSpecific": false
    },
    "prerequisiteOrder": 25
  },
  {
    "id": "c2h3br",
    "name": "Bromoethene",
    "formula": "C2H3Br",
    "displayFormula": "C2H3Br",
    "totalCharge": 0,
    "namedSpecies": false,
    "category": "covalent",
    "practiceCategory": "covalent",
    "extension": false,
    "grades": [
      3
    ],
    "scope": "specification",
    "atlasEvidence": null,
    "smiles": "C=CBr",
    "prompt": "Draw any valid neutral isomer with this molecular formula, as one connected molecule. Show outer-shell electrons only. Each shared pair needs one dot and one cross; use one symbol for the non-bonding electrons on each atom. Inner shells and molecular shape are not assessed.",
    "explanation": "Shared pairs contain one electron from each atom. Hydrogen has two electrons around it; shared and non-bonding electrons give every other atom eight. Bonds: 1 × C–C (2 shared pairs); 3 × C–H (1 shared pair); 1 × Br–C (1 shared pair). Non-bonding inventory: 1 × Br: 6 non-bonding electrons.",
    "sourceRefs": [
      "Edexcel International GCSE Chemistry specification Issue 3 (September 2024), sections 1.40 and 1.46; accessed 2026-09-12",
      "https://qualifications.pearson.com/content/dam/pdf/International%20GCSE/Chemistry/2017/specification-and-sample-assessments/international-gcse-chemistry-2017-specification.pdf"
    ],
    "reference": {
      "atoms": [
        {
          "id": "C1",
          "element": "C",
          "x": 400,
          "y": 325
        },
        {
          "id": "C2",
          "element": "C",
          "x": 504,
          "y": 325
        },
        {
          "id": "Br1",
          "element": "Br",
          "x": 608,
          "y": 325
        },
        {
          "id": "H1",
          "element": "H",
          "x": 336.8518226098939,
          "y": 275.8847509188064
        },
        {
          "id": "H2",
          "element": "H",
          "x": 336.8518226098939,
          "y": 374.1152490811936
        },
        {
          "id": "H3",
          "element": "H",
          "x": 504,
          "y": 405
        }
      ],
      "electrons": [
        {
          "id": "e327",
          "symbol": "dot",
          "anchor": {
            "kind": "bond",
            "a": "C1",
            "b": "C2",
            "slot": 0
          }
        },
        {
          "id": "e328",
          "symbol": "cross",
          "anchor": {
            "kind": "bond",
            "a": "C1",
            "b": "C2",
            "slot": 1
          }
        },
        {
          "id": "e329",
          "symbol": "dot",
          "anchor": {
            "kind": "bond",
            "a": "C1",
            "b": "C2",
            "slot": 2
          }
        },
        {
          "id": "e330",
          "symbol": "cross",
          "anchor": {
            "kind": "bond",
            "a": "C1",
            "b": "C2",
            "slot": 3
          }
        },
        {
          "id": "e331",
          "symbol": "dot",
          "anchor": {
            "kind": "bond",
            "a": "C1",
            "b": "H1",
            "slot": 0
          }
        },
        {
          "id": "e332",
          "symbol": "cross",
          "anchor": {
            "kind": "bond",
            "a": "C1",
            "b": "H1",
            "slot": 1
          }
        },
        {
          "id": "e333",
          "symbol": "dot",
          "anchor": {
            "kind": "bond",
            "a": "C1",
            "b": "H2",
            "slot": 0
          }
        },
        {
          "id": "e334",
          "symbol": "cross",
          "anchor": {
            "kind": "bond",
            "a": "C1",
            "b": "H2",
            "slot": 1
          }
        },
        {
          "id": "e335",
          "symbol": "dot",
          "anchor": {
            "kind": "bond",
            "a": "C2",
            "b": "Br1",
            "slot": 0
          }
        },
        {
          "id": "e336",
          "symbol": "cross",
          "anchor": {
            "kind": "bond",
            "a": "C2",
            "b": "Br1",
            "slot": 1
          }
        },
        {
          "id": "e337",
          "symbol": "dot",
          "anchor": {
            "kind": "bond",
            "a": "C2",
            "b": "H3",
            "slot": 0
          }
        },
        {
          "id": "e338",
          "symbol": "cross",
          "anchor": {
            "kind": "bond",
            "a": "C2",
            "b": "H3",
            "slot": 1
          }
        },
        {
          "id": "e339",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "Br1",
            "slot": 0
          }
        },
        {
          "id": "e340",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "Br1",
            "slot": 1
          }
        },
        {
          "id": "e341",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "Br1",
            "slot": 2
          }
        },
        {
          "id": "e342",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "Br1",
            "slot": 3
          }
        },
        {
          "id": "e343",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "Br1",
            "slot": 4
          }
        },
        {
          "id": "e344",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "Br1",
            "slot": 5
          }
        }
      ],
      "groups": []
    },
    "viewBox": {
      "width": 1000,
      "height": 650,
      "atomRadius": 64,
      "hydrogenRadius": 40,
      "bondLength": 104,
      "shellOverlap": 24
    },
    "electronSlots": {
      "atom": {
        "directions": [
          -100,
          -80,
          -10,
          10,
          80,
          100,
          170,
          190
        ],
        "radius": 64,
        "hydrogenRadius": 40
      },
      "bond": {
        "maxPairs": 3,
        "centredInOverlap": true,
        "perpendicularOffsets": [
          -5,
          5
        ],
        "pairSpacing": 22
      }
    },
    "marking": {
      "cationShells": "empty-or-retained-full-shell",
      "geometryChecked": false,
      "speciesSpecific": false
    },
    "prerequisiteOrder": 26
  },
  {
    "id": "c2h3f",
    "name": "Fluoroethene",
    "formula": "C2H3F",
    "displayFormula": "C2H3F",
    "totalCharge": 0,
    "namedSpecies": false,
    "category": "covalent",
    "practiceCategory": "covalent",
    "extension": false,
    "grades": [
      3
    ],
    "scope": "specification",
    "atlasEvidence": null,
    "smiles": "C=CF",
    "prompt": "Draw any valid neutral isomer with this molecular formula, as one connected molecule. Show outer-shell electrons only. Each shared pair needs one dot and one cross; use one symbol for the non-bonding electrons on each atom. Inner shells and molecular shape are not assessed.",
    "explanation": "Shared pairs contain one electron from each atom. Hydrogen has two electrons around it; shared and non-bonding electrons give every other atom eight. Bonds: 1 × C–C (2 shared pairs); 3 × C–H (1 shared pair); 1 × C–F (1 shared pair). Non-bonding inventory: 1 × F: 6 non-bonding electrons.",
    "sourceRefs": [
      "Edexcel International GCSE Chemistry specification Issue 3 (September 2024), sections 1.40 and 1.46; accessed 2026-09-12",
      "https://qualifications.pearson.com/content/dam/pdf/International%20GCSE/Chemistry/2017/specification-and-sample-assessments/international-gcse-chemistry-2017-specification.pdf"
    ],
    "reference": {
      "atoms": [
        {
          "id": "C1",
          "element": "C",
          "x": 400,
          "y": 325
        },
        {
          "id": "C2",
          "element": "C",
          "x": 504,
          "y": 325
        },
        {
          "id": "F1",
          "element": "F",
          "x": 608,
          "y": 325
        },
        {
          "id": "H1",
          "element": "H",
          "x": 336.8518226098939,
          "y": 275.8847509188064
        },
        {
          "id": "H2",
          "element": "H",
          "x": 336.8518226098939,
          "y": 374.1152490811936
        },
        {
          "id": "H3",
          "element": "H",
          "x": 504,
          "y": 405
        }
      ],
      "electrons": [
        {
          "id": "e345",
          "symbol": "dot",
          "anchor": {
            "kind": "bond",
            "a": "C1",
            "b": "C2",
            "slot": 0
          }
        },
        {
          "id": "e346",
          "symbol": "cross",
          "anchor": {
            "kind": "bond",
            "a": "C1",
            "b": "C2",
            "slot": 1
          }
        },
        {
          "id": "e347",
          "symbol": "dot",
          "anchor": {
            "kind": "bond",
            "a": "C1",
            "b": "C2",
            "slot": 2
          }
        },
        {
          "id": "e348",
          "symbol": "cross",
          "anchor": {
            "kind": "bond",
            "a": "C1",
            "b": "C2",
            "slot": 3
          }
        },
        {
          "id": "e349",
          "symbol": "dot",
          "anchor": {
            "kind": "bond",
            "a": "C1",
            "b": "H1",
            "slot": 0
          }
        },
        {
          "id": "e350",
          "symbol": "cross",
          "anchor": {
            "kind": "bond",
            "a": "C1",
            "b": "H1",
            "slot": 1
          }
        },
        {
          "id": "e351",
          "symbol": "dot",
          "anchor": {
            "kind": "bond",
            "a": "C1",
            "b": "H2",
            "slot": 0
          }
        },
        {
          "id": "e352",
          "symbol": "cross",
          "anchor": {
            "kind": "bond",
            "a": "C1",
            "b": "H2",
            "slot": 1
          }
        },
        {
          "id": "e353",
          "symbol": "dot",
          "anchor": {
            "kind": "bond",
            "a": "C2",
            "b": "F1",
            "slot": 0
          }
        },
        {
          "id": "e354",
          "symbol": "cross",
          "anchor": {
            "kind": "bond",
            "a": "C2",
            "b": "F1",
            "slot": 1
          }
        },
        {
          "id": "e355",
          "symbol": "dot",
          "anchor": {
            "kind": "bond",
            "a": "C2",
            "b": "H3",
            "slot": 0
          }
        },
        {
          "id": "e356",
          "symbol": "cross",
          "anchor": {
            "kind": "bond",
            "a": "C2",
            "b": "H3",
            "slot": 1
          }
        },
        {
          "id": "e357",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "F1",
            "slot": 0
          }
        },
        {
          "id": "e358",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "F1",
            "slot": 1
          }
        },
        {
          "id": "e359",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "F1",
            "slot": 2
          }
        },
        {
          "id": "e360",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "F1",
            "slot": 3
          }
        },
        {
          "id": "e361",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "F1",
            "slot": 4
          }
        },
        {
          "id": "e362",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "F1",
            "slot": 5
          }
        }
      ],
      "groups": []
    },
    "viewBox": {
      "width": 1000,
      "height": 650,
      "atomRadius": 64,
      "hydrogenRadius": 40,
      "bondLength": 104,
      "shellOverlap": 24
    },
    "electronSlots": {
      "atom": {
        "directions": [
          -100,
          -80,
          -10,
          10,
          80,
          100,
          170,
          190
        ],
        "radius": 64,
        "hydrogenRadius": 40
      },
      "bond": {
        "maxPairs": 3,
        "centredInOverlap": true,
        "perpendicularOffsets": [
          -5,
          5
        ],
        "pairSpacing": 22
      }
    },
    "marking": {
      "cationShells": "empty-or-retained-full-shell",
      "geometryChecked": false,
      "speciesSpecific": false
    },
    "prerequisiteOrder": 27
  },
  {
    "id": "c2h4cl2-11",
    "name": "1,1-Dichloroethane",
    "formula": "C2H4Cl2",
    "displayFormula": "C2H4Cl2",
    "totalCharge": 0,
    "namedSpecies": false,
    "category": "covalent",
    "practiceCategory": "covalent",
    "extension": false,
    "grades": [
      3
    ],
    "scope": "specification",
    "atlasEvidence": null,
    "smiles": "CC(Cl)Cl",
    "prompt": "Draw any valid neutral isomer with this molecular formula, as one connected molecule. Show outer-shell electrons only. Each shared pair needs one dot and one cross; use one symbol for the non-bonding electrons on each atom. Inner shells and molecular shape are not assessed.",
    "explanation": "Shared pairs contain one electron from each atom. Hydrogen has two electrons around it; shared and non-bonding electrons give every other atom eight. Bonds: 1 × C–C (1 shared pair); 2 × C–Cl (1 shared pair); 4 × C–H (1 shared pair). Non-bonding inventory: 2 × Cl: 6 non-bonding electrons.",
    "sourceRefs": [
      "Edexcel International GCSE Chemistry specification Issue 3 (September 2024), sections 1.40 and 1.46; accessed 2026-09-12",
      "https://qualifications.pearson.com/content/dam/pdf/International%20GCSE/Chemistry/2017/specification-and-sample-assessments/international-gcse-chemistry-2017-specification.pdf"
    ],
    "reference": {
      "atoms": [
        {
          "id": "C1",
          "element": "C",
          "x": 400,
          "y": 325
        },
        {
          "id": "C2",
          "element": "C",
          "x": 504,
          "y": 325
        },
        {
          "id": "Cl1",
          "element": "Cl",
          "x": 400,
          "y": 221
        },
        {
          "id": "Cl2",
          "element": "Cl",
          "x": 400,
          "y": 429
        },
        {
          "id": "H1",
          "element": "H",
          "x": 320,
          "y": 325
        },
        {
          "id": "H2",
          "element": "H",
          "x": 543.9777962791662,
          "y": 255.70515311611194
        },
        {
          "id": "H3",
          "element": "H",
          "x": 584,
          "y": 325
        },
        {
          "id": "H4",
          "element": "H",
          "x": 543.9777962791662,
          "y": 394.29484688388806
        }
      ],
      "electrons": [
        {
          "id": "e363",
          "symbol": "dot",
          "anchor": {
            "kind": "bond",
            "a": "C1",
            "b": "C2",
            "slot": 0
          }
        },
        {
          "id": "e364",
          "symbol": "cross",
          "anchor": {
            "kind": "bond",
            "a": "C1",
            "b": "C2",
            "slot": 1
          }
        },
        {
          "id": "e365",
          "symbol": "dot",
          "anchor": {
            "kind": "bond",
            "a": "C1",
            "b": "Cl1",
            "slot": 0
          }
        },
        {
          "id": "e366",
          "symbol": "cross",
          "anchor": {
            "kind": "bond",
            "a": "C1",
            "b": "Cl1",
            "slot": 1
          }
        },
        {
          "id": "e367",
          "symbol": "dot",
          "anchor": {
            "kind": "bond",
            "a": "C1",
            "b": "Cl2",
            "slot": 0
          }
        },
        {
          "id": "e368",
          "symbol": "cross",
          "anchor": {
            "kind": "bond",
            "a": "C1",
            "b": "Cl2",
            "slot": 1
          }
        },
        {
          "id": "e369",
          "symbol": "dot",
          "anchor": {
            "kind": "bond",
            "a": "C1",
            "b": "H1",
            "slot": 0
          }
        },
        {
          "id": "e370",
          "symbol": "cross",
          "anchor": {
            "kind": "bond",
            "a": "C1",
            "b": "H1",
            "slot": 1
          }
        },
        {
          "id": "e371",
          "symbol": "dot",
          "anchor": {
            "kind": "bond",
            "a": "C2",
            "b": "H2",
            "slot": 0
          }
        },
        {
          "id": "e372",
          "symbol": "cross",
          "anchor": {
            "kind": "bond",
            "a": "C2",
            "b": "H2",
            "slot": 1
          }
        },
        {
          "id": "e373",
          "symbol": "dot",
          "anchor": {
            "kind": "bond",
            "a": "C2",
            "b": "H3",
            "slot": 0
          }
        },
        {
          "id": "e374",
          "symbol": "cross",
          "anchor": {
            "kind": "bond",
            "a": "C2",
            "b": "H3",
            "slot": 1
          }
        },
        {
          "id": "e375",
          "symbol": "dot",
          "anchor": {
            "kind": "bond",
            "a": "C2",
            "b": "H4",
            "slot": 0
          }
        },
        {
          "id": "e376",
          "symbol": "cross",
          "anchor": {
            "kind": "bond",
            "a": "C2",
            "b": "H4",
            "slot": 1
          }
        },
        {
          "id": "e377",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "Cl1",
            "slot": 0
          }
        },
        {
          "id": "e378",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "Cl1",
            "slot": 1
          }
        },
        {
          "id": "e379",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "Cl1",
            "slot": 2
          }
        },
        {
          "id": "e380",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "Cl1",
            "slot": 3
          }
        },
        {
          "id": "e381",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "Cl1",
            "slot": 4
          }
        },
        {
          "id": "e382",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "Cl1",
            "slot": 5
          }
        },
        {
          "id": "e383",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "Cl2",
            "slot": 0
          }
        },
        {
          "id": "e384",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "Cl2",
            "slot": 1
          }
        },
        {
          "id": "e385",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "Cl2",
            "slot": 2
          }
        },
        {
          "id": "e386",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "Cl2",
            "slot": 3
          }
        },
        {
          "id": "e387",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "Cl2",
            "slot": 4
          }
        },
        {
          "id": "e388",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "Cl2",
            "slot": 5
          }
        }
      ],
      "groups": []
    },
    "viewBox": {
      "width": 1000,
      "height": 650,
      "atomRadius": 64,
      "hydrogenRadius": 40,
      "bondLength": 104,
      "shellOverlap": 24
    },
    "electronSlots": {
      "atom": {
        "directions": [
          -100,
          -80,
          -10,
          10,
          80,
          100,
          170,
          190
        ],
        "radius": 64,
        "hydrogenRadius": 40
      },
      "bond": {
        "maxPairs": 3,
        "centredInOverlap": true,
        "perpendicularOffsets": [
          -5,
          5
        ],
        "pairSpacing": 22
      }
    },
    "marking": {
      "cationShells": "empty-or-retained-full-shell",
      "geometryChecked": false,
      "speciesSpecific": false
    },
    "prerequisiteOrder": 28
  },
  {
    "id": "c2h4cl2-12",
    "name": "1,2-Dichloroethane",
    "formula": "C2H4Cl2",
    "displayFormula": "C2H4Cl2",
    "totalCharge": 0,
    "namedSpecies": false,
    "category": "covalent",
    "practiceCategory": "covalent",
    "extension": false,
    "grades": [
      3
    ],
    "scope": "specification",
    "atlasEvidence": null,
    "smiles": "ClCCCl",
    "prompt": "Draw any valid neutral isomer with this molecular formula, as one connected molecule. Show outer-shell electrons only. Each shared pair needs one dot and one cross; use one symbol for the non-bonding electrons on each atom. Inner shells and molecular shape are not assessed.",
    "explanation": "Shared pairs contain one electron from each atom. Hydrogen has two electrons around it; shared and non-bonding electrons give every other atom eight. Bonds: 1 × C–C (1 shared pair); 2 × C–Cl (1 shared pair); 4 × C–H (1 shared pair). Non-bonding inventory: 2 × Cl: 6 non-bonding electrons.",
    "sourceRefs": [
      "Edexcel International GCSE Chemistry specification Issue 3 (September 2024), sections 1.40 and 1.46; accessed 2026-09-12",
      "https://qualifications.pearson.com/content/dam/pdf/International%20GCSE/Chemistry/2017/specification-and-sample-assessments/international-gcse-chemistry-2017-specification.pdf"
    ],
    "reference": {
      "atoms": [
        {
          "id": "C1",
          "element": "C",
          "x": 400,
          "y": 325
        },
        {
          "id": "C2",
          "element": "C",
          "x": 504,
          "y": 325
        },
        {
          "id": "Cl1",
          "element": "Cl",
          "x": 400,
          "y": 221
        },
        {
          "id": "Cl2",
          "element": "Cl",
          "x": 504,
          "y": 429
        },
        {
          "id": "H1",
          "element": "H",
          "x": 320,
          "y": 325
        },
        {
          "id": "H2",
          "element": "H",
          "x": 400,
          "y": 405
        },
        {
          "id": "H3",
          "element": "H",
          "x": 504,
          "y": 245
        },
        {
          "id": "H4",
          "element": "H",
          "x": 584,
          "y": 325
        }
      ],
      "electrons": [
        {
          "id": "e389",
          "symbol": "dot",
          "anchor": {
            "kind": "bond",
            "a": "C1",
            "b": "C2",
            "slot": 0
          }
        },
        {
          "id": "e390",
          "symbol": "cross",
          "anchor": {
            "kind": "bond",
            "a": "C1",
            "b": "C2",
            "slot": 1
          }
        },
        {
          "id": "e391",
          "symbol": "dot",
          "anchor": {
            "kind": "bond",
            "a": "C1",
            "b": "Cl1",
            "slot": 0
          }
        },
        {
          "id": "e392",
          "symbol": "cross",
          "anchor": {
            "kind": "bond",
            "a": "C1",
            "b": "Cl1",
            "slot": 1
          }
        },
        {
          "id": "e393",
          "symbol": "dot",
          "anchor": {
            "kind": "bond",
            "a": "C2",
            "b": "Cl2",
            "slot": 0
          }
        },
        {
          "id": "e394",
          "symbol": "cross",
          "anchor": {
            "kind": "bond",
            "a": "C2",
            "b": "Cl2",
            "slot": 1
          }
        },
        {
          "id": "e395",
          "symbol": "dot",
          "anchor": {
            "kind": "bond",
            "a": "C1",
            "b": "H1",
            "slot": 0
          }
        },
        {
          "id": "e396",
          "symbol": "cross",
          "anchor": {
            "kind": "bond",
            "a": "C1",
            "b": "H1",
            "slot": 1
          }
        },
        {
          "id": "e397",
          "symbol": "dot",
          "anchor": {
            "kind": "bond",
            "a": "C1",
            "b": "H2",
            "slot": 0
          }
        },
        {
          "id": "e398",
          "symbol": "cross",
          "anchor": {
            "kind": "bond",
            "a": "C1",
            "b": "H2",
            "slot": 1
          }
        },
        {
          "id": "e399",
          "symbol": "dot",
          "anchor": {
            "kind": "bond",
            "a": "C2",
            "b": "H3",
            "slot": 0
          }
        },
        {
          "id": "e400",
          "symbol": "cross",
          "anchor": {
            "kind": "bond",
            "a": "C2",
            "b": "H3",
            "slot": 1
          }
        },
        {
          "id": "e401",
          "symbol": "dot",
          "anchor": {
            "kind": "bond",
            "a": "C2",
            "b": "H4",
            "slot": 0
          }
        },
        {
          "id": "e402",
          "symbol": "cross",
          "anchor": {
            "kind": "bond",
            "a": "C2",
            "b": "H4",
            "slot": 1
          }
        },
        {
          "id": "e403",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "Cl1",
            "slot": 0
          }
        },
        {
          "id": "e404",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "Cl1",
            "slot": 1
          }
        },
        {
          "id": "e405",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "Cl1",
            "slot": 2
          }
        },
        {
          "id": "e406",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "Cl1",
            "slot": 3
          }
        },
        {
          "id": "e407",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "Cl1",
            "slot": 4
          }
        },
        {
          "id": "e408",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "Cl1",
            "slot": 5
          }
        },
        {
          "id": "e409",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "Cl2",
            "slot": 0
          }
        },
        {
          "id": "e410",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "Cl2",
            "slot": 1
          }
        },
        {
          "id": "e411",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "Cl2",
            "slot": 2
          }
        },
        {
          "id": "e412",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "Cl2",
            "slot": 3
          }
        },
        {
          "id": "e413",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "Cl2",
            "slot": 4
          }
        },
        {
          "id": "e414",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "Cl2",
            "slot": 5
          }
        }
      ],
      "groups": []
    },
    "viewBox": {
      "width": 1000,
      "height": 650,
      "atomRadius": 64,
      "hydrogenRadius": 40,
      "bondLength": 104,
      "shellOverlap": 24
    },
    "electronSlots": {
      "atom": {
        "directions": [
          -100,
          -80,
          -10,
          10,
          80,
          100,
          170,
          190
        ],
        "radius": 64,
        "hydrogenRadius": 40
      },
      "bond": {
        "maxPairs": 3,
        "centredInOverlap": true,
        "perpendicularOffsets": [
          -5,
          5
        ],
        "pairSpacing": 22
      }
    },
    "marking": {
      "cationShells": "empty-or-retained-full-shell",
      "geometryChecked": false,
      "speciesSpecific": false
    },
    "prerequisiteOrder": 29
  },
  {
    "id": "c2h2cl2-11",
    "name": "1,1-Dichloroethene",
    "formula": "C2H2Cl2",
    "displayFormula": "C2H2Cl2",
    "totalCharge": 0,
    "namedSpecies": false,
    "category": "covalent",
    "practiceCategory": "covalent",
    "extension": false,
    "grades": [
      3
    ],
    "scope": "specification",
    "atlasEvidence": null,
    "smiles": "C=C(Cl)Cl",
    "prompt": "Draw any valid neutral isomer with this molecular formula, as one connected molecule. Show outer-shell electrons only. Each shared pair needs one dot and one cross; use one symbol for the non-bonding electrons on each atom. Inner shells and molecular shape are not assessed.",
    "explanation": "Shared pairs contain one electron from each atom. Hydrogen has two electrons around it; shared and non-bonding electrons give every other atom eight. Bonds: 1 × C–C (2 shared pairs); 2 × C–Cl (1 shared pair); 2 × C–H (1 shared pair). Non-bonding inventory: 2 × Cl: 6 non-bonding electrons.",
    "sourceRefs": [
      "Edexcel International GCSE Chemistry specification Issue 3 (September 2024), sections 1.40 and 1.46; accessed 2026-09-12",
      "https://qualifications.pearson.com/content/dam/pdf/International%20GCSE/Chemistry/2017/specification-and-sample-assessments/international-gcse-chemistry-2017-specification.pdf"
    ],
    "reference": {
      "atoms": [
        {
          "id": "C1",
          "element": "C",
          "x": 400,
          "y": 325
        },
        {
          "id": "C2",
          "element": "C",
          "x": 504,
          "y": 325
        },
        {
          "id": "Cl1",
          "element": "Cl",
          "x": 400,
          "y": 221
        },
        {
          "id": "Cl2",
          "element": "Cl",
          "x": 400,
          "y": 429
        },
        {
          "id": "H1",
          "element": "H",
          "x": 504,
          "y": 245
        },
        {
          "id": "H2",
          "element": "H",
          "x": 504,
          "y": 405
        }
      ],
      "electrons": [
        {
          "id": "e415",
          "symbol": "dot",
          "anchor": {
            "kind": "bond",
            "a": "C1",
            "b": "C2",
            "slot": 0
          }
        },
        {
          "id": "e416",
          "symbol": "cross",
          "anchor": {
            "kind": "bond",
            "a": "C1",
            "b": "C2",
            "slot": 1
          }
        },
        {
          "id": "e417",
          "symbol": "dot",
          "anchor": {
            "kind": "bond",
            "a": "C1",
            "b": "C2",
            "slot": 2
          }
        },
        {
          "id": "e418",
          "symbol": "cross",
          "anchor": {
            "kind": "bond",
            "a": "C1",
            "b": "C2",
            "slot": 3
          }
        },
        {
          "id": "e419",
          "symbol": "dot",
          "anchor": {
            "kind": "bond",
            "a": "C1",
            "b": "Cl1",
            "slot": 0
          }
        },
        {
          "id": "e420",
          "symbol": "cross",
          "anchor": {
            "kind": "bond",
            "a": "C1",
            "b": "Cl1",
            "slot": 1
          }
        },
        {
          "id": "e421",
          "symbol": "dot",
          "anchor": {
            "kind": "bond",
            "a": "C1",
            "b": "Cl2",
            "slot": 0
          }
        },
        {
          "id": "e422",
          "symbol": "cross",
          "anchor": {
            "kind": "bond",
            "a": "C1",
            "b": "Cl2",
            "slot": 1
          }
        },
        {
          "id": "e423",
          "symbol": "dot",
          "anchor": {
            "kind": "bond",
            "a": "C2",
            "b": "H1",
            "slot": 0
          }
        },
        {
          "id": "e424",
          "symbol": "cross",
          "anchor": {
            "kind": "bond",
            "a": "C2",
            "b": "H1",
            "slot": 1
          }
        },
        {
          "id": "e425",
          "symbol": "dot",
          "anchor": {
            "kind": "bond",
            "a": "C2",
            "b": "H2",
            "slot": 0
          }
        },
        {
          "id": "e426",
          "symbol": "cross",
          "anchor": {
            "kind": "bond",
            "a": "C2",
            "b": "H2",
            "slot": 1
          }
        },
        {
          "id": "e427",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "Cl1",
            "slot": 0
          }
        },
        {
          "id": "e428",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "Cl1",
            "slot": 1
          }
        },
        {
          "id": "e429",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "Cl1",
            "slot": 2
          }
        },
        {
          "id": "e430",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "Cl1",
            "slot": 3
          }
        },
        {
          "id": "e431",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "Cl1",
            "slot": 4
          }
        },
        {
          "id": "e432",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "Cl1",
            "slot": 5
          }
        },
        {
          "id": "e433",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "Cl2",
            "slot": 0
          }
        },
        {
          "id": "e434",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "Cl2",
            "slot": 1
          }
        },
        {
          "id": "e435",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "Cl2",
            "slot": 2
          }
        },
        {
          "id": "e436",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "Cl2",
            "slot": 3
          }
        },
        {
          "id": "e437",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "Cl2",
            "slot": 4
          }
        },
        {
          "id": "e438",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "Cl2",
            "slot": 5
          }
        }
      ],
      "groups": []
    },
    "viewBox": {
      "width": 1000,
      "height": 650,
      "atomRadius": 64,
      "hydrogenRadius": 40,
      "bondLength": 104,
      "shellOverlap": 24
    },
    "electronSlots": {
      "atom": {
        "directions": [
          -100,
          -80,
          -10,
          10,
          80,
          100,
          170,
          190
        ],
        "radius": 64,
        "hydrogenRadius": 40
      },
      "bond": {
        "maxPairs": 3,
        "centredInOverlap": true,
        "perpendicularOffsets": [
          -5,
          5
        ],
        "pairSpacing": 22
      }
    },
    "marking": {
      "cationShells": "empty-or-retained-full-shell",
      "geometryChecked": false,
      "speciesSpecific": false
    },
    "prerequisiteOrder": 30
  },
  {
    "id": "c2h2cl2-12",
    "name": "1,2-Dichloroethene",
    "formula": "C2H2Cl2",
    "displayFormula": "C2H2Cl2",
    "totalCharge": 0,
    "namedSpecies": false,
    "category": "covalent",
    "practiceCategory": "covalent",
    "extension": false,
    "grades": [
      3
    ],
    "scope": "specification",
    "atlasEvidence": null,
    "smiles": "ClC=CCl",
    "prompt": "Draw any valid neutral isomer with this molecular formula, as one connected molecule. Show outer-shell electrons only. Each shared pair needs one dot and one cross; use one symbol for the non-bonding electrons on each atom. Inner shells and molecular shape are not assessed.",
    "explanation": "Shared pairs contain one electron from each atom. Hydrogen has two electrons around it; shared and non-bonding electrons give every other atom eight. Bonds: 1 × C–C (2 shared pairs); 2 × C–Cl (1 shared pair); 2 × C–H (1 shared pair). Non-bonding inventory: 2 × Cl: 6 non-bonding electrons.",
    "sourceRefs": [
      "Edexcel International GCSE Chemistry specification Issue 3 (September 2024), sections 1.40 and 1.46; accessed 2026-09-12",
      "https://qualifications.pearson.com/content/dam/pdf/International%20GCSE/Chemistry/2017/specification-and-sample-assessments/international-gcse-chemistry-2017-specification.pdf"
    ],
    "reference": {
      "atoms": [
        {
          "id": "C1",
          "element": "C",
          "x": 400,
          "y": 325
        },
        {
          "id": "C2",
          "element": "C",
          "x": 504,
          "y": 325
        },
        {
          "id": "Cl1",
          "element": "Cl",
          "x": 400,
          "y": 221
        },
        {
          "id": "Cl2",
          "element": "Cl",
          "x": 504,
          "y": 429
        },
        {
          "id": "H1",
          "element": "H",
          "x": 400,
          "y": 405
        },
        {
          "id": "H2",
          "element": "H",
          "x": 504,
          "y": 245
        }
      ],
      "electrons": [
        {
          "id": "e439",
          "symbol": "dot",
          "anchor": {
            "kind": "bond",
            "a": "C1",
            "b": "C2",
            "slot": 0
          }
        },
        {
          "id": "e440",
          "symbol": "cross",
          "anchor": {
            "kind": "bond",
            "a": "C1",
            "b": "C2",
            "slot": 1
          }
        },
        {
          "id": "e441",
          "symbol": "dot",
          "anchor": {
            "kind": "bond",
            "a": "C1",
            "b": "C2",
            "slot": 2
          }
        },
        {
          "id": "e442",
          "symbol": "cross",
          "anchor": {
            "kind": "bond",
            "a": "C1",
            "b": "C2",
            "slot": 3
          }
        },
        {
          "id": "e443",
          "symbol": "dot",
          "anchor": {
            "kind": "bond",
            "a": "C1",
            "b": "Cl1",
            "slot": 0
          }
        },
        {
          "id": "e444",
          "symbol": "cross",
          "anchor": {
            "kind": "bond",
            "a": "C1",
            "b": "Cl1",
            "slot": 1
          }
        },
        {
          "id": "e445",
          "symbol": "dot",
          "anchor": {
            "kind": "bond",
            "a": "C2",
            "b": "Cl2",
            "slot": 0
          }
        },
        {
          "id": "e446",
          "symbol": "cross",
          "anchor": {
            "kind": "bond",
            "a": "C2",
            "b": "Cl2",
            "slot": 1
          }
        },
        {
          "id": "e447",
          "symbol": "dot",
          "anchor": {
            "kind": "bond",
            "a": "C1",
            "b": "H1",
            "slot": 0
          }
        },
        {
          "id": "e448",
          "symbol": "cross",
          "anchor": {
            "kind": "bond",
            "a": "C1",
            "b": "H1",
            "slot": 1
          }
        },
        {
          "id": "e449",
          "symbol": "dot",
          "anchor": {
            "kind": "bond",
            "a": "C2",
            "b": "H2",
            "slot": 0
          }
        },
        {
          "id": "e450",
          "symbol": "cross",
          "anchor": {
            "kind": "bond",
            "a": "C2",
            "b": "H2",
            "slot": 1
          }
        },
        {
          "id": "e451",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "Cl1",
            "slot": 0
          }
        },
        {
          "id": "e452",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "Cl1",
            "slot": 1
          }
        },
        {
          "id": "e453",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "Cl1",
            "slot": 2
          }
        },
        {
          "id": "e454",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "Cl1",
            "slot": 3
          }
        },
        {
          "id": "e455",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "Cl1",
            "slot": 4
          }
        },
        {
          "id": "e456",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "Cl1",
            "slot": 5
          }
        },
        {
          "id": "e457",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "Cl2",
            "slot": 0
          }
        },
        {
          "id": "e458",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "Cl2",
            "slot": 1
          }
        },
        {
          "id": "e459",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "Cl2",
            "slot": 2
          }
        },
        {
          "id": "e460",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "Cl2",
            "slot": 3
          }
        },
        {
          "id": "e461",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "Cl2",
            "slot": 4
          }
        },
        {
          "id": "e462",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "Cl2",
            "slot": 5
          }
        }
      ],
      "groups": []
    },
    "viewBox": {
      "width": 1000,
      "height": 650,
      "atomRadius": 64,
      "hydrogenRadius": 40,
      "bondLength": 104,
      "shellOverlap": 24
    },
    "electronSlots": {
      "atom": {
        "directions": [
          -100,
          -80,
          -10,
          10,
          80,
          100,
          170,
          190
        ],
        "radius": 64,
        "hydrogenRadius": 40
      },
      "bond": {
        "maxPairs": 3,
        "centredInOverlap": true,
        "perpendicularOffsets": [
          -5,
          5
        ],
        "pairSpacing": 22
      }
    },
    "marking": {
      "cationShells": "empty-or-retained-full-shell",
      "geometryChecked": false,
      "speciesSpecific": false
    },
    "prerequisiteOrder": 31
  },
  {
    "id": "ethanol",
    "name": "Ethanol",
    "formula": "C2H6O",
    "displayFormula": "C2H6O",
    "totalCharge": 0,
    "namedSpecies": false,
    "category": "covalent",
    "practiceCategory": "covalent",
    "extension": false,
    "grades": [
      3
    ],
    "scope": "specification",
    "atlasEvidence": null,
    "smiles": "CCO",
    "prompt": "Draw any valid neutral isomer with this molecular formula, as one connected molecule. Show outer-shell electrons only. Each shared pair needs one dot and one cross; use one symbol for the non-bonding electrons on each atom. Inner shells and molecular shape are not assessed.",
    "explanation": "Shared pairs contain one electron from each atom. Hydrogen has two electrons around it; shared and non-bonding electrons give every other atom eight. Bonds: 1 × C–C (1 shared pair); 1 × C–O (1 shared pair); 5 × C–H (1 shared pair); 1 × H–O (1 shared pair). Non-bonding inventory: 1 × O: 4 non-bonding electrons.",
    "sourceRefs": [
      "Edexcel International GCSE Chemistry specification Issue 3 (September 2024), sections 1.40 and 1.46; accessed 2026-09-12",
      "https://qualifications.pearson.com/content/dam/pdf/International%20GCSE/Chemistry/2017/specification-and-sample-assessments/international-gcse-chemistry-2017-specification.pdf"
    ],
    "reference": {
      "atoms": [
        {
          "id": "C1",
          "element": "C",
          "x": 350,
          "y": 325
        },
        {
          "id": "C2",
          "element": "C",
          "x": 454,
          "y": 325
        },
        {
          "id": "O1",
          "element": "O",
          "x": 558,
          "y": 325
        },
        {
          "id": "H1",
          "element": "H",
          "x": 270,
          "y": 325
        },
        {
          "id": "H2",
          "element": "H",
          "x": 350,
          "y": 405
        },
        {
          "id": "H3",
          "element": "H",
          "x": 350,
          "y": 245
        },
        {
          "id": "H4",
          "element": "H",
          "x": 454,
          "y": 245
        },
        {
          "id": "H5",
          "element": "H",
          "x": 454,
          "y": 405
        },
        {
          "id": "H6",
          "element": "H",
          "x": 638,
          "y": 325
        }
      ],
      "electrons": [
        {
          "id": "e463",
          "symbol": "dot",
          "anchor": {
            "kind": "bond",
            "a": "C1",
            "b": "C2",
            "slot": 0
          }
        },
        {
          "id": "e464",
          "symbol": "cross",
          "anchor": {
            "kind": "bond",
            "a": "C1",
            "b": "C2",
            "slot": 1
          }
        },
        {
          "id": "e465",
          "symbol": "dot",
          "anchor": {
            "kind": "bond",
            "a": "C2",
            "b": "O1",
            "slot": 0
          }
        },
        {
          "id": "e466",
          "symbol": "cross",
          "anchor": {
            "kind": "bond",
            "a": "C2",
            "b": "O1",
            "slot": 1
          }
        },
        {
          "id": "e467",
          "symbol": "dot",
          "anchor": {
            "kind": "bond",
            "a": "C1",
            "b": "H1",
            "slot": 0
          }
        },
        {
          "id": "e468",
          "symbol": "cross",
          "anchor": {
            "kind": "bond",
            "a": "C1",
            "b": "H1",
            "slot": 1
          }
        },
        {
          "id": "e469",
          "symbol": "dot",
          "anchor": {
            "kind": "bond",
            "a": "C1",
            "b": "H2",
            "slot": 0
          }
        },
        {
          "id": "e470",
          "symbol": "cross",
          "anchor": {
            "kind": "bond",
            "a": "C1",
            "b": "H2",
            "slot": 1
          }
        },
        {
          "id": "e471",
          "symbol": "dot",
          "anchor": {
            "kind": "bond",
            "a": "C1",
            "b": "H3",
            "slot": 0
          }
        },
        {
          "id": "e472",
          "symbol": "cross",
          "anchor": {
            "kind": "bond",
            "a": "C1",
            "b": "H3",
            "slot": 1
          }
        },
        {
          "id": "e473",
          "symbol": "dot",
          "anchor": {
            "kind": "bond",
            "a": "C2",
            "b": "H4",
            "slot": 0
          }
        },
        {
          "id": "e474",
          "symbol": "cross",
          "anchor": {
            "kind": "bond",
            "a": "C2",
            "b": "H4",
            "slot": 1
          }
        },
        {
          "id": "e475",
          "symbol": "dot",
          "anchor": {
            "kind": "bond",
            "a": "C2",
            "b": "H5",
            "slot": 0
          }
        },
        {
          "id": "e476",
          "symbol": "cross",
          "anchor": {
            "kind": "bond",
            "a": "C2",
            "b": "H5",
            "slot": 1
          }
        },
        {
          "id": "e477",
          "symbol": "dot",
          "anchor": {
            "kind": "bond",
            "a": "O1",
            "b": "H6",
            "slot": 0
          }
        },
        {
          "id": "e478",
          "symbol": "cross",
          "anchor": {
            "kind": "bond",
            "a": "O1",
            "b": "H6",
            "slot": 1
          }
        },
        {
          "id": "e479",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "O1",
            "slot": 0
          }
        },
        {
          "id": "e480",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "O1",
            "slot": 1
          }
        },
        {
          "id": "e481",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "O1",
            "slot": 4
          }
        },
        {
          "id": "e482",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "O1",
            "slot": 5
          }
        }
      ],
      "groups": []
    },
    "viewBox": {
      "width": 1000,
      "height": 650,
      "atomRadius": 64,
      "hydrogenRadius": 40,
      "bondLength": 104,
      "shellOverlap": 24
    },
    "electronSlots": {
      "atom": {
        "directions": [
          -100,
          -80,
          -10,
          10,
          80,
          100,
          170,
          190
        ],
        "radius": 64,
        "hydrogenRadius": 40
      },
      "bond": {
        "maxPairs": 3,
        "centredInOverlap": true,
        "perpendicularOffsets": [
          -5,
          5
        ],
        "pairSpacing": 22
      }
    },
    "marking": {
      "cationShells": "empty-or-retained-full-shell",
      "geometryChecked": false,
      "speciesSpecific": false
    },
    "prerequisiteOrder": 32
  },
  {
    "id": "dimethylether",
    "name": "Dimethyl ether",
    "formula": "C2H6O",
    "displayFormula": "C2H6O",
    "totalCharge": 0,
    "namedSpecies": false,
    "category": "covalent",
    "practiceCategory": "covalent",
    "extension": false,
    "grades": [
      3
    ],
    "scope": "specification",
    "atlasEvidence": null,
    "smiles": "COC",
    "prompt": "Draw any valid neutral isomer with this molecular formula, as one connected molecule. Show outer-shell electrons only. Each shared pair needs one dot and one cross; use one symbol for the non-bonding electrons on each atom. Inner shells and molecular shape are not assessed.",
    "explanation": "Shared pairs contain one electron from each atom. Hydrogen has two electrons around it; shared and non-bonding electrons give every other atom eight. Bonds: 2 × C–O (1 shared pair); 6 × C–H (1 shared pair). Non-bonding inventory: 1 × O: 4 non-bonding electrons.",
    "sourceRefs": [
      "Edexcel International GCSE Chemistry specification Issue 3 (September 2024), sections 1.40 and 1.46; accessed 2026-09-12",
      "https://qualifications.pearson.com/content/dam/pdf/International%20GCSE/Chemistry/2017/specification-and-sample-assessments/international-gcse-chemistry-2017-specification.pdf"
    ],
    "reference": {
      "atoms": [
        {
          "id": "C1",
          "element": "C",
          "x": 350,
          "y": 325
        },
        {
          "id": "O1",
          "element": "O",
          "x": 454,
          "y": 325
        },
        {
          "id": "C2",
          "element": "C",
          "x": 558,
          "y": 325
        },
        {
          "id": "H1",
          "element": "H",
          "x": 270,
          "y": 325
        },
        {
          "id": "H2",
          "element": "H",
          "x": 350,
          "y": 405
        },
        {
          "id": "H3",
          "element": "H",
          "x": 350,
          "y": 245
        },
        {
          "id": "H4",
          "element": "H",
          "x": 638,
          "y": 325
        },
        {
          "id": "H5",
          "element": "H",
          "x": 558,
          "y": 405
        },
        {
          "id": "H6",
          "element": "H",
          "x": 558,
          "y": 245
        }
      ],
      "electrons": [
        {
          "id": "e483",
          "symbol": "dot",
          "anchor": {
            "kind": "bond",
            "a": "C1",
            "b": "O1",
            "slot": 0
          }
        },
        {
          "id": "e484",
          "symbol": "cross",
          "anchor": {
            "kind": "bond",
            "a": "C1",
            "b": "O1",
            "slot": 1
          }
        },
        {
          "id": "e485",
          "symbol": "dot",
          "anchor": {
            "kind": "bond",
            "a": "O1",
            "b": "C2",
            "slot": 0
          }
        },
        {
          "id": "e486",
          "symbol": "cross",
          "anchor": {
            "kind": "bond",
            "a": "O1",
            "b": "C2",
            "slot": 1
          }
        },
        {
          "id": "e487",
          "symbol": "dot",
          "anchor": {
            "kind": "bond",
            "a": "C1",
            "b": "H1",
            "slot": 0
          }
        },
        {
          "id": "e488",
          "symbol": "cross",
          "anchor": {
            "kind": "bond",
            "a": "C1",
            "b": "H1",
            "slot": 1
          }
        },
        {
          "id": "e489",
          "symbol": "dot",
          "anchor": {
            "kind": "bond",
            "a": "C1",
            "b": "H2",
            "slot": 0
          }
        },
        {
          "id": "e490",
          "symbol": "cross",
          "anchor": {
            "kind": "bond",
            "a": "C1",
            "b": "H2",
            "slot": 1
          }
        },
        {
          "id": "e491",
          "symbol": "dot",
          "anchor": {
            "kind": "bond",
            "a": "C1",
            "b": "H3",
            "slot": 0
          }
        },
        {
          "id": "e492",
          "symbol": "cross",
          "anchor": {
            "kind": "bond",
            "a": "C1",
            "b": "H3",
            "slot": 1
          }
        },
        {
          "id": "e493",
          "symbol": "dot",
          "anchor": {
            "kind": "bond",
            "a": "C2",
            "b": "H4",
            "slot": 0
          }
        },
        {
          "id": "e494",
          "symbol": "cross",
          "anchor": {
            "kind": "bond",
            "a": "C2",
            "b": "H4",
            "slot": 1
          }
        },
        {
          "id": "e495",
          "symbol": "dot",
          "anchor": {
            "kind": "bond",
            "a": "C2",
            "b": "H5",
            "slot": 0
          }
        },
        {
          "id": "e496",
          "symbol": "cross",
          "anchor": {
            "kind": "bond",
            "a": "C2",
            "b": "H5",
            "slot": 1
          }
        },
        {
          "id": "e497",
          "symbol": "dot",
          "anchor": {
            "kind": "bond",
            "a": "C2",
            "b": "H6",
            "slot": 0
          }
        },
        {
          "id": "e498",
          "symbol": "cross",
          "anchor": {
            "kind": "bond",
            "a": "C2",
            "b": "H6",
            "slot": 1
          }
        },
        {
          "id": "e499",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "O1",
            "slot": 0
          }
        },
        {
          "id": "e500",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "O1",
            "slot": 1
          }
        },
        {
          "id": "e501",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "O1",
            "slot": 4
          }
        },
        {
          "id": "e502",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "O1",
            "slot": 5
          }
        }
      ],
      "groups": []
    },
    "viewBox": {
      "width": 1000,
      "height": 650,
      "atomRadius": 64,
      "hydrogenRadius": 40,
      "bondLength": 104,
      "shellOverlap": 24
    },
    "electronSlots": {
      "atom": {
        "directions": [
          -100,
          -80,
          -10,
          10,
          80,
          100,
          170,
          190
        ],
        "radius": 64,
        "hydrogenRadius": 40
      },
      "bond": {
        "maxPairs": 3,
        "centredInOverlap": true,
        "perpendicularOffsets": [
          -5,
          5
        ],
        "pairSpacing": 22
      }
    },
    "marking": {
      "cationShells": "empty-or-retained-full-shell",
      "geometryChecked": false,
      "speciesSpecific": false
    },
    "prerequisiteOrder": 33
  },
  {
    "id": "ethanal",
    "name": "Ethanal",
    "formula": "C2H4O",
    "displayFormula": "C2H4O",
    "totalCharge": 0,
    "namedSpecies": false,
    "category": "covalent",
    "practiceCategory": "covalent",
    "extension": false,
    "grades": [
      3
    ],
    "scope": "specification",
    "atlasEvidence": null,
    "smiles": "CC=O",
    "prompt": "Draw any valid neutral isomer with this molecular formula, as one connected molecule. Show outer-shell electrons only. Each shared pair needs one dot and one cross; use one symbol for the non-bonding electrons on each atom. Inner shells and molecular shape are not assessed.",
    "explanation": "Shared pairs contain one electron from each atom. Hydrogen has two electrons around it; shared and non-bonding electrons give every other atom eight. Bonds: 1 × C–C (1 shared pair); 1 × C–O (2 shared pairs); 4 × C–H (1 shared pair). Non-bonding inventory: 1 × O: 4 non-bonding electrons.",
    "sourceRefs": [
      "Edexcel International GCSE Chemistry specification Issue 3 (September 2024), sections 1.40 and 1.46; accessed 2026-09-12",
      "https://qualifications.pearson.com/content/dam/pdf/International%20GCSE/Chemistry/2017/specification-and-sample-assessments/international-gcse-chemistry-2017-specification.pdf"
    ],
    "reference": {
      "atoms": [
        {
          "id": "C1",
          "element": "C",
          "x": 350,
          "y": 325
        },
        {
          "id": "C2",
          "element": "C",
          "x": 454,
          "y": 325
        },
        {
          "id": "O1",
          "element": "O",
          "x": 558,
          "y": 325
        },
        {
          "id": "H1",
          "element": "H",
          "x": 270,
          "y": 325
        },
        {
          "id": "H2",
          "element": "H",
          "x": 350,
          "y": 405
        },
        {
          "id": "H3",
          "element": "H",
          "x": 350,
          "y": 245
        },
        {
          "id": "H4",
          "element": "H",
          "x": 454,
          "y": 405
        }
      ],
      "electrons": [
        {
          "id": "e503",
          "symbol": "dot",
          "anchor": {
            "kind": "bond",
            "a": "C1",
            "b": "C2",
            "slot": 0
          }
        },
        {
          "id": "e504",
          "symbol": "cross",
          "anchor": {
            "kind": "bond",
            "a": "C1",
            "b": "C2",
            "slot": 1
          }
        },
        {
          "id": "e505",
          "symbol": "dot",
          "anchor": {
            "kind": "bond",
            "a": "C2",
            "b": "O1",
            "slot": 0
          }
        },
        {
          "id": "e506",
          "symbol": "cross",
          "anchor": {
            "kind": "bond",
            "a": "C2",
            "b": "O1",
            "slot": 1
          }
        },
        {
          "id": "e507",
          "symbol": "dot",
          "anchor": {
            "kind": "bond",
            "a": "C2",
            "b": "O1",
            "slot": 2
          }
        },
        {
          "id": "e508",
          "symbol": "cross",
          "anchor": {
            "kind": "bond",
            "a": "C2",
            "b": "O1",
            "slot": 3
          }
        },
        {
          "id": "e509",
          "symbol": "dot",
          "anchor": {
            "kind": "bond",
            "a": "C1",
            "b": "H1",
            "slot": 0
          }
        },
        {
          "id": "e510",
          "symbol": "cross",
          "anchor": {
            "kind": "bond",
            "a": "C1",
            "b": "H1",
            "slot": 1
          }
        },
        {
          "id": "e511",
          "symbol": "dot",
          "anchor": {
            "kind": "bond",
            "a": "C1",
            "b": "H2",
            "slot": 0
          }
        },
        {
          "id": "e512",
          "symbol": "cross",
          "anchor": {
            "kind": "bond",
            "a": "C1",
            "b": "H2",
            "slot": 1
          }
        },
        {
          "id": "e513",
          "symbol": "dot",
          "anchor": {
            "kind": "bond",
            "a": "C1",
            "b": "H3",
            "slot": 0
          }
        },
        {
          "id": "e514",
          "symbol": "cross",
          "anchor": {
            "kind": "bond",
            "a": "C1",
            "b": "H3",
            "slot": 1
          }
        },
        {
          "id": "e515",
          "symbol": "dot",
          "anchor": {
            "kind": "bond",
            "a": "C2",
            "b": "H4",
            "slot": 0
          }
        },
        {
          "id": "e516",
          "symbol": "cross",
          "anchor": {
            "kind": "bond",
            "a": "C2",
            "b": "H4",
            "slot": 1
          }
        },
        {
          "id": "e517",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "O1",
            "slot": 0
          }
        },
        {
          "id": "e518",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "O1",
            "slot": 1
          }
        },
        {
          "id": "e519",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "O1",
            "slot": 4
          }
        },
        {
          "id": "e520",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "O1",
            "slot": 5
          }
        }
      ],
      "groups": []
    },
    "viewBox": {
      "width": 1000,
      "height": 650,
      "atomRadius": 64,
      "hydrogenRadius": 40,
      "bondLength": 104,
      "shellOverlap": 24
    },
    "electronSlots": {
      "atom": {
        "directions": [
          -100,
          -80,
          -10,
          10,
          80,
          100,
          170,
          190
        ],
        "radius": 64,
        "hydrogenRadius": 40
      },
      "bond": {
        "maxPairs": 3,
        "centredInOverlap": true,
        "perpendicularOffsets": [
          -5,
          5
        ],
        "pairSpacing": 22
      }
    },
    "marking": {
      "cationShells": "empty-or-retained-full-shell",
      "geometryChecked": false,
      "speciesSpecific": false
    },
    "prerequisiteOrder": 34
  },
  {
    "id": "ethanoic-acid",
    "name": "Ethanoic acid",
    "formula": "C2H4O2",
    "displayFormula": "C2H4O2",
    "totalCharge": 0,
    "namedSpecies": false,
    "category": "covalent",
    "practiceCategory": "covalent",
    "extension": false,
    "grades": [
      3
    ],
    "scope": "specification",
    "atlasEvidence": null,
    "smiles": "CC(=O)O",
    "prompt": "Draw any valid neutral isomer with this molecular formula, as one connected molecule. Show outer-shell electrons only. Each shared pair needs one dot and one cross; use one symbol for the non-bonding electrons on each atom. Inner shells and molecular shape are not assessed.",
    "explanation": "Shared pairs contain one electron from each atom. Hydrogen has two electrons around it; shared and non-bonding electrons give every other atom eight. Bonds: 1 × C–C (1 shared pair); 1 × C–O (2 shared pairs); 1 × C–O (1 shared pair); 1 × H–O (1 shared pair); 3 × C–H (1 shared pair). Non-bonding inventory: 2 × O: 4 non-bonding electrons.",
    "sourceRefs": [
      "Edexcel International GCSE Chemistry specification Issue 3 (September 2024), sections 1.40 and 1.46; accessed 2026-09-12",
      "https://qualifications.pearson.com/content/dam/pdf/International%20GCSE/Chemistry/2017/specification-and-sample-assessments/international-gcse-chemistry-2017-specification.pdf"
    ],
    "reference": {
      "atoms": [
        {
          "id": "C1",
          "element": "C",
          "x": 350,
          "y": 325
        },
        {
          "id": "C2",
          "element": "C",
          "x": 454,
          "y": 325
        },
        {
          "id": "O1",
          "element": "O",
          "x": 558,
          "y": 325
        },
        {
          "id": "O2",
          "element": "O",
          "x": 454,
          "y": 429
        },
        {
          "id": "H1",
          "element": "H",
          "x": 270,
          "y": 325
        },
        {
          "id": "H2",
          "element": "H",
          "x": 350,
          "y": 405
        },
        {
          "id": "H3",
          "element": "H",
          "x": 350,
          "y": 245
        },
        {
          "id": "H4",
          "element": "H",
          "x": 454,
          "y": 509
        }
      ],
      "electrons": [
        {
          "id": "e521",
          "symbol": "dot",
          "anchor": {
            "kind": "bond",
            "a": "C1",
            "b": "C2",
            "slot": 0
          }
        },
        {
          "id": "e522",
          "symbol": "cross",
          "anchor": {
            "kind": "bond",
            "a": "C1",
            "b": "C2",
            "slot": 1
          }
        },
        {
          "id": "e523",
          "symbol": "dot",
          "anchor": {
            "kind": "bond",
            "a": "C2",
            "b": "O1",
            "slot": 0
          }
        },
        {
          "id": "e524",
          "symbol": "cross",
          "anchor": {
            "kind": "bond",
            "a": "C2",
            "b": "O1",
            "slot": 1
          }
        },
        {
          "id": "e525",
          "symbol": "dot",
          "anchor": {
            "kind": "bond",
            "a": "C2",
            "b": "O1",
            "slot": 2
          }
        },
        {
          "id": "e526",
          "symbol": "cross",
          "anchor": {
            "kind": "bond",
            "a": "C2",
            "b": "O1",
            "slot": 3
          }
        },
        {
          "id": "e527",
          "symbol": "dot",
          "anchor": {
            "kind": "bond",
            "a": "C2",
            "b": "O2",
            "slot": 0
          }
        },
        {
          "id": "e528",
          "symbol": "cross",
          "anchor": {
            "kind": "bond",
            "a": "C2",
            "b": "O2",
            "slot": 1
          }
        },
        {
          "id": "e529",
          "symbol": "dot",
          "anchor": {
            "kind": "bond",
            "a": "O2",
            "b": "H4",
            "slot": 0
          }
        },
        {
          "id": "e530",
          "symbol": "cross",
          "anchor": {
            "kind": "bond",
            "a": "O2",
            "b": "H4",
            "slot": 1
          }
        },
        {
          "id": "e531",
          "symbol": "dot",
          "anchor": {
            "kind": "bond",
            "a": "C1",
            "b": "H1",
            "slot": 0
          }
        },
        {
          "id": "e532",
          "symbol": "cross",
          "anchor": {
            "kind": "bond",
            "a": "C1",
            "b": "H1",
            "slot": 1
          }
        },
        {
          "id": "e533",
          "symbol": "dot",
          "anchor": {
            "kind": "bond",
            "a": "C1",
            "b": "H2",
            "slot": 0
          }
        },
        {
          "id": "e534",
          "symbol": "cross",
          "anchor": {
            "kind": "bond",
            "a": "C1",
            "b": "H2",
            "slot": 1
          }
        },
        {
          "id": "e535",
          "symbol": "dot",
          "anchor": {
            "kind": "bond",
            "a": "C1",
            "b": "H3",
            "slot": 0
          }
        },
        {
          "id": "e536",
          "symbol": "cross",
          "anchor": {
            "kind": "bond",
            "a": "C1",
            "b": "H3",
            "slot": 1
          }
        },
        {
          "id": "e537",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "O1",
            "slot": 0
          }
        },
        {
          "id": "e538",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "O1",
            "slot": 1
          }
        },
        {
          "id": "e539",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "O1",
            "slot": 4
          }
        },
        {
          "id": "e540",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "O1",
            "slot": 5
          }
        },
        {
          "id": "e541",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "O2",
            "slot": 0
          }
        },
        {
          "id": "e542",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "O2",
            "slot": 1
          }
        },
        {
          "id": "e543",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "O2",
            "slot": 4
          }
        },
        {
          "id": "e544",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "O2",
            "slot": 5
          }
        }
      ],
      "groups": []
    },
    "viewBox": {
      "width": 1000,
      "height": 650,
      "atomRadius": 64,
      "hydrogenRadius": 40,
      "bondLength": 104,
      "shellOverlap": 24
    },
    "electronSlots": {
      "atom": {
        "directions": [
          -100,
          -80,
          -10,
          10,
          80,
          100,
          170,
          190
        ],
        "radius": 64,
        "hydrogenRadius": 40
      },
      "bond": {
        "maxPairs": 3,
        "centredInOverlap": true,
        "perpendicularOffsets": [
          -5,
          5
        ],
        "pairSpacing": 22
      }
    },
    "marking": {
      "cationShells": "empty-or-retained-full-shell",
      "geometryChecked": false,
      "speciesSpecific": false
    },
    "prerequisiteOrder": 35
  },
  {
    "id": "sih4",
    "name": "Silane",
    "formula": "SiH4",
    "displayFormula": "SiH4",
    "totalCharge": 0,
    "namedSpecies": false,
    "category": "covalent",
    "practiceCategory": "covalent",
    "extension": false,
    "grades": [
      2
    ],
    "scope": "specification",
    "atlasEvidence": [
      {
        "questionId": "2022-june-1r-q6b",
        "observedBand": "5-6",
        "basis": "resources/past-paper-atlas/data/atlas.json classification.band",
        "relationship": "diagram motif; original practice prompt"
      }
    ],
    "smiles": "[SiH4]",
    "prompt": "Draw any valid neutral isomer with this molecular formula, as one connected molecule. Show outer-shell electrons only. Each shared pair needs one dot and one cross; use one symbol for the non-bonding electrons on each atom. Inner shells and molecular shape are not assessed.",
    "explanation": "Shared pairs contain one electron from each atom. Hydrogen has two electrons around it; shared and non-bonding electrons give every other atom eight. Bonds: 4 × H–Si (1 shared pair). No non-bonding electrons.",
    "sourceRefs": [
      "Edexcel International GCSE Chemistry specification Issue 3 (September 2024), sections 1.40 and 1.46; accessed 2026-09-12",
      "https://qualifications.pearson.com/content/dam/pdf/International%20GCSE/Chemistry/2017/specification-and-sample-assessments/international-gcse-chemistry-2017-specification.pdf",
      "resources/past-paper-atlas/data/atlas.json#2022-june-1r-q6b"
    ],
    "reference": {
      "atoms": [
        {
          "id": "Si1",
          "element": "Si",
          "x": 500,
          "y": 325
        },
        {
          "id": "H1",
          "element": "H",
          "x": 420,
          "y": 325
        },
        {
          "id": "H2",
          "element": "H",
          "x": 580,
          "y": 325
        },
        {
          "id": "H3",
          "element": "H",
          "x": 500,
          "y": 245
        },
        {
          "id": "H4",
          "element": "H",
          "x": 500,
          "y": 405
        }
      ],
      "electrons": [
        {
          "id": "e545",
          "symbol": "dot",
          "anchor": {
            "kind": "bond",
            "a": "Si1",
            "b": "H1",
            "slot": 0
          }
        },
        {
          "id": "e546",
          "symbol": "cross",
          "anchor": {
            "kind": "bond",
            "a": "Si1",
            "b": "H1",
            "slot": 1
          }
        },
        {
          "id": "e547",
          "symbol": "dot",
          "anchor": {
            "kind": "bond",
            "a": "Si1",
            "b": "H2",
            "slot": 0
          }
        },
        {
          "id": "e548",
          "symbol": "cross",
          "anchor": {
            "kind": "bond",
            "a": "Si1",
            "b": "H2",
            "slot": 1
          }
        },
        {
          "id": "e549",
          "symbol": "dot",
          "anchor": {
            "kind": "bond",
            "a": "Si1",
            "b": "H3",
            "slot": 0
          }
        },
        {
          "id": "e550",
          "symbol": "cross",
          "anchor": {
            "kind": "bond",
            "a": "Si1",
            "b": "H3",
            "slot": 1
          }
        },
        {
          "id": "e551",
          "symbol": "dot",
          "anchor": {
            "kind": "bond",
            "a": "Si1",
            "b": "H4",
            "slot": 0
          }
        },
        {
          "id": "e552",
          "symbol": "cross",
          "anchor": {
            "kind": "bond",
            "a": "Si1",
            "b": "H4",
            "slot": 1
          }
        }
      ],
      "groups": []
    },
    "viewBox": {
      "width": 1000,
      "height": 650,
      "atomRadius": 64,
      "hydrogenRadius": 40,
      "bondLength": 104,
      "shellOverlap": 24
    },
    "electronSlots": {
      "atom": {
        "directions": [
          -100,
          -80,
          -10,
          10,
          80,
          100,
          170,
          190
        ],
        "radius": 64,
        "hydrogenRadius": 40
      },
      "bond": {
        "maxPairs": 3,
        "centredInOverlap": true,
        "perpendicularOffsets": [
          -5,
          5
        ],
        "pairSpacing": 22
      }
    },
    "marking": {
      "cationShells": "empty-or-retained-full-shell",
      "geometryChecked": false,
      "speciesSpecific": false
    },
    "prerequisiteOrder": 36
  },
  {
    "id": "methanoic-acid",
    "name": "Methanoic acid",
    "formula": "CH2O2",
    "displayFormula": "CH2O2",
    "totalCharge": 0,
    "namedSpecies": false,
    "category": "covalent",
    "practiceCategory": "covalent",
    "extension": false,
    "grades": [
      2,
      3
    ],
    "scope": "specification",
    "atlasEvidence": [
      {
        "questionId": "2023-jan-1r-q5bii",
        "observedBand": "7-8",
        "basis": "resources/past-paper-atlas/data/atlas.json classification.band",
        "relationship": "diagram motif; original practice prompt"
      }
    ],
    "smiles": "O=CO",
    "prompt": "Draw any valid neutral isomer with this molecular formula, as one connected molecule. Show outer-shell electrons only. Each shared pair needs one dot and one cross; use one symbol for the non-bonding electrons on each atom. Inner shells and molecular shape are not assessed.",
    "explanation": "Shared pairs contain one electron from each atom. Hydrogen has two electrons around it; shared and non-bonding electrons give every other atom eight. Bonds: 1 × C–O (2 shared pairs); 1 × C–O (1 shared pair); 1 × C–H (1 shared pair); 1 × H–O (1 shared pair). Non-bonding inventory: 2 × O: 4 non-bonding electrons.",
    "sourceRefs": [
      "Edexcel International GCSE Chemistry specification Issue 3 (September 2024), sections 1.40 and 1.46; accessed 2026-09-12",
      "https://qualifications.pearson.com/content/dam/pdf/International%20GCSE/Chemistry/2017/specification-and-sample-assessments/international-gcse-chemistry-2017-specification.pdf",
      "resources/past-paper-atlas/data/atlas.json#2023-jan-1r-q5bii"
    ],
    "reference": {
      "atoms": [
        {
          "id": "C1",
          "element": "C",
          "x": 500,
          "y": 325
        },
        {
          "id": "O1",
          "element": "O",
          "x": 396,
          "y": 325
        },
        {
          "id": "O2",
          "element": "O",
          "x": 604,
          "y": 325
        },
        {
          "id": "H1",
          "element": "H",
          "x": 500,
          "y": 405
        },
        {
          "id": "H2",
          "element": "H",
          "x": 684,
          "y": 325
        }
      ],
      "electrons": [
        {
          "id": "e553",
          "symbol": "dot",
          "anchor": {
            "kind": "bond",
            "a": "C1",
            "b": "O1",
            "slot": 0
          }
        },
        {
          "id": "e554",
          "symbol": "cross",
          "anchor": {
            "kind": "bond",
            "a": "C1",
            "b": "O1",
            "slot": 1
          }
        },
        {
          "id": "e555",
          "symbol": "dot",
          "anchor": {
            "kind": "bond",
            "a": "C1",
            "b": "O1",
            "slot": 2
          }
        },
        {
          "id": "e556",
          "symbol": "cross",
          "anchor": {
            "kind": "bond",
            "a": "C1",
            "b": "O1",
            "slot": 3
          }
        },
        {
          "id": "e557",
          "symbol": "dot",
          "anchor": {
            "kind": "bond",
            "a": "C1",
            "b": "O2",
            "slot": 0
          }
        },
        {
          "id": "e558",
          "symbol": "cross",
          "anchor": {
            "kind": "bond",
            "a": "C1",
            "b": "O2",
            "slot": 1
          }
        },
        {
          "id": "e559",
          "symbol": "dot",
          "anchor": {
            "kind": "bond",
            "a": "C1",
            "b": "H1",
            "slot": 0
          }
        },
        {
          "id": "e560",
          "symbol": "cross",
          "anchor": {
            "kind": "bond",
            "a": "C1",
            "b": "H1",
            "slot": 1
          }
        },
        {
          "id": "e561",
          "symbol": "dot",
          "anchor": {
            "kind": "bond",
            "a": "O2",
            "b": "H2",
            "slot": 0
          }
        },
        {
          "id": "e562",
          "symbol": "cross",
          "anchor": {
            "kind": "bond",
            "a": "O2",
            "b": "H2",
            "slot": 1
          }
        },
        {
          "id": "e563",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "O1",
            "slot": 0
          }
        },
        {
          "id": "e564",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "O1",
            "slot": 1
          }
        },
        {
          "id": "e565",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "O1",
            "slot": 2
          }
        },
        {
          "id": "e566",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "O1",
            "slot": 3
          }
        },
        {
          "id": "e567",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "O2",
            "slot": 0
          }
        },
        {
          "id": "e568",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "O2",
            "slot": 1
          }
        },
        {
          "id": "e569",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "O2",
            "slot": 2
          }
        },
        {
          "id": "e570",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "O2",
            "slot": 3
          }
        }
      ],
      "groups": []
    },
    "viewBox": {
      "width": 1000,
      "height": 650,
      "atomRadius": 64,
      "hydrogenRadius": 40,
      "bondLength": 104,
      "shellOverlap": 24
    },
    "electronSlots": {
      "atom": {
        "directions": [
          -100,
          -80,
          -10,
          10,
          80,
          100,
          170,
          190
        ],
        "radius": 64,
        "hydrogenRadius": 40
      },
      "bond": {
        "maxPairs": 3,
        "centredInOverlap": true,
        "perpendicularOffsets": [
          -5,
          5
        ],
        "pairSpacing": 22
      }
    },
    "marking": {
      "cationShells": "empty-or-retained-full-shell",
      "geometryChecked": false,
      "speciesSpecific": false
    },
    "prerequisiteOrder": 37
  },
  {
    "id": "propane",
    "name": "Propane",
    "formula": "C3H8",
    "displayFormula": "C3H8",
    "totalCharge": 0,
    "namedSpecies": false,
    "category": "covalent",
    "practiceCategory": "covalent",
    "extension": false,
    "grades": [
      2,
      3
    ],
    "scope": "past-paper-transfer",
    "atlasEvidence": [
      {
        "questionId": "2025-nov-1-q9b",
        "observedBand": "7-8",
        "basis": "resources/past-paper-atlas/data/atlas.json classification.band",
        "relationship": "diagram motif; original practice prompt"
      }
    ],
    "smiles": "CCC",
    "prompt": "Draw any valid neutral isomer with this molecular formula, as one connected molecule. Show outer-shell electrons only. Each shared pair needs one dot and one cross; use one symbol for the non-bonding electrons on each atom. Inner shells and molecular shape are not assessed.",
    "explanation": "Shared pairs contain one electron from each atom. Hydrogen has two electrons around it; shared and non-bonding electrons give every other atom eight. Bonds: 2 × C–C (1 shared pair); 8 × C–H (1 shared pair). No non-bonding electrons.",
    "sourceRefs": [
      "Edexcel International GCSE Chemistry specification Issue 3 (September 2024), sections 1.40 and 1.46; accessed 2026-09-12",
      "https://qualifications.pearson.com/content/dam/pdf/International%20GCSE/Chemistry/2017/specification-and-sample-assessments/international-gcse-chemistry-2017-specification.pdf",
      "resources/past-paper-atlas/data/atlas.json#2025-nov-1-q9b"
    ],
    "reference": {
      "atoms": [
        {
          "id": "C1",
          "element": "C",
          "x": 396,
          "y": 325
        },
        {
          "id": "C2",
          "element": "C",
          "x": 500,
          "y": 325
        },
        {
          "id": "C3",
          "element": "C",
          "x": 604,
          "y": 325
        },
        {
          "id": "H1",
          "element": "H",
          "x": 316,
          "y": 325
        },
        {
          "id": "H2",
          "element": "H",
          "x": 396,
          "y": 245
        },
        {
          "id": "H3",
          "element": "H",
          "x": 396,
          "y": 405
        },
        {
          "id": "H4",
          "element": "H",
          "x": 500,
          "y": 245
        },
        {
          "id": "H5",
          "element": "H",
          "x": 500,
          "y": 405
        },
        {
          "id": "H6",
          "element": "H",
          "x": 684,
          "y": 325
        },
        {
          "id": "H7",
          "element": "H",
          "x": 604,
          "y": 245
        },
        {
          "id": "H8",
          "element": "H",
          "x": 604,
          "y": 405
        }
      ],
      "electrons": [
        {
          "id": "e571",
          "symbol": "dot",
          "anchor": {
            "kind": "bond",
            "a": "C1",
            "b": "C2",
            "slot": 0
          }
        },
        {
          "id": "e572",
          "symbol": "cross",
          "anchor": {
            "kind": "bond",
            "a": "C1",
            "b": "C2",
            "slot": 1
          }
        },
        {
          "id": "e573",
          "symbol": "dot",
          "anchor": {
            "kind": "bond",
            "a": "C2",
            "b": "C3",
            "slot": 0
          }
        },
        {
          "id": "e574",
          "symbol": "cross",
          "anchor": {
            "kind": "bond",
            "a": "C2",
            "b": "C3",
            "slot": 1
          }
        },
        {
          "id": "e575",
          "symbol": "dot",
          "anchor": {
            "kind": "bond",
            "a": "C1",
            "b": "H1",
            "slot": 0
          }
        },
        {
          "id": "e576",
          "symbol": "cross",
          "anchor": {
            "kind": "bond",
            "a": "C1",
            "b": "H1",
            "slot": 1
          }
        },
        {
          "id": "e577",
          "symbol": "dot",
          "anchor": {
            "kind": "bond",
            "a": "C1",
            "b": "H2",
            "slot": 0
          }
        },
        {
          "id": "e578",
          "symbol": "cross",
          "anchor": {
            "kind": "bond",
            "a": "C1",
            "b": "H2",
            "slot": 1
          }
        },
        {
          "id": "e579",
          "symbol": "dot",
          "anchor": {
            "kind": "bond",
            "a": "C1",
            "b": "H3",
            "slot": 0
          }
        },
        {
          "id": "e580",
          "symbol": "cross",
          "anchor": {
            "kind": "bond",
            "a": "C1",
            "b": "H3",
            "slot": 1
          }
        },
        {
          "id": "e581",
          "symbol": "dot",
          "anchor": {
            "kind": "bond",
            "a": "C2",
            "b": "H4",
            "slot": 0
          }
        },
        {
          "id": "e582",
          "symbol": "cross",
          "anchor": {
            "kind": "bond",
            "a": "C2",
            "b": "H4",
            "slot": 1
          }
        },
        {
          "id": "e583",
          "symbol": "dot",
          "anchor": {
            "kind": "bond",
            "a": "C2",
            "b": "H5",
            "slot": 0
          }
        },
        {
          "id": "e584",
          "symbol": "cross",
          "anchor": {
            "kind": "bond",
            "a": "C2",
            "b": "H5",
            "slot": 1
          }
        },
        {
          "id": "e585",
          "symbol": "dot",
          "anchor": {
            "kind": "bond",
            "a": "C3",
            "b": "H6",
            "slot": 0
          }
        },
        {
          "id": "e586",
          "symbol": "cross",
          "anchor": {
            "kind": "bond",
            "a": "C3",
            "b": "H6",
            "slot": 1
          }
        },
        {
          "id": "e587",
          "symbol": "dot",
          "anchor": {
            "kind": "bond",
            "a": "C3",
            "b": "H7",
            "slot": 0
          }
        },
        {
          "id": "e588",
          "symbol": "cross",
          "anchor": {
            "kind": "bond",
            "a": "C3",
            "b": "H7",
            "slot": 1
          }
        },
        {
          "id": "e589",
          "symbol": "dot",
          "anchor": {
            "kind": "bond",
            "a": "C3",
            "b": "H8",
            "slot": 0
          }
        },
        {
          "id": "e590",
          "symbol": "cross",
          "anchor": {
            "kind": "bond",
            "a": "C3",
            "b": "H8",
            "slot": 1
          }
        }
      ],
      "groups": []
    },
    "viewBox": {
      "width": 1000,
      "height": 650,
      "atomRadius": 64,
      "hydrogenRadius": 40,
      "bondLength": 104,
      "shellOverlap": 24
    },
    "electronSlots": {
      "atom": {
        "directions": [
          -100,
          -80,
          -10,
          10,
          80,
          100,
          170,
          190
        ],
        "radius": 64,
        "hydrogenRadius": 40
      },
      "bond": {
        "maxPairs": 3,
        "centredInOverlap": true,
        "perpendicularOffsets": [
          -5,
          5
        ],
        "pairSpacing": 22
      }
    },
    "marking": {
      "cationShells": "empty-or-retained-full-shell",
      "geometryChecked": false,
      "speciesSpecific": false
    },
    "prerequisiteOrder": 38
  },
  {
    "id": "propene",
    "name": "Propene",
    "formula": "C3H6",
    "displayFormula": "C3H6",
    "totalCharge": 0,
    "namedSpecies": false,
    "category": "covalent",
    "practiceCategory": "covalent",
    "extension": false,
    "grades": [
      2,
      3
    ],
    "scope": "past-paper-transfer",
    "atlasEvidence": [
      {
        "questionId": "2023-june-1r-q10ai",
        "observedBand": "7-8",
        "basis": "resources/past-paper-atlas/data/atlas.json classification.band",
        "relationship": "diagram motif; original practice prompt"
      }
    ],
    "smiles": "C=CC",
    "prompt": "Draw any valid neutral isomer with this molecular formula, as one connected molecule. Show outer-shell electrons only. Each shared pair needs one dot and one cross; use one symbol for the non-bonding electrons on each atom. Inner shells and molecular shape are not assessed.",
    "explanation": "Shared pairs contain one electron from each atom. Hydrogen has two electrons around it; shared and non-bonding electrons give every other atom eight. Bonds: 1 × C–C (2 shared pairs); 1 × C–C (1 shared pair); 6 × C–H (1 shared pair). No non-bonding electrons.",
    "sourceRefs": [
      "Edexcel International GCSE Chemistry specification Issue 3 (September 2024), sections 1.40 and 1.46; accessed 2026-09-12",
      "https://qualifications.pearson.com/content/dam/pdf/International%20GCSE/Chemistry/2017/specification-and-sample-assessments/international-gcse-chemistry-2017-specification.pdf",
      "resources/past-paper-atlas/data/atlas.json#2023-june-1r-q10ai"
    ],
    "reference": {
      "atoms": [
        {
          "id": "C1",
          "element": "C",
          "x": 396,
          "y": 325
        },
        {
          "id": "C2",
          "element": "C",
          "x": 500,
          "y": 325
        },
        {
          "id": "C3",
          "element": "C",
          "x": 604,
          "y": 325
        },
        {
          "id": "H1",
          "element": "H",
          "x": 326.73079414043593,
          "y": 284.97779217002966
        },
        {
          "id": "H2",
          "element": "H",
          "x": 326.73079414043593,
          "y": 365.02220782997034
        },
        {
          "id": "H3",
          "element": "H",
          "x": 500,
          "y": 405
        },
        {
          "id": "H4",
          "element": "H",
          "x": 684,
          "y": 325
        },
        {
          "id": "H5",
          "element": "H",
          "x": 604,
          "y": 245
        },
        {
          "id": "H6",
          "element": "H",
          "x": 604,
          "y": 405
        }
      ],
      "electrons": [
        {
          "id": "e591",
          "symbol": "dot",
          "anchor": {
            "kind": "bond",
            "a": "C1",
            "b": "C2",
            "slot": 0
          }
        },
        {
          "id": "e592",
          "symbol": "cross",
          "anchor": {
            "kind": "bond",
            "a": "C1",
            "b": "C2",
            "slot": 1
          }
        },
        {
          "id": "e593",
          "symbol": "dot",
          "anchor": {
            "kind": "bond",
            "a": "C1",
            "b": "C2",
            "slot": 2
          }
        },
        {
          "id": "e594",
          "symbol": "cross",
          "anchor": {
            "kind": "bond",
            "a": "C1",
            "b": "C2",
            "slot": 3
          }
        },
        {
          "id": "e595",
          "symbol": "dot",
          "anchor": {
            "kind": "bond",
            "a": "C2",
            "b": "C3",
            "slot": 0
          }
        },
        {
          "id": "e596",
          "symbol": "cross",
          "anchor": {
            "kind": "bond",
            "a": "C2",
            "b": "C3",
            "slot": 1
          }
        },
        {
          "id": "e597",
          "symbol": "dot",
          "anchor": {
            "kind": "bond",
            "a": "C1",
            "b": "H1",
            "slot": 0
          }
        },
        {
          "id": "e598",
          "symbol": "cross",
          "anchor": {
            "kind": "bond",
            "a": "C1",
            "b": "H1",
            "slot": 1
          }
        },
        {
          "id": "e599",
          "symbol": "dot",
          "anchor": {
            "kind": "bond",
            "a": "C1",
            "b": "H2",
            "slot": 0
          }
        },
        {
          "id": "e600",
          "symbol": "cross",
          "anchor": {
            "kind": "bond",
            "a": "C1",
            "b": "H2",
            "slot": 1
          }
        },
        {
          "id": "e601",
          "symbol": "dot",
          "anchor": {
            "kind": "bond",
            "a": "C2",
            "b": "H3",
            "slot": 0
          }
        },
        {
          "id": "e602",
          "symbol": "cross",
          "anchor": {
            "kind": "bond",
            "a": "C2",
            "b": "H3",
            "slot": 1
          }
        },
        {
          "id": "e603",
          "symbol": "dot",
          "anchor": {
            "kind": "bond",
            "a": "C3",
            "b": "H4",
            "slot": 0
          }
        },
        {
          "id": "e604",
          "symbol": "cross",
          "anchor": {
            "kind": "bond",
            "a": "C3",
            "b": "H4",
            "slot": 1
          }
        },
        {
          "id": "e605",
          "symbol": "dot",
          "anchor": {
            "kind": "bond",
            "a": "C3",
            "b": "H5",
            "slot": 0
          }
        },
        {
          "id": "e606",
          "symbol": "cross",
          "anchor": {
            "kind": "bond",
            "a": "C3",
            "b": "H5",
            "slot": 1
          }
        },
        {
          "id": "e607",
          "symbol": "dot",
          "anchor": {
            "kind": "bond",
            "a": "C3",
            "b": "H6",
            "slot": 0
          }
        },
        {
          "id": "e608",
          "symbol": "cross",
          "anchor": {
            "kind": "bond",
            "a": "C3",
            "b": "H6",
            "slot": 1
          }
        }
      ],
      "groups": []
    },
    "viewBox": {
      "width": 1000,
      "height": 650,
      "atomRadius": 64,
      "hydrogenRadius": 40,
      "bondLength": 104,
      "shellOverlap": 24
    },
    "electronSlots": {
      "atom": {
        "directions": [
          -100,
          -80,
          -10,
          10,
          80,
          100,
          170,
          190
        ],
        "radius": 64,
        "hydrogenRadius": 40
      },
      "bond": {
        "maxPairs": 3,
        "centredInOverlap": true,
        "perpendicularOffsets": [
          -5,
          5
        ],
        "pairSpacing": 22
      }
    },
    "marking": {
      "cationShells": "empty-or-retained-full-shell",
      "geometryChecked": false,
      "speciesSpecific": false
    },
    "prerequisiteOrder": 39
  },
  {
    "id": "nacl",
    "name": "Sodium chloride",
    "formula": "NaCl",
    "displayFormula": "NaCl",
    "totalCharge": 0,
    "namedSpecies": false,
    "category": "ionic",
    "practiceCategory": "ionic",
    "extension": false,
    "grades": [
      1,
      2
    ],
    "scope": "specification",
    "atlasEvidence": null,
    "smiles": null,
    "prompt": "Draw the dot-and-cross diagram for the ions. Metal ions may show an empty former outer shell or a full retained shell: two electrons for Li⁺, eight for the other metals here. Distinguish gained electrons from the anion's own electrons. Use brackets and charges.",
    "explanation": "The metal loses its outer electron(s); those electrons are shown on the non-metal ion, whose brackets and charge identify the ion. No covalent shared pairs. Non-bonding inventory: 1 × Cl: 8 non-bonding electrons.",
    "sourceRefs": [
      "Edexcel International GCSE Chemistry specification Issue 3 (September 2024), sections 1.40 and 1.46; accessed 2026-09-12",
      "https://qualifications.pearson.com/content/dam/pdf/International%20GCSE/Chemistry/2017/specification-and-sample-assessments/international-gcse-chemistry-2017-specification.pdf"
    ],
    "reference": {
      "atoms": [
        {
          "id": "Na1",
          "element": "Na",
          "x": 180,
          "y": 220
        },
        {
          "id": "Cl1",
          "element": "Cl",
          "x": 500,
          "y": 220
        }
      ],
      "electrons": [
        {
          "id": "e609",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "Cl1",
            "slot": 0
          }
        },
        {
          "id": "e610",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "Cl1",
            "slot": 1
          }
        },
        {
          "id": "e611",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "Cl1",
            "slot": 2
          }
        },
        {
          "id": "e612",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "Cl1",
            "slot": 3
          }
        },
        {
          "id": "e613",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "Cl1",
            "slot": 4
          }
        },
        {
          "id": "e614",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "Cl1",
            "slot": 5
          }
        },
        {
          "id": "e615",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "Cl1",
            "slot": 6
          }
        },
        {
          "id": "e616",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "Cl1",
            "slot": 7
          }
        }
      ],
      "groups": [
        {
          "id": "Na1+",
          "atomIds": [
            "Na1"
          ],
          "charge": 1,
          "bracket": true
        },
        {
          "id": "Cl1-",
          "atomIds": [
            "Cl1"
          ],
          "charge": -1,
          "bracket": true
        }
      ]
    },
    "viewBox": {
      "width": 1000,
      "height": 650,
      "atomRadius": 64,
      "hydrogenRadius": 40,
      "bondLength": 104,
      "shellOverlap": 24
    },
    "electronSlots": {
      "atom": {
        "directions": [
          -100,
          -80,
          -10,
          10,
          80,
          100,
          170,
          190
        ],
        "radius": 64,
        "hydrogenRadius": 40
      },
      "bond": {
        "maxPairs": 3,
        "centredInOverlap": true,
        "perpendicularOffsets": [
          -5,
          5
        ],
        "pairSpacing": 22
      }
    },
    "marking": {
      "cationShells": "empty-or-retained-full-shell",
      "geometryChecked": false,
      "speciesSpecific": false
    },
    "prerequisiteOrder": 40
  },
  {
    "id": "mgo",
    "name": "Magnesium oxide",
    "formula": "MgO",
    "displayFormula": "MgO",
    "totalCharge": 0,
    "namedSpecies": false,
    "category": "ionic",
    "practiceCategory": "ionic",
    "extension": false,
    "grades": [
      1,
      2
    ],
    "scope": "specification",
    "atlasEvidence": [
      {
        "questionId": "2025-june-2-q3c",
        "observedBand": "5-6",
        "basis": "resources/past-paper-atlas/data/atlas.json classification.band",
        "relationship": "diagram motif; original practice prompt"
      }
    ],
    "smiles": null,
    "prompt": "Draw the dot-and-cross diagram for the ions. Metal ions may show an empty former outer shell or a full retained shell: two electrons for Li⁺, eight for the other metals here. Distinguish gained electrons from the anion's own electrons. Use brackets and charges.",
    "explanation": "The metal loses its outer electron(s); those electrons are shown on the non-metal ion, whose brackets and charge identify the ion. No covalent shared pairs. Non-bonding inventory: 1 × O: 8 non-bonding electrons.",
    "sourceRefs": [
      "Edexcel International GCSE Chemistry specification Issue 3 (September 2024), sections 1.40 and 1.46; accessed 2026-09-12",
      "https://qualifications.pearson.com/content/dam/pdf/International%20GCSE/Chemistry/2017/specification-and-sample-assessments/international-gcse-chemistry-2017-specification.pdf",
      "resources/past-paper-atlas/data/atlas.json#2025-june-2-q3c"
    ],
    "reference": {
      "atoms": [
        {
          "id": "Mg1",
          "element": "Mg",
          "x": 180,
          "y": 220
        },
        {
          "id": "O1",
          "element": "O",
          "x": 500,
          "y": 220
        }
      ],
      "electrons": [
        {
          "id": "e617",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "O1",
            "slot": 0
          }
        },
        {
          "id": "e618",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "O1",
            "slot": 1
          }
        },
        {
          "id": "e619",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "O1",
            "slot": 2
          }
        },
        {
          "id": "e620",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "O1",
            "slot": 3
          }
        },
        {
          "id": "e621",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "O1",
            "slot": 4
          }
        },
        {
          "id": "e622",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "O1",
            "slot": 5
          }
        },
        {
          "id": "e623",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "O1",
            "slot": 6
          }
        },
        {
          "id": "e624",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "O1",
            "slot": 7
          }
        }
      ],
      "groups": [
        {
          "id": "Mg1+",
          "atomIds": [
            "Mg1"
          ],
          "charge": 2,
          "bracket": true
        },
        {
          "id": "O1-",
          "atomIds": [
            "O1"
          ],
          "charge": -2,
          "bracket": true
        }
      ]
    },
    "viewBox": {
      "width": 1000,
      "height": 650,
      "atomRadius": 64,
      "hydrogenRadius": 40,
      "bondLength": 104,
      "shellOverlap": 24
    },
    "electronSlots": {
      "atom": {
        "directions": [
          -100,
          -80,
          -10,
          10,
          80,
          100,
          170,
          190
        ],
        "radius": 64,
        "hydrogenRadius": 40
      },
      "bond": {
        "maxPairs": 3,
        "centredInOverlap": true,
        "perpendicularOffsets": [
          -5,
          5
        ],
        "pairSpacing": 22
      }
    },
    "marking": {
      "cationShells": "empty-or-retained-full-shell",
      "geometryChecked": false,
      "speciesSpecific": false
    },
    "prerequisiteOrder": 41
  },
  {
    "id": "mgcl2",
    "name": "Magnesium chloride",
    "formula": "MgCl2",
    "displayFormula": "MgCl2",
    "totalCharge": 0,
    "namedSpecies": false,
    "category": "ionic",
    "practiceCategory": "ionic",
    "extension": false,
    "grades": [
      1,
      2
    ],
    "scope": "specification",
    "atlasEvidence": [
      {
        "questionId": "2024-june-1r-q9bii",
        "observedBand": "5-6",
        "basis": "resources/past-paper-atlas/data/atlas.json classification.band",
        "relationship": "diagram motif; original practice prompt"
      }
    ],
    "smiles": null,
    "prompt": "Draw the dot-and-cross diagram for the ions. Metal ions may show an empty former outer shell or a full retained shell: two electrons for Li⁺, eight for the other metals here. Distinguish gained electrons from the anion's own electrons. Use brackets and charges.",
    "explanation": "The metal loses its outer electron(s); those electrons are shown on the non-metal ion, whose brackets and charge identify the ion. No covalent shared pairs. Non-bonding inventory: 2 × Cl: 8 non-bonding electrons.",
    "sourceRefs": [
      "Edexcel International GCSE Chemistry specification Issue 3 (September 2024), sections 1.40 and 1.46; accessed 2026-09-12",
      "https://qualifications.pearson.com/content/dam/pdf/International%20GCSE/Chemistry/2017/specification-and-sample-assessments/international-gcse-chemistry-2017-specification.pdf",
      "resources/past-paper-atlas/data/atlas.json#2024-june-1r-q9bii"
    ],
    "reference": {
      "atoms": [
        {
          "id": "Mg1",
          "element": "Mg",
          "x": 180,
          "y": 220
        },
        {
          "id": "Cl1",
          "element": "Cl",
          "x": 500,
          "y": 220
        },
        {
          "id": "Cl2",
          "element": "Cl",
          "x": 820,
          "y": 220
        }
      ],
      "electrons": [
        {
          "id": "e625",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "Cl1",
            "slot": 0
          }
        },
        {
          "id": "e626",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "Cl1",
            "slot": 1
          }
        },
        {
          "id": "e627",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "Cl1",
            "slot": 2
          }
        },
        {
          "id": "e628",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "Cl1",
            "slot": 3
          }
        },
        {
          "id": "e629",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "Cl1",
            "slot": 4
          }
        },
        {
          "id": "e630",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "Cl1",
            "slot": 5
          }
        },
        {
          "id": "e631",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "Cl1",
            "slot": 6
          }
        },
        {
          "id": "e632",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "Cl1",
            "slot": 7
          }
        },
        {
          "id": "e633",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "Cl2",
            "slot": 0
          }
        },
        {
          "id": "e634",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "Cl2",
            "slot": 1
          }
        },
        {
          "id": "e635",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "Cl2",
            "slot": 2
          }
        },
        {
          "id": "e636",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "Cl2",
            "slot": 3
          }
        },
        {
          "id": "e637",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "Cl2",
            "slot": 4
          }
        },
        {
          "id": "e638",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "Cl2",
            "slot": 5
          }
        },
        {
          "id": "e639",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "Cl2",
            "slot": 6
          }
        },
        {
          "id": "e640",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "Cl2",
            "slot": 7
          }
        }
      ],
      "groups": [
        {
          "id": "Mg1+",
          "atomIds": [
            "Mg1"
          ],
          "charge": 2,
          "bracket": true
        },
        {
          "id": "Cl1-",
          "atomIds": [
            "Cl1"
          ],
          "charge": -1,
          "bracket": true
        },
        {
          "id": "Cl2-",
          "atomIds": [
            "Cl2"
          ],
          "charge": -1,
          "bracket": true
        }
      ]
    },
    "viewBox": {
      "width": 1000,
      "height": 650,
      "atomRadius": 64,
      "hydrogenRadius": 40,
      "bondLength": 104,
      "shellOverlap": 24
    },
    "electronSlots": {
      "atom": {
        "directions": [
          -100,
          -80,
          -10,
          10,
          80,
          100,
          170,
          190
        ],
        "radius": 64,
        "hydrogenRadius": 40
      },
      "bond": {
        "maxPairs": 3,
        "centredInOverlap": true,
        "perpendicularOffsets": [
          -5,
          5
        ],
        "pairSpacing": 22
      }
    },
    "marking": {
      "cationShells": "empty-or-retained-full-shell",
      "geometryChecked": false,
      "speciesSpecific": false
    },
    "prerequisiteOrder": 42
  },
  {
    "id": "na2o",
    "name": "Sodium oxide",
    "formula": "Na2O",
    "displayFormula": "Na2O",
    "totalCharge": 0,
    "namedSpecies": false,
    "category": "ionic",
    "practiceCategory": "ionic",
    "extension": false,
    "grades": [
      1,
      2
    ],
    "scope": "specification",
    "atlasEvidence": [
      {
        "questionId": "2020-jan-1-q4bii",
        "observedBand": "5-6",
        "basis": "resources/past-paper-atlas/data/atlas.json classification.band",
        "relationship": "diagram motif; original practice prompt"
      }
    ],
    "smiles": null,
    "prompt": "Draw the dot-and-cross diagram for the ions. Metal ions may show an empty former outer shell or a full retained shell: two electrons for Li⁺, eight for the other metals here. Distinguish gained electrons from the anion's own electrons. Use brackets and charges.",
    "explanation": "The metal loses its outer electron(s); those electrons are shown on the non-metal ion, whose brackets and charge identify the ion. No covalent shared pairs. Non-bonding inventory: 1 × O: 8 non-bonding electrons.",
    "sourceRefs": [
      "Edexcel International GCSE Chemistry specification Issue 3 (September 2024), sections 1.40 and 1.46; accessed 2026-09-12",
      "https://qualifications.pearson.com/content/dam/pdf/International%20GCSE/Chemistry/2017/specification-and-sample-assessments/international-gcse-chemistry-2017-specification.pdf",
      "resources/past-paper-atlas/data/atlas.json#2020-jan-1-q4bii"
    ],
    "reference": {
      "atoms": [
        {
          "id": "Na1",
          "element": "Na",
          "x": 180,
          "y": 220
        },
        {
          "id": "Na2",
          "element": "Na",
          "x": 500,
          "y": 220
        },
        {
          "id": "O1",
          "element": "O",
          "x": 820,
          "y": 220
        }
      ],
      "electrons": [
        {
          "id": "e641",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "O1",
            "slot": 0
          }
        },
        {
          "id": "e642",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "O1",
            "slot": 1
          }
        },
        {
          "id": "e643",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "O1",
            "slot": 2
          }
        },
        {
          "id": "e644",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "O1",
            "slot": 3
          }
        },
        {
          "id": "e645",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "O1",
            "slot": 4
          }
        },
        {
          "id": "e646",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "O1",
            "slot": 5
          }
        },
        {
          "id": "e647",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "O1",
            "slot": 6
          }
        },
        {
          "id": "e648",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "O1",
            "slot": 7
          }
        }
      ],
      "groups": [
        {
          "id": "Na1+",
          "atomIds": [
            "Na1"
          ],
          "charge": 1,
          "bracket": true
        },
        {
          "id": "Na2+",
          "atomIds": [
            "Na2"
          ],
          "charge": 1,
          "bracket": true
        },
        {
          "id": "O1-",
          "atomIds": [
            "O1"
          ],
          "charge": -2,
          "bracket": true
        }
      ]
    },
    "viewBox": {
      "width": 1000,
      "height": 650,
      "atomRadius": 64,
      "hydrogenRadius": 40,
      "bondLength": 104,
      "shellOverlap": 24
    },
    "electronSlots": {
      "atom": {
        "directions": [
          -100,
          -80,
          -10,
          10,
          80,
          100,
          170,
          190
        ],
        "radius": 64,
        "hydrogenRadius": 40
      },
      "bond": {
        "maxPairs": 3,
        "centredInOverlap": true,
        "perpendicularOffsets": [
          -5,
          5
        ],
        "pairSpacing": 22
      }
    },
    "marking": {
      "cationShells": "empty-or-retained-full-shell",
      "geometryChecked": false,
      "speciesSpecific": false
    },
    "prerequisiteOrder": 43
  },
  {
    "id": "cacl2",
    "name": "Calcium chloride",
    "formula": "CaCl2",
    "displayFormula": "CaCl2",
    "totalCharge": 0,
    "namedSpecies": false,
    "category": "ionic",
    "practiceCategory": "ionic",
    "extension": false,
    "grades": [
      1,
      2
    ],
    "scope": "specification",
    "atlasEvidence": null,
    "smiles": null,
    "prompt": "Draw the dot-and-cross diagram for the ions. Metal ions may show an empty former outer shell or a full retained shell: two electrons for Li⁺, eight for the other metals here. Distinguish gained electrons from the anion's own electrons. Use brackets and charges.",
    "explanation": "The metal loses its outer electron(s); those electrons are shown on the non-metal ion, whose brackets and charge identify the ion. No covalent shared pairs. Non-bonding inventory: 2 × Cl: 8 non-bonding electrons.",
    "sourceRefs": [
      "Edexcel International GCSE Chemistry specification Issue 3 (September 2024), sections 1.40 and 1.46; accessed 2026-09-12",
      "https://qualifications.pearson.com/content/dam/pdf/International%20GCSE/Chemistry/2017/specification-and-sample-assessments/international-gcse-chemistry-2017-specification.pdf"
    ],
    "reference": {
      "atoms": [
        {
          "id": "Ca1",
          "element": "Ca",
          "x": 180,
          "y": 220
        },
        {
          "id": "Cl1",
          "element": "Cl",
          "x": 500,
          "y": 220
        },
        {
          "id": "Cl2",
          "element": "Cl",
          "x": 820,
          "y": 220
        }
      ],
      "electrons": [
        {
          "id": "e649",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "Cl1",
            "slot": 0
          }
        },
        {
          "id": "e650",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "Cl1",
            "slot": 1
          }
        },
        {
          "id": "e651",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "Cl1",
            "slot": 2
          }
        },
        {
          "id": "e652",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "Cl1",
            "slot": 3
          }
        },
        {
          "id": "e653",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "Cl1",
            "slot": 4
          }
        },
        {
          "id": "e654",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "Cl1",
            "slot": 5
          }
        },
        {
          "id": "e655",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "Cl1",
            "slot": 6
          }
        },
        {
          "id": "e656",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "Cl1",
            "slot": 7
          }
        },
        {
          "id": "e657",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "Cl2",
            "slot": 0
          }
        },
        {
          "id": "e658",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "Cl2",
            "slot": 1
          }
        },
        {
          "id": "e659",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "Cl2",
            "slot": 2
          }
        },
        {
          "id": "e660",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "Cl2",
            "slot": 3
          }
        },
        {
          "id": "e661",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "Cl2",
            "slot": 4
          }
        },
        {
          "id": "e662",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "Cl2",
            "slot": 5
          }
        },
        {
          "id": "e663",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "Cl2",
            "slot": 6
          }
        },
        {
          "id": "e664",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "Cl2",
            "slot": 7
          }
        }
      ],
      "groups": [
        {
          "id": "Ca1+",
          "atomIds": [
            "Ca1"
          ],
          "charge": 2,
          "bracket": true
        },
        {
          "id": "Cl1-",
          "atomIds": [
            "Cl1"
          ],
          "charge": -1,
          "bracket": true
        },
        {
          "id": "Cl2-",
          "atomIds": [
            "Cl2"
          ],
          "charge": -1,
          "bracket": true
        }
      ]
    },
    "viewBox": {
      "width": 1000,
      "height": 650,
      "atomRadius": 64,
      "hydrogenRadius": 40,
      "bondLength": 104,
      "shellOverlap": 24
    },
    "electronSlots": {
      "atom": {
        "directions": [
          -100,
          -80,
          -10,
          10,
          80,
          100,
          170,
          190
        ],
        "radius": 64,
        "hydrogenRadius": 40
      },
      "bond": {
        "maxPairs": 3,
        "centredInOverlap": true,
        "perpendicularOffsets": [
          -5,
          5
        ],
        "pairSpacing": 22
      }
    },
    "marking": {
      "cationShells": "empty-or-retained-full-shell",
      "geometryChecked": false,
      "speciesSpecific": false
    },
    "prerequisiteOrder": 44
  },
  {
    "id": "potassium-chloride",
    "name": "Potassium chloride",
    "formula": "KCl",
    "displayFormula": "KCl",
    "totalCharge": 0,
    "namedSpecies": false,
    "category": "ionic",
    "practiceCategory": "ionic",
    "extension": false,
    "grades": [
      1,
      2
    ],
    "scope": "specification",
    "atlasEvidence": null,
    "smiles": null,
    "prompt": "Draw the dot-and-cross diagram for the ions. Metal ions may show an empty former outer shell or a full retained shell: two electrons for Li⁺, eight for the other metals here. Distinguish gained electrons from the anion's own electrons. Use brackets and charges.",
    "explanation": "The metal loses its outer electron(s); those electrons are shown on the non-metal ion, whose brackets and charge identify the ion. No covalent shared pairs. Non-bonding inventory: 1 × Cl: 8 non-bonding electrons.",
    "sourceRefs": [
      "Edexcel International GCSE Chemistry specification Issue 3 (September 2024), sections 1.40 and 1.46; accessed 2026-09-12",
      "https://qualifications.pearson.com/content/dam/pdf/International%20GCSE/Chemistry/2017/specification-and-sample-assessments/international-gcse-chemistry-2017-specification.pdf"
    ],
    "reference": {
      "atoms": [
        {
          "id": "K1",
          "element": "K",
          "x": 180,
          "y": 220
        },
        {
          "id": "Cl1",
          "element": "Cl",
          "x": 500,
          "y": 220
        }
      ],
      "electrons": [
        {
          "id": "e665",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "Cl1",
            "slot": 0
          }
        },
        {
          "id": "e666",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "Cl1",
            "slot": 1
          }
        },
        {
          "id": "e667",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "Cl1",
            "slot": 2
          }
        },
        {
          "id": "e668",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "Cl1",
            "slot": 3
          }
        },
        {
          "id": "e669",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "Cl1",
            "slot": 4
          }
        },
        {
          "id": "e670",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "Cl1",
            "slot": 5
          }
        },
        {
          "id": "e671",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "Cl1",
            "slot": 6
          }
        },
        {
          "id": "e672",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "Cl1",
            "slot": 7
          }
        }
      ],
      "groups": [
        {
          "id": "K1+",
          "atomIds": [
            "K1"
          ],
          "charge": 1,
          "bracket": true
        },
        {
          "id": "Cl1-",
          "atomIds": [
            "Cl1"
          ],
          "charge": -1,
          "bracket": true
        }
      ]
    },
    "viewBox": {
      "width": 1000,
      "height": 650,
      "atomRadius": 64,
      "hydrogenRadius": 40,
      "bondLength": 104,
      "shellOverlap": 24
    },
    "electronSlots": {
      "atom": {
        "directions": [
          -100,
          -80,
          -10,
          10,
          80,
          100,
          170,
          190
        ],
        "radius": 64,
        "hydrogenRadius": 40
      },
      "bond": {
        "maxPairs": 3,
        "centredInOverlap": true,
        "perpendicularOffsets": [
          -5,
          5
        ],
        "pairSpacing": 22
      }
    },
    "marking": {
      "cationShells": "empty-or-retained-full-shell",
      "geometryChecked": false,
      "speciesSpecific": false
    },
    "prerequisiteOrder": 45
  },
  {
    "id": "potassium-fluoride",
    "name": "Potassium fluoride",
    "formula": "KF",
    "displayFormula": "KF",
    "totalCharge": 0,
    "namedSpecies": false,
    "category": "ionic",
    "practiceCategory": "ionic",
    "extension": false,
    "grades": [
      1,
      2
    ],
    "scope": "specification",
    "atlasEvidence": null,
    "smiles": null,
    "prompt": "Draw the dot-and-cross diagram for the ions. Metal ions may show an empty former outer shell or a full retained shell: two electrons for Li⁺, eight for the other metals here. Distinguish gained electrons from the anion's own electrons. Use brackets and charges.",
    "explanation": "The metal loses its outer electron(s); those electrons are shown on the non-metal ion, whose brackets and charge identify the ion. No covalent shared pairs. Non-bonding inventory: 1 × F: 8 non-bonding electrons.",
    "sourceRefs": [
      "Edexcel International GCSE Chemistry specification Issue 3 (September 2024), sections 1.40 and 1.46; accessed 2026-09-12",
      "https://qualifications.pearson.com/content/dam/pdf/International%20GCSE/Chemistry/2017/specification-and-sample-assessments/international-gcse-chemistry-2017-specification.pdf"
    ],
    "reference": {
      "atoms": [
        {
          "id": "K1",
          "element": "K",
          "x": 180,
          "y": 220
        },
        {
          "id": "F1",
          "element": "F",
          "x": 500,
          "y": 220
        }
      ],
      "electrons": [
        {
          "id": "e673",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "F1",
            "slot": 0
          }
        },
        {
          "id": "e674",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "F1",
            "slot": 1
          }
        },
        {
          "id": "e675",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "F1",
            "slot": 2
          }
        },
        {
          "id": "e676",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "F1",
            "slot": 3
          }
        },
        {
          "id": "e677",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "F1",
            "slot": 4
          }
        },
        {
          "id": "e678",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "F1",
            "slot": 5
          }
        },
        {
          "id": "e679",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "F1",
            "slot": 6
          }
        },
        {
          "id": "e680",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "F1",
            "slot": 7
          }
        }
      ],
      "groups": [
        {
          "id": "K1+",
          "atomIds": [
            "K1"
          ],
          "charge": 1,
          "bracket": true
        },
        {
          "id": "F1-",
          "atomIds": [
            "F1"
          ],
          "charge": -1,
          "bracket": true
        }
      ]
    },
    "viewBox": {
      "width": 1000,
      "height": 650,
      "atomRadius": 64,
      "hydrogenRadius": 40,
      "bondLength": 104,
      "shellOverlap": 24
    },
    "electronSlots": {
      "atom": {
        "directions": [
          -100,
          -80,
          -10,
          10,
          80,
          100,
          170,
          190
        ],
        "radius": 64,
        "hydrogenRadius": 40
      },
      "bond": {
        "maxPairs": 3,
        "centredInOverlap": true,
        "perpendicularOffsets": [
          -5,
          5
        ],
        "pairSpacing": 22
      }
    },
    "marking": {
      "cationShells": "empty-or-retained-full-shell",
      "geometryChecked": false,
      "speciesSpecific": false
    },
    "prerequisiteOrder": 46
  },
  {
    "id": "lithium-fluoride",
    "name": "Lithium fluoride",
    "formula": "LiF",
    "displayFormula": "LiF",
    "totalCharge": 0,
    "namedSpecies": false,
    "category": "ionic",
    "practiceCategory": "ionic",
    "extension": false,
    "grades": [
      1,
      2
    ],
    "scope": "specification",
    "atlasEvidence": null,
    "smiles": null,
    "prompt": "Draw the dot-and-cross diagram for the ions. Metal ions may show an empty former outer shell or a full retained shell: two electrons for Li⁺, eight for the other metals here. Distinguish gained electrons from the anion's own electrons. Use brackets and charges.",
    "explanation": "The metal loses its outer electron(s); those electrons are shown on the non-metal ion, whose brackets and charge identify the ion. No covalent shared pairs. Non-bonding inventory: 1 × F: 8 non-bonding electrons.",
    "sourceRefs": [
      "Edexcel International GCSE Chemistry specification Issue 3 (September 2024), sections 1.40 and 1.46; accessed 2026-09-12",
      "https://qualifications.pearson.com/content/dam/pdf/International%20GCSE/Chemistry/2017/specification-and-sample-assessments/international-gcse-chemistry-2017-specification.pdf"
    ],
    "reference": {
      "atoms": [
        {
          "id": "Li1",
          "element": "Li",
          "x": 180,
          "y": 220
        },
        {
          "id": "F1",
          "element": "F",
          "x": 500,
          "y": 220
        }
      ],
      "electrons": [
        {
          "id": "e681",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "F1",
            "slot": 0
          }
        },
        {
          "id": "e682",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "F1",
            "slot": 1
          }
        },
        {
          "id": "e683",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "F1",
            "slot": 2
          }
        },
        {
          "id": "e684",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "F1",
            "slot": 3
          }
        },
        {
          "id": "e685",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "F1",
            "slot": 4
          }
        },
        {
          "id": "e686",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "F1",
            "slot": 5
          }
        },
        {
          "id": "e687",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "F1",
            "slot": 6
          }
        },
        {
          "id": "e688",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "F1",
            "slot": 7
          }
        }
      ],
      "groups": [
        {
          "id": "Li1+",
          "atomIds": [
            "Li1"
          ],
          "charge": 1,
          "bracket": true
        },
        {
          "id": "F1-",
          "atomIds": [
            "F1"
          ],
          "charge": -1,
          "bracket": true
        }
      ]
    },
    "viewBox": {
      "width": 1000,
      "height": 650,
      "atomRadius": 64,
      "hydrogenRadius": 40,
      "bondLength": 104,
      "shellOverlap": 24
    },
    "electronSlots": {
      "atom": {
        "directions": [
          -100,
          -80,
          -10,
          10,
          80,
          100,
          170,
          190
        ],
        "radius": 64,
        "hydrogenRadius": 40
      },
      "bond": {
        "maxPairs": 3,
        "centredInOverlap": true,
        "perpendicularOffsets": [
          -5,
          5
        ],
        "pairSpacing": 22
      }
    },
    "marking": {
      "cationShells": "empty-or-retained-full-shell",
      "geometryChecked": false,
      "speciesSpecific": false
    },
    "prerequisiteOrder": 47
  },
  {
    "id": "lithium-chloride",
    "name": "Lithium chloride",
    "formula": "LiCl",
    "displayFormula": "LiCl",
    "totalCharge": 0,
    "namedSpecies": false,
    "category": "ionic",
    "practiceCategory": "ionic",
    "extension": false,
    "grades": [
      1,
      2
    ],
    "scope": "specification",
    "atlasEvidence": null,
    "smiles": null,
    "prompt": "Draw the dot-and-cross diagram for the ions. Metal ions may show an empty former outer shell or a full retained shell: two electrons for Li⁺, eight for the other metals here. Distinguish gained electrons from the anion's own electrons. Use brackets and charges.",
    "explanation": "The metal loses its outer electron(s); those electrons are shown on the non-metal ion, whose brackets and charge identify the ion. No covalent shared pairs. Non-bonding inventory: 1 × Cl: 8 non-bonding electrons.",
    "sourceRefs": [
      "Edexcel International GCSE Chemistry specification Issue 3 (September 2024), sections 1.40 and 1.46; accessed 2026-09-12",
      "https://qualifications.pearson.com/content/dam/pdf/International%20GCSE/Chemistry/2017/specification-and-sample-assessments/international-gcse-chemistry-2017-specification.pdf"
    ],
    "reference": {
      "atoms": [
        {
          "id": "Li1",
          "element": "Li",
          "x": 180,
          "y": 220
        },
        {
          "id": "Cl1",
          "element": "Cl",
          "x": 500,
          "y": 220
        }
      ],
      "electrons": [
        {
          "id": "e689",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "Cl1",
            "slot": 0
          }
        },
        {
          "id": "e690",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "Cl1",
            "slot": 1
          }
        },
        {
          "id": "e691",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "Cl1",
            "slot": 2
          }
        },
        {
          "id": "e692",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "Cl1",
            "slot": 3
          }
        },
        {
          "id": "e693",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "Cl1",
            "slot": 4
          }
        },
        {
          "id": "e694",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "Cl1",
            "slot": 5
          }
        },
        {
          "id": "e695",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "Cl1",
            "slot": 6
          }
        },
        {
          "id": "e696",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "Cl1",
            "slot": 7
          }
        }
      ],
      "groups": [
        {
          "id": "Li1+",
          "atomIds": [
            "Li1"
          ],
          "charge": 1,
          "bracket": true
        },
        {
          "id": "Cl1-",
          "atomIds": [
            "Cl1"
          ],
          "charge": -1,
          "bracket": true
        }
      ]
    },
    "viewBox": {
      "width": 1000,
      "height": 650,
      "atomRadius": 64,
      "hydrogenRadius": 40,
      "bondLength": 104,
      "shellOverlap": 24
    },
    "electronSlots": {
      "atom": {
        "directions": [
          -100,
          -80,
          -10,
          10,
          80,
          100,
          170,
          190
        ],
        "radius": 64,
        "hydrogenRadius": 40
      },
      "bond": {
        "maxPairs": 3,
        "centredInOverlap": true,
        "perpendicularOffsets": [
          -5,
          5
        ],
        "pairSpacing": 22
      }
    },
    "marking": {
      "cationShells": "empty-or-retained-full-shell",
      "geometryChecked": false,
      "speciesSpecific": false
    },
    "prerequisiteOrder": 48
  },
  {
    "id": "lithium-oxide",
    "name": "Lithium oxide",
    "formula": "Li2O",
    "displayFormula": "Li2O",
    "totalCharge": 0,
    "namedSpecies": false,
    "category": "ionic",
    "practiceCategory": "ionic",
    "extension": false,
    "grades": [
      1,
      2
    ],
    "scope": "specification",
    "atlasEvidence": [
      {
        "questionId": "2023-jan-1-q8bi",
        "observedBand": "5-6",
        "basis": "resources/past-paper-atlas/data/atlas.json classification.band",
        "relationship": "electron-configuration explanation; original practice prompt"
      }
    ],
    "smiles": null,
    "prompt": "Draw the dot-and-cross diagram for the ions. Metal ions may show an empty former outer shell or a full retained shell: two electrons for Li⁺, eight for the other metals here. Distinguish gained electrons from the anion's own electrons. Use brackets and charges.",
    "explanation": "The metal loses its outer electron(s); those electrons are shown on the non-metal ion, whose brackets and charge identify the ion. No covalent shared pairs. Non-bonding inventory: 1 × O: 8 non-bonding electrons.",
    "sourceRefs": [
      "Edexcel International GCSE Chemistry specification Issue 3 (September 2024), sections 1.40 and 1.46; accessed 2026-09-12",
      "https://qualifications.pearson.com/content/dam/pdf/International%20GCSE/Chemistry/2017/specification-and-sample-assessments/international-gcse-chemistry-2017-specification.pdf",
      "resources/past-paper-atlas/data/atlas.json#2023-jan-1-q8bi"
    ],
    "reference": {
      "atoms": [
        {
          "id": "Li1",
          "element": "Li",
          "x": 180,
          "y": 220
        },
        {
          "id": "Li2",
          "element": "Li",
          "x": 500,
          "y": 220
        },
        {
          "id": "O1",
          "element": "O",
          "x": 820,
          "y": 220
        }
      ],
      "electrons": [
        {
          "id": "e697",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "O1",
            "slot": 0
          }
        },
        {
          "id": "e698",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "O1",
            "slot": 1
          }
        },
        {
          "id": "e699",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "O1",
            "slot": 2
          }
        },
        {
          "id": "e700",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "O1",
            "slot": 3
          }
        },
        {
          "id": "e701",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "O1",
            "slot": 4
          }
        },
        {
          "id": "e702",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "O1",
            "slot": 5
          }
        },
        {
          "id": "e703",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "O1",
            "slot": 6
          }
        },
        {
          "id": "e704",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "O1",
            "slot": 7
          }
        }
      ],
      "groups": [
        {
          "id": "Li1+",
          "atomIds": [
            "Li1"
          ],
          "charge": 1,
          "bracket": true
        },
        {
          "id": "Li2+",
          "atomIds": [
            "Li2"
          ],
          "charge": 1,
          "bracket": true
        },
        {
          "id": "O1-",
          "atomIds": [
            "O1"
          ],
          "charge": -2,
          "bracket": true
        }
      ]
    },
    "viewBox": {
      "width": 1000,
      "height": 650,
      "atomRadius": 64,
      "hydrogenRadius": 40,
      "bondLength": 104,
      "shellOverlap": 24
    },
    "electronSlots": {
      "atom": {
        "directions": [
          -100,
          -80,
          -10,
          10,
          80,
          100,
          170,
          190
        ],
        "radius": 64,
        "hydrogenRadius": 40
      },
      "bond": {
        "maxPairs": 3,
        "centredInOverlap": true,
        "perpendicularOffsets": [
          -5,
          5
        ],
        "pairSpacing": 22
      }
    },
    "marking": {
      "cationShells": "empty-or-retained-full-shell",
      "geometryChecked": false,
      "speciesSpecific": false
    },
    "prerequisiteOrder": 49
  },
  {
    "id": "potassium-bromide",
    "name": "Potassium bromide",
    "formula": "KBr",
    "displayFormula": "KBr",
    "totalCharge": 0,
    "namedSpecies": false,
    "category": "ionic",
    "practiceCategory": "ionic",
    "extension": false,
    "grades": [
      1,
      2
    ],
    "scope": "specification",
    "atlasEvidence": [
      {
        "questionId": "2019-june-2r-q4c",
        "observedBand": "7-8",
        "basis": "resources/past-paper-atlas/data/atlas.json classification.band",
        "relationship": "diagram motif; original practice prompt"
      }
    ],
    "smiles": null,
    "prompt": "Draw the dot-and-cross diagram for the ions. Metal ions may show an empty former outer shell or a full retained shell: two electrons for Li⁺, eight for the other metals here. Distinguish gained electrons from the anion's own electrons. Use brackets and charges.",
    "explanation": "The metal loses its outer electron(s); those electrons are shown on the non-metal ion, whose brackets and charge identify the ion. No covalent shared pairs. Non-bonding inventory: 1 × Br: 8 non-bonding electrons.",
    "sourceRefs": [
      "Edexcel International GCSE Chemistry specification Issue 3 (September 2024), sections 1.40 and 1.46; accessed 2026-09-12",
      "https://qualifications.pearson.com/content/dam/pdf/International%20GCSE/Chemistry/2017/specification-and-sample-assessments/international-gcse-chemistry-2017-specification.pdf",
      "resources/past-paper-atlas/data/atlas.json#2019-june-2r-q4c"
    ],
    "reference": {
      "atoms": [
        {
          "id": "K1",
          "element": "K",
          "x": 180,
          "y": 220
        },
        {
          "id": "Br1",
          "element": "Br",
          "x": 500,
          "y": 220
        }
      ],
      "electrons": [
        {
          "id": "e705",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "Br1",
            "slot": 0
          }
        },
        {
          "id": "e706",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "Br1",
            "slot": 1
          }
        },
        {
          "id": "e707",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "Br1",
            "slot": 2
          }
        },
        {
          "id": "e708",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "Br1",
            "slot": 3
          }
        },
        {
          "id": "e709",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "Br1",
            "slot": 4
          }
        },
        {
          "id": "e710",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "Br1",
            "slot": 5
          }
        },
        {
          "id": "e711",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "Br1",
            "slot": 6
          }
        },
        {
          "id": "e712",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "Br1",
            "slot": 7
          }
        }
      ],
      "groups": [
        {
          "id": "K1+",
          "atomIds": [
            "K1"
          ],
          "charge": 1,
          "bracket": true
        },
        {
          "id": "Br1-",
          "atomIds": [
            "Br1"
          ],
          "charge": -1,
          "bracket": true
        }
      ]
    },
    "viewBox": {
      "width": 1000,
      "height": 650,
      "atomRadius": 64,
      "hydrogenRadius": 40,
      "bondLength": 104,
      "shellOverlap": 24
    },
    "electronSlots": {
      "atom": {
        "directions": [
          -100,
          -80,
          -10,
          10,
          80,
          100,
          170,
          190
        ],
        "radius": 64,
        "hydrogenRadius": 40
      },
      "bond": {
        "maxPairs": 3,
        "centredInOverlap": true,
        "perpendicularOffsets": [
          -5,
          5
        ],
        "pairSpacing": 22
      }
    },
    "marking": {
      "cationShells": "empty-or-retained-full-shell",
      "geometryChecked": false,
      "speciesSpecific": false
    },
    "prerequisiteOrder": 50
  },
  {
    "id": "potassium-iodide",
    "name": "Potassium iodide",
    "formula": "KI",
    "displayFormula": "KI",
    "totalCharge": 0,
    "namedSpecies": false,
    "category": "ionic",
    "practiceCategory": "ionic",
    "extension": false,
    "grades": [
      1,
      2
    ],
    "scope": "specification",
    "atlasEvidence": null,
    "smiles": null,
    "prompt": "Draw the dot-and-cross diagram for the ions. Metal ions may show an empty former outer shell or a full retained shell: two electrons for Li⁺, eight for the other metals here. Distinguish gained electrons from the anion's own electrons. Use brackets and charges.",
    "explanation": "The metal loses its outer electron(s); those electrons are shown on the non-metal ion, whose brackets and charge identify the ion. No covalent shared pairs. Non-bonding inventory: 1 × I: 8 non-bonding electrons.",
    "sourceRefs": [
      "Edexcel International GCSE Chemistry specification Issue 3 (September 2024), sections 1.40 and 1.46; accessed 2026-09-12",
      "https://qualifications.pearson.com/content/dam/pdf/International%20GCSE/Chemistry/2017/specification-and-sample-assessments/international-gcse-chemistry-2017-specification.pdf"
    ],
    "reference": {
      "atoms": [
        {
          "id": "K1",
          "element": "K",
          "x": 180,
          "y": 220
        },
        {
          "id": "I1",
          "element": "I",
          "x": 500,
          "y": 220
        }
      ],
      "electrons": [
        {
          "id": "e713",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "I1",
            "slot": 0
          }
        },
        {
          "id": "e714",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "I1",
            "slot": 1
          }
        },
        {
          "id": "e715",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "I1",
            "slot": 2
          }
        },
        {
          "id": "e716",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "I1",
            "slot": 3
          }
        },
        {
          "id": "e717",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "I1",
            "slot": 4
          }
        },
        {
          "id": "e718",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "I1",
            "slot": 5
          }
        },
        {
          "id": "e719",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "I1",
            "slot": 6
          }
        },
        {
          "id": "e720",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "I1",
            "slot": 7
          }
        }
      ],
      "groups": [
        {
          "id": "K1+",
          "atomIds": [
            "K1"
          ],
          "charge": 1,
          "bracket": true
        },
        {
          "id": "I1-",
          "atomIds": [
            "I1"
          ],
          "charge": -1,
          "bracket": true
        }
      ]
    },
    "viewBox": {
      "width": 1000,
      "height": 650,
      "atomRadius": 64,
      "hydrogenRadius": 40,
      "bondLength": 104,
      "shellOverlap": 24
    },
    "electronSlots": {
      "atom": {
        "directions": [
          -100,
          -80,
          -10,
          10,
          80,
          100,
          170,
          190
        ],
        "radius": 64,
        "hydrogenRadius": 40
      },
      "bond": {
        "maxPairs": 3,
        "centredInOverlap": true,
        "perpendicularOffsets": [
          -5,
          5
        ],
        "pairSpacing": 22
      }
    },
    "marking": {
      "cationShells": "empty-or-retained-full-shell",
      "geometryChecked": false,
      "speciesSpecific": false
    },
    "prerequisiteOrder": 51
  },
  {
    "id": "sodium-fluoride",
    "name": "Sodium fluoride",
    "formula": "NaF",
    "displayFormula": "NaF",
    "totalCharge": 0,
    "namedSpecies": false,
    "category": "ionic",
    "practiceCategory": "ionic",
    "extension": false,
    "grades": [
      1,
      2
    ],
    "scope": "specification",
    "atlasEvidence": null,
    "smiles": null,
    "prompt": "Draw the dot-and-cross diagram for the ions. Metal ions may show an empty former outer shell or a full retained shell: two electrons for Li⁺, eight for the other metals here. Distinguish gained electrons from the anion's own electrons. Use brackets and charges.",
    "explanation": "The metal loses its outer electron(s); those electrons are shown on the non-metal ion, whose brackets and charge identify the ion. No covalent shared pairs. Non-bonding inventory: 1 × F: 8 non-bonding electrons.",
    "sourceRefs": [
      "Edexcel International GCSE Chemistry specification Issue 3 (September 2024), sections 1.40 and 1.46; accessed 2026-09-12",
      "https://qualifications.pearson.com/content/dam/pdf/International%20GCSE/Chemistry/2017/specification-and-sample-assessments/international-gcse-chemistry-2017-specification.pdf"
    ],
    "reference": {
      "atoms": [
        {
          "id": "Na1",
          "element": "Na",
          "x": 180,
          "y": 220
        },
        {
          "id": "F1",
          "element": "F",
          "x": 500,
          "y": 220
        }
      ],
      "electrons": [
        {
          "id": "e721",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "F1",
            "slot": 0
          }
        },
        {
          "id": "e722",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "F1",
            "slot": 1
          }
        },
        {
          "id": "e723",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "F1",
            "slot": 2
          }
        },
        {
          "id": "e724",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "F1",
            "slot": 3
          }
        },
        {
          "id": "e725",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "F1",
            "slot": 4
          }
        },
        {
          "id": "e726",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "F1",
            "slot": 5
          }
        },
        {
          "id": "e727",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "F1",
            "slot": 6
          }
        },
        {
          "id": "e728",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "F1",
            "slot": 7
          }
        }
      ],
      "groups": [
        {
          "id": "Na1+",
          "atomIds": [
            "Na1"
          ],
          "charge": 1,
          "bracket": true
        },
        {
          "id": "F1-",
          "atomIds": [
            "F1"
          ],
          "charge": -1,
          "bracket": true
        }
      ]
    },
    "viewBox": {
      "width": 1000,
      "height": 650,
      "atomRadius": 64,
      "hydrogenRadius": 40,
      "bondLength": 104,
      "shellOverlap": 24
    },
    "electronSlots": {
      "atom": {
        "directions": [
          -100,
          -80,
          -10,
          10,
          80,
          100,
          170,
          190
        ],
        "radius": 64,
        "hydrogenRadius": 40
      },
      "bond": {
        "maxPairs": 3,
        "centredInOverlap": true,
        "perpendicularOffsets": [
          -5,
          5
        ],
        "pairSpacing": 22
      }
    },
    "marking": {
      "cationShells": "empty-or-retained-full-shell",
      "geometryChecked": false,
      "speciesSpecific": false
    },
    "prerequisiteOrder": 52
  },
  {
    "id": "sodium-bromide",
    "name": "Sodium bromide",
    "formula": "NaBr",
    "displayFormula": "NaBr",
    "totalCharge": 0,
    "namedSpecies": false,
    "category": "ionic",
    "practiceCategory": "ionic",
    "extension": false,
    "grades": [
      1,
      2
    ],
    "scope": "specification",
    "atlasEvidence": null,
    "smiles": null,
    "prompt": "Draw the dot-and-cross diagram for the ions. Metal ions may show an empty former outer shell or a full retained shell: two electrons for Li⁺, eight for the other metals here. Distinguish gained electrons from the anion's own electrons. Use brackets and charges.",
    "explanation": "The metal loses its outer electron(s); those electrons are shown on the non-metal ion, whose brackets and charge identify the ion. No covalent shared pairs. Non-bonding inventory: 1 × Br: 8 non-bonding electrons.",
    "sourceRefs": [
      "Edexcel International GCSE Chemistry specification Issue 3 (September 2024), sections 1.40 and 1.46; accessed 2026-09-12",
      "https://qualifications.pearson.com/content/dam/pdf/International%20GCSE/Chemistry/2017/specification-and-sample-assessments/international-gcse-chemistry-2017-specification.pdf"
    ],
    "reference": {
      "atoms": [
        {
          "id": "Na1",
          "element": "Na",
          "x": 180,
          "y": 220
        },
        {
          "id": "Br1",
          "element": "Br",
          "x": 500,
          "y": 220
        }
      ],
      "electrons": [
        {
          "id": "e729",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "Br1",
            "slot": 0
          }
        },
        {
          "id": "e730",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "Br1",
            "slot": 1
          }
        },
        {
          "id": "e731",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "Br1",
            "slot": 2
          }
        },
        {
          "id": "e732",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "Br1",
            "slot": 3
          }
        },
        {
          "id": "e733",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "Br1",
            "slot": 4
          }
        },
        {
          "id": "e734",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "Br1",
            "slot": 5
          }
        },
        {
          "id": "e735",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "Br1",
            "slot": 6
          }
        },
        {
          "id": "e736",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "Br1",
            "slot": 7
          }
        }
      ],
      "groups": [
        {
          "id": "Na1+",
          "atomIds": [
            "Na1"
          ],
          "charge": 1,
          "bracket": true
        },
        {
          "id": "Br1-",
          "atomIds": [
            "Br1"
          ],
          "charge": -1,
          "bracket": true
        }
      ]
    },
    "viewBox": {
      "width": 1000,
      "height": 650,
      "atomRadius": 64,
      "hydrogenRadius": 40,
      "bondLength": 104,
      "shellOverlap": 24
    },
    "electronSlots": {
      "atom": {
        "directions": [
          -100,
          -80,
          -10,
          10,
          80,
          100,
          170,
          190
        ],
        "radius": 64,
        "hydrogenRadius": 40
      },
      "bond": {
        "maxPairs": 3,
        "centredInOverlap": true,
        "perpendicularOffsets": [
          -5,
          5
        ],
        "pairSpacing": 22
      }
    },
    "marking": {
      "cationShells": "empty-or-retained-full-shell",
      "geometryChecked": false,
      "speciesSpecific": false
    },
    "prerequisiteOrder": 53
  },
  {
    "id": "magnesium-sulfide",
    "name": "Magnesium sulfide",
    "formula": "MgS",
    "displayFormula": "MgS",
    "totalCharge": 0,
    "namedSpecies": false,
    "category": "ionic",
    "practiceCategory": "ionic",
    "extension": false,
    "grades": [
      1,
      2
    ],
    "scope": "specification",
    "atlasEvidence": null,
    "smiles": null,
    "prompt": "Draw the dot-and-cross diagram for the ions. Metal ions may show an empty former outer shell or a full retained shell: two electrons for Li⁺, eight for the other metals here. Distinguish gained electrons from the anion's own electrons. Use brackets and charges.",
    "explanation": "The metal loses its outer electron(s); those electrons are shown on the non-metal ion, whose brackets and charge identify the ion. No covalent shared pairs. Non-bonding inventory: 1 × S: 8 non-bonding electrons.",
    "sourceRefs": [
      "Edexcel International GCSE Chemistry specification Issue 3 (September 2024), sections 1.40 and 1.46; accessed 2026-09-12",
      "https://qualifications.pearson.com/content/dam/pdf/International%20GCSE/Chemistry/2017/specification-and-sample-assessments/international-gcse-chemistry-2017-specification.pdf"
    ],
    "reference": {
      "atoms": [
        {
          "id": "Mg1",
          "element": "Mg",
          "x": 180,
          "y": 220
        },
        {
          "id": "S1",
          "element": "S",
          "x": 500,
          "y": 220
        }
      ],
      "electrons": [
        {
          "id": "e737",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "S1",
            "slot": 0
          }
        },
        {
          "id": "e738",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "S1",
            "slot": 1
          }
        },
        {
          "id": "e739",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "S1",
            "slot": 2
          }
        },
        {
          "id": "e740",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "S1",
            "slot": 3
          }
        },
        {
          "id": "e741",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "S1",
            "slot": 4
          }
        },
        {
          "id": "e742",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "S1",
            "slot": 5
          }
        },
        {
          "id": "e743",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "S1",
            "slot": 6
          }
        },
        {
          "id": "e744",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "S1",
            "slot": 7
          }
        }
      ],
      "groups": [
        {
          "id": "Mg1+",
          "atomIds": [
            "Mg1"
          ],
          "charge": 2,
          "bracket": true
        },
        {
          "id": "S1-",
          "atomIds": [
            "S1"
          ],
          "charge": -2,
          "bracket": true
        }
      ]
    },
    "viewBox": {
      "width": 1000,
      "height": 650,
      "atomRadius": 64,
      "hydrogenRadius": 40,
      "bondLength": 104,
      "shellOverlap": 24
    },
    "electronSlots": {
      "atom": {
        "directions": [
          -100,
          -80,
          -10,
          10,
          80,
          100,
          170,
          190
        ],
        "radius": 64,
        "hydrogenRadius": 40
      },
      "bond": {
        "maxPairs": 3,
        "centredInOverlap": true,
        "perpendicularOffsets": [
          -5,
          5
        ],
        "pairSpacing": 22
      }
    },
    "marking": {
      "cationShells": "empty-or-retained-full-shell",
      "geometryChecked": false,
      "speciesSpecific": false
    },
    "prerequisiteOrder": 54
  },
  {
    "id": "magnesium-fluoride",
    "name": "Magnesium fluoride",
    "formula": "MgF2",
    "displayFormula": "MgF2",
    "totalCharge": 0,
    "namedSpecies": false,
    "category": "ionic",
    "practiceCategory": "ionic",
    "extension": false,
    "grades": [
      1,
      2
    ],
    "scope": "specification",
    "atlasEvidence": null,
    "smiles": null,
    "prompt": "Draw the dot-and-cross diagram for the ions. Metal ions may show an empty former outer shell or a full retained shell: two electrons for Li⁺, eight for the other metals here. Distinguish gained electrons from the anion's own electrons. Use brackets and charges.",
    "explanation": "The metal loses its outer electron(s); those electrons are shown on the non-metal ion, whose brackets and charge identify the ion. No covalent shared pairs. Non-bonding inventory: 2 × F: 8 non-bonding electrons.",
    "sourceRefs": [
      "Edexcel International GCSE Chemistry specification Issue 3 (September 2024), sections 1.40 and 1.46; accessed 2026-09-12",
      "https://qualifications.pearson.com/content/dam/pdf/International%20GCSE/Chemistry/2017/specification-and-sample-assessments/international-gcse-chemistry-2017-specification.pdf"
    ],
    "reference": {
      "atoms": [
        {
          "id": "Mg1",
          "element": "Mg",
          "x": 180,
          "y": 220
        },
        {
          "id": "F1",
          "element": "F",
          "x": 500,
          "y": 220
        },
        {
          "id": "F2",
          "element": "F",
          "x": 820,
          "y": 220
        }
      ],
      "electrons": [
        {
          "id": "e745",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "F1",
            "slot": 0
          }
        },
        {
          "id": "e746",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "F1",
            "slot": 1
          }
        },
        {
          "id": "e747",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "F1",
            "slot": 2
          }
        },
        {
          "id": "e748",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "F1",
            "slot": 3
          }
        },
        {
          "id": "e749",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "F1",
            "slot": 4
          }
        },
        {
          "id": "e750",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "F1",
            "slot": 5
          }
        },
        {
          "id": "e751",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "F1",
            "slot": 6
          }
        },
        {
          "id": "e752",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "F1",
            "slot": 7
          }
        },
        {
          "id": "e753",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "F2",
            "slot": 0
          }
        },
        {
          "id": "e754",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "F2",
            "slot": 1
          }
        },
        {
          "id": "e755",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "F2",
            "slot": 2
          }
        },
        {
          "id": "e756",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "F2",
            "slot": 3
          }
        },
        {
          "id": "e757",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "F2",
            "slot": 4
          }
        },
        {
          "id": "e758",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "F2",
            "slot": 5
          }
        },
        {
          "id": "e759",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "F2",
            "slot": 6
          }
        },
        {
          "id": "e760",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "F2",
            "slot": 7
          }
        }
      ],
      "groups": [
        {
          "id": "Mg1+",
          "atomIds": [
            "Mg1"
          ],
          "charge": 2,
          "bracket": true
        },
        {
          "id": "F1-",
          "atomIds": [
            "F1"
          ],
          "charge": -1,
          "bracket": true
        },
        {
          "id": "F2-",
          "atomIds": [
            "F2"
          ],
          "charge": -1,
          "bracket": true
        }
      ]
    },
    "viewBox": {
      "width": 1000,
      "height": 650,
      "atomRadius": 64,
      "hydrogenRadius": 40,
      "bondLength": 104,
      "shellOverlap": 24
    },
    "electronSlots": {
      "atom": {
        "directions": [
          -100,
          -80,
          -10,
          10,
          80,
          100,
          170,
          190
        ],
        "radius": 64,
        "hydrogenRadius": 40
      },
      "bond": {
        "maxPairs": 3,
        "centredInOverlap": true,
        "perpendicularOffsets": [
          -5,
          5
        ],
        "pairSpacing": 22
      }
    },
    "marking": {
      "cationShells": "empty-or-retained-full-shell",
      "geometryChecked": false,
      "speciesSpecific": false
    },
    "prerequisiteOrder": 55
  },
  {
    "id": "magnesium-bromide",
    "name": "Magnesium bromide",
    "formula": "MgBr2",
    "displayFormula": "MgBr2",
    "totalCharge": 0,
    "namedSpecies": false,
    "category": "ionic",
    "practiceCategory": "ionic",
    "extension": false,
    "grades": [
      1,
      2
    ],
    "scope": "specification",
    "atlasEvidence": null,
    "smiles": null,
    "prompt": "Draw the dot-and-cross diagram for the ions. Metal ions may show an empty former outer shell or a full retained shell: two electrons for Li⁺, eight for the other metals here. Distinguish gained electrons from the anion's own electrons. Use brackets and charges.",
    "explanation": "The metal loses its outer electron(s); those electrons are shown on the non-metal ion, whose brackets and charge identify the ion. No covalent shared pairs. Non-bonding inventory: 2 × Br: 8 non-bonding electrons.",
    "sourceRefs": [
      "Edexcel International GCSE Chemistry specification Issue 3 (September 2024), sections 1.40 and 1.46; accessed 2026-09-12",
      "https://qualifications.pearson.com/content/dam/pdf/International%20GCSE/Chemistry/2017/specification-and-sample-assessments/international-gcse-chemistry-2017-specification.pdf"
    ],
    "reference": {
      "atoms": [
        {
          "id": "Mg1",
          "element": "Mg",
          "x": 180,
          "y": 220
        },
        {
          "id": "Br1",
          "element": "Br",
          "x": 500,
          "y": 220
        },
        {
          "id": "Br2",
          "element": "Br",
          "x": 820,
          "y": 220
        }
      ],
      "electrons": [
        {
          "id": "e761",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "Br1",
            "slot": 0
          }
        },
        {
          "id": "e762",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "Br1",
            "slot": 1
          }
        },
        {
          "id": "e763",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "Br1",
            "slot": 2
          }
        },
        {
          "id": "e764",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "Br1",
            "slot": 3
          }
        },
        {
          "id": "e765",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "Br1",
            "slot": 4
          }
        },
        {
          "id": "e766",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "Br1",
            "slot": 5
          }
        },
        {
          "id": "e767",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "Br1",
            "slot": 6
          }
        },
        {
          "id": "e768",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "Br1",
            "slot": 7
          }
        },
        {
          "id": "e769",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "Br2",
            "slot": 0
          }
        },
        {
          "id": "e770",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "Br2",
            "slot": 1
          }
        },
        {
          "id": "e771",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "Br2",
            "slot": 2
          }
        },
        {
          "id": "e772",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "Br2",
            "slot": 3
          }
        },
        {
          "id": "e773",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "Br2",
            "slot": 4
          }
        },
        {
          "id": "e774",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "Br2",
            "slot": 5
          }
        },
        {
          "id": "e775",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "Br2",
            "slot": 6
          }
        },
        {
          "id": "e776",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "Br2",
            "slot": 7
          }
        }
      ],
      "groups": [
        {
          "id": "Mg1+",
          "atomIds": [
            "Mg1"
          ],
          "charge": 2,
          "bracket": true
        },
        {
          "id": "Br1-",
          "atomIds": [
            "Br1"
          ],
          "charge": -1,
          "bracket": true
        },
        {
          "id": "Br2-",
          "atomIds": [
            "Br2"
          ],
          "charge": -1,
          "bracket": true
        }
      ]
    },
    "viewBox": {
      "width": 1000,
      "height": 650,
      "atomRadius": 64,
      "hydrogenRadius": 40,
      "bondLength": 104,
      "shellOverlap": 24
    },
    "electronSlots": {
      "atom": {
        "directions": [
          -100,
          -80,
          -10,
          10,
          80,
          100,
          170,
          190
        ],
        "radius": 64,
        "hydrogenRadius": 40
      },
      "bond": {
        "maxPairs": 3,
        "centredInOverlap": true,
        "perpendicularOffsets": [
          -5,
          5
        ],
        "pairSpacing": 22
      }
    },
    "marking": {
      "cationShells": "empty-or-retained-full-shell",
      "geometryChecked": false,
      "speciesSpecific": false
    },
    "prerequisiteOrder": 56
  },
  {
    "id": "calcium-sulfide",
    "name": "Calcium sulfide",
    "formula": "CaS",
    "displayFormula": "CaS",
    "totalCharge": 0,
    "namedSpecies": false,
    "category": "ionic",
    "practiceCategory": "ionic",
    "extension": false,
    "grades": [
      1,
      2
    ],
    "scope": "specification",
    "atlasEvidence": null,
    "smiles": null,
    "prompt": "Draw the dot-and-cross diagram for the ions. Metal ions may show an empty former outer shell or a full retained shell: two electrons for Li⁺, eight for the other metals here. Distinguish gained electrons from the anion's own electrons. Use brackets and charges.",
    "explanation": "The metal loses its outer electron(s); those electrons are shown on the non-metal ion, whose brackets and charge identify the ion. No covalent shared pairs. Non-bonding inventory: 1 × S: 8 non-bonding electrons.",
    "sourceRefs": [
      "Edexcel International GCSE Chemistry specification Issue 3 (September 2024), sections 1.40 and 1.46; accessed 2026-09-12",
      "https://qualifications.pearson.com/content/dam/pdf/International%20GCSE/Chemistry/2017/specification-and-sample-assessments/international-gcse-chemistry-2017-specification.pdf"
    ],
    "reference": {
      "atoms": [
        {
          "id": "Ca1",
          "element": "Ca",
          "x": 180,
          "y": 220
        },
        {
          "id": "S1",
          "element": "S",
          "x": 500,
          "y": 220
        }
      ],
      "electrons": [
        {
          "id": "e777",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "S1",
            "slot": 0
          }
        },
        {
          "id": "e778",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "S1",
            "slot": 1
          }
        },
        {
          "id": "e779",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "S1",
            "slot": 2
          }
        },
        {
          "id": "e780",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "S1",
            "slot": 3
          }
        },
        {
          "id": "e781",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "S1",
            "slot": 4
          }
        },
        {
          "id": "e782",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "S1",
            "slot": 5
          }
        },
        {
          "id": "e783",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "S1",
            "slot": 6
          }
        },
        {
          "id": "e784",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "S1",
            "slot": 7
          }
        }
      ],
      "groups": [
        {
          "id": "Ca1+",
          "atomIds": [
            "Ca1"
          ],
          "charge": 2,
          "bracket": true
        },
        {
          "id": "S1-",
          "atomIds": [
            "S1"
          ],
          "charge": -2,
          "bracket": true
        }
      ]
    },
    "viewBox": {
      "width": 1000,
      "height": 650,
      "atomRadius": 64,
      "hydrogenRadius": 40,
      "bondLength": 104,
      "shellOverlap": 24
    },
    "electronSlots": {
      "atom": {
        "directions": [
          -100,
          -80,
          -10,
          10,
          80,
          100,
          170,
          190
        ],
        "radius": 64,
        "hydrogenRadius": 40
      },
      "bond": {
        "maxPairs": 3,
        "centredInOverlap": true,
        "perpendicularOffsets": [
          -5,
          5
        ],
        "pairSpacing": 22
      }
    },
    "marking": {
      "cationShells": "empty-or-retained-full-shell",
      "geometryChecked": false,
      "speciesSpecific": false
    },
    "prerequisiteOrder": 57
  },
  {
    "id": "calcium-fluoride",
    "name": "Calcium fluoride",
    "formula": "CaF2",
    "displayFormula": "CaF2",
    "totalCharge": 0,
    "namedSpecies": false,
    "category": "ionic",
    "practiceCategory": "ionic",
    "extension": false,
    "grades": [
      1,
      2
    ],
    "scope": "specification",
    "atlasEvidence": null,
    "smiles": null,
    "prompt": "Draw the dot-and-cross diagram for the ions. Metal ions may show an empty former outer shell or a full retained shell: two electrons for Li⁺, eight for the other metals here. Distinguish gained electrons from the anion's own electrons. Use brackets and charges.",
    "explanation": "The metal loses its outer electron(s); those electrons are shown on the non-metal ion, whose brackets and charge identify the ion. No covalent shared pairs. Non-bonding inventory: 2 × F: 8 non-bonding electrons.",
    "sourceRefs": [
      "Edexcel International GCSE Chemistry specification Issue 3 (September 2024), sections 1.40 and 1.46; accessed 2026-09-12",
      "https://qualifications.pearson.com/content/dam/pdf/International%20GCSE/Chemistry/2017/specification-and-sample-assessments/international-gcse-chemistry-2017-specification.pdf"
    ],
    "reference": {
      "atoms": [
        {
          "id": "Ca1",
          "element": "Ca",
          "x": 180,
          "y": 220
        },
        {
          "id": "F1",
          "element": "F",
          "x": 500,
          "y": 220
        },
        {
          "id": "F2",
          "element": "F",
          "x": 820,
          "y": 220
        }
      ],
      "electrons": [
        {
          "id": "e785",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "F1",
            "slot": 0
          }
        },
        {
          "id": "e786",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "F1",
            "slot": 1
          }
        },
        {
          "id": "e787",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "F1",
            "slot": 2
          }
        },
        {
          "id": "e788",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "F1",
            "slot": 3
          }
        },
        {
          "id": "e789",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "F1",
            "slot": 4
          }
        },
        {
          "id": "e790",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "F1",
            "slot": 5
          }
        },
        {
          "id": "e791",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "F1",
            "slot": 6
          }
        },
        {
          "id": "e792",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "F1",
            "slot": 7
          }
        },
        {
          "id": "e793",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "F2",
            "slot": 0
          }
        },
        {
          "id": "e794",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "F2",
            "slot": 1
          }
        },
        {
          "id": "e795",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "F2",
            "slot": 2
          }
        },
        {
          "id": "e796",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "F2",
            "slot": 3
          }
        },
        {
          "id": "e797",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "F2",
            "slot": 4
          }
        },
        {
          "id": "e798",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "F2",
            "slot": 5
          }
        },
        {
          "id": "e799",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "F2",
            "slot": 6
          }
        },
        {
          "id": "e800",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "F2",
            "slot": 7
          }
        }
      ],
      "groups": [
        {
          "id": "Ca1+",
          "atomIds": [
            "Ca1"
          ],
          "charge": 2,
          "bracket": true
        },
        {
          "id": "F1-",
          "atomIds": [
            "F1"
          ],
          "charge": -1,
          "bracket": true
        },
        {
          "id": "F2-",
          "atomIds": [
            "F2"
          ],
          "charge": -1,
          "bracket": true
        }
      ]
    },
    "viewBox": {
      "width": 1000,
      "height": 650,
      "atomRadius": 64,
      "hydrogenRadius": 40,
      "bondLength": 104,
      "shellOverlap": 24
    },
    "electronSlots": {
      "atom": {
        "directions": [
          -100,
          -80,
          -10,
          10,
          80,
          100,
          170,
          190
        ],
        "radius": 64,
        "hydrogenRadius": 40
      },
      "bond": {
        "maxPairs": 3,
        "centredInOverlap": true,
        "perpendicularOffsets": [
          -5,
          5
        ],
        "pairSpacing": 22
      }
    },
    "marking": {
      "cationShells": "empty-or-retained-full-shell",
      "geometryChecked": false,
      "speciesSpecific": false
    },
    "prerequisiteOrder": 58
  },
  {
    "id": "calcium-bromide",
    "name": "Calcium bromide",
    "formula": "CaBr2",
    "displayFormula": "CaBr2",
    "totalCharge": 0,
    "namedSpecies": false,
    "category": "ionic",
    "practiceCategory": "ionic",
    "extension": false,
    "grades": [
      1,
      2
    ],
    "scope": "specification",
    "atlasEvidence": null,
    "smiles": null,
    "prompt": "Draw the dot-and-cross diagram for the ions. Metal ions may show an empty former outer shell or a full retained shell: two electrons for Li⁺, eight for the other metals here. Distinguish gained electrons from the anion's own electrons. Use brackets and charges.",
    "explanation": "The metal loses its outer electron(s); those electrons are shown on the non-metal ion, whose brackets and charge identify the ion. No covalent shared pairs. Non-bonding inventory: 2 × Br: 8 non-bonding electrons.",
    "sourceRefs": [
      "Edexcel International GCSE Chemistry specification Issue 3 (September 2024), sections 1.40 and 1.46; accessed 2026-09-12",
      "https://qualifications.pearson.com/content/dam/pdf/International%20GCSE/Chemistry/2017/specification-and-sample-assessments/international-gcse-chemistry-2017-specification.pdf"
    ],
    "reference": {
      "atoms": [
        {
          "id": "Ca1",
          "element": "Ca",
          "x": 180,
          "y": 220
        },
        {
          "id": "Br1",
          "element": "Br",
          "x": 500,
          "y": 220
        },
        {
          "id": "Br2",
          "element": "Br",
          "x": 820,
          "y": 220
        }
      ],
      "electrons": [
        {
          "id": "e801",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "Br1",
            "slot": 0
          }
        },
        {
          "id": "e802",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "Br1",
            "slot": 1
          }
        },
        {
          "id": "e803",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "Br1",
            "slot": 2
          }
        },
        {
          "id": "e804",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "Br1",
            "slot": 3
          }
        },
        {
          "id": "e805",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "Br1",
            "slot": 4
          }
        },
        {
          "id": "e806",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "Br1",
            "slot": 5
          }
        },
        {
          "id": "e807",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "Br1",
            "slot": 6
          }
        },
        {
          "id": "e808",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "Br1",
            "slot": 7
          }
        },
        {
          "id": "e809",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "Br2",
            "slot": 0
          }
        },
        {
          "id": "e810",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "Br2",
            "slot": 1
          }
        },
        {
          "id": "e811",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "Br2",
            "slot": 2
          }
        },
        {
          "id": "e812",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "Br2",
            "slot": 3
          }
        },
        {
          "id": "e813",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "Br2",
            "slot": 4
          }
        },
        {
          "id": "e814",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "Br2",
            "slot": 5
          }
        },
        {
          "id": "e815",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "Br2",
            "slot": 6
          }
        },
        {
          "id": "e816",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "Br2",
            "slot": 7
          }
        }
      ],
      "groups": [
        {
          "id": "Ca1+",
          "atomIds": [
            "Ca1"
          ],
          "charge": 2,
          "bracket": true
        },
        {
          "id": "Br1-",
          "atomIds": [
            "Br1"
          ],
          "charge": -1,
          "bracket": true
        },
        {
          "id": "Br2-",
          "atomIds": [
            "Br2"
          ],
          "charge": -1,
          "bracket": true
        }
      ]
    },
    "viewBox": {
      "width": 1000,
      "height": 650,
      "atomRadius": 64,
      "hydrogenRadius": 40,
      "bondLength": 104,
      "shellOverlap": 24
    },
    "electronSlots": {
      "atom": {
        "directions": [
          -100,
          -80,
          -10,
          10,
          80,
          100,
          170,
          190
        ],
        "radius": 64,
        "hydrogenRadius": 40
      },
      "bond": {
        "maxPairs": 3,
        "centredInOverlap": true,
        "perpendicularOffsets": [
          -5,
          5
        ],
        "pairSpacing": 22
      }
    },
    "marking": {
      "cationShells": "empty-or-retained-full-shell",
      "geometryChecked": false,
      "speciesSpecific": false
    },
    "prerequisiteOrder": 59
  },
  {
    "id": "calcium-oxide",
    "name": "Calcium oxide",
    "formula": "CaO",
    "displayFormula": "CaO",
    "totalCharge": 0,
    "namedSpecies": false,
    "category": "ionic",
    "practiceCategory": "ionic",
    "extension": false,
    "grades": [
      1,
      2
    ],
    "scope": "specification",
    "atlasEvidence": null,
    "smiles": null,
    "prompt": "Draw the dot-and-cross diagram for the ions. Metal ions may show an empty former outer shell or a full retained shell: two electrons for Li⁺, eight for the other metals here. Distinguish gained electrons from the anion's own electrons. Use brackets and charges.",
    "explanation": "The metal loses its outer electron(s); those electrons are shown on the non-metal ion, whose brackets and charge identify the ion. No covalent shared pairs. Non-bonding inventory: 1 × O: 8 non-bonding electrons.",
    "sourceRefs": [
      "Edexcel International GCSE Chemistry specification Issue 3 (September 2024), sections 1.40 and 1.46; accessed 2026-09-12",
      "https://qualifications.pearson.com/content/dam/pdf/International%20GCSE/Chemistry/2017/specification-and-sample-assessments/international-gcse-chemistry-2017-specification.pdf"
    ],
    "reference": {
      "atoms": [
        {
          "id": "Ca1",
          "element": "Ca",
          "x": 180,
          "y": 220
        },
        {
          "id": "O1",
          "element": "O",
          "x": 500,
          "y": 220
        }
      ],
      "electrons": [
        {
          "id": "e817",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "O1",
            "slot": 0
          }
        },
        {
          "id": "e818",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "O1",
            "slot": 1
          }
        },
        {
          "id": "e819",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "O1",
            "slot": 2
          }
        },
        {
          "id": "e820",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "O1",
            "slot": 3
          }
        },
        {
          "id": "e821",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "O1",
            "slot": 4
          }
        },
        {
          "id": "e822",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "O1",
            "slot": 5
          }
        },
        {
          "id": "e823",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "O1",
            "slot": 6
          }
        },
        {
          "id": "e824",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "O1",
            "slot": 7
          }
        }
      ],
      "groups": [
        {
          "id": "Ca1+",
          "atomIds": [
            "Ca1"
          ],
          "charge": 2,
          "bracket": true
        },
        {
          "id": "O1-",
          "atomIds": [
            "O1"
          ],
          "charge": -2,
          "bracket": true
        }
      ]
    },
    "viewBox": {
      "width": 1000,
      "height": 650,
      "atomRadius": 64,
      "hydrogenRadius": 40,
      "bondLength": 104,
      "shellOverlap": 24
    },
    "electronSlots": {
      "atom": {
        "directions": [
          -100,
          -80,
          -10,
          10,
          80,
          100,
          170,
          190
        ],
        "radius": 64,
        "hydrogenRadius": 40
      },
      "bond": {
        "maxPairs": 3,
        "centredInOverlap": true,
        "perpendicularOffsets": [
          -5,
          5
        ],
        "pairSpacing": 22
      }
    },
    "marking": {
      "cationShells": "empty-or-retained-full-shell",
      "geometryChecked": false,
      "speciesSpecific": false
    },
    "prerequisiteOrder": 60
  },
  {
    "id": "aluminium-oxide",
    "name": "Aluminium oxide",
    "formula": "Al2O3",
    "displayFormula": "Al2O3",
    "totalCharge": 0,
    "namedSpecies": false,
    "category": "ionic",
    "practiceCategory": "ionic",
    "extension": false,
    "grades": [
      2
    ],
    "scope": "specification",
    "atlasEvidence": null,
    "smiles": null,
    "prompt": "Draw the dot-and-cross diagram for the ions. Metal ions may show an empty former outer shell or a full retained shell: two electrons for Li⁺, eight for the other metals here. Distinguish gained electrons from the anion's own electrons. Use brackets and charges.",
    "explanation": "The metal loses its outer electron(s); those electrons are shown on the non-metal ion, whose brackets and charge identify the ion. No covalent shared pairs. Non-bonding inventory: 3 × O: 8 non-bonding electrons.",
    "sourceRefs": [
      "Edexcel International GCSE Chemistry specification Issue 3 (September 2024), sections 1.40 and 1.46; accessed 2026-09-12",
      "https://qualifications.pearson.com/content/dam/pdf/International%20GCSE/Chemistry/2017/specification-and-sample-assessments/international-gcse-chemistry-2017-specification.pdf"
    ],
    "reference": {
      "atoms": [
        {
          "id": "Al1",
          "element": "Al",
          "x": 180,
          "y": 220
        },
        {
          "id": "Al2",
          "element": "Al",
          "x": 500,
          "y": 220
        },
        {
          "id": "O1",
          "element": "O",
          "x": 820,
          "y": 220
        },
        {
          "id": "O2",
          "element": "O",
          "x": 180,
          "y": 430
        },
        {
          "id": "O3",
          "element": "O",
          "x": 500,
          "y": 430
        }
      ],
      "electrons": [
        {
          "id": "e825",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "O1",
            "slot": 0
          }
        },
        {
          "id": "e826",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "O1",
            "slot": 1
          }
        },
        {
          "id": "e827",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "O1",
            "slot": 2
          }
        },
        {
          "id": "e828",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "O1",
            "slot": 3
          }
        },
        {
          "id": "e829",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "O1",
            "slot": 4
          }
        },
        {
          "id": "e830",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "O1",
            "slot": 5
          }
        },
        {
          "id": "e831",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "O1",
            "slot": 6
          }
        },
        {
          "id": "e832",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "O1",
            "slot": 7
          }
        },
        {
          "id": "e833",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "O2",
            "slot": 0
          }
        },
        {
          "id": "e834",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "O2",
            "slot": 1
          }
        },
        {
          "id": "e835",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "O2",
            "slot": 2
          }
        },
        {
          "id": "e836",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "O2",
            "slot": 3
          }
        },
        {
          "id": "e837",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "O2",
            "slot": 4
          }
        },
        {
          "id": "e838",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "O2",
            "slot": 5
          }
        },
        {
          "id": "e839",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "O2",
            "slot": 6
          }
        },
        {
          "id": "e840",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "O2",
            "slot": 7
          }
        },
        {
          "id": "e841",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "O3",
            "slot": 0
          }
        },
        {
          "id": "e842",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "O3",
            "slot": 1
          }
        },
        {
          "id": "e843",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "O3",
            "slot": 2
          }
        },
        {
          "id": "e844",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "O3",
            "slot": 3
          }
        },
        {
          "id": "e845",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "O3",
            "slot": 4
          }
        },
        {
          "id": "e846",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "O3",
            "slot": 5
          }
        },
        {
          "id": "e847",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "O3",
            "slot": 6
          }
        },
        {
          "id": "e848",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "O3",
            "slot": 7
          }
        }
      ],
      "groups": [
        {
          "id": "Al1+",
          "atomIds": [
            "Al1"
          ],
          "charge": 3,
          "bracket": true
        },
        {
          "id": "Al2+",
          "atomIds": [
            "Al2"
          ],
          "charge": 3,
          "bracket": true
        },
        {
          "id": "O1-",
          "atomIds": [
            "O1"
          ],
          "charge": -2,
          "bracket": true
        },
        {
          "id": "O2-",
          "atomIds": [
            "O2"
          ],
          "charge": -2,
          "bracket": true
        },
        {
          "id": "O3-",
          "atomIds": [
            "O3"
          ],
          "charge": -2,
          "bracket": true
        }
      ]
    },
    "viewBox": {
      "width": 1000,
      "height": 650,
      "atomRadius": 64,
      "hydrogenRadius": 40,
      "bondLength": 104,
      "shellOverlap": 24
    },
    "electronSlots": {
      "atom": {
        "directions": [
          -100,
          -80,
          -10,
          10,
          80,
          100,
          170,
          190
        ],
        "radius": 64,
        "hydrogenRadius": 40
      },
      "bond": {
        "maxPairs": 3,
        "centredInOverlap": true,
        "perpendicularOffsets": [
          -5,
          5
        ],
        "pairSpacing": 22
      }
    },
    "marking": {
      "cationShells": "empty-or-retained-full-shell",
      "geometryChecked": false,
      "speciesSpecific": false
    },
    "prerequisiteOrder": 61
  },
  {
    "id": "aluminium-sulfide",
    "name": "Aluminium sulfide",
    "formula": "Al2S3",
    "displayFormula": "Al2S3",
    "totalCharge": 0,
    "namedSpecies": false,
    "category": "ionic",
    "practiceCategory": "ionic",
    "extension": false,
    "grades": [
      2
    ],
    "scope": "specification",
    "atlasEvidence": null,
    "smiles": null,
    "prompt": "Draw the dot-and-cross diagram for the ions. Metal ions may show an empty former outer shell or a full retained shell: two electrons for Li⁺, eight for the other metals here. Distinguish gained electrons from the anion's own electrons. Use brackets and charges.",
    "explanation": "The metal loses its outer electron(s); those electrons are shown on the non-metal ion, whose brackets and charge identify the ion. No covalent shared pairs. Non-bonding inventory: 3 × S: 8 non-bonding electrons.",
    "sourceRefs": [
      "Edexcel International GCSE Chemistry specification Issue 3 (September 2024), sections 1.40 and 1.46; accessed 2026-09-12",
      "https://qualifications.pearson.com/content/dam/pdf/International%20GCSE/Chemistry/2017/specification-and-sample-assessments/international-gcse-chemistry-2017-specification.pdf"
    ],
    "reference": {
      "atoms": [
        {
          "id": "Al1",
          "element": "Al",
          "x": 180,
          "y": 220
        },
        {
          "id": "Al2",
          "element": "Al",
          "x": 500,
          "y": 220
        },
        {
          "id": "S1",
          "element": "S",
          "x": 820,
          "y": 220
        },
        {
          "id": "S2",
          "element": "S",
          "x": 180,
          "y": 430
        },
        {
          "id": "S3",
          "element": "S",
          "x": 500,
          "y": 430
        }
      ],
      "electrons": [
        {
          "id": "e849",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "S1",
            "slot": 0
          }
        },
        {
          "id": "e850",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "S1",
            "slot": 1
          }
        },
        {
          "id": "e851",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "S1",
            "slot": 2
          }
        },
        {
          "id": "e852",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "S1",
            "slot": 3
          }
        },
        {
          "id": "e853",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "S1",
            "slot": 4
          }
        },
        {
          "id": "e854",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "S1",
            "slot": 5
          }
        },
        {
          "id": "e855",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "S1",
            "slot": 6
          }
        },
        {
          "id": "e856",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "S1",
            "slot": 7
          }
        },
        {
          "id": "e857",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "S2",
            "slot": 0
          }
        },
        {
          "id": "e858",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "S2",
            "slot": 1
          }
        },
        {
          "id": "e859",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "S2",
            "slot": 2
          }
        },
        {
          "id": "e860",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "S2",
            "slot": 3
          }
        },
        {
          "id": "e861",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "S2",
            "slot": 4
          }
        },
        {
          "id": "e862",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "S2",
            "slot": 5
          }
        },
        {
          "id": "e863",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "S2",
            "slot": 6
          }
        },
        {
          "id": "e864",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "S2",
            "slot": 7
          }
        },
        {
          "id": "e865",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "S3",
            "slot": 0
          }
        },
        {
          "id": "e866",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "S3",
            "slot": 1
          }
        },
        {
          "id": "e867",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "S3",
            "slot": 2
          }
        },
        {
          "id": "e868",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "S3",
            "slot": 3
          }
        },
        {
          "id": "e869",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "S3",
            "slot": 4
          }
        },
        {
          "id": "e870",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "S3",
            "slot": 5
          }
        },
        {
          "id": "e871",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "S3",
            "slot": 6
          }
        },
        {
          "id": "e872",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "S3",
            "slot": 7
          }
        }
      ],
      "groups": [
        {
          "id": "Al1+",
          "atomIds": [
            "Al1"
          ],
          "charge": 3,
          "bracket": true
        },
        {
          "id": "Al2+",
          "atomIds": [
            "Al2"
          ],
          "charge": 3,
          "bracket": true
        },
        {
          "id": "S1-",
          "atomIds": [
            "S1"
          ],
          "charge": -2,
          "bracket": true
        },
        {
          "id": "S2-",
          "atomIds": [
            "S2"
          ],
          "charge": -2,
          "bracket": true
        },
        {
          "id": "S3-",
          "atomIds": [
            "S3"
          ],
          "charge": -2,
          "bracket": true
        }
      ]
    },
    "viewBox": {
      "width": 1000,
      "height": 650,
      "atomRadius": 64,
      "hydrogenRadius": 40,
      "bondLength": 104,
      "shellOverlap": 24
    },
    "electronSlots": {
      "atom": {
        "directions": [
          -100,
          -80,
          -10,
          10,
          80,
          100,
          170,
          190
        ],
        "radius": 64,
        "hydrogenRadius": 40
      },
      "bond": {
        "maxPairs": 3,
        "centredInOverlap": true,
        "perpendicularOffsets": [
          -5,
          5
        ],
        "pairSpacing": 22
      }
    },
    "marking": {
      "cationShells": "empty-or-retained-full-shell",
      "geometryChecked": false,
      "speciesSpecific": false
    },
    "prerequisiteOrder": 62
  },
  {
    "id": "aluminium-fluoride",
    "name": "Aluminium fluoride",
    "formula": "AlF3",
    "displayFormula": "AlF3",
    "totalCharge": 0,
    "namedSpecies": false,
    "category": "ionic",
    "practiceCategory": "ionic",
    "extension": false,
    "grades": [
      2
    ],
    "scope": "specification",
    "atlasEvidence": null,
    "smiles": null,
    "prompt": "Draw the dot-and-cross diagram for the ions. Metal ions may show an empty former outer shell or a full retained shell: two electrons for Li⁺, eight for the other metals here. Distinguish gained electrons from the anion's own electrons. Use brackets and charges.",
    "explanation": "The metal loses its outer electron(s); those electrons are shown on the non-metal ion, whose brackets and charge identify the ion. No covalent shared pairs. Non-bonding inventory: 3 × F: 8 non-bonding electrons.",
    "sourceRefs": [
      "Edexcel International GCSE Chemistry specification Issue 3 (September 2024), sections 1.40 and 1.46; accessed 2026-09-12",
      "https://qualifications.pearson.com/content/dam/pdf/International%20GCSE/Chemistry/2017/specification-and-sample-assessments/international-gcse-chemistry-2017-specification.pdf"
    ],
    "reference": {
      "atoms": [
        {
          "id": "Al1",
          "element": "Al",
          "x": 180,
          "y": 220
        },
        {
          "id": "F1",
          "element": "F",
          "x": 500,
          "y": 220
        },
        {
          "id": "F2",
          "element": "F",
          "x": 820,
          "y": 220
        },
        {
          "id": "F3",
          "element": "F",
          "x": 180,
          "y": 430
        }
      ],
      "electrons": [
        {
          "id": "e873",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "F1",
            "slot": 0
          }
        },
        {
          "id": "e874",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "F1",
            "slot": 1
          }
        },
        {
          "id": "e875",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "F1",
            "slot": 2
          }
        },
        {
          "id": "e876",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "F1",
            "slot": 3
          }
        },
        {
          "id": "e877",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "F1",
            "slot": 4
          }
        },
        {
          "id": "e878",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "F1",
            "slot": 5
          }
        },
        {
          "id": "e879",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "F1",
            "slot": 6
          }
        },
        {
          "id": "e880",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "F1",
            "slot": 7
          }
        },
        {
          "id": "e881",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "F2",
            "slot": 0
          }
        },
        {
          "id": "e882",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "F2",
            "slot": 1
          }
        },
        {
          "id": "e883",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "F2",
            "slot": 2
          }
        },
        {
          "id": "e884",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "F2",
            "slot": 3
          }
        },
        {
          "id": "e885",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "F2",
            "slot": 4
          }
        },
        {
          "id": "e886",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "F2",
            "slot": 5
          }
        },
        {
          "id": "e887",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "F2",
            "slot": 6
          }
        },
        {
          "id": "e888",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "F2",
            "slot": 7
          }
        },
        {
          "id": "e889",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "F3",
            "slot": 0
          }
        },
        {
          "id": "e890",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "F3",
            "slot": 1
          }
        },
        {
          "id": "e891",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "F3",
            "slot": 2
          }
        },
        {
          "id": "e892",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "F3",
            "slot": 3
          }
        },
        {
          "id": "e893",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "F3",
            "slot": 4
          }
        },
        {
          "id": "e894",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "F3",
            "slot": 5
          }
        },
        {
          "id": "e895",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "F3",
            "slot": 6
          }
        },
        {
          "id": "e896",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "F3",
            "slot": 7
          }
        }
      ],
      "groups": [
        {
          "id": "Al1+",
          "atomIds": [
            "Al1"
          ],
          "charge": 3,
          "bracket": true
        },
        {
          "id": "F1-",
          "atomIds": [
            "F1"
          ],
          "charge": -1,
          "bracket": true
        },
        {
          "id": "F2-",
          "atomIds": [
            "F2"
          ],
          "charge": -1,
          "bracket": true
        },
        {
          "id": "F3-",
          "atomIds": [
            "F3"
          ],
          "charge": -1,
          "bracket": true
        }
      ]
    },
    "viewBox": {
      "width": 1000,
      "height": 650,
      "atomRadius": 64,
      "hydrogenRadius": 40,
      "bondLength": 104,
      "shellOverlap": 24
    },
    "electronSlots": {
      "atom": {
        "directions": [
          -100,
          -80,
          -10,
          10,
          80,
          100,
          170,
          190
        ],
        "radius": 64,
        "hydrogenRadius": 40
      },
      "bond": {
        "maxPairs": 3,
        "centredInOverlap": true,
        "perpendicularOffsets": [
          -5,
          5
        ],
        "pairSpacing": 22
      }
    },
    "marking": {
      "cationShells": "empty-or-retained-full-shell",
      "geometryChecked": false,
      "speciesSpecific": false
    },
    "prerequisiteOrder": 63
  },
  {
    "id": "sodium-iodide",
    "name": "Sodium iodide",
    "formula": "NaI",
    "displayFormula": "NaI",
    "totalCharge": 0,
    "namedSpecies": false,
    "category": "ionic",
    "practiceCategory": "ionic",
    "extension": false,
    "grades": [
      1,
      2
    ],
    "scope": "specification",
    "atlasEvidence": null,
    "smiles": null,
    "prompt": "Draw the dot-and-cross diagram for the ions. Metal ions may show an empty former outer shell or a full retained shell: two electrons for Li⁺, eight for the other metals here. Distinguish gained electrons from the anion's own electrons. Use brackets and charges.",
    "explanation": "The metal loses its outer electron(s); those electrons are shown on the non-metal ion, whose brackets and charge identify the ion. No covalent shared pairs. Non-bonding inventory: 1 × I: 8 non-bonding electrons.",
    "sourceRefs": [
      "Edexcel International GCSE Chemistry specification Issue 3 (September 2024), sections 1.40 and 1.46; accessed 2026-09-12",
      "https://qualifications.pearson.com/content/dam/pdf/International%20GCSE/Chemistry/2017/specification-and-sample-assessments/international-gcse-chemistry-2017-specification.pdf"
    ],
    "reference": {
      "atoms": [
        {
          "id": "Na1",
          "element": "Na",
          "x": 180,
          "y": 220
        },
        {
          "id": "I1",
          "element": "I",
          "x": 500,
          "y": 220
        }
      ],
      "electrons": [
        {
          "id": "e897",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "I1",
            "slot": 0
          }
        },
        {
          "id": "e898",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "I1",
            "slot": 1
          }
        },
        {
          "id": "e899",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "I1",
            "slot": 2
          }
        },
        {
          "id": "e900",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "I1",
            "slot": 3
          }
        },
        {
          "id": "e901",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "I1",
            "slot": 4
          }
        },
        {
          "id": "e902",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "I1",
            "slot": 5
          }
        },
        {
          "id": "e903",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "I1",
            "slot": 6
          }
        },
        {
          "id": "e904",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "I1",
            "slot": 7
          }
        }
      ],
      "groups": [
        {
          "id": "Na1+",
          "atomIds": [
            "Na1"
          ],
          "charge": 1,
          "bracket": true
        },
        {
          "id": "I1-",
          "atomIds": [
            "I1"
          ],
          "charge": -1,
          "bracket": true
        }
      ]
    },
    "viewBox": {
      "width": 1000,
      "height": 650,
      "atomRadius": 64,
      "hydrogenRadius": 40,
      "bondLength": 104,
      "shellOverlap": 24
    },
    "electronSlots": {
      "atom": {
        "directions": [
          -100,
          -80,
          -10,
          10,
          80,
          100,
          170,
          190
        ],
        "radius": 64,
        "hydrogenRadius": 40
      },
      "bond": {
        "maxPairs": 3,
        "centredInOverlap": true,
        "perpendicularOffsets": [
          -5,
          5
        ],
        "pairSpacing": 22
      }
    },
    "marking": {
      "cationShells": "empty-or-retained-full-shell",
      "geometryChecked": false,
      "speciesSpecific": false
    },
    "prerequisiteOrder": 64
  },
  {
    "id": "magnesium-nitride",
    "name": "Magnesium nitride",
    "formula": "Mg3N2",
    "displayFormula": "Mg3N2",
    "totalCharge": 0,
    "namedSpecies": false,
    "category": "ionic",
    "practiceCategory": "ionic",
    "extension": false,
    "grades": [
      2
    ],
    "scope": "specification",
    "atlasEvidence": null,
    "smiles": null,
    "prompt": "Draw the dot-and-cross diagram for the ions. Metal ions may show an empty former outer shell or a full retained shell: two electrons for Li⁺, eight for the other metals here. Distinguish gained electrons from the anion's own electrons. Use brackets and charges.",
    "explanation": "The metal loses its outer electron(s); those electrons are shown on the non-metal ion, whose brackets and charge identify the ion. No covalent shared pairs. Non-bonding inventory: 2 × N: 8 non-bonding electrons.",
    "sourceRefs": [
      "Edexcel International GCSE Chemistry specification Issue 3 (September 2024), sections 1.40 and 1.46; accessed 2026-09-12",
      "https://qualifications.pearson.com/content/dam/pdf/International%20GCSE/Chemistry/2017/specification-and-sample-assessments/international-gcse-chemistry-2017-specification.pdf"
    ],
    "reference": {
      "atoms": [
        {
          "id": "Mg1",
          "element": "Mg",
          "x": 180,
          "y": 220
        },
        {
          "id": "Mg2",
          "element": "Mg",
          "x": 500,
          "y": 220
        },
        {
          "id": "Mg3",
          "element": "Mg",
          "x": 820,
          "y": 220
        },
        {
          "id": "N1",
          "element": "N",
          "x": 180,
          "y": 430
        },
        {
          "id": "N2",
          "element": "N",
          "x": 500,
          "y": 430
        }
      ],
      "electrons": [
        {
          "id": "e905",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "N1",
            "slot": 0
          }
        },
        {
          "id": "e906",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "N1",
            "slot": 1
          }
        },
        {
          "id": "e907",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "N1",
            "slot": 2
          }
        },
        {
          "id": "e908",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "N1",
            "slot": 3
          }
        },
        {
          "id": "e909",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "N1",
            "slot": 4
          }
        },
        {
          "id": "e910",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "N1",
            "slot": 5
          }
        },
        {
          "id": "e911",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "N1",
            "slot": 6
          }
        },
        {
          "id": "e912",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "N1",
            "slot": 7
          }
        },
        {
          "id": "e913",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "N2",
            "slot": 0
          }
        },
        {
          "id": "e914",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "N2",
            "slot": 1
          }
        },
        {
          "id": "e915",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "N2",
            "slot": 2
          }
        },
        {
          "id": "e916",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "N2",
            "slot": 3
          }
        },
        {
          "id": "e917",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "N2",
            "slot": 4
          }
        },
        {
          "id": "e918",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "N2",
            "slot": 5
          }
        },
        {
          "id": "e919",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "N2",
            "slot": 6
          }
        },
        {
          "id": "e920",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "N2",
            "slot": 7
          }
        }
      ],
      "groups": [
        {
          "id": "Mg1+",
          "atomIds": [
            "Mg1"
          ],
          "charge": 2,
          "bracket": true
        },
        {
          "id": "Mg2+",
          "atomIds": [
            "Mg2"
          ],
          "charge": 2,
          "bracket": true
        },
        {
          "id": "Mg3+",
          "atomIds": [
            "Mg3"
          ],
          "charge": 2,
          "bracket": true
        },
        {
          "id": "N1-",
          "atomIds": [
            "N1"
          ],
          "charge": -3,
          "bracket": true
        },
        {
          "id": "N2-",
          "atomIds": [
            "N2"
          ],
          "charge": -3,
          "bracket": true
        }
      ]
    },
    "viewBox": {
      "width": 1000,
      "height": 650,
      "atomRadius": 64,
      "hydrogenRadius": 40,
      "bondLength": 104,
      "shellOverlap": 24
    },
    "electronSlots": {
      "atom": {
        "directions": [
          -100,
          -80,
          -10,
          10,
          80,
          100,
          170,
          190
        ],
        "radius": 64,
        "hydrogenRadius": 40
      },
      "bond": {
        "maxPairs": 3,
        "centredInOverlap": true,
        "perpendicularOffsets": [
          -5,
          5
        ],
        "pairSpacing": 22
      }
    },
    "marking": {
      "cationShells": "empty-or-retained-full-shell",
      "geometryChecked": false,
      "speciesSpecific": false
    },
    "prerequisiteOrder": 65
  },
  {
    "id": "calcium-nitride",
    "name": "Calcium nitride",
    "formula": "Ca3N2",
    "displayFormula": "Ca3N2",
    "totalCharge": 0,
    "namedSpecies": false,
    "category": "ionic",
    "practiceCategory": "ionic",
    "extension": false,
    "grades": [
      2
    ],
    "scope": "specification",
    "atlasEvidence": null,
    "smiles": null,
    "prompt": "Draw the dot-and-cross diagram for the ions. Metal ions may show an empty former outer shell or a full retained shell: two electrons for Li⁺, eight for the other metals here. Distinguish gained electrons from the anion's own electrons. Use brackets and charges.",
    "explanation": "The metal loses its outer electron(s); those electrons are shown on the non-metal ion, whose brackets and charge identify the ion. No covalent shared pairs. Non-bonding inventory: 2 × N: 8 non-bonding electrons.",
    "sourceRefs": [
      "Edexcel International GCSE Chemistry specification Issue 3 (September 2024), sections 1.40 and 1.46; accessed 2026-09-12",
      "https://qualifications.pearson.com/content/dam/pdf/International%20GCSE/Chemistry/2017/specification-and-sample-assessments/international-gcse-chemistry-2017-specification.pdf"
    ],
    "reference": {
      "atoms": [
        {
          "id": "Ca1",
          "element": "Ca",
          "x": 180,
          "y": 220
        },
        {
          "id": "Ca2",
          "element": "Ca",
          "x": 500,
          "y": 220
        },
        {
          "id": "Ca3",
          "element": "Ca",
          "x": 820,
          "y": 220
        },
        {
          "id": "N1",
          "element": "N",
          "x": 180,
          "y": 430
        },
        {
          "id": "N2",
          "element": "N",
          "x": 500,
          "y": 430
        }
      ],
      "electrons": [
        {
          "id": "e921",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "N1",
            "slot": 0
          }
        },
        {
          "id": "e922",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "N1",
            "slot": 1
          }
        },
        {
          "id": "e923",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "N1",
            "slot": 2
          }
        },
        {
          "id": "e924",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "N1",
            "slot": 3
          }
        },
        {
          "id": "e925",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "N1",
            "slot": 4
          }
        },
        {
          "id": "e926",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "N1",
            "slot": 5
          }
        },
        {
          "id": "e927",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "N1",
            "slot": 6
          }
        },
        {
          "id": "e928",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "N1",
            "slot": 7
          }
        },
        {
          "id": "e929",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "N2",
            "slot": 0
          }
        },
        {
          "id": "e930",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "N2",
            "slot": 1
          }
        },
        {
          "id": "e931",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "N2",
            "slot": 2
          }
        },
        {
          "id": "e932",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "N2",
            "slot": 3
          }
        },
        {
          "id": "e933",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "N2",
            "slot": 4
          }
        },
        {
          "id": "e934",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "N2",
            "slot": 5
          }
        },
        {
          "id": "e935",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "N2",
            "slot": 6
          }
        },
        {
          "id": "e936",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "N2",
            "slot": 7
          }
        }
      ],
      "groups": [
        {
          "id": "Ca1+",
          "atomIds": [
            "Ca1"
          ],
          "charge": 2,
          "bracket": true
        },
        {
          "id": "Ca2+",
          "atomIds": [
            "Ca2"
          ],
          "charge": 2,
          "bracket": true
        },
        {
          "id": "Ca3+",
          "atomIds": [
            "Ca3"
          ],
          "charge": 2,
          "bracket": true
        },
        {
          "id": "N1-",
          "atomIds": [
            "N1"
          ],
          "charge": -3,
          "bracket": true
        },
        {
          "id": "N2-",
          "atomIds": [
            "N2"
          ],
          "charge": -3,
          "bracket": true
        }
      ]
    },
    "viewBox": {
      "width": 1000,
      "height": 650,
      "atomRadius": 64,
      "hydrogenRadius": 40,
      "bondLength": 104,
      "shellOverlap": 24
    },
    "electronSlots": {
      "atom": {
        "directions": [
          -100,
          -80,
          -10,
          10,
          80,
          100,
          170,
          190
        ],
        "radius": 64,
        "hydrogenRadius": 40
      },
      "bond": {
        "maxPairs": 3,
        "centredInOverlap": true,
        "perpendicularOffsets": [
          -5,
          5
        ],
        "pairSpacing": 22
      }
    },
    "marking": {
      "cationShells": "empty-or-retained-full-shell",
      "geometryChecked": false,
      "speciesSpecific": false
    },
    "prerequisiteOrder": 66
  },
  {
    "id": "sodium-sulfide",
    "name": "Sodium sulfide",
    "formula": "Na2S",
    "displayFormula": "Na2S",
    "totalCharge": 0,
    "namedSpecies": false,
    "category": "ionic",
    "practiceCategory": "ionic",
    "extension": false,
    "grades": [
      1,
      2
    ],
    "scope": "specification",
    "atlasEvidence": null,
    "smiles": null,
    "prompt": "Draw the dot-and-cross diagram for the ions. Metal ions may show an empty former outer shell or a full retained shell: two electrons for Li⁺, eight for the other metals here. Distinguish gained electrons from the anion's own electrons. Use brackets and charges.",
    "explanation": "The metal loses its outer electron(s); those electrons are shown on the non-metal ion, whose brackets and charge identify the ion. No covalent shared pairs. Non-bonding inventory: 1 × S: 8 non-bonding electrons.",
    "sourceRefs": [
      "Edexcel International GCSE Chemistry specification Issue 3 (September 2024), sections 1.40 and 1.46; accessed 2026-09-12",
      "https://qualifications.pearson.com/content/dam/pdf/International%20GCSE/Chemistry/2017/specification-and-sample-assessments/international-gcse-chemistry-2017-specification.pdf"
    ],
    "reference": {
      "atoms": [
        {
          "id": "Na1",
          "element": "Na",
          "x": 180,
          "y": 220
        },
        {
          "id": "Na2",
          "element": "Na",
          "x": 500,
          "y": 220
        },
        {
          "id": "S1",
          "element": "S",
          "x": 820,
          "y": 220
        }
      ],
      "electrons": [
        {
          "id": "e937",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "S1",
            "slot": 0
          }
        },
        {
          "id": "e938",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "S1",
            "slot": 1
          }
        },
        {
          "id": "e939",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "S1",
            "slot": 2
          }
        },
        {
          "id": "e940",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "S1",
            "slot": 3
          }
        },
        {
          "id": "e941",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "S1",
            "slot": 4
          }
        },
        {
          "id": "e942",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "S1",
            "slot": 5
          }
        },
        {
          "id": "e943",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "S1",
            "slot": 6
          }
        },
        {
          "id": "e944",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "S1",
            "slot": 7
          }
        }
      ],
      "groups": [
        {
          "id": "Na1+",
          "atomIds": [
            "Na1"
          ],
          "charge": 1,
          "bracket": true
        },
        {
          "id": "Na2+",
          "atomIds": [
            "Na2"
          ],
          "charge": 1,
          "bracket": true
        },
        {
          "id": "S1-",
          "atomIds": [
            "S1"
          ],
          "charge": -2,
          "bracket": true
        }
      ]
    },
    "viewBox": {
      "width": 1000,
      "height": 650,
      "atomRadius": 64,
      "hydrogenRadius": 40,
      "bondLength": 104,
      "shellOverlap": 24
    },
    "electronSlots": {
      "atom": {
        "directions": [
          -100,
          -80,
          -10,
          10,
          80,
          100,
          170,
          190
        ],
        "radius": 64,
        "hydrogenRadius": 40
      },
      "bond": {
        "maxPairs": 3,
        "centredInOverlap": true,
        "perpendicularOffsets": [
          -5,
          5
        ],
        "pairSpacing": 22
      }
    },
    "marking": {
      "cationShells": "empty-or-retained-full-shell",
      "geometryChecked": false,
      "speciesSpecific": false
    },
    "prerequisiteOrder": 67
  },
  {
    "id": "potassium-oxide",
    "name": "Potassium oxide",
    "formula": "K2O",
    "displayFormula": "K2O",
    "totalCharge": 0,
    "namedSpecies": false,
    "category": "ionic",
    "practiceCategory": "ionic",
    "extension": false,
    "grades": [
      1,
      2
    ],
    "scope": "specification",
    "atlasEvidence": [
      {
        "questionId": "2021-nov-2-q4b",
        "observedBand": "7-8",
        "basis": "resources/past-paper-atlas/data/atlas.json classification.band",
        "relationship": "diagram motif; original practice prompt"
      }
    ],
    "smiles": null,
    "prompt": "Draw the dot-and-cross diagram for the ions. Metal ions may show an empty former outer shell or a full retained shell: two electrons for Li⁺, eight for the other metals here. Distinguish gained electrons from the anion's own electrons. Use brackets and charges.",
    "explanation": "The metal loses its outer electron(s); those electrons are shown on the non-metal ion, whose brackets and charge identify the ion. No covalent shared pairs. Non-bonding inventory: 1 × O: 8 non-bonding electrons.",
    "sourceRefs": [
      "Edexcel International GCSE Chemistry specification Issue 3 (September 2024), sections 1.40 and 1.46; accessed 2026-09-12",
      "https://qualifications.pearson.com/content/dam/pdf/International%20GCSE/Chemistry/2017/specification-and-sample-assessments/international-gcse-chemistry-2017-specification.pdf",
      "resources/past-paper-atlas/data/atlas.json#2021-nov-2-q4b"
    ],
    "reference": {
      "atoms": [
        {
          "id": "K1",
          "element": "K",
          "x": 180,
          "y": 220
        },
        {
          "id": "K2",
          "element": "K",
          "x": 500,
          "y": 220
        },
        {
          "id": "O1",
          "element": "O",
          "x": 820,
          "y": 220
        }
      ],
      "electrons": [
        {
          "id": "e945",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "O1",
            "slot": 0
          }
        },
        {
          "id": "e946",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "O1",
            "slot": 1
          }
        },
        {
          "id": "e947",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "O1",
            "slot": 2
          }
        },
        {
          "id": "e948",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "O1",
            "slot": 3
          }
        },
        {
          "id": "e949",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "O1",
            "slot": 4
          }
        },
        {
          "id": "e950",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "O1",
            "slot": 5
          }
        },
        {
          "id": "e951",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "O1",
            "slot": 6
          }
        },
        {
          "id": "e952",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "O1",
            "slot": 7
          }
        }
      ],
      "groups": [
        {
          "id": "K1+",
          "atomIds": [
            "K1"
          ],
          "charge": 1,
          "bracket": true
        },
        {
          "id": "K2+",
          "atomIds": [
            "K2"
          ],
          "charge": 1,
          "bracket": true
        },
        {
          "id": "O1-",
          "atomIds": [
            "O1"
          ],
          "charge": -2,
          "bracket": true
        }
      ]
    },
    "viewBox": {
      "width": 1000,
      "height": 650,
      "atomRadius": 64,
      "hydrogenRadius": 40,
      "bondLength": 104,
      "shellOverlap": 24
    },
    "electronSlots": {
      "atom": {
        "directions": [
          -100,
          -80,
          -10,
          10,
          80,
          100,
          170,
          190
        ],
        "radius": 64,
        "hydrogenRadius": 40
      },
      "bond": {
        "maxPairs": 3,
        "centredInOverlap": true,
        "perpendicularOffsets": [
          -5,
          5
        ],
        "pairSpacing": 22
      }
    },
    "marking": {
      "cationShells": "empty-or-retained-full-shell",
      "geometryChecked": false,
      "speciesSpecific": false
    },
    "prerequisiteOrder": 68
  },
  {
    "id": "potassium-sulfide",
    "name": "Potassium sulfide",
    "formula": "K2S",
    "displayFormula": "K2S",
    "totalCharge": 0,
    "namedSpecies": false,
    "category": "ionic",
    "practiceCategory": "ionic",
    "extension": false,
    "grades": [
      1,
      2
    ],
    "scope": "specification",
    "atlasEvidence": null,
    "smiles": null,
    "prompt": "Draw the dot-and-cross diagram for the ions. Metal ions may show an empty former outer shell or a full retained shell: two electrons for Li⁺, eight for the other metals here. Distinguish gained electrons from the anion's own electrons. Use brackets and charges.",
    "explanation": "The metal loses its outer electron(s); those electrons are shown on the non-metal ion, whose brackets and charge identify the ion. No covalent shared pairs. Non-bonding inventory: 1 × S: 8 non-bonding electrons.",
    "sourceRefs": [
      "Edexcel International GCSE Chemistry specification Issue 3 (September 2024), sections 1.40 and 1.46; accessed 2026-09-12",
      "https://qualifications.pearson.com/content/dam/pdf/International%20GCSE/Chemistry/2017/specification-and-sample-assessments/international-gcse-chemistry-2017-specification.pdf"
    ],
    "reference": {
      "atoms": [
        {
          "id": "K1",
          "element": "K",
          "x": 180,
          "y": 220
        },
        {
          "id": "K2",
          "element": "K",
          "x": 500,
          "y": 220
        },
        {
          "id": "S1",
          "element": "S",
          "x": 820,
          "y": 220
        }
      ],
      "electrons": [
        {
          "id": "e953",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "S1",
            "slot": 0
          }
        },
        {
          "id": "e954",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "S1",
            "slot": 1
          }
        },
        {
          "id": "e955",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "S1",
            "slot": 2
          }
        },
        {
          "id": "e956",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "S1",
            "slot": 3
          }
        },
        {
          "id": "e957",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "S1",
            "slot": 4
          }
        },
        {
          "id": "e958",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "S1",
            "slot": 5
          }
        },
        {
          "id": "e959",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "S1",
            "slot": 6
          }
        },
        {
          "id": "e960",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "S1",
            "slot": 7
          }
        }
      ],
      "groups": [
        {
          "id": "K1+",
          "atomIds": [
            "K1"
          ],
          "charge": 1,
          "bracket": true
        },
        {
          "id": "K2+",
          "atomIds": [
            "K2"
          ],
          "charge": 1,
          "bracket": true
        },
        {
          "id": "S1-",
          "atomIds": [
            "S1"
          ],
          "charge": -2,
          "bracket": true
        }
      ]
    },
    "viewBox": {
      "width": 1000,
      "height": 650,
      "atomRadius": 64,
      "hydrogenRadius": 40,
      "bondLength": 104,
      "shellOverlap": 24
    },
    "electronSlots": {
      "atom": {
        "directions": [
          -100,
          -80,
          -10,
          10,
          80,
          100,
          170,
          190
        ],
        "radius": 64,
        "hydrogenRadius": 40
      },
      "bond": {
        "maxPairs": 3,
        "centredInOverlap": true,
        "perpendicularOffsets": [
          -5,
          5
        ],
        "pairSpacing": 22
      }
    },
    "marking": {
      "cationShells": "empty-or-retained-full-shell",
      "geometryChecked": false,
      "speciesSpecific": false
    },
    "prerequisiteOrder": 69
  },
  {
    "id": "naoh",
    "name": "Sodium hydroxide",
    "formula": "NaOH",
    "displayFormula": "NaOH",
    "totalCharge": 0,
    "namedSpecies": false,
    "category": "mixed",
    "practiceCategory": "ionic",
    "extension": true,
    "grades": [
      2
    ],
    "scope": "extension",
    "atlasEvidence": null,
    "smiles": null,
    "prompt": "Extension: draw the dot-and-cross diagram, including the hydroxide ion as a bracketed ion. Show outer-shell and transferred electrons, brackets and charges. Metal ions may show an empty shell or a full retained octet.",
    "explanation": "In hydroxide, oxygen supplies six original outer electrons, hydrogen supplies one for the O–H pair, and the metal supplies the transferred electron shown on oxygen. Bonds: 1 × H–O (1 shared pair). Non-bonding inventory: 1 × O: 6 non-bonding electrons.",
    "sourceRefs": [
      "Edexcel International GCSE Chemistry specification Issue 3 (September 2024), sections 1.40 and 1.46; accessed 2026-09-12",
      "https://qualifications.pearson.com/content/dam/pdf/International%20GCSE/Chemistry/2017/specification-and-sample-assessments/international-gcse-chemistry-2017-specification.pdf"
    ],
    "reference": {
      "atoms": [
        {
          "id": "Na1",
          "element": "Na",
          "x": 300,
          "y": 325
        },
        {
          "id": "O1",
          "element": "O",
          "x": 500,
          "y": 325
        },
        {
          "id": "H1",
          "element": "H",
          "x": 580,
          "y": 325
        }
      ],
      "electrons": [
        {
          "id": "e961",
          "symbol": "dot",
          "anchor": {
            "kind": "bond",
            "a": "O1",
            "b": "H1",
            "slot": 0
          }
        },
        {
          "id": "e962",
          "symbol": "cross",
          "anchor": {
            "kind": "bond",
            "a": "O1",
            "b": "H1",
            "slot": 1
          }
        },
        {
          "id": "e963",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "O1",
            "slot": 0
          }
        },
        {
          "id": "e964",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "O1",
            "slot": 1
          }
        },
        {
          "id": "e965",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "O1",
            "slot": 4
          }
        },
        {
          "id": "e966",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "O1",
            "slot": 5
          }
        },
        {
          "id": "e967",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "O1",
            "slot": 6
          }
        },
        {
          "id": "e968",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "O1",
            "slot": 7
          }
        }
      ],
      "groups": [
        {
          "id": "Na+",
          "atomIds": [
            "Na1"
          ],
          "charge": 1,
          "bracket": true
        },
        {
          "id": "OH-",
          "atomIds": [
            "O1",
            "H1"
          ],
          "charge": -1,
          "bracket": true
        }
      ]
    },
    "viewBox": {
      "width": 1000,
      "height": 650,
      "atomRadius": 64,
      "hydrogenRadius": 40,
      "bondLength": 104,
      "shellOverlap": 24
    },
    "electronSlots": {
      "atom": {
        "directions": [
          -100,
          -80,
          -10,
          10,
          80,
          100,
          170,
          190
        ],
        "radius": 64,
        "hydrogenRadius": 40
      },
      "bond": {
        "maxPairs": 3,
        "centredInOverlap": true,
        "perpendicularOffsets": [
          -5,
          5
        ],
        "pairSpacing": 22
      }
    },
    "marking": {
      "cationShells": "empty-or-retained-full-shell",
      "geometryChecked": false,
      "speciesSpecific": false
    },
    "prerequisiteOrder": 70
  },
  {
    "id": "caoh2",
    "name": "Calcium hydroxide",
    "formula": "Ca(OH)2",
    "displayFormula": "Ca(OH)2",
    "totalCharge": 0,
    "namedSpecies": false,
    "category": "mixed",
    "practiceCategory": "ionic",
    "extension": true,
    "grades": [
      2
    ],
    "scope": "extension",
    "atlasEvidence": null,
    "smiles": null,
    "prompt": "Extension: draw the dot-and-cross diagram, including the hydroxide ion as a bracketed ion. Show outer-shell and transferred electrons, brackets and charges. Metal ions may show an empty shell or a full retained octet.",
    "explanation": "In hydroxide, oxygen supplies six original outer electrons, hydrogen supplies one for the O–H pair, and the metal supplies the transferred electron shown on oxygen. Bonds: 2 × H–O (1 shared pair). Non-bonding inventory: 2 × O: 6 non-bonding electrons.",
    "sourceRefs": [
      "Edexcel International GCSE Chemistry specification Issue 3 (September 2024), sections 1.40 and 1.46; accessed 2026-09-12",
      "https://qualifications.pearson.com/content/dam/pdf/International%20GCSE/Chemistry/2017/specification-and-sample-assessments/international-gcse-chemistry-2017-specification.pdf"
    ],
    "reference": {
      "atoms": [
        {
          "id": "Ca1",
          "element": "Ca",
          "x": 200,
          "y": 325
        },
        {
          "id": "O1",
          "element": "O",
          "x": 500,
          "y": 235
        },
        {
          "id": "H1",
          "element": "H",
          "x": 580,
          "y": 235
        },
        {
          "id": "O2",
          "element": "O",
          "x": 500,
          "y": 415
        },
        {
          "id": "H2",
          "element": "H",
          "x": 580,
          "y": 415
        }
      ],
      "electrons": [
        {
          "id": "e969",
          "symbol": "dot",
          "anchor": {
            "kind": "bond",
            "a": "O1",
            "b": "H1",
            "slot": 0
          }
        },
        {
          "id": "e970",
          "symbol": "cross",
          "anchor": {
            "kind": "bond",
            "a": "O1",
            "b": "H1",
            "slot": 1
          }
        },
        {
          "id": "e971",
          "symbol": "dot",
          "anchor": {
            "kind": "bond",
            "a": "O2",
            "b": "H2",
            "slot": 0
          }
        },
        {
          "id": "e972",
          "symbol": "cross",
          "anchor": {
            "kind": "bond",
            "a": "O2",
            "b": "H2",
            "slot": 1
          }
        },
        {
          "id": "e973",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "O1",
            "slot": 0
          }
        },
        {
          "id": "e974",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "O1",
            "slot": 1
          }
        },
        {
          "id": "e975",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "O1",
            "slot": 4
          }
        },
        {
          "id": "e976",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "O1",
            "slot": 5
          }
        },
        {
          "id": "e977",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "O1",
            "slot": 6
          }
        },
        {
          "id": "e978",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "O1",
            "slot": 7
          }
        },
        {
          "id": "e979",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "O2",
            "slot": 0
          }
        },
        {
          "id": "e980",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "O2",
            "slot": 1
          }
        },
        {
          "id": "e981",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "O2",
            "slot": 4
          }
        },
        {
          "id": "e982",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "O2",
            "slot": 5
          }
        },
        {
          "id": "e983",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "O2",
            "slot": 6
          }
        },
        {
          "id": "e984",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "O2",
            "slot": 7
          }
        }
      ],
      "groups": [
        {
          "id": "Ca2+",
          "atomIds": [
            "Ca1"
          ],
          "charge": 2,
          "bracket": true
        },
        {
          "id": "OH1-",
          "atomIds": [
            "O1",
            "H1"
          ],
          "charge": -1,
          "bracket": true
        },
        {
          "id": "OH2-",
          "atomIds": [
            "O2",
            "H2"
          ],
          "charge": -1,
          "bracket": true
        }
      ]
    },
    "viewBox": {
      "width": 1000,
      "height": 650,
      "atomRadius": 64,
      "hydrogenRadius": 40,
      "bondLength": 104,
      "shellOverlap": 24
    },
    "electronSlots": {
      "atom": {
        "directions": [
          -100,
          -80,
          -10,
          10,
          80,
          100,
          170,
          190
        ],
        "radius": 64,
        "hydrogenRadius": 40
      },
      "bond": {
        "maxPairs": 3,
        "centredInOverlap": true,
        "perpendicularOffsets": [
          -5,
          5
        ],
        "pairSpacing": 22
      }
    },
    "marking": {
      "cationShells": "empty-or-retained-full-shell",
      "geometryChecked": false,
      "speciesSpecific": false
    },
    "prerequisiteOrder": 71
  },
  {
    "id": "peroxide-ion",
    "name": "peroxide ion",
    "formula": "O2",
    "displayFormula": "O₂²⁻",
    "totalCharge": -2,
    "namedSpecies": true,
    "category": "covalent",
    "practiceCategory": "covalent",
    "extension": false,
    "grades": [
      3
    ],
    "scope": "OCR A Level Chemistry A 2.2.2(a,e); authored peroxide transfer",
    "atlasEvidence": null,
    "smiles": null,
    "prompt": "Draw the dot-and-cross diagram for peroxide ion. Show all outer-shell electrons, a bracket around the whole ion, and its charge. Use a third symbol to distinguish the additional electron source.",
    "explanation": "The peroxide ion contains an O–O single bond. Each oxygen has three lone pairs and one gained electron; salts show the peroxide ion separately from its metal ion(s). Bonds: 1 × O–O (1 shared pair). Non-bonding inventory: 2 × O: 6 non-bonding electrons.",
    "sourceRefs": [
      "resources/a-level-past-paper-atlas/run2/specification-evidence/sections.json#2.2.2(a,e)"
    ],
    "reference": {
      "atoms": [
        {
          "id": "O1",
          "element": "O",
          "x": 300,
          "y": 325
        },
        {
          "id": "O2",
          "element": "O",
          "x": 404,
          "y": 325
        }
      ],
      "electrons": [
        {
          "id": "e985",
          "symbol": "dot",
          "anchor": {
            "kind": "bond",
            "a": "O1",
            "b": "O2",
            "slot": 0
          }
        },
        {
          "id": "e986",
          "symbol": "cross",
          "anchor": {
            "kind": "bond",
            "a": "O1",
            "b": "O2",
            "slot": 1
          }
        },
        {
          "id": "e987",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "O1",
            "slot": 0
          }
        },
        {
          "id": "e988",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "O1",
            "slot": 1
          }
        },
        {
          "id": "e989",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "O1",
            "slot": 2
          }
        },
        {
          "id": "e990",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "O1",
            "slot": 3
          }
        },
        {
          "id": "e991",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "O1",
            "slot": 4
          }
        },
        {
          "id": "e992",
          "symbol": "triangle",
          "anchor": {
            "kind": "atom",
            "atomId": "O1",
            "slot": 5
          }
        },
        {
          "id": "e993",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "O2",
            "slot": 0
          }
        },
        {
          "id": "e994",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "O2",
            "slot": 1
          }
        },
        {
          "id": "e995",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "O2",
            "slot": 2
          }
        },
        {
          "id": "e996",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "O2",
            "slot": 3
          }
        },
        {
          "id": "e997",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "O2",
            "slot": 4
          }
        },
        {
          "id": "e998",
          "symbol": "triangle",
          "anchor": {
            "kind": "atom",
            "atomId": "O2",
            "slot": 5
          }
        }
      ],
      "groups": [
        {
          "id": "O2^2-",
          "atomIds": [
            "O1",
            "O2"
          ],
          "charge": -2,
          "bracket": true
        }
      ]
    },
    "viewBox": {
      "width": 1000,
      "height": 650,
      "atomRadius": 64,
      "hydrogenRadius": 40,
      "bondLength": 104,
      "shellOverlap": 24
    },
    "electronSlots": {
      "atom": {
        "directions": [
          -100,
          -80,
          -10,
          10,
          80,
          100,
          170,
          190
        ],
        "radius": 64,
        "hydrogenRadius": 40
      },
      "bond": {
        "maxPairs": 3,
        "centredInOverlap": true,
        "perpendicularOffsets": [
          -5,
          5
        ],
        "pairSpacing": 22
      }
    },
    "marking": {
      "speciesSpecific": true,
      "shellTargets": {},
      "transferredSymbol": "triangle",
      "geometryChecked": false,
      "originAlternatives": [
        {
          "atoms": [
            {
              "id": "O1",
              "element": "O",
              "x": 300,
              "y": 325
            },
            {
              "id": "O2",
              "element": "O",
              "x": 404,
              "y": 325
            }
          ],
          "electrons": [
            {
              "id": "e985",
              "symbol": "triangle",
              "anchor": {
                "kind": "bond",
                "a": "O1",
                "b": "O2",
                "slot": 0
              }
            },
            {
              "id": "e986",
              "symbol": "cross",
              "anchor": {
                "kind": "bond",
                "a": "O1",
                "b": "O2",
                "slot": 1
              }
            },
            {
              "id": "e987",
              "symbol": "dot",
              "anchor": {
                "kind": "atom",
                "atomId": "O1",
                "slot": 0
              }
            },
            {
              "id": "e988",
              "symbol": "dot",
              "anchor": {
                "kind": "atom",
                "atomId": "O1",
                "slot": 1
              }
            },
            {
              "id": "e989",
              "symbol": "dot",
              "anchor": {
                "kind": "atom",
                "atomId": "O1",
                "slot": 2
              }
            },
            {
              "id": "e990",
              "symbol": "dot",
              "anchor": {
                "kind": "atom",
                "atomId": "O1",
                "slot": 3
              }
            },
            {
              "id": "e991",
              "symbol": "dot",
              "anchor": {
                "kind": "atom",
                "atomId": "O1",
                "slot": 4
              }
            },
            {
              "id": "e992",
              "symbol": "dot",
              "anchor": {
                "kind": "atom",
                "atomId": "O1",
                "slot": 5
              }
            },
            {
              "id": "e993",
              "symbol": "cross",
              "anchor": {
                "kind": "atom",
                "atomId": "O2",
                "slot": 0
              }
            },
            {
              "id": "e994",
              "symbol": "cross",
              "anchor": {
                "kind": "atom",
                "atomId": "O2",
                "slot": 1
              }
            },
            {
              "id": "e995",
              "symbol": "cross",
              "anchor": {
                "kind": "atom",
                "atomId": "O2",
                "slot": 2
              }
            },
            {
              "id": "e996",
              "symbol": "cross",
              "anchor": {
                "kind": "atom",
                "atomId": "O2",
                "slot": 3
              }
            },
            {
              "id": "e997",
              "symbol": "cross",
              "anchor": {
                "kind": "atom",
                "atomId": "O2",
                "slot": 4
              }
            },
            {
              "id": "e998",
              "symbol": "triangle",
              "anchor": {
                "kind": "atom",
                "atomId": "O2",
                "slot": 5
              }
            }
          ],
          "groups": [
            {
              "id": "O2^2-",
              "atomIds": [
                "O1",
                "O2"
              ],
              "charge": -2,
              "bracket": true
            }
          ]
        },
        {
          "atoms": [
            {
              "id": "O1",
              "element": "O",
              "x": 300,
              "y": 325
            },
            {
              "id": "O2",
              "element": "O",
              "x": 404,
              "y": 325
            }
          ],
          "electrons": [
            {
              "id": "e985",
              "symbol": "dot",
              "anchor": {
                "kind": "bond",
                "a": "O1",
                "b": "O2",
                "slot": 0
              }
            },
            {
              "id": "e986",
              "symbol": "triangle",
              "anchor": {
                "kind": "bond",
                "a": "O1",
                "b": "O2",
                "slot": 1
              }
            },
            {
              "id": "e987",
              "symbol": "dot",
              "anchor": {
                "kind": "atom",
                "atomId": "O1",
                "slot": 0
              }
            },
            {
              "id": "e988",
              "symbol": "dot",
              "anchor": {
                "kind": "atom",
                "atomId": "O1",
                "slot": 1
              }
            },
            {
              "id": "e989",
              "symbol": "dot",
              "anchor": {
                "kind": "atom",
                "atomId": "O1",
                "slot": 2
              }
            },
            {
              "id": "e990",
              "symbol": "dot",
              "anchor": {
                "kind": "atom",
                "atomId": "O1",
                "slot": 3
              }
            },
            {
              "id": "e991",
              "symbol": "dot",
              "anchor": {
                "kind": "atom",
                "atomId": "O1",
                "slot": 4
              }
            },
            {
              "id": "e992",
              "symbol": "triangle",
              "anchor": {
                "kind": "atom",
                "atomId": "O1",
                "slot": 5
              }
            },
            {
              "id": "e993",
              "symbol": "cross",
              "anchor": {
                "kind": "atom",
                "atomId": "O2",
                "slot": 0
              }
            },
            {
              "id": "e994",
              "symbol": "cross",
              "anchor": {
                "kind": "atom",
                "atomId": "O2",
                "slot": 1
              }
            },
            {
              "id": "e995",
              "symbol": "cross",
              "anchor": {
                "kind": "atom",
                "atomId": "O2",
                "slot": 2
              }
            },
            {
              "id": "e996",
              "symbol": "cross",
              "anchor": {
                "kind": "atom",
                "atomId": "O2",
                "slot": 3
              }
            },
            {
              "id": "e997",
              "symbol": "cross",
              "anchor": {
                "kind": "atom",
                "atomId": "O2",
                "slot": 4
              }
            },
            {
              "id": "e998",
              "symbol": "cross",
              "anchor": {
                "kind": "atom",
                "atomId": "O2",
                "slot": 5
              }
            }
          ],
          "groups": [
            {
              "id": "O2^2-",
              "atomIds": [
                "O1",
                "O2"
              ],
              "charge": -2,
              "bracket": true
            }
          ]
        },
        {
          "atoms": [
            {
              "id": "O1",
              "element": "O",
              "x": 300,
              "y": 325
            },
            {
              "id": "O2",
              "element": "O",
              "x": 404,
              "y": 325
            }
          ],
          "electrons": [
            {
              "id": "e985",
              "symbol": "triangle",
              "anchor": {
                "kind": "bond",
                "a": "O1",
                "b": "O2",
                "slot": 0
              }
            },
            {
              "id": "e986",
              "symbol": "triangle",
              "anchor": {
                "kind": "bond",
                "a": "O1",
                "b": "O2",
                "slot": 1
              }
            },
            {
              "id": "e987",
              "symbol": "dot",
              "anchor": {
                "kind": "atom",
                "atomId": "O1",
                "slot": 0
              }
            },
            {
              "id": "e988",
              "symbol": "dot",
              "anchor": {
                "kind": "atom",
                "atomId": "O1",
                "slot": 1
              }
            },
            {
              "id": "e989",
              "symbol": "dot",
              "anchor": {
                "kind": "atom",
                "atomId": "O1",
                "slot": 2
              }
            },
            {
              "id": "e990",
              "symbol": "dot",
              "anchor": {
                "kind": "atom",
                "atomId": "O1",
                "slot": 3
              }
            },
            {
              "id": "e991",
              "symbol": "dot",
              "anchor": {
                "kind": "atom",
                "atomId": "O1",
                "slot": 4
              }
            },
            {
              "id": "e992",
              "symbol": "dot",
              "anchor": {
                "kind": "atom",
                "atomId": "O1",
                "slot": 5
              }
            },
            {
              "id": "e993",
              "symbol": "cross",
              "anchor": {
                "kind": "atom",
                "atomId": "O2",
                "slot": 0
              }
            },
            {
              "id": "e994",
              "symbol": "cross",
              "anchor": {
                "kind": "atom",
                "atomId": "O2",
                "slot": 1
              }
            },
            {
              "id": "e995",
              "symbol": "cross",
              "anchor": {
                "kind": "atom",
                "atomId": "O2",
                "slot": 2
              }
            },
            {
              "id": "e996",
              "symbol": "cross",
              "anchor": {
                "kind": "atom",
                "atomId": "O2",
                "slot": 3
              }
            },
            {
              "id": "e997",
              "symbol": "cross",
              "anchor": {
                "kind": "atom",
                "atomId": "O2",
                "slot": 4
              }
            },
            {
              "id": "e998",
              "symbol": "cross",
              "anchor": {
                "kind": "atom",
                "atomId": "O2",
                "slot": 5
              }
            }
          ],
          "groups": [
            {
              "id": "O2^2-",
              "atomIds": [
                "O1",
                "O2"
              ],
              "charge": -2,
              "bracket": true
            }
          ]
        }
      ]
    }
  },
  {
    "id": "sodium-peroxide",
    "name": "sodium peroxide",
    "formula": "Na2O2",
    "displayFormula": "Na₂O₂",
    "totalCharge": 0,
    "namedSpecies": true,
    "category": "ionic",
    "practiceCategory": "ionic",
    "extension": false,
    "grades": [
      3
    ],
    "scope": "OCR A Level Chemistry A 2.2.2(a,e); authored peroxide transfer",
    "atlasEvidence": null,
    "smiles": null,
    "prompt": "Draw the dot-and-cross diagram for sodium peroxide. Show all outer-shell electrons, brackets around each ion, and their charges. Use a third symbol to distinguish the additional electron source.",
    "explanation": "The peroxide ion contains an O–O single bond. Each oxygen has three lone pairs and one gained electron; salts show the peroxide ion separately from its metal ion(s). Bonds: 1 × O–O (1 shared pair). Non-bonding inventory: 2 × O: 6 non-bonding electrons.",
    "sourceRefs": [
      "resources/a-level-past-paper-atlas/run2/specification-evidence/sections.json#2.2.2(a,e)"
    ],
    "reference": {
      "atoms": [
        {
          "id": "Na1",
          "element": "Na",
          "x": 180,
          "y": 325
        },
        {
          "id": "Na2",
          "element": "Na",
          "x": 820,
          "y": 325
        },
        {
          "id": "O1",
          "element": "O",
          "x": 448,
          "y": 325
        },
        {
          "id": "O2",
          "element": "O",
          "x": 552,
          "y": 325
        }
      ],
      "electrons": [
        {
          "id": "e999",
          "symbol": "dot",
          "anchor": {
            "kind": "bond",
            "a": "O1",
            "b": "O2",
            "slot": 0
          }
        },
        {
          "id": "e1000",
          "symbol": "cross",
          "anchor": {
            "kind": "bond",
            "a": "O1",
            "b": "O2",
            "slot": 1
          }
        },
        {
          "id": "e1001",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "O1",
            "slot": 0
          }
        },
        {
          "id": "e1002",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "O1",
            "slot": 1
          }
        },
        {
          "id": "e1003",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "O1",
            "slot": 2
          }
        },
        {
          "id": "e1004",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "O1",
            "slot": 3
          }
        },
        {
          "id": "e1005",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "O1",
            "slot": 4
          }
        },
        {
          "id": "e1006",
          "symbol": "triangle",
          "anchor": {
            "kind": "atom",
            "atomId": "O1",
            "slot": 5
          }
        },
        {
          "id": "e1007",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "O2",
            "slot": 0
          }
        },
        {
          "id": "e1008",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "O2",
            "slot": 1
          }
        },
        {
          "id": "e1009",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "O2",
            "slot": 2
          }
        },
        {
          "id": "e1010",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "O2",
            "slot": 3
          }
        },
        {
          "id": "e1011",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "O2",
            "slot": 4
          }
        },
        {
          "id": "e1012",
          "symbol": "triangle",
          "anchor": {
            "kind": "atom",
            "atomId": "O2",
            "slot": 5
          }
        }
      ],
      "groups": [
        {
          "id": "Na1+",
          "atomIds": [
            "Na1"
          ],
          "charge": 1,
          "bracket": true
        },
        {
          "id": "Na2+",
          "atomIds": [
            "Na2"
          ],
          "charge": 1,
          "bracket": true
        },
        {
          "id": "O2^2-",
          "atomIds": [
            "O1",
            "O2"
          ],
          "charge": -2,
          "bracket": true
        }
      ]
    },
    "viewBox": {
      "width": 1000,
      "height": 650,
      "atomRadius": 64,
      "hydrogenRadius": 40,
      "bondLength": 104,
      "shellOverlap": 24
    },
    "electronSlots": {
      "atom": {
        "directions": [
          -100,
          -80,
          -10,
          10,
          80,
          100,
          170,
          190
        ],
        "radius": 64,
        "hydrogenRadius": 40
      },
      "bond": {
        "maxPairs": 3,
        "centredInOverlap": true,
        "perpendicularOffsets": [
          -5,
          5
        ],
        "pairSpacing": 22
      }
    },
    "marking": {
      "speciesSpecific": true,
      "shellTargets": {},
      "transferredSymbol": "triangle",
      "geometryChecked": false,
      "originAlternatives": [
        {
          "atoms": [
            {
              "id": "Na1",
              "element": "Na",
              "x": 180,
              "y": 325
            },
            {
              "id": "Na2",
              "element": "Na",
              "x": 820,
              "y": 325
            },
            {
              "id": "O1",
              "element": "O",
              "x": 448,
              "y": 325
            },
            {
              "id": "O2",
              "element": "O",
              "x": 552,
              "y": 325
            }
          ],
          "electrons": [
            {
              "id": "e999",
              "symbol": "triangle",
              "anchor": {
                "kind": "bond",
                "a": "O1",
                "b": "O2",
                "slot": 0
              }
            },
            {
              "id": "e1000",
              "symbol": "cross",
              "anchor": {
                "kind": "bond",
                "a": "O1",
                "b": "O2",
                "slot": 1
              }
            },
            {
              "id": "e1001",
              "symbol": "dot",
              "anchor": {
                "kind": "atom",
                "atomId": "O1",
                "slot": 0
              }
            },
            {
              "id": "e1002",
              "symbol": "dot",
              "anchor": {
                "kind": "atom",
                "atomId": "O1",
                "slot": 1
              }
            },
            {
              "id": "e1003",
              "symbol": "dot",
              "anchor": {
                "kind": "atom",
                "atomId": "O1",
                "slot": 2
              }
            },
            {
              "id": "e1004",
              "symbol": "dot",
              "anchor": {
                "kind": "atom",
                "atomId": "O1",
                "slot": 3
              }
            },
            {
              "id": "e1005",
              "symbol": "dot",
              "anchor": {
                "kind": "atom",
                "atomId": "O1",
                "slot": 4
              }
            },
            {
              "id": "e1006",
              "symbol": "dot",
              "anchor": {
                "kind": "atom",
                "atomId": "O1",
                "slot": 5
              }
            },
            {
              "id": "e1007",
              "symbol": "cross",
              "anchor": {
                "kind": "atom",
                "atomId": "O2",
                "slot": 0
              }
            },
            {
              "id": "e1008",
              "symbol": "cross",
              "anchor": {
                "kind": "atom",
                "atomId": "O2",
                "slot": 1
              }
            },
            {
              "id": "e1009",
              "symbol": "cross",
              "anchor": {
                "kind": "atom",
                "atomId": "O2",
                "slot": 2
              }
            },
            {
              "id": "e1010",
              "symbol": "cross",
              "anchor": {
                "kind": "atom",
                "atomId": "O2",
                "slot": 3
              }
            },
            {
              "id": "e1011",
              "symbol": "cross",
              "anchor": {
                "kind": "atom",
                "atomId": "O2",
                "slot": 4
              }
            },
            {
              "id": "e1012",
              "symbol": "triangle",
              "anchor": {
                "kind": "atom",
                "atomId": "O2",
                "slot": 5
              }
            }
          ],
          "groups": [
            {
              "id": "Na1+",
              "atomIds": [
                "Na1"
              ],
              "charge": 1,
              "bracket": true
            },
            {
              "id": "Na2+",
              "atomIds": [
                "Na2"
              ],
              "charge": 1,
              "bracket": true
            },
            {
              "id": "O2^2-",
              "atomIds": [
                "O1",
                "O2"
              ],
              "charge": -2,
              "bracket": true
            }
          ]
        },
        {
          "atoms": [
            {
              "id": "Na1",
              "element": "Na",
              "x": 180,
              "y": 325
            },
            {
              "id": "Na2",
              "element": "Na",
              "x": 820,
              "y": 325
            },
            {
              "id": "O1",
              "element": "O",
              "x": 448,
              "y": 325
            },
            {
              "id": "O2",
              "element": "O",
              "x": 552,
              "y": 325
            }
          ],
          "electrons": [
            {
              "id": "e999",
              "symbol": "dot",
              "anchor": {
                "kind": "bond",
                "a": "O1",
                "b": "O2",
                "slot": 0
              }
            },
            {
              "id": "e1000",
              "symbol": "triangle",
              "anchor": {
                "kind": "bond",
                "a": "O1",
                "b": "O2",
                "slot": 1
              }
            },
            {
              "id": "e1001",
              "symbol": "dot",
              "anchor": {
                "kind": "atom",
                "atomId": "O1",
                "slot": 0
              }
            },
            {
              "id": "e1002",
              "symbol": "dot",
              "anchor": {
                "kind": "atom",
                "atomId": "O1",
                "slot": 1
              }
            },
            {
              "id": "e1003",
              "symbol": "dot",
              "anchor": {
                "kind": "atom",
                "atomId": "O1",
                "slot": 2
              }
            },
            {
              "id": "e1004",
              "symbol": "dot",
              "anchor": {
                "kind": "atom",
                "atomId": "O1",
                "slot": 3
              }
            },
            {
              "id": "e1005",
              "symbol": "dot",
              "anchor": {
                "kind": "atom",
                "atomId": "O1",
                "slot": 4
              }
            },
            {
              "id": "e1006",
              "symbol": "triangle",
              "anchor": {
                "kind": "atom",
                "atomId": "O1",
                "slot": 5
              }
            },
            {
              "id": "e1007",
              "symbol": "cross",
              "anchor": {
                "kind": "atom",
                "atomId": "O2",
                "slot": 0
              }
            },
            {
              "id": "e1008",
              "symbol": "cross",
              "anchor": {
                "kind": "atom",
                "atomId": "O2",
                "slot": 1
              }
            },
            {
              "id": "e1009",
              "symbol": "cross",
              "anchor": {
                "kind": "atom",
                "atomId": "O2",
                "slot": 2
              }
            },
            {
              "id": "e1010",
              "symbol": "cross",
              "anchor": {
                "kind": "atom",
                "atomId": "O2",
                "slot": 3
              }
            },
            {
              "id": "e1011",
              "symbol": "cross",
              "anchor": {
                "kind": "atom",
                "atomId": "O2",
                "slot": 4
              }
            },
            {
              "id": "e1012",
              "symbol": "cross",
              "anchor": {
                "kind": "atom",
                "atomId": "O2",
                "slot": 5
              }
            }
          ],
          "groups": [
            {
              "id": "Na1+",
              "atomIds": [
                "Na1"
              ],
              "charge": 1,
              "bracket": true
            },
            {
              "id": "Na2+",
              "atomIds": [
                "Na2"
              ],
              "charge": 1,
              "bracket": true
            },
            {
              "id": "O2^2-",
              "atomIds": [
                "O1",
                "O2"
              ],
              "charge": -2,
              "bracket": true
            }
          ]
        },
        {
          "atoms": [
            {
              "id": "Na1",
              "element": "Na",
              "x": 180,
              "y": 325
            },
            {
              "id": "Na2",
              "element": "Na",
              "x": 820,
              "y": 325
            },
            {
              "id": "O1",
              "element": "O",
              "x": 448,
              "y": 325
            },
            {
              "id": "O2",
              "element": "O",
              "x": 552,
              "y": 325
            }
          ],
          "electrons": [
            {
              "id": "e999",
              "symbol": "triangle",
              "anchor": {
                "kind": "bond",
                "a": "O1",
                "b": "O2",
                "slot": 0
              }
            },
            {
              "id": "e1000",
              "symbol": "triangle",
              "anchor": {
                "kind": "bond",
                "a": "O1",
                "b": "O2",
                "slot": 1
              }
            },
            {
              "id": "e1001",
              "symbol": "dot",
              "anchor": {
                "kind": "atom",
                "atomId": "O1",
                "slot": 0
              }
            },
            {
              "id": "e1002",
              "symbol": "dot",
              "anchor": {
                "kind": "atom",
                "atomId": "O1",
                "slot": 1
              }
            },
            {
              "id": "e1003",
              "symbol": "dot",
              "anchor": {
                "kind": "atom",
                "atomId": "O1",
                "slot": 2
              }
            },
            {
              "id": "e1004",
              "symbol": "dot",
              "anchor": {
                "kind": "atom",
                "atomId": "O1",
                "slot": 3
              }
            },
            {
              "id": "e1005",
              "symbol": "dot",
              "anchor": {
                "kind": "atom",
                "atomId": "O1",
                "slot": 4
              }
            },
            {
              "id": "e1006",
              "symbol": "dot",
              "anchor": {
                "kind": "atom",
                "atomId": "O1",
                "slot": 5
              }
            },
            {
              "id": "e1007",
              "symbol": "cross",
              "anchor": {
                "kind": "atom",
                "atomId": "O2",
                "slot": 0
              }
            },
            {
              "id": "e1008",
              "symbol": "cross",
              "anchor": {
                "kind": "atom",
                "atomId": "O2",
                "slot": 1
              }
            },
            {
              "id": "e1009",
              "symbol": "cross",
              "anchor": {
                "kind": "atom",
                "atomId": "O2",
                "slot": 2
              }
            },
            {
              "id": "e1010",
              "symbol": "cross",
              "anchor": {
                "kind": "atom",
                "atomId": "O2",
                "slot": 3
              }
            },
            {
              "id": "e1011",
              "symbol": "cross",
              "anchor": {
                "kind": "atom",
                "atomId": "O2",
                "slot": 4
              }
            },
            {
              "id": "e1012",
              "symbol": "cross",
              "anchor": {
                "kind": "atom",
                "atomId": "O2",
                "slot": 5
              }
            }
          ],
          "groups": [
            {
              "id": "Na1+",
              "atomIds": [
                "Na1"
              ],
              "charge": 1,
              "bracket": true
            },
            {
              "id": "Na2+",
              "atomIds": [
                "Na2"
              ],
              "charge": 1,
              "bracket": true
            },
            {
              "id": "O2^2-",
              "atomIds": [
                "O1",
                "O2"
              ],
              "charge": -2,
              "bracket": true
            }
          ]
        }
      ]
    }
  },
  {
    "id": "magnesium-peroxide",
    "name": "magnesium peroxide",
    "formula": "MgO2",
    "displayFormula": "MgO₂",
    "totalCharge": 0,
    "namedSpecies": true,
    "category": "ionic",
    "practiceCategory": "ionic",
    "extension": false,
    "grades": [
      3
    ],
    "scope": "OCR A Level Chemistry A 2.2.2(a,e); authored peroxide transfer",
    "atlasEvidence": null,
    "smiles": null,
    "prompt": "Draw the dot-and-cross diagram for magnesium peroxide. Show all outer-shell electrons, brackets around each ion, and their charges. Use a third symbol to distinguish the additional electron source.",
    "explanation": "The peroxide ion contains an O–O single bond. Each oxygen has three lone pairs and one gained electron; salts show the peroxide ion separately from its metal ion(s). Bonds: 1 × O–O (1 shared pair). Non-bonding inventory: 2 × O: 6 non-bonding electrons.",
    "sourceRefs": [
      "resources/a-level-past-paper-atlas/run2/specification-evidence/sections.json#2.2.2(a,e)"
    ],
    "reference": {
      "atoms": [
        {
          "id": "Mg1",
          "element": "Mg",
          "x": 180,
          "y": 325
        },
        {
          "id": "O1",
          "element": "O",
          "x": 500,
          "y": 325
        },
        {
          "id": "O2",
          "element": "O",
          "x": 604,
          "y": 325
        }
      ],
      "electrons": [
        {
          "id": "e1013",
          "symbol": "dot",
          "anchor": {
            "kind": "bond",
            "a": "O1",
            "b": "O2",
            "slot": 0
          }
        },
        {
          "id": "e1014",
          "symbol": "cross",
          "anchor": {
            "kind": "bond",
            "a": "O1",
            "b": "O2",
            "slot": 1
          }
        },
        {
          "id": "e1015",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "O1",
            "slot": 0
          }
        },
        {
          "id": "e1016",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "O1",
            "slot": 1
          }
        },
        {
          "id": "e1017",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "O1",
            "slot": 2
          }
        },
        {
          "id": "e1018",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "O1",
            "slot": 3
          }
        },
        {
          "id": "e1019",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "O1",
            "slot": 4
          }
        },
        {
          "id": "e1020",
          "symbol": "triangle",
          "anchor": {
            "kind": "atom",
            "atomId": "O1",
            "slot": 5
          }
        },
        {
          "id": "e1021",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "O2",
            "slot": 0
          }
        },
        {
          "id": "e1022",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "O2",
            "slot": 1
          }
        },
        {
          "id": "e1023",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "O2",
            "slot": 2
          }
        },
        {
          "id": "e1024",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "O2",
            "slot": 3
          }
        },
        {
          "id": "e1025",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "O2",
            "slot": 4
          }
        },
        {
          "id": "e1026",
          "symbol": "triangle",
          "anchor": {
            "kind": "atom",
            "atomId": "O2",
            "slot": 5
          }
        }
      ],
      "groups": [
        {
          "id": "Mg2+",
          "atomIds": [
            "Mg1"
          ],
          "charge": 2,
          "bracket": true
        },
        {
          "id": "O2^2-",
          "atomIds": [
            "O1",
            "O2"
          ],
          "charge": -2,
          "bracket": true
        }
      ]
    },
    "viewBox": {
      "width": 1000,
      "height": 650,
      "atomRadius": 64,
      "hydrogenRadius": 40,
      "bondLength": 104,
      "shellOverlap": 24
    },
    "electronSlots": {
      "atom": {
        "directions": [
          -100,
          -80,
          -10,
          10,
          80,
          100,
          170,
          190
        ],
        "radius": 64,
        "hydrogenRadius": 40
      },
      "bond": {
        "maxPairs": 3,
        "centredInOverlap": true,
        "perpendicularOffsets": [
          -5,
          5
        ],
        "pairSpacing": 22
      }
    },
    "marking": {
      "speciesSpecific": true,
      "shellTargets": {},
      "transferredSymbol": "triangle",
      "geometryChecked": false,
      "originAlternatives": [
        {
          "atoms": [
            {
              "id": "Mg1",
              "element": "Mg",
              "x": 180,
              "y": 325
            },
            {
              "id": "O1",
              "element": "O",
              "x": 500,
              "y": 325
            },
            {
              "id": "O2",
              "element": "O",
              "x": 604,
              "y": 325
            }
          ],
          "electrons": [
            {
              "id": "e1013",
              "symbol": "triangle",
              "anchor": {
                "kind": "bond",
                "a": "O1",
                "b": "O2",
                "slot": 0
              }
            },
            {
              "id": "e1014",
              "symbol": "cross",
              "anchor": {
                "kind": "bond",
                "a": "O1",
                "b": "O2",
                "slot": 1
              }
            },
            {
              "id": "e1015",
              "symbol": "dot",
              "anchor": {
                "kind": "atom",
                "atomId": "O1",
                "slot": 0
              }
            },
            {
              "id": "e1016",
              "symbol": "dot",
              "anchor": {
                "kind": "atom",
                "atomId": "O1",
                "slot": 1
              }
            },
            {
              "id": "e1017",
              "symbol": "dot",
              "anchor": {
                "kind": "atom",
                "atomId": "O1",
                "slot": 2
              }
            },
            {
              "id": "e1018",
              "symbol": "dot",
              "anchor": {
                "kind": "atom",
                "atomId": "O1",
                "slot": 3
              }
            },
            {
              "id": "e1019",
              "symbol": "dot",
              "anchor": {
                "kind": "atom",
                "atomId": "O1",
                "slot": 4
              }
            },
            {
              "id": "e1020",
              "symbol": "dot",
              "anchor": {
                "kind": "atom",
                "atomId": "O1",
                "slot": 5
              }
            },
            {
              "id": "e1021",
              "symbol": "cross",
              "anchor": {
                "kind": "atom",
                "atomId": "O2",
                "slot": 0
              }
            },
            {
              "id": "e1022",
              "symbol": "cross",
              "anchor": {
                "kind": "atom",
                "atomId": "O2",
                "slot": 1
              }
            },
            {
              "id": "e1023",
              "symbol": "cross",
              "anchor": {
                "kind": "atom",
                "atomId": "O2",
                "slot": 2
              }
            },
            {
              "id": "e1024",
              "symbol": "cross",
              "anchor": {
                "kind": "atom",
                "atomId": "O2",
                "slot": 3
              }
            },
            {
              "id": "e1025",
              "symbol": "cross",
              "anchor": {
                "kind": "atom",
                "atomId": "O2",
                "slot": 4
              }
            },
            {
              "id": "e1026",
              "symbol": "triangle",
              "anchor": {
                "kind": "atom",
                "atomId": "O2",
                "slot": 5
              }
            }
          ],
          "groups": [
            {
              "id": "Mg2+",
              "atomIds": [
                "Mg1"
              ],
              "charge": 2,
              "bracket": true
            },
            {
              "id": "O2^2-",
              "atomIds": [
                "O1",
                "O2"
              ],
              "charge": -2,
              "bracket": true
            }
          ]
        },
        {
          "atoms": [
            {
              "id": "Mg1",
              "element": "Mg",
              "x": 180,
              "y": 325
            },
            {
              "id": "O1",
              "element": "O",
              "x": 500,
              "y": 325
            },
            {
              "id": "O2",
              "element": "O",
              "x": 604,
              "y": 325
            }
          ],
          "electrons": [
            {
              "id": "e1013",
              "symbol": "dot",
              "anchor": {
                "kind": "bond",
                "a": "O1",
                "b": "O2",
                "slot": 0
              }
            },
            {
              "id": "e1014",
              "symbol": "triangle",
              "anchor": {
                "kind": "bond",
                "a": "O1",
                "b": "O2",
                "slot": 1
              }
            },
            {
              "id": "e1015",
              "symbol": "dot",
              "anchor": {
                "kind": "atom",
                "atomId": "O1",
                "slot": 0
              }
            },
            {
              "id": "e1016",
              "symbol": "dot",
              "anchor": {
                "kind": "atom",
                "atomId": "O1",
                "slot": 1
              }
            },
            {
              "id": "e1017",
              "symbol": "dot",
              "anchor": {
                "kind": "atom",
                "atomId": "O1",
                "slot": 2
              }
            },
            {
              "id": "e1018",
              "symbol": "dot",
              "anchor": {
                "kind": "atom",
                "atomId": "O1",
                "slot": 3
              }
            },
            {
              "id": "e1019",
              "symbol": "dot",
              "anchor": {
                "kind": "atom",
                "atomId": "O1",
                "slot": 4
              }
            },
            {
              "id": "e1020",
              "symbol": "triangle",
              "anchor": {
                "kind": "atom",
                "atomId": "O1",
                "slot": 5
              }
            },
            {
              "id": "e1021",
              "symbol": "cross",
              "anchor": {
                "kind": "atom",
                "atomId": "O2",
                "slot": 0
              }
            },
            {
              "id": "e1022",
              "symbol": "cross",
              "anchor": {
                "kind": "atom",
                "atomId": "O2",
                "slot": 1
              }
            },
            {
              "id": "e1023",
              "symbol": "cross",
              "anchor": {
                "kind": "atom",
                "atomId": "O2",
                "slot": 2
              }
            },
            {
              "id": "e1024",
              "symbol": "cross",
              "anchor": {
                "kind": "atom",
                "atomId": "O2",
                "slot": 3
              }
            },
            {
              "id": "e1025",
              "symbol": "cross",
              "anchor": {
                "kind": "atom",
                "atomId": "O2",
                "slot": 4
              }
            },
            {
              "id": "e1026",
              "symbol": "cross",
              "anchor": {
                "kind": "atom",
                "atomId": "O2",
                "slot": 5
              }
            }
          ],
          "groups": [
            {
              "id": "Mg2+",
              "atomIds": [
                "Mg1"
              ],
              "charge": 2,
              "bracket": true
            },
            {
              "id": "O2^2-",
              "atomIds": [
                "O1",
                "O2"
              ],
              "charge": -2,
              "bracket": true
            }
          ]
        },
        {
          "atoms": [
            {
              "id": "Mg1",
              "element": "Mg",
              "x": 180,
              "y": 325
            },
            {
              "id": "O1",
              "element": "O",
              "x": 500,
              "y": 325
            },
            {
              "id": "O2",
              "element": "O",
              "x": 604,
              "y": 325
            }
          ],
          "electrons": [
            {
              "id": "e1013",
              "symbol": "triangle",
              "anchor": {
                "kind": "bond",
                "a": "O1",
                "b": "O2",
                "slot": 0
              }
            },
            {
              "id": "e1014",
              "symbol": "triangle",
              "anchor": {
                "kind": "bond",
                "a": "O1",
                "b": "O2",
                "slot": 1
              }
            },
            {
              "id": "e1015",
              "symbol": "dot",
              "anchor": {
                "kind": "atom",
                "atomId": "O1",
                "slot": 0
              }
            },
            {
              "id": "e1016",
              "symbol": "dot",
              "anchor": {
                "kind": "atom",
                "atomId": "O1",
                "slot": 1
              }
            },
            {
              "id": "e1017",
              "symbol": "dot",
              "anchor": {
                "kind": "atom",
                "atomId": "O1",
                "slot": 2
              }
            },
            {
              "id": "e1018",
              "symbol": "dot",
              "anchor": {
                "kind": "atom",
                "atomId": "O1",
                "slot": 3
              }
            },
            {
              "id": "e1019",
              "symbol": "dot",
              "anchor": {
                "kind": "atom",
                "atomId": "O1",
                "slot": 4
              }
            },
            {
              "id": "e1020",
              "symbol": "dot",
              "anchor": {
                "kind": "atom",
                "atomId": "O1",
                "slot": 5
              }
            },
            {
              "id": "e1021",
              "symbol": "cross",
              "anchor": {
                "kind": "atom",
                "atomId": "O2",
                "slot": 0
              }
            },
            {
              "id": "e1022",
              "symbol": "cross",
              "anchor": {
                "kind": "atom",
                "atomId": "O2",
                "slot": 1
              }
            },
            {
              "id": "e1023",
              "symbol": "cross",
              "anchor": {
                "kind": "atom",
                "atomId": "O2",
                "slot": 2
              }
            },
            {
              "id": "e1024",
              "symbol": "cross",
              "anchor": {
                "kind": "atom",
                "atomId": "O2",
                "slot": 3
              }
            },
            {
              "id": "e1025",
              "symbol": "cross",
              "anchor": {
                "kind": "atom",
                "atomId": "O2",
                "slot": 4
              }
            },
            {
              "id": "e1026",
              "symbol": "cross",
              "anchor": {
                "kind": "atom",
                "atomId": "O2",
                "slot": 5
              }
            }
          ],
          "groups": [
            {
              "id": "Mg2+",
              "atomIds": [
                "Mg1"
              ],
              "charge": 2,
              "bracket": true
            },
            {
              "id": "O2^2-",
              "atomIds": [
                "O1",
                "O2"
              ],
              "charge": -2,
              "bracket": true
            }
          ]
        }
      ]
    }
  },
  {
    "id": "nitrogen-trichloride",
    "name": "nitrogen trichloride",
    "formula": "NCl3",
    "displayFormula": "NCl₃",
    "totalCharge": 0,
    "namedSpecies": true,
    "category": "covalent",
    "practiceCategory": "covalent",
    "extension": false,
    "grades": [
      2
    ],
    "scope": "OCR A Level Chemistry A 2.2.2(a,e)",
    "atlasEvidence": null,
    "smiles": null,
    "prompt": "Draw the dot-and-cross diagram for nitrogen trichloride. Show all outer-shell electrons.",
    "explanation": "This named species has 3 single shared pairs and 2 non-bonding electrons on the central atom. Bonds: 3 × Cl–N (1 shared pair). Non-bonding inventory: 1 × N: 2 non-bonding electrons; 3 × Cl: 6 non-bonding electrons.",
    "sourceRefs": [
      "resources/a-level-past-paper-atlas/run2/specification-evidence/sections.json#2.2.2(a,e)",
      "resources/a-level-past-paper-atlas/data/review-bundle.json#OCR_2016_JUN_H032-01_Q07"
    ],
    "reference": {
      "atoms": [
        {
          "id": "N1",
          "element": "N",
          "x": 500,
          "y": 325
        },
        {
          "id": "Cl1",
          "element": "Cl",
          "x": 500,
          "y": 221
        },
        {
          "id": "Cl2",
          "element": "Cl",
          "x": 590.0666419935816,
          "y": 377
        },
        {
          "id": "Cl3",
          "element": "Cl",
          "x": 409.9333580064184,
          "y": 377.00000000000006
        }
      ],
      "electrons": [
        {
          "id": "e1027",
          "symbol": "dot",
          "anchor": {
            "kind": "bond",
            "a": "N1",
            "b": "Cl1",
            "slot": 0
          }
        },
        {
          "id": "e1028",
          "symbol": "cross",
          "anchor": {
            "kind": "bond",
            "a": "N1",
            "b": "Cl1",
            "slot": 1
          }
        },
        {
          "id": "e1029",
          "symbol": "dot",
          "anchor": {
            "kind": "bond",
            "a": "N1",
            "b": "Cl2",
            "slot": 0
          }
        },
        {
          "id": "e1030",
          "symbol": "cross",
          "anchor": {
            "kind": "bond",
            "a": "N1",
            "b": "Cl2",
            "slot": 1
          }
        },
        {
          "id": "e1031",
          "symbol": "dot",
          "anchor": {
            "kind": "bond",
            "a": "N1",
            "b": "Cl3",
            "slot": 0
          }
        },
        {
          "id": "e1032",
          "symbol": "cross",
          "anchor": {
            "kind": "bond",
            "a": "N1",
            "b": "Cl3",
            "slot": 1
          }
        },
        {
          "id": "e1033",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "N1",
            "slot": 0
          }
        },
        {
          "id": "e1034",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "N1",
            "slot": 1
          }
        },
        {
          "id": "e1035",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "Cl1",
            "slot": 0
          }
        },
        {
          "id": "e1036",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "Cl1",
            "slot": 1
          }
        },
        {
          "id": "e1037",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "Cl1",
            "slot": 2
          }
        },
        {
          "id": "e1038",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "Cl1",
            "slot": 3
          }
        },
        {
          "id": "e1039",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "Cl1",
            "slot": 4
          }
        },
        {
          "id": "e1040",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "Cl1",
            "slot": 5
          }
        },
        {
          "id": "e1041",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "Cl2",
            "slot": 0
          }
        },
        {
          "id": "e1042",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "Cl2",
            "slot": 1
          }
        },
        {
          "id": "e1043",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "Cl2",
            "slot": 2
          }
        },
        {
          "id": "e1044",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "Cl2",
            "slot": 3
          }
        },
        {
          "id": "e1045",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "Cl2",
            "slot": 4
          }
        },
        {
          "id": "e1046",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "Cl2",
            "slot": 5
          }
        },
        {
          "id": "e1047",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "Cl3",
            "slot": 0
          }
        },
        {
          "id": "e1048",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "Cl3",
            "slot": 1
          }
        },
        {
          "id": "e1049",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "Cl3",
            "slot": 2
          }
        },
        {
          "id": "e1050",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "Cl3",
            "slot": 3
          }
        },
        {
          "id": "e1051",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "Cl3",
            "slot": 4
          }
        },
        {
          "id": "e1052",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "Cl3",
            "slot": 5
          }
        }
      ],
      "groups": []
    },
    "viewBox": {
      "width": 1000,
      "height": 650,
      "atomRadius": 64,
      "hydrogenRadius": 40,
      "bondLength": 104,
      "shellOverlap": 24
    },
    "electronSlots": {
      "atom": {
        "directions": [
          -100,
          -80,
          -10,
          10,
          80,
          100,
          170,
          190
        ],
        "radius": 64,
        "hydrogenRadius": 40
      },
      "bond": {
        "maxPairs": 3,
        "centredInOverlap": true,
        "perpendicularOffsets": [
          -5,
          5
        ],
        "pairSpacing": 22
      }
    },
    "marking": {
      "speciesSpecific": true,
      "shellTargets": {},
      "transferredSymbol": null,
      "geometryChecked": false
    }
  },
  {
    "id": "nitrogen-trifluoride",
    "name": "nitrogen trifluoride",
    "formula": "NF3",
    "displayFormula": "NF₃",
    "totalCharge": 0,
    "namedSpecies": true,
    "category": "covalent",
    "practiceCategory": "covalent",
    "extension": false,
    "grades": [
      2
    ],
    "scope": "OCR A Level Chemistry A 2.2.2(a,e)",
    "atlasEvidence": null,
    "smiles": null,
    "prompt": "Draw the dot-and-cross diagram for nitrogen trifluoride. Show all outer-shell electrons.",
    "explanation": "This named species has 3 single shared pairs and 2 non-bonding electrons on the central atom. Bonds: 3 × F–N (1 shared pair). Non-bonding inventory: 1 × N: 2 non-bonding electrons; 3 × F: 6 non-bonding electrons.",
    "sourceRefs": [
      "resources/a-level-past-paper-atlas/run2/specification-evidence/sections.json#2.2.2(a,e)",
      "resources/a-level-past-paper-atlas/data/review-bundle.json#OCR_2023_JUN_H032-01_Q21_P_A_II"
    ],
    "reference": {
      "atoms": [
        {
          "id": "N1",
          "element": "N",
          "x": 500,
          "y": 325
        },
        {
          "id": "F1",
          "element": "F",
          "x": 500,
          "y": 221
        },
        {
          "id": "F2",
          "element": "F",
          "x": 590.0666419935816,
          "y": 377
        },
        {
          "id": "F3",
          "element": "F",
          "x": 409.9333580064184,
          "y": 377.00000000000006
        }
      ],
      "electrons": [
        {
          "id": "e1053",
          "symbol": "dot",
          "anchor": {
            "kind": "bond",
            "a": "N1",
            "b": "F1",
            "slot": 0
          }
        },
        {
          "id": "e1054",
          "symbol": "cross",
          "anchor": {
            "kind": "bond",
            "a": "N1",
            "b": "F1",
            "slot": 1
          }
        },
        {
          "id": "e1055",
          "symbol": "dot",
          "anchor": {
            "kind": "bond",
            "a": "N1",
            "b": "F2",
            "slot": 0
          }
        },
        {
          "id": "e1056",
          "symbol": "cross",
          "anchor": {
            "kind": "bond",
            "a": "N1",
            "b": "F2",
            "slot": 1
          }
        },
        {
          "id": "e1057",
          "symbol": "dot",
          "anchor": {
            "kind": "bond",
            "a": "N1",
            "b": "F3",
            "slot": 0
          }
        },
        {
          "id": "e1058",
          "symbol": "cross",
          "anchor": {
            "kind": "bond",
            "a": "N1",
            "b": "F3",
            "slot": 1
          }
        },
        {
          "id": "e1059",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "N1",
            "slot": 0
          }
        },
        {
          "id": "e1060",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "N1",
            "slot": 1
          }
        },
        {
          "id": "e1061",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "F1",
            "slot": 0
          }
        },
        {
          "id": "e1062",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "F1",
            "slot": 1
          }
        },
        {
          "id": "e1063",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "F1",
            "slot": 2
          }
        },
        {
          "id": "e1064",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "F1",
            "slot": 3
          }
        },
        {
          "id": "e1065",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "F1",
            "slot": 4
          }
        },
        {
          "id": "e1066",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "F1",
            "slot": 5
          }
        },
        {
          "id": "e1067",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "F2",
            "slot": 0
          }
        },
        {
          "id": "e1068",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "F2",
            "slot": 1
          }
        },
        {
          "id": "e1069",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "F2",
            "slot": 2
          }
        },
        {
          "id": "e1070",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "F2",
            "slot": 3
          }
        },
        {
          "id": "e1071",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "F2",
            "slot": 4
          }
        },
        {
          "id": "e1072",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "F2",
            "slot": 5
          }
        },
        {
          "id": "e1073",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "F3",
            "slot": 0
          }
        },
        {
          "id": "e1074",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "F3",
            "slot": 1
          }
        },
        {
          "id": "e1075",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "F3",
            "slot": 2
          }
        },
        {
          "id": "e1076",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "F3",
            "slot": 3
          }
        },
        {
          "id": "e1077",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "F3",
            "slot": 4
          }
        },
        {
          "id": "e1078",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "F3",
            "slot": 5
          }
        }
      ],
      "groups": []
    },
    "viewBox": {
      "width": 1000,
      "height": 650,
      "atomRadius": 64,
      "hydrogenRadius": 40,
      "bondLength": 104,
      "shellOverlap": 24
    },
    "electronSlots": {
      "atom": {
        "directions": [
          -100,
          -80,
          -10,
          10,
          80,
          100,
          170,
          190
        ],
        "radius": 64,
        "hydrogenRadius": 40
      },
      "bond": {
        "maxPairs": 3,
        "centredInOverlap": true,
        "perpendicularOffsets": [
          -5,
          5
        ],
        "pairSpacing": 22
      }
    },
    "marking": {
      "speciesSpecific": true,
      "shellTargets": {},
      "transferredSymbol": null,
      "geometryChecked": false
    }
  },
  {
    "id": "sulfur-difluoride",
    "name": "sulfur difluoride",
    "formula": "SF2",
    "displayFormula": "SF₂",
    "totalCharge": 0,
    "namedSpecies": true,
    "category": "covalent",
    "practiceCategory": "covalent",
    "extension": false,
    "grades": [
      2
    ],
    "scope": "OCR A Level Chemistry A 2.2.2(a,e)",
    "atlasEvidence": null,
    "smiles": null,
    "prompt": "Draw the dot-and-cross diagram for sulfur difluoride. Show all outer-shell electrons.",
    "explanation": "This named species has 2 single shared pairs and 4 non-bonding electrons on the central atom. Bonds: 2 × F–S (1 shared pair). Non-bonding inventory: 1 × S: 4 non-bonding electrons; 2 × F: 6 non-bonding electrons.",
    "sourceRefs": [
      "resources/a-level-past-paper-atlas/run2/specification-evidence/sections.json#2.2.2(a,e)",
      "resources/a-level-past-paper-atlas/data/review-bundle.json#OCR_2021_OCT_H032-02_Q01_P_B"
    ],
    "reference": {
      "atoms": [
        {
          "id": "S1",
          "element": "S",
          "x": 500,
          "y": 325
        },
        {
          "id": "F1",
          "element": "F",
          "x": 604,
          "y": 325
        },
        {
          "id": "F2",
          "element": "F",
          "x": 396,
          "y": 325
        }
      ],
      "electrons": [
        {
          "id": "e1079",
          "symbol": "dot",
          "anchor": {
            "kind": "bond",
            "a": "S1",
            "b": "F1",
            "slot": 0
          }
        },
        {
          "id": "e1080",
          "symbol": "cross",
          "anchor": {
            "kind": "bond",
            "a": "S1",
            "b": "F1",
            "slot": 1
          }
        },
        {
          "id": "e1081",
          "symbol": "dot",
          "anchor": {
            "kind": "bond",
            "a": "S1",
            "b": "F2",
            "slot": 0
          }
        },
        {
          "id": "e1082",
          "symbol": "cross",
          "anchor": {
            "kind": "bond",
            "a": "S1",
            "b": "F2",
            "slot": 1
          }
        },
        {
          "id": "e1083",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "S1",
            "slot": 0
          }
        },
        {
          "id": "e1084",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "S1",
            "slot": 1
          }
        },
        {
          "id": "e1085",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "S1",
            "slot": 2
          }
        },
        {
          "id": "e1086",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "S1",
            "slot": 3
          }
        },
        {
          "id": "e1087",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "F1",
            "slot": 0
          }
        },
        {
          "id": "e1088",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "F1",
            "slot": 1
          }
        },
        {
          "id": "e1089",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "F1",
            "slot": 2
          }
        },
        {
          "id": "e1090",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "F1",
            "slot": 3
          }
        },
        {
          "id": "e1091",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "F1",
            "slot": 4
          }
        },
        {
          "id": "e1092",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "F1",
            "slot": 5
          }
        },
        {
          "id": "e1093",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "F2",
            "slot": 0
          }
        },
        {
          "id": "e1094",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "F2",
            "slot": 1
          }
        },
        {
          "id": "e1095",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "F2",
            "slot": 2
          }
        },
        {
          "id": "e1096",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "F2",
            "slot": 3
          }
        },
        {
          "id": "e1097",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "F2",
            "slot": 4
          }
        },
        {
          "id": "e1098",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "F2",
            "slot": 5
          }
        }
      ],
      "groups": []
    },
    "viewBox": {
      "width": 1000,
      "height": 650,
      "atomRadius": 64,
      "hydrogenRadius": 40,
      "bondLength": 104,
      "shellOverlap": 24
    },
    "electronSlots": {
      "atom": {
        "directions": [
          -100,
          -80,
          -10,
          10,
          80,
          100,
          170,
          190
        ],
        "radius": 64,
        "hydrogenRadius": 40
      },
      "bond": {
        "maxPairs": 3,
        "centredInOverlap": true,
        "perpendicularOffsets": [
          -5,
          5
        ],
        "pairSpacing": 22
      }
    },
    "marking": {
      "speciesSpecific": true,
      "shellTargets": {},
      "transferredSymbol": null,
      "geometryChecked": false
    }
  },
  {
    "id": "nitrosyl-chloride",
    "name": "nitrosyl chloride",
    "formula": "NOCl",
    "displayFormula": "NOCl",
    "totalCharge": 0,
    "namedSpecies": true,
    "category": "covalent",
    "practiceCategory": "covalent",
    "extension": false,
    "grades": [
      2
    ],
    "scope": "OCR A Level Chemistry A 2.2.2(a,e)",
    "atlasEvidence": null,
    "smiles": null,
    "prompt": "Draw the dot-and-cross diagram for nitrosyl chloride. Show all outer-shell electrons.",
    "explanation": "Nitrogen is central, with an N=O double bond, an N–Cl single bond and one lone pair on nitrogen. Bonds: 1 × N–O (2 shared pairs); 1 × Cl–N (1 shared pair). Non-bonding inventory: 1 × N: 2 non-bonding electrons; 1 × O: 4 non-bonding electrons; 1 × Cl: 6 non-bonding electrons.",
    "sourceRefs": [
      "resources/a-level-past-paper-atlas/run2/specification-evidence/sections.json#2.2.2(a,e)",
      "resources/a-level-past-paper-atlas/data/review-bundle.json#OCR_2020_OCT_H032-02_Q04_P_A"
    ],
    "reference": {
      "atoms": [
        {
          "id": "N1",
          "element": "N",
          "x": 500,
          "y": 325
        },
        {
          "id": "O1",
          "element": "O",
          "x": 604,
          "y": 325
        },
        {
          "id": "Cl1",
          "element": "Cl",
          "x": 396,
          "y": 325
        }
      ],
      "electrons": [
        {
          "id": "e1099",
          "symbol": "dot",
          "anchor": {
            "kind": "bond",
            "a": "N1",
            "b": "O1",
            "slot": 0
          }
        },
        {
          "id": "e1100",
          "symbol": "cross",
          "anchor": {
            "kind": "bond",
            "a": "N1",
            "b": "O1",
            "slot": 1
          }
        },
        {
          "id": "e1101",
          "symbol": "dot",
          "anchor": {
            "kind": "bond",
            "a": "N1",
            "b": "O1",
            "slot": 2
          }
        },
        {
          "id": "e1102",
          "symbol": "cross",
          "anchor": {
            "kind": "bond",
            "a": "N1",
            "b": "O1",
            "slot": 3
          }
        },
        {
          "id": "e1103",
          "symbol": "dot",
          "anchor": {
            "kind": "bond",
            "a": "N1",
            "b": "Cl1",
            "slot": 0
          }
        },
        {
          "id": "e1104",
          "symbol": "cross",
          "anchor": {
            "kind": "bond",
            "a": "N1",
            "b": "Cl1",
            "slot": 1
          }
        },
        {
          "id": "e1105",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "N1",
            "slot": 0
          }
        },
        {
          "id": "e1106",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "N1",
            "slot": 1
          }
        },
        {
          "id": "e1107",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "O1",
            "slot": 0
          }
        },
        {
          "id": "e1108",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "O1",
            "slot": 1
          }
        },
        {
          "id": "e1109",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "O1",
            "slot": 2
          }
        },
        {
          "id": "e1110",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "O1",
            "slot": 3
          }
        },
        {
          "id": "e1111",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "Cl1",
            "slot": 0
          }
        },
        {
          "id": "e1112",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "Cl1",
            "slot": 1
          }
        },
        {
          "id": "e1113",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "Cl1",
            "slot": 2
          }
        },
        {
          "id": "e1114",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "Cl1",
            "slot": 3
          }
        },
        {
          "id": "e1115",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "Cl1",
            "slot": 4
          }
        },
        {
          "id": "e1116",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "Cl1",
            "slot": 5
          }
        }
      ],
      "groups": []
    },
    "viewBox": {
      "width": 1000,
      "height": 650,
      "atomRadius": 64,
      "hydrogenRadius": 40,
      "bondLength": 104,
      "shellOverlap": 24
    },
    "electronSlots": {
      "atom": {
        "directions": [
          -100,
          -80,
          -10,
          10,
          80,
          100,
          170,
          190
        ],
        "radius": 64,
        "hydrogenRadius": 40
      },
      "bond": {
        "maxPairs": 3,
        "centredInOverlap": true,
        "perpendicularOffsets": [
          -5,
          5
        ],
        "pairSpacing": 22
      }
    },
    "marking": {
      "speciesSpecific": true,
      "shellTargets": {},
      "transferredSymbol": null,
      "geometryChecked": false
    }
  },
  {
    "id": "phosgene",
    "name": "carbonyl dichloride (phosgene)",
    "formula": "COCl2",
    "displayFormula": "COCl₂",
    "totalCharge": 0,
    "namedSpecies": true,
    "category": "covalent",
    "practiceCategory": "covalent",
    "extension": false,
    "grades": [
      2
    ],
    "scope": "OCR A Level Chemistry A 2.2.2(a,e)",
    "atlasEvidence": null,
    "smiles": null,
    "prompt": "Draw the dot-and-cross diagram for carbonyl dichloride (phosgene). Show all outer-shell electrons.",
    "explanation": "Carbon is central, with a C=O double bond and two C–Cl single bonds. Bonds: 1 × C–O (2 shared pairs); 2 × C–Cl (1 shared pair). Non-bonding inventory: 1 × O: 4 non-bonding electrons; 2 × Cl: 6 non-bonding electrons.",
    "sourceRefs": [
      "resources/a-level-past-paper-atlas/run2/specification-evidence/sections.json#2.2.2(a,e)",
      "resources/a-level-past-paper-atlas/data/review-bundle.json#OCR_2018_JUN_H032-01_Q21_P_B_I"
    ],
    "reference": {
      "atoms": [
        {
          "id": "C1",
          "element": "C",
          "x": 500,
          "y": 325
        },
        {
          "id": "O1",
          "element": "O",
          "x": 604,
          "y": 325
        },
        {
          "id": "Cl1",
          "element": "Cl",
          "x": 448,
          "y": 235
        },
        {
          "id": "Cl2",
          "element": "Cl",
          "x": 448,
          "y": 415
        }
      ],
      "electrons": [
        {
          "id": "e1117",
          "symbol": "dot",
          "anchor": {
            "kind": "bond",
            "a": "C1",
            "b": "O1",
            "slot": 0
          }
        },
        {
          "id": "e1118",
          "symbol": "cross",
          "anchor": {
            "kind": "bond",
            "a": "C1",
            "b": "O1",
            "slot": 1
          }
        },
        {
          "id": "e1119",
          "symbol": "dot",
          "anchor": {
            "kind": "bond",
            "a": "C1",
            "b": "O1",
            "slot": 2
          }
        },
        {
          "id": "e1120",
          "symbol": "cross",
          "anchor": {
            "kind": "bond",
            "a": "C1",
            "b": "O1",
            "slot": 3
          }
        },
        {
          "id": "e1121",
          "symbol": "dot",
          "anchor": {
            "kind": "bond",
            "a": "C1",
            "b": "Cl1",
            "slot": 0
          }
        },
        {
          "id": "e1122",
          "symbol": "cross",
          "anchor": {
            "kind": "bond",
            "a": "C1",
            "b": "Cl1",
            "slot": 1
          }
        },
        {
          "id": "e1123",
          "symbol": "dot",
          "anchor": {
            "kind": "bond",
            "a": "C1",
            "b": "Cl2",
            "slot": 0
          }
        },
        {
          "id": "e1124",
          "symbol": "cross",
          "anchor": {
            "kind": "bond",
            "a": "C1",
            "b": "Cl2",
            "slot": 1
          }
        },
        {
          "id": "e1125",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "O1",
            "slot": 0
          }
        },
        {
          "id": "e1126",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "O1",
            "slot": 1
          }
        },
        {
          "id": "e1127",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "O1",
            "slot": 2
          }
        },
        {
          "id": "e1128",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "O1",
            "slot": 3
          }
        },
        {
          "id": "e1129",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "Cl1",
            "slot": 0
          }
        },
        {
          "id": "e1130",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "Cl1",
            "slot": 1
          }
        },
        {
          "id": "e1131",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "Cl1",
            "slot": 2
          }
        },
        {
          "id": "e1132",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "Cl1",
            "slot": 3
          }
        },
        {
          "id": "e1133",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "Cl1",
            "slot": 4
          }
        },
        {
          "id": "e1134",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "Cl1",
            "slot": 5
          }
        },
        {
          "id": "e1135",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "Cl2",
            "slot": 0
          }
        },
        {
          "id": "e1136",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "Cl2",
            "slot": 1
          }
        },
        {
          "id": "e1137",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "Cl2",
            "slot": 2
          }
        },
        {
          "id": "e1138",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "Cl2",
            "slot": 3
          }
        },
        {
          "id": "e1139",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "Cl2",
            "slot": 4
          }
        },
        {
          "id": "e1140",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "Cl2",
            "slot": 5
          }
        }
      ],
      "groups": []
    },
    "viewBox": {
      "width": 1000,
      "height": 650,
      "atomRadius": 64,
      "hydrogenRadius": 40,
      "bondLength": 104,
      "shellOverlap": 24
    },
    "electronSlots": {
      "atom": {
        "directions": [
          -100,
          -80,
          -10,
          10,
          80,
          100,
          170,
          190
        ],
        "radius": 64,
        "hydrogenRadius": 40
      },
      "bond": {
        "maxPairs": 3,
        "centredInOverlap": true,
        "perpendicularOffsets": [
          -5,
          5
        ],
        "pairSpacing": 22
      }
    },
    "marking": {
      "speciesSpecific": true,
      "shellTargets": {},
      "transferredSymbol": null,
      "geometryChecked": false
    }
  },
  {
    "id": "hydrogen-cyanide",
    "name": "hydrogen cyanide",
    "formula": "HCN",
    "displayFormula": "HCN",
    "totalCharge": 0,
    "namedSpecies": true,
    "category": "covalent",
    "practiceCategory": "covalent",
    "extension": false,
    "grades": [
      2
    ],
    "scope": "OCR A Level Chemistry A 2.2.2(a,e)",
    "atlasEvidence": null,
    "smiles": null,
    "prompt": "Draw the dot-and-cross diagram for hydrogen cyanide. Show all outer-shell electrons.",
    "explanation": "The named structure is H–C≡N, with one lone pair on nitrogen. Bonds: 1 × C–H (1 shared pair); 1 × C–N (3 shared pairs). Non-bonding inventory: 1 × N: 2 non-bonding electrons.",
    "sourceRefs": [
      "resources/a-level-past-paper-atlas/run2/specification-evidence/sections.json#2.2.2(a,e)",
      "resources/a-level-past-paper-atlas/data/review-bundle.json#OCR_2024_JUN_H032-01_Q23_P_C"
    ],
    "reference": {
      "atoms": [
        {
          "id": "H1",
          "element": "H",
          "x": 420,
          "y": 325
        },
        {
          "id": "C1",
          "element": "C",
          "x": 500,
          "y": 325
        },
        {
          "id": "N1",
          "element": "N",
          "x": 604,
          "y": 325
        }
      ],
      "electrons": [
        {
          "id": "e1141",
          "symbol": "dot",
          "anchor": {
            "kind": "bond",
            "a": "H1",
            "b": "C1",
            "slot": 0
          }
        },
        {
          "id": "e1142",
          "symbol": "cross",
          "anchor": {
            "kind": "bond",
            "a": "H1",
            "b": "C1",
            "slot": 1
          }
        },
        {
          "id": "e1143",
          "symbol": "dot",
          "anchor": {
            "kind": "bond",
            "a": "C1",
            "b": "N1",
            "slot": 0
          }
        },
        {
          "id": "e1144",
          "symbol": "cross",
          "anchor": {
            "kind": "bond",
            "a": "C1",
            "b": "N1",
            "slot": 1
          }
        },
        {
          "id": "e1145",
          "symbol": "dot",
          "anchor": {
            "kind": "bond",
            "a": "C1",
            "b": "N1",
            "slot": 2
          }
        },
        {
          "id": "e1146",
          "symbol": "cross",
          "anchor": {
            "kind": "bond",
            "a": "C1",
            "b": "N1",
            "slot": 3
          }
        },
        {
          "id": "e1147",
          "symbol": "dot",
          "anchor": {
            "kind": "bond",
            "a": "C1",
            "b": "N1",
            "slot": 4
          }
        },
        {
          "id": "e1148",
          "symbol": "cross",
          "anchor": {
            "kind": "bond",
            "a": "C1",
            "b": "N1",
            "slot": 5
          }
        },
        {
          "id": "e1149",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "N1",
            "slot": 0
          }
        },
        {
          "id": "e1150",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "N1",
            "slot": 1
          }
        }
      ],
      "groups": []
    },
    "viewBox": {
      "width": 1000,
      "height": 650,
      "atomRadius": 64,
      "hydrogenRadius": 40,
      "bondLength": 104,
      "shellOverlap": 24
    },
    "electronSlots": {
      "atom": {
        "directions": [
          -100,
          -80,
          -10,
          10,
          80,
          100,
          170,
          190
        ],
        "radius": 64,
        "hydrogenRadius": 40
      },
      "bond": {
        "maxPairs": 3,
        "centredInOverlap": true,
        "perpendicularOffsets": [
          -5,
          5
        ],
        "pairSpacing": 22
      }
    },
    "marking": {
      "speciesSpecific": true,
      "shellTargets": {},
      "transferredSymbol": null,
      "geometryChecked": false
    }
  },
  {
    "id": "boron-trifluoride",
    "name": "boron trifluoride",
    "formula": "BF3",
    "displayFormula": "BF₃",
    "totalCharge": 0,
    "namedSpecies": true,
    "category": "covalent",
    "practiceCategory": "covalent",
    "extension": false,
    "grades": [
      3
    ],
    "scope": "OCR A Level Chemistry A 2.2.2(a,e)",
    "atlasEvidence": null,
    "smiles": null,
    "prompt": "Draw the dot-and-cross diagram for boron trifluoride. Show all outer-shell electrons.",
    "explanation": "Boron has three shared pairs, no lone pair and six electrons around it. Bonds: 3 × B–F (1 shared pair). Non-bonding inventory: 3 × F: 6 non-bonding electrons.",
    "sourceRefs": [
      "resources/a-level-past-paper-atlas/run2/specification-evidence/sections.json#2.2.2(a,e)",
      "resources/a-level-past-paper-atlas/data/review-bundle.json#OCR_2023_JUN_H032-01_Q21_P_A_II"
    ],
    "reference": {
      "atoms": [
        {
          "id": "B1",
          "element": "B",
          "x": 500,
          "y": 325
        },
        {
          "id": "F1",
          "element": "F",
          "x": 500,
          "y": 221
        },
        {
          "id": "F2",
          "element": "F",
          "x": 590.0666419935816,
          "y": 377
        },
        {
          "id": "F3",
          "element": "F",
          "x": 409.9333580064184,
          "y": 377.00000000000006
        }
      ],
      "electrons": [
        {
          "id": "e1151",
          "symbol": "dot",
          "anchor": {
            "kind": "bond",
            "a": "B1",
            "b": "F1",
            "slot": 0
          }
        },
        {
          "id": "e1152",
          "symbol": "cross",
          "anchor": {
            "kind": "bond",
            "a": "B1",
            "b": "F1",
            "slot": 1
          }
        },
        {
          "id": "e1153",
          "symbol": "dot",
          "anchor": {
            "kind": "bond",
            "a": "B1",
            "b": "F2",
            "slot": 0
          }
        },
        {
          "id": "e1154",
          "symbol": "cross",
          "anchor": {
            "kind": "bond",
            "a": "B1",
            "b": "F2",
            "slot": 1
          }
        },
        {
          "id": "e1155",
          "symbol": "dot",
          "anchor": {
            "kind": "bond",
            "a": "B1",
            "b": "F3",
            "slot": 0
          }
        },
        {
          "id": "e1156",
          "symbol": "cross",
          "anchor": {
            "kind": "bond",
            "a": "B1",
            "b": "F3",
            "slot": 1
          }
        },
        {
          "id": "e1157",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "F1",
            "slot": 0
          }
        },
        {
          "id": "e1158",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "F1",
            "slot": 1
          }
        },
        {
          "id": "e1159",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "F1",
            "slot": 2
          }
        },
        {
          "id": "e1160",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "F1",
            "slot": 3
          }
        },
        {
          "id": "e1161",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "F1",
            "slot": 4
          }
        },
        {
          "id": "e1162",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "F1",
            "slot": 5
          }
        },
        {
          "id": "e1163",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "F2",
            "slot": 0
          }
        },
        {
          "id": "e1164",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "F2",
            "slot": 1
          }
        },
        {
          "id": "e1165",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "F2",
            "slot": 2
          }
        },
        {
          "id": "e1166",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "F2",
            "slot": 3
          }
        },
        {
          "id": "e1167",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "F2",
            "slot": 4
          }
        },
        {
          "id": "e1168",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "F2",
            "slot": 5
          }
        },
        {
          "id": "e1169",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "F3",
            "slot": 0
          }
        },
        {
          "id": "e1170",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "F3",
            "slot": 1
          }
        },
        {
          "id": "e1171",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "F3",
            "slot": 2
          }
        },
        {
          "id": "e1172",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "F3",
            "slot": 3
          }
        },
        {
          "id": "e1173",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "F3",
            "slot": 4
          }
        },
        {
          "id": "e1174",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "F3",
            "slot": 5
          }
        }
      ],
      "groups": []
    },
    "viewBox": {
      "width": 1000,
      "height": 650,
      "atomRadius": 64,
      "hydrogenRadius": 40,
      "bondLength": 104,
      "shellOverlap": 24
    },
    "electronSlots": {
      "atom": {
        "directions": [
          -100,
          -80,
          -10,
          10,
          80,
          100,
          170,
          190
        ],
        "radius": 64,
        "hydrogenRadius": 40
      },
      "bond": {
        "maxPairs": 3,
        "centredInOverlap": true,
        "perpendicularOffsets": [
          -5,
          5
        ],
        "pairSpacing": 22
      }
    },
    "marking": {
      "speciesSpecific": true,
      "shellTargets": {
        "B1": 6
      },
      "transferredSymbol": null,
      "geometryChecked": false
    }
  },
  {
    "id": "ammonium-ion",
    "name": "ammonium ion",
    "formula": "NH4",
    "displayFormula": "NH₄⁺",
    "totalCharge": 1,
    "namedSpecies": true,
    "category": "covalent",
    "practiceCategory": "covalent",
    "extension": false,
    "grades": [
      3
    ],
    "scope": "OCR A Level Chemistry A 2.2.2(a,e)",
    "atlasEvidence": null,
    "smiles": null,
    "prompt": "Draw the dot-and-cross diagram for ammonium ion. Show all outer-shell electrons, a bracket around the whole ion, and its charge.",
    "explanation": "Three N–H pairs contain one electron from each atom; the fourth is a coordinate pair supplied by nitrogen. After formation, all four N–H bonds are equivalent. Bonds: 4 × H–N (1 shared pair). No non-bonding electrons.",
    "sourceRefs": [
      "resources/a-level-past-paper-atlas/run2/specification-evidence/sections.json#2.2.2(a,e)",
      "resources/a-level-past-paper-atlas/data/review-bundle.json#OCR_2024_JUN_H032-02_Q01_P_C_II"
    ],
    "reference": {
      "atoms": [
        {
          "id": "N1",
          "element": "N",
          "x": 500,
          "y": 325
        },
        {
          "id": "H1",
          "element": "H",
          "x": 580,
          "y": 325
        },
        {
          "id": "H2",
          "element": "H",
          "x": 500,
          "y": 405
        },
        {
          "id": "H3",
          "element": "H",
          "x": 420,
          "y": 325
        },
        {
          "id": "H4",
          "element": "H",
          "x": 500,
          "y": 245
        }
      ],
      "electrons": [
        {
          "id": "e1175",
          "symbol": "dot",
          "anchor": {
            "kind": "bond",
            "a": "N1",
            "b": "H1",
            "slot": 0
          }
        },
        {
          "id": "e1176",
          "symbol": "cross",
          "anchor": {
            "kind": "bond",
            "a": "N1",
            "b": "H1",
            "slot": 1
          }
        },
        {
          "id": "e1177",
          "symbol": "dot",
          "anchor": {
            "kind": "bond",
            "a": "N1",
            "b": "H2",
            "slot": 0
          }
        },
        {
          "id": "e1178",
          "symbol": "cross",
          "anchor": {
            "kind": "bond",
            "a": "N1",
            "b": "H2",
            "slot": 1
          }
        },
        {
          "id": "e1179",
          "symbol": "dot",
          "anchor": {
            "kind": "bond",
            "a": "N1",
            "b": "H3",
            "slot": 0
          }
        },
        {
          "id": "e1180",
          "symbol": "cross",
          "anchor": {
            "kind": "bond",
            "a": "N1",
            "b": "H3",
            "slot": 1
          }
        },
        {
          "id": "e1181",
          "symbol": "dot",
          "anchor": {
            "kind": "bond",
            "a": "N1",
            "b": "H4",
            "slot": 0
          }
        },
        {
          "id": "e1182",
          "symbol": "dot",
          "anchor": {
            "kind": "bond",
            "a": "N1",
            "b": "H4",
            "slot": 1
          }
        }
      ],
      "groups": [
        {
          "id": "NH4+",
          "atomIds": [
            "N1",
            "H1",
            "H2",
            "H3",
            "H4"
          ],
          "charge": 1,
          "bracket": true
        }
      ]
    },
    "viewBox": {
      "width": 1000,
      "height": 650,
      "atomRadius": 64,
      "hydrogenRadius": 40,
      "bondLength": 104,
      "shellOverlap": 24
    },
    "electronSlots": {
      "atom": {
        "directions": [
          -100,
          -80,
          -10,
          10,
          80,
          100,
          170,
          190
        ],
        "radius": 64,
        "hydrogenRadius": 40
      },
      "bond": {
        "maxPairs": 3,
        "centredInOverlap": true,
        "perpendicularOffsets": [
          -5,
          5
        ],
        "pairSpacing": 22
      }
    },
    "marking": {
      "speciesSpecific": true,
      "shellTargets": {},
      "transferredSymbol": null,
      "geometryChecked": false
    }
  },
  {
    "id": "carbonate-ion",
    "name": "carbonate ion",
    "formula": "CO3",
    "displayFormula": "CO₃²⁻",
    "totalCharge": -2,
    "namedSpecies": true,
    "category": "covalent",
    "practiceCategory": "covalent",
    "extension": false,
    "grades": [
      3
    ],
    "scope": "OCR A Level Chemistry A 2.2.2(a,e)",
    "atlasEvidence": null,
    "smiles": null,
    "prompt": "Draw the dot-and-cross diagram for carbonate ion. Show all outer-shell electrons, a bracket around the whole ion, and its charge. Use a third symbol to distinguish the additional electron source.",
    "explanation": "One valid resonance contributor has one C=O double bond and two C–O single bonds; the two gained electrons may be shown in a lone pair or C–O pair. The three C–O bonds are equivalent in the resonance hybrid. Bonds: 1 × C–O (2 shared pairs); 2 × C–O (1 shared pair). Non-bonding inventory: 1 × O: 4 non-bonding electrons; 2 × O: 6 non-bonding electrons.",
    "sourceRefs": [
      "resources/a-level-past-paper-atlas/run2/specification-evidence/sections.json#2.2.2(a,e)",
      "resources/a-level-past-paper-atlas/data/review-bundle.json#OCR_2018_JUN_H432-01_Q19_P_C"
    ],
    "reference": {
      "atoms": [
        {
          "id": "C1",
          "element": "C",
          "x": 500,
          "y": 325
        },
        {
          "id": "O1",
          "element": "O",
          "x": 500,
          "y": 221
        },
        {
          "id": "O2",
          "element": "O",
          "x": 590.0666419935816,
          "y": 377
        },
        {
          "id": "O3",
          "element": "O",
          "x": 409.9333580064184,
          "y": 377.00000000000006
        }
      ],
      "electrons": [
        {
          "id": "e1183",
          "symbol": "dot",
          "anchor": {
            "kind": "bond",
            "a": "C1",
            "b": "O1",
            "slot": 0
          }
        },
        {
          "id": "e1184",
          "symbol": "cross",
          "anchor": {
            "kind": "bond",
            "a": "C1",
            "b": "O1",
            "slot": 1
          }
        },
        {
          "id": "e1185",
          "symbol": "dot",
          "anchor": {
            "kind": "bond",
            "a": "C1",
            "b": "O1",
            "slot": 2
          }
        },
        {
          "id": "e1186",
          "symbol": "cross",
          "anchor": {
            "kind": "bond",
            "a": "C1",
            "b": "O1",
            "slot": 3
          }
        },
        {
          "id": "e1187",
          "symbol": "dot",
          "anchor": {
            "kind": "bond",
            "a": "C1",
            "b": "O2",
            "slot": 0
          }
        },
        {
          "id": "e1188",
          "symbol": "cross",
          "anchor": {
            "kind": "bond",
            "a": "C1",
            "b": "O2",
            "slot": 1
          }
        },
        {
          "id": "e1189",
          "symbol": "dot",
          "anchor": {
            "kind": "bond",
            "a": "C1",
            "b": "O3",
            "slot": 0
          }
        },
        {
          "id": "e1190",
          "symbol": "cross",
          "anchor": {
            "kind": "bond",
            "a": "C1",
            "b": "O3",
            "slot": 1
          }
        },
        {
          "id": "e1191",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "O1",
            "slot": 0
          }
        },
        {
          "id": "e1192",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "O1",
            "slot": 1
          }
        },
        {
          "id": "e1193",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "O1",
            "slot": 2
          }
        },
        {
          "id": "e1194",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "O1",
            "slot": 3
          }
        },
        {
          "id": "e1195",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "O2",
            "slot": 0
          }
        },
        {
          "id": "e1196",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "O2",
            "slot": 1
          }
        },
        {
          "id": "e1197",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "O2",
            "slot": 2
          }
        },
        {
          "id": "e1198",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "O2",
            "slot": 3
          }
        },
        {
          "id": "e1199",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "O2",
            "slot": 4
          }
        },
        {
          "id": "e1200",
          "symbol": "triangle",
          "anchor": {
            "kind": "atom",
            "atomId": "O2",
            "slot": 5
          }
        },
        {
          "id": "e1201",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "O3",
            "slot": 0
          }
        },
        {
          "id": "e1202",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "O3",
            "slot": 1
          }
        },
        {
          "id": "e1203",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "O3",
            "slot": 2
          }
        },
        {
          "id": "e1204",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "O3",
            "slot": 3
          }
        },
        {
          "id": "e1205",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "O3",
            "slot": 4
          }
        },
        {
          "id": "e1206",
          "symbol": "triangle",
          "anchor": {
            "kind": "atom",
            "atomId": "O3",
            "slot": 5
          }
        }
      ],
      "groups": [
        {
          "id": "carbonate-ion",
          "atomIds": [
            "C1",
            "O1",
            "O2",
            "O3"
          ],
          "charge": -2,
          "bracket": true
        }
      ]
    },
    "viewBox": {
      "width": 1000,
      "height": 650,
      "atomRadius": 64,
      "hydrogenRadius": 40,
      "bondLength": 104,
      "shellOverlap": 24
    },
    "electronSlots": {
      "atom": {
        "directions": [
          -100,
          -80,
          -10,
          10,
          80,
          100,
          170,
          190
        ],
        "radius": 64,
        "hydrogenRadius": 40
      },
      "bond": {
        "maxPairs": 3,
        "centredInOverlap": true,
        "perpendicularOffsets": [
          -5,
          5
        ],
        "pairSpacing": 22
      }
    },
    "marking": {
      "speciesSpecific": true,
      "shellTargets": {},
      "transferredSymbol": null,
      "geometryChecked": false,
      "originAlternatives": [
        {
          "atoms": [
            {
              "id": "C1",
              "element": "C",
              "x": 500,
              "y": 325
            },
            {
              "id": "O1",
              "element": "O",
              "x": 500,
              "y": 221
            },
            {
              "id": "O2",
              "element": "O",
              "x": 590.0666419935816,
              "y": 377
            },
            {
              "id": "O3",
              "element": "O",
              "x": 409.9333580064184,
              "y": 377.00000000000006
            }
          ],
          "electrons": [
            {
              "id": "e1183",
              "symbol": "dot",
              "anchor": {
                "kind": "bond",
                "a": "C1",
                "b": "O1",
                "slot": 0
              }
            },
            {
              "id": "e1184",
              "symbol": "cross",
              "anchor": {
                "kind": "bond",
                "a": "C1",
                "b": "O1",
                "slot": 1
              }
            },
            {
              "id": "e1185",
              "symbol": "dot",
              "anchor": {
                "kind": "bond",
                "a": "C1",
                "b": "O1",
                "slot": 2
              }
            },
            {
              "id": "e1186",
              "symbol": "cross",
              "anchor": {
                "kind": "bond",
                "a": "C1",
                "b": "O1",
                "slot": 3
              }
            },
            {
              "id": "e1187",
              "symbol": "dot",
              "anchor": {
                "kind": "bond",
                "a": "C1",
                "b": "O2",
                "slot": 0
              }
            },
            {
              "id": "e1188",
              "symbol": "triangle",
              "anchor": {
                "kind": "bond",
                "a": "C1",
                "b": "O2",
                "slot": 1
              }
            },
            {
              "id": "e1189",
              "symbol": "dot",
              "anchor": {
                "kind": "bond",
                "a": "C1",
                "b": "O3",
                "slot": 0
              }
            },
            {
              "id": "e1190",
              "symbol": "cross",
              "anchor": {
                "kind": "bond",
                "a": "C1",
                "b": "O3",
                "slot": 1
              }
            },
            {
              "id": "e1191",
              "symbol": "cross",
              "anchor": {
                "kind": "atom",
                "atomId": "O1",
                "slot": 0
              }
            },
            {
              "id": "e1192",
              "symbol": "cross",
              "anchor": {
                "kind": "atom",
                "atomId": "O1",
                "slot": 1
              }
            },
            {
              "id": "e1193",
              "symbol": "cross",
              "anchor": {
                "kind": "atom",
                "atomId": "O1",
                "slot": 2
              }
            },
            {
              "id": "e1194",
              "symbol": "cross",
              "anchor": {
                "kind": "atom",
                "atomId": "O1",
                "slot": 3
              }
            },
            {
              "id": "e1195",
              "symbol": "cross",
              "anchor": {
                "kind": "atom",
                "atomId": "O2",
                "slot": 0
              }
            },
            {
              "id": "e1196",
              "symbol": "cross",
              "anchor": {
                "kind": "atom",
                "atomId": "O2",
                "slot": 1
              }
            },
            {
              "id": "e1197",
              "symbol": "cross",
              "anchor": {
                "kind": "atom",
                "atomId": "O2",
                "slot": 2
              }
            },
            {
              "id": "e1198",
              "symbol": "cross",
              "anchor": {
                "kind": "atom",
                "atomId": "O2",
                "slot": 3
              }
            },
            {
              "id": "e1199",
              "symbol": "cross",
              "anchor": {
                "kind": "atom",
                "atomId": "O2",
                "slot": 4
              }
            },
            {
              "id": "e1200",
              "symbol": "cross",
              "anchor": {
                "kind": "atom",
                "atomId": "O2",
                "slot": 5
              }
            },
            {
              "id": "e1201",
              "symbol": "cross",
              "anchor": {
                "kind": "atom",
                "atomId": "O3",
                "slot": 0
              }
            },
            {
              "id": "e1202",
              "symbol": "cross",
              "anchor": {
                "kind": "atom",
                "atomId": "O3",
                "slot": 1
              }
            },
            {
              "id": "e1203",
              "symbol": "cross",
              "anchor": {
                "kind": "atom",
                "atomId": "O3",
                "slot": 2
              }
            },
            {
              "id": "e1204",
              "symbol": "cross",
              "anchor": {
                "kind": "atom",
                "atomId": "O3",
                "slot": 3
              }
            },
            {
              "id": "e1205",
              "symbol": "cross",
              "anchor": {
                "kind": "atom",
                "atomId": "O3",
                "slot": 4
              }
            },
            {
              "id": "e1206",
              "symbol": "triangle",
              "anchor": {
                "kind": "atom",
                "atomId": "O3",
                "slot": 5
              }
            }
          ],
          "groups": [
            {
              "id": "carbonate-ion",
              "atomIds": [
                "C1",
                "O1",
                "O2",
                "O3"
              ],
              "charge": -2,
              "bracket": true
            }
          ]
        },
        {
          "atoms": [
            {
              "id": "C1",
              "element": "C",
              "x": 500,
              "y": 325
            },
            {
              "id": "O1",
              "element": "O",
              "x": 500,
              "y": 221
            },
            {
              "id": "O2",
              "element": "O",
              "x": 590.0666419935816,
              "y": 377
            },
            {
              "id": "O3",
              "element": "O",
              "x": 409.9333580064184,
              "y": 377.00000000000006
            }
          ],
          "electrons": [
            {
              "id": "e1183",
              "symbol": "dot",
              "anchor": {
                "kind": "bond",
                "a": "C1",
                "b": "O1",
                "slot": 0
              }
            },
            {
              "id": "e1184",
              "symbol": "cross",
              "anchor": {
                "kind": "bond",
                "a": "C1",
                "b": "O1",
                "slot": 1
              }
            },
            {
              "id": "e1185",
              "symbol": "dot",
              "anchor": {
                "kind": "bond",
                "a": "C1",
                "b": "O1",
                "slot": 2
              }
            },
            {
              "id": "e1186",
              "symbol": "cross",
              "anchor": {
                "kind": "bond",
                "a": "C1",
                "b": "O1",
                "slot": 3
              }
            },
            {
              "id": "e1187",
              "symbol": "dot",
              "anchor": {
                "kind": "bond",
                "a": "C1",
                "b": "O2",
                "slot": 0
              }
            },
            {
              "id": "e1188",
              "symbol": "cross",
              "anchor": {
                "kind": "bond",
                "a": "C1",
                "b": "O2",
                "slot": 1
              }
            },
            {
              "id": "e1189",
              "symbol": "dot",
              "anchor": {
                "kind": "bond",
                "a": "C1",
                "b": "O3",
                "slot": 0
              }
            },
            {
              "id": "e1190",
              "symbol": "triangle",
              "anchor": {
                "kind": "bond",
                "a": "C1",
                "b": "O3",
                "slot": 1
              }
            },
            {
              "id": "e1191",
              "symbol": "cross",
              "anchor": {
                "kind": "atom",
                "atomId": "O1",
                "slot": 0
              }
            },
            {
              "id": "e1192",
              "symbol": "cross",
              "anchor": {
                "kind": "atom",
                "atomId": "O1",
                "slot": 1
              }
            },
            {
              "id": "e1193",
              "symbol": "cross",
              "anchor": {
                "kind": "atom",
                "atomId": "O1",
                "slot": 2
              }
            },
            {
              "id": "e1194",
              "symbol": "cross",
              "anchor": {
                "kind": "atom",
                "atomId": "O1",
                "slot": 3
              }
            },
            {
              "id": "e1195",
              "symbol": "cross",
              "anchor": {
                "kind": "atom",
                "atomId": "O2",
                "slot": 0
              }
            },
            {
              "id": "e1196",
              "symbol": "cross",
              "anchor": {
                "kind": "atom",
                "atomId": "O2",
                "slot": 1
              }
            },
            {
              "id": "e1197",
              "symbol": "cross",
              "anchor": {
                "kind": "atom",
                "atomId": "O2",
                "slot": 2
              }
            },
            {
              "id": "e1198",
              "symbol": "cross",
              "anchor": {
                "kind": "atom",
                "atomId": "O2",
                "slot": 3
              }
            },
            {
              "id": "e1199",
              "symbol": "cross",
              "anchor": {
                "kind": "atom",
                "atomId": "O2",
                "slot": 4
              }
            },
            {
              "id": "e1200",
              "symbol": "triangle",
              "anchor": {
                "kind": "atom",
                "atomId": "O2",
                "slot": 5
              }
            },
            {
              "id": "e1201",
              "symbol": "cross",
              "anchor": {
                "kind": "atom",
                "atomId": "O3",
                "slot": 0
              }
            },
            {
              "id": "e1202",
              "symbol": "cross",
              "anchor": {
                "kind": "atom",
                "atomId": "O3",
                "slot": 1
              }
            },
            {
              "id": "e1203",
              "symbol": "cross",
              "anchor": {
                "kind": "atom",
                "atomId": "O3",
                "slot": 2
              }
            },
            {
              "id": "e1204",
              "symbol": "cross",
              "anchor": {
                "kind": "atom",
                "atomId": "O3",
                "slot": 3
              }
            },
            {
              "id": "e1205",
              "symbol": "cross",
              "anchor": {
                "kind": "atom",
                "atomId": "O3",
                "slot": 4
              }
            },
            {
              "id": "e1206",
              "symbol": "cross",
              "anchor": {
                "kind": "atom",
                "atomId": "O3",
                "slot": 5
              }
            }
          ],
          "groups": [
            {
              "id": "carbonate-ion",
              "atomIds": [
                "C1",
                "O1",
                "O2",
                "O3"
              ],
              "charge": -2,
              "bracket": true
            }
          ]
        },
        {
          "atoms": [
            {
              "id": "C1",
              "element": "C",
              "x": 500,
              "y": 325
            },
            {
              "id": "O1",
              "element": "O",
              "x": 500,
              "y": 221
            },
            {
              "id": "O2",
              "element": "O",
              "x": 590.0666419935816,
              "y": 377
            },
            {
              "id": "O3",
              "element": "O",
              "x": 409.9333580064184,
              "y": 377.00000000000006
            }
          ],
          "electrons": [
            {
              "id": "e1183",
              "symbol": "dot",
              "anchor": {
                "kind": "bond",
                "a": "C1",
                "b": "O1",
                "slot": 0
              }
            },
            {
              "id": "e1184",
              "symbol": "cross",
              "anchor": {
                "kind": "bond",
                "a": "C1",
                "b": "O1",
                "slot": 1
              }
            },
            {
              "id": "e1185",
              "symbol": "dot",
              "anchor": {
                "kind": "bond",
                "a": "C1",
                "b": "O1",
                "slot": 2
              }
            },
            {
              "id": "e1186",
              "symbol": "cross",
              "anchor": {
                "kind": "bond",
                "a": "C1",
                "b": "O1",
                "slot": 3
              }
            },
            {
              "id": "e1187",
              "symbol": "dot",
              "anchor": {
                "kind": "bond",
                "a": "C1",
                "b": "O2",
                "slot": 0
              }
            },
            {
              "id": "e1188",
              "symbol": "triangle",
              "anchor": {
                "kind": "bond",
                "a": "C1",
                "b": "O2",
                "slot": 1
              }
            },
            {
              "id": "e1189",
              "symbol": "dot",
              "anchor": {
                "kind": "bond",
                "a": "C1",
                "b": "O3",
                "slot": 0
              }
            },
            {
              "id": "e1190",
              "symbol": "triangle",
              "anchor": {
                "kind": "bond",
                "a": "C1",
                "b": "O3",
                "slot": 1
              }
            },
            {
              "id": "e1191",
              "symbol": "cross",
              "anchor": {
                "kind": "atom",
                "atomId": "O1",
                "slot": 0
              }
            },
            {
              "id": "e1192",
              "symbol": "cross",
              "anchor": {
                "kind": "atom",
                "atomId": "O1",
                "slot": 1
              }
            },
            {
              "id": "e1193",
              "symbol": "cross",
              "anchor": {
                "kind": "atom",
                "atomId": "O1",
                "slot": 2
              }
            },
            {
              "id": "e1194",
              "symbol": "cross",
              "anchor": {
                "kind": "atom",
                "atomId": "O1",
                "slot": 3
              }
            },
            {
              "id": "e1195",
              "symbol": "cross",
              "anchor": {
                "kind": "atom",
                "atomId": "O2",
                "slot": 0
              }
            },
            {
              "id": "e1196",
              "symbol": "cross",
              "anchor": {
                "kind": "atom",
                "atomId": "O2",
                "slot": 1
              }
            },
            {
              "id": "e1197",
              "symbol": "cross",
              "anchor": {
                "kind": "atom",
                "atomId": "O2",
                "slot": 2
              }
            },
            {
              "id": "e1198",
              "symbol": "cross",
              "anchor": {
                "kind": "atom",
                "atomId": "O2",
                "slot": 3
              }
            },
            {
              "id": "e1199",
              "symbol": "cross",
              "anchor": {
                "kind": "atom",
                "atomId": "O2",
                "slot": 4
              }
            },
            {
              "id": "e1200",
              "symbol": "cross",
              "anchor": {
                "kind": "atom",
                "atomId": "O2",
                "slot": 5
              }
            },
            {
              "id": "e1201",
              "symbol": "cross",
              "anchor": {
                "kind": "atom",
                "atomId": "O3",
                "slot": 0
              }
            },
            {
              "id": "e1202",
              "symbol": "cross",
              "anchor": {
                "kind": "atom",
                "atomId": "O3",
                "slot": 1
              }
            },
            {
              "id": "e1203",
              "symbol": "cross",
              "anchor": {
                "kind": "atom",
                "atomId": "O3",
                "slot": 2
              }
            },
            {
              "id": "e1204",
              "symbol": "cross",
              "anchor": {
                "kind": "atom",
                "atomId": "O3",
                "slot": 3
              }
            },
            {
              "id": "e1205",
              "symbol": "cross",
              "anchor": {
                "kind": "atom",
                "atomId": "O3",
                "slot": 4
              }
            },
            {
              "id": "e1206",
              "symbol": "cross",
              "anchor": {
                "kind": "atom",
                "atomId": "O3",
                "slot": 5
              }
            }
          ],
          "groups": [
            {
              "id": "carbonate-ion",
              "atomIds": [
                "C1",
                "O1",
                "O2",
                "O3"
              ],
              "charge": -2,
              "bracket": true
            }
          ]
        }
      ]
    }
  },
  {
    "id": "nitrate-ion",
    "name": "nitrate ion",
    "formula": "NO3",
    "displayFormula": "NO₃⁻",
    "totalCharge": -1,
    "namedSpecies": true,
    "category": "covalent",
    "practiceCategory": "covalent",
    "extension": false,
    "grades": [
      3
    ],
    "scope": "OCR A Level Chemistry A 2.2.2(a,e)",
    "atlasEvidence": null,
    "smiles": null,
    "prompt": "Draw the dot-and-cross diagram for nitrate ion. Show all outer-shell electrons, a bracket around the whole ion, and its charge. Use a third symbol to distinguish the additional electron source.",
    "explanation": "One valid resonance contributor has N=O, one ordinary N–O pair and one N→O coordinate pair; oxygen lone-electron counts are 4, 6 and 6. The three N–O bonds are equivalent in the resonance hybrid. Bonds: 1 × N–O (2 shared pairs); 2 × N–O (1 shared pair). Non-bonding inventory: 1 × O: 4 non-bonding electrons; 2 × O: 6 non-bonding electrons.",
    "sourceRefs": [
      "resources/a-level-past-paper-atlas/run2/specification-evidence/sections.json#2.2.2(a,e)",
      "resources/a-level-past-paper-atlas/data/review-bundle.json#OCR_2016_JUN_H032-01_Q21_P_C_II"
    ],
    "reference": {
      "atoms": [
        {
          "id": "N1",
          "element": "N",
          "x": 500,
          "y": 325
        },
        {
          "id": "O1",
          "element": "O",
          "x": 500,
          "y": 221
        },
        {
          "id": "O2",
          "element": "O",
          "x": 590.0666419935816,
          "y": 377
        },
        {
          "id": "O3",
          "element": "O",
          "x": 409.9333580064184,
          "y": 377.00000000000006
        }
      ],
      "electrons": [
        {
          "id": "e1207",
          "symbol": "dot",
          "anchor": {
            "kind": "bond",
            "a": "N1",
            "b": "O1",
            "slot": 0
          }
        },
        {
          "id": "e1208",
          "symbol": "cross",
          "anchor": {
            "kind": "bond",
            "a": "N1",
            "b": "O1",
            "slot": 1
          }
        },
        {
          "id": "e1209",
          "symbol": "dot",
          "anchor": {
            "kind": "bond",
            "a": "N1",
            "b": "O1",
            "slot": 2
          }
        },
        {
          "id": "e1210",
          "symbol": "cross",
          "anchor": {
            "kind": "bond",
            "a": "N1",
            "b": "O1",
            "slot": 3
          }
        },
        {
          "id": "e1211",
          "symbol": "dot",
          "anchor": {
            "kind": "bond",
            "a": "N1",
            "b": "O2",
            "slot": 0
          }
        },
        {
          "id": "e1212",
          "symbol": "cross",
          "anchor": {
            "kind": "bond",
            "a": "N1",
            "b": "O2",
            "slot": 1
          }
        },
        {
          "id": "e1213",
          "symbol": "dot",
          "anchor": {
            "kind": "bond",
            "a": "N1",
            "b": "O3",
            "slot": 0
          }
        },
        {
          "id": "e1214",
          "symbol": "dot",
          "anchor": {
            "kind": "bond",
            "a": "N1",
            "b": "O3",
            "slot": 1
          }
        },
        {
          "id": "e1215",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "O1",
            "slot": 0
          }
        },
        {
          "id": "e1216",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "O1",
            "slot": 1
          }
        },
        {
          "id": "e1217",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "O1",
            "slot": 2
          }
        },
        {
          "id": "e1218",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "O1",
            "slot": 3
          }
        },
        {
          "id": "e1219",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "O2",
            "slot": 0
          }
        },
        {
          "id": "e1220",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "O2",
            "slot": 1
          }
        },
        {
          "id": "e1221",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "O2",
            "slot": 2
          }
        },
        {
          "id": "e1222",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "O2",
            "slot": 3
          }
        },
        {
          "id": "e1223",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "O2",
            "slot": 4
          }
        },
        {
          "id": "e1224",
          "symbol": "triangle",
          "anchor": {
            "kind": "atom",
            "atomId": "O2",
            "slot": 5
          }
        },
        {
          "id": "e1225",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "O3",
            "slot": 0
          }
        },
        {
          "id": "e1226",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "O3",
            "slot": 1
          }
        },
        {
          "id": "e1227",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "O3",
            "slot": 2
          }
        },
        {
          "id": "e1228",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "O3",
            "slot": 3
          }
        },
        {
          "id": "e1229",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "O3",
            "slot": 4
          }
        },
        {
          "id": "e1230",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "O3",
            "slot": 5
          }
        }
      ],
      "groups": [
        {
          "id": "nitrate-ion",
          "atomIds": [
            "N1",
            "O1",
            "O2",
            "O3"
          ],
          "charge": -1,
          "bracket": true
        }
      ]
    },
    "viewBox": {
      "width": 1000,
      "height": 650,
      "atomRadius": 64,
      "hydrogenRadius": 40,
      "bondLength": 104,
      "shellOverlap": 24
    },
    "electronSlots": {
      "atom": {
        "directions": [
          -100,
          -80,
          -10,
          10,
          80,
          100,
          170,
          190
        ],
        "radius": 64,
        "hydrogenRadius": 40
      },
      "bond": {
        "maxPairs": 3,
        "centredInOverlap": true,
        "perpendicularOffsets": [
          -5,
          5
        ],
        "pairSpacing": 22
      }
    },
    "marking": {
      "speciesSpecific": true,
      "shellTargets": {},
      "transferredSymbol": null,
      "geometryChecked": false,
      "originAlternatives": [
        {
          "atoms": [
            {
              "id": "N1",
              "element": "N",
              "x": 500,
              "y": 325
            },
            {
              "id": "O1",
              "element": "O",
              "x": 500,
              "y": 221
            },
            {
              "id": "O2",
              "element": "O",
              "x": 590.0666419935816,
              "y": 377
            },
            {
              "id": "O3",
              "element": "O",
              "x": 409.9333580064184,
              "y": 377.00000000000006
            }
          ],
          "electrons": [
            {
              "id": "e1207",
              "symbol": "dot",
              "anchor": {
                "kind": "bond",
                "a": "N1",
                "b": "O1",
                "slot": 0
              }
            },
            {
              "id": "e1208",
              "symbol": "cross",
              "anchor": {
                "kind": "bond",
                "a": "N1",
                "b": "O1",
                "slot": 1
              }
            },
            {
              "id": "e1209",
              "symbol": "dot",
              "anchor": {
                "kind": "bond",
                "a": "N1",
                "b": "O1",
                "slot": 2
              }
            },
            {
              "id": "e1210",
              "symbol": "cross",
              "anchor": {
                "kind": "bond",
                "a": "N1",
                "b": "O1",
                "slot": 3
              }
            },
            {
              "id": "e1211",
              "symbol": "dot",
              "anchor": {
                "kind": "bond",
                "a": "N1",
                "b": "O2",
                "slot": 0
              }
            },
            {
              "id": "e1212",
              "symbol": "triangle",
              "anchor": {
                "kind": "bond",
                "a": "N1",
                "b": "O2",
                "slot": 1
              }
            },
            {
              "id": "e1213",
              "symbol": "dot",
              "anchor": {
                "kind": "bond",
                "a": "N1",
                "b": "O3",
                "slot": 0
              }
            },
            {
              "id": "e1214",
              "symbol": "dot",
              "anchor": {
                "kind": "bond",
                "a": "N1",
                "b": "O3",
                "slot": 1
              }
            },
            {
              "id": "e1215",
              "symbol": "cross",
              "anchor": {
                "kind": "atom",
                "atomId": "O1",
                "slot": 0
              }
            },
            {
              "id": "e1216",
              "symbol": "cross",
              "anchor": {
                "kind": "atom",
                "atomId": "O1",
                "slot": 1
              }
            },
            {
              "id": "e1217",
              "symbol": "cross",
              "anchor": {
                "kind": "atom",
                "atomId": "O1",
                "slot": 2
              }
            },
            {
              "id": "e1218",
              "symbol": "cross",
              "anchor": {
                "kind": "atom",
                "atomId": "O1",
                "slot": 3
              }
            },
            {
              "id": "e1219",
              "symbol": "cross",
              "anchor": {
                "kind": "atom",
                "atomId": "O2",
                "slot": 0
              }
            },
            {
              "id": "e1220",
              "symbol": "cross",
              "anchor": {
                "kind": "atom",
                "atomId": "O2",
                "slot": 1
              }
            },
            {
              "id": "e1221",
              "symbol": "cross",
              "anchor": {
                "kind": "atom",
                "atomId": "O2",
                "slot": 2
              }
            },
            {
              "id": "e1222",
              "symbol": "cross",
              "anchor": {
                "kind": "atom",
                "atomId": "O2",
                "slot": 3
              }
            },
            {
              "id": "e1223",
              "symbol": "cross",
              "anchor": {
                "kind": "atom",
                "atomId": "O2",
                "slot": 4
              }
            },
            {
              "id": "e1224",
              "symbol": "cross",
              "anchor": {
                "kind": "atom",
                "atomId": "O2",
                "slot": 5
              }
            },
            {
              "id": "e1225",
              "symbol": "cross",
              "anchor": {
                "kind": "atom",
                "atomId": "O3",
                "slot": 0
              }
            },
            {
              "id": "e1226",
              "symbol": "cross",
              "anchor": {
                "kind": "atom",
                "atomId": "O3",
                "slot": 1
              }
            },
            {
              "id": "e1227",
              "symbol": "cross",
              "anchor": {
                "kind": "atom",
                "atomId": "O3",
                "slot": 2
              }
            },
            {
              "id": "e1228",
              "symbol": "cross",
              "anchor": {
                "kind": "atom",
                "atomId": "O3",
                "slot": 3
              }
            },
            {
              "id": "e1229",
              "symbol": "cross",
              "anchor": {
                "kind": "atom",
                "atomId": "O3",
                "slot": 4
              }
            },
            {
              "id": "e1230",
              "symbol": "cross",
              "anchor": {
                "kind": "atom",
                "atomId": "O3",
                "slot": 5
              }
            }
          ],
          "groups": [
            {
              "id": "nitrate-ion",
              "atomIds": [
                "N1",
                "O1",
                "O2",
                "O3"
              ],
              "charge": -1,
              "bracket": true
            }
          ]
        }
      ]
    }
  },
  {
    "id": "tetrahydridoaluminate-ion",
    "name": "tetrahydridoaluminate(1−) ion",
    "formula": "AlH4",
    "displayFormula": "AlH₄⁻",
    "totalCharge": -1,
    "namedSpecies": true,
    "category": "covalent",
    "practiceCategory": "covalent",
    "extension": false,
    "grades": [
      3
    ],
    "scope": "OCR A Level Chemistry A 2.2.2(a,e)",
    "atlasEvidence": null,
    "smiles": null,
    "prompt": "Draw the dot-and-cross diagram for tetrahydridoaluminate(1−) ion. Show all outer-shell electrons, a bracket around the whole ion, and its charge. Use a third symbol to distinguish the additional electron source.",
    "explanation": "Three Al–H pairs use an electron from each bonded atom; the fourth pair includes the additional electron, shown with a third symbol. Bonds: 4 × Al–H (1 shared pair). No non-bonding electrons.",
    "sourceRefs": [
      "resources/a-level-past-paper-atlas/run2/specification-evidence/sections.json#2.2.2(a,e)",
      "resources/a-level-past-paper-atlas/data/review-bundle.json#OCR_2017_JUN_H432-01_Q16_P_A"
    ],
    "reference": {
      "atoms": [
        {
          "id": "Al1",
          "element": "Al",
          "x": 500,
          "y": 325
        },
        {
          "id": "H1",
          "element": "H",
          "x": 580,
          "y": 325
        },
        {
          "id": "H2",
          "element": "H",
          "x": 500,
          "y": 405
        },
        {
          "id": "H3",
          "element": "H",
          "x": 420,
          "y": 325
        },
        {
          "id": "H4",
          "element": "H",
          "x": 500,
          "y": 245
        }
      ],
      "electrons": [
        {
          "id": "e1231",
          "symbol": "dot",
          "anchor": {
            "kind": "bond",
            "a": "Al1",
            "b": "H1",
            "slot": 0
          }
        },
        {
          "id": "e1232",
          "symbol": "cross",
          "anchor": {
            "kind": "bond",
            "a": "Al1",
            "b": "H1",
            "slot": 1
          }
        },
        {
          "id": "e1233",
          "symbol": "dot",
          "anchor": {
            "kind": "bond",
            "a": "Al1",
            "b": "H2",
            "slot": 0
          }
        },
        {
          "id": "e1234",
          "symbol": "cross",
          "anchor": {
            "kind": "bond",
            "a": "Al1",
            "b": "H2",
            "slot": 1
          }
        },
        {
          "id": "e1235",
          "symbol": "dot",
          "anchor": {
            "kind": "bond",
            "a": "Al1",
            "b": "H3",
            "slot": 0
          }
        },
        {
          "id": "e1236",
          "symbol": "cross",
          "anchor": {
            "kind": "bond",
            "a": "Al1",
            "b": "H3",
            "slot": 1
          }
        },
        {
          "id": "e1237",
          "symbol": "triangle",
          "anchor": {
            "kind": "bond",
            "a": "Al1",
            "b": "H4",
            "slot": 0
          }
        },
        {
          "id": "e1238",
          "symbol": "cross",
          "anchor": {
            "kind": "bond",
            "a": "Al1",
            "b": "H4",
            "slot": 1
          }
        }
      ],
      "groups": [
        {
          "id": "AlH4-",
          "atomIds": [
            "Al1",
            "H1",
            "H2",
            "H3",
            "H4"
          ],
          "charge": -1,
          "bracket": true
        }
      ]
    },
    "viewBox": {
      "width": 1000,
      "height": 650,
      "atomRadius": 64,
      "hydrogenRadius": 40,
      "bondLength": 104,
      "shellOverlap": 24
    },
    "electronSlots": {
      "atom": {
        "directions": [
          -100,
          -80,
          -10,
          10,
          80,
          100,
          170,
          190
        ],
        "radius": 64,
        "hydrogenRadius": 40
      },
      "bond": {
        "maxPairs": 3,
        "centredInOverlap": true,
        "perpendicularOffsets": [
          -5,
          5
        ],
        "pairSpacing": 22
      }
    },
    "marking": {
      "speciesSpecific": true,
      "shellTargets": {},
      "transferredSymbol": "triangle",
      "geometryChecked": false
    }
  },
  {
    "id": "sodium-borohydride",
    "name": "sodium tetrahydridoborate (sodium borohydride)",
    "formula": "NaBH4",
    "displayFormula": "NaBH₄",
    "totalCharge": 0,
    "namedSpecies": true,
    "category": "ionic",
    "practiceCategory": "ionic",
    "extension": false,
    "grades": [
      3
    ],
    "scope": "OCR A Level Chemistry A 2.2.2(a,e)",
    "atlasEvidence": null,
    "smiles": null,
    "prompt": "Draw the dot-and-cross diagram for sodium tetrahydridoborate (sodium borohydride). Show all outer-shell electrons, brackets around each ion, and their charges. Use a third symbol to distinguish the additional electron source.",
    "explanation": "Three B–H pairs use an electron from each bonded atom; the fourth pair includes the additional electron transferred from sodium, shown with a third symbol. Bonds: 4 × B–H (1 shared pair). No non-bonding electrons.",
    "sourceRefs": [
      "resources/a-level-past-paper-atlas/run2/specification-evidence/sections.json#2.2.2(a,e)",
      "resources/a-level-past-paper-atlas/enrichment/corrections.json#OCR_2025_JUN_H432-03_Q05_P_B",
      "resources/a-level-past-paper-atlas/data/review-bundle.json#OCR_2025_JUN_H432-03_Q05_P_B"
    ],
    "reference": {
      "atoms": [
        {
          "id": "Na1",
          "element": "Na",
          "x": 180,
          "y": 325
        },
        {
          "id": "B1",
          "element": "B",
          "x": 500,
          "y": 325
        },
        {
          "id": "H1",
          "element": "H",
          "x": 580,
          "y": 325
        },
        {
          "id": "H2",
          "element": "H",
          "x": 500,
          "y": 405
        },
        {
          "id": "H3",
          "element": "H",
          "x": 420,
          "y": 325
        },
        {
          "id": "H4",
          "element": "H",
          "x": 500,
          "y": 245
        }
      ],
      "electrons": [
        {
          "id": "e1239",
          "symbol": "dot",
          "anchor": {
            "kind": "bond",
            "a": "B1",
            "b": "H1",
            "slot": 0
          }
        },
        {
          "id": "e1240",
          "symbol": "cross",
          "anchor": {
            "kind": "bond",
            "a": "B1",
            "b": "H1",
            "slot": 1
          }
        },
        {
          "id": "e1241",
          "symbol": "dot",
          "anchor": {
            "kind": "bond",
            "a": "B1",
            "b": "H2",
            "slot": 0
          }
        },
        {
          "id": "e1242",
          "symbol": "cross",
          "anchor": {
            "kind": "bond",
            "a": "B1",
            "b": "H2",
            "slot": 1
          }
        },
        {
          "id": "e1243",
          "symbol": "dot",
          "anchor": {
            "kind": "bond",
            "a": "B1",
            "b": "H3",
            "slot": 0
          }
        },
        {
          "id": "e1244",
          "symbol": "cross",
          "anchor": {
            "kind": "bond",
            "a": "B1",
            "b": "H3",
            "slot": 1
          }
        },
        {
          "id": "e1245",
          "symbol": "triangle",
          "anchor": {
            "kind": "bond",
            "a": "B1",
            "b": "H4",
            "slot": 0
          }
        },
        {
          "id": "e1246",
          "symbol": "cross",
          "anchor": {
            "kind": "bond",
            "a": "B1",
            "b": "H4",
            "slot": 1
          }
        }
      ],
      "groups": [
        {
          "id": "Na+",
          "atomIds": [
            "Na1"
          ],
          "charge": 1,
          "bracket": true
        },
        {
          "id": "BH4-",
          "atomIds": [
            "B1",
            "H1",
            "H2",
            "H3",
            "H4"
          ],
          "charge": -1,
          "bracket": true
        }
      ]
    },
    "viewBox": {
      "width": 1000,
      "height": 650,
      "atomRadius": 64,
      "hydrogenRadius": 40,
      "bondLength": 104,
      "shellOverlap": 24
    },
    "electronSlots": {
      "atom": {
        "directions": [
          -100,
          -80,
          -10,
          10,
          80,
          100,
          170,
          190
        ],
        "radius": 64,
        "hydrogenRadius": 40
      },
      "bond": {
        "maxPairs": 3,
        "centredInOverlap": true,
        "perpendicularOffsets": [
          -5,
          5
        ],
        "pairSpacing": 22
      }
    },
    "marking": {
      "speciesSpecific": true,
      "shellTargets": {},
      "transferredSymbol": "triangle",
      "geometryChecked": false
    }
  },
  {
    "id": "phosphorus-pentachloride",
    "name": "phosphorus pentachloride molecule (gas)",
    "formula": "PCl5",
    "displayFormula": "PCl₅",
    "totalCharge": 0,
    "namedSpecies": true,
    "category": "covalent",
    "practiceCategory": "covalent",
    "extension": false,
    "grades": [
      3
    ],
    "scope": "OCR A Level Chemistry A 2.2.2(a,e)",
    "atlasEvidence": null,
    "smiles": null,
    "prompt": "Draw the dot-and-cross diagram for phosphorus pentachloride molecule (gas). Show all outer-shell electrons.",
    "explanation": "The central P atom has 10 electrons around it. The arrangement shown is schematic; molecular shape is not assessed in this task. Bonds: 5 × Cl–P (1 shared pair). Non-bonding inventory: 5 × Cl: 6 non-bonding electrons.",
    "sourceRefs": [
      "resources/a-level-past-paper-atlas/run2/specification-evidence/sections.json#2.2.2(a,e)"
    ],
    "reference": {
      "atoms": [
        {
          "id": "P1",
          "element": "P",
          "x": 500,
          "y": 325
        },
        {
          "id": "Cl1",
          "element": "Cl",
          "x": 500,
          "y": 185
        },
        {
          "id": "Cl2",
          "element": "Cl",
          "x": 621.2435565298214,
          "y": 255
        },
        {
          "id": "Cl3",
          "element": "Cl",
          "x": 621.2435565298214,
          "y": 395
        },
        {
          "id": "Cl4",
          "element": "Cl",
          "x": 500,
          "y": 465
        },
        {
          "id": "Cl5",
          "element": "Cl",
          "x": 360,
          "y": 325
        }
      ],
      "electrons": [
        {
          "id": "e1247",
          "symbol": "dot",
          "anchor": {
            "kind": "bond",
            "a": "P1",
            "b": "Cl1",
            "slot": 0
          }
        },
        {
          "id": "e1248",
          "symbol": "cross",
          "anchor": {
            "kind": "bond",
            "a": "P1",
            "b": "Cl1",
            "slot": 1
          }
        },
        {
          "id": "e1249",
          "symbol": "dot",
          "anchor": {
            "kind": "bond",
            "a": "P1",
            "b": "Cl2",
            "slot": 0
          }
        },
        {
          "id": "e1250",
          "symbol": "cross",
          "anchor": {
            "kind": "bond",
            "a": "P1",
            "b": "Cl2",
            "slot": 1
          }
        },
        {
          "id": "e1251",
          "symbol": "dot",
          "anchor": {
            "kind": "bond",
            "a": "P1",
            "b": "Cl3",
            "slot": 0
          }
        },
        {
          "id": "e1252",
          "symbol": "cross",
          "anchor": {
            "kind": "bond",
            "a": "P1",
            "b": "Cl3",
            "slot": 1
          }
        },
        {
          "id": "e1253",
          "symbol": "dot",
          "anchor": {
            "kind": "bond",
            "a": "P1",
            "b": "Cl4",
            "slot": 0
          }
        },
        {
          "id": "e1254",
          "symbol": "cross",
          "anchor": {
            "kind": "bond",
            "a": "P1",
            "b": "Cl4",
            "slot": 1
          }
        },
        {
          "id": "e1255",
          "symbol": "dot",
          "anchor": {
            "kind": "bond",
            "a": "P1",
            "b": "Cl5",
            "slot": 0
          }
        },
        {
          "id": "e1256",
          "symbol": "cross",
          "anchor": {
            "kind": "bond",
            "a": "P1",
            "b": "Cl5",
            "slot": 1
          }
        },
        {
          "id": "e1257",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "Cl1",
            "slot": 0
          }
        },
        {
          "id": "e1258",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "Cl1",
            "slot": 1
          }
        },
        {
          "id": "e1259",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "Cl1",
            "slot": 2
          }
        },
        {
          "id": "e1260",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "Cl1",
            "slot": 3
          }
        },
        {
          "id": "e1261",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "Cl1",
            "slot": 4
          }
        },
        {
          "id": "e1262",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "Cl1",
            "slot": 5
          }
        },
        {
          "id": "e1263",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "Cl2",
            "slot": 0
          }
        },
        {
          "id": "e1264",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "Cl2",
            "slot": 1
          }
        },
        {
          "id": "e1265",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "Cl2",
            "slot": 2
          }
        },
        {
          "id": "e1266",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "Cl2",
            "slot": 3
          }
        },
        {
          "id": "e1267",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "Cl2",
            "slot": 4
          }
        },
        {
          "id": "e1268",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "Cl2",
            "slot": 5
          }
        },
        {
          "id": "e1269",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "Cl3",
            "slot": 0
          }
        },
        {
          "id": "e1270",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "Cl3",
            "slot": 1
          }
        },
        {
          "id": "e1271",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "Cl3",
            "slot": 2
          }
        },
        {
          "id": "e1272",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "Cl3",
            "slot": 3
          }
        },
        {
          "id": "e1273",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "Cl3",
            "slot": 4
          }
        },
        {
          "id": "e1274",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "Cl3",
            "slot": 5
          }
        },
        {
          "id": "e1275",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "Cl4",
            "slot": 0
          }
        },
        {
          "id": "e1276",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "Cl4",
            "slot": 1
          }
        },
        {
          "id": "e1277",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "Cl4",
            "slot": 2
          }
        },
        {
          "id": "e1278",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "Cl4",
            "slot": 3
          }
        },
        {
          "id": "e1279",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "Cl4",
            "slot": 4
          }
        },
        {
          "id": "e1280",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "Cl4",
            "slot": 5
          }
        },
        {
          "id": "e1281",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "Cl5",
            "slot": 0
          }
        },
        {
          "id": "e1282",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "Cl5",
            "slot": 1
          }
        },
        {
          "id": "e1283",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "Cl5",
            "slot": 2
          }
        },
        {
          "id": "e1284",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "Cl5",
            "slot": 3
          }
        },
        {
          "id": "e1285",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "Cl5",
            "slot": 4
          }
        },
        {
          "id": "e1286",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "Cl5",
            "slot": 5
          }
        }
      ],
      "groups": []
    },
    "viewBox": {
      "width": 1000,
      "height": 650,
      "atomRadius": 64,
      "hydrogenRadius": 40,
      "bondLength": 104,
      "shellOverlap": 24
    },
    "electronSlots": {
      "atom": {
        "directions": [
          -100,
          -80,
          -10,
          10,
          80,
          100,
          170,
          190
        ],
        "radius": 64,
        "hydrogenRadius": 40
      },
      "bond": {
        "maxPairs": 3,
        "centredInOverlap": true,
        "perpendicularOffsets": [
          -5,
          5
        ],
        "pairSpacing": 22
      }
    },
    "marking": {
      "speciesSpecific": true,
      "shellTargets": {
        "P1": 10
      },
      "transferredSymbol": null,
      "geometryChecked": false
    }
  },
  {
    "id": "sulfur-hexafluoride",
    "name": "sulfur hexafluoride",
    "formula": "SF6",
    "displayFormula": "SF₆",
    "totalCharge": 0,
    "namedSpecies": true,
    "category": "covalent",
    "practiceCategory": "covalent",
    "extension": false,
    "grades": [
      3
    ],
    "scope": "OCR A Level Chemistry A 2.2.2(a,e)",
    "atlasEvidence": null,
    "smiles": null,
    "prompt": "Draw the dot-and-cross diagram for sulfur hexafluoride. Show all outer-shell electrons.",
    "explanation": "The central S atom has 12 electrons around it. The arrangement shown is schematic; molecular shape is not assessed in this task. Bonds: 6 × F–S (1 shared pair). Non-bonding inventory: 6 × F: 6 non-bonding electrons.",
    "sourceRefs": [
      "resources/a-level-past-paper-atlas/run2/specification-evidence/sections.json#2.2.2(a,e)"
    ],
    "reference": {
      "atoms": [
        {
          "id": "S1",
          "element": "S",
          "x": 500,
          "y": 325
        },
        {
          "id": "F1",
          "element": "F",
          "x": 640,
          "y": 325
        },
        {
          "id": "F2",
          "element": "F",
          "x": 570,
          "y": 446.2435565298214
        },
        {
          "id": "F3",
          "element": "F",
          "x": 430,
          "y": 446.24355652982143
        },
        {
          "id": "F4",
          "element": "F",
          "x": 360,
          "y": 325
        },
        {
          "id": "F5",
          "element": "F",
          "x": 429.99999999999994,
          "y": 203.75644347017862
        },
        {
          "id": "F6",
          "element": "F",
          "x": 570,
          "y": 203.7564434701786
        }
      ],
      "electrons": [
        {
          "id": "e1287",
          "symbol": "dot",
          "anchor": {
            "kind": "bond",
            "a": "S1",
            "b": "F1",
            "slot": 0
          }
        },
        {
          "id": "e1288",
          "symbol": "cross",
          "anchor": {
            "kind": "bond",
            "a": "S1",
            "b": "F1",
            "slot": 1
          }
        },
        {
          "id": "e1289",
          "symbol": "dot",
          "anchor": {
            "kind": "bond",
            "a": "S1",
            "b": "F2",
            "slot": 0
          }
        },
        {
          "id": "e1290",
          "symbol": "cross",
          "anchor": {
            "kind": "bond",
            "a": "S1",
            "b": "F2",
            "slot": 1
          }
        },
        {
          "id": "e1291",
          "symbol": "dot",
          "anchor": {
            "kind": "bond",
            "a": "S1",
            "b": "F3",
            "slot": 0
          }
        },
        {
          "id": "e1292",
          "symbol": "cross",
          "anchor": {
            "kind": "bond",
            "a": "S1",
            "b": "F3",
            "slot": 1
          }
        },
        {
          "id": "e1293",
          "symbol": "dot",
          "anchor": {
            "kind": "bond",
            "a": "S1",
            "b": "F4",
            "slot": 0
          }
        },
        {
          "id": "e1294",
          "symbol": "cross",
          "anchor": {
            "kind": "bond",
            "a": "S1",
            "b": "F4",
            "slot": 1
          }
        },
        {
          "id": "e1295",
          "symbol": "dot",
          "anchor": {
            "kind": "bond",
            "a": "S1",
            "b": "F5",
            "slot": 0
          }
        },
        {
          "id": "e1296",
          "symbol": "cross",
          "anchor": {
            "kind": "bond",
            "a": "S1",
            "b": "F5",
            "slot": 1
          }
        },
        {
          "id": "e1297",
          "symbol": "dot",
          "anchor": {
            "kind": "bond",
            "a": "S1",
            "b": "F6",
            "slot": 0
          }
        },
        {
          "id": "e1298",
          "symbol": "cross",
          "anchor": {
            "kind": "bond",
            "a": "S1",
            "b": "F6",
            "slot": 1
          }
        },
        {
          "id": "e1299",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "F1",
            "slot": 0
          }
        },
        {
          "id": "e1300",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "F1",
            "slot": 1
          }
        },
        {
          "id": "e1301",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "F1",
            "slot": 2
          }
        },
        {
          "id": "e1302",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "F1",
            "slot": 3
          }
        },
        {
          "id": "e1303",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "F1",
            "slot": 4
          }
        },
        {
          "id": "e1304",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "F1",
            "slot": 5
          }
        },
        {
          "id": "e1305",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "F2",
            "slot": 0
          }
        },
        {
          "id": "e1306",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "F2",
            "slot": 1
          }
        },
        {
          "id": "e1307",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "F2",
            "slot": 2
          }
        },
        {
          "id": "e1308",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "F2",
            "slot": 3
          }
        },
        {
          "id": "e1309",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "F2",
            "slot": 4
          }
        },
        {
          "id": "e1310",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "F2",
            "slot": 5
          }
        },
        {
          "id": "e1311",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "F3",
            "slot": 0
          }
        },
        {
          "id": "e1312",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "F3",
            "slot": 1
          }
        },
        {
          "id": "e1313",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "F3",
            "slot": 2
          }
        },
        {
          "id": "e1314",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "F3",
            "slot": 3
          }
        },
        {
          "id": "e1315",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "F3",
            "slot": 4
          }
        },
        {
          "id": "e1316",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "F3",
            "slot": 5
          }
        },
        {
          "id": "e1317",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "F4",
            "slot": 0
          }
        },
        {
          "id": "e1318",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "F4",
            "slot": 1
          }
        },
        {
          "id": "e1319",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "F4",
            "slot": 2
          }
        },
        {
          "id": "e1320",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "F4",
            "slot": 3
          }
        },
        {
          "id": "e1321",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "F4",
            "slot": 4
          }
        },
        {
          "id": "e1322",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "F4",
            "slot": 5
          }
        },
        {
          "id": "e1323",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "F5",
            "slot": 0
          }
        },
        {
          "id": "e1324",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "F5",
            "slot": 1
          }
        },
        {
          "id": "e1325",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "F5",
            "slot": 2
          }
        },
        {
          "id": "e1326",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "F5",
            "slot": 3
          }
        },
        {
          "id": "e1327",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "F5",
            "slot": 4
          }
        },
        {
          "id": "e1328",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "F5",
            "slot": 5
          }
        },
        {
          "id": "e1329",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "F6",
            "slot": 0
          }
        },
        {
          "id": "e1330",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "F6",
            "slot": 1
          }
        },
        {
          "id": "e1331",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "F6",
            "slot": 2
          }
        },
        {
          "id": "e1332",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "F6",
            "slot": 3
          }
        },
        {
          "id": "e1333",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "F6",
            "slot": 4
          }
        },
        {
          "id": "e1334",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "F6",
            "slot": 5
          }
        }
      ],
      "groups": []
    },
    "viewBox": {
      "width": 1000,
      "height": 650,
      "atomRadius": 64,
      "hydrogenRadius": 40,
      "bondLength": 104,
      "shellOverlap": 24
    },
    "electronSlots": {
      "atom": {
        "directions": [
          -100,
          -80,
          -10,
          10,
          80,
          100,
          170,
          190
        ],
        "radius": 64,
        "hydrogenRadius": 40
      },
      "bond": {
        "maxPairs": 3,
        "centredInOverlap": true,
        "perpendicularOffsets": [
          -5,
          5
        ],
        "pairSpacing": 22
      }
    },
    "marking": {
      "speciesSpecific": true,
      "shellTargets": {
        "S1": 12
      },
      "transferredSymbol": null,
      "geometryChecked": false
    }
  },
  {
    "id": "sulfur-tetrafluoride",
    "name": "sulfur tetrafluoride",
    "formula": "SF4",
    "displayFormula": "SF₄",
    "totalCharge": 0,
    "namedSpecies": true,
    "category": "covalent",
    "practiceCategory": "covalent",
    "extension": false,
    "grades": [
      3
    ],
    "scope": "OCR A Level Chemistry A 2.2.2(a,e)",
    "atlasEvidence": null,
    "smiles": null,
    "prompt": "Draw the dot-and-cross diagram for sulfur tetrafluoride. Show all outer-shell electrons.",
    "explanation": "The central S atom has 10 electrons around it. The arrangement shown is schematic; molecular shape is not assessed in this task. Bonds: 4 × F–S (1 shared pair). Non-bonding inventory: 1 × S: 2 non-bonding electrons; 4 × F: 6 non-bonding electrons.",
    "sourceRefs": [
      "resources/a-level-past-paper-atlas/run2/specification-evidence/sections.json#2.2.2(a,e)"
    ],
    "reference": {
      "atoms": [
        {
          "id": "S1",
          "element": "S",
          "x": 500,
          "y": 325
        },
        {
          "id": "F1",
          "element": "F",
          "x": 604,
          "y": 325
        },
        {
          "id": "F2",
          "element": "F",
          "x": 552,
          "y": 415.0666419935816
        },
        {
          "id": "F3",
          "element": "F",
          "x": 396,
          "y": 325
        },
        {
          "id": "F4",
          "element": "F",
          "x": 552,
          "y": 234.9333580064184
        }
      ],
      "electrons": [
        {
          "id": "e1335",
          "symbol": "dot",
          "anchor": {
            "kind": "bond",
            "a": "S1",
            "b": "F1",
            "slot": 0
          }
        },
        {
          "id": "e1336",
          "symbol": "cross",
          "anchor": {
            "kind": "bond",
            "a": "S1",
            "b": "F1",
            "slot": 1
          }
        },
        {
          "id": "e1337",
          "symbol": "dot",
          "anchor": {
            "kind": "bond",
            "a": "S1",
            "b": "F2",
            "slot": 0
          }
        },
        {
          "id": "e1338",
          "symbol": "cross",
          "anchor": {
            "kind": "bond",
            "a": "S1",
            "b": "F2",
            "slot": 1
          }
        },
        {
          "id": "e1339",
          "symbol": "dot",
          "anchor": {
            "kind": "bond",
            "a": "S1",
            "b": "F3",
            "slot": 0
          }
        },
        {
          "id": "e1340",
          "symbol": "cross",
          "anchor": {
            "kind": "bond",
            "a": "S1",
            "b": "F3",
            "slot": 1
          }
        },
        {
          "id": "e1341",
          "symbol": "dot",
          "anchor": {
            "kind": "bond",
            "a": "S1",
            "b": "F4",
            "slot": 0
          }
        },
        {
          "id": "e1342",
          "symbol": "cross",
          "anchor": {
            "kind": "bond",
            "a": "S1",
            "b": "F4",
            "slot": 1
          }
        },
        {
          "id": "e1343",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "S1",
            "slot": 0
          }
        },
        {
          "id": "e1344",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "S1",
            "slot": 1
          }
        },
        {
          "id": "e1345",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "F1",
            "slot": 0
          }
        },
        {
          "id": "e1346",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "F1",
            "slot": 1
          }
        },
        {
          "id": "e1347",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "F1",
            "slot": 2
          }
        },
        {
          "id": "e1348",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "F1",
            "slot": 3
          }
        },
        {
          "id": "e1349",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "F1",
            "slot": 4
          }
        },
        {
          "id": "e1350",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "F1",
            "slot": 5
          }
        },
        {
          "id": "e1351",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "F2",
            "slot": 0
          }
        },
        {
          "id": "e1352",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "F2",
            "slot": 1
          }
        },
        {
          "id": "e1353",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "F2",
            "slot": 2
          }
        },
        {
          "id": "e1354",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "F2",
            "slot": 3
          }
        },
        {
          "id": "e1355",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "F2",
            "slot": 4
          }
        },
        {
          "id": "e1356",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "F2",
            "slot": 5
          }
        },
        {
          "id": "e1357",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "F3",
            "slot": 0
          }
        },
        {
          "id": "e1358",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "F3",
            "slot": 1
          }
        },
        {
          "id": "e1359",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "F3",
            "slot": 2
          }
        },
        {
          "id": "e1360",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "F3",
            "slot": 3
          }
        },
        {
          "id": "e1361",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "F3",
            "slot": 4
          }
        },
        {
          "id": "e1362",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "F3",
            "slot": 5
          }
        },
        {
          "id": "e1363",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "F4",
            "slot": 0
          }
        },
        {
          "id": "e1364",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "F4",
            "slot": 1
          }
        },
        {
          "id": "e1365",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "F4",
            "slot": 2
          }
        },
        {
          "id": "e1366",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "F4",
            "slot": 3
          }
        },
        {
          "id": "e1367",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "F4",
            "slot": 4
          }
        },
        {
          "id": "e1368",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "F4",
            "slot": 5
          }
        }
      ],
      "groups": []
    },
    "viewBox": {
      "width": 1000,
      "height": 650,
      "atomRadius": 64,
      "hydrogenRadius": 40,
      "bondLength": 104,
      "shellOverlap": 24
    },
    "electronSlots": {
      "atom": {
        "directions": [
          -100,
          -80,
          -10,
          10,
          80,
          100,
          170,
          190
        ],
        "radius": 64,
        "hydrogenRadius": 40
      },
      "bond": {
        "maxPairs": 3,
        "centredInOverlap": true,
        "perpendicularOffsets": [
          -5,
          5
        ],
        "pairSpacing": 22
      }
    },
    "marking": {
      "speciesSpecific": true,
      "shellTargets": {
        "S1": 10
      },
      "transferredSymbol": null,
      "geometryChecked": false
    }
  },
  {
    "id": "chlorine-trifluoride",
    "name": "chlorine trifluoride",
    "formula": "ClF3",
    "displayFormula": "ClF₃",
    "totalCharge": 0,
    "namedSpecies": true,
    "category": "covalent",
    "practiceCategory": "covalent",
    "extension": false,
    "grades": [
      3
    ],
    "scope": "OCR A Level Chemistry A 2.2.2(a,e)",
    "atlasEvidence": null,
    "smiles": null,
    "prompt": "Draw the dot-and-cross diagram for chlorine trifluoride. Show all outer-shell electrons.",
    "explanation": "The central Cl atom has 10 electrons around it. The arrangement shown is schematic; molecular shape is not assessed in this task. Bonds: 3 × Cl–F (1 shared pair). Non-bonding inventory: 1 × Cl: 4 non-bonding electrons; 3 × F: 6 non-bonding electrons.",
    "sourceRefs": [
      "resources/a-level-past-paper-atlas/run2/specification-evidence/sections.json#2.2.2(a,e)"
    ],
    "reference": {
      "atoms": [
        {
          "id": "Cl1",
          "element": "Cl",
          "x": 500,
          "y": 325
        },
        {
          "id": "F1",
          "element": "F",
          "x": 500,
          "y": 221
        },
        {
          "id": "F2",
          "element": "F",
          "x": 604,
          "y": 325
        },
        {
          "id": "F3",
          "element": "F",
          "x": 396,
          "y": 325
        }
      ],
      "electrons": [
        {
          "id": "e1369",
          "symbol": "dot",
          "anchor": {
            "kind": "bond",
            "a": "Cl1",
            "b": "F1",
            "slot": 0
          }
        },
        {
          "id": "e1370",
          "symbol": "cross",
          "anchor": {
            "kind": "bond",
            "a": "Cl1",
            "b": "F1",
            "slot": 1
          }
        },
        {
          "id": "e1371",
          "symbol": "dot",
          "anchor": {
            "kind": "bond",
            "a": "Cl1",
            "b": "F2",
            "slot": 0
          }
        },
        {
          "id": "e1372",
          "symbol": "cross",
          "anchor": {
            "kind": "bond",
            "a": "Cl1",
            "b": "F2",
            "slot": 1
          }
        },
        {
          "id": "e1373",
          "symbol": "dot",
          "anchor": {
            "kind": "bond",
            "a": "Cl1",
            "b": "F3",
            "slot": 0
          }
        },
        {
          "id": "e1374",
          "symbol": "cross",
          "anchor": {
            "kind": "bond",
            "a": "Cl1",
            "b": "F3",
            "slot": 1
          }
        },
        {
          "id": "e1375",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "Cl1",
            "slot": 0
          }
        },
        {
          "id": "e1376",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "Cl1",
            "slot": 1
          }
        },
        {
          "id": "e1377",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "Cl1",
            "slot": 2
          }
        },
        {
          "id": "e1378",
          "symbol": "dot",
          "anchor": {
            "kind": "atom",
            "atomId": "Cl1",
            "slot": 3
          }
        },
        {
          "id": "e1379",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "F1",
            "slot": 0
          }
        },
        {
          "id": "e1380",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "F1",
            "slot": 1
          }
        },
        {
          "id": "e1381",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "F1",
            "slot": 2
          }
        },
        {
          "id": "e1382",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "F1",
            "slot": 3
          }
        },
        {
          "id": "e1383",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "F1",
            "slot": 4
          }
        },
        {
          "id": "e1384",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "F1",
            "slot": 5
          }
        },
        {
          "id": "e1385",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "F2",
            "slot": 0
          }
        },
        {
          "id": "e1386",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "F2",
            "slot": 1
          }
        },
        {
          "id": "e1387",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "F2",
            "slot": 2
          }
        },
        {
          "id": "e1388",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "F2",
            "slot": 3
          }
        },
        {
          "id": "e1389",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "F2",
            "slot": 4
          }
        },
        {
          "id": "e1390",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "F2",
            "slot": 5
          }
        },
        {
          "id": "e1391",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "F3",
            "slot": 0
          }
        },
        {
          "id": "e1392",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "F3",
            "slot": 1
          }
        },
        {
          "id": "e1393",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "F3",
            "slot": 2
          }
        },
        {
          "id": "e1394",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "F3",
            "slot": 3
          }
        },
        {
          "id": "e1395",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "F3",
            "slot": 4
          }
        },
        {
          "id": "e1396",
          "symbol": "cross",
          "anchor": {
            "kind": "atom",
            "atomId": "F3",
            "slot": 5
          }
        }
      ],
      "groups": []
    },
    "viewBox": {
      "width": 1000,
      "height": 650,
      "atomRadius": 64,
      "hydrogenRadius": 40,
      "bondLength": 104,
      "shellOverlap": 24
    },
    "electronSlots": {
      "atom": {
        "directions": [
          -100,
          -80,
          -10,
          10,
          80,
          100,
          170,
          190
        ],
        "radius": 64,
        "hydrogenRadius": 40
      },
      "bond": {
        "maxPairs": 3,
        "centredInOverlap": true,
        "perpendicularOffsets": [
          -5,
          5
        ],
        "pairSpacing": 22
      }
    },
    "marking": {
      "speciesSpecific": true,
      "shellTargets": {
        "Cl1": 10
      },
      "transferredSymbol": null,
      "geometryChecked": false
    }
  }
];
