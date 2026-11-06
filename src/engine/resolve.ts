import type { FortniteEntity } from '../domain/types';
import { entitiesByType } from '../data/entities';
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

const names=(entity:FortniteEntity)=>[{text:entity.name,via:'canonical' as const},...entity.aliases.map((item)=>({text:item.text,via:'alias' as const}))];

export function resolveAnswer(input:string,candidates:FortniteEntity[]):Resolution {
  const query=normalizeAnswer(input);
  if(!query) return {};
  const exact=candidates.flatMap(entity=>names(entity).map(name=>({entity,...name}))).filter(item=>normalizeAnswer(item.text)===query);
  const exactIds=new Set(exact.map(item=>item.entity.id));
  if(exactIds.size===1) return {entity:exact[0].entity,via:exact.some(item=>item.via==='canonical')?'canonical':'alias'};
  if(exactIds.size>1) return {ambiguous:true};

  if(query.length<4) return {};
  // Keep correction deliberately narrow: transpositions and a single missed key
  // are fine; a different Fortnite name that merely looks similar is not.
  const threshold=query.length<=16?1:2;
  const scored=candidates.map(entity=>({entity,score:Math.min(...names(entity).map(name=>distance(query,normalizeAnswer(name.text))))})).sort((a,b)=>a.score-b.score);
  if(scored[0]?.score<=threshold && (!scored[1]||scored[1].score-scored[0].score>=2)) return {entity:scored[0].entity,via:'autocorrect',correctedFrom:input.trim()};
  return {};
}

export function suggestionsFor(input:string,type:FortniteEntity['type'],limit=3):FortniteEntity[] {
  const query=normalizeAnswer(input);
  if(query.length<2) return [];
  return entitiesByType(type).map(entity=>{
    const values=names(entity).map(item=>normalizeAnswer(item.text));
    const prefix=values.some(value=>value.startsWith(query)||value.split(' ').some(token=>token.startsWith(query)));
    const score=prefix?0:Math.min(...values.map(value=>distance(query,value)));
    return {entity,score};
  }).filter(item=>item.score<=Math.max(2,Math.floor(query.length/3))).sort((a,b)=>a.score-b.score||b.entity.familiarity-a.entity.familiarity).slice(0,limit).map(item=>item.entity);
}
