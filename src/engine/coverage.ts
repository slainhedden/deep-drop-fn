import type { QuestionTemplate } from '../domain/types';

/** Coverage approval is separate from the five-answer minimum. */
export function supportsScope(template:QuestionTemplate,parameters:Record<string,string|number>):boolean {
 const approved=template.coverage?.parameters;
 return !approved || approved.some(scope=>Object.entries(scope).every(([key,value])=>parameters[key]===value));
}
