import {entities} from '../data/entities';
import type {GeneratedQuestion} from '../domain/types';
import {normalizeAnswer} from './normalize';
let catalog:Map<string,typeof entities>|undefined;
/** Global lookup runs only when a player opens a report, never during typing. */
export function missingAnswerReport(question:GeneratedQuestion,attempt:string,explanation='',now=new Date()){
 if(!catalog){catalog=new Map();for(const e of entities)for(const name of [e.name,...e.aliases.map(a=>a.text)]){const key=normalizeAnswer(name);const list=catalog.get(key)??[];if(!list.some(x=>x.id===e.id))list.push(e);catalog.set(key,list);}}
 return {questionId:question.id,question:question.prompt,attemptedAnswer:attempt.slice(0,128),catalogMatches:(catalog.get(normalizeAnswer(attempt))??[]).map(e=>({id:e.id,name:e.name,type:e.type,eligible:question.validAnswerIds.includes(e.id)})),dataVersion:question.dataVersion,timestamp:now.toISOString(),explanation:explanation.slice(0,500)};
}
