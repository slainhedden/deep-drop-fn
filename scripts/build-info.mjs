import fs from 'node:fs';
import {withModel} from './with-model.mjs';
import {sourceInfo} from './source-info.mjs';
const print=process.argv.includes('--print');
await withModel(async load=>{
 const {DATA_VERSION}=await load('/src/data/sources.ts');
 const {entities}=await load('/src/data/entities.ts');
 const {questionPool}=await load('/src/engine/questions.ts');
 const {contentAudit}=await load('/src/engine/content-audit.ts');
 const {qualitySummary}=await load('/src/engine/quality.ts');
 const {factVerification}=await load('/src/engine/predicates.ts');
 const questions=questionPool();const byId=new Map(entities.map(entity=>[entity.id,entity]));
 const broadIds=new Set(['weapon-class','skin-battle-pass','location-catalog','collaboration-group','health-item','shield-item','utility-item','vehicle','live-event','health-and-shield-item','weapon-general','crossover-general','weapon-mythic-version','weapon-exotic-class','loot-container','ammunition-class','foraged-class','mobility-equipment','throwable-equipment','trap-equipment','fish-class','landmark-general']);
 const broadQuestions=questions.filter(question=>broadIds.has(question.templateId)).map(question=>({templateId:question.templateId,parameters:question.parameters,prompt:question.prompt,accepted:question.validAnswerIds.length,fieldVerified:question.validAnswerIds.filter(id=>question.predicates.every(predicate=>factVerification(byId.get(id),predicate.field)==='verified')).length}));
 const quality=qualitySummary(questions);
 const content=contentAudit();
 const report={contentCounts:{verifiedClassifications:content.verifiedClassifications,namedByChapter:content.namedByChapter,pendingHistoricalClaims:content.pendingHistoricalClaims},quality:{distribution:quality.distribution,dailyEligible:quality.dailyEligible,practiceOnly:quality.practiceOnly},...sourceInfo(),dataVersion:DATA_VERSION,generatedAt:new Date().toISOString(),catalogEntities:entities.length,playableEntities:new Set(questions.flatMap(question=>question.validAnswerIds)).size,questionVariants:questions.length,broadQuestions};
 if(print)process.stdout.write(JSON.stringify(report,null,2)+'\n');
 else {fs.mkdirSync('.generated',{recursive:true});fs.writeFileSync('.generated/build-info.json',JSON.stringify(report,null,2)+'\n');console.log(`Prepared build ${report.buildId}: ${report.playableEntities} playable entities, ${report.questionVariants} variants.`);}
});
