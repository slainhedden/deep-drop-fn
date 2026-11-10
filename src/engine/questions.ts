import { uniqueEntities } from './candidates';
import { supportsScope } from './coverage';
import type { Difficulty, GeneratedQuestion, QuestionTemplate } from '../domain/types';
import { entitiesByType } from '../data/entities';
import { DATA_VERSION } from '../data/sources';
import { templates } from '../data/templates';
import { matchesAll } from './predicates';
import { reviewedParametersSupported } from '../data/reviewed-templates';
import { compareSeasons } from '../data/seasons';
import { seededRandom, shuffle } from './random';

export function combinations(template: QuestionTemplate): Record<string, string | number>[] {
  return template.parameters.reduce<Record<string, string | number>[]>((sets, parameter) =>
    sets.flatMap((set) => parameter.values.map((value) => ({ ...set, [parameter.key]: value }))), [{}]).filter(params => (!('from' in params && 'through' in params) || compareSeasons(String(params.from),String(params.through)) <= 0) && (!('first' in params && 'second' in params) || Number(params.first) < Number(params.second))).filter(params=>reviewedParametersSupported(template,params));
}

export function calculateDifficulty(template: QuestionTemplate, answerCount: number): Difficulty {
  if (template.advanced && answerCount <= 7) return 'hard';
  if (answerCount <= 5) return 'hard';
  if (answerCount <= 8 || template.advanced) return 'medium';
  return template.baseDifficulty;
}

export function buildQuestion(template: QuestionTemplate, parameters: Record<string, string | number>): GeneratedQuestion | null {
  if (!reviewedParametersSupported(template,parameters)) return null;
  if (template.status === 'pending' || !supportsScope(template,parameters)) return null;
  if ('from' in parameters && 'through' in parameters && compareSeasons(String(parameters.from), String(parameters.through)) > 0) return null;
  const predicates = template.predicates(parameters);
  const answers = uniqueEntities(entitiesByType(template.answerType).filter((entity) => matchesAll(entity, predicates)));
  const minimum = Math.max(5, template.minAnswers ?? 5);
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
  const candidates=templates.flatMap((template) => combinations(template).map((params) => buildQuestion(template, params)).filter((q): q is GeneratedQuestion => q !== null));
  const templateById=new Map(templates.map(template=>[template.id,template]));
  const seen=new Set<string>();
  return candidates.filter(question=>{
    const family=templateById.get(question.templateId)?.family ?? question.templateId;
    const key=`${question.answerType}:${family}:${[...question.validAnswerIds].sort().join('|')}`;
    if (seen.has(key)) return false;
    seen.add(key);return true;
  });
}

/** Balance knowledge axes as well as answer categories for the daily seven rounds. */
export function questionKnowledgeGroup(question:GeneratedQuestion):string {
 const template=templates.find(template=>template.id===question.templateId);
 if (template?.diversityGroup) return template.diversityGroup;
 const family=template?.family ?? question.templateId;
 if (question.category==='Locations') return /boss|mythic/.test(family) ? 'loot-sources' : /introduction|changes|returns|history|duration/.test(family) ? 'map-history' : 'map-geography';
 if (question.category==='Weapons') return /boss|status/.test(family) ? 'special-gear' : /introduction|availability|returns|changes|carryovers/.test(family) ? 'weapon-history' : 'weapon-classes';
 if (question.category==='Bosses') return 'loot-sources';
 if (question.category==='Skins') return 'outfit-releases';
 if (question.category==='Crossovers') return 'crossover-identities';
 if (question.category==='Items') return /function|health|shield|utility/.test(family) ? 'item-functions' : 'item-history';
 if (question.category==='Vehicles') return 'vehicle-history';
 return question.category==='Events' ? 'live-events' : question.category;
}

export function generateGame(seed: string, roundCount = 10, categories?: string[]): GeneratedQuestion[] {
  if (!Number.isInteger(roundCount) || roundCount < 0) throw new Error('Round count must be a nonnegative integer.');
  const random = seededRandom(seed);
  const remaining = shuffle(questionPool().filter(question => !categories?.length || categories.includes(question.category)), random);
  const result: GeneratedQuestion[] = [];
  const categoryCounts = new Map<string,number>();
  const familyCounts = new Map<string,number>();
  const knowledgeGroups=new Set<string>();
  const diverseDaily=seed.startsWith('storm-rare-daily-') && roundCount===7 && !categories?.length;
  const templateById = new Map(templates.map(template=>[template.id,template]));
  const family = (question:GeneratedQuestion) => templateById.get(question.templateId)?.family ?? question.templateId;
  const overlap = (left:GeneratedQuestion,right:GeneratedQuestion) => {
    if (left.answerType !== right.answerType) return 0;
    const ids = new Set(left.validAnswerIds);
    const common = right.validAnswerIds.filter(id=>ids.has(id)).length;
    return common / (ids.size + right.validAnswerIds.length - common);
  };
  // Prefer fresh categories and families. Never repeat a question or a near-identical
  // answer set; a narrow category can therefore produce fewer than requested rounds.
  while (result.length < roundCount && remaining.length) {
    const admissible=(question:GeneratedQuestion)=>!result.some(previous=>previous.prompt===question.prompt || overlap(previous,question)>=.85);
    const freshKnowledge=diverseDaily && remaining.some(question=>!knowledgeGroups.has(questionKnowledgeGroup(question)) && admissible(question));
    let best = -1;
    let bestCost = Infinity;
    for (let index=0; index<remaining.length; index++) {
      const question = remaining[index];
      if (!admissible(question)) continue;
      if (freshKnowledge && knowledgeGroups.has(questionKnowledgeGroup(question))) continue;
      const cost = (categoryCounts.get(question.category) ?? 0)*100 + (familyCounts.get(family(question)) ?? 0)*10;
      if (cost < bestCost) { best = index; bestCost = cost; }
    }
    if (best < 0) break;
    const [question] = remaining.splice(best,1);
    result.push(question);
    knowledgeGroups.add(questionKnowledgeGroup(question));
    categoryCounts.set(question.category,(categoryCounts.get(question.category) ?? 0)+1);
    familyCounts.set(family(question),(familyCounts.get(family(question)) ?? 0)+1);
  }
  return result;
}

export function dailySeed(date = new Date()): string { return `storm-rare-daily-${date.toISOString().slice(0,10)}`; }
