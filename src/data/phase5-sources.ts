import type {SourceRecord} from '../domain/types';
import research from './research/phase5a.json';
export const phase5Sources:SourceRecord[]=research.sources.map(s=>({id:s.id,label:`Phase 5A review — ${s.id.replace('phase5-','')}`,url:s.revision?`${s.url}?oldid=${s.revision}`:s.url,status:'verified',verifiedOn:research.reviewedOn,notes:`Response SHA256 ${s.sha256}. Field-specific identity/classification review; no release or full-season continuity inferred. Wiki: Fortnite Wiki contributors, CC BY-NC-SA 3.0. API: supplemental selectable-style metadata only; no artwork imported.`}));
