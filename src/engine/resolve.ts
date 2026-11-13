import {entities} from '../data/entities';
import type {FortniteEntity,GeneratedQuestion} from '../domain/types';
import {answerCandidates} from './candidates';
import {normalizeAnswer} from './normalize';
import {matchingIndex,rankedMatches} from './matching';
let catalogCanonical:Set<string>|undefined;
let catalogTypes:Map<string,Set<string>>|undefined;
let catalogCompact:Set<string>|undefined;
function prepareCatalog(){if(catalogCanonical)return;catalogCanonical=new Set();catalogTypes=new Map();catalogCompact=new Set();for(const e of entities){const key=normalizeAnswer(e.name);catalogCanonical.add(key);catalogCompact.add(key.replaceAll(' ',''));const types=catalogTypes.get(key)??new Set<string>();types.add(e.type);catalogTypes.set(key,types);}}
export interface Resolution {entity?:FortniteEntity;via?:'canonical'|'alias'|'autocorrect';correctedFrom?:string;ambiguous?:boolean}
/** Only normalized exact identities or explicit aliases can score without confirmation. */
export function resolveAnswer(input:string,candidates:FortniteEntity[]):Resolution {
 const query=normalizeAnswer(input);if(!query||query.length>128)return {};
 const index=matchingIndex(candidates);
 const normalized=index.normalized.get(query)??[];
 const canonicalName=normalized.filter(e=>normalizeAnswer(e.entity.name)===query);
 if(canonicalName.length===1)return {entity:canonicalName[0].entity,via:'canonical'};
 if(normalized.length===1){const e=normalized[0].entity;prepareCatalog();if(catalogTypes!.get(query)?.has(e.type))return {};return {entity:e,via:'alias'};}
 if(normalized.length>1)return {ambiguous:true};
 // An ineligible exact identity must not silently become a different spaced name.
 prepareCatalog();
 if(catalogCanonical!.has(query))return {};
 const exact=index.exact.get(query.replaceAll(' ',''))??[];
 const canonical=exact.filter(e=>normalizeAnswer(e.entity.name).replaceAll(' ','')===query.replaceAll(' ',''));
 if(canonical.length===1)return {entity:canonical[0].entity,via:'canonical'};
 if(catalogCompact!.has(query.replaceAll(' ','')))return {};
 if(exact.length===1)return {entity:exact[0].entity,via:'alias'};
 if(exact.length>1)return {ambiguous:true};
 if((index.reordered.get(query.split(' ').sort().join(' '))?.size??0)>1)return {ambiguous:true};
 return {};
}
export function suggestionsFor(input:string,bank:Pick<GeneratedQuestion,'validAnswerIds'>|readonly FortniteEntity[],limit=6):FortniteEntity[]{
 const candidates=Array.isArray(bank)?bank as FortniteEntity[]:answerCandidates(bank as Pick<GeneratedQuestion,'validAnswerIds'>);
 return rankedMatches(input,candidates,limit);
}
