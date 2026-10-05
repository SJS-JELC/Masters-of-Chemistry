$ErrorActionPreference = 'Stop'
# Read only file metadata before any non-src input is opened. Never hydrate placeholders.
$inventoryRequiredInputs = @(
  'resources/curriculum/ocr-a-level/a-level-specification-map.md',
  'development/tests/fixtures/acid-legacy-reviews.json',
  'development/alevel/data/ph-titration-curves.json',
  'development/alevel/validation/ph-titration-curves/answer-key.json',
  'development/igcse/plans/igcse-energy-enthalpy-automarked-question-bank.md',
  'development/alevel/data/flashcards/l6-electrons-bonding-key-learning.csv'
)
foreach ($inventoryInput in $inventoryRequiredInputs) {
  $inventoryFile = Get-Item -LiteralPath $inventoryInput
  $inventoryFlags = [int]$inventoryFile.Attributes
  if (($inventoryFlags -band 4096) -ne 0 -or ($inventoryFlags -band 4194304) -ne 0) {
    throw "Source input is offline; refusing hydration: $inventoryInput"
  }
}
Write-Output 'PASS: six non-src inputs are local; no placeholder hydration.'
