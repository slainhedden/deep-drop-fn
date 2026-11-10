import fs from 'node:fs';
import {withModel} from './with-model.mjs';
await withModel(async load=>{
 const {entities,entitiesById}=await load('/src/data/entities.ts');
 const {questionPool,generateGame,generatePractice,dailySeed,semanticFamily,independentDailyForAudit,questionKnowledgeGroup}=await load('/src/engine/questions.ts');
 const {questionQuality}=await load('/src/engine/quality.ts');
 const {auditQuestionBank}=await load('/src/engine/audit.ts');
 const {DATA_VERSION}=await load('/src/data/sources.ts');
 const report=auditQuestionBank(),pool=questionPool(),archive=questionPool({expert:true});
 const playableIds=new Set(pool.flatMap(q=>q.validAnswerIds));
 const countBy=(rows,key)=>Object.fromEntries([...new Set(rows.map(key))].sort().map(k=>[k,rows.filter(r=>key(r)===k).length]));
 const membershipSets=new Set(entities.flatMap(e=>e.cosmetic?.memberships.filter(m=>m.kind==='set').map(m=>m.id)??[]));
 const compare=(games)=>{
  let adjacent=0,within14=0,familyWithin3=0;const lastIds=new Map(),lastFamily=new Map();const gaps=[];
  for(let d=0;d<games.length;d++){
   for(const q of games[d]){
    const prev=lastIds.get(q.id);if(prev!==undefined){const gap=d-prev;gaps.push(gap);if(gap===1)adjacent++;if(gap<14)within14++;}
    lastIds.set(q.id,d);
   }
   for(const family of new Set(games[d].map(semanticFamily))){if(d-(lastFamily.get(family)??-100)<3)familyWithin3++;lastFamily.set(family,d);}
  }
  return {distinctQuestionsUsed:new Set(games.flat().map(q=>q.id)).size,adjacentExactRepeats:adjacent,exactRepeatsWithin14Days:within14,semanticFamilyRepeatsWithin3Days:familyWithin3,minimumExactRepeatGap:gaps.length?Math.min(...gaps):null,meanExactRepeatGap:gaps.length?Number((gaps.reduce((a,b)=>a+b,0)/gaps.length).toFixed(2)):null};
 };
 const days=120,current=[],baseline=[];
 for(let d=1;d<=days;d++){const date=new Date(Date.UTC(2026,8,d));current.push(generateGame(dailySeed(date),7));baseline.push(independentDailyForAudit(date));}
 const counts=current.flat().map(q=>questionQuality(q).fieldVerifiedAnswers),band=(lo,hi)=>counts.filter(n=>n>=lo&&n<=hi).length;
 const eligible=pool.filter(q=>questionQuality(q).dailyEligible);
 const practiceIds=[],practice=[];
 for(let d=0;d<12;d++){const game=generatePractice('audit-practice-'+d,7,undefined,practiceIds.slice(-140));practice.push(game);practiceIds.push(...game.map(q=>q.id));}
 const output={dataVersion:DATA_VERSION,catalogEntities:entities.length,playableEntities:playableIds.size,playableByCategory:countBy([...playableIds].map(id=>entitiesById.get(id)),e=>e.type),cosmeticsByType:countBy(entities.filter(e=>e.cosmetic),e=>e.cosmetic.type),verifiedSetIdentities:membershipSets.size,enabledTemplates:report.enabledTemplates,normalVariants:pool.length,expertArchiveVariants:archive.filter(q=>!pool.some(p=>p.id===q.id)).length,newBanks:pool.filter(q=>/^(rotation-general|flight-general|launch-general|loot-container|restorative-general|throwable-general|high-ground|skin-item-shop|skin-historical-rarity|cosmetic-|skin-pass-chapter|skin-bundle|winterfest-presents)/.test(q.templateId)).map(q=>({templateId:q.templateId,parameters:q.parameters,prompt:q.prompt,accepted:q.validAnswerIds.length,verified:questionQuality(q).fieldVerifiedAnswers,dailyEligible:questionQuality(q).dailyEligible})),daily:{sampleDays:days,rounds:counts.length,minimumVerifiedAnswers:Math.min(...counts),bands:{'15to19':band(15,19),'20to49':band(20,49),'50to99':band(50,99),'100plus':band(100,Infinity)},daysWithFiveBroadRounds:current.filter(g=>g.filter(q=>questionQuality(q).fieldVerifiedAnswers>=20).length>=5).length,daysWithSevenKnowledgeGroups:current.filter(g=>new Set(g.map(questionKnowledgeGroup)).size===7).length,eligibleVariants:eligible.length,exactFourteenDayCapacityRequired:98,capacitySupportsFourteenDays:eligible.length>=98,comparisonBaseline:'Same Phase 4B eligible banks with the previous independent seeded-day selector.',previousIndependentSelector:compare(baseline),historicalSelector:compare(current)},practice:{sampleGames:practice.length,rounds:practice.flat().length,distinctQuestions:new Set(practice.flat().map(q=>q.id)).size},duplicateCosmeticNamesWithinType:entities.filter(e=>e.cosmetic).length-new Set(entities.filter(e=>e.cosmetic).map(e=>`${e.cosmetic.type}:${e.name.toLowerCase()}`)).size,ambiguousAliases:report.ambiguousAliases,sourceCoverage:report.sourceCoverage,quality:report.quality,remainingGaps:report.contentGaps,errors:report.errors};
 fs.writeFileSync('docs/phase4b-report.json',JSON.stringify(output,null,2)+'\n');
 console.log(JSON.stringify({playable:output.playableEntities,playableByCategory:output.playableByCategory,cosmetics:output.cosmeticsByType,templates:output.enabledTemplates,variants:output.normalVariants,archive:output.expertArchiveVariants,daily:output.daily,practice:output.practice,duplicates:output.duplicateCosmeticNamesWithinType,errors:output.errors},null,2));
 if(report.errors.length)process.exitCode=1;
});
