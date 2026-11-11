import {describe,it,expect} from 'vitest';
import type {FortniteEntity,GeneratedQuestion} from '../domain/types';
import {entities,entitiesById} from '../data/entities';
import {questionPool,buildQuestion} from './questions';
import {templates} from '../data/templates';
import {matchesAll} from './predicates';
import {matchesHistory} from './history';
import {suggestionsFor,resolveAnswer} from './resolve';
import {validateAnswer} from './validation';
import {answerCandidates,uniqueEntities} from './candidates';
import {inspectAnswerBank} from './inspector';
const broad=(weaponClass:string)=>questionPool().find(question=>question.templateId==='weapon-class'&&question.parameters.weaponClass===weaponClass)!;
const rifles=broad('assault rifle');

describe('field-level category completeness',()=>{
 it('accepts every independently classified assault rifle without a historical predicate or cap',()=>{
  const verified=entities.filter(entity=>entity.type==='weapon'&&entity.facts.weaponClass==='assault rifle'&&entity.factEvidence?.weaponClass?.status==='verified');
  expect(verified.length).toBeGreaterThanOrEqual(23);
  expect(rifles.predicates).toEqual([{field:'weaponClass',operator:'eq',value:'assault rifle'}]);
  for(const entity of verified)expect(validateAnswer(rifles,entity.name).correct,entity.name).toBe(true);
  expect(rifles.validAnswerIds.length).toBeGreaterThanOrEqual(verified.length);
 });
 it('accepts a classified pending-history record without promoting its timeline',()=>{
  const scoped=entitiesById.get('weapon-scoped-assault-rifle')!;
  expect(scoped.verification).toBe('verified'); // Identity/ammo review does not promote its introduction.
  expect(scoped.factEvidence?.weaponClass?.status).toBe('verified');
  expect(validateAnswer(rifles,'Scoped Assault Rifle').correct).toBe(true);
  expect(scoped.history?.introduction?.status).toBe('pending');
  expect(matchesHistory(scoped,{field:'introduction',operator:'introducedInChapter',value:1})).toBe(false);
 });
 it('continues to reject category candidates without verified classification',()=>{
  expect(entitiesById.get('weapon-mk-alpha-assault-rifle')?.factEvidence?.weaponClass?.status).not.toBe('verified');
  expect(rifles.validAnswerIds).not.toContain('weapon-mk-alpha-assault-rifle');
 });
 it('accepts vaulted weapons and named Mythics in their real classes',()=>{
  for(const name of ['Suppressed Assault Rifle','Tactical Assault Rifle','Overclocked Pulse Rifle','The Foundation’s MK-Seven Assault Rifle'])expect(validateAnswer(rifles,name).correct,name).toBe(true);
  expect(validateAnswer(rifles,'Pump Shotgun').correct).toBe(false);
 });
 it('checks every broad category against all independently reviewed classification facts',()=>{
  const broadIds=['weapon-class','skin-battle-pass','location-catalog','collaboration-group','health-item','shield-item','utility-item','vehicle','live-event','health-and-shield-item'];
  for(const question of questionPool().filter(question=>broadIds.includes(question.templateId))) {
   const verified=entities.filter(entity=>entity.type===question.answerType&&question.predicates.every(predicate=>{
    if(entity.factEvidence?.[predicate.field]?.status!=='verified')return false;
    const actual=entity.facts[predicate.field];
    return predicate.operator==='eq'?actual===predicate.value:Array.isArray(actual)&&actual.includes(predicate.value as never);
   }));
   for(const entity of verified)expect(question.validAnswerIds,`${question.templateId}: ${entity.name}`).toContain(entity.id);
  }
 });
 it('does not use the record-wide status to override pending field evidence',()=>{
  const fixture:FortniteEntity={...entitiesById.get('pump-shotgun')!,verification:'verified',factEvidence:{weaponClass:{status:'pending',sourceIds:['wiki-weapons']}}};
  expect(matchesAll(fixture,[{field:'weaponClass',operator:'eq',value:'shotgun'}])).toBe(false);
 });
});

