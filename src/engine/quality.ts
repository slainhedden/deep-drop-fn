import {independentDailyPool} from './daily-pool';
import type { GeneratedQuestion } from '../domain/types';
import { entitiesById } from '../data/entities';
import { assessPredicate } from './predicates';

export interface QuestionQuality {
 acceptedAnswers:number; fieldVerifiedAnswers:number; recognizableAnswers:number;
 breadth:'broad'|'standard'|'medium'|'hard'|'expert'; historicalSpecificity:number;
 difficulty:'easy'|'medium'|'hard'|'expert'; dailyEligible:boolean; preferredDaily:boolean;
 clarity:string; rareAnswerCount:number; reasons:string[];
}
/** Editorial recall priors are estimates, never measured popularity or objective difficulty. */
const qualityCache=new WeakMap<GeneratedQuestion,QuestionQuality>();
export function questionQuality(q:GeneratedQuestion):QuestionQuality {
 const cached=qualityCache.get(q);if(cached)return cached;
 const bank=q.validAnswerIds.map(id=>entitiesById.get(id)!).filter(Boolean);
 const count=bank.length,recognizable=bank.filter(e=>e.familiarity>=.6).length;
 const historical=q.predicates.some(p=>!['eq','includes','contains'].includes(p.operator)) || /reviewed|season|launch|patch/.test(q.templateId);
 const specificity=/range|patch|update/.test(q.templateId)?3:('season' in q.parameters || 'from' in q.parameters)?2:historical?1:0;
 const breadth=count>=40?'broad':count>=20?'standard':count>=12?'medium':count>=8?'hard':'expert';
 const difficulty=specificity>=3||recognizable<2?'expert':specificity>=2||recognizable<3?'hard':count<20||recognizable<5?'medium':'easy';
 const verified=bank.filter(e=>q.predicates.length>0&&q.predicates.every(p=>assessPredicate(e,p).verification==='verified')).length;
 const dailyEligible=verified>=15 && recognizable>=3 && specificity<=1 && !q.advanced;
 const reasons=[];
 if(verified<10)reasons.push('Fewer than ten verified answers: Expert archive only.');
 if(verified<15)reasons.push('Fewer than fifteen verified answers: excluded from Daily Drop.');

 if(recognizable<3)reasons.push('Fewer than three high-recall editorial estimates.');
 if(specificity>1)reasons.push('Requires a specific season, update or historical interval.');
 if(q.advanced)reasons.push('Advanced scope stays in practice.');
 const result:QuestionQuality={acceptedAnswers:count,fieldVerifiedAnswers:verified,recognizableAnswers:recognizable,breadth,historicalSpecificity:specificity,difficulty,dailyEligible,preferredDaily:dailyEligible&&verified>=20,clarity:q.prompt.includes('announcement')||q.prompt.includes('catalog')?'Explicit bounded reference scope.':'Direct category or documented relationship.',rareAnswerCount:bank.filter(e=>e.familiarity<.4).length,reasons};
 qualityCache.set(q,result);return result;
}
export function qualitySummary(questions:GeneratedQuestion[]) {
 const independence=independentDailyPool(questions);const rejected=new Set(independence.excluded.map(q=>q.id));
 const rows=questions.map(q=>({id:q.id,templateId:q.templateId,prompt:q.prompt,...questionQuality(q),dailyEligible:questionQuality(q).dailyEligible&&!rejected.has(q.id)}));
 const bands=[['under10',0,9],['10to19',10,19],['20to49',20,49],['50to99',50,99],['100plus',100,Infinity]] as const;
 const distribution=Object.fromEntries(bands.map(([name,min,max])=>{const count=rows.filter(q=>q.acceptedAnswers>=min&&q.acceptedAnswers<=max).length;return [name,{count,percentage:rows.length?Math.round(count/rows.length*1000)/10:0}]}));
 const counts=rows.map(r=>r.fieldVerifiedAnswers).sort((a,b)=>a-b);
 const percentile=(p:number)=>counts[Math.floor((counts.length-1)*p)]??0;
 return {rawDailyEligible:independence.rawEligible,nearDuplicateDailyExclusions:independence.excluded,percentiles:{p10:percentile(.1),p25:percentile(.25),p50:percentile(.5),p75:percentile(.75),p90:percentile(.9)},below10:rows.filter(r=>r.fieldVerifiedAnswers<10).length,below15:rows.filter(r=>r.fieldVerifiedAnswers<15).length,below20:rows.filter(r=>r.fieldVerifiedAnswers<20).length,wordingProblems:rows.filter(r=>/\bv\d+[.-]\d+|map snapshot|historical update observation|answer catalog/i.test(r.prompt)).map(r=>({id:r.id,prompt:r.prompt})),distribution,dailyEligible:rows.filter(q=>q.dailyEligible).length,practiceOnly:rows.filter(q=>!q.dailyEligible).length,preferredDaily:rows.filter(q=>q.preferredDaily).length,questions:rows};
}
