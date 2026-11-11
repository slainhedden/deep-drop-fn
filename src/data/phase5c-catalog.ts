import type {FortniteEntity,EntityType} from '../domain/types';
import {historyEditor,proof} from './catalog/history-editor';
import {normalizeAnswer} from '../engine/normalize';
import {factVerification} from '../engine/predicates';
import {seasonById} from './seasons';
import {worldRelations,type WorldRelation} from './world-relations';
import research from './research/phase5c.json';
import originalContainers from './research/phase4b-gameplay.json';
export function expandPhase5C(bank:FortniteEntity[]):FortniteEntity[]{
 const edit=historyEditor(bank),find=(name:string,types:EntityType[])=>types.flatMap(t=>bank.filter(e=>e.type===t)).find(e=>normalizeAnswer(e.name)===normalizeAnswer(name)||e.aliases.some(a=>normalizeAnswer(a.text)===normalizeAnswer(name)));
 const mark=(e:FortniteEntity,field:string,source:string)=>edit.record(e.type,e.name,source,{[field]:true});
 const edge=(a:FortniteEntity,kind:WorldRelation['kind'],b:FortniteEntity,source:string,season?:string)=>{
  const s=seasonById.get(season??'');if(season&&!s)throw new Error(`Unknown season ${season}`);
  if(!worldRelations.some(r=>r.subjectId===a.id&&r.objectId===b.id&&r.kind===kind&&r.season===season))worldRelations.push({subjectId:a.id,kind,objectId:b.id,sourceIds:[source],season,chapter:s?.chapter,mode:kind==='featuresMechanic'?'br_ltm':s?.kind==='special'?'special_br':'core_br',status:'verified'});
 };
 const alias=(e:FortniteEntity,text:string)=>{if(text!==e.name&&!e.aliases.some(a=>a.text===text))e.aliases.push({text,kind:'official',confidence:'exact'});};
 const mechanic=(name:string,source:string)=>edit.record('feature',name,source,{isGameplayMechanic:true});
 // Index review: redirects denote alternate names/versions, not extra modes.
 for(const row of research.modes){
  if(['Crown Jam','The Combine'].includes(row.name))continue;
  const name=row.name==='Demon Rush'?'Horde Rush':row.name==='Solid Gold V2'?'Solid Gold':row.name==='Fog Of War/Sneaky Silencers'?'Fog of War':row.name.startsWith('Bounty /')?'Bounty':row.name;
  const e=edit.record('feature',name,row.sourceId,{wasBRLTM:true,modeKind:row.name==='Late Game Arena'?'rotating_ranked_playlist':'historical_br_ltm'});
  if(['Horde Rush','50v50','Solid Gold','Floor is Lava','One Shot','High Explosives','Food Fight','Endgame','Disco Domination'].includes(name))e.familiarity=Math.max(e.familiarity,.8);
  if(row.name==='Fog Of War/Sneaky Silencers')alias(e,'Sneaky Silencers');
  if(row.name.startsWith('Bounty /')){alias(e,"Wick's Bounty");alias(e,"Mando's Bounty");}
  if(row.name==='Demon Rush')alias(e,'Demon Rush');
  if(row.group==='Large-Team Modes'){
   mark(e,'ltmLargeTeams',row.sourceId);edge(e,'featuresMechanic',mechanic('Large teams',row.sourceId),row.sourceId);
  }
 }
 // Rules are positive profile claims, not a complete rule-defined answer population.
 const respawnModes=new Set(['Horde Rush','Splashdown','Team Brawl','Air Royale','Comeback','Day of Doom','Endgame','Food Fight: Deep Fried','Marvel Standoff','Marvel Takeover','Tilted Taxis']);
 for(const row of research.modeProfiles){
  const name=row.name==='Demon Rush'?'Horde Rush':row.name;
  const e=find(name,['feature']);if(!e||e.facts.wasBRLTM!==true)continue;
  edit.record(e.type,e.name,row.sourceId,{modeReleaseLabel:row.releaseDateLabel});
  if(respawnModes.has(name)){
   mark(e,'hadPlayerRespawns',row.sourceId);edge(e,'featuresMechanic',mechanic('Player respawning',row.sourceId),row.sourceId);
  }
 }
 // The index explicitly documents its transition from LTM to permanent mode.
 const rumble=edit.record('feature','Team Rumble','p5c-limited-time-modes',{wasBRLTM:true,modeKind:'permanent_former_ltm'});rumble.familiarity=.9;
 const trios=edit.record('feature','Trios','p5c-limited-time-modes',{wasBRLTM:true,modeKind:'permanent_former_ltm'});trios.familiarity=.8;
 for(const row of research.wildlife){
  const e=find(row.name,['vehicle','feature','container'])??edit.record('feature',row.name,row.sourceId);
  mark(e,'isGameplayWildlife',row.sourceId);
  if(['Wolf','Boar','Raptor','Chicken','Frog','Loot Shark','Klombo'].includes(row.name))e.familiarity=Math.max(e.familiarity,.75);
  if(row.rideable){mark(e,'supportsControlledRiding',row.sourceId);edge(e,'supportsInteraction',mechanic('Ride wildlife',row.sourceId),row.sourceId);}
  if(row.tameable){mark(e,'canBeTamed',row.sourceId);edge(e,'supportsInteraction',mechanic('Tame wildlife',row.sourceId),row.sourceId);}
  if(row.hostile)mark(e,'canBeHostileWildlife',row.sourceId);
 }
 const sprites=find('Sprites',['feature'])!;edit.record('feature',sprites.name,'p5c-sprites');
 for(const name of ['Air Sprite','Water Sprite','Earth Sprite'])alias(sprites,name);
 const crow=find('Crow',['feature'])!;alias(crow,'Crows');
 const firefly=find('Firefly',['feature'])!;alias(firefly,'Fireflies');
 const eventNames:Record<string,string>={'Rocket Launch':'Blast Off','The Unvaulting Event':'The Unvaulting','The Devourer of Worlds':'Devourer of Worlds','Zero Crisis':'Zero Crisis Finale',"Travis Scott's Astronomical":'Astronomical'};
 for(const row of research.events){
  const ambiguous=['THE END','Earthquakes','Zero Point Destabilization'].includes(row.name);
  const name=row.name==='THE END'?(row.chapter===1?'The End':'The End (Chapter 2)'):ambiguous?`${row.name} (Chapter ${row.chapter})`:eventNames[row.name]??row.name;
  const e=find(name,['event'])??edit.record('event',name,row.sourceId);
  mark(e,'isBRLiveOrStoryMoment',row.sourceId);edit.appendList(e,'eventChapters',String(row.chapter),row.sourceId);
  edit.record('event',e.name,row.sourceId,{eventKind:row.kind});
  if(row.name==='THE END')alias(e,`The End Chapter ${row.chapter}`);
  if(row.season&&seasonById.has(row.season))edit.appearance(e,row.season,row.sourceId);
  if(['ZERO HOUR','Death Star Sabotage','Super Showdown','The Confrontation','Shattered'].includes(name))e.familiarity=Math.max(e.familiarity,.7);
  if(/Major|Chapter Finale|Concert/.test(row.kind))mark(e,'isLiveEvent',row.sourceId);
  for(const name of row.locations){const location=find(name,['location']);if(!location)continue;
   mark(location,'hadLiveOrStoryMoment',row.sourceId);edge(e,'eventAt',location,row.sourceId,row.season&&seasonById.has(row.season)?row.season:undefined);
  }
 }
 // Explicit summary clauses describe these changes; mere event attendance is insufficient.
 for(const [eventName,locationName,conditions] of [
  ['The Cube Sinking','Loot Lake','The Cube altered the lake environment.'],
  ['Slurpy Swamp Abduction','Slurpy Swamp','Abduction of the Slurp Factory; not destruction of the entire POI.'],
  ['Coral Castle Abduction','Coral Castle','Abduction of the castle structures.'],
  ['Corny Complex Abduction','Corny Complex','Abduction of the central complex, not every surrounding field.'],
 ]){
  const event=find(eventName,['event']),location=find(locationName,['location']);
  const row=research.events.find(r=>r.name===eventName);
  if(!event||!location||!row?.season)continue;
  edge(event,'eventTransforms',location,row.sourceId,row.season);
  worldRelations.find(r=>r.subjectId===event.id&&r.objectId===location.id&&r.kind==='eventTransforms')!.conditions=conditions;
 }
 // Preserve canonical container identities; special-island texture variants are not extra answers.
 const containerNames:Record<string,string>={'Small Ammo Box':'Ammo Box','Treasure Chest':'Buried Treasure Chest','Freezer':'Ice Machine','Produce Boxes':'Produce Box','Candy Buckets':'Candy Bucket','Seven Chest':'Seven Supply Chest','Chest (Treasure Hunters)':'Chest','Rare Chest (Treasure Hunters)':'Rare Chest'};
 const containerChapters=new Map<string,{entity:FortniteEntity;chapter:number;source:string}>();
 for(const row of research.containers){
  const excluded=originalContainers.excludedContainers.find(r=>r.name===row.name);
  if(excluded&&!['Exotic Holo-Chest','Chest (Treasure Hunters)','Rare Chest (Treasure Hunters)'].includes(row.name)){
   if(excluded.reason.startsWith('Environmental')||excluded.reason.startsWith('Foraged')){
    const e=find(row.name,['feature','item'])??edit.record('feature',row.name,row.sourceId);
    mark(e,'isEnvironmentalLootSource',row.sourceId);
   }
   continue;
  }
  const name=containerNames[row.name]??row.name;
  const e=find(name,['container'])??find(row.name,['container'])??edit.record('container',name,row.sourceId,{isLootContainer:true,isChest:row.isChest,containerKind:'loot-container',mode:'special_br'});
  const old=containerChapters.get(e.id);
  if(!old||row.chapter<old.chapter)containerChapters.set(e.id,{entity:e,chapter:row.chapter,source:row.sourceId});
  // Explicit named loot edges do not expand vague "high-tier loot" into guessed drops.
  for(const label of row.lootLinks){const item=find(label,['item','weapon']);if(item)edge(e,'providesLoot',item,row.sourceId);}
 }
 for(const {entity,chapter,source} of containerChapters.values())edit.appendList(entity,'containerIntroductionChapters',String(chapter),source);
 // Retail classification reviews all 90 companies, not a handpicked chain list.
 for(const row of research.retail){
  const e=edit.record('feature',row.name,row.sourceId,{isRetailBusiness:true});
  for(const name of row.locations){const location=find(name,['location']);if(!location||!(location.facts.namedPoi||location.facts.worldLocation||location.facts.landmarkChapters||location.facts.unnamedChapters))continue;
   mark(location,'hadRetailBusiness',row.sourceId);edge(e,'businessAt',location,row.sourceId);
  }
 }
 for(const row of research.traps){const e=find(row.name,['item','weapon'])??edit.record('item',row.name,row.sourceId);mark(e,'isPlaceableTrap',row.sourceId);}
 // Catalog diff review: four spelling aliases and one genuinely absent identity.
 for(const prefix of ['', 'Spicy ', 'Frozen ', 'Guzzling ']){const e=find(prefix+'Ice Cream Cone',['item']);if(e){edit.record(e.type,e.name,'p5c-consumables');alias(e,prefix+'Icecream Cone');}}
 const batarang=edit.record('item','Explosive Batarang','p5c-explosive-batarang',{'function:throwable':true,'function:explosive':true,'function:structureDamage':true,isUtilityItem:true});
 edit.introduced(batarang,'C1SX','p5c-explosive-batarang');edit.appearance(batarang,'C1SX','p5c-explosive-batarang');
 edit.record('item',batarang.name,'p5c-explosive-batarang',{gameplayChapters:[1]});
 // Field review: identity already existed in 5B; missing functions are now sourced.
 const source='p5c-overdrive-grenade',overdrive=find('Overdrive Grenade',['item'])!;
 for(const tag of ['throwable','knockback','launch','rotate','speed','fallProtection']){
  mark(overdrive,`function:${tag}`,source);overdrive.factEvidence![`function:${tag}`].note=tag==='fallProtection'?'Initial explosion launch only, until landing. Overdrive status itself does not grant fall immunity.':'Explicit functionality in the reviewed item profile.';
  const functionEntity=mechanic(tag,source);edge(overdrive,'providesFunction',functionEntity,source,'C7S2');
  if(tag==='fallProtection')worldRelations.find(r=>r.subjectId===overdrive.id&&r.objectId===functionEntity.id&&r.kind==='providesFunction')!.conditions='Initial explosion launch only, until landing; not the Overdrive status effect.';
 }
 mark(overdrive,'function:rotate','p5c-epic-showdown');
 mark(overdrive,'isThrowableUtility',source);edit.introduced(overdrive,'C7S2',source);edit.appearance(overdrive,'C7S2',source);
 // Reuse positive chapter memberships; era is editorial, never launch presence.
 for(const e of bank){
  const memberships:EraMembership[]=[];
  for(const field of ['collectionChapters','bossChapters','gameplayChapters','eventChapters','containerIntroductionChapters']){
   if(factVerification(e,field)!=='verified'||!Array.isArray(e.facts[field]))continue;
   const chapters=(e.facts[field]as (string|number)[]).map(Number),evidence=e.factEvidence![field];
   for(const era of ['classic','middle','recent']as const){const low=era==='classic'?1:era==='middle'?3:5,high=era==='classic'?2:era==='middle'?4:7;
    if(chapters.some(c=>c>=low&&c<=high))memberships.push({field:`${field}:${era}`,evidence});}
  }
  for(const m of memberships){e.facts[m.field]=true;e.factEvidence??={};e.factEvidence[m.field]={...m.evidence,note:'Editorial era membership derived from verified positive chapter membership; no introduction or launch inference.'};}
 }
 return bank;
}
type EraMembership={field:string;evidence:ReturnType<typeof proof>};
