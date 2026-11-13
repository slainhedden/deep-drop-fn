import {describe,it,expect} from 'vitest';
import {entities,entitiesByType} from '../data/entities';
import {suggestionsFor,resolveAnswer} from './resolve';
import {questionPool} from './questions';
import {validateAnswer} from './validation';
import {missingAnswerReport} from './missing-report';
const named=(name:string,type:string)=>entities.find(e=>e.name===name&&e.type===type)!;
describe('conservative answer clarification',()=>{
 it('offers typos and shortened equipment without scoring them automatically',()=>{
  const places=entitiesByType('location'),items=entitiesByType('item'),weapons=entitiesByType('weapon');
  expect(resolveAnswer('Pleasent Park',places).entity).toBeUndefined();
  expect(suggestionsFor('Pleasent Park',places,3).map(e=>e.name)).toContain('Pleasant Park');
  expect(suggestionsFor('shock wave',items,3).map(e=>e.name)).toContain('Shockwave Grenade');
  expect(suggestionsFor('makeshift shotty',weapons,3).map(e=>e.name)).toContain('Makeshift Shotgun');
  expect(resolveAnswer('shockwavegrenade',items).entity?.name).toBe('Shockwave Grenade');
  expect(resolveAnswer('tac shotty',weapons).entity?.name).toBe('Tactical Shotgun');
 });
 it('keeps cosmetic identities and ambiguous Mythics distinct',()=>{
  const aang=[named('Aang','skin'),named('Avatar State Aang','skin')];
  expect(aang.every(Boolean)).toBe(true);
  expect(resolveAnswer('Aang',aang).entity?.name).toBe('Aang');
  expect(suggestionsFor('avatar aang',aang,3).map(e=>e.name).sort()).toEqual(['Aang','Avatar State Aang']);
  const weapons=entitiesByType('weapon');const drums=suggestionsFor('drum gun',weapons,3);
  expect(drums.length).toBeGreaterThan(1);expect(new Set(drums.map(e=>e.id)).size).toBe(drums.length);
  const cosmetics=entitiesByType('cosmetic');for(const name of ['Rock-STAR','Rockstar']){const e=cosmetics.find(e=>e.name===name);if(e)expect(resolveAnswer(name,cosmetics).entity?.id).toBe(e.id);}
 });
 it('does not silently substitute a contextual nickname for another official outfit',()=>{
  const reaper=named('The Reaper','skin');const contextual={...reaper,aliases:[{text:'John Wick',kind:'slang' as const,confidence:'contextual' as const}]};
  expect(resolveAnswer('John Wick',[contextual]).entity).toBeUndefined();
  expect(resolveAnswer('JohnWick',[contextual]).entity).toBeUndefined();
  const avatar={...named('Avatar State Aang','skin'),aliases:[{text:'Aang',kind:'official' as const,confidence:'exact' as const}]};
  expect(resolveAnswer('Aang',[avatar]).entity).toBeUndefined();
  expect(suggestionsFor('John Wick',[contextual],3)[0].id).toBe(reaper.id);
 });
 it('never substitutes ineligible entities and keeps canonical scoring unchanged after confirmation',()=>{
  const q=questionPool().find(q=>q.templateId==='location-chapter'&&q.parameters.chapter===1)!;
  const before=validateAnswer(q,'Pleasent Park');expect(before.correct).toBe(false);expect(before.points).toBe(0);
  const choices=suggestionsFor('Pleasent Park',q,3);expect(choices.every(e=>q.validAnswerIds.includes(e.id))).toBe(true);
  expect(validateAnswer(q,choices[0].name)).toEqual(validateAnswer(q,'Pleasant Park'));
  expect(suggestionsFor('shock wave',q,3)).toEqual([]);
  expect(resolveAnswer('Pumped Shotgun',entitiesByType('weapon')).entity).toBeUndefined();
 });
 it('captures an exact catalog identity without treating it as an eligible answer',()=>{
  const q=questionPool().find(q=>q.templateId==='location-chapter'&&q.parameters.chapter===1)!;
  const report=missingAnswerReport(q,'Aang','Please review',new Date('2026-11-13T01:00:00Z'));
  expect(report.questionId).toBe(q.id);expect(report.catalogMatches.some(e=>e.name==='Aang'&&!e.eligible)).toBe(true);
  expect(report.explanation).toBe('Please review');expect(report.timestamp).toBe('2026-11-13T01:00:00.000Z');
 });
 it('bounds suggestions for a large bank and ignores short or oversized input',()=>{
  const bank=entitiesByType('cosmetic');expect(bank.length).toBeGreaterThan(10000);
  for(const query of ['rock','skull','renegade raidr']){const result=suggestionsFor(query,bank,3);expect(result.length).toBeLessThanOrEqual(3);expect(result.every(e=>bank.includes(e))).toBe(true);}
  expect(suggestionsFor('aa',bank)).toEqual([]);expect(suggestionsFor('x'.repeat(10000),bank)).toEqual([]);
 });
});
