// Shared definitions keep the journal, forms and charts aligned.
export const metricDefinitions = {
  weight: { label: 'Poids', unit: 'kg' },
  waist: { label: 'Tour de taille', unit: 'cm' },
  fat: { label: 'Masse grasse', unit: '%' },
  muscle: { label: 'Masse musculaire', unit: 'kg' },
  chest: { label: 'Tour de poitrine', unit: 'cm' },
  hips: { label: 'Tour de hanches', unit: 'cm' },
  arm: { label: 'Tour de bras', unit: 'cm' },
  thigh: { label: 'Tour de cuisse', unit: 'cm' },
  calf: { label: 'Tour de mollet', unit: 'cm' },
} as const;
export type Metric = keyof typeof metricDefinitions;
export const bodyMetrics = ['chest', 'hips', 'arm', 'thigh', 'calf'] as const;
export const primaryMetrics = ['weight', 'waist', 'fat', 'muscle'] as const;
