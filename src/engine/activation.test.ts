import { describe,it,expect } from 'vitest';
import { entities,entitiesById } from '../data/entities';
import { templates } from '../data/templates';
import { buildQuestion,dailySeed,generateGame,questionKnowledgeGroup } from './questions';
import { availableIn,availabilityAtUpdate,matchesHistory } from './history';
import { auditHistoricalEntities,auditQuestionBank } from './audit';
import { validateAnswer } from './validation';
import { supportsScope } from './coverage';

const entity=(name:string)=>entities.find(entity=>entity.name===name)!;
const template=(id:string)=>templates.find(template=>template.id===id)!;
const names=(id:string,parameters:Record<string,string|number>)=>buildQuestion(template(id),parameters,{expert:true})!.validAnswerIds.map(id=>entitiesById.get(id)!.name).sort();

describe('approved historical scopes',()=>{
 it('has the complete original Seasons 7–8 named-POI introduction set',()=>{
  expect(names('location-introduced-range',{from:'C1S7',through:'C1S8'})).toEqual(['Frosty Flights','Happy Hamlet','Lazy Lagoon','Polar Peak','Sunny Steps','The Block'].sort());
 });
 it('does not activate an unreviewed range just because it has five matches',()=>{
  const range=template('location-introduced-range');
  expect(supportsScope(range,{from:'C1S7',through:'C1SX'})).toBe(false);
  expect(buildQuestion(range,{from:'C1S7',through:'C1SX'})).toBeNull();
  expect(buildQuestion(range,{from:'C1S4',through:'C1S8'})).toBeNull();
 });
 it('does not mutate shared range parameters on unrelated templates',()=>{
  expect(template('location-introduced-range').parameters.find(parameter=>parameter.key==='through')!.values).toContain('C1S8');
  expect(template('weapon-introduced-range').parameters.find(parameter=>parameter.key==='through')!.values).not.toContain('C1S8');
 });
 it('uses all eight original Chapter 1 player-operated vehicle introductions',()=>{
  expect(names('vehicle-introduced-chapter',{chapter:1})).toEqual(['Shopping Cart','All Terrain Kart','Quadcrasher','X-4 Stormwing','Driftboard','Pirate Cannon','The Baller','B.R.U.T.E.'].sort());
  expect(buildQuestion(template('vehicle-introduced-chapter'),{chapter:2})).toBeNull();
 });
 it('bounds OG questions to the five named mentions instead of claiming the full OG map',()=>{
  const question=buildQuestion(template('location-return-og'),{},{expert:true})!;
  expect(question.prompt).toContain('announcement');
  expect(names('location-return-og',{})).toEqual(['Tilted Towers','Greasy Grove','Risky Reels','Loot Lake','Frosty Flights'].sort());
  expect(validateAnswer(question,'Frosty Flights').correct).toBe(true);
  expect(validateAnswer(question,'Pleasant Park').correct).toBe(false);
 });
 it('retains exact scope and spawn restrictions on Season X weapon unvaults',()=>{
  expect(names('weapon-unvaulted',{})).toEqual(['Double Barrel Shotgun','Six Shooter','Hunting Rifle','Infantry Rifle','Tactical Submachine Gun'].sort());
  const question=buildQuestion(template('weapon-unvaulted'),{},{expert:true})!;
  expect(validateAnswer(question,'Hunting Rifle').explanation).toContain('restricted to Tilted Town');
  expect(validateAnswer(question,'Infinity Blade').correct).toBe(false);
 });
 it('does not confuse replacement or ordinary Rift Zone updates with live-event destruction',()=>{
  for (const name of ['Neo Tilted','Mega Mall','Paradise Palms']) {
   expect(availableIn(entity(name),'C1SX')).toBe(true);
   expect(matchesHistory(entity(name),{field:'change',operator:'historyChange',value:'replaced'})).toBe(true);
   expect(matchesHistory(entity(name),{field:'eventChange',operator:'historyChange',value:'destroyed'})).toBe(false);
  }
  expect(template('location-destroyed').status).toBe('pending');
  expect(template('location-renamed').status).toBe('pending');
 });
 it('separates season presence, update absence and unknown history',()=>{
  const revolver=entity('Scoped Revolver');
  expect(availableIn(revolver,'C1S7')).toBe(true);
  expect(availabilityAtUpdate(revolver,'v9-00')).toBe('absent');
  expect(availabilityAtUpdate(revolver,'v9-99')).toBe('unknown');
  const rifle=entity('Semi-Auto Sniper Rifle');
  expect(availabilityAtUpdate(rifle,'v6-02')).toBe('present');
  expect(availabilityAtUpdate(rifle,'v10-00-patch-notes')).toBe('absent');
  expect(availableIn(rifle,'C2S2')).toBe(false);
 });
 it('does not label a temporary disable as vaulting',()=>{
  const fortress=entity('Port-A-Fortress');
  expect(availabilityAtUpdate(fortress,'v6-10')).toBe('absent');
  expect(fortress.history!.changes.some(change=>change.kind==='vaulted' && change.sourceIds.includes('epic-patch-v6-10'))).toBe(false);
 });
 it('does not make rarity upgrades into new canonical introductions',()=>{
  expect(entity('Pump Shotgun').history?.introduction?.season).not.toBe('C1S6');
  expect(entity('Tactical Shotgun').history?.introduction?.season).not.toBe('C1S9');
  expect(entities.filter(entity=>entity.name==='Pump Shotgun')).toHaveLength(1);
 });
 it('keeps a crafting guide distinct from the whole season loot pool',()=>{
  const question=buildQuestion(template('weapon-available-season'),{season:'C2S6'})!;
  expect(question.validAnswerIds).toHaveLength(10);
  expect(validateAnswer(question,'Flame Bow').canonicalAnswer).toBe('Primal Flame Bow');
  expect(validateAnswer(question,'Shockwave Bow').canonicalAnswer).toBe('Mechanical Shockwave Bow');
  expect(validateAnswer(question,'Mechanical Explosive Bow').correct).toBe(false);
  expect(buildQuestion(template('weapon-available-season'),{season:'C3S1'})).toBeNull();
 });
 it('does not infer first introduction from a later crafting guide or augment',()=>{
  expect(entity('Primal Rifle').history!.introduction!.status).toBe('pending');
  expect(availableIn(entity('Primal Rifle'),'C2S6')).toBe(true);
  expect(entity('Mechanical Explosive Bow').history!.introduction!.status).toBe('pending');
  expect(availableIn(entity('Mechanical Explosive Bow'),'C4S1')).toBe(true);
 });
 it('reports coverage-incomplete combinations independently of answer counts',()=>{
  const report=auditQuestionBank();
  expect(report.errors).toEqual([]);
  expect(report.disabledCombinations).toContainEqual(expect.objectContaining({templateId:'vehicle-introduced-chapter',parameters:{chapter:2},reason:'coverage-incomplete'}));
 },15000);
 it('detects contradictory verified update observations',()=>{
  const rifle=structuredClone(entity('Scoped Revolver'));
  rifle.history!.observations!.push({...rifle.history!.observations!.find(record=>record.update==='v9-00')!,state:'present'});
  expect(auditHistoricalEntities([rifle]).errors).toContain(`${rifle.id}: contradictory availability at v9-00.`);
 });
});

describe('daily knowledge diversity',()=>{
 it('keeps seven distinct knowledge axes and deterministic order across 60 daily seeds',()=>{
  for(let day=1;day<=60;day++) {
   const date=new Date(Date.UTC(2026,8,day));const seed=dailySeed(date);
   const game=generateGame(seed,7);
   expect(game).toHaveLength(7);
   expect(new Set(game.map(questionKnowledgeGroup)).size).toBe(7);
   expect(new Set(game.map(question=>question.id)).size).toBe(7);
   expect(game.map(question=>question.id)).toEqual(generateGame(seed,7).map(question=>question.id));
  }
 });
 it('preserves practice category filtering',()=>{
  expect(generateGame('practice-history',7,['Weapons']).every(question=>question.category==='Weapons')).toBe(true);
 });
});
