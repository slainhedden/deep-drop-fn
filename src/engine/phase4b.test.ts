import {describe,it,expect,beforeEach} from 'vitest';
import {entities,entitiesById} from '../data/entities';
import {templates} from '../data/templates';
import {buildQuestion,questionPool,generateGame,generatePractice,dailySeed,semanticFamily} from './questions';
import {questionQuality,qualitySummary} from './quality';
import {validateAnswer} from './validation';
import {suggestionsFor} from './resolve';
import {estimatedFrequency} from './scoring';
import {loadPracticeHistory,rememberPracticeQuestion} from '../storage/practice';
import {updateRegistry} from '../data/update-registry';
const q=(id:string,params?:Record<string,string|number>)=>params?buildQuestion(templates.find(t=>t.id===id)!,params)!:questionPool().find(q=>q.templateId===id)!;
const entity=(name:string,type?:string)=>entities.find(e=>e.name===name&&(!type||e.type===type))!;
describe('natural broad gameplay banks',()=>{
 it('uses shared verified movement attributes across items, weapons and vehicles',()=>{
  const rotation=q('rotation-general');
  for(const name of ['Shockwave Grenade','Grapple Glove','Crash Pad','Kinetic Blade','Mechanical Shockwave Bow','Motorboat','Choppa','Driftboard'])expect(validateAnswer(rotation,name).correct,name).toBe(true);
  expect(validateAnswer(rotation,'Peely').correct).toBe(false);
  expect(validateAnswer(rotation,'Shockwave Grenade').answerId).toBe(validateAnswer(q('throwable-general'),'Shockwave Grenade').answerId);
  expect(validateAnswer(rotation,'Motorboat').answerId).not.toBe(validateAnswer(q('cosmetic-outfit'),'Peely').answerId);
 });
 it('includes familiar healing answers without relying on legacy labels',()=>{
  for(const name of ['Med Kit','Bandage','Shield Potion','Small Shield Potion','Chug Jug','Pizza Slice','Cozy Campfire'])expect(validateAnswer(q('restorative-general'),name).correct,name).toBe(true);
 });
 it('resolves reviewed container aliases and meaningful variants without counting reskins twice',()=>{
  const bank=q('loot-container');
  for(const name of ['Rare Chest','Large Ammo Box','GHOST Chest','SHADOW Chest','Produce Box','Cooler','Ice Machine','Safe','Oathbound Chest','Stark Industries Chest','Imperial Chest'])expect(validateAnswer(bank,name).correct,name).toBe(true);
  expect(validateAnswer(bank,'Freezer').answerId).toBe(validateAnswer(bank,'Ice Machine').answerId);
  expect(validateAnswer(bank,'Seven Chest').answerId).toBe(validateAnswer(bank,'Seven Supply Chest').answerId);
  expect(validateAnswer(bank,'Exotic Holo-Chest').answerId).toBe(validateAnswer(bank,'Holo-Chest').answerId);
  expect(validateAnswer(bank,'Extraction Chest').correct).toBe(false);
  expect(validateAnswer(bank,'Star').correct).toBe(false);
 });
 it('uses reviewed season/date mappings without expanding a patch snapshot to a whole season',()=>{
  const snapshot=q('location-reviewed-map',{version:'41.20'});
  expect(snapshot.prompt).toContain('Chapter 7 Season 3');expect(snapshot.prompt).toContain('July 16 2026');
  expect(snapshot.validAnswerIds).toHaveLength(13);
  expect(updateRegistry.get('43.00')?.season).toBe('C7TREASURE2026');
  for(const question of questionPool({expert:true}))expect(question.prompt).not.toMatch(/\bv\d+[.-]\d+|map snapshot|historical update observation/i);
  expect(qualitySummary(questionPool()).wordingProblems).toEqual([]);
 });
});
describe('cosmetic identity and independent acquisition fields',()=>{
 it('keeps curated IDs, reconciles API duplicates, and does not import styles as separate answers',()=>{
  expect(entities.filter(e=>e.type==='skin'&&e.name==='Peely')).toHaveLength(1);
  expect(entity('Peely','skin').cosmetic?.externalIds.length).toBeGreaterThan(1);
  expect(entity('Peely','skin').cosmetic?.catalogAddedAt).toBeTruthy();
  expect(entity('Peely','skin').cosmetic?.releaseDate).toBeUndefined();
  const sentinels=entities.filter(e=>e.type==='cosmetic'&&e.name==='Sentinel');
  expect(new Set(sentinels.map(e=>e.cosmetic?.type)).size).toBe(sentinels.length);
  expect(sentinels.some(e=>e.cosmetic?.type==='glider')).toBe(true);
  for(const e of entities.filter(e=>e.type==='skin'&&e.factEvidence?.acquisitionMethod?.status==='verified'&&['battle_pass','og_pass'].includes(String(e.facts.acquisitionMethod))))expect(validateAnswer(q('cosmetic-outfit'),e.name).correct,e.name).toBe(true);
  expect(new Set(entities.map(e=>e.id)).size).toBe(entities.length);
 });
 it('corroborates crossover existence through exact outfit identities',()=>{
  const crossover=q('crossover-general');expect(questionQuality(crossover).fieldVerifiedAnswers).toBeGreaterThanOrEqual(15);
  for(const name of ['Thor','Master Chief','Kratos'])expect(validateAnswer(crossover,name).correct,name).toBe(true);
 });
 it('distinguishes historical cosmetic rarity, series and answer familiarity',()=>{
  expect(validateAnswer(q('skin-historical-rarity',{rarity:'uncommon'}),'Aura').correct).toBe(true);
  expect(validateAnswer(q('skin-historical-rarity',{rarity:'uncommon'}),'Midas').correct).toBe(false);
  expect(validateAnswer(q('skin-historical-rarity',{rarity:'epic'}),'Midas').correct).toBe(false);
  expect(entity('Midas','skin').facts.historicalCosmeticRarity).toBe('legendary');
  expect(entity('Aura','skin').familiarity).toBeGreaterThan(.6);
 });
 it('requires shop evidence and preserves Battle Pass and OG Pass distinctions',()=>{
  expect(validateAnswer(q('skin-item-shop'),'Fishstick').correct).toBe(true);
  expect(validateAnswer(q('skin-item-shop'),'Peely').correct).toBe(false);
  expect(validateAnswer(q('skin-pass-chapter',{chapter:2}),'Midas').correct).toBe(true);
  expect(validateAnswer(q('skin-pass-chapter',{chapter:2}),'Fishstick').correct).toBe(false);
  expect(validateAnswer(q('skin-pass-chapter',{chapter:2}),'Undercover Skye').correct).toBe(false);
  expect(entity('Undercover Skye','skin').facts.cosmeticSeasonId).toBe('REMIX2024');
  expect(entity('Homer Simpson','skin').facts.cosmeticSeasonId).toBe('C6SIMPSONS2025');
  expect(validateAnswer(q('skin-crossover-series',{series:'Marvel Series'}),'Captain America').correct).toBe(true);
  expect(entity('Spectra Knight','skin').facts.acquisitionMethod).toBe('og_pass');
  expect(entity('Spectra Knight','skin').facts.isBattlePassCosmetic).not.toBe(true);
 });
 it('records typed set/bundle membership independently and only named event rewards',()=>{
  const peely=entity('Peely','skin');
  expect(peely.cosmetic?.memberships.some(m=>m.kind==='set'&&m.name==='Banana Bunch')).toBe(true);
  expect(peely.cosmetic?.memberships.some(m=>m.kind==='bundle')).toBe(false);
  const bundled=entities.filter(e=>e.cosmetic?.memberships.some(m=>m.kind==='bundle'));
  expect(bundled.length).toBeGreaterThan(30);
  expect(bundled.every(e=>e.cosmetic!.memberships.filter(m=>m.kind==='bundle').every(m=>m.sourceId==='fnapi-shop-2026-11-10'))).toBe(true);
  const winter=q('winterfest-presents');
  expect(validateAnswer(winter,'Polar Peely').correct).toBe(true);
  expect(validateAnswer(winter,'Peely').correct).toBe(false);
  expect(validateAnswer(winter,'Nog Ops').correct).toBe(false);
  expect(winter.validAnswerIds).toHaveLength(31);
 });
 it('validates exact imported names and limits autocomplete to the active bank',()=>{
  for(const question of questionPool().filter(q=>/^cosmetic-(outfit|pickaxe|emote|glider|backpack|contrail|loadingscreen|music|spray|emoji|wrap)$/.test(q.templateId)))for(const id of question.validAnswerIds){const e=entitiesById.get(id)!;expect(validateAnswer(question,e.name).correct,`${question.templateId}: ${e.name}`).toBe(true);}
  const pickaxes=q('cosmetic-pickaxe');
  for(const name of ['Star Wand','Reaper','Ice Breaker'])expect(validateAnswer(pickaxes,name).correct,name).toBe(true);
  expect(suggestionsFor('sta',pickaxes).every(e=>e.facts.cosmeticType==='pickaxe')).toBe(true);
  expect(validateAnswer(pickaxes,'Fishstick').correct).toBe(false);
  const skins=q('cosmetic-outfit'),bank=skins.validAnswerIds.map(id=>entitiesById.get(id)!);
  const familiar=entity('Peely','skin'),obscure=bank.find(e=>e.familiarity<.4)!;
  expect(estimatedFrequency(familiar,bank)).toBeGreaterThan(estimatedFrequency(obscure,bank));
  expect(validateAnswer(skins,familiar.name).points).toBeLessThan(validateAnswer(skins,obscure.name).points);
 });
});
describe('normal and archived thresholds and deterministic repetition',()=>{
 it('applies verified minimums after predicate evaluation and keeps narrow research in the Expert archive',()=>{
  for(const question of questionPool())expect(questionQuality(question).fieldVerifiedAnswers).toBeGreaterThanOrEqual(10);
  expect(questionPool().some(q=>q.templateId==='ammunition-class')).toBe(false);
  expect(questionPool({expert:true}).find(q=>q.templateId==='ammunition-class')?.validAnswerIds).toHaveLength(5);
 });
 it('keeps daily minimums, broad rounds and repeat avoidance independent of local history',()=>{
  let previous:string[]=[];
  for(let d=1;d<=45;d++){
   const seed=dailySeed(new Date(Date.UTC(2026,8,d))),game=generateGame(seed,7);
   expect(game).toHaveLength(7);
   expect(game.every(q=>questionQuality(q).fieldVerifiedAnswers>=15)).toBe(true);
   expect(game.filter(q=>questionQuality(q).fieldVerifiedAnswers>=20).length).toBeGreaterThanOrEqual(5);
   expect(new Set(game.map(semanticFamily)).size).toBe(7);
   expect(game.filter(q=>previous.includes(q.id))).toHaveLength(0);
   expect(generateGame(seed,7).map(q=>q.id)).toEqual(game.map(q=>q.id));previous=game.map(q=>q.id);
  }
  const early=dailySeed(new Date(Date.UTC(2026,7,2)));
  expect(generateGame(early,7).map(q=>q.id)).toEqual(generateGame(early,7).map(q=>q.id));
 });
 it('exhausts practice exclusions gracefully and preserves category filters',()=>{
  const a=generatePractice('one',7),b=generatePractice('two',7,undefined,a.map(q=>q.id));
  expect(b.some(q=>a.some(p=>p.id===q.id))).toBe(false);
  const all=questionPool().filter(q=>q.category==='Containers');
  const reset=generatePractice('reset',7,['Containers'],all.map(q=>q.id));
  expect(reset.length).toBeGreaterThan(0);expect(reset.every(q=>q.category==='Containers')).toBe(true);
  const nearlyAll=questionPool().slice(1).map(q=>q.id);
  expect(generatePractice('partial-reset',7,undefined,nearlyAll)).toHaveLength(7);
 });
});
describe('local practice persistence',()=>{
 beforeEach(()=>localStorage.clear());
 it('persists encountered IDs without modifying statistics and tolerates bad data',()=>{
  rememberPracticeQuestion('one');rememberPracticeQuestion('two');rememberPracticeQuestion('one');
  expect(loadPracticeHistory()).toEqual(['two','one']);
  localStorage.setItem('deep-drop-practice-history-v1','{}');expect(loadPracticeHistory()).toEqual([]);
 });
});
