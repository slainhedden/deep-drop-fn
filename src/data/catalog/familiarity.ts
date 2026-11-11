import type { EntityType } from '../../domain/types';

// Editorial recall priors, never ownership rarity or measured player frequencies.
// Keep a conservative category default until playtest data justifies refinement.
const defaults:Record<EntityType,number>={location:.4,weapon:.45,skin:.35,collaboration:.65,item:.4,vehicle:.5,event:.55,boss:.45,npc:.4,container:.7,ammo:.8,material:.8,faction:.6,cosmetic:.35,feature:.4};
const estimates:Record<string,number>={
 'MEGA City':.88,'Anvil Square':.65,'Brutal Bastion':.7,'The Citadel':.75,
 'The Shark':.82,'The Authority':.8,'The Fortilla':.65,'The Daily Bugle':.8,
 'Covert Cavern':.62,'The Collider':.72,'Rave Cave':.7,'Synapse Station':.45,
 'Starry Suburbs':.32,'Gotham City':.6,'Leaky Lake':.42,'Chromejam Junction':.28,
 'The Block':.62,'Fox Floodgate':.38,'Pristine Point':.22,'Weather Station':.38,
 'Kinetic Blade':.83,'Shockwave Hammer':.9,'Infinity Blade':.92,'DMR':.7,
 'Midas’ Drum Gun':.95,'Brutus’ Minigun':.88,'Skye’s Assault Rifle':.83,
 'Batman Comic Book Outfit':.95,'Captain America':.92,'Harley Quinn':.9,
 'Renegade Raider':.97,'Skull Trooper':.95,'Fishstick':.97,'Aura':.9,
 'Ninja':.95,'Bugha':.85,'Marshmello':.94,'Travis Scott':.95,
 'Launch Pad':.98,'Bouncer':.9,'Cozy Campfire':.84,'Storm Flip':.55,
 'Astronomical':.94,'Showtime':.85,'Rift Tour':.8,
};
export const familiarityPrior=(type:EntityType,name:string):number=>estimates[name] ?? defaults[type];
