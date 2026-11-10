import { candidate } from './helpers';

// Research candidates, not enabled answer sets. No rarity-only duplicates.
const classes: Record<string, string[]> = {
  'marksman rifle': ['DMR','Cobra DMR','Thermal DMR','Tactical DMR','Huntress DMR'],
  'assault rifle': ['Scoped Assault Rifle','Thermal Scoped Assault Rifle','EvoChrome Burst Rifle','MK-Seven Assault Rifle','MK-Alpha Assault Rifle','Makeshift Rifle','Primal Rifle','Drum Gun','Pulse Rifle','Stark Industries Energy Rifle','Ranger Assault Rifle','Fury Assault Rifle'],
  shotgun: ['Makeshift Shotgun','EvoChrome Shotgun','Dragon’s Breath Shotgun','Wood Stake Shotgun','Hammer Pump Shotgun','Sovereign Shotgun','Sentinel Pump Shotgun','Oni Shotgun','Twinfire Auto Shotgun'],
  smg: ['Primal SMG','Makeshift Submachine Gun','Heisted Run ‘N’ Gun SMG','Blink Mag SMG','Veiled Precision SMG'],
  pistol: ['Primal Pistol','Makeshift Revolver','Mammoth Pistol','Ranger Pistol','Monarch Pistol'],
  bow: ['Mechanical Bow','Primal Bow','Mechanical Shockwave Bow','Mechanical Explosive Bow','Primal Flame Bow','Primal Stink Bow'],
  explosive: ['Explosive Goo Gun','Sticky Grenade Launcher','Recycler','Plasma Cannon'],
  special: ['Infinity Blade','Kinetic Blade','Shockwave Hammer','ODM Gear','Thunder Spears','E-11 Blaster Rifle','DC-15 Blaster Rifle','Iron Man’s Repulsors','Doctor Doom’s Arcane Gauntlets','Deku’s Smash','Kamehameha','Wings of Icarus','Thunderbolt of Zeus','Chains of Hades'],
};
export const weapons = Object.entries(classes).flatMap(([weaponClass, names]) => names.map(name => candidate('weapon',name,undefined,'wiki-weapons',{weaponClass})));

// Distinct boss-named weapons are canonical answers; generic rarity variants are not.
const bossWeapons:[string,string,string,string,string][] = [
 ['Midas’ Drum Gun','C2S2','Midas','The Agency','smg'],
 ['Brutus’ Minigun','C2S2','Brutus','The Grotto','minigun'],
 ['TNTina’s Ka-Boom Bow','C2S2','TNTina','The Rig','bow'],
 ['Meowscles’ Peow Peow Rifle','C2S2','Meowscles','The Yacht','assault rifle'],
 ['Skye’s Assault Rifle','C2S2','Skye','The Shark','assault rifle'],
 ['Ocean’s Burst Assault Rifle','C2S3','Ocean','The Fortilla','assault rifle'],
 ['Jules’ Drum Gun','C2S3','Jules','The Authority','smg'],
 ['Kit’s Charge Shotgun','C2S3','Kit','Catty Corner','shotgun'],
];
export const namedMythics = bossWeapons.map(([name,season,,,weaponClass])=>{
 const entity=candidate('weapon',name,season,`history-${season.toLowerCase()}`,{weaponClass});
 entity.history!.flags={weaponStatus:{value:'mythic',status:'pending',sourceIds:[`history-${season.toLowerCase()}`]}};
 return entity;
});
export const mythicRelationships=bossWeapons.map(([name,season,boss,location])=>({name,season,boss,location}));
