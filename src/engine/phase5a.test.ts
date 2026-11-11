import {describe,it,expect} from 'vitest';
import {entities,entitiesById} from '../data/entities';
import research from '../data/research/phase5a.json';
import {templates} from '../data/templates';
import {buildQuestion,questionPool,dailyQuestionPool,generateGame,dailySeed,semanticFamily} from './questions';
import {questionQuality} from './quality';
import {independentDailyPool,semanticOverlap,isCosmeticQuestion} from './daily-pool';
import {contentAudit} from './content-audit';
import {normalizeAnswer} from './normalize';
import {validateAnswer} from './validation';
const question=(id:string,parameters:Record<string,string|number>={})=>buildQuestion(templates.find(t=>t.id===id)!,parameters)!;
describe('Phase 5A source populations and independent rotation',()=>{
 it('uses complete positive Chapter 1/3/4/5 tables with the reviewed Epic landmark correction',()=>{
  for(const chapter of [1,3,4,5]){
   expect(contentAudit().namedByChapter[chapter]).toBe(question('location-chapter',{chapter}).validAnswerIds.length);
   const expected=research.locations.filter(r=>r.chapter===chapter&&r.seasons.some(s=>s!=='OG2023')&&normalizeAnswer(r.name)!==normalizeAnswer("Doom's Courtyard")).map(r=>normalizeAnswer(r.name)).sort();
   expect(question('location-chapter',{chapter}).validAnswerIds.map(id=>normalizeAnswer(entitiesById.get(id)!.name)).sort()).toEqual(expected);
  }
  expect(validateAnswer(question('location-chapter',{chapter:5}),'Doom’s Courtyard').correct).toBe(false);
  expect(validateAnswer(question('location-chapter',{chapter:4}),'Pleasant Park').correct).toBe(false);
  expect(validateAnswer(question('location-throwback-map',{period:'OG2023'}),'Pleasant Park').correct).toBe(true);
 });
 it('includes every reviewed collection identity without promoting introduction history',()=>{
  expect(question('character-collection').validAnswerIds.map(id=>normalizeAnswer(entitiesById.get(id)!.name)).sort()).toEqual([...new Set(research.characters.map(r=>normalizeAnswer(r.name)))].sort());
  for(const row of research.characters)expect(validateAnswer(question('character-collection'),row.name).correct).toBe(true);
  const scoped=entitiesById.get('weapon-scoped-assault-rifle')!;
  expect(scoped.history?.introduction?.status).toBe('pending');
  expect(scoped.factEvidence?.reviewedAmmo?.status).toBe('verified');
 });
 it('preserves weapon classes and canonical cosmetic identities',()=>{
  const miniguns=entities.filter(e=>e.type==='weapon'&&e.name.includes('Minigun'));
  expect(miniguns.every(e=>e.facts.weaponClass!=='assault rifle')).toBe(true);
  const cosmetics=entities.filter(e=>e.cosmetic);
  expect(new Set(cosmetics.map(e=>`${e.cosmetic!.type}:${normalizeAnswer(e.name)}`)).size).toBe(cosmetics.length);
  expect(entities.filter(e=>e.type==='boss'&&['Highcards','Gorgers','Spire Guardians'].includes(e.name))).toHaveLength(0);
 });
 it('counts answer populations rather than wording and rejects near-duplicate Daily banks',()=>{
  const raw=questionPool(),independent=independentDailyPool(raw);
  expect(independent.questions.length).toBeGreaterThanOrEqual(100);
  expect(independent.excluded.some(q=>q.id.includes('ammo=Shells'))).toBe(true);
  for(let i=0;i<independent.questions.length;i++)for(const right of independent.questions.slice(i+1))expect(semanticOverlap(independent.questions[i],right)).toBeLessThan(.85);
  expect(dailyQuestionPool().every(q=>questionQuality(q).fieldVerifiedAnswers>=15)).toBe(true);
  expect(raw.every(q=>questionQuality(q).fieldVerifiedAnswers>=10)).toBe(true);
 });
 it('keeps 120 balanced shared UTC games with no exact repeats inside seven days',()=>{
  const history:string[][]=[];
  for(let d=1;d<=120;d++){
   const date=new Date(Date.UTC(2026,8,d)),game=generateGame(dailySeed(date),7),recent=new Set(history.slice(-6).flat());
   expect(game).toHaveLength(7);
   expect(game.some(q=>recent.has(q.id))).toBe(false);
   expect(game.filter(isCosmeticQuestion).length).toBeLessThanOrEqual(2);
   expect(game.filter(q=>q.category==='Locations').length).toBeGreaterThanOrEqual(1);
   expect(game.filter(q=>q.category==='Locations').length).toBeLessThanOrEqual(2);
   expect(game.some(q=>q.category==='Items')).toBe(true);
   expect(new Set(game.map(semanticFamily)).size).toBe(7);
   history.push(game.map(q=>q.id));
  }
 });
});
