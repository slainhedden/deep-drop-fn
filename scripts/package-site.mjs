import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {sourceFiles,sourceInfo} from './source-info.mjs';
const build=spawnSync('npm',['run','build'],{stdio:'inherit'});
if(build.status!==0)process.exit(build.status??1);
const metadata=JSON.parse(fs.readFileSync('dist/build-info.json','utf8'));
if(metadata.sourceFingerprint!==sourceInfo().sourceFingerprint)throw new Error('Source changed during the build. Rebuild before packaging.');
const extras=['README.md','.gitignore','.openai/hosting.json'];
function docs(directory){if(!fs.existsSync(directory))return [];return fs.readdirSync(directory,{withFileTypes:true}).flatMap(entry=>entry.isDirectory()?docs(path.join(directory,entry.name)):[path.join(directory,entry.name)]);}
const files=[...new Set([...sourceFiles(),...extras,...docs('docs')])].filter(file=>fs.existsSync(file));
fs.writeFileSync('.generated/package-manifest.json',JSON.stringify({root:process.cwd(),files,metadata},null,2));
const packed=spawnSync('python3',['scripts/package-site.py','.generated/package-manifest.json'],{stdio:'inherit'});
process.exit(packed.status??1);
