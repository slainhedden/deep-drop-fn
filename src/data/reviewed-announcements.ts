import type { SourceRecord } from '../domain/types';

export interface ReviewedAnnouncement {
 id:string; slug:string; season:string; title:string;
 battlePass?:string[];
 newWeapons?:[string,string][];
 returningWeapons?:[string,string][];
 unvaultedWeapons?:[string,string][];
 pois?:string[]; newPois?:string[];
 items?:[string,string[]][];
 vehicles?:string[]; newVehicles?:string[];
 vaulted?:[string,string][];
}

// Manually checked against the public article body, not inferred from name matches.
// New/unvaulted/carryover sections are separate: balance notes may name vaulted guns.
export const reviewedAnnouncements:ReviewedAnnouncement[]=[
 {id:'epic-launch-c3s1',season:'C3S1',slug:'whats-new-in-fortnite-battle-royale-chapter-3-season-1-flipped',title:'Chapter 3 Season 1: Flipped',
 battlePass:['Shanta','Ronin','Lt. John Llama','Gumbo','Harlowe','Haven','Spider-Man','The Foundation'],
 newWeapons:[['Ranger Assault Rifle','assault rifle'],['MK-Seven Assault Rifle','assault rifle'],['Striker Pump Shotgun','shotgun'],['Auto Shotgun','shotgun'],['Sidearm Pistol','pistol'],['Stinger SMG','smg'],['Hunter Bolt-Action Sniper','sniper rifle']],
 pois:['Greasy Grove','Logjam Lumberyard','Sanctuary','The Daily Bugle','Chonker’s Speedway','Condo Canyon','The Joneses','Coney Crossroads'],
 items:[['Tent',['utility','health']],['Med-Mist',['health']],['Guzzle Juice',['health']]],vehicles:['Quadcrasher'],vaulted:[['Shopping Cart','vehicle'],['All Terrain Kart','vehicle']]},
 {id:'epic-launch-c3s2',season:'C3S2',slug:'whats-new-in-fortnite-battle-royale-chapter-3-season-2-resistance',title:'Chapter 3 Season 2: Resistance',
 battlePass:['Tsuki 2.0','Gunnar','The Imagined','Kiara K.O.','The Origin','Erisa','Doctor Strange','Prowler'],
 newWeapons:[['Combat SMG','smg'],['Striker Burst Rifle','assault rifle']],
 unvaultedWeapons:[['Thermal Scoped Assault Rifle','assault rifle'],['Drum Shotgun','shotgun'],['Revolver','pistol'],['Remote Explosives','explosive'],['Thermal Scoped Revolver','pistol'],['Storm Scout Sniper Rifle','sniper rifle']],
 returningWeapons:[['Ranger Assault Rifle','assault rifle'],['Striker Pump Shotgun','shotgun'],['Auto Shotgun','shotgun'],['Sidearm Pistol','pistol'],['Stinger SMG','smg'],['Hunter Bolt-Action Sniper','sniper rifle'],['Shadow Tracker','pistol'],['Marksman Six Shooter','pistol'],['The Dub','shotgun'],['Boom Sniper Rifle','sniper rifle']],
 pois:['Sanctuary'],items:[['Shockwave Grenade',['utility','mobility']],['Cow Catcher',['utility']],['Off-Road Tires',['utility']],['Repair Torch',['utility']]],vehicles:['Armored Battle Bus','Titan Tank','Mudflap','Motorboat'],newVehicles:['Armored Battle Bus','Titan Tank']},
 {id:'epic-launch-c3s3',season:'C3S3',slug:'whats-new-in-fortnite-battle-royale-chapter-3-season-3-vibin',title:'Chapter 3 Season 3: Vibin’',
 battlePass:['Evie','Snap','Adira','Stormfarer','Malik','Sabina','Darth Vader','Indiana Jones'],
 newWeapons:[['Two-Shot Shotgun','shotgun'],['DMR','marksman rifle'],['Hammer Assault Rifle','assault rifle']],
 returningWeapons:[['Sidearm Pistol','pistol'],['Revolver','pistol'],['Auto Shotgun','shotgun'],['Striker Pump Shotgun','shotgun'],['Stinger SMG','smg'],['Combat SMG','smg'],['Ranger Assault Rifle','assault rifle'],['Striker Burst Rifle','assault rifle'],['Heavy Sniper Rifle','sniper rifle'],['Grenade','explosive'],['Firefly Jar','throwable'],['Harpoon Gun','special'],['Shadow Tracker','pistol'],['Marksman Six Shooter','pistol'],['The Dub','shotgun'],['Boom Sniper Rifle','sniper rifle']],
 pois:['Reality Falls'],newPois:['Reality Falls'],items:[['Shockwave Grenade',['utility','mobility']],['Cow Catcher',['utility']],['Repair Torch',['utility']]],vehicles:['The Baller']},
 {id:'epic-launch-c3s4',season:'C3S4',slug:'whats-new-in-fortnite-battle-royale-chapter-3-season-4-paradise',title:'Chapter 3 Season 4: Paradise',
 battlePass:['Paradigm (Reality-659)','Bytes','Grriz','Meow Skulls','Lennox Rose','Twyn','Spider-Gwen','The Herald'],
 newWeapons:[['EvoChrome Shotgun','shotgun'],['EvoChrome Burst Rifle','assault rifle']],
 returningWeapons:[['Sidearm Pistol','pistol'],['Prime Shotgun','shotgun'],['Lever Action Shotgun','shotgun'],['Rapid Fire SMG','smg'],['Suppressed Submachine Gun','smg'],['Ranger Assault Rifle','assault rifle'],['Hammer Assault Rifle','assault rifle'],['DMR','marksman rifle'],['Hunter Bolt-Action Sniper','sniper rifle'],['Grenade','explosive'],['Firefly Jar','throwable'],['Harpoon Gun','special'],['Shadow Tracker','pistol'],['The Dub','shotgun'],['Boom Sniper Rifle','sniper rifle']],
 pois:['Herald’s Sanctum','Cloudy Condos'],newPois:['Herald’s Sanctum'],items:[['Chrome Splash',['utility','mobility']],['Port-A-Bunker',['utility']],['Boogie Bomb',['utility']],['Shockwave Grenade',['utility','mobility']]]},
 {id:'epic-launch-c4s1',season:'C4S1',slug:'welcome-to-fortnite-battle-royale-chapter-4-season-1',title:'Chapter 4 Season 1',
 battlePass:['Selene','Massai','Doom Slayer','Dusty','Nezumi','Helsie','The Ageless','Geralt of Rivia'],
 newWeapons:[['Ex-Caliber Rifle','special'],['Thunder Shotgun','shotgun'],['Maven Auto Shotgun','shotgun'],['Red-Eye Assault Rifle','assault rifle'],['Twin Mag SMG','smg'],['Tactical Pistol','pistol'],['Shockwave Hammer','special']],
 pois:['The Citadel','Anvil Square','Brutal Bastion','Frenzy Fields','Shattered Slabs','Slappy Shores'],newPois:['The Citadel','Anvil Square','Brutal Bastion','Frenzy Fields','Shattered Slabs','Slappy Shores'],
 items:[['Slap Juice',['health','shield']],['Slap Berry',['health','shield']]],vehicles:['Trail Thrasher'],newVehicles:['Trail Thrasher']},
 {id:'epic-launch-c4s2',season:'C4S2',slug:'whats-new-in-fortnite-battle-royale-chapter-4-season-2-mega',title:'Chapter 4 Season 2: MEGA',
 battlePass:['Renzo the Destroyer','Imani','Thunder','Mystica','Stray','Highwire','Mizuki','Eren Jaeger'],
 newWeapons:[['Kinetic Blade','special'],['Havoc Suppressed Assault Rifle','assault rifle'],['Havoc Pump Shotgun','shotgun'],['Overclocked Pulse Rifle','assault rifle']],
 unvaultedWeapons:[['Heavy Sniper Rifle','sniper rifle'],['Cobra DMR','marksman rifle'],['Dragon’s Breath Sniper','sniper rifle'],['Combat Shotgun','shotgun']],
 returningWeapons:[['Maven Auto Shotgun','shotgun'],['Red-Eye Assault Rifle','assault rifle'],['Twin Mag SMG','smg'],['Tactical Pistol','pistol']],
 pois:['MEGA City','Steamy Springs','Kenjutsu Crossing'],newPois:['MEGA City','Steamy Springs','Kenjutsu Crossing'],items:[['Slurp Juice',['health','shield']],['Chug Cannon',['health','shield']]],vehicles:['Victory Crown Rogue','Nitro Drifter'],newVehicles:['Victory Crown Rogue','Nitro Drifter'],vaulted:[['Trail Thrasher','vehicle'],['Cow Catcher','item'],['Off-Road Tires','item']]},
 {id:'epic-launch-c4s3',season:'C4S3',slug:'whats-new-in-fortnite-battle-royale-chapter-4-season-3-wilds',title:'Chapter 4 Season 3: Wilds',
 battlePass:['Era','Trace','Rian','Relik','Mariposa','Lorenzo','Optimus Prime','Purradise Meowscles'],
 newWeapons:[['Thermal DMR','marksman rifle'],['FlapJack Rifle','assault rifle'],['Kinetic Boomerang','special'],['Cybertron Cannon','explosive']],
 unvaultedWeapons:[['Drum Shotgun','shotgun'],['Combat SMG','smg']],
 returningWeapons:[['Havoc Pump Shotgun','shotgun'],['Maven Auto Shotgun','shotgun'],['Havoc Suppressed Assault Rifle','assault rifle'],['Red-Eye Assault Rifle','assault rifle'],['Submachine Gun','smg'],['Tactical Pistol','pistol'],['Heavy Sniper Rifle','sniper rifle'],['Heisted Breacher Shotgun','shotgun'],['Heisted Accelerant Shotgun','shotgun'],['Heisted Run ‘N’ Gun SMG','smg'],['Shadow Tracker','pistol']],
 items:[['Wildwasp Jar',['throwable']],['Chug Cannon',['health','shield']]]},
 {id:'epic-launch-c4s4',season:'C4S4',slug:'whats-new-in-fortnite-battle-royale-chapter-4-season-4-last-resort',title:'Chapter 4 Season 4: Last Resort',
 battlePass:['Nolan Chance','Piper Pace','Fish Thicc','Mae','Antonia','Khaby Lame','Kado Thorne','Ahsoka Tano'],
 newWeapons:[['Infiltrator Pump Shotgun','shotgun'],['Scoped Burst SMG','smg'],['Twin Mag Assault Rifle','assault rifle']],
 unvaultedWeapons:[['Remote Explosives','explosive'],['Suppressed Sniper Rifle','sniper rifle'],['Suppressed Pistol','pistol']],
 returningWeapons:[['Sharp Tooth Shotgun','shotgun'],['Maven Auto Shotgun','shotgun'],['Havoc Suppressed Assault Rifle','assault rifle'],['Thermal DMR','marksman rifle'],['Combat SMG','smg'],['Heisted Breacher Shotgun','shotgun'],['Heisted Accelerant Shotgun','shotgun'],['Heisted Run ‘N’ Gun SMG','smg'],['Shadow Tracker','pistol'],['Midas’ Drum Gun','smg'],['TNTina’s Ka-Boom Bow','bow'],['Kit’s Charge Shotgun','shotgun'],['Kit’s Shockwave Launcher','explosive'],['Zyg and Choppy’s Ray Gun','special'],['The Foundation’s MK-Seven Assault Rifle','assault rifle'],['Gunnar’s Stinger SMG','smg']],
 pois:['Sanguine Suites','Relentless Retreat','Eclipsed Estate','Rumble Ruins','MEGA City'],newPois:['Sanguine Suites','Relentless Retreat','Eclipsed Estate'],
 items:[['Rocket Ram',['utility','mobility']],['Business Turret',['utility']],['Crash Pad Jr.',['utility','mobility']],['Shockwave Grenade',['utility','mobility']],['Ocean’s Bottomless Chug Jug',['health','shield']]],vehicles:['Nitro Fang'],newVehicles:['Nitro Fang']},
 {id:'epic-launch-c5s4',season:'C5S4',slug:'be-a-marvel-hero-in-fortnite-battle-royale-chapter-5-season-4-absolute-doom',title:'Chapter 5 Season 4: Absolute Doom',
 battlePass:['Gwenpool','War Machine','Peelverine','Emma Frost','Captain Jones','Mysterio','Shuri','Doom'],
 newWeapons:[['Dual Micro SMGs','smg'],['War Machine’s Arsenal','special'],['War Machine’s Auto Turret','special'],['Monarch Pistol','pistol'],['Sovereign Shotgun','shotgun']],
 unvaultedWeapons:[['Striker Burst Rifle','assault rifle'],['Doctor Doom’s Arcane Gauntlets','special'],['Captain America’s Shield','special']],
 returningWeapons:[['Striker AR','assault rifle'],['Combat Assault Rifle','assault rifle'],['Ranger Pistol','pistol'],['Hammer Pump Shotgun','shotgun'],['Gatekeeper Shotgun','shotgun'],['Hyper SMG','smg']],
 pois:['Castle Doom','Doomstadt','The Raft'],newPois:['Castle Doom','Doomstadt','The Raft'],items:[['Shockwave Grenade',['utility','mobility']],['War Machine’s Hover Jets',['utility','mobility']]]},
];

