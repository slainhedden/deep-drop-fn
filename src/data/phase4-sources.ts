import type { SourceRecord } from '../domain/types';
import weapons from './research/weapon-definitions.json';
import fish from './research/fish-definitions.json';
import food from './research/food-definitions.json';
import maps from './research/chapter7-map-snapshots.json';
export const ARCHIVE_REVISION='5dadbe52f502a36cdf7b86cd7d1eeaa32b799400';
export const definitionSourceId=(path:string)=>`item-definition-${path.split('/').at(-1)!.replace('.json','').toLowerCase()}`;
export const phase4Sources:SourceRecord[]=[
 ...[...fish,...food,...weapons].map(row=>({id:definitionSourceId(row.path),label:`Archived Athena BR definition — ${row.name}`,url:`https://github.com/yaelbrinkert/fortnite-archives/blob/${ARCHIVE_REVISION}/${row.path}`,status:'verified' as const,verifiedOn:'2026-11-10',notes:`Reviewed player-facing description, Athena consumable class and explicit classification tags. File SHA256 ${row.sha256}. Shared/cooked presence and Creative season tags do not prove current BR loot availability or a first-release date. This is an extracted game definition hosted by a third party, not an Epic announcement.`})),
 ...maps.map(row=>({id:row.sourceId,label:`Extracted core BR map ${row.version}`,url:`https://github.com/yaelbrinkert/fortnite-archives/blob/${ARCHIVE_REVISION}/${row.path}`,status:'verified' as const,verifiedOn:'2026-11-10',notes:`Reviewed explicit named/landmark tags in the core pois.json, excluding OG and rotating islands. SHA256 ${row.sha256}. Point snapshot only; season is the archive's version grouping. No introduction, removal or continuous presence inferred. Pre-41.20 legacy scraper files are not trusted for complete banks.`})),
];
