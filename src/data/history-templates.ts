import type { Category, EntityType, Predicate, QuestionTemplate, TemplateParameter } from '../domain/types';
import { seasons, seasonLabel } from './seasons';

const chapters: TemplateParameter[] = [{key:'chapter',values:[1,2,3,4,5,6,7]}];
const seasonParameters: TemplateParameter[] = [{key:'season',values:seasons.map(season => season.id)}];
const boundaries: TemplateParameter[] = [{key:'from',values:['C1S1','C1S4','C1S7','C2S1','C2S2','C3S1','C4S1','C5S1']},{key:'through',values:['C1S7','C1SX','C2S2','C2S8','C3S4','C4S4','C5S4','C6S1']}];
const predicate = (field:string,operator:Predicate['operator'],value:Predicate['value']):Predicate => ({field,operator,value});
const types: [EntityType,Category,string][] = [['location','Locations','named POI'],['weapon','Weapons','weapon'],['skin','Skins','outfit'],['item','Items','item'],['vehicle','Vehicles','vehicle'],['event','Events','live event'],['boss','Bosses','boss']];
const scope = 'Disabled pending source retrieval and review of historical answer-bank coverage. Pending facts cannot qualify an answer. Season availability means present at some point during that season, not continuously throughout it.';
function historical(id:string,type:EntityType,category:Category,parameters:TemplateParameter[],prompt:QuestionTemplate['prompt'],predicates:QuestionTemplate['predicates'],family:string): QuestionTemplate {
 return {id,answerType:type,category,parameters,prompt,predicates:params => [...(type === 'location' ? [predicate('namedPoi','eq',true)] : []),...predicates(params)],baseDifficulty:'medium',advanced:true,status:'pending',family,scopeNote:scope,explanation:(answer,params)=>`${answer.name} satisfies “${prompt(params)}” according to its reviewed historical records.`};
}

export const historyTemplates:QuestionTemplate[] = types.flatMap(([type,category,noun]) => [
 historical(`${type}-introduced-chapter`,type,category,chapters,({chapter})=>`Name a ${noun} first introduced in Chapter ${chapter}.`,({chapter})=>[predicate('introduction','introducedInChapter',chapter)],`${type}-introduction`),
 historical(`${type}-introduced-season`,type,category,seasonParameters,({season})=>`Name a ${noun} first introduced in ${seasonLabel(String(season))}.`,({season})=>[predicate('introduction','introducedOnOrAfter',season),predicate('introduction','introducedOnOrBefore',season)],`${type}-introduction`),
 historical(`${type}-introduced-range`,type,category,boundaries,({from,through})=>`Name a ${noun} first introduced from ${seasonLabel(String(from))} through ${seasonLabel(String(through))}, inclusive.`,({from,through})=>[predicate('introduction','introducedOnOrAfter',from),predicate('introduction','introducedOnOrBefore',through)],`${type}-introduction`),
 // Outfits have release history, not an in-match availability timeline.
 ...(!['skin','event','boss'].includes(type) ? [
 historical(`${type}-available-season`,type,category,seasonParameters,({season})=>`Name a ${noun} that appeared during ${seasonLabel(String(season))}.`,({season})=>[predicate(type === 'location' ? 'namedPoi' : 'availability','availableIn',season)],`${type}-availability`),
 historical(`${type}-multiple-chapters`,type,category,[],()=>`Name a ${noun} that appeared in more than one chapter.`,()=>[predicate(type === 'location' ? 'namedPoi' : 'appearances','chapterCountAtLeast',2)],`${type}-returns`),
 ] : []),
]);

