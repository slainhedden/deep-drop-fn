import {independentDailyPool,isCosmeticQuestion,semanticOverlap} from './daily-pool';
import { naturalWording } from '../data/update-registry';
import { normalizeAnswer } from './normalize';
import { questionQuality } from './quality';
import { uniqueEntities } from './candidates';
import { supportsScope } from './coverage';
import type { Difficulty, GeneratedQuestion, QuestionTemplate } from '../domain/types';
import { entitiesByType } from '../data/entities';
import { DATA_VERSION } from '../data/sources';
import { templates } from '../data/templates';
import { assessPredicate, matchesAll } from './predicates';
import { reviewedParametersSupported } from '../data/reviewed-templates';
import { compareSeasons } from '../data/seasons';
import { seededRandom, shuffle } from './random';

export function combinations(template: QuestionTemplate): Record<string, string | number>[] {
  return template.parameters.reduce<Record<string, string | number>[]>((sets, parameter) =>
    sets.flatMap((set) => parameter.values.map((value) => ({ ...set, [parameter.key]: value }))), [{}]).filter(params => (!('from' in params && 'through' in params) || compareSeasons(String(params.from),String(params.through)) <= 0) && (!('first' in params && 'second' in params) || Number(params.first) < Number(params.second))).filter(params=>reviewedParametersSupported(template,params));
}

export function calculateDifficulty(template: QuestionTemplate, answerCount: number): Difficulty {
  if (template.advanced && answerCount <= 7) return 'hard';
  if (answerCount <= 5) return 'hard';
  if (answerCount <= 8 || template.advanced) return 'medium';
  return template.baseDifficulty;
}

const canonicalNames=new WeakMap<object,string>();
const canonicalName=(e:{name:string})=>{let name=canonicalNames.get(e);if(name===undefined){name=normalizeAnswer(e.name);canonicalNames.set(e,name);}return name;};

export function buildQuestion(template: QuestionTemplate, parameters: Record<string, string | number>, options:{expert?:boolean}={}): GeneratedQuestion | null {
  if (!reviewedParametersSupported(template,parameters)) return null;
  if (template.status === 'pending' || !supportsScope(template,parameters)) return null;
  if ('from' in parameters && 'through' in parameters && compareSeasons(String(parameters.from), String(parameters.through)) > 0) return null;
  const predicates = template.predicates(parameters);
  let answers = uniqueEntities((template.answerTypes??[template.answerType]).flatMap(entitiesByType).filter((entity) => matchesAll(entity, predicates)));
  // Cross-category cosmetic names are one typed answer to a broad prompt, not extra chances.
  const displayed=new Set<string>();answers=answers.filter(e=>{if(!canonicalName(e))return false;const key=e.facts.isCosmetic===true?canonicalName(e):e.id;if(displayed.has(key))return false;displayed.add(key);return true;});
  const minimum = Math.max(options.expert?5:10, template.minAnswers ?? 0);
  const verified=answers.filter(e=>predicates.every(p=>assessPredicate(e,p).verification==='verified')).length;
  if(verified<minimum)return null;
  if (answers.length < minimum) return null;
  const parameterKey = Object.entries(parameters).map(([key,value])=>`${key}=${value}`).join('&') || 'all';
  const question:GeneratedQuestion={
    id:`${template.id}:${parameterKey}:${DATA_VERSION}`,
    templateId:template.id,
    category:template.category,
    answerType:template.answerType,
    answerTypes:template.answerTypes,
    prompt:naturalWording(template.prompt(parameters)),
    parameters,
    predicates,
    validAnswerIds:answers.map((answer)=>answer.id),
    difficulty:calculateDifficulty(template, answers.length),
    advanced:Boolean(template.advanced),
    dataVersion:DATA_VERSION,
  };
  question.difficulty=questionQuality(question).difficulty;
  return question;
}

