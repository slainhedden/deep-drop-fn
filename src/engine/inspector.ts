import { entities } from '../data/entities';
import { templates } from '../data/templates';
import { DATA_VERSION } from '../data/sources';
import { assessPredicate } from './predicates';
import { buildQuestion,questionPool } from './questions';
import { supportsScope } from './coverage';
import { reviewedParametersSupported } from '../data/reviewed-templates';
import { uniqueEntities } from './candidates';

/** Developer tooling only. Never imported by the game entry point. */
export function inspectAnswerBank(templateId:string,parameters:Record<string,string|number>) {
 const template=templates.find(template=>template.id===templateId);
 if(!template)throw new Error(`Unknown template: ${templateId}`);
 for(const key of Object.keys(parameters))if(!template.parameters.some(parameter=>parameter.key===key))throw new Error(`Unexpected parameter: ${key}`);
 for(const parameter of template.parameters)if(!parameter.values.includes(parameters[parameter.key]))throw new Error(`Invalid or missing parameter ${parameter.key}; choose ${parameter.values.join(', ')}.`);
 const question=buildQuestion(template,parameters);
 const acceptedIds=new Set(question?.validAnswerIds??[]);
 const disabledReasons:string[]=[];
 if(template.status==='pending')disabledReasons.push('Template is pending review.');
 if(!supportsScope(template,parameters))disabledReasons.push('This parameter scope has no coverage approval.');
 if(!reviewedParametersSupported(template,parameters))disabledReasons.push('Duplicate or unsupported parameter scope.');
 const predicates=template.predicates(parameters);
 const rows=uniqueEntities(entities.filter(entity=>entity.type===template.answerType)).map(entity=>{
  const qualification=predicates.map(predicate=>assessPredicate(entity,predicate));
  return {id:entity.id,name:entity.name,aliases:entity.aliases,recordStatus:entity.verification,
   qualifies:qualification.every(result=>result.eligible),qualification,
   relevantFacts:Object.fromEntries(predicates.filter(predicate=>['eq','includes','contains'].includes(predicate.operator)).map(predicate=>[predicate.field,{value:entity.facts[predicate.field],evidence:entity.factEvidence?.[predicate.field]??null}])),
   verifiedFacts:Object.fromEntries(Object.entries(entity.factEvidence??{}).filter(([,proof])=>proof.status==='verified').map(([field,proof])=>[field,{value:entity.facts[field],proof}])),
   exclusionReasons:qualification.filter(result=>!result.eligible).map(result=>result.reason)};
 });
 const eligibleCount=rows.filter(row=>row.qualifies).length;
 if(!question && eligibleCount<Math.max(5,template.minAnswers??5))disabledReasons.push('Fewer than the required eligible answers.');
 return {questionText:template.prompt(parameters),templateId,parameters,dataVersion:DATA_VERSION,
  enabled:!!question,questionId:question?.id??null,disabledReasons,
  acceptedCount:acceptedIds.size,eligibleCount,
  accepted:rows.filter(row=>acceptedIds.has(row.id)),
  excluded:rows.filter(row=>!acceptedIds.has(row.id)).map(row=>({...row,exclusionReasons:row.qualifies ? disabledReasons : row.exclusionReasons}))};
}
export function inspectAllAnswerBanks() {
 return questionPool().map(question=>inspectAnswerBank(question.templateId,question.parameters));
}
