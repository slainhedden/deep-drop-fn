import type { EntityType, FortniteEntity, EntityHistory, HistoricalEvidence, SeasonId } from '../../domain/types';
import { familiarityPrior } from './familiarity';
import { DATA_VERSION } from '../sources';

export const pending = (sourceId: string, note?: string): HistoricalEvidence => ({ sourceIds: [sourceId], status: 'pending', ...(note ? { note } : {}) });
export function historyAt(season: SeasonId, sourceId: string): EntityHistory {
  return { introduction: { season, ...pending(sourceId) }, appearances: [{ from: season, through: season, ...pending(sourceId) }], changes: [], relationships: [], coverageNote: 'Introduction-season snapshot only. Other appearances are unknown unless explicitly recorded.' };
}
export const slug = (name: string): string => name.toLowerCase().replace(/[’']/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
export function candidate(type: EntityType, name: string, season: string | undefined, sourceId: string, facts: FortniteEntity['facts'] = {}, id = `${type}-${slug(name)}`, familiarity = familiarityPrior(type,name)): FortniteEntity {
  const history = season ? historyAt(season,sourceId) : undefined;
  if (history && type === 'location' && typeof facts.namedPoi === 'boolean') history.appearances[0].namedPoi = facts.namedPoi;
  return { id, type, name, aliases: [], familiarity, facts, sourceIds: [sourceId], dataVersion: DATA_VERSION, verification: 'pending', ...(history ? {history} : {}) };
}
