import {phase5Templates} from './phase5-templates';
import { phase4bTemplates } from './phase4b-templates';
import { activateLocationHistory } from './activate-location-history';
import { phase4Templates } from './phase4-templates';
import { gameplayTemplates } from './gameplay-templates';
import { activateReviewedHistory } from './activate-history';
import { reviewedTemplates } from './reviewed-templates';
import { historyTemplates } from './history-templates';
import type { QuestionTemplate } from '../domain/types';

export const templates:QuestionTemplate[]=[
 {id:'skin-battle-pass',category:'Skins',answerType:'skin',baseDifficulty:'easy',parameters:[],prompt:()=> 'Name a Fortnite Battle Pass skin.',predicates:()=>[{field:'acquisitionMethod',operator:'eq',value:'battle_pass'}],explanation:(a)=>`${a.name} was a Battle Pass outfit.`},
 {id:'weapon-class',category:'Weapons',answerType:'weapon',baseDifficulty:'easy',parameters:[{key:'weaponClass',values:['shotgun','assault rifle','smg','sniper rifle','pistol','explosive','marksman rifle']}],prompt:({weaponClass})=>`Name a Fortnite ${weaponClass}.`,predicates:({weaponClass})=>[{field:'weaponClass',operator:'eq',value:weaponClass}],explanation:(a,p)=>`${a.name} is a Fortnite ${p.weaponClass}.`},
 {id:'location-catalog',category:'Locations',answerType:'location',baseDifficulty:'easy',parameters:[],family:'location-general',prompt:()=> 'Name a named location in Fortnite.',predicates:()=>[{field:'namedPoi',operator:'eq',value:true}],explanation:(a)=>`${a.name} is a named POI in the answer catalog.`},
 {id:'collaboration-group',category:'Crossovers',answerType:'collaboration',baseDifficulty:'easy',parameters:[{key:'group',values:['Marvel','Star Wars','Anime','Video game']}],prompt:({group})=>group==='Video game'?'Name a video game character with a Fortnite skin.':`Name a ${group} character with a Fortnite skin.`,predicates:({group})=>[{field:'franchiseGroup',operator:'eq',value:group},{field:'hasOutfit',operator:'eq',value:true}],explanation:(a,p)=>`${a.name} appeared in Fortnite through a ${p.group} crossover.`},
 {id:'health-item',category:'Items',answerType:'item',baseDifficulty:'easy',parameters:[],prompt:()=> 'Name an item that can restore health in Fortnite.',predicates:()=>[{field:'restoresHealth',operator:'eq',value:true}],explanation:(a)=>`${a.name} can restore player health.`},
 {id:'shield-item',category:'Items',answerType:'item',baseDifficulty:'easy',parameters:[],prompt:()=> 'Name an item that can restore shield in Fortnite.',predicates:()=>[{field:'restoresShield',operator:'eq',value:true}],explanation:(a)=>`${a.name} can restore player shield.`},
 {id:'utility-item',category:'Items',answerType:'item',baseDifficulty:'easy',parameters:[],prompt:()=> 'Name a Fortnite utility item.',predicates:()=>[{field:'itemClasses',operator:'includes',value:'utility'}],explanation:(a)=>`${a.name} has appeared as a Battle Royale utility item.`},
 {id:'vehicle',category:'Vehicles',answerType:'vehicle',baseDifficulty:'easy',parameters:[],prompt:()=> 'Name a vehicle you can drive or ride in Fortnite.',predicates:()=>[{field:'isVehicle',operator:'eq',value:true}],explanation:(a)=>`${a.name} has appeared as a Fortnite vehicle.`},
 {id:'live-event',category:'Events',answerType:'event',baseDifficulty:'easy',parameters:[],prompt:()=> 'Name a major Fortnite live event.',predicates:()=>[{field:'isLiveEvent',operator:'eq',value:true}],explanation:(a)=>`${a.name} was a major Fortnite live event.`},
 {id:'health-and-shield-item',category:'Items',answerType:'item',baseDifficulty:'medium',family:'item-function',parameters:[],prompt:()=> 'Name an item that can restore both health and shield in Fortnite.',predicates:()=>[{field:'restoresHealth',operator:'eq',value:true},{field:'restoresShield',operator:'eq',value:true}],explanation:(a)=>`${a.name} can restore both health and shield.`},
 ...gameplayTemplates,
 ...phase4bTemplates,
 ...phase5Templates,
 ...phase4Templates,
 ...historyTemplates,
 ...reviewedTemplates,
];

activateReviewedHistory(templates);

activateLocationHistory(templates);
