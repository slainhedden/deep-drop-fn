import fs from 'node:fs';
import {parseArgs} from 'node:util';
import {withModel} from './with-model.mjs';
const {values}=parseArgs({options:{template:{type:'string'},params:{type:'string',default:'{}'},all:{type:'boolean'},search:{type:'string'},output:{type:'string'}}});
await withModel(async load=>{
 let report;
 if(values.all || values.template){
  const {inspectAnswerBank,inspectAllAnswerBanks}=await load('/src/engine/inspector.ts');
  report=values.all ? inspectAllAnswerBanks() : inspectAnswerBank(values.template,JSON.parse(values.params));
  if(values.search){
   const query=values.search.toLocaleLowerCase('en-US');
   const filter=bank=>({...bank,accepted:bank.accepted.filter(matches),excluded:bank.excluded.filter(matches)});
   const matches=row=>[row.name,...row.aliases.map(alias=>alias.text)].some(value=>value.toLocaleLowerCase('en-US').includes(query));
   report=Array.isArray(report)?report.map(filter):filter(report);
  }
 } else {
  const {questionPool}=await load('/src/engine/questions.ts');
  report=questionPool().map(question=>({templateId:question.templateId,parameters:question.parameters,prompt:question.prompt,acceptedCount:question.validAnswerIds.length,dataVersion:question.dataVersion}));
 }
 const output=JSON.stringify(report,null,2)+'\n';
 if(values.output)fs.writeFileSync(values.output,output);else process.stdout.write(output);
});
