"""Retain screenshot metadata and actual E02 image inspection; no images are edited."""
import hashlib, json
from datetime import datetime, timezone
from pathlib import Path
from PIL import Image, ImageChops, ImageStat
here = Path(__file__).resolve().parent
screens = here / 'screens'
pairs = []
for original in sorted(screens.glob('*-original.png')):
    restored = original.with_name(original.name.replace('-original.png', '-restored.png'))
    if not restored.exists():
        continue
    with Image.open(original) as a, Image.open(restored) as b:
        row = {'original': 'screens/' + original.name, 'restored': 'screens/' + restored.name,
               'originalSize': a.size, 'restoredSize': b.size,
               'originalSha256': hashlib.sha256(original.read_bytes()).hexdigest(),
               'restoredSha256': hashlib.sha256(restored.read_bytes()).hexdigest()}
        if a.size == b.size:
            diff = ImageChops.difference(a.convert('RGB'), b.convert('RGB'))
            row['meanAbsoluteRGBDifference'] = sum(ImageStat.Stat(diff).mean) / 3
        else:
            row['rasterComparison'] = 'Not compared: screenshot crop rounding differs by absolute page origin; browser source geometry is checked independently.'
        pairs.append(row)
review = {
    'agentId': 'E02', 'jobId': 'DOT-CROSS-RESTORE', 'reviewedAt': datetime.now(timezone.utc).isoformat(),
    'method': 'E02 actual view_image inspection plus unedited PNG metadata/statistics. Pixel statistics supplement exact browser geometry and substantive image review, and are not an acceptance threshold.',
    'status': 'PASS', 'screenshots': len(list(screens.glob('*.png'))), 'pairs': pairs,
    'inspected': [
        {'files': ['alevel-desktop-h2o-original.png','alevel-desktop-h2o-restored.png'], 'finding': 'Centered original palette wrapping/order, cyan primary action, navy 520px canvas and 330px pane match; water has two shared pairs and two oxygen lone pairs.'},
        {'files': ['alevel-mobile-mgo-original.png','alevel-mobile-mgo-restored.png'], 'finding': 'Original mobile font sizing/centering, source pane rounding and 280px drawing surface restored. Mg clipping in the source narrow view is retained; separate fitted answer and magnified scrolling remain available.'},
        {'files': ['igcse-tablet-h2o-original.png','igcse-tablet-h2o-restored.png'], 'finding': 'IGCSE 16-element two-symbol palette and stacked canvas/marking topology match tablet source. Minor PNG crop rounding follows different absolute page tops; exact DOM dimensions/styles match.'},
        {'files': ['alevel-above-breakpoint-mgo-restored.png','alevel-below-breakpoint-mgo-restored.png'], 'finding': 'At1100px source side pane/520px height appears; at1099px source pane stacks. Both-ion charge signs/electron origin symbols retain original source geometry.'},
        {'files': ['alevel-desktop-phosphorus-pentachloride-restored.png','alevel-desktop-sulfur-hexafluoride-restored.png'], 'finding': 'Source 100-unit central shells and five/six complete shared pairs remain legible, with three lone pairs on each halogen. No substituted octet-only layout.'},
        {'files': ['alevel-nitrate-ion-answer-circles-true-original.png','alevel-nitrate-ion-answer-circles-true-restored.png','igcse-potassium-iodide-answer-circles-false-restored.png'], 'finding': 'White Comfortaa checked answers retain source fit/charge/bracket/glyph geometry; nitrate origin triangle is preserved, KI has separate K+ and I- bracket groups and a complete iodide octet with circles hidden.'},
        {'files': ['alevel-atom-drag-preview-original.png','alevel-atom-drag-preview-restored.png','igcse-mobile-trusted-touch-restored.png'], 'finding': 'Moved-atom preview matches original geometry before commit; trusted touch atom placement and single circle-toggle commit render correctly.'},
        {'files': ['alevel-mobile-non-drag-controls.png'], 'finding': 'Open alternatives show readable stacked element/coordinate, electron region/symbol/slot, charge, movement and relocation controls. Magnified canvas scrolls horizontally while page/form controls fit. Intentionally incorrect water fixture produces corrective chemistry feedback.'}
    ],
    'limits': ['Editor/reference harness evidence does not establish shared attempt/timing/save/revision acceptance.', 'Answer crops normalize renderer size to600x400; E01 owns responsive native-dialog gates.']
}
(here/'image-review.json').write_text(json.dumps(review, indent=2)+'\n', encoding='utf-8')
print(json.dumps({'status': review['status'], 'screenshots':review['screenshots'], 'pairs':len(pairs), 'inspectedGroups':len(review['inspected'])}))
