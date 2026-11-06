import type { FortniteEntity, Predicate } from '../domain/types';

export function matchesPredicate(entity: FortniteEntity, predicate: Predicate): boolean {
  const actual = entity.facts[predicate.field];
  if (actual === undefined) return false;
  if (predicate.operator === 'eq') return actual === predicate.value;
  if (predicate.operator === 'includes') return Array.isArray(actual) && actual.includes(predicate.value as never);
  if (predicate.operator === 'contains') return String(actual).toLocaleLowerCase().includes(String(predicate.value).toLocaleLowerCase());
  return false;
}

export const matchesAll = (entity: FortniteEntity, predicates: Predicate[]) => predicates.every((predicate) => matchesPredicate(entity, predicate));
