import type { QuestionTemplate } from '../domain/types';
import extra from './research/phase5a.json';
import research from './research/location-history.json';

export function activateLocationHistory(templates:QuestionTemplate[]):void {
 const coverage={sourceIds:[...research.sources.map(s=>s.id),...extra.sources.filter(s=>s.id==='phase5-named-locations').map(s=>s.id)],reviewedOn:research.reviewedOn,note:'Complete named-POI populations in the reviewed chapter/island tables, with explicit corrections. Includes named status at any point in each season, including midseason changes. Chapter 2 Remix retains its separate throwback period; Galactic Battle, Springfield and Crossbones Isle retain their own seasons/islands. This approval does not extend to introductions or global return/replacement populations.'};
 const chapter=templates.find(t=>t.id==='location-chapter')!;
 chapter.status='enabled';chapter.advanced=false;chapter.coverage={...coverage,parameters:[1,2,3,4,5,6,7].map(chapter=>({chapter}))};chapter.scopeNote=coverage.note;chapter.predicates=({chapter})=>[{field:'namedPoi',operator:'eq',value:true},{field:'numberedChapterAppearances',operator:'includes',value:chapter}];
 chapter.explanation=(a,p)=>`${a.name} was a named location during Chapter ${p.chapter}. Special-season islands are recorded separately; OG and Remix throwbacks use their own prompts; season membership means present at some point, not throughout the season.`;
 const season=templates.find(t=>t.id==='location-available-season')!;
 season.status='enabled';season.coverage={...coverage,parameters:research.groups.flatMap(g=>g.seasons).map(season=>({season}))};season.scopeNote=coverage.note;
}
