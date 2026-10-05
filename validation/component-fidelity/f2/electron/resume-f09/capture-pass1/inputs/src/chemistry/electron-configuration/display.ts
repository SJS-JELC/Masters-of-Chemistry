import { data } from './data.js';
import { boxes, energyOrder } from './core.js';
export const spinText = [
  'empty',
  'one electron, spin up',
  'one electron, spin down',
  'two electrons, opposite spins',
] as const;
export const spinArrow = ['', '↑', '↓', '↑↓'] as const;
export function notation(counts: readonly number[], core = '') {
  return `${core ? `[${core}] ` : ''}${counts
    .map((n, i) =>
      n ? `${data.subshells[i]}${String(n).replace(/\d/g, (d) => '⁰¹²³⁴⁵⁶⁷⁸⁹'[Number(d)]!)}` : '',
    )
    .filter(Boolean)
    .join(' ')}`;
}
export function speciesLabel(id: string) {
  const item = data.species.find((item) => item.id === id);
  if (!item) throw Error('Unknown species.');
  return `${item.symbol}${item.charge ? `${Math.abs(item.charge) === 1 ? '' : Math.abs(item.charge)}${item.charge > 0 ? '+' : '−'}` : ''}`;
}
/** Deterministic accessible SVG for checked worked answers; all eight subshells retained. */
export function diagramImage(counts: readonly number[], layout: 'row' | 'energy') {
  const spins = boxes(counts),
    indices = layout === 'energy' ? energyOrder() : data.subshells.map((_s, i) => i),
    width = layout === 'energy' ? 420 : 660,
    height = layout === 'energy' ? 460 : 95;
  let x = 12;
  const groups = indices
    .map((index, order) => {
      const label = data.subshells[index]!,
        column = 'spd'.indexOf(label[1]!);
      const gx = layout === 'energy' ? 65 + column * 115 : x,
        gy = layout === 'energy' ? 410 - order * 52 : 42;
      const result = `<g><text x="${gx}" y="${gy - (layout === 'energy' ? 6 : 12)}" font-size="${layout === 'energy' ? 14 : 16}">${label}</text>${spins[index]!.map((spin, j) => `<rect x="${gx + j * 22}" y="${gy}" width="22" height="29" fill="white" stroke="black"/><text x="${gx + j * 22 + 11}" y="${gy + 21}" text-anchor="middle" font-size="${spin === 3 ? 17 : 19}">${spinArrow[spin]}</text>`).join('')}</g>`;
      x += spins[index]!.length * 22 + 28;
      return result;
    })
    .join('');
  const axis =
    layout === 'energy'
      ? '<path d="M25 445V15l-5 10m5-10 5 10" fill="none" stroke="black"/><text transform="translate(15 350) rotate(-90)" font-size="14">Increasing energy (schematic)</text>'
      : '';
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" role="img"><title>${layout === 'energy' ? 'Schematic Aufbau energy ladder' : 'Horizontal orbital diagram'}</title><desc>${notation(counts)}. ${spins.map((row, i) => `${data.subshells[i]}: ${row.map((spin) => spinText[spin]).join(', ')}`).join('; ')}</desc><g font-family="sans-serif" fill="black">${axis}${groups}</g></svg>`)}`;
}
