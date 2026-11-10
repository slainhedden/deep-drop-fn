import type { EntityType, FortniteEntity, HistoricalEvidence } from '../../domain/types';
import { DATA_VERSION, sourceById } from '../sources';
import { normalizeAnswer } from '../../engine/normalize';
import { candidate } from './helpers';

export const proof=(sourceId:string,note:string):HistoricalEvidence=>{
 const source=sourceById.get(sourceId);
 if (source?.status!=='verified' || !source.verifiedOn) throw new Error(`Unreviewed source: ${sourceId}`);
 return {status:'verified',sourceIds:[sourceId],note};
};

export function historyEditor(bank:FortniteEntity[]) {
 const byName=new Map(bank.map(entity=>[`${entity.type}:${normalizeAnswer(entity.name)}`,entity]));
 function record(type:EntityType,name:string,sourceId:string,claims:FortniteEntity['facts']={},identityKey?:string) {
  const key=identityKey??`${type}:${normalizeAnswer(name)}`;
  let entity=byName.get(key);
  if (!entity) { entity=candidate(type,name,undefined,sourceId);entity.origin='expansion';bank.push(entity);byName.set(key,entity); }
  // Reviewing a date alone does not reverify an original classification.
  // Retain legacy classification behavior and provenance when no facts were claimed.
  const retainLegacy=entity.verification==='legacy' && Object.keys(claims).length===0;
  if (!retainLegacy && entity.verification !== 'verified') entity.sourceIds=[];
  if (!retainLegacy) entity.verification='verified';
  entity.dataVersion=DATA_VERSION;
  if (!entity.sourceIds.includes(sourceId)) entity.sourceIds.push(sourceId);
  entity.factEvidence ??= {};
  for (const [field,value] of Object.entries(claims)) {
   entity.facts[field]=value;
   const previous=entity.factEvidence[field]?.sourceIds ?? [];
   entity.factEvidence[field]={...proof(sourceId,'Explicitly named or described in the cited article.'),sourceIds:[...new Set([...previous,sourceId])]};
  }
  return entity;
 }
 function appendList(entity:FortniteEntity,field:string,value:string,sourceId:string) {
  const existing=entity.facts[field];
  entity.facts[field]=[...new Set([...(Array.isArray(existing) ? existing as string[] : []),value])];
  entity.factEvidence ??={};
  entity.factEvidence[field]={...proof(sourceId,'Membership in a reviewed article section.'),sourceIds:[...new Set([...(entity.factEvidence[field]?.sourceIds ?? []),sourceId])]};
 }
 function appearance(entity:FortniteEntity,season:string,sourceId:string,namedPoi?:boolean) {
  entity.history ??={appearances:[],changes:[],relationships:[]};
  const existing=entity.history.appearances.find(period=>period.from===season && period.through===season && period.status==='verified');
  if (!existing) entity.history.appearances.push({from:season,through:season,...proof(sourceId,'Documented presence during the season; not an assertion of full-season continuity.'),...(namedPoi !== undefined ? {namedPoi} : {})});
 }
 function introduced(entity:FortniteEntity,season:string,sourceId:string) {
  entity.history ??={appearances:[],changes:[],relationships:[]};
  entity.history.introduction={season,...proof(sourceId,'New release or first-introduction section in the cited announcement.')};
 }
 return {byName,record,appendList,appearance,introduced};
}
