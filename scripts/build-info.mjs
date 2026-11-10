import fs from 'node:fs';
import {withModel} from './with-model.mjs';
import {sourceInfo} from './source-info.mjs';
const print=process.argv.includes('--print');
await withModel(async load=>{
 const {DATA_VERSION}=await load('/src/data/sources.ts');
 const {entities}=await load('/src/data/entities.ts');
 const {questionPool}=await load('/src/engine/questions.ts');
 const {factVerification}=await load('/src/engine/predicates.ts');
 const questions=questionPool();const byId=new Map(entities.map(entity=>[entity.id,entity]));
 const broadIds=new Set(['weapon-class','skin-battle-pass','location-catalog','collaboration-group','health-item','shield-item','utility-item','vehicle','live-event','health-and-shield-item']);
 const broadQuestions=questions.filter(question=>broadIds.has(question.templateId)).map(question=>({templateId:question.templateId,parameters:question.parameters,prompt:question.prompt,accepted:question.validAnswerIds.length,fieldVerified:question.validAnswerIds.filter(id=>question.predicates.every(predicate=>factVerification(byId.get(id),predicate.field)==='verified')).length}));
 const report={...sourceInfo(),dataVersion:DATA_VERSION,generatedAt:new Date().toISOString(),catalogEntities:entities.length,playableEntities:new Set(questions.flatMap(question=>question.validAnswerIds)).size,questionVariants:questions.length,broadQuestions};
 if(print)process.stdout.write(JSON.stringify(report,null,2)+'\n');
 else {fs.mkdirSync('.generated',{recursive:true});fs.writeFileSync('.generated/build-info.json',JSON.stringify(report,null,2)+'\n');console.log(`Prepared build ${report.buildId}: ${report.playableEntities} playable entities, ${report.questionVariants} variants.`);}
});
