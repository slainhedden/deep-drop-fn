import {describe,it,expect} from 'vitest';
import {entities,entitiesById} from '../data/entities';
import {templates} from '../data/templates';
import {factVerification} from './predicates';
import {availableIn} from './history';
import {buildQuestion,questionPool} from './questions';
import {validateAnswer} from './validation';
import {suggestionsFor} from './resolve';
import {seasonById} from '../data/seasons';
const byName=(name:string)=>entities.find(e=>e.name===name)!;
const q=(id:string)=>questionPool().find(q=>q.templateId===id)!;
describe('shared gameplay attributes and Small Fry regression',()=>{
 it('accepts Small Fry for both health and fish, without claiming an unknown release date',()=>{
  const fry=byName('Small Fry');
  expect(validateAnswer(q('health-item'),'Small Fry').answerId).toBe(fry.id);
  expect(validateAnswer(q('fish-class'),'Small Fry').answerId).toBe(fry.id);
  expect(factVerification(fry,'restoresHealth')).toBe('verified');
  expect(factVerification(fry,'isFish')).toBe('verified');
  expect(fry.facts.catalogSeasonTag).toBe('CH2S1');
  expect(fry.history?.introduction?.status).not.toBe('verified');
  expect(availableIn(fry,'C2S1')).toBe(false); // unknown, not known absent
  expect(suggestionsFor('small f',q('health-item')).some(e=>e.id===fry.id)).toBe(true);
 });
 it('accepts every reviewed restorative attribute independently of unrelated timeline fields',()=>{
  for(const [field,id] of [['restoresHealth','health-item'],['restoresShield','shield-item']] as const){
   const question=q(id);
   for(const e of entities.filter(e=>e.type==='item'&&e.facts[field]===true&&factVerification(e,field)==='verified'))expect(question.validAnswerIds).toContain(e.id);
  }
 });
 it('distinguishes restorative fish from utility fish and leaves unspecified effects unknown',()=>{
  for(const name of ['Small Fry','Flopper','Slurpfish','Jellyfish'])expect(validateAnswer(q('health-item'),name).correct).toBe(true);
  for(const name of ['Slurpfish','Shield Fish','Jellyfish'])expect(validateAnswer(q('shield-item'),name).correct).toBe(true);
  expect(validateAnswer(q('health-item'),'Cuddle Fish').correct).toBe(false);
  expect(byName('Cuddle Fish').facts.restoresHealth).toBeUndefined();
  expect(byName('Thermal Fish').facts.restoresHealth).toBeUndefined();
  expect(byName('Rift Fish').facts.playerMobility).toBe(true);
  expect(byName('Spicy Fish').facts.playerMobility).toBe(true);
 });
 it('includes all sixteen reviewed fish identities and no cosmetic color duplicates',()=>{
  const question=q('fish-class');
  for(const name of ['Small Fry','Flopper','Slurpfish','Shield Fish','Jellyfish','Hop Flopper','Thermal Fish','Spicy Fish','Snowy Flopper','Cuddle Fish','Rift Fish','Vendetta Flopper','Midas Flopper','Stink Fish','Zero Point Fish','Shadow Flopper'])expect(validateAnswer(question,name).correct).toBe(true);
  expect(question.validAnswerIds).toHaveLength(16);
  expect(entities.filter(e=>e.name==='Flopper')).toHaveLength(1);
 });
 it('classifies foraged food from explicit game paths and descriptions',()=>{
  for(const name of ['Corn','Cabbage','Slurp Mushroom','Candy Corn','Hop Drop','Jelly Bean','Pepper Mint','Thermal Taffy'])expect(validateAnswer(q('foraged-class'),name).correct).toBe(true);
  expect(validateAnswer(q('health-item'),'Corn').correct).toBe(true);
  expect(validateAnswer(q('shield-item'),'Jelly Bean').correct).toBe(true);
 });
 it('reviews named Mythic classes without turning miniguns or SMGs into assault rifles',()=>{
  const rifle=questionPool().find(q=>q.templateId==='weapon-class'&&q.parameters.weaponClass==='assault rifle')!;
  for(const name of ['Skye’s Assault Rifle','Meowscles’ Peow Peow Rifle','Ocean’s Burst Assault Rifle'])expect(validateAnswer(rifle,name).correct).toBe(true);
  for(const name of ['Brutus’ Minigun','Jules’ Drum Gun','Midas’ Drum Gun'])expect(validateAnswer(rifle,name).correct).toBe(false);
  expect(validateAnswer(q('weapon-mythic-version'),'Brutus’ Minigun').correct).toBe(true);
  expect(validateAnswer(q('weapon-mythic-version'),'Skye’s Grappler').correct).toBe(false);
 });
});
describe('typed Chapter 7 snapshots without fabricated Chapter 2 or 6 timelines',()=>{
 it('has the complete thirteen named POIs for the v41.20 snapshot',()=>{
  const template=templates.find(t=>t.id==='location-reviewed-map')!;
  const question=buildQuestion(template,{version:'41.20'})!;
  expect(question.validAnswerIds).toHaveLength(13);
  expect(validateAnswer(question,'Latte Landing').correct).toBe(true);
  expect(validateAnswer(question,'Wonkeeland').correct).toBe(true);
  expect(validateAnswer(question,'Pleasant Park').correct).toBe(false);
  expect(question.advanced).toBe(true);
 });
 it('keeps landmark and named-POI assignments separate at every snapshot',()=>{
  const question=q('landmark-general');
  expect(question.validAnswerIds.length).toBeGreaterThan(20);
  expect(validateAnswer(question,'Latte Landing').correct).toBe(false);
  expect(availableIn(byName('Latte Landing'),'C7S3',false,true)).toBe(true);
  const landmark=entitiesById.get(question.validAnswerIds[0])!;
  expect(landmark.history!.appearances.some(p=>p.status==='verified'&&p.namedPoi===false)).toBe(true);
 });
 it('maps v43 to the separately documented Treasure Hunters island rather than inventing season five',()=>{
  expect(seasonById.has('C7S5')).toBe(false);
  expect(availableIn(byName('Arlong Park'),'C7TREASURE2026',false,true)).toBe(true);
  expect(availableIn(byName('Arlong Park'),'C7S4',false,true)).toBe(false);
  const template=templates.find(t=>t.id==='location-reviewed-map')!;
  const question=buildQuestion(template,{version:'43.00'})!;
  expect(validateAnswer(question,'The $.$. Rocky').answerId).toBe(byName('$.$. Rocky').id);
  expect(entities.filter(e=>/\$\.\$\./.test(e.name)&&e.type==='location')).toHaveLength(1);
 });
 it('uses explicit historical sources rather than missing snapshot rows for new changes',()=>{
  const latte=byName('Latte Landing');
  expect(latte.history?.changes.filter(c=>c.status==='verified').every(c=>c.sourceIds.every(id=>!id.startsWith('map-archive-')))).toBe(true);
  expect(latte.history?.introduction?.sourceIds).toContain('wg-named-locations');
  expect(availableIn(latte,'C7S1',false,true)).toBe(true);
 });
 it('enables reviewed chapters while retaining unreviewed chapter gates',()=>{
  const template=templates.find(t=>t.id==='location-chapter')!;
  expect(template).toBeDefined();
  for(const chapter of [2,6,7])expect(buildQuestion(template,{chapter})).not.toBeNull();
  for(const chapter of [1,3,4,5])expect(buildQuestion(template,{chapter})).toBeNull();
  for(const e of entities.filter(e=>e.type==='location'))for(const p of e.history?.appearances??[])if(['C2S2','C6S1'].includes(p.from)&&p.status==='verified')expect(p.sourceIds.every(id=>!id.startsWith('map-archive-'))).toBe(true);
 });
});
