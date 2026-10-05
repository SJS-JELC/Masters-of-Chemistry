import { createLayout } from './layout.js';
import type { BankRecord } from './types.ts';
const escape = (text: string) =>
  text.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('"', '&quot;');
export interface ModelPresentation {
  readonly circles?: boolean;
}
/** Source renderer.draw(answer:true): actual dynamic fit, not the initial1000x650. */
export function modelViewBox(record: BankRecord): readonly [number, number, number, number] {
  const xs = record.reference.atoms.map((a) => a.x),
    ys = record.reference.atoms.map((a) => a.y);
  if (!xs.length) return [0, 0, 1000, 650];
  const minX = Math.min(...xs),
    maxX = Math.max(...xs),
    minY = Math.min(...ys),
    maxY = Math.max(...ys);
  const w = Math.max(360, maxX - minX + 220),
    h = Math.max(260, maxY - minY + 220);
  return [(minX + maxX - w) / 2, (minY + maxY - h) / 2, w, h];
}
/** Checked internally generated SVG; inline rendering uses the host's licensed Comfortaa font. */
export function modelSVG(record: BankRecord, options: ModelPresentation = {}): string {
  const state = record.reference,
    layout = createLayout(record.id),
    box = modelViewBox(record),
    circles = options.circles ?? true;
  const groups = state.groups
    .map((group) => {
      const b = layout.groupBounds(state, group.atomIds),
        atoms = state.atoms.filter((a) => group.atomIds.includes(a.id));
      if (!b || !atoms.length) return '';
      const local = !group.bracket && atoms.length === 1;
      // Original 18px local-charge rule is #canvas-only; checked answers use 22px.
      return `<g class="ion-group${local ? ' local-charge' : ''}">${group.bracket ? `<path class="bracket-path" d="M${b.x + 10} ${b.y}H${b.x}V${b.bottom}H${b.x + 10} M${b.right - 10} ${b.y}H${b.right}V${b.bottom}H${b.right - 10}" fill="none" stroke="#17213a" stroke-width="2"/>` : ''}<text class="charge-label" x="${local ? atoms[0]!.x + 20 : b.right + 6}" y="${local ? atoms[0]!.y - 15 : b.y + 8}" font-size="22">${layout.chargeText(group.charge)}</text></g>`;
    })
    .join('');
  const atoms = state.atoms
    .map(
      (a) =>
        `<g class="atom">${circles ? `<circle class="shell" cx="${a.x}" cy="${a.y}" r="${layout.shellRadius(a)}" fill="none" stroke="#9caec1" stroke-width="1.5"/>` : ''}<text class="atom-label element-${a.element}" x="${a.x}" y="${a.y + 9}" text-anchor="middle" font-size="25">${a.element}</text></g>`,
    )
    .join('');
  const electrons = state.electrons
    .map((e) => {
      const p = layout.point(state, e.anchor);
      if (!p) throw Error(`${record.id}: unrenderable ${e.id}`);
      return `<g class="electron">${e.symbol === 'dot' ? `<circle class="electron-mark" cx="${p.x}" cy="${p.y}" r="3"/>` : e.symbol === 'triangle' ? `<path class="electron-mark triangle-mark" d="M${p.x} ${p.y - 5}L${p.x + 5} ${p.y + 4}L${p.x - 5} ${p.y + 4}Z"/>` : `<path class="electron-mark" d="M${p.x - 4} ${p.y - 4}l8 8m-8 0l8 -8"/>`}</g>`;
    })
    .join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" class="dot-cross-answer-svg" viewBox="${box.join(' ')}" role="img" aria-label="${escape(record.name + ': ' + record.explanation)}"><title>${escape(record.name)}</title><desc>${escape(record.explanation)}</desc><style>.dot-cross-answer-svg text{font-family:Comfortaa,system-ui,sans-serif;font-weight:700;fill:#17213a}.dot-cross-answer-svg .electron-mark{stroke:#182336;stroke-width:2.5;fill:#182336}</style><rect x="${box[0]}" y="${box[1]}" width="${box[2]}" height="${box[3]}" fill="white"/>${groups}${atoms}${electrons}</svg>`;
}
export const modelImage = (record: BankRecord, options: ModelPresentation = {}) =>
  `data:image/svg+xml;charset=utf-8,${encodeURIComponent(modelSVG(record, options))}`;
