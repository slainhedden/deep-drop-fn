import { qualitySummary } from './quality';
import { supportsScope } from './coverage';
import type { EntityType, FortniteEntity, HistoricalEvidence } from '../domain/types';
import { entities, entitiesByType } from '../data/entities';
import { templates } from '../data/templates';
import { sourceById } from '../data/sources';
import { compareSeasons, seasonById } from '../data/seasons';
import { normalizeAnswer } from './normalize';
import { combinations, questionPool } from './questions';
import { assessPredicate, matchesAll } from './predicates';
import { appearanceChapters } from './history';

export interface DisabledCombination { templateId:string; parameters:Record<string,string|number>; reason:'pending-review'|'coverage-incomplete'|'insufficient-answers'; eligibleAnswers:number; candidateAnswers:number }
export interface AuditReport {
 contentGaps:{category:string;reason:string;pendingRecords:number}[]; exclusionReview:{name:string;templateId:string;reasons:string[]}[];
 quality:ReturnType<typeof qualitySummary>; mostRepeatedFamilies:{family:string;count:number}[];
 questions:number; templates:number; enabledTemplates:number; entities:number;
 entityCounts:Record<EntityType,number>; pendingEntities:number; legacyEntities:number; verifiedEntities:number; addedEntities:number; answerCombinations:number; playableEntities:number; newPlayableEntities:number;
 errors:string[]; warnings:string[]; answerRange:[number,number]; medianAnswers:number;
 disabledCombinations:DisabledCombination[]; missingCriticalMetadata:string[];
 ambiguousAliases:string[]; sourceCoverage:{ referenced:number; verified:number; pending:number; legacy:number };
 poiByChapter:Record<number,{verified:number; pending:number}>;
}

export function auditHistoricalEntities(bank:FortniteEntity[]): {errors:string[]; warnings:string[]; missing:string[]} {
 const errors:string[]=[]; const warnings:string[]=[]; const missing:string[]=[];
 const byId = new Map(bank.map(entity=>[entity.id,entity]));
 const ids = new Set<string>();
 const evidence = (entity:FortniteEntity, record:HistoricalEvidence, label:string) => {
  if (!record.sourceIds.length) errors.push(`${entity.id}: ${label} has no provenance.`);
  for (const id of record.sourceIds) {
   const source = sourceById.get(id);
   if (!source) errors.push(`${entity.id}: unknown source ${id}.`);
   if (record.status === 'verified' && (source?.status !== 'verified' || !source.verifiedOn)) errors.push(`${entity.id}: verified ${label} cites an unreviewed source ${id}.`);
  }
 };
 for (const entity of bank) {
  if (ids.has(entity.id)) errors.push(`Duplicate canonical ID: ${entity.id}`);
  ids.add(entity.id);
  if (!Number.isFinite(entity.familiarity) || entity.familiarity<=0 || entity.familiarity>1) errors.push(`${entity.id}: familiarity must be in (0,1].`);
  if (!entity.sourceIds.length) warnings.push(`${entity.id}: no entity sources.`);
  for (const id of entity.sourceIds) {
   const source=sourceById.get(id);
   if (!source) errors.push(`${entity.id}: unknown source ${id}.`);
   if (entity.verification === 'verified' && (source?.status !== 'verified' || !source.verifiedOn)) errors.push(`${entity.id}: verified entity cites unreviewed source ${id}.`);
  }
  for (const [field,record] of Object.entries(entity.factEvidence ?? {})) evidence(entity,record,`fact ${field}`);
  const history = entity.history;
  if (!history?.introduction) missing.push(`${entity.id}: introduction unknown.`);
  if (!history?.appearances.length) missing.push(`${entity.id}: availability unknown.`);
  if (!history) continue;
  const validSeason = (season:string) => { if (seasonById.has(season)) return true; errors.push(`${entity.id}: unknown season ${season}.`); return false; };
  if (history.introduction) { validSeason(history.introduction.season); evidence(entity,history.introduction,'introduction'); }
  for (const period of history.appearances) {
   evidence(entity,period,'appearance');
   if (validSeason(period.from) && validSeason(period.through)) {
    if (compareSeasons(period.from,period.through)>0) errors.push(`${entity.id}: reversed appearance period.`);
    if (history.introduction && seasonById.has(history.introduction.season) && compareSeasons(period.from,history.introduction.season)<0) errors.push(`${entity.id}: appearance precedes introduction.`);
   }
  }
  const observations=new Map<string,string>();
  for (const observation of history.observations??[]) {
   validSeason(observation.season);evidence(entity,observation,'availability observation');
   if (observation.status==='verified') {
    const key=`${observation.mode}:${observation.update}`;
    if (observations.has(key) && observations.get(key)!==observation.state) errors.push(`${entity.id}: contradictory availability at ${observation.update}.`);
    observations.set(key,observation.state);
   }
  }
  for (const change of history.changes) {
   validSeason(change.season); evidence(entity,change,change.kind);
   if (history.introduction && seasonById.has(change.season) && seasonById.has(history.introduction.season) && compareSeasons(change.season,history.introduction.season)<0) errors.push(`${entity.id}: change precedes introduction.`);
   if (change.relatedEntityId && !byId.has(change.relatedEntityId)) errors.push(`${entity.id}: missing related entity ${change.relatedEntityId}.`);
   if (change.eventId) {
    const event=byId.get(change.eventId);
    if (event?.type !== 'event' || event.facts.isLiveEvent !== true) errors.push(`${entity.id}: ${change.eventId} is not a live event.`);
    if (event?.history?.introduction?.season !== change.season) errors.push(`${entity.id}: event change season disagrees with event ${change.eventId}.`);
   }
  }
  for (const relationship of history.relationships) {
   validSeason(relationship.season); evidence(entity,relationship,'relationship');
   const target = byId.get(relationship.entityId);
   const expected = {boss:'boss',mythic:'weapon',location:'location',participant:undefined,successor:entity.type,droppedBy:undefined,foundIn:'container',obtainableAt:'location',faction:'faction'}[relationship.kind];
   if (!target || (expected && target.type !== expected)) errors.push(`${entity.id}: invalid ${relationship.kind} target ${relationship.entityId}.`);
   if(relationship.kind==='droppedBy' && target && !['boss','npc'].includes(target.type)) errors.push(`${entity.id}: droppedBy target must be a boss or NPC.`);
   if (relationship.kind === 'location' && target?.facts.namedPoi !== true) warnings.push(`${entity.id}: location relationship is not an official named POI.`);
  }
  for (const [flag,record] of Object.entries(history.flags ?? {})) evidence(entity,record,flag);
 }
 return {errors,warnings,missing};
}