export const extraReviewedSources:[string,string,string][]=[
 ['epic-og-pass-2023','run-it-back-with-the-og-pass-and-og-shop-in-fortnite-battle-royale','OG Pass and OG Shop'],
 ['epic-og-2023','fortnite-og-drop-back-into-battle-royale-chapter-1','Fortnite OG (2023) rollout'],
 ['epic-season8','season-8','Season 8 launch'],['epic-season9','season-9','Season 9 launch'],
 ['epic-primal-crafting','fortnite-primal-survival-crafting-guide','Primal crafting guide'],
 ['epic-cubed','whats-new-in-fortnite-battle-royale-chapter-2-season-8-cubed','Cubed launch'],
 ['epic-showdown-2026','showdown-in-the-new-fortnite-battle-royale-season','Showdown (2026)'],
 ['epic-runners-2026','extract-and-collect-sprites-on-a-new-map-in-fortnite-runners','Runners (2026)'],
 ['epic-override-2026','fortnite-override-break-the-rules-change-the-game','Override (2026)'],
 ['epic-treasure-2026','fortnite-treasure-hunters-the-greatest-adventure-of-all-time','Treasure Hunters (2026)'],
 ['epic-shattered-2026','fortnite-shattered-end-of-season-live-event-june-5-7-pm-et','Shattered live-event announcement'],
];
export const reviewedSources:SourceRecord[]=[...reviewedAnnouncements.map(({id,slug,title})=>({id,slug,title})),...extraReviewedSources.map(([id,slug,title])=>({id,slug,title}))].map(({id,slug,title})=>({id,label:`Epic Games — ${title}`,url:`https://www.fortnite.com/news/${slug}`,status:'verified',verifiedOn:'2026-11-09',notes:'Article body retrieved and manually reviewed. Only individually cited claims are verified; an article mention is not proof of first introduction or uninterrupted availability.'}));
