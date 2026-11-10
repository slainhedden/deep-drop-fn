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
 const dailyEligible=count>=8 && recognizable>=3 && specificity<=1 && !q.advanced;
 const reasons=[];
 if(count<8)reasons.push('Small bank: preserve for practice.');
 if(count>=8&&count<12)reasons.push('Small accessible bank: eligible only as a daily wildcard.');
 if(recognizable<3)reasons.push('Fewer than three high-recall editorial estimates.');
 if(specificity>1)reasons.push('Requires a specific season, update or historical interval.');
 if(q.advanced)reasons.push('Advanced scope stays in practice.');
 const result:QuestionQuality={acceptedAnswers:count,fieldVerifiedAnswers:bank.filter(e=>q.predicates.length>0&&q.predicates.every(p=>assessPredicate(e,p).verification==='verified')).length,recognizableAnswers:recognizable,breadth,historicalSpecificity:specificity,difficulty,dailyEligible,preferredDaily:dailyEligible&&count>=20,clarity:q.prompt.includes('announcement')||q.prompt.includes('catalog')?'Explicit bounded reference scope.':'Direct category or documented relationship.',rareAnswerCount:bank.filter(e=>e.familiarity<.4).length,reasons};
 qualityCache.set(q,result);return result;
}
export function qualitySummary(questions:GeneratedQuestion[]) {
 const rows=questions.map(q=>({id:q.id,templateId:q.templateId,prompt:q.prompt,...questionQuality(q)}));
 const bands=[['under10',0,9],['10to19',10,19],['20to49',20,49],['50to99',50,99],['100plus',100,Infinity]] as const;
 const distribution=Object.fromEntries(bands.map(([name,min,max])=>{const count=rows.filter(q=>q.acceptedAnswers>=min&&q.acceptedAnswers<=max).length;return [name,{count,percentage:rows.length?Math.round(count/rows.length*1000)/10:0}]}));
 return {distribution,dailyEligible:rows.filter(q=>q.dailyEligible).length,practiceOnly:rows.filter(q=>!q.dailyEligible).length,preferredDaily:rows.filter(q=>q.preferredDaily).length,questions:rows};
}
