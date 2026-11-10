import type { EntityType, FortniteEntity } from '../domain/types';
import { normalizeAnswer } from '../engine/normalize';
import { factVerification } from '../engine/predicates';
import { candidate } from './catalog/helpers';
import { proof } from './catalog/history-editor';

/** Claim-by-claim review of retained Epic article bodies. No inferred launch dates. */
export function expandGameplayCatalog(bank:FortniteEntity[]):FortniteEntity[] {
 const find=(type:EntityType,name:string)=>bank.find(e=>e.type===type&&normalizeAnswer(e.name)===normalizeAnswer(name));
 const claim=(type:EntityType,name:string,source:string,facts:FortniteEntity['facts'],note:string,recall=.5)=>{
  let e=find(type,name);
  if(!e){e=candidate(type,name,undefined,source,{},undefined,recall);e.verification='verified';e.origin='expansion';bank.push(e)}
  e.factEvidence??={};
  for(const [field,value] of Object.entries(facts)){e.facts[field]=value;e.factEvidence[field]=proof(source,note)}
  return e;
 };
 const tag=(type:EntityType,name:string,tag:string,source:string,note:string)=>claim(type,name,source,{[tag]:true},note);
 const container=(name:string,source:string,note:string)=>claim('container',name,source,{isLootContainer:true,mode:'core_br'},note,['Chest','Ammo Box','Supply Drop','Supply Llama'].includes(name)?.95:name==='Holo-Chest'?.65:.5);
 const relate=(e:FortniteEntity,kind:'foundIn'|'droppedBy'|'obtainableAt'|'faction',target:FortniteEntity,season:string,source:string,note:string)=>{
  e.history??={appearances:[],changes:[],relationships:[]};
  e.history.relationships.push({kind,entityId:target.id,season,...proof(source,note)});
 };
 // Historical containers are not duplicated by cosmetic skin or loot rarity.
 const chest=container('Chest','epic-patch-v5-40','BR Grappler spawn list: Treasure Chests, Supply Drops and Supply Llamas.');
 chest.aliases.push({text:'Standard Chest',kind:'official',confidence:'exact'},{text:'Treasure Chest',kind:'official',confidence:'exact'});
 container('Supply Drop','epic-patch-v5-40','BR Grappler spawn list explicitly names Supply Drops.');
 const llama=container('Supply Llama','epic-patch-v5-40','BR Grappler spawn list explicitly names Supply Llamas.');
 llama.aliases.push({text:'Loot Llama',kind:'slang',confidence:'strong'},{text:'Llama',kind:'slang',confidence:'strong'});
 const ammo=container('Ammo Box','epic-patch-v4-4','General UI fix names ammo crates; BR mode notes describe ammo boxes containing ammunition.');
 ammo.aliases.push({text:'Ammo Crate',kind:'official',confidence:'exact'});
 const chrome=container('Chrome Chest','epic-launch-c3s4','EvoChrome Shotgun and EvoChrome Burst Rifle are found from Chrome Chests.');
 tag('container','Chrome Chest','isChest','epic-launch-c3s4','Explicit chest variant.');
 tag('container','Chest','isChest','epic-patch-v5-40','Treasure chest is the standard chest.');
 const holo=container('Holo-Chest','epic-launch-c4s3','Shadow Tracker is available from Exotic Holo-Chests; exotic refers to loot, not another canonical container.');
 holo.aliases.push({text:'Exotic Holo-Chest',kind:'official',confidence:'exact'});
 container('Combat Cache','epic-launch-c4s2','Slurp Juice can be found from Combat Caches.');
 const bag=container('Heist Bag','epic-launch-c4s4','Duffel bags with Crash Pad Jr., Remote Explosive, Rocket Ram, ammo and healing items.');
 // A new source scope must be complete before any exact container-loot question is enabled.
 for(const name of ['EvoChrome Shotgun','EvoChrome Burst Rifle']){
  const e=find('weapon',name)!;relate(e,'foundIn',chrome,'C3S4','epic-launch-c3s4','Both named EvoChrome weapons explicitly found in Chrome Chests.');
  tag('weapon',name,'hasMythicVersion','epic-launch-c3s4','EvoChrome rarity increases from Uncommon to Mythic.');
 }
 const tracker=tag('weapon','Shadow Tracker','isExotic','epic-launch-c4s3','Explicitly labelled Exotic weapon.');
 relate(tracker,'foundIn',holo,'C4S3','epic-launch-c4s3','Explicit Shadow Tracker source, not a complete Holo-Chest loot table.');
 for(const [type,name] of [['item','Crash Pad Jr.'],['weapon','Remote Explosives'],['item','Rocket Ram']] as const){
  const e=find(type,name);if(e)relate(e,'foundIn',bag,'C4S4','epic-launch-c4s4','Explicit possible Heist Bag item; no inferred full loot pool.');
 }
 const seven=claim('faction','The Seven','epic-launch-c3s1',{isFaction:true},'The Seven have outposts and Sanctuary as their home.',.8);
 relate(find('weapon','MK-Seven Assault Rifle')!,'faction',seven,'C3S1','epic-launch-c3s1','MK-Seven Assault Rifle explicitly built from The Seven’s technology.');
 // Canonical ammunition classes; not arbitrary internal ammo IDs.
 for(const [name,source,aliases,note] of [
  ['Light Ammo','epic-patch-v5-10',['Light Bullets'],'Compact SMG uses Light Ammo.'],
  ['Medium Ammo','epic-patch-v4-2',['Medium Bullets'],'Burst Assault Rifle uses Medium Ammo.'],
  ['Heavy Ammo','epic-patch-v8-11',['Heavy Bullets'],'Flint-Knock Pistol uses Heavy Ammo.'],
  ['Shells','epic-patch-v9-00',['Shotgun Shells'],'Combat Shotgun holds ten shells.'],
  ['Rocket Ammo','epic-patch-v9-21',['Rockets'],'Proximity Grenade Launcher uses Rocket Ammo.'],
 ] as const){const e=claim('ammo',name,source,{isAmmo:true,mode:'core_br'},note,.9);e.aliases.push(...aliases.map(text=>({text,kind:'official' as const,confidence:'exact' as const})));}
 for(const name of ['Wood','Stone','Metal'])claim('material',name,'epic-patch-v6-31',{buildingMaterial:true},'BR material-cap list explicitly names Wood, Stone and Metal.',.95);
 find('material','Stone')!.aliases.push({text:'Brick',kind:'official',confidence:'exact'},{text:'Bricks',kind:'slang',confidence:'strong'});
 for(const name of ['Animal Bones','Mechanical Parts'])claim('material',name,'epic-primal-crafting',{craftingIngredient:true},'Crafting guide explicitly describes primal and mechanical crafting ingredients.',.75);
 for(const [name,source] of [['Apple','epic-patch-v4-2'],['Shield Mushroom','epic-patch-v4-3'],['Banana','epic-patch-v8-20'],['Coconut','epic-patch-v8-20'],['Pepper','epic-patch-v8-20']] as const)
  tag('item',name,'isForaged',''+source,'BR patch explicitly calls these foraged consumables; no Produce Box contents inferred.');
 // Health classification of the newly reviewed pepper, separately from foraging.
 const pepper=find('item','Pepper')!;pepper.facts.itemClasses=['health'];pepper.factEvidence!.itemClasses=proof('epic-patch-v8-20','Pepper grants health and movement speed.');
 // Epic's named vault list is a historical Mythic catalog, not a complete boss-drop table.
 for(const name of ['Midas’ Drum Gun','TNTina’s Ka-Boom Bow','Kit’s Charge Shotgun','Kit’s Shockwave Launcher','Zyg and Choppy’s Ray Gun','The Foundation’s MK-Seven Assault Rifle','Gunnar’s Stinger SMG']){
  tag('weapon',name,'hasMythicVersion','epic-launch-c4s4','Named in the article’s Mythic treasures list.');
 }
 tag('weapon','Infinity Blade','hasMythicVersion','epic-patch-v7-01','Explicit Mythic melee weapon in Battle Royale at Polar Peak.');
 const blade=find('weapon','Infinity Blade')!;relate(blade,'obtainableAt',find('location','Polar Peak')!,'C1S7','epic-patch-v7-01','Explicit Polar Peak spawn, not a boss drop.');
 for(const name of ['Havoc Suppressed Assault Rifle','Havoc Pump Shotgun','Overclocked Pulse Rifle'])tag('weapon',name,'hasMythicVersion','epic-launch-c4s2','Article explicitly identifies Mythic version and acquisition source.');
 for(const name of ['MK-Alpha Assault Rifle','Drum Shotgun'])tag('weapon',name,'hasMythicVersion','epic-launch-c4s3','Article explicitly states Mythic version.');
 const highcard=claim('boss','Highcard','epic-launch-c4s2',{isBoss:true},'Defeat boss Highcard for Mythic Havoc Suppressed Assault Rifle.',.7);
 relate(find('weapon','Havoc Suppressed Assault Rifle')!,'droppedBy',highcard,'C4S2','epic-launch-c4s2','Mythic version from defeating Highcard.');
 for(const name of ['Thermal Scoped Revolver','Storm Scout Sniper Rifle','Shadow Tracker','Marksman Six Shooter','The Dub','Boom Sniper Rifle'])tag('weapon',name,'isExotic','epic-launch-c3s2','Explicitly labelled Exotic in unvaulted or returning weapon list.');
 for(const name of ['Heisted Breacher Shotgun','Heisted Accelerant Shotgun','Heisted Run ‘N’ Gun SMG'])tag('weapon',name,'isExotic','epic-launch-c4s3','Explicitly labelled Exotic in returning weapons.');
 // Reuse already reviewed boss-to-weapon edges in the inverse direction.
 for(const boss of bank.filter(e=>e.type==='boss'))for(const edge of boss.history?.relationships??[]){
  if(edge.kind!=='mythic'||edge.status!=='verified')continue;
  const weapon=bank.find(e=>e.id===edge.entityId);if(!weapon)continue;
  if(!weapon.factEvidence?.hasMythicVersion)tag('weapon',weapon.name,'hasMythicVersion',edge.sourceIds[0],'Explicit reviewed Mythic boss relationship; no original release inferred.');
  weapon.history??={appearances:[],changes:[],relationships:[]};
  if(!weapon.history.relationships.some(r=>r.kind==='droppedBy'&&r.entityId===boss.id&&r.season===edge.season))weapon.history.relationships.push({...edge,kind:'droppedBy',entityId:boss.id});
 }
 // Function tags use explicit item behavior, never a guessed release timeline.
 for(const [type,name,source,note] of [
  ['item','Grappler','epic-patch-v5-40','Grappler chains shots to travel great distances.'],
  ['item','Rift-To-Go','epic-patch-v5-30','Teleports the user into the sky in skydiving mode.'],
  ['item','Shockwave Grenade','epic-patch-v5-30-content-update','Knocks players back without fall damage.'],
  ['item','Impulse Grenade','epic-patch-v8-11','Impulse strength increased against vehicles; affects players.'],
  ['item','Balloons','epic-patch-v6-21','Balloons let players float; height and release mechanics described.'],
  ['item','Bouncer','epic-patch-v5-21','Soaring 50s explicitly emphasizes mobility with Bounce Pads and Launch Pads.'],
  ['item','Rocket Ram','epic-launch-c4s4','Fly into a base or escape using Rocket Ram.'],
  ['item','Itemized Glider Redeploy','epic-patch-v7-20','Inventory item grants glider redeploy.'],
  ['item','Jetpack','epic-og-2023','OG returning Jetpacks allow aerial mobility.'],
  ['item','Spider-Man’s Web-Shooters','epic-launch-c3s1','Web-swinging traversal described in the launch article.'],
  ['item','War Machine’s Hover Jets','epic-launch-c5s4','Hover Jets provide aerial traversal.'],
  ['item','Shadow Stone','epic-patch-v6-00','Shadow Form grants increased movement speed and Phase ability.'],
  ['item','Hop Rock','epic-patch-v4-0','Gravity-defying foraged Hop Rocks at the crater.'],
  ['item','Launch Pad','epic-patch-v5-21','Soaring 50s explicitly emphasizes mobility with Bounce Pads and Launch Pads.'],
  ['weapon','Flint-Knock Pistol','epic-patch-v8-11','Can knock yourself back.'],
  ['item','Chrome Splash','epic-launch-c3s4','Chrome Blob allows faster movement and air dashes.'],
  ['weapon','Kinetic Blade','epic-launch-c4s2','Dash Attack has three charges and a cooldown.'],
  ['weapon','Shockwave Hammer','epic-launch-c4s1','Launch yourself, also with charged bounces.'],
 ] as const)tag(type,name,'playerMobility',source,note);
 for(const [name,source,note] of [
  ['Shockwave Grenade','epic-patch-v5-30-content-update','Throwable grenade with shockwave knockback.'],
  ['Impulse Grenade','epic-patch-v8-11','Unvaulted impulse grenade.'],
  ['Chiller Grenade','epic-patch-v7-30','Throwable grenade with icy feet and knockback.'],
  ['Port-A-Bunker','epic-launch-c3s4','Throw down to create an instant defensive structure.'],
  ['Chrome Splash','epic-launch-c3s4','Throw down to Chrome-ify yourself or walls.'],
  ['Port-A-Fortress','epic-patch-v5-41','Portable throwable fortress with built-in bouncers.'],
 ] as const)tag('item',name,'isThrowableUtility',source,note);
 for(const [name,source,note] of [
  ['Damage Trap','epic-patch-v4-2','Damage Trap balance in BR weapons section.'],
  ['Bouncer','epic-patch-v4-4','Bouncer is a BR trap placeable on ramps.'],
  ['Chiller','epic-patch-v6-01','New trap placeable on floors, walls and ceilings.'],
  ['Poison Dart Trap','epic-patch-v8-20','New trap fires poison darts at players.'],
  ['Mounted Turret','epic-patch-v6-30','Legendary Trap placeable only on floors.'],
  ['Cozy Campfire','epic-patch-v7-20','Explicitly listed under BR trap drop-chance adjustments.'],
  ['Launch Pad','epic-patch-v7-20','Explicitly listed under BR trap drop-chance adjustments.'],
 ] as const)tag('item',name,'isPlaceableTrap',source,note);
 // Broad weapon existence follows trusted category evidence; unknown dates stay unknown.
 for(const e of bank.filter(e=>e.type==='weapon')){
  const status=factVerification(e,'weaponClass');
  if(status==='verified'){e.facts.isWeapon=true;e.factEvidence??={};e.factEvidence.isWeapon={...e.factEvidence.weaponClass!};}
  else if(status==='legacy')e.facts.isWeapon=true;
 }
 // Every Mythic/Exotic claim above is itself weapon classification evidence.
 for(const e of bank.filter(e=>e.type==='weapon'&&(e.facts.hasMythicVersion||e.facts.isExotic))){
  e.facts.isWeapon=true;e.factEvidence??={};e.factEvidence.isWeapon={...(e.factEvidence.hasMythicVersion??e.factEvidence.isExotic)!};
 }
 // Pending research targets stay inspectable and never enter an answer bank.
 for(const name of ['Rare Chest','Large Ammo Box','Produce Box','Cooler','Ice Machine','Safe','GHOST Chest','SHADOW Chest','Oathbound Chest','Seven Supply Chest','Stark Industries Chest','Imperial Chest'])if(!find('container',name))bank.push(candidate('container',name,undefined,'phase3-container-research',{isLootContainer:true,mode:'core_br'}));
 if(!find('npc','Marauder'))bank.push(candidate('npc','Marauder','C2S3','phase3-marauders-research',{isHostile:true}));
 return bank;
}
