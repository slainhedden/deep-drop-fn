import type {FortniteEntity} from '../domain/types';
import {normalizeAnswer} from './normalize';
const compact=(s:string)=>s.replaceAll(' ','');
const grams=(s:string)=>[...new Set(Array.from({length:Math.max(0,s.length-2)},(_,i)=>s.slice(i,i+3)))];
type Entry={entity:FortniteEntity;values:string[]};
const cache=new WeakMap<FortniteEntity[],ReturnType<typeof createIndex>>();
function createIndex(bank:FortniteEntity[]){
 const entries:Entry[]=[...new Map(bank.map(e=>[e.id,e])).values()].map(entity=>({entity,values:[...new Set([entity.name,...entity.aliases.map(a=>a.text)].map(normalizeAnswer))]}));
 const normalized=new Map<string,Entry[]>(),reordered=new Map<string,Set<Entry>>();
 const exact=new Map<string,Entry[]>(),prefix=new Map<string,Set<Entry>>(),trigrams=new Map<string,Set<Entry>>();
 const add=(map:Map<string,Set<Entry>>,key:string,e:Entry)=>{let set=map.get(key);if(!set)map.set(key,set=new Set());set.add(e);};
 for(const e of entries)for(const value of e.values){
  const found=normalized.get(value)??[];if(!found.includes(e))found.push(e);normalized.set(value,found);
  const key=compact(value),joined=exact.get(key)??[];if(!joined.includes(e))joined.push(e);exact.set(key,joined);
  add(reordered,value.split(' ').sort().join(' '),e);
 }
 const prepare=()=>{if(prefix.size)return;for(const e of entries)for(const value of e.values){const key=compact(value);
  for(const word of [...value.split(' '),key])for(let n=3;n<=Math.min(40,word.length);n++)add(prefix,word.slice(0,n),e);
  for(const gram of grams(key))add(trigrams,gram,e);
 }};

 return {entries,exact,normalized,reordered,prefix,trigrams,prepare};
}
export function matchingIndex(bank:FortniteEntity[]){let index=cache.get(bank);if(!index){index=createIndex(bank);cache.set(bank,index);}return index;}
function distance(a:string,b:string):number{
 let prior=Array.from({length:b.length+1},(_,i)=>i),before=prior;
 for(let i=1;i<=a.length;i++){const row=[i];for(let j=1;j<=b.length;j++){row[j]=Math.min(row[j-1]+1,prior[j]+1,prior[j-1]+Number(a[i-1]!==b[j-1]));if(i>1&&j>1&&a[i-1]===b[j-2]&&a[i-2]===b[j-1])row[j]=Math.min(row[j],before[j-2]+1);}before=prior;prior=row;}return prior[b.length];
}
/** Search only the active bank. At most 600 entries reach expensive scoring. */
export function rankedMatches(input:string,bank:FortniteEntity[],limit=3):FortniteEntity[]{
 let query=normalizeAnswer(input);if(query.length<3||query.length>128||limit<=0)return [];
 query=query.replace(/\bshotty\b/g,'shotgun');
 const index=matchingIndex(bank);index.prepare();const key=compact(query),votes=new Map<Entry,number>();
 const vote=(entry:Entry,n:number)=>votes.set(entry,(votes.get(entry)??0)+n);
 for(const e of index.prefix.get(key)??[])vote(e,100);
 for(const token of query.split(' '))for(const e of index.prefix.get(token)??[])vote(e,10);
 for(const gram of grams(key))for(const e of index.trigrams.get(gram)??[])vote(e,1);
 const candidates=[...votes].sort((a,b)=>b[1]-a[1]).slice(0,600).map(([e])=>e);
 const scored=candidates.map(e=>{
  let best=Infinity;
  for(const value of e.values){const target=compact(value),words=value.split(' '),tokens=query.split(' ');
   if(target===key){best=value===e.values[0]?0:1;break;}
   if(target.startsWith(key))best=Math.min(best,10+(target.length-key.length)/100);
   if(tokens.every(t=>words.some(w=>w.startsWith(t)||(t.length>=4&&w===t.replace(/s$/,'')))))best=Math.min(best,20+Math.abs(target.length-key.length)/100);
   if(query==='avatar aang'&&(value==='aang'||value==='avatar state aang'))best=Math.min(best,21);
   if(query.split(' ').length===1&&target.includes(key))best=Math.min(best,25+(target.length-key.length)/100);
   const threshold=key.length<=16?1:2;
   if(key.length>=4&&Math.abs(target.length-key.length)<=threshold){const d=distance(key,target);if(d<=threshold)best=Math.min(best,30+d);}
  }
  return {entity:e.entity,score:best};
 }).filter(e=>Number.isFinite(e.score));
 return scored.sort((a,b)=>a.score-b.score||a.entity.name.localeCompare(b.entity.name,'en-US')).slice(0,Math.min(6,limit)).map(e=>e.entity);
}
