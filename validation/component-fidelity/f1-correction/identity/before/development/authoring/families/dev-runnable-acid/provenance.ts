import type {SourceReference} from "../../../../src/contracts/index.ts";
export const authoringSources=[
  {
    "path": "apps/Masters-of-Chemistry/development/authoring/families/dev-runnable-acid/data.ts",
    "sha256": "a662641e71f67f289ff3c76accd541ade716a8194e38f26c0c6f63caa0c5de32",
    "symbolOrSection": "CLI-generated reviewed HCl dilution teaching data; independently versioned DEV IDs"
  },
  {
    "path": "resources/curriculum/ocr-a-level/a-level-specification-map.md",
    "sha256": "c5d6ad6eaab14b2eae37d3b4f8d5dc89985ef6ca8e99c05452074221f1c83784",
    "symbolOrSection": "Department OCR3.1 May2026 map,Acids Bases pH section5.1.3; reviewed2026-09-10"
  },
  {
    "path": "resources/a-level-past-paper-atlas/run2/specification-evidence/sections.json",
    "sha256": "b6c12f95c801adfb8725395c267ac12ba640ca16d925aa82ea9a37582804183a",
    "symbolOrSection": "Retained official OCR2016 archive extraction,5.1.3(d) and(f)(i); not a current full-PDF audit"
  }
] as const satisfies readonly SourceReference[];
