import { entities,entitiesById } from '../data/entities';
import { seasons } from '../data/seasons';
import { factVerification } from './predicates';
import { availableIn } from './history';
import { dailySeed,generateGame,questionPool } from './questions';
let cached:ReturnType<typeof calculate>|undefined;
function calculate(){
 const ids=new Set(['skin-battle-pass','weapon-class','location-catalog','collaboration-group','health-item','shield-item','health-and-shield-item','utility-item','vehicle','live-event','weapon-general','crossover-general','weapon-mythic-version','weapon-exotic-class','loot-container','ammunition-class','foraged-class','mobility-equipment','throwable-equipment','trap-equipment','fish-class','landmark-general']);
 const questions=questionPool();
 const broadBanks=questions.filter(q=>ids.has(q.templateId)).map(q=>({templateId:q.templateId,parameters:q.parameters,prompt:q.prompt,accepted:q.validAnswerIds.length,explicitlyVerified:q.validAnswerIds.filter(id=>q.predicates.every(p=>factVerification(entitiesById.get(id)!,p.field)==='verified')).length}));
 const verifiedAttribute=(field:string,type?:string)=>entities.filter(e=>(!type||e.type===type)&&e.facts[field]===true&&factVerification(e,field)==='verified').length;
 const seasonAssignments=Object.fromEntries([1,2,3,4,5,6,7].map(chapter=>{const rows=seasons.filter(s=>s.chapter===chapter&&s.kind!=='throwback').map(s=>({season:s.id,namedPois:entities.filter(e=>e.type==='location'&&availableIn(e,s.id,false,true)).length}));return [chapter,{assignments:rows.reduce((n,r)=>n+r.namedPois,0),bySeason:rows}]}));
 const namedByChapter=Object.fromEntries([1,2,3,4,5,6,7].map(chapter=>[chapter,entities.filter(e=>e.type==='location'&&e.facts.namedPoi===true&&Array.isArray(e.facts.numberedChapterAppearances)&&e.facts.numberedChapterAppearances.some(value=>value===chapter)).length]));
 let pendingHistoricalClaims=0;
 for(const e of entities){const h=e.history;if(!h)continue;pendingHistoricalClaims+=[...(h.introduction?[h.introduction]:[]),...h.appearances,...h.changes,...h.relationships,...(h.observations??[]),...Object.values(h.flags??{})].filter(r=>r.status==='pending').length;}
 const answerCounts:number[]=[];const examples=[];
 for(let day=1;day<=120;day++){const game=generateGame(dailySeed(new Date(Date.UTC(2026,8,day))),7);answerCounts.push(...game.map(q=>q.validAnswerIds.length));if(day<=3)examples.push(game.map(q=>({templateId:q.templateId,count:q.validAnswerIds.length})));}
 const bands=[['under10',0,9],['10to19',10,19],['20to49',20,49],['50to99',50,99],['100plus',100,Infinity]] as const;
 return {broadBanks,verifiedClassifications:{healthItems:verifiedAttribute('restoresHealth','item'),shieldItems:verifiedAttribute('restoresShield','item'),fish:verifiedAttribute('isFish','item'),foraged:verifiedAttribute('isForaged','item'),mythicWeapons:verifiedAttribute('hasMythicVersion','weapon'),exoticWeapons:verifiedAttribute('isExotic','weapon')},namedByChapter,seasonAssignments,pendingHistoricalClaims,dailyDistribution:{sampleDays:120,rounds:answerCounts.length,atLeast20Percent:answerCounts.length?Math.round(answerCounts.filter(n=>n>=20).length/answerCounts.length*1000)/10:0,bands:Object.fromEntries(bands.map(([name,min,max])=>[name,answerCounts.filter(n=>n>=min&&n<=max).length])),examples}};
}
export function contentAudit(){return cached??(cached=calculate());}
