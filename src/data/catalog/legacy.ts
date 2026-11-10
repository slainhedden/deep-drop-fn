import type { FortniteEntity } from '../../domain/types';
import { normalizeAnswer } from '../../engine/normalize';

/** Preserve public IDs and familiarity priors; never promote pending history to verified. */
export function enrichLegacyEntities(legacy: FortniteEntity[], additions: FortniteEntity[]): FortniteEntity[] {
  const key = (entity: FortniteEntity) => `${entity.type}:${normalizeAnswer(entity.name)}`;
  const additionsByName = new Map(additions.map(entity => [key(entity), entity]));
  const originalKeys = new Set(legacy.map(key));
  const merged = legacy.map(entity => {
    const extra = additionsByName.get(key(entity));
    const result: FortniteEntity = { ...entity, verification: 'legacy', origin:'legacy', ...(extra?.history ? { history: structuredClone(extra.history) } : {}) };
    // These nicknames have multiple historical referents. Question context must resolve them.
    if (entity.id === 'dusty-divot') result.aliases = [...entity.aliases, { text: 'dusty', kind: 'slang', confidence: 'contextual' }];
    if (entity.id === 'dusty-depot') result.aliases = entity.aliases.map(alias => alias.text === 'dusty' ? { ...alias, confidence: 'contextual' } : alias);
    return result;
  });
  return [...merged, ...additions.filter(entity => !originalKeys.has(key(entity))).map(entity=>({...entity,origin:'expansion' as const}))];
}
