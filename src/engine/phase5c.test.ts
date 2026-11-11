import {describe,it,expect} from 'vitest';
import {entities,entitiesById} from '../data/entities';
import {templates} from '../data/templates';
import {worldRelations} from '../data/world-relations';
import {buildQuestion,questionPool,dailyQuestionPool,generateGame,dailySeed,generatePractice,questionKnowledgeGroup} from './questions';
import {validateAnswer} from './validation';
import {questionEra,eraPreferenceCost} from './eras';
import {questionQuality} from './quality';
import {normalizeAnswer} from './normalize';
import research from '../data/research/phase5c.json';
const q=(id:string,p:Record<string,string|number>={})=>buildQuestion(templates.find(t=>t.id===id)!,p)!;
const entity=(name:string)=>entities.find(e=>e.name===name&&e.type!=='skin'&&e.type!=='cosmetic')!;
describe('Phase 5C historical gameplay and editorial eras',()=>{
 it('reconciles every current equipment-index candidate without automatically importing modes or variants',()=>{
  const gameplay=entities.filter(e=>['item','weapon','vehicle','feature'].includes(e.type));
  const known=new Set(gameplay.flatMap(e=>[e.name,...e.aliases.map(a=>a.text)]).map(normalizeAnswer));
  for(const r of research.externalItems.filter(r=>!r.exclusion))expect(known.has(normalizeAnswer(r.name)),r.name).toBe(true);
  expect(entities.filter(e=>e.name==='Explosive Batarang')).toHaveLength(1);
  expect(entity('Explosive Batarang').history?.introduction?.season).toBe('C1SX');
  expect(validateAnswer(q('throwable-general'),'Explosive Batarang').correct).toBe(true);
 });
 it('accepts Overdrive in all documented functional banks with conditional launch immunity',()=>{
  for(const id of ['throwable-general','launch-general','rotation-general','world-function-knockback','world-function-speed','world-fall-protection'])expect(validateAnswer(q(id),'Overdrive Grenade').correct,id).toBe(true);
  const e=entity('Overdrive Grenade');expect(e.history?.introduction?.season).toBe('C7S2');
  expect(e.factEvidence?.['function:fallProtection'].note).toMatch(/until landing/);
  expect(worldRelations.some(r=>r.subjectId===e.id&&r.kind==='providesFunction'&&r.season==='C7S2'&&r.conditions?.includes('until landing'))).toBe(true);
  expect(e.facts['function:fireRate']).not.toBe(true);
 });
 it('separates historical LTMs from Creative, ranked and other spinoffs, retaining official aliases',()=>{
  const modes=q('nostalgia-ltm');
  for(const name of ['50v50','Sneaky Silencers',"Wick's Bounty",'Demon Rush','Team Rumble','Trios',"Bugha's Late Game",'Late Game Arena'])expect(validateAnswer(modes,name).correct,name).toBe(true);
  for(const name of ['Battle Royale','Zero Build','Crown Jam','The Combine','Prop Hunt','Blitz Royale'])expect(validateAnswer(modes,name).correct,name).toBe(false);
  expect(buildQuestion(templates.find(t=>t.id==='nostalgia-large-team-ltm')!,{})).toBeNull();
  expect(entity('Team Rumble').facts.modeKind).toBe('permanent_former_ltm');
  expect(entities.filter(e=>e.type==='feature'&&e.name==='Demon Rush')).toHaveLength(0);
  expect(worldRelations.some(r=>r.subjectId===entity('50v50').id&&r.kind==='featuresMechanic'&&r.mode==='br_ltm')).toBe(true);
 });
 it('keeps wildlife separate from outfits, ambient animals and hireable humanoid NPCs',()=>{
  const wildlife=q('nostalgia-wildlife');
  for(const name of ['Raptor','Wolf','Boar','Loot Shark','Klombo','Sprites','Crows','Fireflies','Water Sprite','Supply Llama'])expect(validateAnswer(wildlife,name).correct,name).toBe(true);
  for(const name of ['Doggo','Seagull','Moth','Peely'])expect(validateAnswer(wildlife,name).correct,name).toBe(false);
  const shark=entity('Loot Shark');expect(shark.facts.supportsControlledRiding).toBe(true);expect(shark.facts.canBeTamed).not.toBe(true);
  expect(wildlife.validAnswerIds.map(id=>entitiesById.get(id)!.type)).not.toContain('skin');
 });
 it('preserves POI/landmark distinctions, businesses, encounter evidence and unknown launch dates',()=>{
  expect(validateAnswer(q('world-landmark-chapter',{chapter:2}),'The Orchard').correct).toBe(true);
  expect(validateAnswer(q('world-unnamed-chapter',{chapter:1}),'Motel').correct).toBe(true);
  expect(validateAnswer(q('nostalgia-retail'),'NOMS').correct).toBe(true);
  expect(entity('Overdrive Grenade').history?.introduction?.timing).toBeUndefined();
  expect(entities.filter(e=>e.type==='container')).toHaveLength(77);
  expect(entity('Chest').facts.containerIntroductionChapters).toEqual(['1']);
  expect(worldRelations.some(r=>r.kind==='businessAt'&&r.subjectId===entity('Noms').id)).toBe(true);
  expect(worldRelations.some(r=>r.kind==='mythicDrop')).toBe(true);
  expect(worldRelations.filter(r=>r.kind==='eventTransforms')).toHaveLength(4);
  expect(worldRelations.filter(r=>r.kind==='eventAt').length).toBeGreaterThan(4);
  expect(questionPool().some(q=>/at least.*barrels/.test(q.prompt))).toBe(false);
 });
 it('keeps exact full-name matching unambiguous across typed equipment identities',()=>{
  for(const question of questionPool().filter(q=>q.templateId.startsWith('nostalgia-'))){
   const names=question.validAnswerIds.map(id=>normalizeAnswer(entitiesById.get(id)!.name));expect(new Set(names).size).toBe(names.length);
   for(const id of question.validAnswerIds)expect(validateAnswer(question,entitiesById.get(id)!.name).correct,question.prompt+' '+id).toBe(true);
   expect(question.prompt).not.toMatch(/v\d+\.\d+|c\ds\d/i);
  }
 });
 it('uses prompt scope for editorial eras and preserves deterministic seven-group UTC games',()=>{
  expect(questionEra(q('character-chapter',{chapter:7}))).toBe('recent');
  expect(questionEra(q('character-chapter',{chapter:3}))).toBe('middle');
  expect(questionEra(q('nostalgia-event-era',{era:'classic'}))).toBe('classic');
  expect(questionEra(q('weapon-general'))).toBe('cross-era');
  const cross=q('weapon-general');expect(eraPreferenceCost([cross,cross,cross],cross)).toBeGreaterThan(0);
  let recent=0,historical=0;
  for(let d=1;d<=120;d++){
   const seed=dailySeed(new Date(Date.UTC(2026,8,d))),game=generateGame(seed,7);
   expect(game).toHaveLength(7);expect(new Set(game.map(questionKnowledgeGroup)).size).toBe(7);
   expect(game.map(q=>q.id)).toEqual(generateGame(seed,7).map(q=>q.id));
   expect(game.every(q=>questionQuality(q).fieldVerifiedAnswers>=15)).toBe(true);
   recent+=game.filter(q=>questionEra(q)==='recent').length;historical+=game.filter(q=>['classic','middle'].includes(questionEra(q))).length;
  }
  // A no-preference trial yielded 88 recent rounds; retain a measurable improvement.
  expect(recent).toBeGreaterThan(100);expect(historical).toBeGreaterThan(120);
  expect(dailyQuestionPool().length).toBeGreaterThanOrEqual(165);
 });
 it('retains Unlimited filters and recent-question avoidance for the expanded Events category',()=>{
  const first=generatePractice('nostalgia-practice',3,['Events']);
  expect(first.every(q=>q.category==='Events')).toBe(true);
  const second=generatePractice('nostalgia-practice',3,['Events'],first.map(q=>q.id));
  expect(second.every(q=>!first.some(p=>p.id===q.id))).toBe(true);
 });
});
