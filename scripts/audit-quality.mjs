import fs from 'node:fs';
import {parseArgs} from 'node:util';
import {withModel} from './with-model.mjs';
const {values}=parseArgs({options:{output:{type:'string'}}});
await withModel(async load=>{
 const {auditQuestionBank}=await load('/src/engine/audit.ts');
 const report=auditQuestionBank();
 const output={dataVersion:(await load('/src/data/sources.ts')).DATA_VERSION,enabledVariants:report.questions,medianAnswers:report.medianAnswers,quality:report.quality,mostRepeatedFamilies:report.mostRepeatedFamilies,contentGaps:report.contentGaps,exclusionReview:report.exclusionReview,errors:report.errors};
 const json=JSON.stringify(output,null,2)+'\n';
 if(values.output){fs.writeFileSync(values.output,json);console.log(`Wrote quality assessments for ${report.questions} variants to ${values.output}`)}else process.stdout.write(json);
 if(report.errors.length)process.exitCode=1;
});
