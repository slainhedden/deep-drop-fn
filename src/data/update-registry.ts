import entries from './research/update-registry.json';
import {seasonLabel} from './seasons';
export const updateRegistry=new Map(entries.map(r=>[r.version,r]));
export function updateLabel(version:string):string {
 const r=updateRegistry.get(version);if(!r)throw new Error(`Unreviewed update identity: ${version}`);
 return `${seasonLabel(r.season)}’s ${r.date} update`;
}
/** Preserve the exact update scope while displaying its documented season and date. */
export function naturalWording(text:string):string {
 return text.replace(/\bv(\d+(?:[.-]\d+)+)\b/gi,(_,version:string)=>updateLabel(version.replaceAll('-','.')));
}
