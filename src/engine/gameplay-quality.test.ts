import {describe,it,expect} from 'vitest';
import {entities,entitiesById} from '../data/entities';
import {templates} from '../data/templates';
import {buildQuestion,dailySeed,generateGame,questionKnowledgeGroup,questionPool} from './questions';
import {questionQuality,qualitySummary} from './quality';
import {matchesHistory} from './history';
import {auditHistoricalEntities} from './audit';
import {suggestionsFor} from './resolve';
import {validateAnswer} from './validation';
const byName=(name:string)=>entities.find(e=>e.name===name)!;
const q=(id:string)=>questionPool({expert:true}).find(q=>q.templateId===id)!;
describe('reviewed gameplay classifications and reusable loot relationships',()=>{
 it('accepts named Mythics and evolving rarity weapons without creating rarity-only entities',()=>{
  for(const name of ['Midas’ Drum Gun','Kit’s Charge Shotgun','Infinity Blade','EvoChrome Shotgun'])expect(validateAnswer(q('weapon-mythic-version'),name).correct).toBe(true);
  expect(entities.filter(e=>e.name==='EvoChrome Shotgun')).toHaveLength(1);
  expect(byName('Kit’s Charge Shotgun').history!.introduction!.status).toBe('pending');
  expect(validateAnswer(q('weapon-mythic-version'),'Ocean’s Bottomless Chug Jug').correct).toBe(false);
 });
 it('keeps Exotic classification separate from Mythic',()=>{
  expect(validateAnswer(q('weapon-exotic-class'),'The Dub').correct).toBe(true);
  expect(validateAnswer(q('weapon-exotic-class'),'Infinity Blade').correct).toBe(false);
 });
 it('deduplicates standard container names and preserves historical containers',()=>{
  const bank=q('loot-container');
  expect(validateAnswer(bank,'Standard Chest').canonicalAnswer).toBe('Chest');
  expect(validateAnswer(bank,'Treasure Chest').canonicalAnswer).toBe('Buried Treasure Chest');
  expect(validateAnswer(bank,'Exotic Holo-Chest').canonicalAnswer).toBe('Holo-Chest');
  expect(validateAnswer(bank,'Chrome Chest').correct).toBe(true);
  expect(validateAnswer(bank,'Rare Chest').correct).toBe(true); // Explicitly reviewed in Phase 4B.
 });
 it('uses ammo classes and excludes arbitrary generic Ammo and unrelated materials',()=>{
  const bank=q('ammunition-class');
  expect(validateAnswer(bank,'Light Bullets').canonicalAnswer).toBe('Light Ammo');
  expect(validateAnswer(bank,'Ammo').correct).toBe(false);
  expect(validateAnswer(bank,'Wood').correct).toBe(false);
  expect(byName('Stone').aliases.some(a=>a.text==='Brick')).toBe(true);
 });
 it('represents verified drops, container sources and POI sources without inventing timelines',()=>{
  const havoc=byName('Havoc Suppressed Assault Rifle');
  expect(matchesHistory(havoc,{field:'droppedBy',operator:'relatedTo',value:byName('Highcard').id})).toBe(true);
  expect(matchesHistory(byName('Infinity Blade'),{field:'obtainableAt',operator:'relatedTo',value:byName('Polar Peak').id})).toBe(true);
  expect(matchesHistory(byName('Shadow Tracker'),{field:'foundIn',operator:'relatedTo',value:byName('Holo-Chest').id})).toBe(true);
  expect(buildQuestion(templates.find(t=>t.id==='marauder-drops')!,{})).toBeNull();
  expect(byName('Marauder').history!.relationships).toEqual([]);
 });
 it('does not move a verified NPC drop across seasons or faction targets across types',()=>{
  const rifle=byName('Havoc Suppressed Assault Rifle');const boss=byName('Highcard');
  expect(matchesHistory(rifle,{field:'droppedBy',operator:'relatedTo',value:boss.id,season:'C2S3'})).toBe(false);
  expect(matchesHistory(rifle,{field:'droppedBy',operator:'relatedTo',value:boss.id,season:'C4S2'})).toBe(true);
  expect(matchesHistory(byName('MK-Seven Assault Rifle'),{field:'faction',operator:'relatedTo',value:byName('The Seven').id,season:'C3S1'})).toBe(true);
 });
 it('rejects a loot relationship pointing to the wrong target type',()=>{
  const copy=structuredClone(byName('Infinity Blade'));
  copy.history!.relationships=[{kind:'droppedBy',entityId:byName('Polar Peak').id,season:'C1S7',status:'verified',sourceIds:['epic-patch-v7-01']}];
  expect(auditHistoricalEntities([copy,byName('Polar Peak')]).errors).toContain(`${copy.id}: droppedBy target must be a boss or NPC.`);
 });
 it('accepts both weapon and item mobility answers without broadening unrelated banks',()=>{
  const mobility=q('mobility-equipment');
  expect(validateAnswer(mobility,'Kinetic Blade').correct).toBe(true);
  expect(validateAnswer(mobility,'Rift-To-Go').correct).toBe(true);
  expect(validateAnswer(mobility,'Motorboat').correct).toBe(false);
  for(const suggestion of suggestionsFor('kin',mobility))expect(validateAnswer(mobility,suggestion.name).correct).toBe(true);
 });
 it('does not reveal rare possibilities from vague two-letter input',()=>{
  expect(suggestionsFor('ki',q('weapon-general'))).toEqual([]);
  expect(suggestionsFor('kin',q('weapon-general')).length).toBeGreaterThan(0);
 });
});
describe('question quality and accessible deterministic dailies',()=>{
 it('reports every active question and separates legacy from reviewed fields',()=>{
  const pool=questionPool(),summary=qualitySummary(pool);
  expect(summary.questions).toHaveLength(pool.length);
  expect(Object.values(summary.distribution).reduce((n,b)=>n+b.count,0)).toBe(pool.length);
  expect(questionQuality(q('crossover-general')).fieldVerifiedAnswers).toBeGreaterThanOrEqual(15); // Exact outfit identities now corroborate this field; unknown franchise labels stay unreviewed.
  for(const row of summary.questions)expect(row.fieldVerifiedAnswers).toBeLessThanOrEqual(row.acceptedAnswers);
 });
 it('does not make large unrecognizable or season-specific questions daily eligible',()=>{
  const base=q('weapon-general');
  const obscure=entities.filter(e=>e.familiarity<.6).slice(0,40).map(e=>e.id);
  expect(questionQuality({...base,validAnswerIds:obscure}).dailyEligible).toBe(false);
  expect(questionQuality({...base,parameters:{season:'C2S3'},templateId:'weapon-season',advanced:false}).dailyEligible).toBe(false);
 });
 it('selects five large banks, seven knowledge groups and no repeated weapon topic across 120 days',()=>{
  for(let d=1;d<=120;d++){
   const seed=dailySeed(new Date(Date.UTC(2026,8,d)));const game=generateGame(seed,7);
   expect(game).toHaveLength(7);
   expect(game.filter(q=>questionQuality(q).fieldVerifiedAnswers>=20).length).toBeGreaterThanOrEqual(5);
   expect(new Set(game.map(questionKnowledgeGroup)).size).toBe(7);
   expect(new Set(game.map(q=>q.id)).size).toBe(7);
   expect(game.filter(q=>q.category==='Weapons').length).toBeLessThanOrEqual(1);
   expect(game.every(q=>questionQuality(q).fieldVerifiedAnswers>=15)).toBe(true);
   expect(game.every(q=>questionQuality(q).dailyEligible)).toBe(true);
   expect(game.map(q=>q.id)).toEqual(generateGame(seed,7).map(q=>q.id));
  }
 });
 it('retains specialized questions in unlimited practice',()=>{
  expect(questionPool().some(q=>!questionQuality(q).dailyEligible)).toBe(true);
  const practice=generateGame('practice-specialized',7,['Weapons']);
  expect(practice.every(q=>q.category==='Weapons')).toBe(true);
 });
 it('preserves scoring for every newly enabled answer bank',()=>{
  for(const question of questionPool().filter(q=>/equipment|mythic-version|container|ammunition|foraged/.test(q.templateId))){
   for(const id of question.validAnswerIds){const result=validateAnswer(question,entitiesById.get(id)!.name);expect(result.correct).toBe(true);expect(result.points).toBeGreaterThanOrEqual(100);expect(result.points).toBeLessThanOrEqual(1000);}
  }
 });
});
