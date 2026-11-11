import type {GeneratedQuestion} from '../domain/types';
import {seasonById} from '../data/seasons';
export type FortniteEra='classic'|'middle'|'recent'|'cross-era';
export const chapterEra=(chapter:number):FortniteEra=>chapter<=2?'classic':chapter<=4?'middle':'recent';
/** Editorial prompt scope only. Answer familiarity never supplies historical dates. */
export function questionEra(q:GeneratedQuestion):FortniteEra {
 const explicit=q.parameters.era;
 if(explicit==='classic'||explicit==='middle'||explicit==='recent')return explicit;
 const chapter=Number(q.parameters.chapter);
 if(chapter>=1&&chapter<=7)return chapterEra(chapter);
 const season=seasonById.get(String(q.parameters.season??q.parameters.period??''));
 if(season)return season.kind==='throwback'?'classic':chapterEra(season.chapter);
 return 'cross-era';
}
export function eraPreferenceCost(selected:GeneratedQuestion[],candidate:GeneratedQuestion):number {
 const bucket=(q:GeneratedQuestion)=>['classic','middle'].includes(questionEra(q))?'historical':questionEra(q);
 const b=bucket(candidate),count=selected.filter(q=>bucket(q)===b).length;
 const target=b==='cross-era'?3:2;
 // Smaller than exact and short family cooldowns. Sparse eras never force an ineligible bank.
 return (count>=target?180*(count-target+1):0)+(b==='recent'&&count<target?-160:b==='historical'&&count<target?-30:0);
}
