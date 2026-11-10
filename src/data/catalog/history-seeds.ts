import type { FortniteEntity, HistoricalChange } from '../../domain/types';
import { mythicRelationships } from './weapons';
import { historyAt, pending } from './helpers';

const introductions: Record<string, Record<string,string[]>> = {
 weapon: {
 C1S1:['Pump Shotgun','Tactical Shotgun','Assault Rifle','Burst Assault Rifle','Scoped Assault Rifle','Submachine Gun','Tactical Submachine Gun','Bolt-Action Sniper Rifle','Semi-Auto Sniper Rifle','Pistol','Revolver','Rocket Launcher','Grenade Launcher'],
 C1S2:['Suppressed Pistol','Suppressed Submachine Gun','Snowball Launcher'], C1S3:['Hand Cannon','Hunting Rifle','Heavy Shotgun','Guided Missile'],
 C1S4:['Dual Pistols','Drum Gun','Thermal Scoped Assault Rifle'], C1S5:['Compact SMG','Double Barrel Shotgun','Heavy Sniper Rifle','Suppressed Assault Rifle'],
 C1S6:['Quad Launcher','Six Shooter','Heavy Assault Rifle'], C1S7:['Scoped Revolver','Suppressed Sniper Rifle','Infantry Rifle'],
 C1S8:['Flint-Knock Pistol','Boom Bow'], C1S9:['Combat Shotgun','Tactical Assault Rifle','Burst SMG','Proximity Grenade Launcher','Drum Shotgun','Storm Scout Sniper Rifle'],
 C1SX:['Automatic Sniper Rifle'], C2S2:['Rapid Fire SMG'], C2S3:['Charge Shotgun'], C2S5:['Dragon’s Breath Shotgun','Lever Action Shotgun'],
 C2S6:['Primal Shotgun','Primal Rifle','Primal SMG','Primal Pistol','Makeshift Shotgun','Makeshift Rifle','Makeshift Revolver','Mechanical Bow','Primal Bow','Mechanical Shockwave Bow','Mechanical Explosive Bow','Primal Flame Bow','Primal Stink Bow','Recycler'],
 C2S7:['Rail Gun','Pulse Rifle','Plasma Cannon'], C2S8:['Combat Assault Rifle','Combat Pistol'],
 C3S1:['Stinger SMG','Auto Shotgun','Striker Pump Shotgun','Ranger Assault Rifle','MK-Seven Assault Rifle','Hunter Bolt-Action Sniper','Sidearm Pistol'],
 C3S2:['Combat SMG','Striker Burst Rifle','Ranger Shotgun','Anvil Rocket Launcher'], C3S3:['Hammer Assault Rifle','Two-Shot Shotgun','DMR','Charge SMG','Prime Shotgun'],
 C3S4:['EvoChrome Shotgun','EvoChrome Burst Rifle','Cobra DMR','Explosive Goo Gun'],
 C4S1:['Thunder Shotgun','Maven Auto Shotgun','Red-Eye Assault Rifle','Tactical Pistol'], C4S2:['Havoc Pump Shotgun','Havoc Suppressed Assault Rifle','Kinetic Blade','Lock On Pistol'],
 C4S3:['Thermal DMR','FlapJack Rifle','MK-Alpha Assault Rifle','Mammoth Pistol'], C4S4:['Twin Mag Assault Rifle','Sticky Grenade Launcher'],
 C5S1:['Frenzy Auto Shotgun','Hammer Pump Shotgun','Striker AR','Nemesis AR','Enforcer AR','Hyper SMG','Thunder Burst SMG','Reaper Sniper Rifle','Ranger Pistol'],
 C5S2:['Gatekeeper Shotgun','Warforged Assault Rifle','Huntress DMR'], C5S4:['Sovereign Shotgun','Monarch Pistol'],
 C6S1:['Sentinel Pump Shotgun','Oni Shotgun','Twinfire Auto Shotgun','Fury Assault Rifle','Veiled Precision SMG','Blink Mag SMG'],
 },
 skin: {
 C1S3:['The Reaper','Dark Voyager','Rust Lord'], C1S4:['Carbide','Omega','Zoey'], C1S5:['Drift','Ragnarok'],
 C1S6:['Calamity','Dire'], C1S7:['Lynx','Zenith','The Ice King','The Prisoner'], C1S8:['Peely','Blackheart','Hybrid','Ember','Luxe'],
 C1S9:['Rox','Vendetta'], C1SX:['Catalyst'], C2S1:['Fusion'], C2S2:['Midas','Maya','Agent Peely','Brutus','Meowscles','Skye','TNTina'],
 C2S3:['Ocean','Fade','Kit','Jules','Eternal Knight'], C2S5:['Menace'], C2S7:['Sunny'], C2S8:['Charlotte','Torin'],
 },
 item: {C1S1:['Bandage','Med Kit','Shield Potion','Grenade','Damage Trap'],C1S2:['Small Shield Potion','Boogie Bomb','Cozy Campfire'],C1S3:['Chug Jug','Impulse Grenade'],C1S4:['Port-A-Fort','Apple','Shield Mushroom'],C1S5:['Rift-To-Go','Shockwave Grenade'],C1S6:['Chiller'],C1S8:['Banana','Coconut','Poison Dart Trap'],C1S9:['Chug Splash','Air Strike'],C1SX:['Junk Rift','Zapper Trap'],C2S1:['Flopper','Slurpfish','Bandage Bazooka'],C2S2:['Crash Pad','Decoy','Creepin’ Cardboard'],C2S3:['Firefly Jar'],C2S4:['Shield Fish'],C2S6:['Meat'],C3S1:['Med-Mist','Guzzle Juice','Shield Keg','Pizza Slice'],C4S1:['Slap Juice','Falcon Scout'],C5S1:['FlowBerry Fizz','Grapple Blade'],C5S3:['Nitro Splash']},
 vehicle: {C1S4:['Shopping Cart'],C1S5:['All Terrain Kart'],C1S6:['Quadcrasher'],C1S7:['X-4 Stormwing','Driftboard'],C1S8:['The Baller'],C1SX:['B.R.U.T.E.'],C2S1:['Motorboat'],C2S2:['Choppa'],C2S3:['Whiplash','Bear','Mudflap','Island Prevalent'],C2S7:['Saucer'],C3S2:['Titan Tank','Armored Battle Bus'],C3S4:['Octane'],C4S1:['Trail Thrasher'],C4S2:['Victory Crown Rogue','Nitro Drifter'],C4S4:['Nitro Fang']},
 event: {C1S4:['Blast Off'],C1S6:['Butterfly Event'],C1S7:['Ice Storm','Showtime'],C1S8:['The Unvaulting'],C1S9:['The Final Showdown'],C1SX:['The End'],C2S2:['The Device','Astronomical'],C2S4:['Devourer of Worlds'],C2S6:['Zero Crisis Finale'],C2S7:['Operation: Sky Fire','Rift Tour'],C2S8:['The End (Chapter 2)'],C3S2:['Collision'],C3S4:['Fracture'],OG2023:['The Big Bang'],REMIX2024:['Remix: The Finale']},
};

