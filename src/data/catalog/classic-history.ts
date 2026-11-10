import type { EntityType, FortniteEntity } from '../../domain/types';
import { historyEditor, proof } from './history-editor';
import { patchSource } from '../classic-patch-sources';

export function applyClassicHistory(bank:FortniteEntity[]):FortniteEntity[] {
 const {byName,record,appearance,introduced,appendList}=historyEditor(bank);
 const seasonFor=(slug:string)=>`C1S${slug.startsWith('v10-') ? 'X' : slug.slice(1).split('-')[0]}`;
 function observe(entity:FortniteEntity,slug:string,state:'present'|'absent',note:string) {
  entity.history ??={appearances:[],changes:[],relationships:[]};
  entity.history.observations ??=[];
  entity.history.observations.push({season:seasonFor(slug),update:slug,state,mode:'core_br',...proof(patchSource(slug),note)});
 }
 function debut(type:EntityType,name:string,slug:string,facts:FortniteEntity['facts']) {
  const source=patchSource(slug),season=seasonFor(slug);
  const entity=record(type,name,source,facts);
  introduced(entity,season,source);appearance(entity,season,source,type==='location' ? true : undefined);
  const launch=['v5-0','v7-00','v8-00','v9-00','v10-00-patch-notes'].includes(slug);
  entity.history!.introduction!.timing=launch ? 'launch' : 'midseason';
  observe(entity,slug,'present','Explicit new Battle Royale addition. Rarity-only variants are not separate introductions.');
  appendList(entity,'classicPatchDebut',slug,source);
  return entity;
 }
 const guns:[string,string,string][]=[
  ['Thermal Scoped Assault Rifle','assault rifle','v4-4'],['Dual Pistols','pistol','v4-5'],['Drum Gun','smg','v4-5-content-update'],
  ['Compact SMG','smg','v5-10'],['Double Barrel Shotgun','shotgun','v5-20'],['Heavy Sniper Rifle','sniper rifle','v5-21'],['Suppressed Assault Rifle','assault rifle','v5-40-content-update'],
  ['Quad Launcher','explosive','v6-02'],['Six Shooter','pistol','v6-20'],['Heavy Assault Rifle','assault rifle','v6-22'],
  ['Infinity Blade','special','v7-01'],['Scoped Revolver','pistol','v7-20'],['Infantry Rifle','assault rifle','v7-40'],
  ['Flint-Knock Pistol','pistol','v8-11'],['Boom Bow','bow','v8-20-content-update'],['Combat Shotgun','shotgun','v9-00'],
  ['Tactical Assault Rifle','assault rifle','v9-01'],['Burst SMG','smg','v9-10-content-update'],['Proximity Grenade Launcher','explosive','v9-21'],
  ['Automatic Sniper Rifle','sniper rifle','v10-00-content-update'],
 ];
 for (const [name,weaponClass,slug] of guns) debut('weapon',name,slug,{weaponClass});
 const items:[string,string,string[]][]=[
  ['Rift-To-Go','v5-30',['utility','mobility']],['Shockwave Grenade','v5-30-content-update',['utility','mobility']],['Grappler','v5-40',['utility','mobility']],
  ['Shadow Stone','v6-00',['utility','mobility']],['Chiller','v6-01',['trap']],['Balloons','v6-21',['utility','mobility']],['Mounted Turret','v6-30',['trap','utility']],
  ['Itemized Glider Redeploy','v7-20',['utility','mobility']],['Chiller Grenade','v7-30',['throwable','mobility']],
  ['Buried Treasure','v8-01',['utility']],['Poison Dart Trap','v8-20',['trap']],['Banana','v8-20',['health']],['Coconut','v8-20',['health','shield']],['Pepper','v8-20',['health','mobility']],
  ['Storm Flip','v9-20',['utility']],['Chug Splash','v9-30',['health','shield']],['Shield Bubble','v10-20-patch-notes',['utility']],['Zapper Trap','v10-20-content-update',['trap','throwable']],
 ];
 for (const [name,slug,itemClasses] of items) debut('item',name,slug,{itemClasses});
 for (const [name,slug] of [['Shopping Cart','v4-3'],['All Terrain Kart','v5-0'],['Quadcrasher','v6-10'],['X-4 Stormwing','v7-00'],['Driftboard','v7-40-content-update'],['Pirate Cannon','v8-00'],['The Baller','v8-10'],['B.R.U.T.E.','v10-00-patch-notes']]) debut('vehicle',name,slug,{isVehicle:true});
 for (const [name,slug] of [['Paradise Palms','v5-0'],['Lazy Links','v5-0'],['Frosty Flights','v7-00'],['Polar Peak','v7-00'],['Happy Hamlet','v7-00'],['Lazy Lagoon','v8-00'],['Sunny Steps','v8-00'],['Neo Tilted','v9-00'],['Mega Mall','v9-00'],['Tilted Town','v10-00-content-update'],['Moisty Palms','v10-30-patch-notes'],['Starry Suburbs','v10-40-patch-notes']]) debut('location',name,slug,{namedPoi:true});
 const block=record('location','The Block','epic-block-2018',{namedPoi:true});
 introduced(block,'C1S7','epic-block-2018');appearance(block,'C1S7','epic-block-2018',true);
 // The December 6 announcement is on launch day; no midseason timing is inferred.
 for (const [oldName,newName,slug] of [['Neo Tilted','Tilted Town','v10-00-content-update'],['Mega Mall','Retail Row','v10-10-patch-notes'],['Paradise Palms','Moisty Palms','v10-30-patch-notes']]) {
  const source=patchSource(slug);
  const old=record('location',oldName,source,{namedPoi:true}),next=record('location',newName,source,{namedPoi:true});
  appearance(next,'C1SX',source,true);
  appearance(old,'C1SX',source,true); // Replaced in a midseason update: present earlier in that season, absent at this update.
  old.history ??={appearances:[],changes:[],relationships:[]};
  old.history.changes.push({kind:'replaced',season:'C1SX',relatedEntityId:next.id,...proof(source,'The source explicitly identifies the old location and the new Rift Zone replacement. No live-event destruction is inferred.')});
  observe(old,slug,'absent','Old named POI replaced at this update; this does not mean it never appeared earlier in Season X.');
 }
 for (const [name,slug] of [['Retail Row','v10-10-patch-notes'],['Greasy Grove','v10-30-patch-notes']]) {
  const source=patchSource(slug),entity=record('location',name,source,{namedPoi:true});
  appearance(entity,'C1SX',source,true);
  entity.history!.changes.push({kind:'reintroduced',season:'C1SX',...proof(source,'Explicitly brought back by a Rift Zone.')});
  observe(entity,slug,'present','Explicit Rift Zone return, not first introduction.');
 }
 // The finite set of named POIs actually mentioned in Epic's OG rollout.
 // Frosty is corroborated against the pinned archive's positive 27.10/27.11 references;
 // no first/last date or missing appearance is inferred from that aggregate.
 for (const name of ['Tilted Towers','Greasy Grove','Risky Reels','Loot Lake','Frosty Flights']) {
  const entity=record('location',name,'epic-og-2023',{namedPoi:true});
  appearance(entity,'OG2023','epic-og-2023',true);
  appendList(entity,'reviewedPoiOverview','OG2023','epic-og-2023');
  appendList(entity,'reviewedClassicOverview','OG2023','epic-og-2023');
  entity.history!.flags ??={};entity.history!.flags.ogAnnouncementPoi={value:true,...proof('epic-og-2023','Member of the complete named-POI mentions in the official OG overview.')};
  if (name==='Frosty Flights') {
   record('location',name,'archive-frosty-og-corroboration');
   const period=entity.history!.appearances.find(period=>period.from==='OG2023' && period.status==='verified')!;
   period.sourceIds.push('archive-frosty-og-corroboration');
  }
 }
 const vaults:{slug:string;weapons:[string,string][];items:string[];vehicles:string[]}[]=[
  {slug:'v4-0',weapons:[['Crossbow','bow']],items:[],vehicles:[]},
  {slug:'v6-00',weapons:[['Suppressed Submachine Gun','smg'],['Light Machine Gun','assault rifle'],['Remote Explosives','explosive']],items:['Impulse Grenade','Bouncer'],vehicles:[]},
  {slug:'v7-00',weapons:[['Double Barrel Shotgun','shotgun']],items:['Shadow Stone','Port-A-Fort','Chiller','Clinger','Shockwave Grenade'],vehicles:[]},
  {slug:'v8-00',weapons:[],items:['Sneaky Snowman','Chiller Grenade'],vehicles:['X-4 Stormwing','Shopping Cart','All Terrain Kart']},
  {slug:'v9-00',weapons:[['Pump Shotgun','shotgun'],['Scoped Revolver','pistol'],['Suppressed Assault Rifle','assault rifle'],['Thermal Scoped Assault Rifle','assault rifle']],items:['Clinger','Buried Treasure','Poison Dart Trap','Balloons'],vehicles:[]},
  {slug:'v10-00-patch-notes',weapons:[['Flint-Knock Pistol','pistol'],['Semi-Auto Sniper Rifle','sniper rifle'],['Tactical Assault Rifle','assault rifle']],items:['Shadow Bomb','Mounted Turret','Air Strike','Itemized Glider Redeploy'],vehicles:['The Baller','Quadcrasher']},
 ];
 for (const {slug,weapons,items,vehicles} of vaults) for (const [type,name,facts] of [
  ...weapons.map(([name,weaponClass])=>['weapon',name,{weaponClass}] as const),
  ...items.map(name=>['item',name,{}] as const),...vehicles.map(name=>['vehicle',name,{isVehicle:true}] as const),
 ]) {
  const source=patchSource(slug),entity=record(type,name,source,facts);
  entity.history ??={appearances:[],changes:[],relationships:[]};
  entity.history.changes.push({kind:'vaulted',season:seasonFor(slug),...proof(source,'Explicit Battle Royale launch vault list. Playground exceptions do not establish core-mode availability.')});
  entity.history.flags ??={};entity.history.flags.classicLaunchVaulting={value:true,...proof(source,'Member of the complete archived v4.0/v6.0/v7.0/v8.0/v9.0/v10.0 launch vault lists.')};
  observe(entity,slug,'absent','Vaulted in core Battle Royale at this update. Later availability is unknown unless separately documented.');
 }
 // Unvaulted only in Tilted Town: availability is not asserted across the whole map.
 for (const [name,weaponClass] of [['Double Barrel Shotgun','shotgun'],['Six Shooter','pistol'],['Hunting Rifle','sniper rifle'],['Infantry Rifle','assault rifle'],['Tactical Submachine Gun','smg']]) {
  const slug=name==='Tactical Submachine Gun' ? 'v10-30-patch-notes' : 'v10-00-content-update';
  const source=patchSource(slug),entity=record('weapon',name,source,{weaponClass});
  appearance(entity,'C1SX',source);
  entity.history!.changes.push({kind:'unvaulted',season:'C1SX',...proof(source,name==='Tactical Submachine Gun' ? 'Explicit v10.30 core-mode unvault.' : 'Explicit unvault, with spawns limited to Tilted Town.')});
  entity.history!.flags ??={};entity.history!.flags.classicRiftUnvaulting={value:true,...proof(source,'Complete weapon unvault lists in the Tilted Town content update and v10.30.')};
  observe(entity,slug,'present','Unvaulted in core Battle Royale; Tilted Town spawn restriction is preserved in the change note.');
 }
 const guide='epic-primal-crafting';
 for (const [name,weaponClass] of [['Primal Rifle','assault rifle'],['Makeshift Rifle','assault rifle'],['Pump Shotgun','shotgun'],['Revolver','pistol'],['Assault Rifle','assault rifle'],['Makeshift Bow','bow'],['Primal Bow','bow'],['Mechanical Bow','bow'],['Primal Flame Bow','bow'],['Mechanical Shockwave Bow','bow']]) {
  const entity=record('weapon',name,guide,{weaponClass,primalGuideWeapon:true});
  appearance(entity,'C2S6',guide);
  // Presence in a crafting guide is not an independently established first release.
 }
 byName.get('weapon:primal flame bow')!.aliases.push({text:'Flame Bow',kind:'official',confidence:'exact'});
 byName.get('weapon:mechanical shockwave bow')!.aliases.push({text:'Shockwave Bow',kind:'official',confidence:'exact'});
 for (const [name,weaponClass] of [['Pistol','pistol'],['Bolt-Action Sniper Rifle','sniper rifle'],['Semi-Auto Sniper Rifle','sniper rifle'],['Heavy Sniper Rifle','sniper rifle'],['Grenade Launcher','explosive'],['Rocket Launcher','explosive']]) {
  const source=patchSource('v6-02'),entity=record('weapon',name,source,{weaponClass,v602LootTuning:true});
  appearance(entity,'C1S6',source);observe(entity,'v6-02','present','Explicit nonzero core-mode loot drop rate in the v6.02 tuning table.');
 }
 const explosive=record('weapon','Mechanical Explosive Bow','epic-launch-c4s1',{weaponClass:'bow'});
 appearance(explosive,'C4S1','epic-launch-c4s1');
 const floating=record('location','Floating Island',patchSource('v6-00'));
 introduced(floating,'C1S6',patchSource('v6-00'));appearance(floating,'C1S6',patchSource('v6-00'));
 appearance(floating,'C1SX',patchSource('v10-20-content-update'));
 floating.history!.changes.push({kind:'reintroduced',season:'C1SX',...proof(patchSource('v10-20-content-update'),'Explicit Floating Island return; not a named-POI promotion or a live event.')});
 const fortress=record('item','Port-A-Fortress',patchSource('v6-10'));
 observe(fortress,'v6-10','absent','Temporarily disabled for an issue. This is not a documented vaulting.');
 // A Mythic object is not duplicated for each rarity. Only this named blade is Mythic.
 const blade=record('weapon','Infinity Blade',patchSource('v7-01'),{weaponClass:'special'});
 blade.history!.flags ??={};blade.history!.flags.weaponStatus={value:'mythic',...proof(patchSource('v7-01'),'Explicit Mythic melee weapon in the Battle Royale weapons section.')};
 const polar=record('location','Polar Peak',patchSource('v7-01'),{namedPoi:true});
 polar.history!.relationships.push({kind:'mythic',entityId:blade.id,season:'C1S7',...proof(patchSource('v7-01'),'The source explicitly places the Infinity Blade on Polar Peak.')});
 return bank;
}
