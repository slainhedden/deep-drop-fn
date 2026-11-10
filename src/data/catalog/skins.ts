import { candidate } from './helpers';

// First-release claims require article verification before production use.
const passes: Record<string,string[]> = {
 C1S2:['Black Knight','Blue Squire','Royale Knight','Sparkle Specialist'],
 C1S3:['Mission Specialist','Moonwalker','Elite Agent'],
 C1S4:['Battlehawk','Teknique','Squad Leader','The Visitor'],
 C1S5:['Huntress','Redline','Sun Strider','Sledgehammer','Rook','Enforcer'],
 C1S6:['DJ Yonder','Giddy-Up','Fable','Dusk','Nightshade','A.I.M.'],
 C1S7:['Sgt. Winter','Powder','Trog','Onesie'],
 C1S8:['Sidewinder','Master Key','Ruin'],
 C1S9:['Sentinel','Bunker Jonesy','Vega','Stratus','Demi','Singularity'],
 C1SX:['X-Lord','Y0ND3R','Tilted Teknique','Sparkle Supreme','Eternal Voyager','Ultima Knight','The Scientist'],
 C2S1:['Turk vs Riptide','Journey vs Hazard','Rippley vs Sludge','Remedy vs Toxin','8-Ball vs Scratch','Cameo vs Chic','Sorana'],
 C2S3:['Scuba Jonesy','Siona','Aquaman'],
 C2S4:['Thor','Jennifer Walters','Groot','Storm','Mystique','Doctor Doom','Tony Stark','Wolverine'],
 C2S5:['The Mandalorian','Reese','Mancake','Mave','Kondor','Lexa','Predator'],
 C2S6:['Agent Jones','Lara Croft','Tarana','Raz','Cluck','Rebirth Raven','Spire Assassin','Neymar Jr'],
 C2S7:['Kymera','Guggimon','Joey','Zyg','Doctor Slone','Rick Sanchez','Superman'],
 C2S8:['Toona Fish','J.B. Chimpanski','Kor','Fabio Sparklemane','Carnage','Cube Queen'],
 C3S1:['Shanta','Ronin','Lt. John Llama','Gumbo','Harlowe','Haven','Spider-Man','The Foundation'],
 C3S2:['Tsuki 2.0','Gunnar','The Imagined','Kiara K.O.','The Origin','Erisa','Doctor Strange','Prowler'],
 C3S3:['Evie','Snap','Adira','Stormfarer','Malik','Sabina','Darth Vader','Indiana Jones'],
 C3S4:['Paradigm (Reality-659)','Bytes','Grriz','Meow Skulls','Lennox Rose','Twyn','Spider-Gwen','The Herald'],
 C4S1:['Selene','Massai','Doom Slayer','Dusty','Nezumi','Helsie','The Ageless','Geralt of Rivia'],
 C4S2:['Renzo the Destroyer','Imani','Thunder','Mystica','Stray','Highwire','Mizuki','Eren Jaeger'],
 C4S3:['Era','Trace','Rian','Relik','Mariposa','Lorenzo','Optimus Prime','Purradise Meowscles'],
 C4S4:['Nolan Chance','Piper Pace','Fish Thicc','Mae','Antonia','Khaby Lame','Kado Thorne','Ahsoka Tano'],
 OG2023:['Spectra Knight','Lil Split','Renegade Lynx','Omegarok'],
 C5S1:['Hope','Oscar','Vengeance Jones','Nisha','Montague','Peter Griffin','Valeria','Solid Snake'],
 C5S2:['Cerberus','Aphrodite','Poseidon','Medusa','Zeus','Artemis','Hades','Korra'],
 C5S3:['The Machinist','Rust','Peabody','Ringmaster Scarr','Brite Raider','Megalo Don','T-60 Power Armor','Wastelander Magneto'],
 C5S4:['Gwenpool','War Machine','Peelverine','Emma Frost','Captain Jones','Mysterio','Shuri','Doom'],
 REMIX2024:['1-Ball','Chaos Director','Meowdas','Undercover Skye','Dynamo TNTina'],
 C6S1:['Nyanja','Jade','Kendo','Daigo','Shadow Blade Hope','The Night Rose','Baymax','Godzilla Evolved'],
};
const shop: Record<string,string[]> = {
 Marvel:['Captain America','Blade','Daredevil','Silver Surfer','Thanos','Scarlet Witch','Moon Knight','Gambit','Rogue','Ghost Rider'],
 DC:['Batman Comic Book Outfit','Harley Quinn','The Joker','Poison Ivy','Deathstroke Zero','Catwoman Comic Book Outfit','Wonder Woman','The Flash','Black Adam'],
 'Star Wars':['Obi-Wan Kenobi','Anakin Skywalker','Padmé Amidala','Darth Maul','Clone Trooper','Imperial Stormtrooper'],
 Anime:['Sasuke Uchiha','Kakashi Hatake','Hinata Hyuga','Itachi Uchiha','Gaara','Orochimaru','Hinata Hyuga','Son Gohan','Piccolo','Beerus','Bulma','Ochaco Uraraka','Katsuki Bakugo','Shoto Todoroki','Frieza','Cell','Levi','Mikasa Ackermann'],
 'Gaming Legends':['Cammy','Guile','Claire Redfield','Chris Redfield','Isaac Clarke','Marcus Fenix','Kait Diaz','Alan Wake','Raiden'],
 'Icon Series':['Ninja','Lachlan','Loserfruit','TheGrefg','Lazarbeam','Bugha','Chica','SypherPK','Ali-A','MrBeast','Marshmello','Travis Scott','Ariana Grande'],
 original:['Renegade Raider','Aerial Assault Trooper','Skull Trooper','Ghoul Trooper','Raven','Ravage','Fishstick','Aura','Crystal','Brite Bomber','Cuddle Team Leader','Rex','Beef Boss','Tomatohead','Dynamo','Red Knight'],
};
export const skins = [
 ...Object.entries(passes).flatMap(([season,names]) => names.map(name => candidate('skin',name,season,`history-${season.toLowerCase()}`,{acquisitionMethod:'battle_pass'}))),
 ...Object.entries(shop).flatMap(([franchiseGroup,names]) => [...new Set(names)].map(name => candidate('skin',name,undefined,'wiki-outfits',{acquisitionMethod:'item_shop',franchiseGroup}))),
];
