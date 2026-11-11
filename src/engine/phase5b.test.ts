import {describe,it,expect} from 'vitest';
import {entities,entitiesById} from '../data/entities';
import {sourceById} from '../data/sources';
import {templates} from '../data/templates';
import {worldRelations} from '../data/world-relations';
import {withheldWorldClaims} from '../data/phase5b-catalog';
import {questionPool,buildQuestion,dailyQuestionPool,generateGame,dailySeed,questionKnowledgeGroup} from './questions';
import {validateAnswer} from './validation';
import {availableIn} from './history';
import {questionQuality} from './quality';
import {isCosmeticQuestion} from './daily-pool';
import {auditHistoricalEntities} from './audit';
const q=(id:string,p:Record<string,string|number>={})=>buildQuestion(templates.find(t=>t.id===id)!,p)!;
const named=(name:string,type?:string)=>entities.find(e=>e.name===name&&(!type||e.type===type))!;
describe('Phase 5B world graph and functional evidence',()=>{
 it('preserves original canonical vehicle IDs and avoids cosmetic or duplicate vehicle imports',()=>{
  for(const name of ['All Terrain Kart','The Baller','Whiplash','Bear'])expect(entities.filter(e=>e.type==='vehicle'&&e.name===name)).toHaveLength(1);
  const seats=q('world-passengers');expect(validateAnswer(seats,'Choppa').correct).toBe(true);expect(validateAnswer(seats,'Driftboard').correct).toBe(false);
  expect(entities.filter(e=>e.type==='vehicle'&&e.cosmetic)).toHaveLength(0);
 });
 it('keeps season/mode provenance and existing identities on every graph endpoint',()=>{
  const keys=new Set<string>();
  for(const r of worldRelations){expect(entitiesById.has(r.subjectId)).toBe(true);expect(entitiesById.has(r.objectId)).toBe(true);expect(['core_br','special_br','br_ltm']).toContain(r.mode);expect(r.sourceIds.length).toBeGreaterThan(0);for(const s of r.sourceIds)expect(sourceById.get(s)?.status).toBe('verified');const key=[r.subjectId,r.kind,r.objectId,r.season??''].join(':');expect(keys.has(key)).toBe(false);keys.add(key);}
 });
 it('proves Mythic drops from encounter records, not possessive names',()=>{
  expect(entities.some(e=>e.type==='boss'&&e.name==='Health (Battle Royale)')).toBe(false);
  expect(named('Daigo','boss').facts.isAiBoss).toBe(true);
  const boss=named('Kit','boss'),gun=named('Kit’s Charge Shotgun','weapon');
  expect(worldRelations.some(r=>r.subjectId===boss.id&&r.objectId===gun.id&&r.kind==='mythicDrop'&&r.season==='C2S3')).toBe(true);
  expect(validateAnswer(q('world-boss-mythic'),'Midas’ Drum Gun').correct).toBe(true);
  expect(validateAnswer(q('world-boss-mythic'),"Deadpool's Dual Hand Cannons").canonicalAnswer).toBe("Deadpool's Hand Cannons");
  expect(entities.filter(e=>e.type==='weapon'&&e.name==="Deadpool's Dual Hand Cannons")).toHaveLength(0);
  expect(validateAnswer(q('world-boss-mythic'),"Spire Guardian's Primal Assault Rifle").correct).toBe(false);
  expect(buildQuestion(templates.find(t=>t.id==='world-boss-loot')!,{})).toBeNull();
  expect(buildQuestion(templates.find(t=>t.id==='world-function-structureDamage')!,{})).toBeNull();
  expect(validateAnswer(q('world-keycard-boss'),'Midas').correct).toBe(true);
 });
 it('separates actual containment from proximity and excludes numerical spawn speculation',()=>{
  const lake=named('Loot Lake','location');expect(worldRelations.some(r=>r.objectId===lake.id&&r.kind==='near'&&r.subjectId===named('Gas Station','feature').id)).toBe(true);
  expect(questionPool().some(t=>/10 fishing barrels|at least.*barrels/i.test(t.prompt))).toBe(false);
  expect(entities.some(e=>e.type==='location'&&e.name.toLowerCase()==='boss')).toBe(false);
  expect(validateAnswer(q('world-food-business'),'Durrr Burger').correct).toBe(true);expect(validateAnswer(q('world-food-business'),'Ballers Pub').correct).toBe(false);
 });
 it('supports conditional fall protection without treating impulse grenades or jetpacks as immunity',()=>{
  const question=q('world-fall-protection');for(const name of ['Shockwave Grenade','Kinetic Blade','Grappler','Shadow Stone'])expect(validateAnswer(question,name).correct).toBe(true);
  for(const name of ['Impulse Grenade','Jetpack'])expect(validateAnswer(question,name).correct).toBe(false);
  expect(validateAnswer(q('world-function-knockback'),'Impulse Grenade').correct).toBe(true);
 });
 it('retains positive chapter evidence without guessing an original introduction or seasonal continuity',()=>{
  const fry=named('Small Fry','item');expect(availableIn(fry,'C2S1')).toBe(true);expect(fry.history?.introduction?.status).not.toBe('verified');
  expect(validateAnswer(q('world-landmark-chapter',{chapter:2}),'The Orchard').correct).toBe(true);
  expect(validateAnswer(q('world-unnamed-chapter',{chapter:1}),'Motel').correct).toBe(true);
  for(const name of ['Med Kit','Bandage'])expect(validateAnswer(q('world-multiple-chapters'),name).correct).toBe(true);
  expect(validateAnswer(q('world-landmark-chapter',{chapter:2}),'Latte Landing').correct).toBe(false);
  expect(withheldWorldClaims.some(c=>c.entityId==='shockwave'&&c.season==='C1S4')).toBe(true);
 });
 it('does not let a pending introduction invalidate an independently verified earlier appearance',()=>{
  const base=named('Impulse Grenade','item');expect(base.history?.introduction?.status).toBe('pending');expect(availableIn(base,'C1S2')).toBe(true);
  expect(auditHistoricalEntities([base]).errors).toEqual([]);
  const copy={...base,history:{...base.history!,introduction:{...base.history!.introduction!,status:'verified' as const}}};
  expect(auditHistoricalEntities([copy]).errors.some(e=>e.includes('appearance precedes'))).toBe(true);
 });
 it('counts independent verified non-cosmetic banks and keeps 120 repeat-free balanced UTC dailies',()=>{
  const daily=dailyQuestionPool();expect(daily.filter(q=>!isCosmeticQuestion(q)).length).toBeGreaterThanOrEqual(85);
  expect(questionPool().every(q=>questionQuality(q).fieldVerifiedAnswers>=10)).toBe(true);
  const recent:string[][]=[];
  for(let d=1;d<=120;d++){const game=generateGame(dailySeed(new Date(Date.UTC(2026,8,d))),7);expect(game).toHaveLength(7);expect(new Set(game.map(questionKnowledgeGroup)).size).toBe(7);expect(game.filter(isCosmeticQuestion).length).toBeLessThanOrEqual(2);const last13=new Set(recent.slice(-13).flat());expect(game.some(q=>last13.has(q.id))).toBe(false);expect(game.every(q=>questionQuality(q).dailyEligible)).toBe(true);recent.push(game.map(q=>q.id));}
 });
});
