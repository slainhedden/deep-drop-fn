import { matchesHistory } from './history';
import type { FortniteEntity, HistoricalEvidence, Predicate } from '../domain/types';

export interface PredicateAssessment {
 predicate:Predicate; eligible:boolean; reason:string;
 value:unknown; verification:'verified'|'legacy'|'pending'|'missing';
 evidence?:HistoricalEvidence | HistoricalEvidence[];
}
export function factVerification(entity:FortniteEntity,field:string):PredicateAssessment['verification'] {
 const evidence=entity.factEvidence?.[field];
 if (evidence) return evidence.status;
 return entity.verification==='legacy' && entity.facts[field]!==undefined ? 'legacy' : 'missing';
}
function historicalEvidence(entity:FortniteEntity,predicate:Predicate):HistoricalEvidence[] {
 const h=entity.history;if(!h)return [];
 if (['introducedOnOrAfter','introducedOnOrBefore','introducedInChapter'].includes(predicate.operator) || predicate.field==='introductionTiming') return h.introduction ? [h.introduction] : [];
 if (['availableIn','appearedInChapter','chapterCountAtLeast'].includes(predicate.operator)) return h.appearances;
 if (predicate.operator==='historyChange' || predicate.operator==='changeInSeason') return h.changes.filter(change=>change.kind===(predicate.operator==='changeInSeason' ? predicate.field : predicate.value));
 if (predicate.operator==='hasRelationship' || predicate.operator==='relatedTo') return h.relationships.filter(relation=>relation.kind===(predicate.operator==='relatedTo' ? predicate.field : predicate.value) && (!predicate.season || relation.season===predicate.season));
 return h.flags?.[predicate.field] ? [h.flags[predicate.field]] : [];
}
export function assessPredicate(entity:FortniteEntity,predicate:Predicate,includePending=false):PredicateAssessment {
 if (!['eq','includes','contains'].includes(predicate.operator)) {
  const evidence=historicalEvidence(entity,predicate);
  const eligible=matchesHistory(entity,predicate,includePending);
  const pendingMatch=!eligible && matchesHistory(entity,predicate,true);
  return {predicate,eligible,evidence,value:evidence,verification:eligible?'verified':pendingMatch?'pending':evidence.some(record=>record.status==='verified')?'verified':evidence.length?'pending':'missing',reason:eligible?'Verified historical predicate matched.':pendingMatch?'Matching historical claims are pending verification.':evidence.length?'No verified historical record satisfies this predicate; missing appearances remain unknown.':'Required historical metadata is missing.'};
 }
 const value=entity.facts[predicate.field];const verification=factVerification(entity,predicate.field);
 const evidence=entity.factEvidence?.[predicate.field];
 let matches=false;
 if (value!==undefined) {
  if(predicate.operator==='eq')matches=value===predicate.value;
  else if(predicate.operator==='includes')matches=Array.isArray(value)&&value.includes(predicate.value as never);
  else matches=String(value).toLocaleLowerCase('en-US').includes(String(predicate.value).toLocaleLowerCase('en-US'));
 }
 const trusted=verification==='verified'||verification==='legacy';
 const eligible=matches&&(trusted||includePending);
 return {predicate,eligible,value,verification,evidence,reason:value===undefined?`Missing classification field: ${predicate.field}.`:!matches?`Classification ${predicate.field} does not match ${String(predicate.value)}.`:!trusted&&!includePending?`Classification ${predicate.field} is ${verification==='pending'?'pending verification':'missing field-level verification'}.`:verification==='legacy'?'Retained original catalog classification; not newly source-verified.':'Verified classification matched; unrelated history is not required.'};
}
export function matchesPredicate(entity:FortniteEntity,predicate:Predicate,includePending=false):boolean {
 return assessPredicate(entity,predicate,includePending).eligible;
}
export const matchesAll=(entity:FortniteEntity,predicates:Predicate[],includePending=false)=>predicates.every(predicate=>matchesPredicate(entity,predicate,includePending));
