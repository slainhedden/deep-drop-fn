import type { Difficulty, GeneratedQuestion, QuestionTemplate } from '../domain/types';
import { entitiesByType } from '../data/entities';
import { DATA_VERSION } from '../data/sources';
import { templates } from '../data/templates';
import { matchesAll } from './predicates';
import { seededRandom, shuffle } from './random';

function combinations(template: QuestionTemplate): Record<string, string | number>[] {
  return template.parameters.reduce<Record<string, string | number>[]>((sets, parameter) =>
    sets.flatMap((set) => parameter.values.map((value) => ({ ...set, [parameter.key]: value }))), [{}]);
}

export function calculateDifficulty(template: QuestionTemplate, answerCount: number): Difficulty {
  if (template.advanced && answerCount <= 7) return 'hard';
  if (answerCount <= 5) return 'hard';
  if (answerCount <= 8 || template.advanced) return 'medium';
  return template.baseDifficulty;
}

export function buildQuestion(template: QuestionTemplate, parameters: Record<string, string | number>): GeneratedQuestion | null {
  const predicates = template.predicates(parameters);
  const answers = entitiesByType(template.answerType).filter((entity) => matchesAll(entity, predicates));
  const minimum = template.minAnswers ?? (template.advanced ? 5 : 5);
  if (answers.length < minimum) return null;
  const parameterKey = Object.entries(parameters).map(([key,value])=>`${key}=${value}`).join('&') || 'all';
  return {
    id:`${template.id}:${parameterKey}:${DATA_VERSION}`,
    templateId:template.id,
    category:template.category,
    answerType:template.answerType,
    prompt:template.prompt(parameters),
    parameters,
    predicates,
    validAnswerIds:answers.map((answer)=>answer.id),
    difficulty:calculateDifficulty(template, answers.length),
    advanced:Boolean(template.advanced),
    dataVersion:DATA_VERSION,
  };
}

export function questionPool(): GeneratedQuestion[] {
  return templates.flatMap((template) => combinations(template).map((params) => buildQuestion(template, params)).filter((q): q is GeneratedQuestion => q !== null));
}

export function generateGame(seed: string, roundCount = 10, categories?: string[]): GeneratedQuestion[] {
  const eligible = questionPool().filter((question) => !categories?.length || categories.includes(question.category));
  const random = seededRandom(seed);
  const shuffled = shuffle(eligible, random);
  if (!shuffled.length) return [];
  const result: GeneratedQuestion[] = [];
  for (let i = 0; i < roundCount; i += 1) result.push(shuffled[i % shuffled.length]);
  return result;
}

export function dailySeed(date = new Date()): string { return `storm-rare-daily-${date.toISOString().slice(0,10)}`; }