const cachedPools=new Map<boolean,GeneratedQuestion[]>();
export function questionPool(options:{expert?:boolean}={}): GeneratedQuestion[] {
  const cachedPool=cachedPools.get(Boolean(options.expert));if(cachedPool)return [...cachedPool];
  const candidates=templates.flatMap((template) => combinations(template).map((params) => buildQuestion(template, params,options)).filter((q): q is GeneratedQuestion => q !== null));
  const templateById=new Map(templates.map(template=>[template.id,template]));
  const seen=new Set<string>();
  const pool=candidates.filter(question=>{
    const family=templateById.get(question.templateId)?.family ?? question.templateId;
    const key=`${question.answerType}:${family}:${[...question.validAnswerIds].sort().join('|')}`;
    if (seen.has(key)) return false;
    seen.add(key);return true;
  });
  cachedPools.set(Boolean(options.expert),pool);return [...pool];
}

/** Balance knowledge axes as well as answer categories for the daily seven rounds. */
export function questionKnowledgeGroup(question:GeneratedQuestion):string {
 const template=templates.find(template=>template.id===question.templateId);
 if (template?.diversityGroup) return template.diversityGroup;
 if(question.predicates.some(p=>/^restores(Health|Shield)$/.test(p.field)))return 'restoration';
 const family=template?.family ?? question.templateId;
 if (question.category==='Locations') return /boss|mythic/.test(family) ? 'loot-sources' : /introduction|changes|returns|history|duration/.test(family) ? 'map-history' : 'map-geography';
 if (question.category==='Weapons') return /boss|status/.test(family) ? 'special-gear' : /introduction|availability|returns|changes|carryovers/.test(family) ? 'weapon-history' : 'weapon-classes';
 if (question.category==='Bosses') return 'loot-sources';
 if (question.category==='Skins') return 'cosmetic-outfit';
 if (question.category==='Crossovers') return 'crossover-identities';
 if (question.category==='Items') return /function|health|shield|utility/.test(family) ? 'item-functions' : 'item-history';
 if (question.category==='Vehicles') return 'vehicle-history';
 return question.category==='Events' ? 'live-events' : question.category;
}

function generateUnscheduled(seed: string, roundCount = 10, categories?: string[]): GeneratedQuestion[] {
  if (!Number.isInteger(roundCount) || roundCount < 0) throw new Error('Round count must be a nonnegative integer.');
  const random = seededRandom(seed);
  const diverseDaily=seed.startsWith('storm-rare-daily-') && roundCount===7 && !categories?.length;
  const remaining = shuffle(questionPool().filter(question => (!categories?.length || categories.includes(question.category)) && (!diverseDaily || questionQuality(question).dailyEligible)), random);
  const result: GeneratedQuestion[] = [];
  const categoryCounts = new Map<string,number>();
  const familyCounts = new Map<string,number>();
  const knowledgeGroups=new Set<string>();
  const templateById = new Map(templates.map(template=>[template.id,template]));
  const family = (question:GeneratedQuestion) => templateById.get(question.templateId)?.family ?? question.templateId;
  const overlap = (left:GeneratedQuestion,right:GeneratedQuestion) => {
    if (left.answerType !== right.answerType) return 0;
    const ids = new Set(left.validAnswerIds);
    const common = right.validAnswerIds.filter(id=>ids.has(id)).length;
    return common / (ids.size + right.validAnswerIds.length - common);
  };
  // Prefer fresh categories and families. Never repeat a question or a near-identical
  // answer set; a narrow category can therefore produce fewer than requested rounds.
  while (result.length < roundCount && remaining.length) {
    const admissible=(question:GeneratedQuestion)=>!(diverseDaily&&question.validAnswerIds.length<12&&result.some(q=>q.validAnswerIds.length<12))&&!result.some(previous=>previous.prompt===question.prompt || overlap(previous,question)>=.85);
    const freshKnowledge=diverseDaily && remaining.some(question=>!knowledgeGroups.has(questionKnowledgeGroup(question)) && admissible(question));
    let best = -1;
    let bestCost = Infinity;
    for (let index=0; index<remaining.length; index++) {
      const question = remaining[index];
      if (!admissible(question)) continue;
      if (freshKnowledge && knowledgeGroups.has(questionKnowledgeGroup(question))) continue;
      const quality=questionQuality(question);
      const preferredCount=result.filter(q=>q.validAnswerIds.length>=20).length;
      // Five of seven rounds target 20+ answers; reserve the rest for accessible smaller banks.
      const desiredLarge=preferredCount<5;
      const qualityCost=diverseDaily ? ((quality.preferredDaily===desiredLarge?0:1000)+quality.historicalSpecificity*20) : 0;
      const cost = qualityCost+(categoryCounts.get(question.category) ?? 0)*100 + (familyCounts.get(family(question)) ?? 0)*10;
      if (cost < bestCost) { best = index; bestCost = cost; }
    }
    if (best < 0) break;
    const [question] = remaining.splice(best,1);
    result.push(question);
    knowledgeGroups.add(questionKnowledgeGroup(question));
    categoryCounts.set(question.category,(categoryCounts.get(question.category) ?? 0)+1);
    familyCounts.set(family(question),(familyCounts.get(family(question)) ?? 0)+1);
  }
  return result;
}

