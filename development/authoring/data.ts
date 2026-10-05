/** Independently authored DEV proof, not migrated or released student content. */
export const dilutionData = {
  version: 1,
  fixed: {concentration: 0.02, initialVolume: 25, finalVolume: 250},
  concentrations: [0.01, 0.02, 0.04, 0.05],
  initialVolumes: [10, 20, 25],
  dilutionFactors: [2, 5, 10],
  assumptions: 'Aqueous hydrochloric acid is fully dissociated; volumes are additive and water autoionisation is negligible at these concentrations. Use concentration in mol dm⁻³. The logarithm uses the numerical concentration relative to 1 mol dm⁻³.',
} as const;
