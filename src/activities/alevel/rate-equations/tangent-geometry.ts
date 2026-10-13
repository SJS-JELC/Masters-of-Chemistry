export const graphPlot = { width: 820, height: 420, left: 98, right: 28, top: 24, bottom: 76 };

/** Same tangent triangle for the interactive plot and worked calculations. */
export function tangentGeometry(xMin: number, xMax: number, yMin: number, yMax: number,
  markerX: number, markerY: number, slope: number, concentration: boolean) {
  const width = graphPlot.width - graphPlot.left - graphPlot.right;
  const height = graphPlot.height - graphPlot.top - graphPlot.bottom;
  const xInset = (xMax - xMin) * 22 / width;
  const yTopInset = (yMax - yMin) * (concentration ? 56 : 78) / height;
  const yBottomInset = (yMax - yMin) * 12 / height;
  const tangentMin = slope === 0 ? xMin + xInset : Math.max(xMin + xInset, markerX + (yMax - yTopInset - markerY) / slope);
  const tangentMax = slope === 0 ? xMax - xInset : Math.min(xMax - xInset, markerX + (yMin + yBottomInset - markerY) / slope);
  const triangleMax = Math.min(tangentMax, xMax - (xMax - xMin) * (concentration ? 250 : 315) / width);
  const triangleSpan = Math.max((xMax - xMin) * 1e-8, triangleMax - tangentMin);
  const firstX = tangentMin + 0.12 * triangleSpan;
  const secondX = tangentMin + 0.88 * triangleSpan;
  const firstY = markerY + slope * (firstX - markerX);
  const secondY = markerY + slope * (secondX - markerX);
  return { tangentMin, tangentMax, firstX, secondX, firstY, secondY, dx: secondX - firstX, dy: secondY - firstY };
}
