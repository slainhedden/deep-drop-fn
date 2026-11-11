import type {EntityType,QuestionTemplate,Category} from '../domain/types';
import research from './research/phase5b.json';
const fact=(field:string,value:string|number|boolean=true,operator:'eq'|'includes'='eq')=>({field,value,operator});
const make=(id:string,prompt:string,category:Category,types:EntityType[],field:string,group:string):QuestionTemplate=>({id,category,answerType:types[0],answerTypes:types,baseDifficulty:'easy',family:group,diversityGroup:group,parameters:[],prompt:()=>prompt,predicates:()=>[fact(field)],coverage:{sourceIds:research.sources.map(s=>s.id),reviewedOn:research.reviewedOn,note:'Positive, field-verified source population. Original BR and documented special BR seasons only; separate-mode tails excluded.'},explanation:a=>`${a.name} has explicit evidence for this gameplay relationship; this does not assert it is available in the current season.`});
const chapter=(base:QuestionTemplate,key:string,chapters:number[],wording:(c:number)=>string):QuestionTemplate=>({...base,parameters:[{key:'chapter',values:chapters}],prompt:p=>wording(Number(p.chapter)),predicates:p=>[fact(key,p.chapter,'includes')]});
const gameplay:EntityType[]=['item','weapon','vehicle','feature'];
export const phase5bTemplates:QuestionTemplate[]=[
 make('world-food-business','Name a Fortnite food or drink business.','Locations',['feature'],'isFoodBusiness','food-businesses'),
 make('world-food-location','Name a location that had a food or drink business.','Locations',['location'],'hadFoodBusiness','food-geography'),
 make('world-keycard-boss','Name a Fortnite boss with a keycard.','Bosses',['boss'],'hasKeycard','boss-access'),
 make('world-mythic-weapon-boss','Name a boss that dropped a Mythic weapon.','Bosses',['boss'],'droppedMythicWeapon','boss-loot'),
 {...make('world-boss-loot','Name a weapon you could get by defeating a Fortnite boss.','Weapons',['weapon'],'bossLoot','boss-drops'),status:'pending',scopeNote:'Named loadouts do not define complete ordinary/random boss drop populations.'},
 make('world-boss-mythic','Name a Mythic item obtainable from a Fortnite boss.','Items',['weapon','item'],'bossMythicLoot','boss-mythics'),
 chapter(make('world-boss-chapter','','Bosses',['boss'],'','boss-history'),'bossChapters',[1,2,3,4,5,6,7],c=>`Name an AI boss that appeared in Chapter ${c}.`),
 make('world-vault-location','Name a POI or landmark that had a vault.','Locations',['location'],'worldVaultLocation','map-features'),
 make('world-boss-location','Name a location where an AI boss spawned.','Locations',['location'],'hadAIBoss','boss-geography'),
 make('world-mythic-location','Name a location where a Mythic boss spawned.','Locations',['location'],'hadMythicBoss','boss-geography'),
 make('world-npc-location','Name a location where a Character Collection NPC appeared.','Locations',['location'],'hadCollectionNPC','character-geography'),
 chapter(make('world-npc-location-chapter','','Locations',['location'],'','character-geography'),'npcLocationChapters',[2,3,4,5,6,7],c=>`Name a Chapter ${c} location where a Character Collection NPC appeared.`),
 chapter(make('world-guard-chapter','','NPCs',['npc'],'','npc-guard-history'),'guardChapters',[2,3,4,5,6,7],c=>`Name a type of NPC guard from Chapter ${c}.`),
 make('world-returning-boss','Name an AI boss that appeared in more than one chapter.','Bosses',['boss'],'bossMultipleChapters','boss-returns'),
 make('world-guard-type','Name a type of NPC guard in Fortnite Battle Royale.','NPCs',['npc'],'isGuardType','npc-guards'),
 make('world-npc-interaction','Name a service or interaction offered by a Fortnite NPC.','NPCs',['feature'],'npcInteraction','npc-services'),
 make('world-gas-location','Name a location that had a gas station.','Locations',['location'],'hadGasStation','fuel-geography'),
 make('world-bench-location','Name a location that had a weapon upgrade bench.','Locations',['location'],'hadUpgradeBench','upgrade-geography'),
 chapter(make('world-landmark-chapter','','Locations',['location'],'','landmark-geography'),'landmarkChapters',[2,3,4,5,6,7],c=>`Name a Chapter ${c} landmark.`),
 chapter(make('world-unnamed-chapter','','Locations',['location'],'','unnamed-geography'),'unnamedChapters',[1,2,3,4,5,6,7],c=>`Name an unnamed location from Chapter ${c}.`),
 make('world-heal-allies','Name an item that can directly heal or shield another player.','Items',['item','weapon'],'healsOtherPlayers','restoration'),
 make('world-heal-overtime','Name something that restores health or shield over time.','Items',gameplay,'healingOverTime','restoration'),
 make('world-low-gravity','Name something that can give you a low-gravity effect in Fortnite.','Items',gameplay,'function:lowGravity','low-gravity'),
 make('world-fall-protection','Name something that can prevent fall damage in Fortnite.','Items',gameplay,'function:fallProtection','fall-protection'),
 make('world-environment','Name a form of environmental mobility in Fortnite.','Items',['feature'],'environmentalMobility','environmental-mobility'),
 make('world-passengers','Name a Fortnite vehicle with at least two seats.','Vehicles',['vehicle'],'carriesPassengers','vehicle-capacity'),
 ...([['knockback','Name something that can knock back a player.','knockback'],['structureDamage','Name something that can damage structures in Fortnite.','structure-damage'],['explosive','Name a Fortnite explosive weapon.','explosives'],['fire','Name something that can start a fire in Fortnite.','fire-mechanics'],['reveal','Name something that can reveal enemies in Fortnite.','reconnaissance'],['stealth','Name something you could use for stealth in Fortnite.','stealth'],['speed','Name something that can boost your movement speed in Fortnite.','movement-speed']]as const).map(([field,prompt,group])=>({...make(`world-function-${field}`,prompt,'Items',gameplay,`function:${field}`,group),...(field==='structureDamage'?{status:'pending' as const,scopeNote:'Complete weapon/prop structure-damage populations have not been reviewed; positive examples alone do not approve the bank.'}:{})})),
 make('world-multiple-chapters','Name an item or weapon available in more than one Fortnite chapter.','Items',['item','weapon'],'multipleGameplayChapters','loot-history'),
 ...(['rotate','restorative']as const).map(tag=>({...chapter(make(`world-${tag}-chapter`,'','Items',['item','weapon','vehicle'],'','chapter-gameplay'), 'gameplayChapters',[1,2,3,4,5,6,7],c=>tag==='rotate'?`Name something you could use to rotate during Chapter ${c}.`:`Name something that could restore health or shield during Chapter ${c}.`),predicates:(p:Record<string,string|number>)=>[fact('gameplayChapters',p.chapter,'includes'),fact(`function:${tag}`)]})),
];
