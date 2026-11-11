import type {QuestionTemplate,EntityType,Category} from '../domain/types';
import research from './research/phase5c.json';
const make=(id:string,prompt:string,category:Category,types:EntityType[],field:string,family:string):QuestionTemplate=>({id:`nostalgia-${id}`,category,answerType:types[0],answerTypes:types,baseDifficulty:'easy',family,diversityGroup:family,parameters:[],prompt:()=>prompt,predicates:()=>[{field,operator:'eq',value:true}],coverage:{sourceIds:research.sources.map(s=>s.id),reviewedOn:research.reviewedOn,note:'Reviewed historical BR scope, not current availability. Missing dates mean unknown.'},explanation:a=>`${a.name} is documented in this historical gameplay scope. Individual seasons and interaction conditions remain separate.`});
const era=(base:QuestionTemplate,field:string,noun:string):QuestionTemplate=>({...base,parameters:[{key:'era',values:['classic','middle','recent']}],prompt:p=>`Name ${noun} ${noun.endsWith('introduced')?'during':'from'} Chapters ${p.era==='classic'?'1–2':p.era==='middle'?'3–4':'5–7'}.`,predicates:p=>[{field:`${field}:${p.era}`,operator:'eq',value:true}]});
export const phase5cTemplates:QuestionTemplate[]=[
 make('retail','Name a Fortnite restaurant, store or gas-station business.','Locations',['feature'],'isRetailBusiness','retail-businesses'),
 make('retail-location','Name a location that contained a Fortnite restaurant, store or gas-station business.','Locations',['location'],'hadRetailBusiness','retail-geography'),
 make('ltm','Name a historical Fortnite Battle Royale limited-time mode.','Events',['feature'],'wasBRLTM','limited-time-modes'),
 {...make('large-team-ltm','Name a Fortnite LTM with teams larger than a regular squad.','Events',['feature'],'ltmLargeTeams','large-team-modes'),status:'pending',scopeNote:'Index Large-Team subgroup is incomplete for this rule: special modes such as Food Fight, Endgame and Day of Doom also qualify. Await full profile-rule review.'},
 make('wildlife','Name a type of interactive wildlife from Fortnite Battle Royale.','NPCs',['vehicle','feature','container'],'isGameplayWildlife','wildlife'),
 make('tame-wildlife','Name a creature you could tame in Fortnite Battle Royale.','NPCs',['vehicle','feature'],'canBeTamed','wildlife-taming'),
 make('events','Name a Fortnite Battle Royale live event or story moment.','Events',['event'],'isBRLiveOrStoryMoment','live-history'),
 make('event-location','Name a location involved in a Fortnite live event or story moment.','Locations',['location'],'hadLiveOrStoryMoment','event-geography'),
 era(make('event-era','','Events',['event'],'','live-history'),'eventChapters','a Fortnite Battle Royale live event or story moment'),
 era(make('npc-era','','NPCs',['npc'],'','npc-history'),'collectionChapters','a Character Collection NPC'),
 era(make('boss-era','','Bosses',['boss'],'','boss-history'),'bossChapters','an AI boss'),
 era(make('container-era','','Containers',['container'],'','container-history'),'containerIntroductionChapters','a loot container introduced'),
 era(make('equipment-era','','Items',['item','weapon','vehicle'],'','chapter-gameplay'),'gameplayChapters','an item, weapon or vehicle'),
];