/** Candidate claims are deliberately pending until source review. */
export function attachHistorySeeds(entities: FortniteEntity[]): FortniteEntity[] {
 const byName = new Map(entities.map(entity => [`${entity.type}:${entity.name}`,entity]));
 for (const [type,seasons] of Object.entries(introductions)) for (const [season,names] of Object.entries(seasons)) for (const name of names) {
  const entity = byName.get(`${type}:${name}`);
  if (entity && !entity.history) entity.history = historyAt(season,`history-${season.toLowerCase()}`);
 }
 const change = (name:string, kind:HistoricalChange['kind'], season:string, relatedName?:string, eventName?:string) => {
  const entity = byName.get(`location:${name}`);
  const related = relatedName ? byName.get(`location:${relatedName}`) : undefined;
  const event = eventName ? byName.get(`event:${eventName}`) : undefined;
  if (entity?.history) entity.history.changes.push({kind,season,...pending(`history-${season.toLowerCase()}`),...(related ? {relatedEntityId:related.id} : {}),...(event ? {eventId:event.id} : {})});
 };
 change('Dusty Depot','transformed','C1S4','Dusty Divot');
 change('Dusty Depot','reintroduced','C1SX');
 change('Tomato Town','replaced','C1S5','Tomato Temple');
 change('Loot Lake','renamed','C1S6','Leaky Lake');
 change('Tilted Towers','destroyed','C1S8',undefined,'The Unvaulting');
 change('Retail Row','destroyed','C1S8',undefined,'The Unvaulting');
 change('Tilted Towers','replaced','C1S9','Neo Tilted');
 change('Retail Row','replaced','C1S9','Mega Mall');
 change('Neo Tilted','transformed','C1SX','Tilted Town');
 change('The Agency','destroyed','C2S2',undefined,'The Device');
 change('The Agency','replaced','C2S3','The Authority');
 change('Sweaty Sands','renamed','C2S7','Believer Beach');
 change('Holly Hedges','transformed','C2S7','Holly Hatchery');
 const relationships = [
 ['Midas','The Agency'],['Brutus','The Grotto'],['TNTina','The Rig'],['Meowscles','The Yacht'],['Skye','The Shark'],
 ] as const;
 for (const [bossName,locationName] of relationships) {
  const boss = byName.get(`boss:${bossName}`)!;
  const location = byName.get(`location:${locationName}`)!;
  boss.history!.relationships.push({kind:'location',entityId:location.id,season:'C2S2',...pending('history-c2s2')});
  location.history!.relationships.push({kind:'boss',entityId:boss.id,season:'C2S2',...pending('history-c2s2')});
 }
 for (const record of mythicRelationships) {
  const weapon=byName.get(`weapon:${record.name}`)!;
  const boss=byName.get(`boss:${record.boss}`)!;
  const location=byName.get(`location:${record.location}`)!;
  const provenance=pending(`history-${record.season.toLowerCase()}`);
  weapon.history!.relationships.push({kind:'boss',entityId:boss.id,season:record.season,...provenance},{kind:'location',entityId:location.id,season:record.season,...provenance});
  boss.history!.relationships.push({kind:'mythic',entityId:weapon.id,season:record.season,...provenance});
  location.history!.relationships.push({kind:'mythic',entityId:weapon.id,season:record.season,...provenance});
 }
 return entities;
}
