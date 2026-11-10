import type { FortniteEntity, RarityTier } from '../domain/types';

const totals=new WeakMap<FortniteEntity[],number>();
export function estimatedFrequency(answer: FortniteEntity, validAnswers: FortniteEntity[]): number {
  // Large catalogs need more separation than a uniform prior; rarity remains unrelated.
  const weight=(e:FortniteEntity)=>validAnswers.length>200?Math.pow(e.familiarity,4):Math.max(.05,e.familiarity);
  const total = totals.get(validAnswers)??validAnswers.reduce((sum, entity) => sum + weight(entity), 0);
  totals.set(validAnswers,total);
  return Math.max(validAnswers.length>200?.00001:.005, weight(answer) / total);
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
