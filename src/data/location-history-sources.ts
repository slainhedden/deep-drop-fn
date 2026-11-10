import type { SourceRecord } from '../domain/types';
import research from './research/location-history.json';
export const locationHistorySources:SourceRecord[]=research.sources.map(s=>({
 id:s.id,label:`Location history review — ${s.id}`,url:s.revision ? `${s.url}?oldid=${s.revision}` : s.url,
 status:'verified',verifiedOn:research.reviewedOn,
 notes:`Retrieved with normal proxy/TLS settings. Response SHA256 ${s.sha256}. ${s.revision ? `MediaWiki revision ${s.revision}.` : 'Official Epic article.'} Retained table rows/excerpts and explicit conflict resolutions in research/location-history.json. A citation verifies only the individually recorded claims.`,
}));
