import type { FortniteEntity } from '../domain/types';
import { normalizeAnswer } from '../engine/normalize';
import { factVerification } from '../engine/predicates';
import { candidate } from './catalog/helpers';
import { proof } from './catalog/history-editor';
import { definitionSourceId } from './phase4-sources';
import weapons from './research/weapon-definitions.json';
import fish from './research/fish-definitions.json';
import food from './research/food-definitions.json';
import maps from './research/chapter7-map-snapshots.json';

export function expandPhase4Catalog(bank:FortniteEntity[]):FortniteEntity[] {
 const find=(type:FortniteEntity['type'],name:string)=>bank.find(e=>e.type===type&&normalizeAnswer(e.name)===normalizeAnswer(name));
 const claim=(e:FortniteEntity,field:string,value:FortniteEntity['facts'][string],source:string,note:string)=>{e.facts[field]=value;e.factEvidence??={};const previous=e.factEvidence[field]?.status==='verified'?e.factEvidence[field].sourceIds:[];e.factEvidence[field]={...proof(source,note),sourceIds:[...new Set([...previous,source])]}};
 // Shared attributes preserve accepted legacy classifications while keeping reviewed facts separate.
 for(const e of bank.filter(e=>e.type==='item')){
  const status=factVerification(e,'itemClasses');
  if(!['legacy','verified'].includes(status))continue;
  for(const [kind,field] of [['health','restoresHealth'],['shield','restoresShield']] as const)if((e.facts.itemClasses as string[]|undefined)?.includes(kind)){
   e.facts[field]=true;
   if(status==='verified'){e.factEvidence??={};e.factEvidence[field]={...e.factEvidence.itemClasses!};}
  }
 }
 for(const row of [...fish,...food]){
  if(!row.name||!row.description)continue;
  const source=definitionSourceId(row.path);
  let e=find('item',row.name);
  if(!e){e=candidate('item',row.name,undefined,source,{},undefined,row.name==='Small Fry'?.8:row.name==='Jellyfish'?.65:.5);e.origin='expansion';e.verification='verified';bank.push(e)}
  const isFish=fish.some(f=>f.path===row.path);
  claim(e,'isConsumable',true,source,'Athena consumable definition and player-facing consumption/use description.');
  if(isFish)claim(e,'isFish',true,source,'Athena Flopper consumable family, official fish name and Fish analytical tags where present. Cosmetic color variants are not separate answers.');
  else claim(e,'isForaged',true,source,'WeaponActorClass explicitly belongs to Athena/Items/Consumables/ForagedItemVersions.');
  const description=row.description.toLowerCase();
  // Named health/shield claims only. Regenerative alone does not identify either effect.
  const health=/\bhealth\b/.test(description),shield=/\bshields?\b/.test(description);
  if(health)claim(e,'restoresHealth',true,source,row.description);
  if(shield)claim(e,'restoresShield',true,source,row.description);
  const current=Array.isArray(e.facts.itemClasses)?e.facts.itemClasses as string[]:[];
  const classes=[...new Set([...current,...(isFish?['fish']:['foraged']),...(health?['health']:[]),...(shield?['shield']:[])])];
  e.facts.itemClasses=classes;
  // The direct per-function fields are authoritative for broad healing questions.
  // Array evidence is not replaced if it includes unrelated previously reviewed functions.
  if(!current.length||current.every(c=>['health','shield','fish','foraged'].includes(c))){e.factEvidence??={};e.factEvidence.itemClasses=proof(source,'Explicit fish/foraged family and player-facing restorative description; absent effects remain unknown.');}
  const tags=row.creativeTags?.CreativeTags??[];
  if(tags.includes('Throwable'))claim(e,'isThrowable',true,source,'Explicit Throwable catalog tag; tossing a consumable is distinct from a throwable utility weapon.');
  if(row.rarity)claim(e,'catalogRarity',row.rarity.replace('EFortRarity::',''),source,'Rarity in this archived definition; not an assertion of all historical rarity levels.');
  const seasonTag=tags.find(t=>/^CH\dS\d/.test(t));
  if(seasonTag)claim(e,'catalogSeasonTag',seasonTag,source,'Creative catalog label only. Not converted into introduction or BR availability evidence.');
  if(/speed boost|low gravity|somewhere else|displacement/.test(description)||tags.includes('MobilityItem'))claim(e,'playerMobility',true,source,'Explicit mobility description or MobilityItem tag; no inferred availability window.');
  e.history??={appearances:[],changes:[],relationships:[]};
  e.history.coverageNote='Athena BR item identity and explicit effects reviewed. Exact release and in-match availability remain unknown; a cooked definition is not a spawn table.';
 }
 // Named Mythic equipment is classified from explicit item metadata, not possessive-name guesses.
 for(const row of weapons){
  if(!row.name)continue;
  const tags=row.tags??[];const creative=row.creativeTags?.CreativeTags??[];
  const utility=creative.includes('Item')&&creative.includes('MobilityItem');
  const type=utility?'item':'weapon';const source=definitionSourceId(row.path);
  let e=find(type,row.name);
  if(!e){e=candidate(type,row.name,undefined,source,{},undefined,.55);e.origin='expansion';e.verification='verified';bank.push(e)}
  claim(e,'catalogRarity',row.rarity!.replace('EFortRarity::',''),source,'Explicit rarity in the archived item definition.');
  if(!utility){
   claim(e,'hasMythicVersion',true,source,'EFortRarity::Mythic on the named weapon definition.');
   claim(e,'isWeapon',true,source,'Offensive weapon category tags; generic tool inheritance is not sufficient.');
   const weaponClass=tags.some(t=>t==='Weapon.Ranged.Minigun')?'minigun':tags.some(t=>t==='Weapon.Ranged.SMG')?'smg':tags.some(t=>/Weapon.Ranged.Assault/.test(t))?'assault rifle':tags.some(t=>/Weapon.Ranged.Shotgun/.test(t))?'shotgun':tags.some(t=>/Weapon.Ranged.(Crossbow|Bow)/.test(t))?'bow':tags.some(t=>/Weapon.Ranged.Launcher/.test(t))?'explosive':undefined;
   if(weaponClass)claim(e,'weaponClass',weaponClass,source,'Specific ranged-weapon analytic tag. Minigun and SMG tags take precedence over umbrella Assault wording.');
  }else{
   claim(e,'isMythicItem',true,source,'Mythic mobility equipment is not reclassified as an offensive weapon.');
   claim(e,'playerMobility',true,source,'Explicit MobilityItem tag and grappling/glider functionality.');
   claim(e,'itemClasses',['utility','mobility'],source,'Named grappling utility item.');
  }
  const ammo=creative.find(t=>t.startsWith('Ammo:'));if(ammo)claim(e,'ammunitionType',ammo.slice(5),source,'Explicit Ammo classification tag.');
  const seasonTag=creative.find(t=>/^CH\dS\d/.test(t));if(seasonTag)claim(e,'catalogSeasonTag',seasonTag,source,'Catalog season marker, not promoted to a verified introduction or availability window.');
 }
 // Point snapshots retain their own scope so a former landmark can later become named.
 for(const map of maps)for(const row of map.locations){
  const canonical=row.name.toUpperCase()==='THE $.$. ROCKY'?'$.$. Rocky':row.name.toLowerCase().split(' ').map(w=>w.charAt(0).toUpperCase()+w.slice(1)).join(' ');
  let e=find('location',canonical);
  if(!e){e=candidate('location',canonical,undefined,map.sourceId,{},undefined,.4);e.origin='expansion';e.verification='verified';bank.push(e)}
  if(normalizeAnswer(row.name)!==normalizeAnswer(e.name)&&!e.aliases.some(a=>normalizeAnswer(a.text)===normalizeAnswer(row.name)))e.aliases.push({text:row.name,kind:'official',confidence:'exact'});
  const named=row.type==='named';
  if(named)claim(e,'namedPoi',true,map.sourceId,'Explicit type:named and Athena.Location.POI tag in extracted core BR map.');
  else claim(e,'isLandmark',true,map.sourceId,'Explicit type:landmark in extracted core BR map. This is not an official named POI assignment.');
  e.history??={appearances:[],changes:[],relationships:[]};
  if(!e.history.appearances.some(p=>p.from===map.season&&p.through===map.season&&p.namedPoi===named&&p.sourceIds.includes(map.sourceId)))e.history.appearances.push({from:map.season,through:map.season,namedPoi:named,...proof(map.sourceId,`Positive core BR snapshot at ${map.version}. No intervening continuity or removal asserted.`)});
  const field=named?'reviewedNamedMapVersions':'reviewedLandmarkMapVersions';
  const versions=Array.isArray(e.facts[field])?e.facts[field] as string[]:[];
  claim(e,field,[...new Set([...versions,map.version])],map.sourceId,`Membership in a fully typed map snapshot at ${map.version}.`);
 }
 return bank;
}