export function auditQuestionBank(): AuditReport {
 const questions = questionPool();
 const historical = auditHistoricalEntities(entities);
 const errors=[...historical.errors]; const warnings=[...historical.warnings];
 warnings.push('Unreviewed legacy classifications are retained. Broad historical families remain pending; reviewed release and launch scopes are enabled separately.');
 const disabledCombinations:DisabledCombination[]=[];
 const templateIds=new Set<string>();
 for (const template of templates) {
  if (templateIds.has(template.id)) errors.push(`Duplicate template ID: ${template.id}`);
  templateIds.add(template.id);
  if (template.coverage) {
   if (!template.coverage.sourceIds.length || !template.coverage.reviewedOn || !template.coverage.note) errors.push(`${template.id}: incomplete coverage approval.`);
   for (const source of template.coverage.sourceIds) if (sourceById.get(source)?.status!=='verified') errors.push(`${template.id}: coverage cites unreviewed source ${source}.`);
   for (const scope of template.coverage.parameters??[]) if (Object.keys(scope).sort().join('|')!==template.parameters.map(parameter=>parameter.key).sort().join('|')) errors.push(`${template.id}: coverage parameter dimensions do not match.`);
  }
  if (template.status !== 'pending' && !questions.some(question=>question.templateId===template.id)) errors.push(`Template ${template.id} has no supported parameter combination.`);
  for (const parameters of combinations(template)) {
   const bank=(template.answerTypes??[template.answerType]).flatMap(entitiesByType); const predicates=template.predicates(parameters);
   const eligibleAnswers=bank.filter(entity=>matchesAll(entity,predicates)).length;
   if (template.status === 'pending' || !supportsScope(template,parameters) || eligibleAnswers<Math.max(5,template.minAnswers??5)) disabledCombinations.push({templateId:template.id,parameters,reason:template.status === 'pending' ? 'pending-review' : !supportsScope(template,parameters) ? 'coverage-incomplete' : 'insufficient-answers',eligibleAnswers,candidateAnswers:bank.filter(entity=>matchesAll(entity,predicates,true)).length});
  }
 }
 const prompts = new Set<string>();
 for (const question of questions) {
  if (question.validAnswerIds.length<5) errors.push(`${question.id}: fewer than five answers.`);
  if (new Set(question.validAnswerIds).size !== question.validAnswerIds.length) errors.push(`${question.id}: duplicate answers.`);
  if (prompts.has(question.prompt)) errors.push(`Duplicate prompt: ${question.prompt}`);
  prompts.add(question.prompt);
  if (question.validAnswerIds.some(id=>!matchesAll(entities.find(entity=>entity.id===id)!,question.predicates))) errors.push(`${question.id}: answer lacks eligible predicate evidence.`);
 }
 const names = new Map<string,Set<string>>();
 const canonical = new Map<string,string>();
 for (const entity of entities) {
  const nameKey=`${entity.type}:${normalizeAnswer(entity.name)}`;
  if (canonical.has(nameKey)) errors.push(`Duplicate canonical name: ${entity.name}`);
  canonical.set(nameKey,entity.id);
  for (const candidate of [entity.name,...entity.aliases.map(alias=>alias.text)]) {
   const key=`${entity.type}:${normalizeAnswer(candidate)}`;
   if (!names.has(key)) names.set(key,new Set());
   names.get(key)!.add(entity.id);
  }
 }
 // Shared aliases are valid but must resolve to exactly one answer in context.
 const ambiguousAliases=[...names].filter(([,ids])=>ids.size>1).map(([name,ids])=>`${name}: ${[...ids].join(', ')}`);
 const playableIds=new Set(questions.flatMap(question=>question.validAnswerIds));
 const counts=questions.map(question=>question.validAnswerIds.length).sort((a,b)=>a-b);
 const middle=Math.floor(counts.length/2);
 const entityCounts=Object.fromEntries(['skin','weapon','location','collaboration','item','vehicle','event','boss','npc','container','ammo','material','faction'].map(type=>[type,entities.filter(entity=>entity.type===type).length])) as Record<EntityType,number>;
 const referenced=new Set(entities.flatMap(entity=>[
  ...entity.sourceIds,
  ...Object.values(entity.factEvidence??{}).flatMap(record=>record.sourceIds),
  ...(entity.history?.introduction?.sourceIds??[]),
  ...(entity.history?.appearances??[]).flatMap(record=>record.sourceIds),
  ...(entity.history?.observations??[]).flatMap(record=>record.sourceIds),
  ...(entity.history?.changes??[]).flatMap(record=>record.sourceIds),
  ...(entity.history?.relationships??[]).flatMap(record=>record.sourceIds),
  ...Object.values(entity.history?.flags??{}).flatMap(record=>record.sourceIds),
 ]));
 const poiByChapter:AuditReport['poiByChapter']={};
 for (let chapter=1;chapter<=7;chapter++) poiByChapter[chapter]={
  verified:entities.filter(entity=>entity.type==='location' && entity.facts.namedPoi===true && appearanceChapters(entity,false,true).includes(chapter)).length,
  pending:entities.filter(entity=>entity.type==='location' && entity.facts.namedPoi===true && appearanceChapters(entity,true,true).includes(chapter) && !appearanceChapters(entity,false,true).includes(chapter)).length,
 };
 const verified=[...referenced].filter(id=>sourceById.get(id)?.status==='verified').length;
 const pending=[...referenced].filter(id=>sourceById.get(id)?.status==='pending').length;
 return {contentGaps:[{category:'Mythic boss drops',reason:'Complete cross-chapter boss tables and exact Chapter 2 availability remain unreviewed.',pendingRecords:entities.filter(e=>e.type==='boss'&&e.verification==='pending').length},{category:'Containers',reason:'Rare/faction/cooler/produce taxonomy and complete contents need sources.',pendingRecords:entities.filter(e=>e.type==='container'&&e.verification==='pending').length},{category:'Fishing',reason:'No catchability catalog reviewed; do not infer it from healing classifications.',pendingRecords:entities.filter(e=>e.type==='item'&&/fish/i.test(e.name)&&!e.facts.isFish).length},{category:'Marauders',reason:'No complete C2S3 drop table; ammo/material granularity unresolved.',pendingRecords:1}],exclusionReview:[['Skye’s Assault Rifle','weapon-mythic-version'],['Brutus’ Minigun','weapon-mythic-version'],['Rare Chest','loot-container'],['Flopper','fish-class']].map(([name,templateId])=>{const entity=entities.find(e=>e.name===name)!;const template=templates.find(t=>t.id===templateId)!;return {name,templateId,reasons:template.predicates({}).map(p=>assessPredicate(entity,p)).filter(a=>!a.eligible).map(a=>a.reason)}}),quality:qualitySummary(questions),mostRepeatedFamilies:[...new Set(templates.map(t=>t.family??t.id))].map(family=>({family,count:questions.filter(q=>(templates.find(t=>t.id===q.templateId)?.family??q.templateId)===family).length})).filter(row=>row.count>0).sort((a,b)=>b.count-a.count),questions:questions.length,templates:templates.length,enabledTemplates:templates.filter(template=>template.status!=='pending').length,entities:entities.length,entityCounts,pendingEntities:entities.filter(entity=>entity.verification==='pending').length,legacyEntities:entities.filter(entity=>entity.origin==='legacy').length,verifiedEntities:entities.filter(entity=>entity.verification==='verified').length,addedEntities:entities.filter(entity=>entity.origin==='expansion').length,answerCombinations:questions.reduce((total,question)=>total+question.validAnswerIds.length,0),playableEntities:playableIds.size,newPlayableEntities:entities.filter(entity=>entity.origin==='expansion' && playableIds.has(entity.id)).length,errors,warnings,answerRange:counts.length ? [counts[0],counts[counts.length-1]] : [0,0],medianAnswers:counts.length ? (counts.length%2 ? counts[middle] : (counts[middle-1]+counts[middle])/2) : 0,disabledCombinations,missingCriticalMetadata:historical.missing,ambiguousAliases,sourceCoverage:{referenced:referenced.size,verified,pending,legacy:referenced.size-verified-pending},poiByChapter};
}
