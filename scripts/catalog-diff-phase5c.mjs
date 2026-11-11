// Candidate report only. No data file is imported or mutated by this command.
import fs from 'node:fs';
import {withModel} from './with-model.mjs';
await withModel(async load=>{
 const {entities}=await load('/src/data/entities.ts'),{normalizeAnswer}=await load('/src/engine/normalize.ts');
 const research=JSON.parse(fs.readFileSync(process.env.CATALOG_RESEARCH_INPUT??'src/data/research/phase5c.json','utf8'));
 const gameplay=entities.filter(e=>['item','weapon','vehicle','feature'].includes(e.type));
 const known=new Set(gameplay.flatMap(e=>[e.name,...e.aliases.map(a=>a.text)]).map(normalizeAnswer));
 const rows=research.externalItems.map(r=>({...r,decision:r.exclusion?'excluded-mode':known.has(normalizeAnswer(r.name))?'already-cataloged':'pending-human-review'}));
 const output={reviewedOn:research.reviewedOn,sources:research.sources.filter(s=>['p5c-utility-items','p5c-consumables','p5c-traps'].includes(s.id)),policy:'Candidates only. Presence in an external index does not verify classification, mode, identity, or availability. Review canonical aliases, variant identity and source profile before admission.',rows,counts:Object.fromEntries(['already-cataloged','excluded-mode','pending-human-review'].map(k=>[k,rows.filter(r=>r.decision===k).length]))};
 fs.writeFileSync(process.env.CATALOG_DIFF_OUTPUT??'docs/phase5c-catalog-diff.json',JSON.stringify(output,null,2)+'\n');console.log(output.counts);
});