const location = (id:string,parameters:TemplateParameter[],prompt:QuestionTemplate['prompt'],predicates:QuestionTemplate['predicates'],family='location-changes') => historical(id,'location','Locations',parameters,prompt,predicates,family);
historyTemplates.push(
 location('location-chapter',chapters,({chapter})=>`Name a Chapter ${chapter} named location.`,({chapter})=>[predicate('namedPoi','appearedInChapter',chapter)],'location-availability'),
 location('location-return-og',[],()=> 'Name a named POI that returned during Fortnite OG (2023).',()=>[predicate('namedPoi','availableIn','OG2023'),predicate('introduction','introducedOnOrBefore','C1SX')],'location-returns'),
 location('location-two-chapters',[{key:'first',values:[1,2,3,4]},{key:'second',values:[2,3,4,5,6,7]}],({first,second})=>`Name a named POI that appeared in both Chapter ${first} and Chapter ${second}.`,({first,second})=>[predicate('namedPoi','appearedInChapter',first),predicate('namedPoi','appearedInChapter',second)],'location-returns'),
 ...(['removed','replaced','renamed','destroyed','transformed'] as const).map(kind => location(`location-${kind}`,[],()=>`Name a named POI documented as ${kind}${kind === 'destroyed' || kind === 'transformed' ? ' during a playable Fortnite live event' : ''}.`,()=>[predicate(kind === 'destroyed' || kind === 'transformed' ? 'eventChange' : 'change','historyChange',kind)])),
 location('location-change-season',seasonParameters,({season})=>`Name a named POI removed during ${seasonLabel(String(season))}.`,({season})=>[predicate('removed','changeInSeason',season)]),
 location('location-boss',[],()=> 'Name a named POI where a Fortnite boss appeared.',()=>[predicate('relationships','hasRelationship','boss')],'location-boss'),
 location('location-mythic',[],()=> 'Name a named POI where a mythic weapon could be obtained.',()=>[predicate('relationships','hasRelationship','mythic')],'location-mythic'),
 location('location-biome',[{key:'biome',values:['desert','snow','jungle','grassland']}],({biome})=>`Name a named POI documented in a ${biome} biome.`,({biome})=>[predicate('biome','historyFlag',biome)],'location-biome'),
 location('location-midseason',[],()=> 'Name a named POI first added in a midseason map update.',()=>[predicate('introductionTiming','historyFlag','midseason')],'location-introduction'),
 location('location-short-lived',[],()=> 'Name a named POI with a documented original run of at most two seasons.',()=>[predicate('shortOriginalRun','historyFlag',true)],'location-duration'),
 location('location-introduced-removed-chapter',chapters,({chapter})=>`Name a named POI introduced and removed within Chapter ${chapter}.`,({chapter})=>[predicate('introduction','introducedInChapter',chapter),predicate(`removedInChapter${chapter}`,'historyFlag',true)]),
 location('location-early-return',[],()=> 'Name a Chapter 1 named POI that later returned in another chapter.',()=>[predicate('introduction','introducedInChapter',1),predicate('namedPoi','chapterCountAtLeast',2)],'location-returns'),
 ...(['weapon','item','vehicle'] as const).flatMap(type => {
  const category = types.find(row=>row[0]===type)![1];
  return [
   historical(`${type}-vaulted`,type,category,[],()=>`Name a Fortnite ${type} documented as vaulted.`,()=>[predicate('change','historyChange','vaulted')],`${type}-changes`),
   historical(`${type}-unvaulted`,type,category,[],()=>`Name a Fortnite ${type} that returned after being vaulted.`,()=>[predicate('change','historyChange','unvaulted')],`${type}-returns`),
  ];
 }),
 historical('weapon-class-introduction','weapon','Weapons',[...chapters,{key:'weaponClass',values:['shotgun','assault rifle','smg','sniper rifle','pistol','explosive','marksman rifle']}],({chapter,weaponClass})=>`Name a ${weaponClass} first introduced in Chapter ${chapter}.`,({chapter,weaponClass})=>[predicate('introduction','introducedInChapter',chapter),predicate('weaponClass','eq',weaponClass)],'weapon-introduction'),
 historical('weapon-class-appearance','weapon','Weapons',[...chapters,{key:'weaponClass',values:['shotgun','assault rifle','smg','sniper rifle','pistol','explosive','marksman rifle']}],({chapter,weaponClass})=>`Name a ${weaponClass} that appeared in Chapter ${chapter}.`,({chapter,weaponClass})=>[predicate('appearance','appearedInChapter',chapter),predicate('weaponClass','eq',weaponClass)],'weapon-availability'),
 historical('weapon-special-status','weapon','Weapons',[{key:'status',values:['mythic','exotic']}],({status})=>`Name a distinct named ${status} weapon in Fortnite.`,({status})=>[predicate('weaponStatus','historyFlag',status)],'weapon-status'),
 historical('weapon-boss','weapon','Weapons',[],()=> 'Name a weapon dropped by a Fortnite boss.',()=>[predicate('relationship','hasRelationship','boss')],'weapon-boss'),
 historical('weapon-mythic-poi','weapon','Weapons',[],()=> 'Name a mythic weapon associated with a named POI.',()=>[predicate('weaponStatus','historyFlag','mythic'),predicate('relationship','hasRelationship','location')],'weapon-boss'),
 historical('skin-battle-pass-chapter','skin','Skins',chapters,({chapter})=>`Name a Battle Pass outfit first released in Chapter ${chapter}.`,({chapter})=>[predicate('introduction','introducedInChapter',chapter),predicate('acquisitionMethod','eq','battle_pass')],'skin-introduction'),
 historical('skin-secret','skin','Skins',[],()=> 'Name a secret Battle Pass outfit.',()=>[predicate('secretOutfit','historyFlag',true)],'skin-acquisition'),
 historical('skin-franchise','skin','Skins',[{key:'franchise',values:['Marvel','DC','Star Wars','Anime','Gaming Legends','Icon Series']}],({franchise})=>`Name a Fortnite ${franchise} outfit.`,({franchise})=>[predicate('franchiseGroup','eq',franchise)],'skin-crossover'),
 historical('skin-star-wars-pass','skin','Skins',[],()=> 'Name a Star Wars Battle Pass outfit.',()=>[predicate('franchiseGroup','eq','Star Wars'),predicate('acquisitionMethod','eq','battle_pass')],'skin-crossover'),
 historical('skin-later-collaboration','skin','Skins',[],()=> 'Name a collaboration outfit introduced in Chapter 4 or later.',()=>[predicate('collaboration','historyFlag',true),predicate('introduction','introducedOnOrAfter','C4S1')],'skin-crossover'),
 historical('item-mobility','item','Items',[],()=> 'Name a Fortnite item that provides mobility.',()=>[predicate('itemClasses','includes','mobility')],'item-function'),
 historical('vehicle-flight','vehicle','Vehicles',[],()=> 'Name a Fortnite vehicle capable of flight.',()=>[predicate('flight','historyFlag',true)],'vehicle-function'),
 historical('event-map-change','event','Events',[],()=> 'Name a playable Fortnite live event that directly changed the Battle Royale map.',()=>[predicate('mapChange','historyFlag',true)],'event-map'),
 historical('boss-mythic','boss','Bosses',[],()=> 'Name a Fortnite boss that dropped a mythic weapon.',()=>[predicate('relationship','hasRelationship','mythic')],'boss-loot'),
 historical('boss-poi','boss','Bosses',[],()=> 'Name a Fortnite boss who appeared at a named POI.',()=>[predicate('relationship','hasRelationship','location')],'boss-location'),
);
