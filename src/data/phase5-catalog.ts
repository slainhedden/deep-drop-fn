import type {FortniteEntity} from '../domain/types';
import {historyEditor,proof} from './catalog/history-editor';
import {normalizeAnswer} from '../engine/normalize';
import {factVerification} from '../engine/predicates';
import {seasonById} from './seasons';
import research from './research/phase5a.json';
const bossAliases:Record<string,string>={'Gorgers':'Gorger','Spire Guardians':'Spire Guardian','Alpha Heavies':'Alpha Heavy','Commanders':'Commander','Clubs Dealers':'Clubs Dealer','Highcards':'Highcard','Herald':'The Herald','The Ageless Champion':'The Ageless','Doctor Victor Von Doom':'Doctor Doom','The Night Rose':'Night Rose'};
const periodIds:Record<string,string>={C7MS:'C7TREASURE2026',C6MS1:'C6GALACTIC2025',C6MS2:'C6SIMPSONS2025'};
export function expandPhase5(bank:FortniteEntity[]):FortniteEntity[]{
 const edit=historyEditor(bank);
 const find=(type:FortniteEntity['type'],name:string)=>edit.byName.get(`${type}:${normalizeAnswer(name)}`);
 for(const row of research.locations){
  // Preserve Epic's explicit landmark classification over the conflicting wiki row.
  if(normalizeAnswer(row.name)===normalizeAnswer("Doom's Courtyard"))continue;
  const e=edit.record('location',row.name,row.sourceId,{namedPoi:true});
  for(const season of row.seasons)edit.appearance(e,season,row.sourceId,true);
 }
 for(const row of research.characters){
  const season=periodIds[row.period]??row.period;const chapter=seasonById.get(season)?.chapter;if(!chapter)continue;
  const e=edit.record('npc',row.name,row.sourceId,{inCharacterCollection:true});
  edit.appearance(e,season,row.sourceId);
  const chapters=Array.isArray(e.facts.collectionChapters)?e.facts.collectionChapters as number[]:[];
  edit.record('npc',e.name,row.sourceId,{collectionChapters:[...new Set([...chapters,chapter])]});
  const outfit=find('skin',row.name);e.familiarity=Math.max(e.familiarity,outfit?.familiarity??.4);
 }
 for(const row of research.bosses){
  const preferred=bossAliases[row.name]??row.name;const name=(find('boss',preferred)??find('boss',row.name))?.name??preferred;
  const e=edit.record('boss',name,row.sourceId,{isBoss:true,isAiBoss:true});
  if(row.name!==name&&!e.aliases.some(a=>a.text===row.name))e.aliases.push({text:row.name,kind:'official',confidence:'exact'});
  edit.appendList(e,'reviewedBossKinds',row.kind,row.sourceId);
  if(row.mythicLoot)edit.record('boss',name,row.sourceId,{hasDocumentedMythicLoot:true});
  const outfit=find('skin',name);e.familiarity=Math.max(e.familiarity,outfit?.familiarity??.4);
 }
 for(const row of research.weapons){
  const e=edit.record('weapon',row.name,row.sourceId,{isWeapon:true});
  // Assault Weapons is an umbrella containing SMGs and miniguns. Never recast it as AR evidence.
  if(row.weaponClass!=='assault rifle'&&(factVerification(e,'weaponClass')!=='verified'||e.facts.weaponClass===row.weaponClass))edit.record('weapon',row.name,row.sourceId,{weaponClass:row.weaponClass});
  if(row.automatic)edit.record('weapon',e.name,row.sourceId,{hasAutomaticMode:true});
  if(row.burst)edit.record('weapon',e.name,row.sourceId,{hasBurstMode:true});
  const ammo=['Light Bullets','Medium Bullets','Heavy Bullets','Shells','Energy Cells'].filter(a=>row.ammo.includes(a));
  for(const kind of ammo)edit.appendList(e,'reviewedAmmo',kind,row.sourceId);
 }
 for(const row of research.vaults){
  const e=find('location',row.name);if(!e||e.facts.namedPoi!==true||factVerification(e,'namedPoi')!=='verified')continue;
  edit.record('location',e.name,row.sourceId,{hasReviewedVault:true});
  if(row.bossNames.some(name=>find('boss',bossAliases[name]??name)?.facts.isAiBoss===true))edit.record('location',e.name,row.sourceId,{hasReviewedBoss:true});
 }
 const styles=new Set(research.styleIds.map(id=>id.toLowerCase()));
 for(const e of bank){
  if(e.cosmetic?.externalIds.some(id=>!/(TBD|CINE|NPC|TEST)/i.test(id)&&styles.has(id.toLowerCase()))){e.facts.hasSelectableStyles=true;e.factEvidence??={};e.factEvidence.hasSelectableStyles=proof('phase5-cosmetic-styles','At least two selectable STYLE options on a public cosmetic definition. Cinematic, test and NPC definitions are excluded.');}
  if(e.type==='npc'&&Array.isArray(e.facts.collectionChapters)&&e.facts.collectionChapters.length>=2){e.facts.multipleCollectionChapters=true;e.factEvidence??={};e.factEvidence.multipleCollectionChapters={...e.factEvidence.collectionChapters!};}
  if(e.type==='container'&&e.facts.isChest===true&&factVerification(e,'isChest')==='verified'&&/Chest|Coffer|Footlocker/.test(e.name)){e.facts.isNamedChestVariant=true;e.factEvidence??={};e.factEvidence.isNamedChestVariant={...e.factEvidence.isChest!};}
  if(e.type!=='location')continue;
  const appearances=e.history?.appearances.filter(p=>p.status==='verified'&&p.namedPoi===true)??[];
  const chapters=[...new Set(appearances.flatMap(p=>[p.from,p.through]).map(id=>seasonById.get(id)).filter(s=>s&&s.kind!=='throwback').map(s=>s!.chapter))];
  if(chapters.length){e.facts.numberedChapterAppearances=chapters;e.factEvidence??={};e.factEvidence.numberedChapterAppearances={status:'verified',sourceIds:[...new Set(appearances.flatMap(p=>p.sourceIds))],note:'Numbered chapter membership excludes OG and Remix throwbacks, which have their own questions.'};}
  const periods=new Set(appearances.flatMap(p=>[p.from,p.through]));
  if(periods.size>=2){e.facts.multipleNamedSeasons=true;e.factEvidence??={};e.factEvidence.multipleNamedSeasons={status:'verified',sourceIds:[...new Set(appearances.flatMap(p=>p.sourceIds))],note:'At least two independently documented season endpoints; no uninterrupted continuity asserted.'};}
  for(const period of ['OG2023','REMIX2024'])if(appearances.some(p=>p.from===period&&p.through===period)){
   const evidence=appearances.find(p=>p.from===period&&p.through===period)!;
   edit.appendList(e,'reviewedThrowbacks',period,evidence.sourceIds[0]);
  }
 }
 return bank;
}