describe('active-question autocomplete',()=>{
 it('requires meaningful input and returns no more than six canonical entities',()=>{
  expect(suggestionsFor('',rifles)).toEqual([]);expect(suggestionsFor('s',rifles)).toEqual([]);
  expect(suggestionsFor('ar',rifles).length).toBeLessThanOrEqual(6);
 });
 it('offers both eligible Strikers and the eligible tactical variant',()=>{
  expect(suggestionsFor('str',rifles).map(entity=>entity.name)).toEqual(expect.arrayContaining(['Striker AR','Striker Burst Rifle']));
  expect(suggestionsFor('tac',rifles).map(entity=>entity.name)).toContain('Tactical Assault Rifle');
  expect(suggestionsFor('tac',rifles).some(entity=>entity.name==='Tactical Shotgun')).toBe(false);
 });
 it('offers all Havoc matches in a mixed loot pool and restricts narrower questions',()=>{
  const loot=questionPool().find(question=>question.templateId==='reviewed-launch-loot'&&question.parameters.season==='C4S2')!;
  expect(suggestionsFor('hav',loot).map(entity=>entity.name)).toEqual(expect.arrayContaining(['Havoc Pump Shotgun','Havoc Suppressed Assault Rifle']));
  expect(suggestionsFor('hav',rifles).map(entity=>entity.name)).toEqual(['Havoc Suppressed Assault Rifle']);
  const shotguns=suggestionsFor('hav',broad('shotgun'));
  expect(shotguns.map(entity=>entity.name)).toContain('Havoc Pump Shotgun');
  expect(shotguns.every(entity=>entity.facts.weaponClass==='shotgun')).toBe(true);
 });
 it('never suggests a rejected answer, including after switching questions of the same type',()=>{
  for(const question of questionPool()) for(const query of ['ar','tac','hav','str','pump','mid']) for(const entity of suggestionsFor(query,question)) {
   expect(question.validAnswerIds).toContain(entity.id);
   expect(validateAnswer(question,entity.name).correct,`${question.id}: ${entity.name}`).toBe(true);
  }
 });
 it('prioritizes relevance over familiarity',()=>{
  const base=entitiesById.get('pump-shotgun')!;
  const candidates=[{...base,id:'prefix',name:'Stranger Rifle',aliases:[],familiarity:.01},{...base,id:'word',name:'Heavy Stranger Rifle',aliases:[],familiarity:1},{...base,id:'substring',name:'Astral Rifle',aliases:[],familiarity:1}];
  expect(suggestionsFor('str',candidates).map(entity=>entity.id)).toEqual(['prefix','word','substring']);
 });
 it('deduplicates IDs in suggestions, validation candidates and scoring',()=>{
  const repeated={...rifles,validAnswerIds:[...rifles.validAnswerIds,...rifles.validAnswerIds]};
  expect(answerCandidates(repeated)).toHaveLength(rifles.validAnswerIds.length);
  expect(uniqueEntities([entities[0],entities[0]])).toHaveLength(1);
  expect(validateAnswer(repeated,'Striker AR').points).toBe(validateAnswer(rifles,'Striker AR').points);
  const rows=suggestionsFor('str',repeated);expect(new Set(rows.map(row=>row.id)).size).toBe(rows.length);
 });
 it('preserves natural aliases, spelling tolerance and unambiguous word order',()=>{
  for(const [question,input,name] of [[rifles,'scar','Assault Rifle'],[rifles,'tac ar','Tactical Assault Rifle'],[rifles,'rifle assault suppressed','Suppressed Assault Rifle'],[broad('shotgun'),'spas','Pump Shotgun'],[broad('pistol'),'deagle','Hand Cannon'],[broad('sniper rifle'),'heavy sniper','Heavy Sniper Rifle'],[broad('shotgun'),'tactial shotgun','Tactical Shotgun']] as [GeneratedQuestion,string,string][])expect(validateAnswer(question,input).canonicalAnswer).toBe(name);
 });
 it('does not arbitrarily resolve a shared nickname or a word-order collision',()=>{
  const depot=entitiesById.get('dusty-depot')!,divot=entitiesById.get('dusty-divot')!;
  expect(resolveAnswer('dusty',[depot,divot]).ambiguous).toBe(true);
  const one={...depot,id:'one',name:'Alpha Beta Gamma',aliases:[]};const two={...divot,id:'two',name:'Gamma Alpha Beta',aliases:[]};
  expect(resolveAnswer('Beta Alpha Gamma',[one,two]).ambiguous).toBe(true);
 });
 it('prefers an official canonical name to another entity’s contextual nickname',()=>{
  const wick={...entities[0],id:'actual-wick',name:'John Wick',aliases:[]};
  const reaper={...entities[0],id:'reaper',name:'The Reaper',aliases:[{text:'John Wick',kind:'slang' as const,confidence:'contextual' as const}]};
  expect(resolveAnswer('John Wick',[reaper,wick]).entity?.id).toBe('actual-wick');
 });
});

describe('developer inspector',()=>{
 it('reports accepted, excluded and partially verified rifles with exact reasons',()=>{
  const report=inspectAnswerBank('weapon-class',{weaponClass:'assault rifle'});
  expect(report.questionText).toBe('Name a Fortnite assault rifle.');expect(report.acceptedCount).toBe(rifles.validAnswerIds.length);
  expect(report.accepted.find(row=>row.id==='weapon-scoped-assault-rifle')?.recordStatus).toBe('verified');
  expect(report.excluded.find(row=>row.id==='weapon-mk-alpha-assault-rifle')?.exclusionReasons.join(' ')).toContain('missing field-level verification');
  expect(report.excluded.find(row=>row.id==='pump-shotgun')?.exclusionReasons.join(' ')).toContain('does not match');
 });
 it('shows why a question itself cannot be generated',()=>{
  const report=inspectAnswerBank('vehicle-introduced-chapter',{chapter:2});
  expect(report.enabled).toBe(false);expect(report.acceptedCount).toBe(0);expect(report.disabledReasons.join(' ')).toContain('coverage approval');
 });
 it('rejects invalid inspector parameters instead of silently constructing a different question',()=>{
  expect(()=>inspectAnswerBank('weapon-class',{weaponClass:'unknown'})).toThrow('Invalid or missing parameter');
  expect(()=>inspectAnswerBank('unknown',{})).toThrow('Unknown template');
 });
});
