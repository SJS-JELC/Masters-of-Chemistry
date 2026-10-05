// Regenerate from accepted source inventory: node scripts/write-catalogue-definitions.mjs
// Metadata is not an enabled provider; createRegistry registers only explicitly supplied adapters.
import type {ActivityDefinition} from './registry.ts';
import { olympiad2011Definition } from './olympiad-2011-definition.ts';
export const activityDefinitions = [
  {
    "id": "alevel/acid-base-calculations",
    "course": "alevel",
    "strand": "curriculum",
    "title": "Acid–base calculations",
    "source": [
      {
        "path": "apps/Masters-of-A-Level-Chemistry/src/activities/acid-base-calculations/app.js",
        "sha256": "dc81ed08d58b04794d944658b99c1a78276bbb6609c501f7b9bde54d75637037",
        "symbolOrSection": "activity-owned source provenance; executable entries are retained separately in the coverage manifest"
      },
      {
        "path": "apps/Masters-of-A-Level-Chemistry/src/activities/acid-base-calculations/core.js",
        "sha256": "7ea6d506602387d1887742fc8f1899dfaf867c2b4f9e0234440b7cf8c2f8093f",
        "symbolOrSection": "activity-owned source provenance; executable entries are retained separately in the coverage manifest"
      },
      {
        "path": "apps/Masters-of-A-Level-Chemistry/src/activities/acid-base-calculations/data.js",
        "sha256": "0002363d5bb1b723a10806e1faf1038d41af130a2265f96cb89bc1da94db8903",
        "symbolOrSection": "activity-owned source provenance; executable entries are retained separately in the coverage manifest"
      },
      {
        "path": "apps/Masters-of-A-Level-Chemistry/src/activities/acid-base-calculations/index.html",
        "sha256": "9f0a40b7ccfcfd87540273b40905345c4c5b6169ef264472cd353312156181c2",
        "symbolOrSection": "activity-owned source provenance; executable entries are retained separately in the coverage manifest"
      },
      {
        "path": "apps/Masters-of-A-Level-Chemistry/src/activities/acid-base-calculations/levels-app.js",
        "sha256": "a5bfb680e23325cb25c25bdeba8024d236be7909a54b9f790a7766a51c2b10b7",
        "symbolOrSection": "activity-owned source provenance; executable entries are retained separately in the coverage manifest"
      },
      {
        "path": "apps/Masters-of-A-Level-Chemistry/src/activities/acid-base-calculations/levels.css",
        "sha256": "0dd0300492f396362bc0cfa7ce813f56650309d1c84bdc8d78dc264719e3d6d7",
        "symbolOrSection": "activity-owned source provenance; executable entries are retained separately in the coverage manifest"
      },
      {
        "path": "apps/Masters-of-A-Level-Chemistry/src/activities/acid-base-calculations/levels.js",
        "sha256": "87a9e253b876e4daa122382da6a1a4ac445fd5efe4d7d2c67198ae6b7ba211e2",
        "symbolOrSection": "activity-owned source provenance; executable entries are retained separately in the coverage manifest"
      },
      {
        "path": "apps/Masters-of-A-Level-Chemistry/src/activities/acid-base-calculations/mastery-src/app.js",
        "sha256": "e9af6fc733d2dc33f1c7f0c72602ac8968519f58c92a69af1876ddda2e5221bf",
        "symbolOrSection": "activity-owned source provenance; executable entries are retained separately in the coverage manifest"
      },
      {
        "path": "apps/Masters-of-A-Level-Chemistry/src/activities/acid-base-calculations/mastery-src/core.js",
        "sha256": "f915737b901b618727bcc8f278400e6e3f665c5e781bb9e04686de44aeaa81d2",
        "symbolOrSection": "activity-owned source provenance; executable entries are retained separately in the coverage manifest"
      },
      {
        "path": "apps/Masters-of-A-Level-Chemistry/src/activities/acid-base-calculations/mastery-src/styles.css",
        "sha256": "375055e44de7d698d9e276fa94232230f70e957e18d536a76cf7a6d52f68c452",
        "symbolOrSection": "activity-owned source provenance; executable entries are retained separately in the coverage manifest"
      },
      {
        "path": "apps/Masters-of-A-Level-Chemistry/src/activities/acid-base-calculations/mastery-src/template.html",
        "sha256": "f4ece6f8891429f1cd84d39f7fb2e13900b665dac75d7a5687159af42faa514a",
        "symbolOrSection": "activity-owned source provenance; executable entries are retained separately in the coverage manifest"
      },
      {
        "path": "apps/Masters-of-A-Level-Chemistry/src/activities/acid-base-calculations/mastery.html",
        "sha256": "79b5f2f3bbf700b8f3135232d0a28344dbc0a3a5b3e530c98d90946196b39dcd",
        "symbolOrSection": "activity-owned source provenance; executable entries are retained separately in the coverage manifest"
      },
      {
        "path": "apps/Masters-of-A-Level-Chemistry/src/activities/acid-base-calculations/scaffold.js",
        "sha256": "0db8306a2dcc32e1a0ecb9b81496788689cff1962948ed0b68592ee53a171228",
        "symbolOrSection": "activity-owned source provenance; executable entries are retained separately in the coverage manifest"
      },
      {
        "path": "apps/Masters-of-A-Level-Chemistry/src/activities/acid-base-calculations/styles.css",
        "sha256": "26dff981d5c9f826d1de5b4469fd3aca95014a3202256c62ee0a7b82461e199e",
        "symbolOrSection": "activity-owned source provenance; executable entries are retained separately in the coverage manifest"
      }
    ],
    "gems": [
      {
        "id": "u6-t1-1-2",
        "topicId": "u6-t1-1",
        "label": "Strong Acids & pH",
        "supportedLevels": [
          1,
          2,
          3
        ],
        "mastery": {
          "gemId": "u6-t1-1-2",
          "supportedLevels": [
            {
              "level": 1,
              "halfLife": 2,
              "label": "Level 1 · Structured"
            },
            {
              "level": 2,
              "halfLife": 2,
              "label": "Level 2 · Unstructured"
            },
            {
              "level": 3,
              "halfLife": 2,
              "label": "Level 3 · Applications"
            }
          ],
          "threshold": 0.8,
          "comparison": "strictly-greater",
          "historicalAliases": [],
          "legacySourceKeys": [
            "masters-alevel-results-v1",
            "masters-alevel-results-acid-v2"
          ],
          "activeProgressionVersion": 2
        }
      },
      {
        "id": "u6-t1-1-3",
        "topicId": "u6-t1-1",
        "label": "Kw & Strong Bases",
        "supportedLevels": [
          1,
          2,
          3
        ],
        "mastery": {
          "gemId": "u6-t1-1-3",
          "supportedLevels": [
            {
              "level": 1,
              "halfLife": 2,
              "label": "Level 1 · Structured"
            },
            {
              "level": 2,
              "halfLife": 2,
              "label": "Level 2 · Unstructured"
            },
            {
              "level": 3,
              "halfLife": 2,
              "label": "Level 3 · Applications"
            }
          ],
          "threshold": 0.8,
          "comparison": "strictly-greater",
          "historicalAliases": [],
          "legacySourceKeys": [
            "masters-alevel-results-v1",
            "masters-alevel-results-acid-v2"
          ],
          "activeProgressionVersion": 2
        }
      },
      {
        "id": "u6-t1-1-5",
        "topicId": "u6-t1-1",
        "label": "Weak Acid Calculations",
        "supportedLevels": [
          1,
          2,
          3
        ],
        "mastery": {
          "gemId": "u6-t1-1-5",
          "supportedLevels": [
            {
              "level": 1,
              "halfLife": 2,
              "label": "Level 1 · Structured"
            },
            {
              "level": 2,
              "halfLife": 2,
              "label": "Level 2 · Unstructured"
            },
            {
              "level": 3,
              "halfLife": 2,
              "label": "Level 3 · Applications"
            }
          ],
          "threshold": 0.8,
          "comparison": "strictly-greater",
          "historicalAliases": [],
          "legacySourceKeys": [
            "masters-alevel-results-v1",
            "masters-alevel-results-acid-v2"
          ],
          "activeProgressionVersion": 2
        }
      },
      {
        "id": "u6-t1-1-7",
        "topicId": "u6-t1-1",
        "label": "Making Buffers",
        "supportedLevels": [
          1,
          2,
          3
        ],
        "mastery": {
          "gemId": "u6-t1-1-7",
          "supportedLevels": [
            {
              "level": 1,
              "halfLife": 2,
              "label": "Level 1 · Structured"
            },
            {
              "level": 2,
              "halfLife": 2,
              "label": "Level 2 · Unstructured"
            },
            {
              "level": 3,
              "halfLife": 2,
              "label": "Level 3 · Applications"
            }
          ],
          "threshold": 0.8,
          "comparison": "strictly-greater",
          "historicalAliases": [],
          "legacySourceKeys": [
            "masters-alevel-results-v1",
            "masters-alevel-results-acid-v2"
          ],
          "activeProgressionVersion": 2
        }
      },
      {
        "id": "u6-t1-1-8",
        "topicId": "u6-t1-1",
        "label": "Buffer Calculations",
        "supportedLevels": [
          1,
          2,
          3
        ],
        "mastery": {
          "gemId": "u6-t1-1-8",
          "supportedLevels": [
            {
              "level": 1,
              "halfLife": 2,
              "label": "Level 1 · Structured"
            },
            {
              "level": 2,
              "halfLife": 2,
              "label": "Level 2 · Unstructured"
            },
            {
              "level": 3,
              "halfLife": 2,
              "label": "Level 3 · Applications"
            }
          ],
          "threshold": 0.8,
          "comparison": "strictly-greater",
          "historicalAliases": [],
          "legacySourceKeys": [
            "masters-alevel-results-v1",
            "masters-alevel-results-acid-v2"
          ],
          "activeProgressionVersion": 2
        }
      }
    ]
  },
  {
    "id": "alevel/electrons-bonding",
    "course": "alevel",
    "strand": "curriculum",
    "title": "Electrons and bonding",
    "source": [
      {
        "path": "apps/Masters-of-A-Level-Chemistry/src/activities/electrons-bonding/app.js",
        "sha256": "5d5d5e814eb20f789c6a1ccdb00a4772c357f63d105882504500e6686eeba82c",
        "symbolOrSection": "activity-owned source provenance; executable entries are retained separately in the coverage manifest"
      },
      {
        "path": "apps/Masters-of-A-Level-Chemistry/src/activities/electrons-bonding/core.js",
        "sha256": "f5e833bd177f17f0a26c80242c96de7f257fc1f8f7a464211f158df0919a8381",
        "symbolOrSection": "activity-owned source provenance; executable entries are retained separately in the coverage manifest"
      },
      {
        "path": "apps/Masters-of-A-Level-Chemistry/src/activities/electrons-bonding/data.js",
        "sha256": "edacb29ca884603acbb0408fc676786e069e9ce75332a4321b07ccb65cad04f2",
        "symbolOrSection": "activity-owned source provenance; executable entries are retained separately in the coverage manifest"
      },
      {
        "path": "apps/Masters-of-A-Level-Chemistry/src/activities/electrons-bonding/index.html",
        "sha256": "588fa564ae7679d4ec38f76d68ab62a126e76f5e967a30781739dca307459980",
        "symbolOrSection": "activity-owned source provenance; executable entries are retained separately in the coverage manifest"
      },
      {
        "path": "apps/Masters-of-A-Level-Chemistry/src/activities/electrons-bonding/styles.css",
        "sha256": "8ffa94dcd915d80f4c32812f69d9ec28f6133c958a0c3ed4b19afb9c8f804571",
        "symbolOrSection": "activity-owned source provenance; executable entries are retained separately in the coverage manifest"
      }
    ],
    "gems": [
      {
        "id": "l6-t2-1-1",
        "topicId": "l6-t2-1",
        "label": "Electrons & Bonding basics",
        "supportedLevels": [
          1
        ],
        "mastery": {
          "gemId": "l6-t2-1-1",
          "supportedLevels": [
            {
              "level": 1,
              "halfLife": 3,
              "label": "Level 1 · Key learning"
            }
          ],
          "threshold": 0.8,
          "comparison": "strictly-greater",
          "historicalAliases": [],
          "legacySourceKeys": [
            "masters-alevel-results-v1",
            "masters-alevel-results-acid-v2"
          ],
          "activeProgressionVersion": 1
        }
      }
    ]
  },
  {
    "id": "alevel/electron-configurations",
    "course": "alevel",
    "strand": "curriculum",
    "title": "Electron configurations",
    "source": [
      {
        "path": "apps/Masters-of-A-Level-Chemistry/src/activities/electron-configurations/README.md",
        "sha256": "51c3c2cc131e1bbd32beac3f992dfd6f9d5c62b0138d5f5b9365e66b0bacfca3",
        "symbolOrSection": "activity-owned source provenance; executable entries are retained separately in the coverage manifest"
      },
      {
        "path": "apps/Masters-of-A-Level-Chemistry/src/activities/electron-configurations/app.js",
        "sha256": "008c561dd8227ca193549aab27959184c8eb1e656ea02ac423c266ebf40583ba",
        "symbolOrSection": "activity-owned source provenance; executable entries are retained separately in the coverage manifest"
      },
      {
        "path": "apps/Masters-of-A-Level-Chemistry/src/activities/electron-configurations/core.js",
        "sha256": "5d57fdbf2c27e74fe904deae31cbe83def8c1ca7f2fa2046c7350b89554c007a",
        "symbolOrSection": "activity-owned source provenance; executable entries are retained separately in the coverage manifest"
      },
      {
        "path": "apps/Masters-of-A-Level-Chemistry/src/activities/electron-configurations/data.js",
        "sha256": "7f5a4b5b668bc08de0c1d7a1bd794335504de3672702a880c549cf21ec7cafd0",
        "symbolOrSection": "activity-owned source provenance; executable entries are retained separately in the coverage manifest"
      },
      {
        "path": "apps/Masters-of-A-Level-Chemistry/src/activities/electron-configurations/index.html",
        "sha256": "264e80eecaf8714fbdae54843f94927573771769c8ccaedf351485b09ea20d32",
        "symbolOrSection": "activity-owned source provenance; executable entries are retained separately in the coverage manifest"
      },
      {
        "path": "apps/Masters-of-A-Level-Chemistry/src/activities/electron-configurations/levels-app.js",
        "sha256": "5aa42c96f7dfc50a586650bda925f74a989d1aea809085fdd6319099748aeed8",
        "symbolOrSection": "activity-owned source provenance; executable entries are retained separately in the coverage manifest"
      },
      {
        "path": "apps/Masters-of-A-Level-Chemistry/src/activities/electron-configurations/levels.js",
        "sha256": "4bbaaae96cb5d90c18f79960a90c9929b162d131fd595c80c7ce5950191348a9",
        "symbolOrSection": "activity-owned source provenance; executable entries are retained separately in the coverage manifest"
      },
      {
        "path": "apps/Masters-of-A-Level-Chemistry/src/activities/electron-configurations/mastery.html",
        "sha256": "33b1dfa97c229a873209e487a212b2138aa5597ba5987450ee7e79c8a108a039",
        "symbolOrSection": "activity-owned source provenance; executable entries are retained separately in the coverage manifest"
      },
      {
        "path": "apps/Masters-of-A-Level-Chemistry/src/activities/electron-configurations/session.js",
        "sha256": "a5f2ed85e631152fe8ec69ed6eb3fe927a30aa54dea01133b63231af6170190c",
        "symbolOrSection": "activity-owned source provenance; executable entries are retained separately in the coverage manifest"
      },
      {
        "path": "apps/Masters-of-A-Level-Chemistry/src/activities/electron-configurations/styles.css",
        "sha256": "beaba48de0ee9aa4e4a65a5dfa5a8e8c16f3e455fc7c14551f88b67025feaf29",
        "symbolOrSection": "activity-owned source provenance; executable entries are retained separately in the coverage manifest"
      }
    ],
    "gems": [
      {
        "id": "l6-t2-1-2",
        "topicId": "l6-t2-1",
        "label": "Electron configurations",
        "supportedLevels": [
          1,
          2,
          3
        ],
        "mastery": {
          "gemId": "l6-t2-1-2",
          "supportedLevels": [
            {
              "level": 1,
              "halfLife": 3,
              "label": "Level 1"
            },
            {
              "level": 2,
              "halfLife": 3,
              "label": "Level 2"
            },
            {
              "level": 3,
              "halfLife": 3,
              "label": "Level 3"
            }
          ],
          "threshold": 0.8,
          "comparison": "strictly-greater",
          "historicalAliases": [],
          "legacySourceKeys": [
            "masters-alevel-results-v1",
            "masters-alevel-results-acid-v2"
          ],
          "activeProgressionVersion": 1
        }
      }
    ]
  },
  {
    "id": "alevel/dot-and-cross",
    "course": "alevel",
    "strand": "curriculum",
    "title": "Dot-and-cross diagrams",
    "source": [
      {
        "path": "apps/Masters-of-A-Level-Chemistry/src/activities/dot-and-cross/app.js",
        "sha256": "2a7bda97aed854fc67cf51a5a402e3e1598ecd7f5166dbff2e9c435e89843dda",
        "symbolOrSection": "activity-owned source provenance; executable entries are retained separately in the coverage manifest"
      },
      {
        "path": "apps/Masters-of-A-Level-Chemistry/src/activities/dot-and-cross/core.js",
        "sha256": "2300513ad8b155323ae81fa13308435e44813cdfd2fe584bcf5a805f34f7da01",
        "symbolOrSection": "activity-owned source provenance; executable entries are retained separately in the coverage manifest"
      },
      {
        "path": "apps/Masters-of-A-Level-Chemistry/src/activities/dot-and-cross/data.js",
        "sha256": "cdf2cff5efaf76f325744c28898681b58570be993cb16499e4584af6ba479432",
        "symbolOrSection": "activity-owned source provenance; executable entries are retained separately in the coverage manifest"
      },
      {
        "path": "apps/Masters-of-A-Level-Chemistry/src/activities/dot-and-cross/index.html",
        "sha256": "c0e64f6ba7e716ddfdb02b7f406eaf6ede12ae1f523ac6c189d95b23a9eafc69",
        "symbolOrSection": "activity-owned source provenance; executable entries are retained separately in the coverage manifest"
      },
      {
        "path": "apps/Masters-of-A-Level-Chemistry/src/activities/dot-and-cross/renderer.js",
        "sha256": "9fc050d379095ee84dbea25307064c63bcf90e025ed466e77739c38a2464911a",
        "symbolOrSection": "activity-owned source provenance; executable entries are retained separately in the coverage manifest"
      },
      {
        "path": "apps/Masters-of-A-Level-Chemistry/src/activities/dot-and-cross/styles.css",
        "sha256": "097894f334f3b16f68269a234c60f40ed9b749820048d9e9c8a4646a25a5f8f4",
        "symbolOrSection": "activity-owned source provenance; executable entries are retained separately in the coverage manifest"
      }
    ],
    "gems": [
      {
        "id": "l6-t2-1-3",
        "topicId": "l6-t2-1",
        "label": "Dot-and-Cross Diagrams",
        "supportedLevels": [
          1,
          2,
          3
        ],
        "mastery": {
          "gemId": "l6-t2-1-3",
          "supportedLevels": [
            {
              "level": 1,
              "halfLife": 3,
              "label": "Level 1"
            },
            {
              "level": 2,
              "halfLife": 3,
              "label": "Level 2"
            },
            {
              "level": 3,
              "halfLife": 3,
              "label": "Level 3"
            }
          ],
          "threshold": 0.8,
          "comparison": "strictly-greater",
          "historicalAliases": [
            "l6-t2-1-4"
          ],
          "legacySourceKeys": [
            "masters-alevel-results-v1",
            "masters-alevel-results-acid-v2"
          ],
          "activeProgressionVersion": 1
        }
      }
    ]
  },
  {
    "id": "alevel/ph-titration-curves",
    "course": "alevel",
    "strand": "curriculum",
    "title": "pH titration curves",
    "source": [
      {
        "path": "apps/Masters-of-A-Level-Chemistry/src/activities/ph-titration-curves/app.js",
        "sha256": "63e9784331c9fc03e3ec7b28e2f7ec43fe6660e2bc4515d1d5cdfba34e5773e3",
        "symbolOrSection": "activity-owned source provenance; executable entries are retained separately in the coverage manifest"
      },
      {
        "path": "apps/Masters-of-A-Level-Chemistry/src/activities/ph-titration-curves/core.js",
        "sha256": "5d9399d8c33c8aa5e80fe7dd7a5b2231ecb1190a73bed768c98970045ee50846",
        "symbolOrSection": "activity-owned source provenance; executable entries are retained separately in the coverage manifest"
      },
      {
        "path": "apps/Masters-of-A-Level-Chemistry/src/activities/ph-titration-curves/data.js",
        "sha256": "b1c6255a35a1380c867e3183034d03e08bf9c67e2b7d57c622eb815ba75ebf00",
        "symbolOrSection": "activity-owned source provenance; executable entries are retained separately in the coverage manifest"
      },
      {
        "path": "apps/Masters-of-A-Level-Chemistry/src/activities/ph-titration-curves/index.html",
        "sha256": "cff0edda8296ed7429b947b2089b48745eafc32a7e278d50da69d0a8c48a951a",
        "symbolOrSection": "activity-owned source provenance; executable entries are retained separately in the coverage manifest"
      },
      {
        "path": "apps/Masters-of-A-Level-Chemistry/src/activities/ph-titration-curves/session.js",
        "sha256": "21e29fc7bf87528d202b3b75c8036384664e5fd85b25fa4796a0c9797f47f26b",
        "symbolOrSection": "activity-owned source provenance; executable entries are retained separately in the coverage manifest"
      },
      {
        "path": "apps/Masters-of-A-Level-Chemistry/src/activities/ph-titration-curves/styles.css",
        "sha256": "3c1385975b25515f10a0e17cf7b26c77768e85c78982af291c550f8250036972",
        "symbolOrSection": "activity-owned source provenance; executable entries are retained separately in the coverage manifest"
      }
    ],
    "gems": [
      {
        "id": "u6-t1-1-9",
        "topicId": "u6-t1-1",
        "label": "pH Titration Curves",
        "supportedLevels": [
          2,
          3
        ],
        "mastery": {
          "gemId": "u6-t1-1-9",
          "supportedLevels": [
            {
              "level": 2,
              "halfLife": 2,
              "label": "Level 2 · Unstructured"
            },
            {
              "level": 3,
              "halfLife": 2,
              "label": "Level 3 · Applications"
            }
          ],
          "threshold": 0.8,
          "comparison": "strictly-greater",
          "historicalAliases": [],
          "legacySourceKeys": [
            "masters-alevel-results-v1",
            "masters-alevel-results-acid-v2"
          ],
          "activeProgressionVersion": 1
        }
      }
    ]
  },
  {
    "id": "alevel/c3l6-organic-reactions",
    "course": "alevel",
    "strand": "olympiad",
    "title": "C3L6 organic reactions",
    "source": [
      {
        "path": "apps/Masters-of-A-Level-Chemistry/src/activities/c3l6-organic-reactions/activity.css",
        "sha256": "8eaf785d6e06094c372c4a2e6f80cfa912d0df7b2564d32920ace9832baa5158",
        "symbolOrSection": "activity-owned source provenance; executable entries are retained separately in the coverage manifest"
      },
      {
        "path": "apps/Masters-of-A-Level-Chemistry/src/activities/c3l6-organic-reactions/activity.js",
        "sha256": "98469a93941c5e2559d4022a254a7c5b6b66c32764b24e63e737b72ff029e870",
        "symbolOrSection": "activity-owned source provenance; executable entries are retained separately in the coverage manifest"
      },
      {
        "path": "apps/Masters-of-A-Level-Chemistry/src/activities/c3l6-organic-reactions/assessment.js",
        "sha256": "08279db1bf684e6d2a71514423c433c7a028ef184da928e8785e4e68e6bcbfb5",
        "symbolOrSection": "activity-owned source provenance; executable entries are retained separately in the coverage manifest"
      },
      {
        "path": "apps/Masters-of-A-Level-Chemistry/src/activities/c3l6-organic-reactions/assets/digitised/a/a-01-p1.svg",
        "sha256": "2973dc979e08e3fd01e4d474eeb37b992121b4eabd9d9050c21326b4412dbe69",
        "symbolOrSection": "activity-owned source provenance; executable entries are retained separately in the coverage manifest"
      },
      {
        "path": "apps/Masters-of-A-Level-Chemistry/src/activities/c3l6-organic-reactions/assets/digitised/a/a-01-r1.svg",
        "sha256": "eb47c012aa8fd3d41a41b161f8c617af2e5a0457a907c0d753ad3ea7ca85918a",
        "symbolOrSection": "activity-owned source provenance; executable entries are retained separately in the coverage manifest"
      },
      {
        "path": "apps/Masters-of-A-Level-Chemistry/src/activities/c3l6-organic-reactions/assets/digitised/a/a-02-p1.svg",
        "sha256": "2dddb54225856c9cb7a1adb14baafb2dce82eb02d821a61888fefd80d5107a57",
        "symbolOrSection": "activity-owned source provenance; executable entries are retained separately in the coverage manifest"
      },
      {
        "path": "apps/Masters-of-A-Level-Chemistry/src/activities/c3l6-organic-reactions/assets/digitised/a/a-02-r1.svg",
        "sha256": "75e7336e7853579c449b346ea7a444e2dc557527b1b7e4a51108a57eceef8bd9",
        "symbolOrSection": "activity-owned source provenance; executable entries are retained separately in the coverage manifest"
      },
      {
        "path": "apps/Masters-of-A-Level-Chemistry/src/activities/c3l6-organic-reactions/assets/digitised/a/a-03-p1.svg",
        "sha256": "8c036367704e0140e6a7f9bb9e5799f3acaf5d165599c855d313cbbe8b0c7c4b",
        "symbolOrSection": "activity-owned source provenance; executable entries are retained separately in the coverage manifest"
      },
      {
        "path": "apps/Masters-of-A-Level-Chemistry/src/activities/c3l6-organic-reactions/assets/digitised/a/a-03-r1.svg",
        "sha256": "bb71f9ecf8ceaa6a7a8fa1c8cb22dde69696ee1acc259e701e490777f5afa4b8",
        "symbolOrSection": "activity-owned source provenance; executable entries are retained separately in the coverage manifest"
      },
      {
        "path": "apps/Masters-of-A-Level-Chemistry/src/activities/c3l6-organic-reactions/assets/digitised/a/a-04-p1.svg",
        "sha256": "beeecf64fc15706dcbcbbac58d9b2a798eb1256eba142266297ab9fa0e572dd0",
        "symbolOrSection": "activity-owned source provenance; executable entries are retained separately in the coverage manifest"
      },
      {
        "path": "apps/Masters-of-A-Level-Chemistry/src/activities/c3l6-organic-reactions/assets/digitised/a/a-04-p2.svg",
        "sha256": "7dc4f3a99de36bebf640874e4ff9c9d50525eae705be2280dfb64fee0a89630d",
        "symbolOrSection": "activity-owned source provenance; executable entries are retained separately in the coverage manifest"
      },
      {
        "path": "apps/Masters-of-A-Level-Chemistry/src/activities/c3l6-organic-reactions/assets/digitised/a/a-04-r1.svg",
        "sha256": "0f22cfcd448379a0c0d4305013ebe7c7f54a85f9821646fc912e9bbe56875590",
        "symbolOrSection": "activity-owned source provenance; executable entries are retained separately in the coverage manifest"
      },
      {
        "path": "apps/Masters-of-A-Level-Chemistry/src/activities/c3l6-organic-reactions/assets/digitised/a/a-05-p1.svg",
        "sha256": "b1d4b51daef30ee86e91095b609c2045186cc3def046392670efbdfea4be490e",
        "symbolOrSection": "activity-owned source provenance; executable entries are retained separately in the coverage manifest"
      },
      {
        "path": "apps/Masters-of-A-Level-Chemistry/src/activities/c3l6-organic-reactions/assets/digitised/a/a-05-r1.svg",
        "sha256": "a1cf0211e6f7444a64c3c7a74ea38e40d8052af7e1e543b146aec7a2ecf590f0",
        "symbolOrSection": "activity-owned source provenance; executable entries are retained separately in the coverage manifest"
      },
      {
        "path": "apps/Masters-of-A-Level-Chemistry/src/activities/c3l6-organic-reactions/assets/digitised/a/a-06-p1.svg",
        "sha256": "97a391384ca057b12dc453a4776bbc67af955dc5004d16c289de2af3746f505a",
        "symbolOrSection": "activity-owned source provenance; executable entries are retained separately in the coverage manifest"
      },
      {
        "path": "apps/Masters-of-A-Level-Chemistry/src/activities/c3l6-organic-reactions/assets/digitised/a/a-06-r1.svg",
        "sha256": "1e666a2f077344091ac4a1f9c5014d72b5ea27e2c208ef2ccf6152bc0cc2fbfd",
        "symbolOrSection": "activity-owned source provenance; executable entries are retained separately in the coverage manifest"
      },
      {
        "path": "apps/Masters-of-A-Level-Chemistry/src/activities/c3l6-organic-reactions/assets/digitised/a/a-07-p1.svg",
        "sha256": "d78adf59177bf2b343a092572d1b0da04308f9326df09d2ceda69c5df141cead",
        "symbolOrSection": "activity-owned source provenance; executable entries are retained separately in the coverage manifest"
      },
      {
        "path": "apps/Masters-of-A-Level-Chemistry/src/activities/c3l6-organic-reactions/assets/digitised/a/a-07-r1.svg",
        "sha256": "e763ebe4568e8bb9d3ddeb6787d05a39d30106fca735ddbb1fa9c42bde487795",
        "symbolOrSection": "activity-owned source provenance; executable entries are retained separately in the coverage manifest"
      },
      {
        "path": "apps/Masters-of-A-Level-Chemistry/src/activities/c3l6-organic-reactions/assets/digitised/a/a-08-p1.svg",
        "sha256": "7bb3800bfd386d206677d73445ba780c6252d6abe03e98773b3ee029efe08035",
        "symbolOrSection": "activity-owned source provenance; executable entries are retained separately in the coverage manifest"
      },
      {
        "path": "apps/Masters-of-A-Level-Chemistry/src/activities/c3l6-organic-reactions/assets/digitised/a/a-08-p2.svg",
        "sha256": "500e21e4185e01295ddf51022bafe567b2a53d846c45da20df13adb97124c44c",
        "symbolOrSection": "activity-owned source provenance; executable entries are retained separately in the coverage manifest"
      },
      {
        "path": "apps/Masters-of-A-Level-Chemistry/src/activities/c3l6-organic-reactions/assets/digitised/a/a-08-r1.svg",
        "sha256": "fbae9f60480f584be8822b6610401698ac21d019328bfded28ad95568f24209f",
        "symbolOrSection": "activity-owned source provenance; executable entries are retained separately in the coverage manifest"
      },
      {
        "path": "apps/Masters-of-A-Level-Chemistry/src/activities/c3l6-organic-reactions/assets/digitised/a/a-09-p1.svg",
        "sha256": "02de8edb5018c1b2b12a57745b75d12f3707d20a093a896dd2716307b0320aa1",
        "symbolOrSection": "activity-owned source provenance; executable entries are retained separately in the coverage manifest"
      },
      {
        "path": "apps/Masters-of-A-Level-Chemistry/src/activities/c3l6-organic-reactions/assets/digitised/a/a-09-r1.svg",
        "sha256": "2f235a8fcac7a367778848d461e00ad9871502a3e55eb934c9b79cf0072c93f9",
        "symbolOrSection": "activity-owned source provenance; executable entries are retained separately in the coverage manifest"
      },
      {
        "path": "apps/Masters-of-A-Level-Chemistry/src/activities/c3l6-organic-reactions/assets/digitised/a/a-10-p1.svg",
        "sha256": "63eab07cfc467a786391911a26c9647f692971486f20e049532b56291c6ab084",
        "symbolOrSection": "activity-owned source provenance; executable entries are retained separately in the coverage manifest"
      },
      {
        "path": "apps/Masters-of-A-Level-Chemistry/src/activities/c3l6-organic-reactions/assets/digitised/a/a-10-r1.svg",
        "sha256": "d276b36c34a3f0eae4c36a575aef599234cd44f8771065a4a4ce4535387aaae6",
        "symbolOrSection": "activity-owned source provenance; executable entries are retained separately in the coverage manifest"
      },
      {
        "path": "apps/Masters-of-A-Level-Chemistry/src/activities/c3l6-organic-reactions/assets/digitised/b/alarm-pheromone-skeletal-notes.svg",
        "sha256": "fde2ea819a1367da0201e24ff450fb9fed663929ca2d6214953bb57dea97420b",
        "symbolOrSection": "activity-owned source provenance; executable entries are retained separately in the coverage manifest"
      },
      {
        "path": "apps/Masters-of-A-Level-Chemistry/src/activities/c3l6-organic-reactions/assets/digitised/b/allantoin-skeletal-notes.svg",
        "sha256": "0aeb7005781b274afe69950e9b19f86e5f08178358b683628a7fb82ac5a4c005",
        "symbolOrSection": "activity-owned source provenance; executable entries are retained separately in the coverage manifest"
      },
      {
        "path": "apps/Masters-of-A-Level-Chemistry/src/activities/c3l6-organic-reactions/assets/digitised/b/gyromitra-esculenta.png",
        "sha256": "9a0ce56c35290871b144616486b3657cc34d83b584778252c7ed3e5d1d566f11",
        "symbolOrSection": "activity-owned source provenance; executable entries are retained separately in the coverage manifest"
      },
      {
        "path": "apps/Masters-of-A-Level-Chemistry/src/activities/c3l6-organic-reactions/assets/digitised/b/gyromitrin-skeletal-notes.svg",
        "sha256": "bb82e202a8571b0e9b43933a08bad83204e4b9fc9de3afb498fbf1893137cf1b",
        "symbolOrSection": "activity-owned source provenance; executable entries are retained separately in the coverage manifest"
      },
      {
        "path": "apps/Masters-of-A-Level-Chemistry/src/activities/c3l6-organic-reactions/assets/digitised/b/honey-bee.png",
        "sha256": "becf034427521208861fd83f2579e9969d7fc0f3ecf77f0fe76ebb1819d768b7",
        "symbolOrSection": "activity-owned source provenance; executable entries are retained separately in the coverage manifest"
      },
      {
        "path": "apps/Masters-of-A-Level-Chemistry/src/activities/c3l6-organic-reactions/assets/digitised/b/olive-fly-pheromone-skeletal-notes.svg",
        "sha256": "f9c3ec21294f8d502df7ab0dae0599b72149dd15fe5cccd418f74865e7e502ac",
        "symbolOrSection": "activity-owned source provenance; executable entries are retained separately in the coverage manifest"
      },
      {
        "path": "apps/Masters-of-A-Level-Chemistry/src/activities/c3l6-organic-reactions/assets/digitised/c/network.svg",
        "sha256": "8c9c0e2259bd304ad805ec717e2184ab5c08d6b755ffe7d17129130b65d7d273",
        "symbolOrSection": "activity-owned source provenance; executable entries are retained separately in the coverage manifest"
      },
      {
        "path": "apps/Masters-of-A-Level-Chemistry/src/activities/c3l6-organic-reactions/assets/digitised/intro/example-01.svg",
        "sha256": "b7bb526a836627f7f68437ad78398e4ca2ab74cb2759cec811c7b5ec8b525394",
        "symbolOrSection": "activity-owned source provenance; executable entries are retained separately in the coverage manifest"
      },
      {
        "path": "apps/Masters-of-A-Level-Chemistry/src/activities/c3l6-organic-reactions/assets/digitised/intro/example-02.svg",
        "sha256": "534a9b442caf2fdd8d1e6e55041f484012439151399e91c21cba5fbb44010bc5",
        "symbolOrSection": "activity-owned source provenance; executable entries are retained separately in the coverage manifest"
      },
      {
        "path": "apps/Masters-of-A-Level-Chemistry/src/activities/c3l6-organic-reactions/assets/digitised/intro/example-03.svg",
        "sha256": "f3a5e323025fcf1e3a0e82bf16e4c9a8597883335a3dcb4c3fdc6d3ebecc550d",
        "symbolOrSection": "activity-owned source provenance; executable entries are retained separately in the coverage manifest"
      },
      {
        "path": "apps/Masters-of-A-Level-Chemistry/src/activities/c3l6-organic-reactions/assets/digitised/intro/example-04.svg",
        "sha256": "1ddca36d810d39fe689e895f5bf55b1832b57d9c8a91402967155ee627bffb1d",
        "symbolOrSection": "activity-owned source provenance; executable entries are retained separately in the coverage manifest"
      },
      {
        "path": "apps/Masters-of-A-Level-Chemistry/src/activities/c3l6-organic-reactions/assets/digitised/intro/example-05.svg",
        "sha256": "62fc1bb2e20c31484a3f2fb049f203174ee820d08fbde566e5cf6d43a8b25b56",
        "symbolOrSection": "activity-owned source provenance; executable entries are retained separately in the coverage manifest"
      },
      {
        "path": "apps/Masters-of-A-Level-Chemistry/src/activities/c3l6-organic-reactions/assets/digitised/intro/example-06.svg",
        "sha256": "2b465c7bcbab32513aa64f8b07a02b37e7f0f1e7f4671fd2f1a17722d7365e46",
        "symbolOrSection": "activity-owned source provenance; executable entries are retained separately in the coverage manifest"
      },
      {
        "path": "apps/Masters-of-A-Level-Chemistry/src/activities/c3l6-organic-reactions/assets/digitised/intro/example-07.svg",
        "sha256": "6d8d351812fdfe504674d18a85f20049b86e6333894a8b27b863606f068ac021",
        "symbolOrSection": "activity-owned source provenance; executable entries are retained separately in the coverage manifest"
      },
      {
        "path": "apps/Masters-of-A-Level-Chemistry/src/activities/c3l6-organic-reactions/assets/digitised/intro/example-08.svg",
        "sha256": "1f2b611435b76929c80474d8a89d6965b4f25d9f91e455f6cb3818d42bd454bb",
        "symbolOrSection": "activity-owned source provenance; executable entries are retained separately in the coverage manifest"
      },
      {
        "path": "apps/Masters-of-A-Level-Chemistry/src/activities/c3l6-organic-reactions/assets/digitised/intro/example-09.svg",
        "sha256": "ae7d0dd057bdf1540be951eb90fb81448dccb4866303a42059cc8598654f9e63",
        "symbolOrSection": "activity-owned source provenance; executable entries are retained separately in the coverage manifest"
      },
      {
        "path": "apps/Masters-of-A-Level-Chemistry/src/activities/c3l6-organic-reactions/assets/digitised/intro/example-10.svg",
        "sha256": "69e266cae96ebe7dfc2a68554f9337ffb9ba9430554724d95a7ce9aa18fc995b",
        "symbolOrSection": "activity-owned source provenance; executable entries are retained separately in the coverage manifest"
      },
      {
        "path": "apps/Masters-of-A-Level-Chemistry/src/activities/c3l6-organic-reactions/assets/digitised/intro/example-11.svg",
        "sha256": "74d09a0446564de42c77c1e767d95c9a20b5c2066303a7ea34332846fdc8c325",
        "symbolOrSection": "activity-owned source provenance; executable entries are retained separately in the coverage manifest"
      },
      {
        "path": "apps/Masters-of-A-Level-Chemistry/src/activities/c3l6-organic-reactions/assets/digitised/intro/example-12.svg",
        "sha256": "2f030d579bb744edcab6fe5c4c3f03ef6ac5635f8e9e33e714afe385906bc7df",
        "symbolOrSection": "activity-owned source provenance; executable entries are retained separately in the coverage manifest"
      },
      {
        "path": "apps/Masters-of-A-Level-Chemistry/src/activities/c3l6-organic-reactions/assets/digitised/intro/example-13.svg",
        "sha256": "22acbf4193f74aa9c779b3075ea44d00315137a452d786b2c75a2e0ca931800a",
        "symbolOrSection": "activity-owned source provenance; executable entries are retained separately in the coverage manifest"
      },
      {
        "path": "apps/Masters-of-A-Level-Chemistry/src/activities/c3l6-organic-reactions/assets/digitised/intro/example-14.svg",
        "sha256": "dd21e1be18b8d787fe03fa4abfeb5a03fd485152fdc49bb9cd0e98d922a1c9ab",
        "symbolOrSection": "activity-owned source provenance; executable entries are retained separately in the coverage manifest"
      },
      {
        "path": "apps/Masters-of-A-Level-Chemistry/src/activities/c3l6-organic-reactions/assets/digitised/intro/example-15.svg",
        "sha256": "2cc803b43746e6417eac34d9068c48149ef850064f27f12addba60204bdb37ee",
        "symbolOrSection": "activity-owned source provenance; executable entries are retained separately in the coverage manifest"
      },
      {
        "path": "apps/Masters-of-A-Level-Chemistry/src/activities/c3l6-organic-reactions/assets/question-image1.jpeg",
        "sha256": "bb89cbdea7519c3818d6f04cca85c4f6f9143a6f6e4e268bf742841d86776443",
        "symbolOrSection": "activity-owned source provenance; executable entries are retained separately in the coverage manifest"
      },
      {
        "path": "apps/Masters-of-A-Level-Chemistry/src/activities/c3l6-organic-reactions/assets/question-image2.jpeg",
        "sha256": "7efe2880b1874ff49cba94034ebff8d1199f4d169462504058eb0972cf77862a",
        "symbolOrSection": "activity-owned source provenance; executable entries are retained separately in the coverage manifest"
      },
      {
        "path": "apps/Masters-of-A-Level-Chemistry/src/activities/c3l6-organic-reactions/assets/question-image3.png",
        "sha256": "70fba5cfade80d892e2472fde5ba1a5f74917a559482cc3db9af88f717052ca7",
        "symbolOrSection": "activity-owned source provenance; executable entries are retained separately in the coverage manifest"
      },
      {
        "path": "apps/Masters-of-A-Level-Chemistry/src/activities/c3l6-organic-reactions/assets/question-image4.png",
        "sha256": "159abb59e9950edd92b9440e5c9b47793a14e9071ac9513ff5fed703ecdeb266",
        "symbolOrSection": "activity-owned source provenance; executable entries are retained separately in the coverage manifest"
      },
      {
        "path": "apps/Masters-of-A-Level-Chemistry/src/activities/c3l6-organic-reactions/assets/question-image5.png",
        "sha256": "7ee6ae53296248daa8d65b2d1c8498b2ceee4a6220c474665a76d0978a77102d",
        "symbolOrSection": "activity-owned source provenance; executable entries are retained separately in the coverage manifest"
      },
      {
        "path": "apps/Masters-of-A-Level-Chemistry/src/activities/c3l6-organic-reactions/assets/question-image6.png",
        "sha256": "41f4c414f211ccbac476466c980396de93830e2c3b994c23d71b89099d4126d2",
        "symbolOrSection": "activity-owned source provenance; executable entries are retained separately in the coverage manifest"
      },
      {
        "path": "apps/Masters-of-A-Level-Chemistry/src/activities/c3l6-organic-reactions/assets/question-image7.png",
        "sha256": "80d30daedff9c66a14c9be6473d7dceb3209182cde219a2b385da2e2f4bbfa54",
        "symbolOrSection": "activity-owned source provenance; executable entries are retained separately in the coverage manifest"
      },
      {
        "path": "apps/Masters-of-A-Level-Chemistry/src/activities/c3l6-organic-reactions/content.js",
        "sha256": "85fdff203c58aca7ed51e2773570bfc2bc7ffa0bb78a8ebae346c21a10b9b68c",
        "symbolOrSection": "activity-owned source provenance; executable entries are retained separately in the coverage manifest"
      },
      {
        "path": "apps/Masters-of-A-Level-Chemistry/src/activities/c3l6-organic-reactions/index.html",
        "sha256": "11f6a4a3df195216172fc34037a04d55b03961948bd66e0936dc9175b0773f4c",
        "symbolOrSection": "activity-owned source provenance; executable entries are retained separately in the coverage manifest"
      },
      {
        "path": "apps/Masters-of-A-Level-Chemistry/src/activities/c3l6-organic-reactions/panels/a.html",
        "sha256": "33f1f987fb9933e75cfa57e1614b582ee82214856f14e3f051b655ceda4bfca2",
        "symbolOrSection": "activity-owned source provenance; executable entries are retained separately in the coverage manifest"
      },
      {
        "path": "apps/Masters-of-A-Level-Chemistry/src/activities/c3l6-organic-reactions/panels/b.html",
        "sha256": "ff8e44d740f178a792511df92561645c5c4ec2c249cb058d7fb9702d53f572f7",
        "symbolOrSection": "activity-owned source provenance; executable entries are retained separately in the coverage manifest"
      },
      {
        "path": "apps/Masters-of-A-Level-Chemistry/src/activities/c3l6-organic-reactions/panels/c.html",
        "sha256": "34d56c4c2ba993ebb936633dc10a357d53edc8a2f5c2cf9f08b37057189b915c",
        "symbolOrSection": "activity-owned source provenance; executable entries are retained separately in the coverage manifest"
      },
      {
        "path": "apps/Masters-of-A-Level-Chemistry/src/activities/c3l6-organic-reactions/panels/intro.html",
        "sha256": "58b769b2224562fe50ef5ef61b745b28b4a2a348b21493c2e3084c446a6d017e",
        "symbolOrSection": "activity-owned source provenance; executable entries are retained separately in the coverage manifest"
      }
    ],
    "gems": []
  },
  {
    "id": "igcse/calorimetry",
    "course": "igcse",
    "strand": "curriculum",
    "title": "Calorimetry",
    "source": [
      {
        "path": "apps/Masters-of-IGCSE-Chemistry/src/activities/calorimetry/README.md",
        "sha256": "779ad33a51b24fe342faad52c150ce65f0df4189a3ea3d0da8d24ed704304ddd",
        "symbolOrSection": "activity-owned source provenance; executable entries are retained separately in the coverage manifest"
      },
      {
        "path": "apps/Masters-of-IGCSE-Chemistry/src/activities/calorimetry/app.js",
        "sha256": "64d821cb25611574fedc0eb6bd4d795c635dc7218587fad65059c85dab8a66d9",
        "symbolOrSection": "activity-owned source provenance; executable entries are retained separately in the coverage manifest"
      },
      {
        "path": "apps/Masters-of-IGCSE-Chemistry/src/activities/calorimetry/core.js",
        "sha256": "8c540133a5dc4ea8067ff43e4d0bce7a6db79d032a44a296db00c5bfac35a2ac",
        "symbolOrSection": "activity-owned source provenance; executable entries are retained separately in the coverage manifest"
      },
      {
        "path": "apps/Masters-of-IGCSE-Chemistry/src/activities/calorimetry/data.js",
        "sha256": "f126e61de614b79ffed993361fa9f65f1e47c69d056eec2b6377719e884c6d8b",
        "symbolOrSection": "activity-owned source provenance; executable entries are retained separately in the coverage manifest"
      },
      {
        "path": "apps/Masters-of-IGCSE-Chemistry/src/activities/calorimetry/index.html",
        "sha256": "668bbe18f705d28576bb2847548ad5bf751e999949661c69dc82fc348775e846",
        "symbolOrSection": "activity-owned source provenance; executable entries are retained separately in the coverage manifest"
      },
      {
        "path": "apps/Masters-of-IGCSE-Chemistry/src/activities/calorimetry/mastery-core.js",
        "sha256": "d7dda6bf2e89420458ce40487156f30f7ea5c560a52e295c57edcc7c0060be30",
        "symbolOrSection": "activity-owned source provenance; executable entries are retained separately in the coverage manifest"
      },
      {
        "path": "apps/Masters-of-IGCSE-Chemistry/src/activities/calorimetry/mastery-ui.js",
        "sha256": "fe4c63d786e3fdd68cfc47efb226cbbe16302fa28e47b04ad25a058f20d299a8",
        "symbolOrSection": "activity-owned source provenance; executable entries are retained separately in the coverage manifest"
      },
      {
        "path": "apps/Masters-of-IGCSE-Chemistry/src/activities/calorimetry/styles.css",
        "sha256": "872c40b2debd168afde50ca62897197f8cfe8f9335161567b77fb6fe79b25d65",
        "symbolOrSection": "activity-owned source provenance; executable entries are retained separately in the coverage manifest"
      }
    ],
    "gems": [
      {
        "id": "lower-10-3",
        "topicId": "lower-10",
        "label": "Calorimetry",
        "supportedLevels": [
          1,
          2,
          3
        ],
        "mastery": {
          "gemId": "lower-10-3",
          "supportedLevels": [
            {
              "level": 1,
              "halfLife": 2,
              "label": "Grade 5–6"
            },
            {
              "level": 2,
              "halfLife": 2,
              "label": "Grade 7–8"
            },
            {
              "level": 3,
              "halfLife": 2,
              "label": "Grade 9"
            }
          ],
          "threshold": 0.8,
          "comparison": "strictly-greater",
          "historicalAliases": [],
          "legacySourceKeys": [
            "masters-igcse-results-v2"
          ]
        }
      }
    ]
  },
  {
    "id": "igcse/bond-enthalpy",
    "course": "igcse",
    "strand": "curriculum",
    "title": "Bond enthalpy",
    "source": [
      {
        "path": "apps/Masters-of-IGCSE-Chemistry/src/activities/bond-enthalpy/README.md",
        "sha256": "96ddd36e321d839760695a2c1279bf9e125d99efa7654701817e0eef6b1b2989",
        "symbolOrSection": "activity-owned source provenance; executable entries are retained separately in the coverage manifest"
      },
      {
        "path": "apps/Masters-of-IGCSE-Chemistry/src/activities/bond-enthalpy/app.js",
        "sha256": "fe10d45900dbf67fa27249bfd2f872d10b60ff4694aaba35cbaffc49063832d8",
        "symbolOrSection": "activity-owned source provenance; executable entries are retained separately in the coverage manifest"
      },
      {
        "path": "apps/Masters-of-IGCSE-Chemistry/src/activities/bond-enthalpy/core.js",
        "sha256": "79c80489dd0c04553d455e5a87d8cb8f6b0401d44347c85d0269f08476741334",
        "symbolOrSection": "activity-owned source provenance; executable entries are retained separately in the coverage manifest"
      },
      {
        "path": "apps/Masters-of-IGCSE-Chemistry/src/activities/bond-enthalpy/data.js",
        "sha256": "7d12bd91a5565e6bb42ef9c3b297e4b64e76889c6a86315ea686051202b49c59",
        "symbolOrSection": "activity-owned source provenance; executable entries are retained separately in the coverage manifest"
      },
      {
        "path": "apps/Masters-of-IGCSE-Chemistry/src/activities/bond-enthalpy/index.html",
        "sha256": "0a919307b298fc67f3f0929568c9b4b48081c586f09d97bd30b63defb1cfe40c",
        "symbolOrSection": "activity-owned source provenance; executable entries are retained separately in the coverage manifest"
      },
      {
        "path": "apps/Masters-of-IGCSE-Chemistry/src/activities/bond-enthalpy/mastery-core.js",
        "sha256": "13a92ab67b4a2964e479b1310887959c2338c264b29d39faf5767bd5b789640b",
        "symbolOrSection": "activity-owned source provenance; executable entries are retained separately in the coverage manifest"
      },
      {
        "path": "apps/Masters-of-IGCSE-Chemistry/src/activities/bond-enthalpy/styles.css",
        "sha256": "2f7a2575313ca5d9364ab835e6fb931e6c5dfb44b891b5fd9ff8e492361eec7b",
        "symbolOrSection": "activity-owned source provenance; executable entries are retained separately in the coverage manifest"
      }
    ],
    "gems": [
      {
        "id": "lower-10-4",
        "topicId": "lower-10",
        "label": "Bond enthalpy",
        "supportedLevels": [
          1,
          2,
          3
        ],
        "mastery": {
          "gemId": "lower-10-4",
          "supportedLevels": [
            {
              "level": 1,
              "halfLife": 2,
              "label": "Grade 5–6"
            },
            {
              "level": 2,
              "halfLife": 2,
              "label": "Grade 7–8"
            },
            {
              "level": 3,
              "halfLife": 2,
              "label": "Grade 9"
            }
          ],
          "threshold": 0.8,
          "comparison": "strictly-greater",
          "historicalAliases": [],
          "legacySourceKeys": [
            "masters-igcse-results-v2"
          ]
        }
      }
    ]
  },
  {
    "id": "igcse/structure-and-bonding",
    "course": "igcse",
    "strand": "curriculum",
    "title": "Structure and bonding",
    "source": [
      {
        "path": "apps/Masters-of-IGCSE-Chemistry/src/activities/structure-and-bonding/app.js",
        "sha256": "a3c004b779ca72ac262c7742edb45a4f91b6845307718434807b10c95978eb97",
        "symbolOrSection": "activity-owned source provenance; executable entries are retained separately in the coverage manifest"
      },
      {
        "path": "apps/Masters-of-IGCSE-Chemistry/src/activities/structure-and-bonding/core.js",
        "sha256": "3d95f2cbf1f372f0c1d4c28ce7fa0ab7f1f15d63f8815b52d65fab50348c8c8c",
        "symbolOrSection": "activity-owned source provenance; executable entries are retained separately in the coverage manifest"
      },
      {
        "path": "apps/Masters-of-IGCSE-Chemistry/src/activities/structure-and-bonding/data.js",
        "sha256": "6f43c088ee0e1c2fe20a580eff294a88b9db605c897212e2cc9a0f6d505a62cd",
        "symbolOrSection": "activity-owned source provenance; executable entries are retained separately in the coverage manifest"
      },
      {
        "path": "apps/Masters-of-IGCSE-Chemistry/src/activities/structure-and-bonding/index.html",
        "sha256": "453aff10e4a239047e696cbebb0f828eb2c56f597c00b49ea20fff713bef8005",
        "symbolOrSection": "activity-owned source provenance; executable entries are retained separately in the coverage manifest"
      },
      {
        "path": "apps/Masters-of-IGCSE-Chemistry/src/activities/structure-and-bonding/styles.css",
        "sha256": "12d6d3226b97e824cad02379e712a66261576982d904416befacfb5222e70556",
        "symbolOrSection": "activity-owned source provenance; executable entries are retained separately in the coverage manifest"
      }
    ],
    "gems": [
      {
        "id": "lower-6-5",
        "topicId": "lower-6",
        "label": "Structure and bonding",
        "supportedLevels": [
          2,
          3
        ],
        "mastery": {
          "gemId": "lower-6-5",
          "supportedLevels": [
            {
              "level": 2,
              "halfLife": 6,
              "label": "Grade 7–8"
            },
            {
              "level": 3,
              "halfLife": 6,
              "label": "Grade 9"
            }
          ],
          "threshold": 0.8,
          "comparison": "strictly-greater",
          "historicalAliases": [],
          "legacySourceKeys": [
            "masters-igcse-results-v2"
          ]
        }
      }
    ]
  },
  {
    "id": "igcse/dot-and-cross",
    "course": "igcse",
    "strand": "curriculum",
    "title": "Dot-and-cross diagrams",
    "source": [
      {
        "path": "apps/Masters-of-IGCSE-Chemistry/src/activities/dot-and-cross/app.js",
        "sha256": "981b7cc2516b7a7407133e6483f8e12004eaef2015ccdebc8c4d063dd3f5c36e",
        "symbolOrSection": "activity-owned source provenance; executable entries are retained separately in the coverage manifest"
      },
      {
        "path": "apps/Masters-of-IGCSE-Chemistry/src/activities/dot-and-cross/core.js",
        "sha256": "c7e9180e95c4c19ee3ee24aa28c21c1bb7b193487a41e0d910334339deadcb25",
        "symbolOrSection": "activity-owned source provenance; executable entries are retained separately in the coverage manifest"
      },
      {
        "path": "apps/Masters-of-IGCSE-Chemistry/src/activities/dot-and-cross/data.js",
        "sha256": "aef37042527937c3664fecd1bea6d322ac2bb8a543ba027e30c7eaa7c6c20944",
        "symbolOrSection": "activity-owned source provenance; executable entries are retained separately in the coverage manifest"
      },
      {
        "path": "apps/Masters-of-IGCSE-Chemistry/src/activities/dot-and-cross/index.html",
        "sha256": "5f92c4a81914699e6daeb88f0b1a3c20189460f50c81d39e59e246b28ab6c90f",
        "symbolOrSection": "activity-owned source provenance; executable entries are retained separately in the coverage manifest"
      },
      {
        "path": "apps/Masters-of-IGCSE-Chemistry/src/activities/dot-and-cross/renderer.js",
        "sha256": "3d7e1760e05edcecab17eaa4c84e7f4841bf28e29dd5d30d94403415b777e982",
        "symbolOrSection": "activity-owned source provenance; executable entries are retained separately in the coverage manifest"
      },
      {
        "path": "apps/Masters-of-IGCSE-Chemistry/src/activities/dot-and-cross/styles.css",
        "sha256": "92330bf071a9b8658d9c735d5fecd5d22b0bb0f95a647f64b183556c2e3379ea",
        "symbolOrSection": "activity-owned source provenance; executable entries are retained separately in the coverage manifest"
      }
    ],
    "gems": [
      {
        "id": "fourth-3-1",
        "topicId": "fourth-3",
        "label": "Ionic bonding",
        "supportedLevels": [
          1,
          2
        ],
        "mastery": {
          "gemId": "fourth-3-1",
          "supportedLevels": [
            {
              "level": 1,
              "halfLife": 2,
              "label": "Grade 5–6"
            },
            {
              "level": 2,
              "halfLife": 2,
              "label": "Grade 7–8"
            }
          ],
          "threshold": 0.8,
          "comparison": "strictly-greater",
          "historicalAliases": [],
          "legacySourceKeys": [
            "masters-igcse-results-v2"
          ]
        }
      },
      {
        "id": "fourth-3-2",
        "topicId": "fourth-3",
        "label": "Covalent bonding",
        "supportedLevels": [
          1,
          2,
          3
        ],
        "mastery": {
          "gemId": "fourth-3-2",
          "supportedLevels": [
            {
              "level": 1,
              "halfLife": 2,
              "label": "Grade 5–6"
            },
            {
              "level": 2,
              "halfLife": 2,
              "label": "Grade 7–8"
            },
            {
              "level": 3,
              "halfLife": 2,
              "label": "Grade 9"
            }
          ],
          "threshold": 0.8,
          "comparison": "strictly-greater",
          "historicalAliases": [],
          "legacySourceKeys": [
            "masters-igcse-results-v2"
          ]
        }
      }
    ]
  },
  {
    "id": "igcse/energy-enthalpy",
    "course": "igcse",
    "strand": "curriculum",
    "title": "Energy and enthalpy",
    "source": [
      {
        "path": "apps/Masters-of-IGCSE-Chemistry/src/activities/energy-enthalpy/README.md",
        "sha256": "2a3be11c681fd5982360a906b5928c098c8c5dc1926e56cb60a85cf732b9463f",
        "symbolOrSection": "activity-owned source provenance; executable entries are retained separately in the coverage manifest"
      },
      {
        "path": "apps/Masters-of-IGCSE-Chemistry/src/activities/energy-enthalpy/app.js",
        "sha256": "e8bf5a1b0a5117a3be871e7707030c04fe5bffcd6456d053e9b559ef6b779174",
        "symbolOrSection": "activity-owned source provenance; executable entries are retained separately in the coverage manifest"
      },
      {
        "path": "apps/Masters-of-IGCSE-Chemistry/src/activities/energy-enthalpy/core.js",
        "sha256": "68d1b881797c08ea96fd4bafe567bad96c0f6d3ef8fc9ac14f0bce37bcde1d75",
        "symbolOrSection": "activity-owned source provenance; executable entries are retained separately in the coverage manifest"
      },
      {
        "path": "apps/Masters-of-IGCSE-Chemistry/src/activities/energy-enthalpy/data.js",
        "sha256": "47ed6cff73bc965276ce87fcc2c27dd05140be8b7b8bb5885f9ca4b3c54c57b0",
        "symbolOrSection": "activity-owned source provenance; executable entries are retained separately in the coverage manifest"
      },
      {
        "path": "apps/Masters-of-IGCSE-Chemistry/src/activities/energy-enthalpy/editor.js",
        "sha256": "d1c1b05c83e86b7458aa2aa86bfbcf27a5c25d977046cc49c4a89c1969046843",
        "symbolOrSection": "activity-owned source provenance; executable entries are retained separately in the coverage manifest"
      },
      {
        "path": "apps/Masters-of-IGCSE-Chemistry/src/activities/energy-enthalpy/index.html",
        "sha256": "a665ce28efb53710cedf69abf6d6cf74beedb7567af6fb6428d257e11ec4c82e",
        "symbolOrSection": "activity-owned source provenance; executable entries are retained separately in the coverage manifest"
      },
      {
        "path": "apps/Masters-of-IGCSE-Chemistry/src/activities/energy-enthalpy/styles.css",
        "sha256": "862ee6fba69dff1e485f264c17068ed7eb93feb51d19ccb02552dc9ea9139733",
        "symbolOrSection": "activity-owned source provenance; executable entries are retained separately in the coverage manifest"
      }
    ],
    "gems": [
      {
        "id": "lower-10-1",
        "topicId": "lower-10",
        "label": "Energy and enthalpy",
        "supportedLevels": [
          1,
          2
        ],
        "mastery": {
          "gemId": "lower-10-1",
          "supportedLevels": [
            {
              "level": 1,
              "halfLife": 3,
              "label": "Grade 5–6"
            },
            {
              "level": 2,
              "halfLife": 3,
              "label": "Grade 7–8"
            }
          ],
          "threshold": 0.8,
          "comparison": "strictly-greater",
          "historicalAliases": [],
          "legacySourceKeys": [
            "masters-igcse-results-v2"
          ]
        }
      }
    ]
  },
  {
    "id": "igcse/energetics-practical",
    "course": "igcse",
    "strand": "curriculum",
    "title": "Energetics practical",
    "source": [
      {
        "path": "apps/Masters-of-IGCSE-Chemistry/src/activities/energetics-practical/app.js",
        "sha256": "cc1979aab40437fed57b5445d795797a6ebde2faa8ecace1d8785346f0618b69",
        "symbolOrSection": "activity-owned source provenance; executable entries are retained separately in the coverage manifest"
      },
      {
        "path": "apps/Masters-of-IGCSE-Chemistry/src/activities/energetics-practical/core.js",
        "sha256": "6a20c497a1ca5ae8a39ed0ca304e138cb74cd10911a16730d0626ea18b87d7f2",
        "symbolOrSection": "activity-owned source provenance; executable entries are retained separately in the coverage manifest"
      },
      {
        "path": "apps/Masters-of-IGCSE-Chemistry/src/activities/energetics-practical/data.js",
        "sha256": "aae68163593ee677d1d5fb543b720e9bd8aa29f322940659390a97ac5afec4f2",
        "symbolOrSection": "activity-owned source provenance; executable entries are retained separately in the coverage manifest"
      },
      {
        "path": "apps/Masters-of-IGCSE-Chemistry/src/activities/energetics-practical/diagrams.js",
        "sha256": "04bee2195232535e216a1f564cf08d9d2abd068dd857cde93ac6111a39dea798",
        "symbolOrSection": "activity-owned source provenance; executable entries are retained separately in the coverage manifest"
      },
      {
        "path": "apps/Masters-of-IGCSE-Chemistry/src/activities/energetics-practical/index.html",
        "sha256": "0dbaea28d0d864a3483be2028c712284b870ac9f78b3d7e719c11de434ffc3a0",
        "symbolOrSection": "activity-owned source provenance; executable entries are retained separately in the coverage manifest"
      },
      {
        "path": "apps/Masters-of-IGCSE-Chemistry/src/activities/energetics-practical/styles.css",
        "sha256": "f34688665e23428772c538e6565889ad2628ded2b2763dd62998666018d32d34",
        "symbolOrSection": "activity-owned source provenance; executable entries are retained separately in the coverage manifest"
      }
    ],
    "gems": [
      {
        "id": "lower-10-2",
        "topicId": "lower-10",
        "label": "Energetics practical",
        "supportedLevels": [
          2,
          3
        ],
        "mastery": {
          "gemId": "lower-10-2",
          "supportedLevels": [
            {
              "level": 2,
              "halfLife": 3,
              "label": "Grade 7–8"
            },
            {
              "level": 3,
              "halfLife": 3,
              "label": "Grade 9"
            }
          ],
          "threshold": 0.8,
          "comparison": "strictly-greater",
          "historicalAliases": [],
          "legacySourceKeys": [
            "masters-igcse-results-v2"
          ]
        }
      }
    ]
  },
  {
    "id": "alevel/explaining-properties",
    "course": "alevel",
    "strand": "curriculum",
    "title": "Explaining Properties",
    "source": [
      {
        "path": "apps/Masters-of-Chemistry/src/activities/alevel/explaining-properties/bank.ts",
        "sha256": "13d621c8cff346226215a01345ef1253671f3092cbd853a9e1a46e0e76d31b88",
        "symbolOrSection": "32 approved specification-authored/adapted questions; see activity README and retained source review."
      }
    ],
    "gems": [
      {
        "id": "l6-t2-1-properties",
        "topicId": "l6-t2-1",
        "label": "Explaining Properties",
        "supportedLevels": [
          1,
          2
        ],
        "mastery": {
          "gemId": "l6-t2-1-properties",
          "supportedLevels": [
            {
              "level": 1,
              "halfLife": 3,
              "label": "Level 1"
            },
            {
              "level": 2,
              "halfLife": 3,
              "label": "Level 2"
            }
          ],
          "threshold": 0.8,
          "comparison": "strictly-greater",
          "historicalAliases": [],
          "legacySourceKeys": [],
          "activeProgressionVersion": 1
        }
      }
    ]
  }
,
  olympiad2011Definition
] as const satisfies readonly ActivityDefinition[];
