import { describe,expect,it } from 'vitest';
import { entities, entitiesById, entitiesByType } from '../data/entities';
import { templates } from '../data/templates';
import { historyTemplates } from '../data/history-templates';
import { buildQuestion, combinations, generateGame, questionPool } from './questions';
import { matchesAll } from './predicates';
import { resolveAnswer, suggestionsFor } from './resolve';
import { validateAnswer } from './validation';
import { auditHistoricalEntities } from './audit';

describe('expanded catalog integrity and evidence gates',()=>{
 it('keeps stable IDs and one canonical record per category/name',()=>{
  expect(entitiesById.get('tilted')?.name).toBe('Tilted Towers');
  expect(entitiesById.get('pump-shotgun')?.name).toBe('Pump Shotgun');
  expect(new Set(entities.map(entity=>entity.id)).size).toBe(entities.length);
  expect(new Set(entities.map(entity=>`${entity.type}:${entity.name.toLowerCase()}`)).size).toBe(entities.length);
 });
 it('excludes pending catalog rows from answers and autocomplete',()=>{
  for (const question of questionPool()) for(const id of question.validAnswerIds) expect(matchesAll(entitiesById.get(id)!,question.predicates)).toBe(true);
  expect(suggestionsFor('Fox Floodgate',questionPool().find(question=>question.templateId==='location-catalog')!)).toEqual([]);
  expect(entitiesByType('location').some(entity=>entity.name==='MEGA City')).toBe(true);
 });
 it('does not generate unreversed ranges or duplicate chapter pairs',()=>{
  const range=historyTemplates.find(template=>template.id==='location-introduced-range')!;
  expect(combinations(range).some(parameters=>parameters.from==='C5S1' && parameters.through==='C1S7')).toBe(false);
  const pair=historyTemplates.find(template=>template.id==='location-two-chapters')!;
  expect(combinations(pair).every(parameters=>Number(parameters.first)<Number(parameters.second))).toBe(true);
 });
 it('keeps pending families disabled even if the candidate bank has five answers',()=>{
  const template=historyTemplates.find(template=>template.id==='location-introduced-chapter')!;
  expect(buildQuestion(template,{chapter:1})).toBeNull();
  expect(entitiesByType('location').filter(entity=>matchesAll(entity,template.predicates({chapter:1}),true)).length).toBeGreaterThan(5);
 });
 it('keeps introduction and existence wording attached to separate predicates',()=>{
  const introduction=historyTemplates.find(template=>template.id==='location-introduced-season')!;
  const availability=historyTemplates.find(template=>template.id==='location-available-season')!;
  expect(introduction.prompt({season:'C2S2'})).toContain('first introduced');
  expect(introduction.predicates({season:'C2S2'}).map(predicate=>predicate.operator)).toContain('introducedOnOrBefore');
  expect(availability.prompt({season:'C2S2'})).toContain('appeared during');
  expect(availability.predicates({season:'C2S2'})).toContainEqual({field:'namedPoi',operator:'availableIn',value:'C2S2'});
 });
 it('enforces at least five answers even if a template requests fewer',()=>{
  const template={...templates[0],id:'test-empty',minAnswers:1,predicates:()=>[{field:'id',operator:'eq' as const,value:'no-such-id'}]};
  expect(buildQuestion(template,{})).toBeNull();
 });
 it('validates canonical answers and rejects cross-category answers for every active question',()=>{
  for (const question of questionPool()) {
   expect(question.validAnswerIds.length).toBeGreaterThanOrEqual(5);
   const accepted=entitiesById.get(question.validAnswerIds[0])!;
   const result=validateAnswer(question,accepted.name);
   expect(result.correct,question.id).toBe(true);
   expect(result.points).toBeGreaterThanOrEqual(100);
   expect(result.points).toBeLessThanOrEqual(1000);
   expect(result.frequencySource).toBe('estimated');
   expect(validateAnswer(question,'definitely not a Fortnite answer').correct).toBe(false);
  }
 });
 it('rejects duplicate IDs and missing relationship targets during audit',()=>{
  const entity=structuredClone(entitiesById.get('tilted')!);
  expect(auditHistoricalEntities([entity,entity]).errors).toContain(`Duplicate canonical ID: ${entity.id}`);
  entity.history!.relationships.push({kind:'boss',entityId:'missing',season:'C1S2',sourceIds:['history-c1s2'],status:'pending'});
  expect(auditHistoricalEntities([entity]).errors).toContain(`${entity.id}: invalid boss target missing.`);
 });
 it('detects evidence incorrectly promoted without reviewed sources',()=>{
  const entity=structuredClone(entitiesById.get('location-fox-floodgate')!);
  entity.history!.introduction!.status='verified';
  expect(auditHistoricalEntities([entity]).errors.some(error=>error.includes('unreviewed source'))).toBe(true);
 });
});

describe('contextual aliases and deterministic variety',()=>{
 it('requires question context to disambiguate dusty',()=>{
  const depot=entitiesById.get('dusty-depot')!; const divot=entitiesById.get('dusty-divot')!;
  expect(resolveAnswer('dusty',[depot,divot]).ambiguous).toBe(true);
  expect(resolveAnswer('dusty',[depot]).entity?.id).toBe('dusty-depot');
  expect(resolveAnswer('dusty',[divot]).entity?.id).toBe('dusty-divot');
 });
 it('normalizes apostrophes, punctuation, community abbreviations and casing',()=>{
  expect(resolveAnswer('  MiNiS ',entitiesByType('item')).entity?.id).toBe('mini');
  expect(resolveAnswer('GROTTO',entitiesByType('location')).entity?.id).toBe('grotto');
  expect(resolveAnswer('tac',entitiesByType('weapon')).entity?.id).toBe('tactical-shotgun');
  expect(resolveAnswer('X4',entitiesByType('vehicle')).entity?.id).toBe('stormwing');
  expect(resolveAnswer('B R U T E',entitiesByType('vehicle')).entity?.id).toBe('brute');
 });
 it('keeps the conservative second-best margin when name lengths differ',()=>{
  const base=entitiesById.get('pump-shotgun')!;
  const close={...base,id:'fixture-close',name:'abce',aliases:[]};
  const runnerUp={...base,id:'fixture-runner-up',name:'abcdef',aliases:[]};
  expect(resolveAnswer('abcd',[close,runnerUp]).entity).toBeUndefined();
 });
 it('bounds pathological input before fuzzy matching',()=>{
  expect(resolveAnswer('a'.repeat(10000),entities)).toEqual({});
  expect(suggestionsFor('a'.repeat(10000),entitiesByType('weapon'))).toEqual([]);
 });
 it('produces diverse seven-round games with no repeated or near-identical questions',()=>{
  for (let index=0;index<30;index++) {
   const seed=`history-diversity-${index}`;
   const game=generateGame(seed,7);
   expect(game.map(question=>question.id)).toEqual(generateGame(seed,7).map(question=>question.id));
   expect(game).toHaveLength(7);
   expect(new Set(game.map(question=>question.category)).size).toBeGreaterThanOrEqual(7);
   expect(new Set(game.map(question=>question.id)).size).toBe(7);
  }
 });
 it('does not cycle a narrow bank to fill a long session',()=>{
  const game=generateGame('locations-only',20,['Locations']);
  expect(game.length).toBeGreaterThan(0);
  expect(game.length).toBeLessThan(20);
  expect(new Set(game.map(question=>question.id)).size).toBe(game.length);
 });
});
