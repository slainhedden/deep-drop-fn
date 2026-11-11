import type {GeneratedQuestion} from '../domain/types';
import {entitiesById} from '../data/entities';
import {normalizeAnswer} from './normalize';
import {questionQuality} from './quality';
const signatures=new WeakMap<GeneratedQuestion,Set<string>>();
export function answerNames(q:GeneratedQuestion):Set<string>{
 let names=signatures.get(q);if(!names){names=new Set(q.validAnswerIds.map(id=>normalizeAnswer(entitiesById.get(id)!.name)));signatures.set(q,names);}return names;
}
const overlaps=new Map<string,number>();
export function semanticOverlap(a:GeneratedQuestion,b:GeneratedQuestion):number{
 const key=[a.id,b.id].sort().join('::');const cached=overlaps.get(key);if(cached!==undefined)return cached;
 const left=answerNames(a),right=answerNames(b);let common=0;for(const name of left)if(right.has(name))common++;
 const score=common/(left.size+right.size-common);overlaps.set(key,score);return score;
}
/** An answer-population audit, independent of wording, template IDs, and entity types. */
export function independentDailyPool(candidates:GeneratedQuestion[]):{questions:GeneratedQuestion[];excluded:{id:string;similarTo:string;overlap:number}[];rawEligible:number}{
 const raw=candidates.filter(q=>questionQuality(q).dailyEligible),questions:GeneratedQuestion[]=[],excluded:{id:string;similarTo:string;overlap:number}[]=[];
 for(const q of raw){const similar=questions.find(p=>semanticOverlap(p,q)>=.85);if(similar)excluded.push({id:q.id,similarTo:similar.id,overlap:semanticOverlap(q,similar)});else questions.push(q);}
 return {questions,excluded,rawEligible:raw.length};
}
export const isCosmeticQuestion=(q:GeneratedQuestion)=>q.category==='Cosmetics'||q.category==='Skins';
