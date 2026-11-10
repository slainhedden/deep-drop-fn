import { describe, expect, it } from 'vitest';
import type { FortniteEntity, HistoricalEvidence } from '../domain/types';
import { compareSeasons, seasonInRange, seasons } from '../data/seasons';
import { appearanceChapters, availableIn, eventLocationChanges, lastDocumentedAppearance, matchesHistory } from './history';
import { matchesAll } from './predicates';

const evidence:HistoricalEvidence={status:'verified',sourceIds:['epic-map']};
function location():FortniteEntity {
 return {id:'test-poi',name:'Test POI',type:'location',aliases:[],familiarity:.5,facts:{namedPoi:true},sourceIds:['epic-map'],dataVersion:'fixture',verification:'verified',history:{introduction:{season:'C1S2',...evidence},appearances:[{from:'C1S2',through:'C1S4',namedPoi:true,...evidence},{from:'OG2023',through:'OG2023',namedPoi:true,...evidence},{from:'C2S1',through:'C2S1',namedPoi:false,...evidence}],changes:[{kind:'removed',season:'C1S5',...evidence},{kind:'reintroduced',season:'OG2023',...evidence}],relationships:[]}};
}

describe('explicit season chronology',()=>{
 it('orders Season X, chapter boundaries, OG and Remix chronologically',()=>{
  for (const [before,after] of [['C1S9','C1SX'],['C1SX','C2S1'],['C4S4','OG2023'],['OG2023','C5S1'],['C5S4','REMIX2024'],['REMIX2024','C6S1']]) expect(compareSeasons(before,after)).toBeLessThan(0);
  expect(new Set(seasons.map(season=>season.id)).size).toBe(seasons.length);
 });
 it('includes both range endpoints and excludes neighboring seasons',()=>{
  expect(seasonInRange('C1S4','C1S4','C2S2')).toBe(true);
  expect(seasonInRange('C2S2','C1S4','C2S2')).toBe(true);
  expect(seasonInRange('C2S3','C1S4','C2S2')).toBe(false);
  expect(seasonInRange('C1S3','C1S4','C2S2')).toBe(false);
 });
 it('rejects unknown seasons and reversed ranges',()=>{
  expect(()=>compareSeasons('C1S10','C1SX')).toThrow('Unknown season');
  expect(()=>seasonInRange('C1S4','C2S1','C1S1')).toThrow('Reversed');
 });
});

describe('historical predicates',()=>{
 it('does not fill years between disjoint appearance periods',()=>{
  const entity=location();
  expect(availableIn(entity,'C1S3')).toBe(true);
  expect(availableIn(entity,'C3S1')).toBe(false);
  expect(availableIn(entity,'OG2023')).toBe(true);
  expect(availableIn(entity,'unknown')).toBe(false);
  expect(lastDocumentedAppearance(entity)).toBe('OG2023');
 });
 it('distinguishes a landmark from a named POI during a season',()=>{
  expect(availableIn(location(),'C2S1')).toBe(true);
  expect(availableIn(location(),'C2S1',false,true)).toBe(false);
  expect(appearanceChapters(location(),false,true)).toEqual([1,4]);
 });
 it('does not replace original introduction with a later return',()=>{
  const entity=location();
  expect(matchesHistory(entity,{field:'introduction',operator:'introducedOnOrBefore',value:'C1S2'})).toBe(true);
  expect(matchesHistory(entity,{field:'introduction',operator:'introducedOnOrAfter',value:'OG2023'})).toBe(false);
  expect(matchesHistory(entity,{field:'introduction',operator:'introducedInChapter',value:1})).toBe(true);
 });
 it('keeps removal, destruction, replacement and transformation independent',()=>{
  const entity=location();
  expect(matchesHistory(entity,{field:'change',operator:'historyChange',value:'removed'})).toBe(true);
  for (const kind of ['destroyed','transformed','renamed','replaced']) expect(matchesHistory(entity,{field:'change',operator:'historyChange',value:kind})).toBe(false);
  expect(matchesHistory(entity,{field:'eventChange',operator:'historyChange',value:'removed'})).toBe(false);
 });
 it('resolves event effects from location records without duplicating claims',()=>{
  const entity=location();
  entity.history!.changes.push({kind:'transformed',season:'C1S4',eventId:'test-event',...evidence});
  expect(eventLocationChanges([entity],'test-event')).toMatchObject([{locationId:'test-poi',change:{kind:'transformed'}}]);
  expect(eventLocationChanges([entity],'different-event')).toEqual([]);
  expect(matchesHistory(entity,{field:'eventChange',operator:'historyChange',value:'transformed'})).toBe(true);
 });
 it('does not treat pending or absent facts as verified facts',()=>{
  const entity=location();
  entity.history!.introduction!.status='pending';
  entity.history!.appearances.forEach(period=>period.status='pending');
  expect(matchesHistory(entity,{field:'introduction',operator:'introducedInChapter',value:1})).toBe(false);
  expect(matchesHistory(entity,{field:'introduction',operator:'introducedInChapter',value:1},true)).toBe(true);
  expect(availableIn(entity,'C1S2')).toBe(false);
  expect(availableIn(entity,'C1S2',true)).toBe(true);
  expect(matchesHistory(entity,{field:'biome',operator:'historyFlag',value:'snow'})).toBe(false);
  delete entity.history;
  expect(availableIn(entity,'C1S2')).toBe(false);
 });
 it('gates pending entities even for ordinary classification predicates',()=>{
  const entity=location(); entity.verification='pending';
  expect(matchesAll(entity,[{field:'namedPoi',operator:'eq',value:true}])).toBe(false);
  expect(matchesAll(entity,[{field:'namedPoi',operator:'eq',value:true}],true)).toBe(true);
 });
 it('uses reviewed relationship kinds and exact targets',()=>{
  const entity=location();
  entity.history!.relationships.push({kind:'boss',entityId:'boss-test',season:'C1S2',...evidence});
  expect(matchesHistory(entity,{field:'relationship',operator:'hasRelationship',value:'boss'})).toBe(true);
  expect(matchesHistory(entity,{field:'boss',operator:'relatedTo',value:'boss-test'})).toBe(true);
  expect(matchesHistory(entity,{field:'boss',operator:'relatedTo',value:'boss-other'})).toBe(false);
  expect(matchesHistory(entity,{field:'relationship',operator:'hasRelationship',value:'mythic'})).toBe(false);
 });
});
