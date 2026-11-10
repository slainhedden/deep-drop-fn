import type { QuestionTemplate } from '../domain/types';
const broad=(id:string,category:QuestionTemplate['category'],answerType:QuestionTemplate['answerType'],prompt:string,field:string):QuestionTemplate=>({id,category,answerType,baseDifficulty:'easy',parameters:[],family:id,prompt:()=>prompt,predicates:()=>[{field,operator:'eq',value:true}],explanation:a=>`${a.name} fits this category according to its documented classification.`});
export const gameplayTemplates:QuestionTemplate[]=[
 broad('weapon-general','Weapons','weapon','Name a Fortnite weapon.','isWeapon'),
 broad('crossover-general','Crossovers','collaboration','Name a crossover character with a Fortnite skin.','hasOutfit'),
 broad('weapon-mythic-version','Weapons','weapon','Name a Fortnite weapon that has a Mythic version.','hasMythicVersion'),
 broad('weapon-exotic-class','Weapons','weapon','Name an Exotic weapon in Fortnite.','isExotic'),
 broad('loot-container','Containers','container','Name a Fortnite Battle Royale loot container.','isLootContainer'),
 {...broad('mobility-equipment','Items','item','Name an item or weapon used for mobility in Fortnite.','playerMobility'),answerTypes:['item','weapon'],diversityGroup:'movement'},
 broad('throwable-equipment','Items','item','Name a throwable utility item in Fortnite.','isThrowableUtility'),
 broad('trap-equipment','Items','item','Name a placeable trap in Fortnite.','isPlaceableTrap'),
 broad('ammunition-class','Ammunition','ammo','Name a standard firearm ammunition type in Fortnite.','isAmmo'),
 {...broad('foraged-class','Items','item','Name a foraged consumable in Fortnite.','isForaged'),diversityGroup:'fish-and-foraging'},
 // Small closed sets and incomplete exact historical tables remain unavailable.
 {...broad('building-material','Materials','material','Name a Fortnite building material.','buildingMaterial'),status:'pending',scopeNote:'Complete three-answer category is below the existing five-answer gameplay minimum.'},
 {...broad('crafting-material','Materials','material','Name an ingredient used to craft Fortnite equipment.','craftingIngredient'),status:'pending',scopeNote:'Only Animal Bones and Mechanical Parts reviewed; other crafting ingredients remain unreviewed.'},
 {...broad('chest-variant','Containers','container','Name a chest variant in Fortnite Battle Royale.','isChest'),status:'pending',scopeNote:'Chest taxonomy incomplete; cosmetic and rarity variants require canonical review.'},
 {...broad('fish-class','Items','item','Name a fish item in Fortnite Battle Royale.','isFish'),diversityGroup:'fish-and-foraging'},
 {id:'marauder-drops',category:'NPCs',answerType:'weapon',answerTypes:['weapon','item','ammo','material'],baseDifficulty:'expert',advanced:true,status:'pending',family:'npc-drops',parameters:[],prompt:()=> 'Name an item Marauders could drop in Chapter 2 Season 3.',predicates:()=>[{field:'droppedBy',operator:'relatedTo',value:'npc-marauder',season:'C2S3'},{field:'availability',operator:'availableIn',value:'C2S3'}],explanation:a=>`${a.name} is in the reviewed Marauder drop table.`,scopeNote:'Complete C2S3 drop table unavailable. No generic Ammo answer or guessed individual items admitted.'},
 ...(['weapon','item'] as const).map((type):QuestionTemplate=>({id:`${type}-container-loot`,category:type==='weapon'?'Weapons':'Items',answerType:type,baseDifficulty:'hard',status:'pending',advanced:true,family:'container-loot',parameters:[{key:'container',values:['container-heist-bag','container-chrome-chest','container-holo-chest']}],prompt:({container})=>`Name an ${type} obtainable from ${container}.`,predicates:({container})=>[{field:'foundIn',operator:'relatedTo',value:container}],explanation:a=>`${a.name} has a documented container relationship.`,scopeNote:'Individual source relationships are verified; complete container loot tables are not.'})),
];
