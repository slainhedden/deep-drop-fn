import { entitiesById } from './entities';
import type { FortniteEntity, Predicate, QuestionTemplate } from '../domain/types';
import { reviewedAnnouncements } from './reviewed-announcements';
import { compareSeasons, seasonLabel } from './seasons';

const core=reviewedAnnouncements.filter(article=>article.season.startsWith('C3') || article.season.startsWith('C4'));
export const reviewedPassSeasons=reviewedAnnouncements.filter(article=>article.battlePass?.length).map(article=>article.season);
const p=(field:string,operator:Predicate['operator'],value:Predicate['value']):Predicate=>({field,operator,value});
const label=(season:string|number)=>seasonLabel(String(season));
const ranges=core.map(article=>article.season);
const passRanges=[...ranges,'OG2023'];
const explanation=(answer:FortniteEntity)=>`${answer.name} is documented in the cited Epic Games season announcement. This answer uses a reviewed release or launch snapshot, not an inferred continuous history.`;
const weaponClasses=['shotgun','assault rifle','smg','sniper rifle','pistol','marksman rifle'];

export const reviewedTemplates:QuestionTemplate[]=[
 {id:'reviewed-pass-season',family:'skin-introduction',category:'Skins',answerType:'skin',baseDifficulty:'medium',parameters:[{key:'season',values:reviewedPassSeasons}],prompt:({season})=>`Name a Battle Pass outfit first released in ${label(season)}.`,predicates:({season})=>[p('reviewedBattlePass','includes',season)],explanation},
 {id:'reviewed-pass-range',family:'skin-introduction',category:'Skins',answerType:'skin',baseDifficulty:'medium',parameters:[{key:'from',values:passRanges},{key:'through',values:passRanges}],prompt:({from,through})=>`Name a Battle Pass or OG Pass outfit first released from ${label(from)} through ${label(through)}, inclusive.`,predicates:({from,through})=>[p('reviewedPassRelease','eq',true),p('introduction','introducedOnOrAfter',from),p('introduction','introducedOnOrBefore',through)],explanation},
 {id:'reviewed-launch-loot',family:'weapon-availability',category:'Weapons',answerType:'weapon',baseDifficulty:'medium',parameters:[{key:'season',values:[...reviewedAnnouncements.map(article=>article.season),'OG2023']}],prompt:({season})=>`Name a weapon listed as new, unvaulted or returning in Epic’s ${label(season)} launch overview.`,predicates:({season})=>[p('reviewedLoot','includes',season)],explanation},
 {id:'reviewed-launch-weapon-class',family:'weapon-availability',category:'Weapons',answerType:'weapon',baseDifficulty:'hard',parameters:[{key:'season',values:[...reviewedAnnouncements.map(article=>article.season),'OG2023']},{key:'weaponClass',values:weaponClasses}],prompt:({season,weaponClass})=>`Name a ${weaponClass} listed in Epic’s ${label(season)} launch loot rundown.`,predicates:({season,weaponClass})=>[p('reviewedLoot','includes',season),p('weaponClass','eq',weaponClass)],explanation},
 {id:'reviewed-launch-both-seasons',family:'weapon-availability',category:'Weapons',answerType:'weapon',baseDifficulty:'hard',parameters:[{key:'from',values:ranges},{key:'through',values:ranges}],prompt:({from,through})=>`Name a weapon listed in the launch loot rundowns for both ${label(from)} and ${label(through)}.`,predicates:({from,through})=>[p('reviewedLoot','includes',from),p('reviewedLoot','includes',through)],explanation},
 {id:'reviewed-new-gun-season',family:'weapon-introduction',category:'Weapons',answerType:'weapon',baseDifficulty:'medium',parameters:[{key:'season',values:[...reviewedAnnouncements.map(article=>article.season),'OG2023']}],prompt:({season})=>`Name a gun introduced at the launch of ${label(season)}.`,predicates:({season})=>[p('reviewedNewGuns','includes',season)],explanation},
 {id:'reviewed-new-gun-range',family:'weapon-introduction',category:'Weapons',answerType:'weapon',baseDifficulty:'medium',parameters:[{key:'from',values:ranges},{key:'through',values:ranges}],prompt:({from,through})=>`Name a gun introduced at a season launch from ${label(from)} through ${label(through)}, inclusive.`,predicates:({from,through})=>[p('reviewedLaunchGun','eq',true),p('introduction','introducedOnOrAfter',from),p('introduction','introducedOnOrBefore',through)],explanation},
 {id:'reviewed-new-gun-class-range',family:'weapon-introduction',category:'Weapons',answerType:'weapon',baseDifficulty:'hard',parameters:[{key:'from',values:ranges},{key:'through',values:ranges},{key:'weaponClass',values:weaponClasses}],prompt:({from,through,weaponClass})=>`Name a ${weaponClass} introduced at a season launch from ${label(from)} through ${label(through)}, inclusive.`,predicates:({from,through,weaponClass})=>[p('reviewedLaunchGun','eq',true),p('weaponClass','eq',weaponClass),p('introduction','introducedOnOrAfter',from),p('introduction','introducedOnOrBefore',through)],explanation},
 {id:'reviewed-unvaulted-season',family:'weapon-returns',category:'Weapons',answerType:'weapon',baseDifficulty:'medium',parameters:[{key:'season',values:[...reviewedAnnouncements.map(article=>article.season),'OG2023']}],prompt:({season})=>`Name a weapon explicitly listed as unvaulted in Epic’s ${label(season)} launch overview.`,predicates:({season})=>[p('reviewedUnvaulted','includes',season)],explanation},
 {id:'reviewed-carryover-season',family:'weapon-carryovers',category:'Weapons',answerType:'weapon',baseDifficulty:'medium',parameters:[{key:'season',values:reviewedAnnouncements.filter(article=>article.season!=='C3S4' && article.season!=='C4S4').map(article=>article.season)}],prompt:({season})=>`Name a weapon listed as a previous-season carryover in Epic’s ${label(season)} launch overview.`,predicates:({season})=>[p('reviewedReturning','includes',season)],explanation},
 {id:'reviewed-poi-overview',family:'location-availability',category:'Locations',answerType:'location',baseDifficulty:'medium',parameters:[{key:'season',values:[...reviewedAnnouncements.map(article=>article.season),'OG2023']}],prompt:({season})=>`Name a named POI mentioned in Epic’s ${label(season)} launch overview.`,predicates:({season})=>[p('namedPoi','eq',true),p('reviewedPoiOverview','includes',season)],explanation},
 {id:'reviewed-items-overview',family:'item-availability',category:'Items',answerType:'item',baseDifficulty:'medium',parameters:[{key:'season',values:[...reviewedAnnouncements.map(article=>article.season),'OG2023']}],prompt:({season})=>`Name a utility or healing item featured in Epic’s ${label(season)} launch overview.`,predicates:({season})=>[p('reviewedItems','includes',season)],explanation},
 {id:'reviewed-exotic-loot',family:'weapon-status',category:'Weapons',answerType:'weapon',baseDifficulty:'medium',parameters:[],prompt:()=> 'Name an Exotic weapon listed in the Resistance, Wilds or Last Resort launch loot rundowns.',predicates:()=>[p('weaponStatus','historyFlag','exotic')],explanation},
 {id:'reviewed-heist-mythics',family:'weapon-status',category:'Weapons',answerType:'weapon',baseDifficulty:'medium',parameters:[],prompt:()=> 'Name a Mythic weapon in Kado Thorne’s property vaults at the launch of Chapter 4 Season 4.',predicates:()=>[p('heistMythic','historyFlag',true)],explanation},
 {id:'reviewed-mythic-vault-pois',family:'location-mythic',category:'Locations',answerType:'location',baseDifficulty:'hard',parameters:[],prompt:()=> 'Name a named POI documented as a Mythic-weapon source in the Last Resort or Absolute Doom launch overviews.',predicates:()=>[p('reviewedMythicSource','historyFlag',true)],explanation},
 {id:'reviewed-mobility-items',family:'item-function',category:'Items',answerType:'item',baseDifficulty:'easy',parameters:[],prompt:()=> 'Name a mobility item featured in the reviewed Flipped, Paradise, Last Resort, Absolute Doom or OG launch overviews.',predicates:()=>[p('reviewedMobility','historyFlag',true)],explanation},
 {id:'reviewed-og-vehicles',family:'vehicle-returns',category:'Vehicles',answerType:'vehicle',baseDifficulty:'easy',parameters:[],prompt:()=> 'Name a vehicle in Epic’s Fortnite OG (2023) returning-vehicle rollout.',predicates:()=>[p('reviewedVehicles','includes','OG2023')],explanation},
 {id:'reviewed-classic-pois',family:'location-history',category:'Locations',answerType:'location',baseDifficulty:'medium',parameters:[],prompt:()=> 'Name a named POI described in Epic’s original Season 8, Season 9 or Fortnite OG overview.',predicates:()=>[p('reviewedClassicOverview','includes','OG2023')],explanation},
 {id:'reviewed-og-items',family:'item-returns',category:'Items',answerType:'item',baseDifficulty:'easy',parameters:[],prompt:()=> 'Name a utility item in Epic’s Fortnite OG (2023) unvaulting overview.',predicates:()=>[p('reviewedItems','includes','OG2023'),p('itemClasses','includes','utility')],explanation},

 {id:'reviewed-loot-bosses',family:'boss-loot',category:'Bosses',answerType:'boss',baseDifficulty:'medium',parameters:[],prompt:()=> 'Name a boss described as a special-weapon source in the Flipped, MEGA or Absolute Doom launch overviews.',predicates:()=>[p('isBoss','eq',true),p('reviewedLootBoss','eq',true)],explanation},

];