export function dailySeed(date = new Date()): string { return `storm-rare-daily-${date.toISOString().slice(0,10)}`; }

const templateMap=new Map(templates.map(t=>[t.id,t]));
export const semanticFamily=(q:GeneratedQuestion)=>templateMap.get(q.templateId)?.family??q.templateId;
let cachedDaily:GeneratedQuestion[]|undefined;
export function dailyQuestionPool():GeneratedQuestion[]{return [...(cachedDaily??(cachedDaily=independentDailyPool(questionPool()).questions))];}
const epoch=Math.floor(Date.UTC(2025,0,1)/86400000);
const schedule=new Map<number,GeneratedQuestion[]>();
let generatedThrough=epoch-1;
/** A fixed UTC history, calculated independently of local player state or request order. */
function historicalDaily(date:string):GeneratedQuestion[]{
 const target=Math.floor(Date.parse(date+'T00:00:00Z')/86400000);
 if(!Number.isFinite(target)||target<epoch)return generateUnscheduled('storm-rare-daily-'+date,7);
 const eligible=dailyQuestionPool();
 for(let day=generatedThrough+1;day<=target;day++){
  const label=new Date(day*86400000).toISOString().slice(0,10);
  const shuffled=shuffle(eligible,seededRandom('storm-rare-daily-'+label));
  const recentIds=new Map<string,number>(),recentFamilies=new Map<string,number>();
  for(let d=Math.max(epoch,day-14);d<day;d++)for(const q of schedule.get(d)??[]){recentIds.set(q.id,d);recentFamilies.set(semanticFamily(q),d);}
  const selected:GeneratedQuestion[]=[];
  while(selected.length<7){
   let best:GeneratedQuestion|undefined,bestCost=Infinity;
   for(const q of shuffled){
    if(selected.some(p=>p.id===q.id||p.prompt===q.prompt))continue;
    if(questionQuality(q).fieldVerifiedAnswers<20&&selected.filter(p=>questionQuality(p).fieldVerifiedAnswers<20).length>=2)continue;
    if(selected.some(p=>semanticOverlap(p,q)>=.8))continue;
    const group=questionKnowledgeGroup(q),family=semanticFamily(q);
    if(isCosmeticQuestion(q)&&selected.filter(isCosmeticQuestion).length>=2)continue;
    if(q.category==='Locations'&&selected.filter(p=>p.category==='Locations').length>=2)continue;
    if(['NPCs','Bosses'].includes(q.category)&&selected.some(p=>p.category===q.category))continue;
    const neededLocations=selected.some(p=>p.category==='Locations')?0:1,neededItems=selected.some(p=>p.category==='Items')?0:1;
    if(7-selected.length<=neededLocations+neededItems&&!((neededLocations&&q.category==='Locations')||(neededItems&&q.category==='Items')))continue;
    if(q.category==='Weapons'&&selected.filter(p=>p.category==='Weapons').length>=2)continue;
    if(q.category==='Items'&&selected.filter(p=>p.category==='Items').length>=2)continue;
    if(selected.some(p=>questionKnowledgeGroup(p)===group))continue;
    const subjects=(x:GeneratedQuestion)=>/star wars|original trilogy|prequel trilogy/i.test(x.prompt)?'star-wars':/\bMarvel\b/i.test(x.prompt)?'marvel':/\bDC\b/i.test(x.prompt)?'dc':undefined;
    if(subjects(q)&&selected.some(p=>subjects(p)===subjects(q)))continue;
    if(selected.some(p=>semanticFamily(p)===family))continue;
    const age=day-(recentIds.get(q.id)??day-15),familyAge=day-(recentFamilies.get(family)??day-8);
    const groupCount=selected.filter(p=>questionKnowledgeGroup(p)===group).length;
    const cosmeticCount=selected.filter(p=>p.category==='Cosmetics'||p.category==='Skins').length;
    // Exact cooldown wins whenever the content supports it. Scarce pools relax to oldest-first.
    const cost=(age<14?(14-age)*10000:0)+(familyAge<4?(4-familyAge)*100:0)+groupCount*2000+
     ((q.category==='Cosmetics'||q.category==='Skins')&&cosmeticCount>=3?4000:0)+
     (selected.filter(p=>questionQuality(p).fieldVerifiedAnswers>=20).length<5&&questionQuality(q).fieldVerifiedAnswers<20?3000:0);
    if(cost<bestCost){best=q;bestCost=cost;}
   }
   if(!best)break;selected.push(best);
  }
  schedule.set(day,selected);
 }
 generatedThrough=Math.max(generatedThrough,target);
 return [...(schedule.get(target)??[])];
}
export function generateGame(seed:string,roundCount=10,categories?:string[]):GeneratedQuestion[]{
 const date=/^storm-rare-daily-(\d{4}-\d{2}-\d{2})$/.exec(seed)?.[1];
 return date&&roundCount===7&&!categories?.length?historicalDaily(date):generateUnscheduled(seed,roundCount,categories);
}
export function generatePractice(seed:string,roundCount=7,categories?:string[],recentIds:readonly string[]=[]):GeneratedQuestion[]{
 const pool=questionPool().filter(q=>!categories?.length||categories.includes(q.category));
 const recent=new Set(recentIds),unseen=pool.filter(q=>!recent.has(q.id));
 const recentFamilies=new Set(recentIds.slice(-7).map(id=>pool.find(q=>q.id===id)).filter((q):q is GeneratedQuestion=>!!q).map(semanticFamily));
 const fresh=shuffle(unseen,seededRandom(seed)).sort((a,b)=>Number(recentFamilies.has(semanticFamily(a)))-Number(recentFamilies.has(semanticFamily(b))));
 const seen=shuffle(pool.filter(q=>recent.has(q.id)),seededRandom(seed+'-reset')).sort((a,b)=>recentIds.indexOf(a.id)-recentIds.indexOf(b.id));
 const result:GeneratedQuestion[]=[];
 while(result.length<roundCount&&(fresh.length||seen.length)){
  const available=fresh.length?fresh:seen;
  const index=available.findIndex(q=>!result.some(p=>semanticFamily(p)===semanticFamily(q)));
  result.push(available.splice(index>=0?index:0,1)[0]);
 }
 return result;
}

/** Comparison baseline for offline rotation audits, never used by the application. */
export const independentDailyForAudit=(date:Date)=>generateUnscheduled(dailySeed(date),7);
