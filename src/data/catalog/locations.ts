import type { FortniteEntity } from '../../domain/types';
import { candidate, pending } from './helpers';

// Research queue: introduction claims and exact article references are intentionally
// pending until a reviewer can retrieve and verify them. No inferred season ranges.
const introduced: Record<string, string[]> = {
  C1S1: ['Anarchy Acres','Dusty Depot','Fatal Fields','Flush Factory','Greasy Grove','Lonely Lodge','Loot Lake','Moisty Mire','Pleasant Park','Retail Row','Salty Springs','Tomato Town','Wailing Woods'],
  C1S2: ['Haunted Hills','Junk Junction','Shifty Shafts','Snobby Shores','Tilted Towers'],
  C1S3: ['Lucky Landing'], C1S4: ['Dusty Divot','Risky Reels'],
  C1S5: ['Paradise Palms','Lazy Links','Tomato Temple'],
  C1S6: ['Leaky Lake'],
  C1S7: ['Frosty Flights','Happy Hamlet','Polar Peak'],
  C1S8: ['Lazy Lagoon','Sunny Steps'], C1S9: ['Neo Tilted','Mega Mall','Pressure Plant'],
  C1SX: ['Tilted Town','Starry Suburbs','Gotham City','Moisty Palms'],
  C2S1: ['Misty Meadows','Lazy Lake','Holly Hedges','Craggy Cliffs','Steamy Stacks','Slurpy Swamp','Dirty Docks','Sweaty Sands','Frenzy Farm','Weeping Woods'],
  C2S2: ['The Agency','The Grotto','The Rig','The Yacht','The Shark'],
  C2S3: ['The Authority','The Fortilla','Catty Corner','Rickety Rig','Coral Castle'],
  C2S4: ['Doom’s Domain','Stark Industries'],
  C2S5: ['Salty Towers','Colossal Coliseum','Stealthy Stronghold','Hunter’s Haven'],
  C2S6: ['Boney Burbs','Colossal Crops','The Spire'],
  C2S7: ['Believer Beach','Corny Complex','Holly Hatchery'],
  C2S8: ['Boney Burbs','Corny Crops','The Convergence','The Pyramid'],
  C3S1: ['Camp Cuddle','Chonker’s Speedway','Condo Canyon','Coney Crossroads','The Daily Bugle','Greasy Grove','Logjam Lumberyard','Rocky Reels','Sanctuary','Shifty Shafts','Sleepy Sound','Covert Cavern'],
  C3S2: ['Command Cavern','Synapse Station','The Fortress','The Collider'],
  C3S3: ['Reality Falls','Rave Cave','Logjam Lotus','Logjam Junction','Lazy Lagoon'],
  C3S4: ['Herald’s Sanctum','Lustrous Lagoon','Shimmering Shrine','Cloudy Condos','Chrome Crossroads','Flutter Barn','Fort Jonesy','Shiny Sound','Grim Gables','Reality Tree','Chromejam Junction'],
  C4S1: ['Anvil Square','Breakwater Bay','Brutal Bastion','Faulty Splits','Frenzy Fields','Lonely Labs','Shattered Slabs','Slappy Shores','The Citadel'],
  C4S2: ['MEGA City','Steamy Springs','Kenjutsu Crossing','Knotty Nets'],
  C4S3: ['Rumble Ruins','Creeky Compound','Shady Stilts'],
  C4S4: ['Eclipsed Estate','Relentless Retreat','Sanguine Suites'],
  C5S1: ['Classy Courts','Fencing Fields','Grand Glacier','Hazy Hillside','Lavish Lair','Pleasant Piazza','Rebel’s Roost','Reckless Railways','Ritzy Riviera','Ruined Reels','Snooty Steppes'],
  C5S2: ['Brawler’s Battleground','Grim Gate','Mount Olympus','The Underworld','Restored Reels'],
  C5S3: ['Brutal Beachhead','Nitrodrome','Redline Rig','Sandy Steppes'],
  C5S4: ['Castle Doom','Doom’s Courtyard','Doomstadt','The Raft'],
  C6S1: ['Fox Floodgate','Burd','Canyon Crossing','Demon’s Dojo','Flooded Frogs','Hopeful Heights','Lost Lake','Magic Mosses','Masked Meadows','Nightshift Forest','Pumped Power','Seaport City','Shining Span','Shogun’s Solitude','Twinkle Terrace','Warrior’s Watch','Whiffy Wharf'],
};
const seen = new Set<string>();
export const locations: FortniteEntity[] = Object.entries(introduced).flatMap(([season, names]) => names.flatMap(name => {
  if (seen.has(name)) return [];
  seen.add(name);
  const source = `history-${season.toLowerCase()}`;
  const entity = candidate('location', name, season, source, { namedPoi: true });
  entity.history!.appearances[0].namedPoi = true;
  return [entity];
}));
const byName = new Map(locations.map(location => [location.name, location]));
function appearance(name: string, from: string, through = from, namedPoi = true) {
  const location = byName.get(name)!;
  location.history!.appearances.push({ from, through, namedPoi, ...pending(`history-${from.toLowerCase()}`) });
}
// Only explicitly recorded spans. Chapter changes never bridge absent seasons.
for (const name of ['Pleasant Park','Retail Row','Salty Springs','Risky Reels']) appearance(name, 'C2S1', 'C2S1', name !== 'Risky Reels');
for (const name of ['Greasy Grove','Shifty Shafts']) appearance(name, 'C3S1');
appearance('Tilted Towers','C3S1'); appearance('Lazy Lagoon','C3S3');
for (const name of ['Tilted Towers','Pleasant Park','Retail Row','Salty Springs','Risky Reels','Lonely Lodge','Haunted Hills','Junk Junction','Snobby Shores','Wailing Woods','Greasy Grove','Dusty Divot','Loot Lake','Fatal Fields','Flush Factory','Shifty Shafts','Lucky Landing','Paradise Palms','Lazy Links','Tomato Temple']) appearance(name, 'OG2023');
for (const name of ['Misty Meadows','Lazy Lake','Holly Hedges','Craggy Cliffs','Steamy Stacks','Slurpy Swamp','Dirty Docks','Sweaty Sands','Frenzy Farm','Weeping Woods','Pleasant Park','Retail Row','Salty Springs']) appearance(name, 'REMIX2024');
// A landmark is not promoted to a named POI merely because it has a name.
export const landmarks = [
  candidate('location','The Block','C1S7','history-c1s7',{namedPoi:true}),
  candidate('location','The Shark Prison','C2S3','history-c2s3',{namedPoi:false}),
  candidate('location','The Aftermath','C2S7','history-c2s7',{namedPoi:false}),
  candidate('location','The Apparatus','C4S3','history-c4s3',{namedPoi:false}),
  candidate('location','The Hall of Whispers','C4S1','history-c4s1',{namedPoi:false}),
  candidate('location','Floating Island','C1S6','history-c1s6',{namedPoi:false}),
  candidate('location','The Ruins','C2S4','history-c2s4',{namedPoi:false}),
  candidate('location','The Shark','C2S2','history-c2s2',{namedPoi:true}),
  candidate('location','Lockie’s Lighthouse','C2S1','history-c2s1',{namedPoi:false}),
  candidate('location','Mount Kay','C2S1','history-c2s1',{namedPoi:false}),
  candidate('location','Weather Station','C2S1','history-c2s1',{namedPoi:false}),
  candidate('location','Coral Cove','C2S1','history-c2s1',{namedPoi:false}),
  candidate('location','Pristine Point','C2S1','history-c2s1',{namedPoi:false}),
  candidate('location','Crackshot’s Cabin','C1S7','history-c1s7',{namedPoi:false}),
].filter(entity => !byName.has(entity.name));
