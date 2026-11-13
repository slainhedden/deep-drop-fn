import fs from 'node:fs';
import {withModel} from './with-model.mjs';
await withModel(async load=>{
 const {entitiesByType,entitiesById}=await load('/src/data/entities.ts'),{answerCandidates}=await load('/src/engine/candidates.ts'),{suggestionsFor,resolveAnswer}=await load('/src/engine/resolve.ts'),{questionPool,generateGame,dailySeed}=await load('/src/engine/questions.ts');
 const bank=entitiesByType('cosmetic'),queries=['rock','skull','renegade raidr','icebreaker','avatar aang'];
 let start=performance.now();suggestionsFor('rock',bank,3);const coldMs=performance.now()-start,times=[];
 for(let i=0;i<200;i++){start=performance.now();suggestionsFor(queries[i%queries.length],bank,3);times.push(performance.now()-start);}
 times.sort((a,b)=>a-b);
 const examples=[['Pleasent Park','location'],['shock wave','item'],['makeshift shotty','weapon'],['avatar aang','skin']].map(([input,type])=>({input,automaticallyAccepted:!!resolveAnswer(input,entitiesByType(type)).entity,suggestions:suggestionsFor(input,entitiesByType(type),3).map(e=>({id:e.id,name:e.name}))}));
 const questions=questionPool();let canonicalFailures=0;
 for(const q of questions)for(const id of q.validAnswerIds)if(!resolveAnswer(entitiesById.get(id).name,answerCandidates(q)).entity)canonicalFailures++;
 const report={startingCommit:'952a03bacc5be7e10afa4e0f3308c0f6fab52ac3',normalQuestions:questions.length,largeBankEntities:bank.length,coldIndexAndFirstQueryMs:coldMs,warmQueries:times.length,warmMedianMs:times[100],warmP95Ms:times[190],maximumScoredCandidates:600,canonicalFailures,examples};
 fs.writeFileSync('docs/phase5d-matching-report.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));
 const {validateAnswer}=await load('/src/engine/validation.ts');
 const fixture=generateGame(dailySeed(new Date('2026-11-11T12:00:00Z')),7).map(q=>({prompt:q.prompt,answer:entitiesById.get(q.validAnswerIds[0]).name,points:validateAnswer(q,entitiesById.get(q.validAnswerIds[0]).name).points}));fs.writeFileSync('/tmp/p5d-browser-answers.json',JSON.stringify(fixture));
 if(canonicalFailures)process.exitCode=1;
});
