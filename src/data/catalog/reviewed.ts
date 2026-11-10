import type { EntityType, FortniteEntity } from '../../domain/types';
import { reviewedAnnouncements } from '../reviewed-announcements';
import { normalizeAnswer } from '../../engine/normalize';
import { historyEditor, proof } from './history-editor';


/** Apply only individually reviewed claims. Pending timelines are never bulk-promoted. */
export function applyReviewedHistory(bank:FortniteEntity[]):FortniteEntity[] {
 const {byName,record,appendList,appearance,introduced}=historyEditor(bank);
 for (const article of reviewedAnnouncements) {
  for (const name of article.battlePass ?? []) {
   const entity=record('skin',name,article.id,{acquisitionMethod:'battle_pass',reviewedPassRelease:true});
   introduced(entity,article.season,article.id);
   appendList(entity,'reviewedBattlePass',article.season,article.id);
  }
  for (const [kind,rows] of [['new',article.newWeapons],['unvaulted',article.unvaultedWeapons],['returning',article.returningWeapons]] as const) for (const [name,weaponClass] of rows ?? []) {
   const entity=record('weapon',name,article.id,{weaponClass});
   appearance(entity,article.season,article.id);
   appendList(entity,'reviewedLoot',article.season,article.id);
   appendList(entity,`reviewed${kind[0].toUpperCase()}${kind.slice(1)}`,article.season,article.id);
   if (kind==='new') {
    introduced(entity,article.season,article.id);
    if (['shotgun','assault rifle','smg','sniper rifle','pistol','marksman rifle'].includes(weaponClass) || name==='Ex-Caliber Rifle') {
     appendList(entity,'reviewedNewGuns',article.season,article.id);
     entity.facts.reviewedLaunchGun=true;entity.factEvidence!.reviewedLaunchGun=proof(article.id,'Gun explicitly introduced in the new-weapons section.');
    }
   }
   if (kind==='unvaulted') entity.history!.changes.push({kind:'unvaulted',season:article.season,...proof(article.id,'Explicit unvaulted-weapons list.')});
  }
  for (const name of article.pois ?? []) {
   const entity=record('location',name,article.id,{namedPoi:true});
   appearance(entity,article.season,article.id,true);
   appendList(entity,'reviewedPoiOverview',article.season,article.id);
   if (article.newPois?.includes(name)) introduced(entity,article.season,article.id);
  }
  for (const [name,itemClasses] of article.items ?? []) {
   const entity=record('item',name,article.id,{itemClasses});
   appearance(entity,article.season,article.id);
   appendList(entity,'reviewedItems',article.season,article.id);
   if (itemClasses.includes('mobility') && ['C3S1','C3S4','C4S4','C5S4'].includes(article.season)) {entity.history!.flags ??={};entity.history!.flags.reviewedMobility={value:true,...proof(article.id,'Explicit mobility functionality.')};}
  }
  for (const name of article.vehicles ?? []) {
   const entity=record('vehicle',name,article.id,{isVehicle:true});
   appearance(entity,article.season,article.id);
   appendList(entity,'reviewedVehicles',article.season,article.id);
   if (article.newVehicles?.includes(name)) introduced(entity,article.season,article.id);
  }
  for (const [name,type] of article.vaulted ?? []) {
   const entity=record(type as EntityType,name,article.id);
   entity.history ??={appearances:[],changes:[],relationships:[]};
   entity.history.changes.push({kind:'vaulted',season:article.season,...proof(article.id,'Explicit vaulted list; does not assert any other vaulting dates.')});
  }
 }
 // Epic explicitly calls these landmarks, despite the initial candidate classification.
 for (const name of ['Doom’s Courtyard','Fractured Four']) {
  const entity=record('location',name,'epic-launch-c5s4',{namedPoi:false});
  if (entity.history) for (const period of entity.history.appearances) if (period.from==='C5S4') period.namedPoi=false;
  appearance(entity,'C5S4','epic-launch-c5s4',false);
 }
 const cloudy=byName.get('location:cloudy condos')!;
 const condo=byName.get('location:condo canyon')!;
 condo.history!.changes.push({kind:'renamed',season:'C3S4',relatedEntityId:cloudy.id,...proof('epic-launch-c3s4','The article explicitly says Condo Canyon is now called Cloudy Condos.')});
 // This article establishes a rename, not destruction during a live event.
 // Historical mythics in the vault are distinct named items, not generic rarity duplicates.
 for (const name of ['Midas’ Drum Gun','TNTina’s Ka-Boom Bow','Kit’s Charge Shotgun','Kit’s Shockwave Launcher','Zyg and Choppy’s Ray Gun','The Foundation’s MK-Seven Assault Rifle','Gunnar’s Stinger SMG']) {
  const entity=byName.get(`weapon:${normalizeAnswer(name)}`)!;
  entity.history!.flags ??={};
  entity.history!.flags.heistMythic={value:true,...proof('epic-launch-c4s4','Historical Mythic weapon in Thorne property vaults.')};
  entity.history!.flags.weaponStatus={value:'mythic',...proof('epic-launch-c4s4','Explicit historical Mythic treasures list.')};
  for (const poiName of ['Sanguine Suites','Relentless Retreat','Eclipsed Estate']) {
   const poi=byName.get(`location:${normalizeAnswer(poiName)}`)!;
   poi.history!.flags ??={};poi.history!.flags.reviewedMythicSource={value:true,...proof('epic-launch-c4s4','Thorne property vaults contain Mythic treasures.')};
   poi.history!.relationships.push({kind:'mythic',entityId:entity.id,season:'C4S4',...proof('epic-launch-c4s4','Thorne property vaults contain the listed Mythic treasures.')});
  }
 }
 const exotics=['Shadow Tracker','Marksman Six Shooter','The Dub','Boom Sniper Rifle','Thermal Scoped Revolver','Storm Scout Sniper Rifle','Heisted Breacher Shotgun','Heisted Accelerant Shotgun','Heisted Run ‘N’ Gun SMG'];
 for (const name of exotics) {
  const entity=byName.get(`weapon:${normalizeAnswer(name)}`)!;
  const source=entity.sourceIds.find(id=>id==='epic-launch-c3s2' || id==='epic-launch-c4s3' || id==='epic-launch-c4s4')!;
  entity.history!.flags ??={};entity.history!.flags.weaponStatus={value:'exotic',...proof(source,'Explicit Exotic label in loot list.')};
 }
 // Local labels are not inferred from character names or unrelated outfit biographies.
 for (const [bossName,poiName] of [['Doombot','Castle Doom'],['Mysterio','Doomstadt'],['Emma Frost','The Raft']]) {
  const boss=record('boss',bossName,'epic-launch-c5s4',{isBoss:true});
  appearance(boss,'C5S4','epic-launch-c5s4');
  const poi=byName.get(`location:${normalizeAnswer(poiName)}`)!;
  poi.history!.flags ??={};poi.history!.flags.reviewedMythicSource={value:true,...proof('epic-launch-c5s4','The named boss here drops a Mythic weapon.')};
  boss.history!.relationships.push({kind:'location',entityId:poi.id,season:'C5S4',...proof('epic-launch-c5s4','Boss location explicitly stated in weapon/medallion section.')});
  poi.history!.relationships.push({kind:'boss',entityId:boss.id,season:'C5S4',...proof('epic-launch-c5s4','Boss location explicitly stated in weapon/medallion section.')});
 }
 // A scheduled December 11 launch is within C3S1, not availability on launch day.
 const web=record('item','Spider-Man’s Web-Shooters','epic-launch-c3s1',{itemClasses:['utility','mobility']});
 appearance(web,'C3S1','epic-launch-c3s1');introduced(web,'C3S1','epic-launch-c3s1');
 web.history!.flags ??={};web.history!.flags.reviewedMobility={value:true,...proof('epic-launch-c3s1','Explicit swinging functionality and December 11 availability, within the season.')};
 web.aliases.push({text:'web shooters',kind:'abbreviation',confidence:'strong'});
 const berry=byName.get('item:slap berry')!;
 berry.aliases.push({text:'Slap Berries',kind:'official',confidence:'exact'});
 // Friendly NPCs are not silently promoted to bosses.
 for (const [name,poiName] of [['Guaco','Greasy Grove'],['Bunker Jonesy','The Joneses'],["Lil’ Whip",'Coney Crossroads']]) {
  const npc=record('npc',name,'epic-launch-c3s1',{isBoss:false,role:'friendly'});
  appearance(npc,'C3S1','epic-launch-c3s1');
  const poi=byName.get(`location:${normalizeAnswer(poiName)}`)!;
  npc.history!.relationships.push({kind:'location',entityId:poi.id,season:'C3S1',...proof('epic-launch-c3s1','Named Character and trading location explicitly given in The People section.')});
 }
 for (const [name,source,season,weaponName] of [
  ['The Foundation','epic-launch-c3s1','C3S1','The Foundation’s MK-Seven Assault Rifle'],
  ['Highcard','epic-launch-c4s2','C4S2','Havoc Suppressed Assault Rifle'],
  ['Doombot','epic-launch-c5s4','C5S4','Monarch Pistol'],
  ['Mysterio','epic-launch-c5s4','C5S4','Sovereign Shotgun'],
  ['Emma Frost','epic-launch-c5s4','C5S4','Striker Burst Rifle'],
 ]) {
  const boss=record('boss',name,source,{isBoss:true,reviewedLootBoss:true});
  appearance(boss,season,source);
  const weapon=byName.get(`weapon:${normalizeAnswer(weaponName)}`)!;
  boss.history!.relationships.push({kind:'mythic',variant:'mythic',entityId:weapon.id,season,...proof(source,'Boss drops a special weapon; Foundation Mythic identity is corroborated by the Last Resort vault list.')});
 }
 // OG documents returns separately from original introduction dates.
 const og='epic-og-2023';
 for (const [name,weaponClass] of [['Assault Rifle','assault rifle'],['Pump Shotgun','shotgun'],['Hunting Rifle','sniper rifle'],['Double Barrel Shotgun','shotgun'],['Six Shooter','pistol'],['Flint-Knock Pistol','pistol'],['Minigun','minigun'],['Quad Launcher','explosive'],['Heavy Sniper Rifle','sniper rifle'],['Proximity Grenade Launcher','explosive']]) {
  const entity=record('weapon',name,og,{weaponClass});
  appearance(entity,'OG2023',og);appendList(entity,'reviewedLoot','OG2023',og);appendList(entity,'reviewedUnvaulted','OG2023',og);
  entity.history!.changes.push({kind:'unvaulted',season:'OG2023',...proof(og,'Explicit weapons returning in the OG rollout.')});
  if (name==='Six Shooter') introduced(entity,'C1S6',og);
 }
 for (const name of ['Shopping Cart','All Terrain Kart','Quadcrasher','Driftboard','X-4 Stormwing','The Baller','Pirate Cannon']) {
  const entity=record('vehicle',name,og,{isVehicle:true});
  appearance(entity,'OG2023',og);appendList(entity,'reviewedVehicles','OG2023',og);
  entity.history!.changes.push({kind:'unvaulted',season:'OG2023',...proof(og,'Explicit returning vehicles in the OG rollout.')});
  if (name==='Driftboard') introduced(entity,'C1S7',og);
  if (name==='The Baller') introduced(entity,'C1S8',og);
 }
 for (const [name,itemClasses] of [['Damage Trap',['trap']],['Grappler',['utility','mobility']],['Boogie Bomb',['utility']],['Clinger',['throwable']],['Chiller',['trap']],['Port-A-Fortress',['utility']],['Mounted Turret',['utility']],['Poison Dart Trap',['trap']],['Itemized Glider Redeploy',['utility','mobility']],['Buried Treasure',['utility']],['Air Strike',['utility']],['Junk Rift',['utility']],['Storm Flip',['utility']],['Jetpack',['utility','mobility']]] as [string,string[]][]) {
  const entity=record('item',name,og,{itemClasses});
  appearance(entity,'OG2023',og);appendList(entity,'reviewedItems','OG2023',og);
  entity.history!.changes.push({kind:'unvaulted',season:'OG2023',...proof(og,'Explicit OG gear rollout.')});
  if (itemClasses.includes('mobility')) {entity.history!.flags ??={};entity.history!.flags.reviewedMobility={value:true,...proof(og,'Grappling, glider redeploy or jetpack traversal.')};}
 }
 for (const name of ['Tilted Towers','Greasy Grove','Risky Reels','Loot Lake']) {
  const entity=record('location',name,og,{namedPoi:true});
  appearance(entity,'OG2023',og,true);appendList(entity,'reviewedPoiOverview','OG2023',og);appendList(entity,'reviewedClassicOverview','OG2023',og);
 }
 for (const name of ['Greasy Grove','Risky Reels']) appearance(byName.get(`location:${normalizeAnswer(name)}`)!,'C1S5',og,true);
 const tilted=byName.get('location:tilted towers')!;
 introduced(tilted,'C1S2',og);
 tilted.history!.appearances.push({from:'C1S2',through:'C1S8',namedPoi:true,...proof(og,'Explicit original Season 2 introduction and persistence until Season 9.')});
 tilted.history!.changes.push({kind:'removed',season:'C1S9',...proof(og,'Original POI stayed until Season 9; no event-destruction claim is inferred here.')});
 appearance(byName.get('location:loot lake')!,'C1S6',og,true);
 for (const [source,season,names] of [['epic-season8','C1S8',['Lazy Lagoon','Sunny Steps']],['epic-season9','C1S9',['Neo Tilted','Mega Mall']]] as [string,string,string[]][]) for (const name of names) {
  const entity=record('location',name,source,{namedPoi:true});
  introduced(entity,season,source);appearance(entity,season,source,true);appendList(entity,'reviewedClassicOverview','OG2023',source);
 }
 const ogPass='epic-og-pass-2023';
 for (const name of ['Spectra Knight','Lil Split','Renegade Lynx','Omegarok']) {
  const entity=record('skin',name,ogPass,{acquisitionMethod:'og_pass',reviewedPassRelease:true});
  introduced(entity,'OG2023',ogPass);appendList(entity,'reviewedOgPass','OG2023',ogPass);
 }
 // Contemporary official announcements. Partial lineups never enable a full-pass question.
 const modern:[string,string,string[],string[],string[],string[]][]=[
  ['epic-showdown-2026','C7S2',['Exalted Ice King','The Order (Reforged)','Elite Jules','Bugs Bunny'],[],['Overdrive Grenade','Skyline Deployer'],['New Sanctuary','Frigid Fortress','Dark Dominion']],
  ['epic-runners-2026','C7S3',['The Guardian','Wolfe','Cluster','Heatwave PJ','John Wick (Pen and Ink)'],[],['Seven Sliders','Shock Rocks'],[]],
  ['epic-override-2026','C7S4',['Sonic the Hedgehog'],[],[],[]],
  ['epic-treasure-2026','C7TREASURE2026',['Portgas D. Ace','Nico Robin'],['Luffy','Nami','Usopp','Zoro','Sanji','A$AP Rocky'],[],[]],
 ];
 for (const [source,season,pass,shop,mobility,places] of modern) {
  for (const [method,names] of [['battle_pass',pass],['item_shop',shop]] as [string,string[]][]) for (const name of names) {
   const entity=record('skin',name,source,{acquisitionMethod:method});introduced(entity,season,source);
  }
  for (const name of mobility) {
   const entity=record('item',name,source,{itemClasses:['utility','mobility']});appearance(entity,season,source);introduced(entity,season,source);
  }
  for (const name of places) {
   const entity=record('location',name,source);appearance(entity,season,source);
   // The article calls these locations, without establishing map-label/POI status.
  }
 }
 for (const [source,season,names] of [
  ['epic-showdown-2026','C7S2',['Vector 7 DMR','Ice King’s Gauntlets','Chaos Reloader Shotgun']],
  ['epic-override-2026','C7S4',['Midas’ Masterpiece','Mega Buster']],
  ['epic-treasure-2026','C7TREASURE2026',['A$AP Rocky’s Shock Rocket']],
 ] as [string,string,string[]][]) for (const name of names) {
  const classes:Record<string,string>={'Vector 7 DMR':'marksman rifle','Ice King’s Gauntlets':'special','Chaos Reloader Shotgun':'shotgun','Midas’ Masterpiece':'pistol','Mega Buster':'special','A$AP Rocky’s Shock Rocket':'explosive'};
  const entity=record('weapon',name,source,{weaponClass:classes[name]});appearance(entity,season,source);introduced(entity,season,source);
 }
 const rocky=record('location','$.$. Rocky','epic-treasure-2026',{namedPoi:true});
 appearance(rocky,'C7TREASURE2026','epic-treasure-2026',true);introduced(rocky,'C7TREASURE2026','epic-treasure-2026');
 for (const name of ['Arlong Park','Windmill Village']) {const entity=record('location',name,'epic-treasure-2026');appearance(entity,'C7TREASURE2026','epic-treasure-2026');}
 const shattered=record('event','Shattered','epic-shattered-2026',{isLiveEvent:true,eventType:'story'});
 // The announcement explicitly describes a one-time playable Discover live event.
 appearance(shattered,'C7S2','epic-shattered-2026');
 introduced(shattered,'C7S2','epic-shattered-2026');
 // Aliases distinguish the named Exotic The Dub from a generic Double Barrel Shotgun.
 const dub=byName.get('weapon:the dub')!;
 dub.aliases.push({text:'dub',kind:'abbreviation',confidence:'contextual'});
 const dmr=byName.get('weapon:dmr')!;
 dmr.aliases.push({text:'Designated Marksman Rifle',kind:'official',confidence:'exact'});
 return bank;
}
