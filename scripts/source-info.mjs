import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
export function sourceFiles(root=process.cwd()) {
 const files=[];
 function walk(relative){
  const absolute=path.join(root,relative);if(!fs.existsSync(absolute))return;
  const stat=fs.lstatSync(absolute);
  if(stat.isSymbolicLink())throw new Error(`Source manifest does not follow symlinks: ${relative}`);
  if(stat.isDirectory())for(const name of fs.readdirSync(absolute).sort())walk(path.join(relative,name));else files.push(relative.split(path.sep).join('/'));
 }
 for(const entry of ['src','scripts','index.html','package.json','package-lock.json','vite.config.ts','tsconfig.json','tsconfig.app.json','tsconfig.node.json'])walk(entry);
 return files.sort();
}
export function sourceInfo(root=process.cwd()) {
 const git=(...args)=>{const result=spawnSync('git',args,{cwd:root,encoding:'utf8'});return result.status===0?result.stdout.trim():null;};
 const hash=createHash('sha256');
 for(const relative of sourceFiles(root)){hash.update(relative+'\0');hash.update(fs.readFileSync(path.join(root,relative)));hash.update('\0');}
 const sourceCommit=git('rev-parse','--verify','HEAD');const sourceBranch=git('branch','--show-current');const status=git('status','--porcelain');
 const sourceFingerprint=hash.digest('hex');const dirty=status===null?null:!!status;
 return {sourceCommit,sourceBranch:sourceBranch||null,dirty,sourceFingerprint,buildId:`${sourceCommit?.slice(0,12)??'no-git'}${dirty?'-dirty':''}-${sourceFingerprint.slice(0,12)}`};
}
