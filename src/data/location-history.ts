import type { FortniteEntity, HistoricalChange } from '../domain/types';
import { normalizeAnswer } from '../engine/normalize';
import { historyEditor, proof } from './catalog/history-editor';
import research from './research/location-history.json';

/** Explicit update chronology; folder numbers are never used as season identities. */
function seasonFor(version:string):string|undefined {
 const major=Number(version.split('.')[0]);
 if(major>=11&&major<=18)return `C2S${major-10}`;
 return ({19:'C3S1',32:'REMIX2024',33:'C6S1',34:'C6S2',35:'C6GALACTIC2025',36:'C6S3',37:'C6S4',38:'C6SIMPSONS2025',39:'C7S1',40:'C7S2',41:'C7S3',42:'C7S4',43:'C7TREASURE2026'} as Record<number,string>)[major];
}
export function applyLocationHistory(bank:FortniteEntity[]):FortniteEntity[] {
 // Correct the pending spelling without changing a saved canonical ID.
 const typo=bank.find(e=>e.type==='location'&&e.name==='Fox Floodgate');
 if(typo){typo.name='Foxy Floodgate';typo.aliases.push({text:'Fox Floodgate',kind:'slang',confidence:'strong'});}
 const editor=historyEditor(bank);
 const canonical=(name:string)=>name==='The $.$. Rocky'?'$.$. Rocky':name;
 const get=(name:string)=>bank.find(e=>e.type==='location'&&normalizeAnswer(e.name)===normalizeAnswer(canonical(name)));
 for(const group of research.groups)for(const row of group.rows){
  const e=editor.record('location',canonical(row.name),row.sourceId,{namedPoi:true});
  editor.appendList(e,'reviewedIslands',group.island,row.sourceId);
  for(const season of row.seasons){
   if(!e.history?.appearances.some(p=>p.status==='verified'&&p.from===season&&p.through===season&&p.namedPoi===true&&p.sourceIds.includes(row.sourceId))){
    e.history??={appearances:[],changes:[],relationships:[]};
    e.history.appearances.push({from:season,through:season,namedPoi:true,...proof(row.sourceId,`${group.island}: positive named-location season flag; not continuous presence.`)});
   }
   // No false flags become negative season claims. A location can disappear and return within a season.
  }
  e.history!.coverageNote='Reviewed historical named-location table. Positive season membership means present at some point, not continuous availability. Island identities and special seasons are retained separately; raw note errors have explicit corrections.';
 }
 for(const group of research.groups)for(const row of group.rows){
  const e=get(row.name)!;
  let note=row.note;
  if(row.name==='Coral Castle')note=note.replace('v13.00','v13.30');
  if(row.name==='Catty Corner')note=note.replace('Removed in Update v17.00 .','');
  if(row.name==='Believer Beach')note=note.replace('v16.00','v17.00');
  if(row.name==='InnoLoop Labs')note=note.replace('Repalced by','Renamed to');
  const correction=research.corrections.find(c=>c.group===group.id&&c.name===row.name);
  const source=correction?.sourceId??row.sourceId;
  // First-ever introductions are recorded only for explicitly new names, never a reappearance on a later island.
  const intro=/^Added (?:alongside .*? in|in) Update v(\d+\.\d+)/.exec(note);
  if(intro&&e.history!.introduction?.status!=='verified'){
   const season=seasonFor(intro[1]);
   const olderKnown=['Pleasant Park','Retail Row','Salty Springs','Risky Reels','Freaky Fields'];
   if(season&&!olderKnown.includes(row.name)&&!['REMIX2024'].includes(season))editor.introduced(e,season,source);
  }
  // A new name replacing another is a distinct canonical location, linked by successor.
  for(const sentence of note.split(/(?<=\.)\s+(?=[A-Z])/)){
   const version=/Update v(\d+\.\d+)/.exec(sentence)?.[1];
   const season=version&&seasonFor(version);if(!season)continue;
   let kind:HistoricalChange['kind']|undefined,target:FortniteEntity|undefined;
   const outgoing=/^(?:Replaced by|Renamed to) (.+?) (?:in|later during)/.exec(sentence);
   if(outgoing){kind=sentence.startsWith('Renamed')?'renamed':'replaced';target=get(outgoing[1]);}
   else if(sentence.startsWith('Removed '))kind='removed';
   else if(sentence.startsWith('Returned '))kind='reintroduced';
   if(kind){
    const claim={kind,season,...(target?{relatedEntityId:target.id}:{}),...proof(source,`${group.island}: ${sentence}${correction?` Correction: ${correction.note}`:''}`)};
    if(!e.history!.changes.some(c=>c.kind===kind&&c.season===season&&c.note===claim.note))e.history!.changes.push(claim);
    if(target)e.history!.relationships.push({kind:'successor',entityId:target.id,season,...proof(source,sentence)});
   }
  }
  // Keep raw transformation/rename/removal descriptions even when no exact typed edge is asserted.
  editor.appendList(e,'reviewedLocationNotes',`${group.island}: ${note}`,source);

 }
 return bank;
}
