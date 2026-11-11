import {describe,it,expect} from 'vitest';
import research from '../data/research/location-history.json';
import snapshots from '../data/research/chapter7-map-snapshots.json';
import {entities,entitiesById} from '../data/entities';
import {templates} from '../data/templates';
import {availableIn} from './history';
import {buildQuestion} from './questions';
import {validateAnswer} from './validation';
import {normalizeAnswer} from './normalize';
import {seasonById,compareSeasons} from '../data/seasons';
const entity=(name:string)=>entities.find(e=>e.type==='location'&&e.name===name)!;
const template=(id:string)=>templates.find(t=>t.id===id)!;
const canonical=(s:string)=>normalizeAnswer(s.toUpperCase()==='THE $.$. ROCKY'?'$.$. Rocky':s);
describe('reviewed historical location populations',()=>{
 it('matches every complete season table, including intra-season additions and returns',()=>{
  for(const group of research.groups)for(const season of group.seasons){
   const expected=group.rows.filter(r=>r.seasons.includes(season)).map(r=>canonical(r.name)).sort();
   const actual=entities.filter(e=>e.type==='location'&&availableIn(e,season,false,true)).map(e=>canonical(e.name)).sort();
   expect(actual,season).toEqual(expected);
  }
 });
 it('keeps all prior typed snapshots and their individual provenance',()=>{
  for(const map of snapshots)for(const row of map.locations){
   const e=entities.find(e=>e.type==='location'&&canonical(e.name)===canonical(row.name))!;
   expect(e,map.version+' '+row.name).toBeDefined();
   expect(e.history!.appearances.some(p=>p.from===map.season&&p.namedPoi===(row.type==='named')&&p.sourceIds.includes(map.sourceId))).toBe(true);
  }
 });
 it('uses the corrected Foxy spelling with the original canonical ID',()=>{
  expect(entitiesById.get('location-fox-floodgate')?.name).toBe('Foxy Floodgate');
  expect(entities.filter(e=>e.type==='location'&&/foxy? floodgate/i.test(e.name))).toHaveLength(1);
  expect(availableIn(entity('Foxy Floodgate'),'C6S1',false,true)).toBe(true);
 });
 it('does not promote contradicted dates or removal notes',()=>{
  expect(entity('Coral Castle').history?.introduction?.season).toBe('C2S3');
  expect(entity('Coral Castle').history?.introduction?.sourceIds).toContain('wg-coral-castle');
  expect(entity('Believer Beach').history?.changes.some(c=>c.status==='verified'&&c.season==='C2S6')).toBe(false);
  expect(entity('Catty Corner').history?.changes.some(c=>c.status==='verified'&&c.kind==='removed'&&c.season==='C2S7')).toBe(false);
  expect(availableIn(entity('Risky Reels'),'REMIX2024',false,true)).toBe(false);
  expect(availableIn(entity('Risky Reels'),'C2S2',false,true)).toBe(true);
 });
 it('preserves distinct renamed/replaced identities and exact successor links',()=>{
  const before=entity('InnoLoop Labs'),after=entity('Lethal Labs');
  expect(before.id).not.toBe(after.id);
  expect(before.history?.changes).toContainEqual(expect.objectContaining({kind:'renamed',season:'C7S1',relatedEntityId:after.id,status:'verified',sourceIds:['wg-c7s1']}));
  expect(entity('The Agency').history?.changes).toContainEqual(expect.objectContaining({kind:'replaced',season:'C2S3',relatedEntityId:entity('The Authority').id,status:'verified'}));
 });
 it('places special seasons in chronology and keeps their islands separate',()=>{
  expect(compareSeasons('C6S2','C6GALACTIC2025')).toBeLessThan(0);
  expect(compareSeasons('C6GALACTIC2025','C6S3')).toBeLessThan(0);
  expect(compareSeasons('C6S4','C6SIMPSONS2025')).toBeLessThan(0);
  expect(seasonById.get('REMIX2024')?.chapter).toBe(5);
  expect(availableIn(entity('Burns Manor'),'C6S4',false,true)).toBe(false);
  expect(availableIn(entity("Mayor's Munchies"),'C6SIMPSONS2025',false,true)).toBe(true);
  expect(entity('Burns Manor').facts.reviewedIslands).toEqual(['Springfield Island']);
  expect(availableIn(entity('Arlong Park'),'C7S2',false,true)).toBe(false);
 });
 it('accepts the complete broad chapter banks and gates the unreviewed global families',()=>{
  for(const chapter of [2,6,7]){
   const q=buildQuestion(template('location-chapter'),{chapter})!;
   expect(q).not.toBeNull();
   for(const id of q.validAnswerIds)expect(validateAnswer(q,entitiesById.get(id)!.name).correct).toBe(true);
  }
  expect(validateAnswer(buildQuestion(template('location-chapter'),{chapter:7})!,'New Sanctuary').correct).toBe(true);
  for(const chapter of [1,3,4,5])expect(buildQuestion(template('location-chapter'),{chapter})).not.toBeNull();
  for(const id of ['location-multiple-chapters','location-renamed','location-replaced'])expect(buildQuestion(template(id),{})).toBeNull();
 });
});
