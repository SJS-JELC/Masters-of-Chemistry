const superscript: Readonly<Record<string, string>> = {
  '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵',
  '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹', '-': '⁻', '+': '⁺', '−': '⁻',
};

/** Format explicit times-ten entry only; ordinary numbers and e notation stay intact. */
export function formatScientificNumber(value: string): string {
  return value.replace(
    /^([+-−]?(?:\d+(?:\.\d*)?|\.\d+))\s*[x×*]\s*10\s*\^?\s*([+−\-⁺⁻]?[0-9⁰¹²³⁴⁵⁶⁷⁸⁹]*)$/i,
    (_, coefficient: string, exponent: string) =>
      `${coefficient} × 10${[...exponent].map(char => superscript[char] ?? char).join('')}`,
  );
}
