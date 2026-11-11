import fs from 'node:fs';
import {withModel} from './with-model.mjs';
await withModel(async load=>{
 const Q=await load('/src/engine/questions.ts'),{entities,entitiesById}=await load('/src/data/entities.ts'),{questionQuality}=await load('/src/engine/quality.ts'),{independentDailyPool,isCosmeticQuestion}=await load('/src/engine/daily-pool.ts'),{auditQuestionBank}=await load('/src/engine/audit.ts'),{worldRelations}=await load('/src/data/world-relations.ts'),{questionEra}=await load('/src/engine/eras.ts'),{DATA_VERSION}=await load('/src/data/sources.ts');
 const normal=Q.questionPool(),daily=independentDailyPool(normal),expert=Q.questionPool({expert:true}),baseline=JSON.parse(fs.readFileSync('docs/phase5c-baseline.json','utf8'));
 const countBy=(xs,key)=>Object.fromEntries([...new Set(xs.map(key))].sort().map(k=>[k,xs.filter(x=>key(x)===k).length]));
 const category=q=>{
  if(isCosmeticQuestion(q)||['Crossovers','Cosmetics','Skins'].includes(q.category))return 'outside-nine';
  const f=Q.semanticFamily(q);
  if(/food|retail|fuel/.test(f))return 'H-businesses';
  if(/event-geography|live-history/.test(f)||q.category==='Events')return /modes/.test(f)?'D-LTMs':'E-events';
  if(q.category==='Bosses'||/boss|guard|faction/.test(f))return 'B-bosses';
  if(q.category==='NPCs'||/wildlife|npc/.test(f))return 'F-wildlife-NPCs';
  if(q.category==='Locations')return 'A-locations';
  if(q.category==='Containers'||/loot-source|container/.test(f))return 'G-loot-sources';
  if(q.category==='Vehicles'||/movement|rotation|gravity|protection|mobility|chapter-gameplay/.test(f))return 'I-mobility';
  return 'C-equipment';
 };
 const games=Array.from({length:120},(_,d)=>Q.generateGame(Q.dailySeed(new Date(Date.UTC(2026,8,d+1))),7));
 const last=new Map(),families=new Map(),gaps=[];let familyWithin3=0,adjacentChapterRepeats=0;
 games.forEach((game,d)=>{
  for(const q of game){if(last.has(q.id))gaps.push(d-last.get(q.id));last.set(q.id,d);}
  for(const f of new Set(game.map(Q.semanticFamily))){if(d-(families.get(f)??-100)<3)familyWithin3++;families.set(f,d);}
  const chapters=new Set(game.map(q=>Number(q.parameters.chapter)).filter(Boolean));
  if(d){const prior=new Set(games[d-1].map(q=>Number(q.parameters.chapter)).filter(Boolean));adjacentChapterRepeats+=[...chapters].filter(c=>prior.has(c)).length;}
 });
 const row=q=>({id:q.id,templateId:q.templateId,prompt:q.prompt,parameters:q.parameters,family:Q.semanticFamily(q),knowledgeGroup:Q.questionKnowledgeGroup(q),nostalgiaCategory:category(q),era:questionEra(q),...questionQuality(q)});
 const research=JSON.parse(fs.readFileSync('src/data/research/phase5c.json','utf8')),audit=auditQuestionBank();
 const output={dataVersion:DATA_VERSION,startingCommit:'7095271026ff19ba674c686ac93c03ff85cc3cde',baseline:{normal:baseline.normalQuestions,daily:baseline.independentDaily,nonCosmetic:baseline.independentNonCosmeticDaily,entities:baseline.playableEntities,relationships:baseline.relationships.total},catalogEntities:entities.length,playableEntities:new Set(normal.flatMap(q=>q.validAnswerIds)).size,normalQuestions:normal.length,independentDaily:daily.questions.length,rawDaily:daily.rawEligible,independentNonCosmeticDaily:daily.questions.filter(q=>!isCosmeticQuestion(q)).length,expertAdditional:expert.filter(q=>!normal.some(p=>p.id===q.id)).length,normalFamilies:new Set(normal.map(Q.semanticFamily)).size,dailyFamilies:new Set(daily.questions.map(Q.semanticFamily)).size,normalByNostalgiaCategory:countBy(normal,category),dailyByNostalgiaCategory:countBy(daily.questions,category),familiesByNostalgiaCategory:Object.fromEntries([...new Set(normal.map(category))].map(c=>[c,[...new Set(normal.filter(q=>category(q)===c).map(Q.semanticFamily))].sort()])),normalByEra:countBy(normal,questionEra),dailyByEra:countBy(daily.questions,questionEra),normal:normal.map(row),allDaily:daily.questions.map(row),nearDuplicateExclusions:daily.excluded,relationships:{total:worldRelations.length,newCount:worldRelations.length-baseline.relationships.total,byKind:countBy(worldRelations,r=>r.kind),byMode:countBy(worldRelations,r=>r.mode),undated:worldRelations.filter(r=>!r.season).length,newEdges:worldRelations.filter(r=>r.sourceIds.some(s=>s.startsWith('p5c-')))},research:{sources:research.sources.length,modeIndexRows:research.modes.length,modeProfilesWithReleaseLabel:research.modeProfiles.length,events:research.events.length,wildlife:research.wildlife.length,companiesReviewed:90,retail:research.retail.length,equipmentIndexRows:research.externalItems.length,retainedOriginalContainers:75,containers:entities.filter(e=>e.type==='container').length},rotation:{startUTC:'2026-09-01',days:120,rounds:games.flat().length,distinct:last.size,exactRepeats:gaps.length,within7:gaps.filter(n=>n<7).length,within14:gaps.filter(n=>n<14).length,minGap:Math.min(...gaps),meanGap:gaps.reduce((a,b)=>a+b,0)/gaps.length,familyWithin3,adjacentChapterRepeats,chapterDefinition:'Repeated explicit chapter parameters on adjacent days. General and editorial era scopes do not invent an exact chapter.',eraAppearances:countBy(games.flat(),questionEra),eraByDay:games.map((g,i)=>({date:new Date(Date.UTC(2026,8,i+1)).toISOString().slice(0,10),...countBy(g,questionEra)})),minimumGroups:Math.min(...games.map(g=>new Set(g.map(Q.questionKnowledgeGroup)).size)),maxCosmetics:Math.max(...games.map(g=>g.filter(isCosmeticQuestion).length)),minimumVerified:Math.min(...games.flat().map(q=>questionQuality(q).fieldVerifiedAnswers)),daysWithFiveBroad:games.filter(g=>g.filter(q=>questionQuality(q).fieldVerifiedAnswers>=20).length>=5).length},gaps:[
  '175–200 independent Daily target not forced: actual count reported above.',
  'Global location renames/returns/replacements and launch populations remain gated; season membership does not prove launch presence.',
  'Ordinary/random boss drops, broad structure damage, complete NPC sale inventories and dated faction control remain incomplete.',
  'Large-team LTM subgroup is not a complete large-team rule population; its question remains pending. Respawn/build-rule and dated-return populations are partial; positive profile rules are retained without activating a complete-population prompt.',
  'Interactive wildlife review includes full article history, collectable fireflies, and formerly living Supply Llamas. Ambient fauna and cosmetic pets are excluded; tameable and controlled riding banks remain below normal thresholds.',
  'Middle/recent container banks lack three existing high-recall estimates and stay out of Daily; no recall scores inflated.',
  'Numeric fishing-barrel/chest/Reboot Van/vendor questions remain disabled: coordinates lack complete versioned POI boundaries and spawn contracts.',
  'Retail locations are undated unless a seasonal clause was reviewed; companies and buildings remain separate from parent POIs.',
  'External diff covers utility, consumable and trap indexes, not every weapon archive or full season loot pool.'
 ],sourceCoverage:audit.sourceCoverage,errors:audit.errors};
 fs.writeFileSync('docs/phase5c-report.json',JSON.stringify(output,null,2)+'\n');
 fs.writeFileSync('/tmp/p5c-browser-answers.json',JSON.stringify(Q.generateGame(Q.dailySeed(new Date('2026-11-11T12:00:00Z')),7).map(q=>({prompt:q.prompt,answer:entitiesById.get(q.validAnswerIds[0]).name}))));
 console.log(JSON.stringify({...output,normal:undefined,allDaily:undefined,relationships:{...output.relationships,newEdges:undefined},rotation:{...output.rotation,eraByDay:undefined},familiesByNostalgiaCategory:undefined,sourceCoverage:undefined},null,2));
 if(audit.errors.length||games.some(g=>g.length!==7)||output.rotation.within14)process.exitCode=1;
});
