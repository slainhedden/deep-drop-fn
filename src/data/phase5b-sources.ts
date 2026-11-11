import type {SourceRecord} from '../domain/types';
import research from './research/phase5b.json';
export const phase5bSources:SourceRecord[]=research.sources.map(s=>({id:s.id,label:`Phase 5B: ${s.id.slice(4).replaceAll('-',' ')}`,url:`${s.url}?oldid=${s.revision}`,verifiedOn:research.reviewedOn,status:'verified',notes:`Fortnite Wiki contributors, CC BY-NC-SA 3.0. Response SHA256 ${s.sha256}. Positive factual relationships only; chapter/island indexes do not prove exact seasons or uninterrupted availability.`}));
