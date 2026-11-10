import type { FortniteEntity, GeneratedQuestion } from '../domain/types';
import { answerCandidates, uniqueEntities } from './candidates';
import { normalizeAnswer } from './normalize';

export interface Resolution { entity?:FortniteEntity; via?:'canonical'|'alias'|'autocorrect'; correctedFrom?:string; ambiguous?:boolean }

function distance(a:string,b:string):number {
  const rows=Array.from({length:a.length+1},()=>Array<number>(b.length+1).fill(0));
  for(let i=0;i<=a.length;i++) rows[i][0]=i;
  for(let j=0;j<=b.length;j++) rows[0][j]=j;
  for(let i=1;i<=a.length;i++) for(let j=1;j<=b.length;j++) {
    const cost=a[i-1]===b[j-1]?0:1;
    rows[i][j]=Math.min(rows[i-1][j]+1,rows[i][j-1]+1,rows[i-1][j-1]+cost);
    if(i>1&&j>1&&a[i-1]===b[j-2]&&a[i-2]===b[j-1]) rows[i][j]=Math.min(rows[i][j],rows[i-2][j-2]+cost);
  }
  return rows[a.length][b.length];
}

const nameCache = new WeakMap<FortniteEntity,Array<{text:string; normalized:string; via:'canonical'|'alias'}>>();
function names(entity:FortniteEntity) {
 let values = nameCache.get(entity);
 if (!values) {
  values = [{text:entity.name,via:'canonical' as const},...entity.aliases.map(item=>({text:item.text,via:'alias' as const}))].map(value=>({...value,normalized:normalizeAnswer(value.text)}));
  nameCache.set(entity,values);
 }
 return values;
}

export function resolveAnswer(input:string,candidates:FortniteEntity[]):Resolution {
  candidates=uniqueEntities(candidates);
  const query=normalizeAnswer(input);
  if(!query || query.length > 128) return {};
  const exact=candidates.flatMap(entity=>names(entity).map(name=>({entity,...name}))).filter(item=>item.normalized===query);
  const canonical=exact.filter(item=>item.via==='canonical');
  if(new Set(canonical.map(item=>item.entity.id)).size===1) return {entity:canonical[0].entity,via:'canonical'};
  const exactIds=new Set(exact.map(item=>item.entity.id));
  if(exactIds.size===1) return {entity:exact[0].entity,via:exact.some(item=>item.via==='canonical')?'canonical':'alias'};
  if(exactIds.size>1) return {ambiguous:true};

  const tokens=query.split(' ');
  if(tokens.length>1) {
   const key=[...tokens].sort().join(' ');
   const reordered=candidates.filter(entity=>names(entity).some(name=>name.normalized.split(' ').sort().join(' ')===key));
   if(reordered.length===1)return {entity:reordered[0],via:'alias'};
   if(reordered.length>1)return {ambiguous:true};
  }
  if(query.length<4) return {};
  // Keep correction deliberately narrow: transpositions and a single missed key
  // are fine; a different Fortnite name that merely looks similar is not.
  const threshold=query.length<=16?1:2;
  const scored=candidates.map(entity=>({entity,score:Math.min(...names(entity).map(name=>Math.abs(query.length-name.normalized.length)>threshold+1 ? Infinity : distance(query,name.normalized)))})).sort((a,b)=>a.score-b.score);
  if(scored[0]?.score<=threshold && (!scored[1]||scored[1].score-scored[0].score>=2)) return {entity:scored[0].entity,via:'autocorrect',correctedFrom:input.trim()};
  return {};
}

/** Ranked only within the active snapshot; a type-wide bank is never substituted. */
export function suggestionsFor(input:string,bank:Pick<GeneratedQuestion,'validAnswerIds'>|readonly FortniteEntity[],limit=6):FortniteEntity[] {
 const query=normalizeAnswer(input);
 if(query.length<3 || query.length>128 || limit<=0)return [];
 const candidates=Array.isArray(bank)?uniqueEntities(bank):answerCandidates(bank as Pick<GeneratedQuestion,'validAnswerIds'>);
 const queryWords=query.split(' ');
 const threshold=query.length<=16?1:2;
 const rank=(entity:FortniteEntity):number[]|undefined=>{
  let best:number[]|undefined;
  for(const name of names(entity)) {
   const value=name.normalized;const words=value.split(' ');let tier:number;let position=0;let edit=0;
   if(value===query)tier=0;
   else if(value.startsWith(query))tier=1;
   else {
    const remaining=[...words];let wordMatch=true;
    for(const token of queryWords) {const index=remaining.findIndex(word=>word.startsWith(token));if(index<0){wordMatch=false;break}position+=index;remaining.splice(index,1);}
    if(wordMatch)tier=2;
    else if(query.length>=3 && value.includes(query)){tier=3;position=value.indexOf(query);}
    else if(query.length>=4 && Math.abs(value.length-query.length)<=threshold && (edit=distance(query,value))<=threshold)tier=4;
    else continue;
   }
   const score=[tier,name.via==='canonical'?0:1,position,edit,Math.abs(value.length-query.length)];
   if(!best || compareRank(score,best)<0)best=score;
  }
  return best;
 };
 return candidates.map(entity=>({entity,rank:rank(entity)})).filter((row):row is {entity:FortniteEntity;rank:number[]}=>!!row.rank)
  .sort((a,b)=>compareRank(a.rank,b.rank)||a.entity.name.localeCompare(b.entity.name,'en-US'))
  .slice(0,Math.min(6,Math.floor(limit))).map(row=>row.entity);
}
function compareRank(left:number[],right:number[]):number {
 for(let i=0;i<left.length;i++){const difference=left[i]-right[i];if(difference)return difference;}
 return 0;
}
