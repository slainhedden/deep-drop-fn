import type { SeasonId } from '../domain/types';

export interface SeasonRecord { id: SeasonId; chapter: number; label: string; kind: 'regular' | 'throwback' | 'special' }
const regular = (chapter: number, count: number): SeasonRecord[] => Array.from({ length: count }, (_, i) => ({
  id: `C${chapter}S${chapter === 1 && i === 9 ? 'X' : i + 1}`,
  chapter, label: `Chapter ${chapter} Season ${chapter === 1 && i === 9 ? 'X' : i + 1}`, kind: 'regular',
}));
// An explicit chronology: OG and Remix belong between the numbered chapters.
// This is a versioned historical scope, not a claim to cover current live seasons.
export const seasons: readonly SeasonRecord[] = [
  ...regular(1, 10), ...regular(2, 8), ...regular(3, 4), ...regular(4, 4),
  { id: 'OG2023', chapter: 4, label: 'Fortnite OG (2023)', kind: 'throwback' },
  ...regular(5, 4),
  { id: 'REMIX2024', chapter: 5, label: 'Chapter 2 Remix (2024)', kind: 'throwback' },
  ...regular(6, 2),
  {id:'C6GALACTIC2025',chapter:6,label:'Chapter 6: Galactic Battle (2025)',kind:'special'},
  ...regular(6, 4).slice(2),
  {id:'C6SIMPSONS2025',chapter:6,label:'Chapter 6: The Simpsons (2025)',kind:'special'},
  ...regular(7, 4),
  {id:'C7TREASURE2026',chapter:7,label:'Chapter 7: Treasure Hunters (2026)',kind:'special'},
];
const positions = new Map(seasons.map((season, index) => [season.id, index]));
export const seasonById = new Map(seasons.map(season => [season.id, season]));
export function seasonIndex(id: SeasonId): number {
  const position = positions.get(id);
  if (position === undefined) throw new Error(`Unknown season: ${id}`);
  return position;
}
export const compareSeasons = (left: SeasonId, right: SeasonId): number => seasonIndex(left) - seasonIndex(right);
export function seasonInRange(season: SeasonId, from: SeasonId, through: SeasonId): boolean {
  if (compareSeasons(from, through) > 0) throw new Error(`Reversed season range: ${from}–${through}`);
  return compareSeasons(season, from) >= 0 && compareSeasons(season, through) <= 0;
}
export const seasonLabel = (id: SeasonId): string => seasonById.get(id)?.label ?? id;
export const chapterSeasons = (chapter: number): string[] => seasons.filter(season => season.chapter === chapter).map(season => season.id);
