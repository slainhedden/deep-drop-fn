import type { FortniteEntity, HistoricalEvidence, Predicate } from '../domain/types';
import { compareSeasons, seasonById, seasonInRange, seasons } from '../data/seasons';

const usable = (fact: HistoricalEvidence | undefined, includePending: boolean): boolean => !!fact && (fact.status === 'verified' || includePending);
export function availableIn(entity: FortniteEntity, season: string, includePending = false, namedOnly = false): boolean {
  if (!seasonById.has(season)) return false;
  return !!entity.history?.appearances.some(period => usable(period, includePending) && (!namedOnly || period.namedPoi === true) && seasonInRange(season, period.from, period.through));
}
export function appearanceChapters(entity: FortniteEntity, includePending = false, namedOnly = false): number[] {
  return [...new Set(seasons.filter(season => availableIn(entity, season.id, includePending, namedOnly)).map(season => season.chapter))];
}
export function matchesHistory(entity: FortniteEntity, predicate: Predicate, includePending = false): boolean {
  const history = entity.history;
  if (!history) return false;
  const value = String(predicate.value);
  if (predicate.operator === 'introducedOnOrAfter' || predicate.operator === 'introducedOnOrBefore') {
    if (!usable(history.introduction, includePending) || !seasonById.has(value)) return false;
    const difference = compareSeasons(history.introduction!.season, value);
    return predicate.operator === 'introducedOnOrAfter' ? difference >= 0 : difference <= 0;
  }
  if (predicate.operator === 'introducedInChapter') return usable(history.introduction, includePending) && seasonById.get(history.introduction!.season)?.chapter === Number(predicate.value);
  if (predicate.operator === 'chapterCountAtLeast') return appearanceChapters(entity, includePending, predicate.field === 'namedPoi').length >= Number(predicate.value);
  if (predicate.operator === 'changeInSeason') return history.changes.some(change => usable(change, includePending) && change.kind === predicate.field && change.season === value);
  if (predicate.operator === 'relatedTo') return history.relationships.some(relationship => usable(relationship, includePending) && relationship.kind === predicate.field && relationship.entityId === value);
  if (predicate.operator === 'availableIn') return availableIn(entity, value, includePending, predicate.field === 'namedPoi');
  if (predicate.operator === 'appearedInChapter') return appearanceChapters(entity, includePending, predicate.field === 'namedPoi').includes(Number(predicate.value));
  if (predicate.operator === 'historyChange') return history.changes.some(change => usable(change, includePending) && change.kind === value && (predicate.field !== 'eventChange' || !!change.eventId));
  if (predicate.operator === 'hasRelationship') return history.relationships.some(relationship => usable(relationship, includePending) && relationship.kind === value);
  if (predicate.operator === 'historyFlag') {
    if (predicate.field === 'introductionTiming') return usable(history.introduction,includePending) && history.introduction!.timing === predicate.value;
    const flag = history.flags?.[predicate.field];
    return usable(flag, includePending) && flag!.value === predicate.value;
  }
  return false;
}

/** Derive event effects from location records so facts have one authoritative home. */
export function eventLocationChanges(bank: FortniteEntity[], eventId: string, includePending = false) {
 return bank.filter(entity=>entity.type==='location').flatMap(entity => (entity.history?.changes ?? []).filter(change=>change.eventId===eventId && usable(change,includePending)).map(change=>({locationId:entity.id,change})));
}

export function lastDocumentedAppearance(entity: FortniteEntity, includePending = false): string | undefined {
 const periods=entity.history?.appearances.filter(period=>usable(period,includePending)) ?? [];
 return periods.map(period=>period.through).sort(compareSeasons).at(-1);
}

/** An absent update snapshot never establishes absence for the entire season. */
export function availabilityAtUpdate(entity:FortniteEntity,update:string):'present'|'absent'|'unknown' {
 const record=entity.history?.observations?.find(record=>record.update===update && record.mode==='core_br' && record.status==='verified');
 return record?.state ?? 'unknown';
}
