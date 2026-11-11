import type {SourceRecord} from '../domain/types';
import research from './research/phase5c.json';
export const phase5cSources:SourceRecord[]=research.sources.map(s=>({id:s.id,label:`Phase 5C: ${s.id.slice(4).replaceAll('-',' ')}`,url:s.revision?`${s.url}?oldid=${s.revision}`:s.url,verifiedOn:research.reviewedOn,status:'verified',notes:`${s.revision?'Fortnite Wiki contributors, CC BY-NC-SA 3.0.':'Epic Games announcement.'} Reviewed response SHA256 ${s.sha256}. Editorial era is separate from historical availability.`}));