function reviewedExplanation(template:QuestionTemplate,answer:FortniteEntity,parameters:Record<string,string|number>):string {
 const introduction=answer.history?.introduction;
 if (template.family==='skin-introduction') return `${answer.name} first released in ${label(introduction!.season)} through the ${answer.facts.acquisitionMethod==='og_pass' ? 'OG Pass' : 'Battle Pass'}.`;
 if (template.family==='weapon-introduction') return `${answer.name} was introduced at the ${label(introduction!.season)} launch. It is classified as ${answer.facts.weaponClass}.`;
 if (template.id==='reviewed-launch-both-seasons') return `${answer.name} is listed in both the ${label(parameters.from)} and ${label(parameters.through)} launch loot rundowns.`;
 if (template.id==='reviewed-heist-mythics') return `${answer.name} was one of the historical Mythic weapons stored in Thorne’s property vaults in Chapter 4 Season 4.`;
 if (template.id==='reviewed-exotic-loot') return `${answer.name} is explicitly labeled an Exotic weapon in the reviewed Resistance, Wilds or Last Resort loot lists.`;
 if (template.id==='reviewed-mythic-vault-pois') {
  const mythic=answer.history?.relationships.find(record=>record.kind==='mythic' && record.status==='verified');
  if (mythic) return `${answer.name} had a property vault containing Mythic treasures such as ${entitiesById.get(mythic.entityId)!.name} in Chapter 4 Season 4.`;
  const boss=answer.history?.relationships.find(record=>record.kind==='boss' && record.status==='verified');
  return `${answer.name} was home to ${entitiesById.get(boss!.entityId)!.name}, who dropped a Mythic weapon in Chapter 5 Season 4.`;
 }
 if (template.id==='reviewed-loot-bosses') {
  const drop=answer.history?.relationships.find(record=>record.kind==='mythic' && record.status==='verified');
  return `${answer.name} was a source of a Mythic ${entitiesById.get(drop!.entityId)!.name} in ${label(drop!.season)}.`;
 }
 if (template.id==='reviewed-mobility-items') {
  const effects:Record<string,string>={'Chrome Splash':'turning the player into a Blob that can air dash','Rocket Ram':'launching the player through the air','Crash Pad Jr.':'bouncing the player','Shockwave Grenade':'launching players with a shockwave','War Machine’s Hover Jets':'letting the player hover','Grappler':'pulling the player toward a grappling point','Itemized Glider Redeploy':'allowing glider redeployment','Jetpack':'powered aerial movement','Spider-Man’s Web-Shooters':'swinging between structures'};
  return `${answer.name} provides mobility by ${effects[answer.name]}.`;
 }
 if (template.id==='reviewed-og-vehicles') return `${answer.name} returned during the staged Fortnite OG (2023) vehicle rollout.`;
 if (template.id==='reviewed-og-items') return `${answer.name} was a utility item included in Epic’s Fortnite OG (2023) unvaulting overview.`;
 if (template.id==='reviewed-classic-pois') return `${answer.name} is a named Chapter 1 POI described in the original Season 8, Season 9 or OG announcement.`;
 if (parameters.season) {
  const season=String(parameters.season);
  const contains=(field:string)=>Array.isArray(answer.facts[field]) && (answer.facts[field] as string[]).includes(season);
  const kind=contains('reviewedNew') ? 'new' : contains('reviewedUnvaulted') ? 'unvaulted' : contains('reviewedReturning') ? 'returning' : 'featured';
  return `${answer.name} is ${kind} in Epic’s ${label(season)} overview${answer.type==='weapon' ? `, with weapon class ${answer.facts.weaponClass}` : ''}.`;
 }
 return explanation(answer);
}
for (const template of reviewedTemplates) template.explanation=(answer,parameters)=>reviewedExplanation(template,answer,parameters);

/** Supported scopes are explicit. A source corpus is not a complete Fortnite history. */
for (const template of reviewedTemplates) template.scopeNote='Reviewed Epic launch-article scope. Full Battle Pass lineups are covered for Chapter 3 and Chapter 4. Other scoped questions use only the explicit article sections named in the prompt.';
export function reviewedParametersSupported(template:QuestionTemplate,parameters:Record<string,string|number>):boolean {
 // The activated OG-return family supersedes this identical named-POI set.
 if (template.id==='reviewed-poi-overview' && parameters.season==='OG2023') return false;
 if (template.id==='reviewed-launch-both-seasons' && compareSeasons(String(parameters.from),String(parameters.through))>=0) return false;
 // Do not duplicate a single-season wording with the inclusive-range family.
 if (['reviewed-pass-range','reviewed-new-gun-range','reviewed-new-gun-class-range'].includes(template.id) && parameters.from===parameters.through) return false;
 return true;
}
