import type {EntityType,FortniteEntity} from '../domain/types';
import {historyEditor,proof} from './catalog/history-editor';
import {normalizeAnswer} from '../engine/normalize';
import {factVerification} from '../engine/predicates';
import {seasonById,compareSeasons} from './seasons';
export const unresolvedWorldClaims:{kind:string;name:string;subject?:string;season?:string;sourceId:string;reason:string}[]=[];
export const withheldWorldClaims:{entityId:string;season:string;sourceId:string;reason:string}[]=[];
import {worldRelations,type WorldRelation} from './world-relations';
import research from './research/phase5b.json';
const functionalTypes:EntityType[]=['weapon','item','vehicle','container','feature'];
const knownAliases:Record<string,string>={"Deadpool's Dual Hand Cannons":"Deadpool's Hand Cannons",'Icecream Cone':'Ice Cream Cone','Spicy Icecream Cone':'Spicy Ice Cream Cone','Frozen Icecream Cone':'Frozen Ice Cream Cone','Guzzling Icecream Cone':'Guzzling Ice Cream Cone','Small Fry':'Small Fry','All Terrain Kart':'ATK','The Baller':'Baller','OG Bear':'Bear','Titano Mudflap':'Mudflap','Victory Motors Whiplash':'Whiplash','Legacy Dragon’s Breath Shotgun':'Dragon’s Breath Shotgun','Gorgers':'Gorger','Spire Guardians':'Spire Guardian','Alpha Heavies':'Alpha Heavy','Commanders':'Commander','Clubs Dealers':'Clubs Dealer','Highcards':'Highcard','Herald':'The Herald','The Ageless Champion':'The Ageless','Doctor Victor Von Doom':'Doctor Doom','The Night Rose':'Night Rose'};
export function expandPhase5B(bank:FortniteEntity[]):FortniteEntity[]{
 const edit=historyEditor(bank);
 const find=(name:string,types:EntityType[])=>{
  const base=name.replace(/\bModular /g,'').replace(/\/Chapter \d+$/,'').replace(/ \(OG\)$/,'');
  const normalized=normalizeAnswer(knownAliases[name]??base);
  const exact=types.map(type=>edit.byName.get(`${type}:${normalizeAnswer(name)}`)??edit.byName.get(`${type}:${normalized}`)).find(Boolean);if(exact)return exact;
  const aliased=bank.filter(e=>types.includes(e.type)&&e.aliases.some(a=>a.confidence!=='contextual'&&normalizeAnswer(a.text)===normalized));
  return aliased.length===1?aliased[0]:undefined;
 };
 const record=(type:EntityType,name:string,source:string,facts:FortniteEntity['facts']={})=>{
  const e=find(name,[type]);return edit.record(type,e?.name??knownAliases[name]??name,source,facts);
 };
 const list=(e:FortniteEntity,field:string,value:string|number,source:string)=>{
  const prior=Array.isArray(e.facts[field])?e.facts[field] as (string|number)[]:[];
  e.facts[field]=[...new Set([...prior,value])] as string[]|number[];e.factEvidence??={};e.factEvidence[field]={...proof(source,'Explicit positive membership in the reviewed source scope.'),sourceIds:[...new Set([...(e.factEvidence[field]?.sourceIds??[]),source])]};
 };
 const edge=(subject:FortniteEntity,kind:WorldRelation['kind'],object:FortniteEntity,source:string,season?:string)=>{
  const s=seasonById.get(season??'');if(season&&!s)return;
  const row:WorldRelation={subjectId:subject.id,kind,objectId:object.id,season,chapter:s?.chapter,mode:s?.kind==='special'?'special_br':'core_br',sourceIds:[source],status:'verified'};
  const existing=worldRelations.find(r=>r.subjectId===row.subjectId&&r.kind===kind&&r.objectId===object.id&&r.season===season);
  if(existing){if(!existing.sourceIds.includes(source))existing.sourceIds.push(source);}else worldRelations.push(row);
 };
 const place=(name:string,source:string)=>record('location',name,source,{worldLocation:true});
 const mark=(e:FortniteEntity,field:string,source:string)=>record(e.type,e.name,source,{[field]:true});
 const appearance=(e:FortniteEntity,season:string|undefined,source:string)=>{if(!season||!seasonById.has(season))return;const intro=e.history?.introduction;if(intro?.status==='verified'&&compareSeasons(season,intro.season)<0){withheldWorldClaims.push({entityId:e.id,season,sourceId:source,reason:`Index season conflicts with retained verified introduction ${intro.season}; no earlier availability promoted.`});return;}edit.appearance(e,season,source);};
 // Reuse canonical typed identities; utility tables do not recast existing weapons as items.
 for(const row of research.items){
  let e=find(row.name,functionalTypes);
  if(!e)e=record(row.kind as EntityType,row.name,row.sourceId,{[row.kind==='weapon'?'isWeapon':row.sourceId==='p5b-consumables'?'isConsumable':'isUtilityItem']:true});
  for(const tag of row.tags){mark(e,`function:${tag}`,row.sourceId);if(tag==='health')mark(e,'restoresHealth',row.sourceId);if(tag==='shield')mark(e,'restoresShield',row.sourceId);}
  if(row.tags.includes('health')||row.tags.includes('shield'))mark(e,'function:restorative',row.sourceId);
  appearance(e,row.season??undefined,row.sourceId);
 }
 for(const row of research.mechanics){
  const e=find(row.name,functionalTypes)??record((row.kind??'item')as EntityType,row.name,row.sourceId);
  for(const tag of row.tags){mark(e,`function:${tag}`,row.sourceId);e.factEvidence![`function:${tag}`].note=row.note;if(tag==='health')mark(e,'restoresHealth',row.sourceId);if(tag==='shield')mark(e,'restoresShield',row.sourceId);}
  if(row.kind==='feature'&&row.tags.includes('rotate'))mark(e,'environmentalMobility',row.sourceId);
  appearance(e,row.season??undefined,row.sourceId);
 }
 for(const row of research.healing){
  const e=find(row.name,functionalTypes)??record('item',row.name,row.sourceId,{isConsumable:true});
  if(row.health){mark(e,'restoresHealth',row.sourceId);mark(e,'function:health',row.sourceId);}
  if(row.shield){mark(e,'restoresShield',row.sourceId);mark(e,'function:shield',row.sourceId);}
  if(row.health||row.shield)mark(e,'function:restorative',row.sourceId);
  if(row.overtime)mark(e,'healingOverTime',row.sourceId);if(row.allies)mark(e,'healsOtherPlayers',row.sourceId);if(row.foraged)mark(e,'isForaged',row.sourceId);
  list(e,'gameplayChapters',row.chapter,row.sourceId);
 }
 for(const row of research.lowGravity){const e=find(row.name,functionalTypes);
  if(!e||!e.history?.appearances.some(a=>a.status==='verified'))continue;
  mark(e,'function:lowGravity',row.sourceId);
 }
 // Motel's article explicitly distinguishes its Chapter 1 identity from Reload.
 const motel=place('Motel','p5b-motel');list(motel,'unnamedChapters',1,'p5b-motel');
 for(const row of research.mapPlaces){
  const e=place(row.name,row.sourceId);
  list(e,row.kind==='Landmarks'?'landmarkChapters':'unnamedChapters',row.chapter,row.sourceId);
  list(e,'worldIslands',row.island,row.sourceId);
  if(row.kind==='Landmarks')mark(e,'isLandmark',row.sourceId);
 }
 for(const row of research.landmarks){const e=place(row.name,row.sourceId);mark(e,'isLandmark',row.sourceId);for(const season of row.seasons)appearance(e,season,row.sourceId);}
 for(const row of research.npcLocations){
  const npc=find(row.name,['npc']);if(!npc)continue;
  for(const name of row.locations){const e=place(name,row.sourceId);edge(npc,row.near?'near':'spawnsAt',e,row.sourceId,row.season);
   if(!row.near){mark(e,'hadCollectionNPC',row.sourceId);const chapter=seasonById.get(row.season)?.chapter;if(chapter)list(e,'npcLocationChapters',chapter,row.sourceId);}
  }
 }
 for(const row of research.lootProfiles){
  const e=find(row.name,functionalTypes)??record(row.kind as EntityType,row.name,row.sourceId,{isGameplayEquipment:true});
  if(normalizeAnswer(row.name)!==normalizeAnswer(e.name)&&!row.name.includes('/Chapter')&&!e.aliases.some(a=>normalizeAnswer(a.text)===normalizeAnswer(row.name)))e.aliases.push({text:row.name,kind:'official',confidence:'strong'});
  if((row.acquires.length||row.sales.length)&&row.kind==='weapon')mark(e,'isWeapon',row.sourceId);
 }
 const purchase=record('feature','Purchase Item','p5b-characters',{worldKind:'npc-service',npcInteraction:true});
 for(const row of research.lootProfiles){const e=find(row.name,functionalTypes);if(!e)continue;
  for(const sale of row.sales){const npc=find(sale.npc,['npc']);if(!npc)continue;edge(npc,'sells',e,row.sourceId,sale.season);edge(npc,'offersService',purchase,row.sourceId,sale.season);}
 }
 // Every reviewed AI boss encounter is retained. Unknown loot identity/classification stays unresolved.
 for(const boss of bank.filter(e=>e.type==='boss'))for(const r of boss.history?.relationships??[]){
  if(r.status!=='verified'||r.kind!=='mythic'||r.variant!=='mythic')continue;const target=bank.find(e=>e.id===r.entityId);if(!target)continue;edge(boss,'mythicDrop',target,r.sourceIds[0],r.season);mark(target,'bossLoot',r.sourceIds[0]);mark(target,'bossMythicLoot',r.sourceIds[0]);
 }
 for(const row of research.bosses){
  const boss=find(row.name,['boss'])??record('boss',row.name,row.sourceId,{isBoss:true,isAiBoss:true});
  const outfit=find(row.name,['skin']);if(outfit)boss.familiarity=Math.max(boss.familiarity,outfit.familiarity);
  if(row.loot.some(l=>l.rarity==='mythic'))mark(boss,'hasDocumentedMythicLoot',row.sourceId);
  if(row.season){appearance(boss,row.season,row.sourceId);const chapter=seasonById.get(row.season)?.chapter;if(chapter)list(boss,'bossChapters',chapter,row.sourceId);}
  if(row.keycard){const card=record('feature','Keycard',row.sourceId,{worldKind:'keycard'});edge(boss,'keycard',card,row.sourceId,row.season??undefined);mark(boss,'hasKeycard',row.sourceId);}
  for(const loot of row.loot){
   const e=find(loot.name,functionalTypes);if(!e){unresolvedWorldClaims.push({kind:'loot',name:loot.name,subject:boss.id,season:row.season??undefined,sourceId:row.sourceId,reason:'Loot identity/classification unresolved; not guessed from a possessive name.'});continue;}
   edge(boss,loot.rarity==='mythic'?'mythicCarry':'carries',e,row.sourceId,row.season??undefined);
   mark(e,'bossLoadout',row.sourceId);
   const profile=research.lootProfiles.find(p=>p.name===loot.name);
   const acquisition=profile?.acquires.find(a=>normalizeAnswer(a.boss.replace(/^The /,''))===normalizeAnswer(row.name.replace(/^The /,''))&&a.season===row.season);
   if(acquisition){edge(boss,loot.rarity==='mythic'?'mythicDrop':'drops',e,profile!.sourceId,row.season??undefined);mark(e,'bossLoot',profile!.sourceId);
    if(loot.rarity==='mythic'){mark(e,'bossMythicLoot',profile!.sourceId);if(e.type==='weapon')mark(e,'hasMythicVersion',profile!.sourceId);}
    if(row.season)appearance(e,row.season,profile!.sourceId);
    for(const name of acquisition.locations){const loc=find(name,['location']);if(!loc)continue;edge(boss,acquisition.near?'near':'spawnsAt',loc,profile!.sourceId,row.season??undefined);if(!acquisition.near){mark(loc,'hadAIBoss',profile!.sourceId);if(loot.rarity==='mythic')mark(loc,'hadMythicBoss',profile!.sourceId);}}
   }
  }
  for(const name of row.locations)edge(boss,'spawnsAt',place(name,row.sourceId),row.sourceId,row.season??undefined);
 }
 const vaultFeature=record('feature','Vault','p5b-vaults',{worldKind:'vault'});
 for(const row of research.vaults){
  let names=row.locations;
  if(/Seven Outposts? I[-–]VII/.test(row.locationText))names=['I','II','III','IV','V','VI','VII'].map(n=>'Seven Outpost '+n);
  else if(/Seven Outposts? II , III/.test(row.locationText))names=['II','III','IV','V','VII'].map(n=>'Seven Outpost '+n);
  for(const raw of names){const name=raw==="Deadpool's Yacht"?'The Yacht':raw;const e=find(name,['location']);if(!e)continue;
   edge(vaultFeature,'vaultIn',e,row.sourceId,row.season);if(e.facts.namedPoi===true||e.facts.isLandmark===true)mark(e,'worldVaultLocation',row.sourceId);
   for(const name of row.bossNames){const boss=find(name,['boss']);if(!boss)continue;edge(boss,'spawnsAt',e,row.sourceId,row.season);mark(e,'hadAIBoss',row.sourceId);if(worldRelations.some(r=>r.subjectId===boss.id&&r.season===row.season&&r.kind==='mythicDrop'))mark(e,'hadMythicBoss',row.sourceId);}
  }
 }
 for(const row of research.bossLocations){const boss=find(row.name,['boss']);if(!boss)continue;
  for(const name of row.locations){const e=place(name,row.sourceId);edge(boss,row.near?'near':'spawnsAt',e,row.sourceId,row.season);
   if(row.near)continue;mark(e,'hadAIBoss',row.sourceId);
   if(worldRelations.some(r=>r.subjectId===boss.id&&r.kind==='mythicDrop'&&r.season===row.season))mark(e,'hadMythicBoss',row.sourceId);
  }
 }
 for(const row of research.vehicles){
  const e=record('vehicle',row.name,row.sourceId,{isVehicle:true,passengerSeats:row.seats});appearance(e,row.season??undefined,row.sourceId);
  if(row.seats>=2)mark(e,'carriesPassengers',row.sourceId);
 }
 for(const row of research.foodBusinesses){
  const business=record('feature',row.name,row.sourceId,{isFoodBusiness:true,worldKind:'food-business'});
  if(['Durrr Burger',"Uncle Pete's Pizza Pit",'BURD','Noms','Slurp Co.','Slap Co.','Big Shots','Sticks'].includes(row.name))business.familiarity=Math.max(business.familiarity,.75);
  const aliases:Record<string,string[]>={"Uncle Pete's Pizza Pit":['Pizza Pit','Pizza Pete'],BURD:['Burd'],"Meowscle's Morsels":["Meowscles' Morsels"]};
  for(const text of aliases[row.name]??[])if(normalizeAnswer(text)!==normalizeAnswer(row.name))business.aliases.push({text,kind:'official',confidence:'strong'});
  for(const name of row.locations){const e=find(name,['location']);if(!e||!(e.facts.namedPoi===true||e.facts.worldLocation===true||e.facts.isLandmark===true))continue;edge(business,'foodBusinessAt',e,row.sourceId);mark(e,'hadFoodBusiness',row.sourceId);}
 }
 for(const row of research.guards){const e=record('npc',row.name==='The First Order'?'First Order Stormtroopers':row.name,row.sourceId,{isGuardType:true});appearance(e,row.season,row.sourceId);const chapter=seasonById.get(row.season)?.chapter;if(chapter&&seasonById.get(row.season)?.kind!=='throwback')list(e,'guardChapters',chapter,row.sourceId);}
 const gas=record('feature','Gas Station', 'p5b-gas-station',{worldKind:'fuel'}),bench=record('feature','Upgrade Bench','p5b-upgrade-bench',{worldKind:'upgrade'});
 for(const [rows,feature,kind,field]of [[research.gasStations,gas,'gasStationIn','hadGasStation'],[research.upgradeBenches,bench,'upgradeBenchIn','hadUpgradeBench']]as const){
  for(const row of rows){const e=place(row.name,row.sourceId);edge(feature,row.near?'near':kind,e,row.sourceId,row.season);
   if(!row.near){mark(e,field,row.sourceId);const chapter=seasonById.get(row.season)?.chapter;if(chapter)list(e,`${field}Chapters`,chapter,row.sourceId);list(e,`${field}Seasons`,row.season,row.sourceId);}
  }
 }
 const serviceAliases:Record<string,string[]>={'Hire Character':['Hire an NPC','Hire','Recruit an NPC'],'Activate Rift':['Buy a rift','Rift'],'Activate Prop Disguise':['Prop disguise','Propify'],'Upgrade Weapon':['Weapon upgrade','Upgrade'],'Patch Up':['Healing','Buy healing','Heal'],'Purchase Item':['Buy an item','Buy a weapon'],'Reveal Future Storm Circle':['Storm forecast','Reveal storm circle'],'Bounty':['Start a bounty','Bounty contract'],'Conversation':['Talk'],'Quest':['Get a quest'],'Mass Supply Drop':['Supply drop'],'Small Tip':['Tip'],'Large Tip':['Tip']};
 for(const row of research.services){
  const nm=/^(Small|Large) Tip$/.test(row.name)?'Tip':row.name;const e=record('feature',nm,row.sourceId,{worldKind:'npc-service',npcInteraction:true});
  if(['Hire Character','Activate Rift','Upgrade Weapon','Purchase Item','Patch Up','Bounty','Quest'].includes(nm))e.familiarity=Math.max(e.familiarity,.75);
  for(const text of serviceAliases[row.name]??[])if(normalizeAnswer(text)!==normalizeAnswer(nm)&&!e.aliases.some(a=>a.text===text))e.aliases.push({text,kind:'official',confidence:'strong'});
 }
 for(const row of research.guardProfiles){
  const guard=find(row.name==='The First Order'?'First Order Stormtroopers':row.name,['npc']);if(!guard)continue;
  for(const name of row.factions){const existing=find(name,['faction']);const prior=existing?.familiarity??.4;const faction=record('faction',name,row.sourceId,{hasGuardAssociation:true,isFaction:true});
   faction.familiarity=Math.max(prior,['GHOST','SHADOW','Imagined Order','The Seven','Galactic Empire','First Order'].includes(name)?.75:.4);
   edge(guard,'faction',faction,row.sourceId);
  }
 }
 for(const row of research.fire){
  const e=find(row.name,functionalTypes)??record('feature',row.name,row.sourceId,{worldKind:'fire-source'});mark(e,'function:fire',row.sourceId);
 }
 for(const nm of ['Lightning Storm','Burning Prop','Car'])mark(record('feature',nm,'p5b-fire',{worldKind:'fire-source'}),'function:fire','p5b-fire');
 for(const r of worldRelations){if(r.kind!=='mythicDrop')continue;const target=bank.find(e=>e.id===r.objectId),boss=bank.find(e=>e.id===r.subjectId);if(target?.type==='weapon'&&boss)mark(boss,'droppedMythicWeapon',r.sourceIds[0]);}
 // Derived flags require field-level proof or a positive, mode-scoped appearance, never assets/dates.
 for(const e of bank){
  const appearances=e.history?.appearances.filter(a=>a.status==='verified'&&seasonById.get(a.from)?.kind!=='throwback')??[];
  const chapters=[...new Set(appearances.flatMap(a=>[a.from,a.through]).map(id=>seasonById.get(id)?.chapter).filter((v):v is number=>!!v))];
  for(const chapter of chapters){const sources=appearances.filter(a=>seasonById.get(a.from)?.chapter===chapter).flatMap(a=>a.sourceIds);if(sources[0])list(e,'gameplayChapters',chapter,sources[0]);}
  if(Array.isArray(e.facts.gameplayChapters)&&e.facts.gameplayChapters.length>=2&&factVerification(e,'gameplayChapters')==='verified'&&functionalTypes.includes(e.type)){const evidence=e.factEvidence!.gameplayChapters;mark(e,'multipleGameplayChapters',evidence.sourceIds[0]);e.factEvidence!.multipleGameplayChapters={...evidence,note:'Positive membership in at least two numbered chapters; chapter-only evidence does not invent exact seasons or continuity.'};}
  if(e.facts['function:lowGravity']===true){mark(e,'function:fallProtection','p5b-low-gravity');e.factEvidence!['function:fallProtection'].note='The documented low-gravity effect prevents landing damage while the effect is active. Visual-only immunity entries are excluded from this derivation.';}
  if(e.type==='boss'&&Array.isArray(e.facts.bossChapters)&&e.facts.bossChapters.length>=2){e.facts.bossMultipleChapters=true;e.factEvidence??={};e.factEvidence.bossMultipleChapters={...e.factEvidence.bossChapters!};}
  if(e.type==='item'&&factVerification(e,'restoresHealth')==='verified'&&factVerification(e,'restoresShield')==='verified'&&e.facts.restoresHealth&&e.facts.restoresShield){e.facts.restoresBoth=true;e.factEvidence??={};e.factEvidence.restoresBoth={status:'verified',sourceIds:[...new Set([...e.factEvidence.restoresHealth.sourceIds,...e.factEvidence.restoresShield.sourceIds])],note:'Both restoration effects have independent verified field proofs.'};}
 }
 // Recall priors remain editorial estimates; these familiar world anchors are independent of thresholds.
 const anchors=['The Orchard','Camp Cod','Hydro 16','Flopper Pond','Motel','Viking Village','Metal Llama','The Prison','The Temple','Launchpad','Seven Outpost II','Seven Outpost III','Beep \'n Bounce','Slap \'N Go','The Hall of Whispers','The Cemetery','Ship It! Station','Rebel\'s Roost','Fencing Fields','Grand Glacier','Loot Island','BURD To Go','Crackshot\'s Cabin'];
 anchors.push('Hero Mansion','Villain Lair','Floating Island','The Great Turtle','Overlook Lighthouse','Rolling Blossoms Farm','Turtle Lair');
 for(const e of bank)if(functionalTypes.includes(e.type)&&['Flare Gun','Firefly Jar','Gas Can','Shockwave Grenade','Impulse Grenade','Rocket Launcher','Grenade Launcher','Midas’ Drum Gun','Brutus’ Minigun','Kit’s Charge Shotgun'].some(n=>normalizeAnswer(n)===normalizeAnswer(e.name)))e.familiarity=Math.max(e.familiarity,.75);
 for(const e of bank)if(e.type==='npc'&&['GHOST Henchmen','SHADOW Henchmen','IO Guards','Stark Robots','Stormtroopers'].some(n=>normalizeAnswer(n)===normalizeAnswer(e.name)))e.familiarity=Math.max(e.familiarity,.75);
 for(const name of anchors){const e=find(name,['location']);if(e)e.familiarity=Math.max(e.familiarity,.7);}
 return bank;
}
