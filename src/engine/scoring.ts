import type { FortniteEntity, RarityTier } from '../domain/types';

export function estimatedFrequency(answer: FortniteEntity, validAnswers: FortniteEntity[]): number {
  const total = validAnswers.reduce((sum, entity) => sum + Math.max(.05, entity.familiarity), 0);
  return Math.max(.005, answer.familiarity / total);
}

export function scoreFrequency(frequency: number): number {
  return Math.max(100, Math.min(1000, Math.round(1000 - 1800 * Math.sqrt(Math.max(0, frequency)))));
}

export function rarityTier(points: number): RarityTier {
  if (points >= 850) return 'Legendary';
  if (points >= 650) return 'Rare';
  if (points >= 450) return 'Uncommon';
  if (points >= 250) return 'Common';
  return 'Very Common';
}

export function smoothedObservedFrequency(observedCount: number, observedTotal: number, priorFrequency: number, priorStrength = 25): number {
  return (observedCount + priorFrequency * priorStrength) / (observedTotal + priorStrength);
}
