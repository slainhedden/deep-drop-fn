import { candidate } from './helpers';

const itemClasses:Record<string,string[]> = {
 mobility:['Launch Pad','Bouncer','Chiller Grenade','Grapple Glove','Grapple Blade','Kinetic Ore','Shockwave Hammer','Rocket Ram','Witch Broom','Silver Surfer’s Board','Crash Pad Jr.','Inflate-A-Bull','Hop Rock','Shadow Stone','Flowberry','Nitro Splash'],
 throwable:['Grenade','Clinger','Stink Bomb','Smoke Grenade','Junk Rift','Air Strike','Firefly Jar','Firework Flare Gun','Shield Bubble','Shield Bubble Jr.','Port-A-Bunker','Port-A-Fortress','Decoy','Zapper Trap'],
 trap:['Damage Trap','Cozy Campfire','Chiller','Poison Dart Trap','Armored Wall'],
 health:['Corn','Pepper','Klomberry','Guava','Chili Chug Splash'],
 shield:['Slurp Mushroom','Shield Breaker EMP','Slurp Barrel'],
 utility:['Repair Torch','Cow Catcher','Off-Road Tires','Falcon Scout','Recon Scanner','Storm Flip','Sneaky Snowman','Creepin’ Cardboard','Prop-ifier','Dial-A-Drop','Shield Bubble'],
};
// Objects and offensive EMPs are deliberately excluded from the healing bank.
export const items = [...new Set(Object.values(itemClasses).flat())]
 .filter(name=>!['Slurp Barrel','Shield Breaker EMP','Kinetic Ore'].includes(name))
 .map(name=>candidate('item',name,undefined,'wiki-items',{itemClasses:Object.entries(itemClasses).filter(([,names])=>names.includes(name)).map(([kind])=>kind)}));

const vehicles = ['Island Prevalent','Scorpion','Behemoth','Backfire','Cybertruck'];
export const vehicleCandidates = vehicles.map(name => candidate('vehicle',name,undefined,'wiki-vehicles',{isVehicle:true,vehicleClass:'road'}));
const bosses:Record<string,string[]> = {
 C2S2:['Midas','Brutus','TNTina','Meowscles','Skye','Deadpool'], C2S3:['Jules','Kit','Ocean'], C2S4:['Doctor Doom','Iron Man','Wolverine'],
 C2S5:['The Mandalorian','Predator'], C2S6:['Spire Assassin','Raz'], C2S7:['Doctor Slone'],
 C3S1:['Gunnar','The Foundation'], C3S2:['Huntmaster Saber'], C3S4:['The Herald'], C4S1:['The Ageless Champion'], C4S4:['Kado Thorne'],
 C5S1:['Oscar','Nisha','Montague','Valeria','Peter Griffin'], C5S2:['Zeus','Ares','Cerberus','Hades'], C5S3:['Megalo Don','The Machinist','Ringmaster Scarr'],
 C5S4:['Doombot','Emma Frost','Mysterio'], C6S1:['Shogun X','Night Rose'],
};
export const bossCandidates = Object.entries(bosses).flatMap(([season,names]) => names.map(name => candidate('boss',name,season,`history-${season.toLowerCase()}`,{isBoss:true})));
export const eventCandidates = [
 ['Showtime','C1S7'],['Astronomical','C2S2'],['Rift Tour','C2S7'],['Remix: The Finale','REMIX2024'],
].map(([name,season]) => candidate('event',name,season,'wiki-events',{isLiveEvent:true,eventType:'concert'}));
