import { describe,expect,it } from 'vitest';
import { entities,entitiesByType } from '../data/entities';
import { reviewedAnnouncements,reviewedSources } from '../data/reviewed-announcements';
import { reviewedTemplates } from '../data/reviewed-templates';
import { sourceById } from '../data/sources';
import { questionPool,buildQuestion } from './questions';
import { availableIn,eventLocationChanges,matchesHistory } from './history';
import { validateAnswer } from './validation';
import { matchesAll } from './predicates';

const entity=(type:string,name:string)=>entities.find(entity=>entity.type===type && entity.name===name)!;
const question=(id:string,parameters:Record<string,string|number>)=>buildQuestion(reviewedTemplates.find(template=>template.id===id)!,parameters,{expert:true})!;

describe('reviewed official history regressions',()=>{
 it('has complete eight-outfit lineups for all Chapter 3 and Chapter 4 passes',()=>{
  const core=reviewedAnnouncements.filter(article=>/^C[34]S/.test(article.season));
  expect(core).toHaveLength(8);
  for (const article of core) {
   expect(article.battlePass).toHaveLength(8);
   const generated=question('reviewed-pass-season',{season:article.season});
   expect(generated.validAnswerIds.map(id=>entities.find(entity=>entity.id===id)!.name).sort()).toEqual([...article.battlePass!].sort());
  }
 });
 it('does not mistake a franchise character for the actual outfit name',()=>{
  expect(entity('skin','Tony Stark').facts.isCosmetic).toBe(true);
  expect(entity('skin','Tony Stark').factEvidence?.cosmeticType.status).toBe('verified');
  expect(entity('skin','Doom').history?.introduction?.season).toBe('C5S4');
  expect(entity('collaboration','Doctor Doom').id).toBe('doctor-doom');
 });
 it('keeps OG Pass acquisition distinct from Battle Pass and includes both only when asked',()=>{
  expect(entity('skin','Spectra Knight').facts.acquisitionMethod).toBe('og_pass');
  const generated=question('reviewed-pass-range',{from:'C4S4',through:'OG2023'});
  expect(validateAnswer(generated,'Spectra Knight').correct).toBe(true);
  expect(validateAnswer(generated,'Ahsoka Tano').correct).toBe(true);
  expect(validateAnswer(generated,'Spider-Man').correct).toBe(false);
 });
 it('keeps Doom’s Courtyard a landmark and excludes it from named-POI answers',()=>{
  const courtyard=entity('location','Doom’s Courtyard');
  expect(courtyard.facts.namedPoi).toBe(false);
  expect(availableIn(courtyard,'C5S4')).toBe(true);
  expect(availableIn(courtyard,'C5S4',false,true)).toBe(false);
  expect(questionPool().filter(question=>question.answerType==='location').some(question=>question.validAnswerIds.includes(courtyard.id))).toBe(false);
 });
 it('does not turn a sniper balance-change mention into loot availability',()=>{
  expect(availableIn(entity('weapon','Heavy Sniper Rifle'),'C3S4')).toBe(false);
  const generated=question('reviewed-launch-loot',{season:'C3S4'});
  expect(validateAnswer(generated,'Heavy Sniper Rifle').correct).toBe(false);
  expect(validateAnswer(generated,'Hunter Bolt-Action Sniper').correct).toBe(true);
 });
 it('does not treat a rename as live-event destruction',()=>{
  const condo=entity('location','Condo Canyon');
  expect(matchesHistory(condo,{field:'change',operator:'historyChange',value:'renamed'})).toBe(true);
  expect(matchesHistory(condo,{field:'eventChange',operator:'historyChange',value:'destroyed'})).toBe(false);
  expect(eventLocationChanges(entities,'collision').some(effect=>effect.locationId===condo.id)).toBe(false);
 });
 it('keeps original introduction separate from the 2023 OG unvault',()=>{
  const sixShooter=entity('weapon','Six Shooter');
  expect(sixShooter.history?.introduction?.season).toBe('C1S6');
  expect(availableIn(sixShooter,'OG2023')).toBe(true);
  expect(availableIn(sixShooter,'C2S2')).toBe(false);
  expect(sixShooter.history?.changes.some(change=>change.kind==='unvaulted' && change.season==='OG2023' && change.status==='verified')).toBe(true);
 });
 it('separates friendly NPCs and hostile bosses and preserves mythic-version qualifiers',()=>{
  expect(entity('npc','Guaco').facts.isBoss).toBe(false);
  expect(entitiesByType('boss').some(boss=>boss.name==='Guaco')).toBe(false);
  const highcard=entity('boss','Highcard');
  expect(highcard.history?.relationships).toContainEqual(expect.objectContaining({kind:'mythic',variant:'mythic',entityId:entity('weapon','Havoc Suppressed Assault Rifle').id,status:'verified'}));
  const generated=question('reviewed-loot-bosses',{});
  expect(validateAnswer(generated,'Highcard').correct).toBe(true);
  expect(validateAnswer(generated,'Guaco').correct).toBe(false);
 });
 it('never promotes unrelated pending historical claims on a reviewed entity',()=>{
  const tilted=entity('location','Tilted Towers');
  expect(tilted.verification).toBe('verified');
  expect(matchesHistory(tilted,{field:'eventChange',operator:'historyChange',value:'destroyed'})).toBe(false);
  expect(tilted.history?.changes.some(change=>change.kind==='destroyed' && change.status==='pending')).toBe(true);
  expect(matchesAll(tilted,[{field:'chapters',operator:'includes',value:2}])).toBe(false);
 });
 it('requires dated, reviewed source provenance for every reviewed field',()=>{
  for (const record of reviewedSources) expect(record).toMatchObject({status:'verified',verifiedOn:'2026-11-09'});
  for (const record of entities.filter(entity=>entity.verification==='verified')) for (const evidence of Object.values(record.factEvidence??{})) {
   expect(evidence.sourceIds.length).toBeGreaterThan(0);
   for (const id of evidence.sourceIds) expect(sourceById.get(id)?.status).toBe('verified');
  }
 });
 it('does not count identical family answer sets as additional variants',()=>{
  const byId=new Map([...reviewedTemplates].map(template=>[template.id,template]));
  const sets=questionPool().filter(question=>byId.has(question.templateId)).map(question=>`${question.answerType}:${byId.get(question.templateId)!.family}:${[...question.validAnswerIds].sort().join('|')}`);
  expect(new Set(sets).size).toBe(sets.length);
 });
 it('explains the actual release season and the boss’s named drop',()=>{
  const pass=question('reviewed-pass-range',{from:'C3S1',through:'C3S2'});
  expect(validateAnswer(pass,'Spider-Man').explanation).toContain('Chapter 3 Season 1');
  const boss=question('reviewed-loot-bosses',{});
  expect(validateAnswer(boss,'Highcard').explanation).toContain('Havoc Suppressed Assault Rifle');
 });

});
