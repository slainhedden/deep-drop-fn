import type { Predicate, QuestionTemplate } from '../domain/types';
import { patchSource } from './classic-patch-sources';
import { seasonLabel } from './seasons';
const p=(field:string,operator:Predicate['operator'],value:Predicate['value']):Predicate=>({field,operator,value});
const reviewedOn='2026-11-09';

/** Explicit scope approvals, never automatic activation based on candidate counts. */
export function activateReviewedHistory(templates:QuestionTemplate[]):void {
 function activate(id:string,patches:string[],note:string,parameters?:Record<string,string|number>[]) {
  const template=templates.find(template=>template.id===id)!;
  template.status='enabled';template.coverage={sourceIds:patches,reviewedOn,note,...(parameters ? {parameters} : {})};template.scopeNote=note;
  return template;
 }
 const range=activate('location-introduced-range',[patchSource('v7-00'),'epic-block-2018',patchSource('v8-00')],
  'Complete first introductions of named POIs in original Chapter 1 Seasons 7 and 8: Frosty Flights, Polar Peak, Happy Hamlet, The Block, Lazy Lagoon, Sunny Steps. Landmark additions and relocations of an existing canonical POI are excluded.',[{from:'C1S7',through:'C1S8'}]);
 range.explanation=answer=>`${answer.name} was first introduced in ${seasonLabel(answer.history!.introduction!.season)}.${answer.name==='The Block' ? ' Its later relocation is not another first introduction.' : ''}`;
 // Add only this independently approved range to the existing boundary options.
 range.parameters=range.parameters.map(parameter=>({...parameter,values:[...parameter.values]}));
 range.parameters.find(parameter=>parameter.key==='through')!.values.push('C1S8');
 const og=activate('location-return-og',['epic-og-2023','archive-frosty-og-corroboration'],
  'Complete named-POI mentions in the official OG announcement: Tilted Towers, Greasy Grove, Risky Reels, Loot Lake and Frosty Flights. This is not the complete OG map.');
 og.prompt=()=> 'Name a returning Chapter 1 named POI mentioned in Epic’s Fortnite OG (2023) announcement.';
 og.predicates=()=>[p('namedPoi','eq',true),p('ogAnnouncementPoi','historyFlag',true),p('namedPoi','availableIn','OG2023'),p('namedPoi','appearedInChapter',1)];
 og.explanation=answer=>`${answer.name} appeared in the original Chapter 1 and returned in Fortnite OG (2023); it is one of the named POIs in Epic’s OG overview.`;
 const launchSources=['v4-0','v6-00','v7-00','v8-00','v9-00','v10-00-patch-notes'].map(patchSource);
 for (const [id,noun] of [['weapon-vaulted','weapon'],['item-vaulted','non-weapon item'],['vehicle-vaulted','vehicle']]) {
  const template=activate(id,launchSources,'Complete type-filtered vault lists explicitly published in archived original Chapter 1 Season 4, 6, 7, 8, 9 and X launch notes. No later patch, temporary disable, Playground or LTM exception is included.');
  template.diversityGroup='vaulting-history';
  template.prompt=()=>`Name a ${noun} listed as vaulted in Epic’s original Chapter 1 Season 4–X launch patch notes.`;
  template.predicates=()=>[p('change','historyChange','vaulted'),p('classicLaunchVaulting','historyFlag',true)];
  template.explanation=answer=>{
   const change=answer.history!.changes.find(change=>change.status==='verified' && change.kind==='vaulted' && change.sourceIds.some(source=>launchSources.includes(source)))!;
   return `${answer.name} was explicitly listed as vaulted at the ${seasonLabel(change.season)} launch. This does not establish that it stayed vaulted for the whole season.`;
  };
 }
 const unvault=activate('weapon-unvaulted',[patchSource('v10-00-content-update'),patchSource('v10-30-patch-notes')],
  'Complete weapon unvault lists in two specified original Season X updates: Double Barrel Shotgun, Six Shooter, Hunting Rifle and Infantry Rifle (Tilted Town only), plus Tactical Submachine Gun (v10.30). Infinity Blade was LTM-only in v10.10 and is excluded.');
 unvault.diversityGroup='vaulting-history';
 unvault.prompt=()=> 'Name a weapon unvaulted in the Tilted Town content update or the v10.30 update in Season X.';
 unvault.predicates=()=>[p('change','historyChange','unvaulted'),p('classicRiftUnvaulting','historyFlag',true)];
 unvault.explanation=answer=>answer.name==='Tactical Submachine Gun' ? 'Tactical Submachine Gun was unvaulted in v10.30.' : `${answer.name} was unvaulted in the Tilted Town content update, with spawns restricted to Tilted Town.`;
 const vehicles=activate('vehicle-introduced-chapter',[patchSource('v4-3'),patchSource('v5-0'),patchSource('v6-10'),patchSource('v7-00'),patchSource('v7-40-content-update'),patchSource('v8-00'),patchSource('v8-10'),patchSource('v10-00-patch-notes')],
  'Complete original Chapter 1 player-operated Battle Royale vehicle introductions: Shopping Cart, All Terrain Kart, Quadcrasher, X-4 Stormwing, Driftboard, Pirate Cannon, The Baller, B.R.U.T.E. Stationary traps, wildlife and Creative-only vehicles are excluded.',[{chapter:1}]);
 vehicles.explanation=answer=>`${answer.name} first appeared in ${seasonLabel(answer.history!.introduction!.season)}, in the original Chapter 1.`;
 const primal=activate('weapon-available-season',['epic-primal-crafting',patchSource('v6-02')],
  'Complete explicitly named weapon list in the March 16/April 5 Primal crafting guide. The two challenge answers deliberately unnamed in that article are excluded. C1S6 uses the complete six canonical weapons in the v6.02 loot drop-rate table. Neither scope claims the entire season loot pool.',[{season:'C2S6'},{season:'C1S6'}]);
 primal.prompt=({season})=>season==='C1S6' ? 'Name a weapon with a loot drop-rate adjustment in Epic’s v6.02 patch notes.' : 'Name a weapon explicitly named in Epic’s Chapter 2 Season 6 Primal crafting guide.';
 primal.predicates=({season})=>[p(season==='C1S6' ? 'v602LootTuning' : 'primalGuideWeapon','eq',true),p('availability','availableIn',season)];
 primal.explanation=(answer,{season})=>season==='C1S6' ? `${answer.name} has an explicit loot drop-rate adjustment in the v6.02 Battle Royale notes. Rarity variants remain one canonical weapon.` :`${answer.name} is explicitly named in Epic’s Primal crafting guide. The guide discusses Makeshift, Primal and Mechanical crafting paths alongside classic weapons.`;

}
