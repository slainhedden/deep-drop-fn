import seasonTags from './research/cosmetic-season-registry.json';
import {seasonById,seasonLabel} from './seasons';
import type {FortniteEntity} from '../domain/types';
import {normalizeAnswer} from '../engine/normalize';
import {factVerification} from '../engine/predicates';
import {historyEditor,proof} from './catalog/history-editor';
import catalog from './cosmetics/catalog.json';
import research from './research/phase4b-gameplay.json';
const cosmeticSeasons=new Map(seasonTags.map(r=>[r.tag,r.season]));
const API='fnapi-cosmetics-2026-11-10',GG='fngg-cosmetics-2026-11-10';
const recognizable=new Set(['default pickaxe','peely','fishstick','midas','aura','renegade raider','raven','bunny brawler','polar peely','krisabelle','arctic adeline','sled ready guff','reaper','star wand','ice breaker','driver','ac dc','rainbow smash','candy axe','the reaper','floss','take the l','orange justice','electro shuffle','dance moves','best mates','the griddy','billy bounce','fresh','hype','boogie down','t pose','ride the pony','rage quit','rickroll','never gonna','get griddy','boneless','wiggle','intensity','jubilation','batsickle','vision','crowbar','plunja','party hips','make it rain','slow clap','true heart','hot marat','tender defender','raptor','red knight','black knight']);
export function expandPhase4B(bank:FortniteEntity[]):FortniteEntity[] {
 const edit=historyEditor(bank);
 const byName=new Map(bank.map(e=>[`${e.type}:${normalizeAnswer(e.name)}`,e]));
 const find=(type:FortniteEntity['type'],name:string)=>byName.get(`${type}:${normalizeAnswer(name)}`);
 for(const row of catalog){
  const type=row.type==='outfit'?'skin':'cosmetic',source=row.externalIds.length?API:GG;
  const existed=type==='skin'?find(type,row.name):undefined;
  const identity=type==='cosmetic'?`${type}:${row.id.toLowerCase()}`:undefined;
  const record=(source:string,claims:FortniteEntity['facts'])=>edit.record(type,row.name,source,claims,identity);
  const e=record(source,{isCosmetic:true,cosmeticType:row.type,historicalCosmeticRarity:row.rarity,cosmeticSeries:row.series||'none'});
  if(!existed)e.id=`${type}-${row.id.toLowerCase()}`;
  byName.set(`${type}:${normalizeAnswer(e.name)}`,e);
  e.cosmetic={type:row.type,externalIds:row.externalIds,catalogAddedAt:row.catalogAddedAt||undefined,memberships:row.memberships as NonNullable<FortniteEntity['cosmetic']>['memberships']};
  if(row.externalIds.length)record(API,{cosmeticCatalogId:row.id});
  const season=seasonById.get(cosmeticSeasons.get(`${row.chapter}:${row.season}`)??'');
  if(season){record(API,{cosmeticSeasonId:season.id,cosmeticIntroductionText:seasonLabel(season.id),...(season.kind!=='throwback'?{cosmeticChapter:season.chapter}:{})});
   for(const field of ['cosmeticSeasonId','cosmeticIntroductionText','cosmeticChapter'])if(e.factEvidence?.[field])e.factEvidence[field].sourceIds.push('phase4b-cosmetic-season-registry');
  }
  if(row.shop)record(row.shopSource,{hasShopAppearance:true});
  if(row.battlePass&&e.facts.acquisitionMethod!=='og_pass')record(GG,{isBattlePassCosmetic:true,...(type==='skin'?{acquisitionMethod:'battle_pass'}:{})});
  for(const membership of e.cosmetic.memberships)edit.appendList(e,membership.kind==='set'?'cosmeticSetIds':'cosmeticBundleIds',membership.id,membership.sourceId);
  if(e.cosmetic.memberships.some(m=>m.kind==='bundle'))record('fnapi-shop-2026-11-10',{hasBundleAppearance:true});
  // Recall priors describe likely recognition, not in-game rarity or observed answer frequency.
  // Keep curated priors; otherwise use conservative early-exposure and named editorial anchors.
  if(recognizable.has(normalizeAnswer(e.name)))e.familiarity=Math.max(e.familiarity,.85);
  else if(e.origin==='expansion')e.familiarity=Math.max(e.familiarity,Number(row.chapter)>0&&Number(row.chapter)<=2?.6:.3);
 }
 // Preserve reviewed Epic pass identities even when external metadata is withheld.
 for(const e of bank.filter(e=>e.type==='skin'&&!e.cosmetic)){
  const evidence=e.factEvidence?.acquisitionMethod;
  if(evidence?.status!=='verified'||!['battle_pass','og_pass'].includes(String(e.facts.acquisitionMethod)))continue;
  edit.record('skin',e.name,evidence.sourceIds[0],{isCosmetic:true,cosmeticType:'outfit'});
  e.cosmetic={type:'outfit',externalIds:[],memberships:[]};
  if(e.facts.acquisitionMethod==='battle_pass')edit.record('skin',e.name,evidence.sourceIds[0],{isBattlePassCosmetic:true});
  const intro=e.history?.introduction;const season=intro?.status==='verified'?seasonById.get(intro.season):undefined;
  if(season&&season.kind!=='throwback')edit.record('skin',e.name,intro!.sourceIds[0],{cosmeticChapter:season.chapter,cosmeticSeasonId:season.id,cosmeticIntroductionText:season.label});
 }
 // An exact character/outfit identity match verifies existence without guessing a franchise.
 // Series labels verify only their own umbrella categories; unrelated legacy labels stay unreviewed.
 for(const character of bank.filter(e=>e.type==='collaboration')){
  const outfit=find('skin',character.name);
  if(outfit?.facts.isCosmetic!==true)continue;
  const source=outfit.factEvidence!.isCosmetic.sourceIds[0];
  const seriesGroup:Record<string,string>={'Marvel Series':'Marvel','DC Series':'DC','Star Wars Series':'Star Wars','Gaming Legends Series':'Video game'};
  const group=seriesGroup[String(outfit.facts.cosmeticSeries)];
  edit.record('collaboration',character.name,source,{hasOutfit:true,...(group?{franchiseGroup:group}:{})});
 }
 // Merge aliases and umbrella variants instead of creating more answers for a reskin.
 for(const row of research.containers){
  const e=edit.record('container',row.name,row.sourceId,{isLootContainer:true,isChest:row.isChest,containerKind:row.kind,mode:'core_br'});
  byName.set(`container:${normalizeAnswer(e.name)}`,e);
  e.familiarity=['Chest','Ammo Box','Supply Drop','Supply Llama'].includes(e.name)?.95:['Rare Chest','Large Ammo Box','Cooler','Ice Machine','Safe','Produce Box'].includes(e.name)?.75:e.familiarity<.7?e.familiarity:.35;
  for(const text of row.aliases)if(!e.aliases.some(a=>normalizeAnswer(a.text)===normalizeAnswer(text)))e.aliases.push({text,kind:'official',confidence:'exact'});
  if(row.name==='Buried Treasure Chest')e.aliases.push({text:'Buried Chest',kind:'slang',confidence:'strong'});
 }
 // The old Treasure Chest phrase referred to the standard chest, not a second standard identity.
 const chest=find('container','Chest');if(chest)chest.aliases=chest.aliases.filter(a=>a.text!=='Treasure Chest');
 for(const row of research.movement){
  const facts:FortniteEntity['facts']={};for(const tag of row.tags){facts[`function:${tag}`]=true;if(tag==='health'){facts.restoresHealth=true;facts['function:restorative']=true;}if(tag==='shield'){facts.restoresShield=true;facts['function:restorative']=true;}}
  const e=edit.record(row.type as FortniteEntity['type'],row.name,row.sourceId,facts);byName.set(`${e.type}:${normalizeAnswer(e.name)}`,e);
 }
 for(const e of bank){
  for(const field of ['playerMobility','restoresHealth','restoresShield','isThrowable','isThrowableUtility']){
   if(e.facts[field]!==true||factVerification(e,field)!=='verified')continue;
   const tag=field==='playerMobility'?'rotate':field==='restoresHealth'?'health':field==='restoresShield'?'shield':'throwable';
   e.facts[`function:${tag}`]=true;e.factEvidence??={};e.factEvidence[`function:${tag}`]={...e.factEvidence[field]!};
   if(tag==='health'||tag==='shield'){e.facts['function:restorative']=true;e.factEvidence['function:restorative']={...e.factEvidence[field]!};}
  }
 }
 const tags=(name:string,tags:string[])=>{
  const e=bank.find(e=>['item','weapon'].includes(e.type)&&normalizeAnswer(e.name)===normalizeAnswer(name));
  const evidence=e?.factEvidence?.playerMobility;if(!e||evidence?.status!=='verified')return;
  for(const tag of tags){e.facts[`function:${tag}`]=true;e.factEvidence![`function:${tag}`]={...evidence};}
 };
 for(const n of ['Rift-To-Go','Launch Pad','Bouncer','Rocket Ram','Shockwave Grenade','Impulse Grenade','Shockwave Hammer'])tags(n,['launch','highGround']);
 for(const n of ['Jetpack','Itemized Glider Redeploy','War Machine’s Hover Jets','Balloons','Rift-To-Go'])tags(n,['fly','highGround']);
 for(const n of ['Grappler','Kinetic Blade','Spider-Man’s Web-Shooters'])tags(n,['highGround']);
 for(const [name,source] of [['Shopping Cart','epic-patch-v4-3'],['All Terrain Kart','epic-patch-v5-0'],['Quadcrasher','epic-patch-v6-10'],['Driftboard','epic-patch-v7-40-content-update'],['The Baller','epic-patch-v8-10'],['Pirate Cannon','epic-patch-v8-00'],['B.R.U.T.E.','epic-patch-v10-00-patch-notes']] as const){
  const e=find('vehicle',name);if(e)edit.record('vehicle',name,source,{'function:rotate':true});
 }
 const cosmeticNames=new Map<string,FortniteEntity[]>();
 for(const e of bank)if(e.facts.isCosmetic===true){const key=normalizeAnswer(e.name);cosmeticNames.set(key,[...(cosmeticNames.get(key)??[]),e]);}
 for(const row of research.rewards){
  let matches=(cosmeticNames.get(normalizeAnswer(row.name))??[]).filter(e=>row.name!=='Sentinel'||e.facts.cosmeticType==='glider');
  // One explicitly documented banner is outside the bulk cosmetic-type scope.
  if(!matches.length&&row.name==='Snowflake Banner')matches=[edit.record('cosmetic',row.name,row.sourceId,{isCosmetic:true,cosmeticType:'banner'})];
  if(matches.length!==1)continue;
  if(row.name==='Snowflake Banner')matches[0].cosmetic={type:'banner',externalIds:[],memberships:[]};
  const e=matches[0];edit.appendList(e,'rewardEvents',row.event,row.sourceId);e.facts.isEventReward=true;e.factEvidence??={};e.factEvidence.isEventReward=proof(row.sourceId,'Explicit cosmetic present, not a holiday-theme inference.');
 }
 return bank;
}
