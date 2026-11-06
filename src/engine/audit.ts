import { entities } from '../data/entities';
import { templates } from '../data/templates';
import { normalizeAnswer } from './normalize';
import { questionPool } from './questions';

export interface AuditReport { questions:number; templates:number; errors:string[]; warnings:string[]; answerRange:[number,number] }

export function auditQuestionBank(): AuditReport {
  const questions = questionPool();
  const errors:string[] = [];
  const warnings:string[] = [];
  for (const template of templates) if (!questions.some((question)=>question.templateId === template.id)) errors.push(`Template ${template.id} has no supported parameter combination.`);
  for (const question of questions) {
    if (question.validAnswerIds.length < 5) errors.push(`${question.id} has fewer than five answers.`);
    if (new Set(question.validAnswerIds).size !== question.validAnswerIds.length) errors.push(`${question.id} has duplicate answer IDs.`);
  }
  const names = new Map<string,string>();
  for (const entity of entities) for (const candidate of [entity.name,...entity.aliases.map(alias=>alias.text)]) {
    const normalized = normalizeAnswer(candidate);
    const key=`${entity.type}:${normalized}`;
    const previous = names.get(key);
    if (previous && previous !== entity.id) errors.push(`Ambiguous canonical/alias value: ${candidate}`);
    names.set(key, entity.id);
    if (!entity.sourceIds.length) warnings.push(`${entity.id} has no source record.`);
  }
  const counts = questions.map((question)=>question.validAnswerIds.length);
  return { questions:questions.length, templates:templates.length, errors, warnings, answerRange:[Math.min(...counts),Math.max(...counts)] };
}
