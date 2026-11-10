import { classicPatchSources } from './classic-patch-sources';
import { reviewedSources } from './reviewed-announcements';
import { seasons } from './seasons';
import type { SourceRecord } from '../domain/types';

export const DATA_VERSION = 'fortnite-br-classification-2026.11.6';

export const sources: SourceRecord[] = [
  { id: 'epic-bp', label: 'Epic Games — Battle Pass archives and announcements', url: 'https://www.fortnite.com/news', verifiedOn: '2026-10-28' },
  { id: 'epic-items', label: 'Epic Games — Fortnite item and season announcements', url: 'https://www.fortnite.com/news', verifiedOn: '2026-10-28' },
  { id: 'fn-wiki', label: 'Fortnite Wiki — cross-checked historical catalog', url: 'https://fortnite.fandom.com/wiki/Fortnite_Wiki', verifiedOn: '2026-10-28' },
  { id: 'epic-map', label: 'Epic Games — chapter and map announcements', url: 'https://www.fortnite.com/news', verifiedOn: '2026-10-28' },
  { id: 'epic-docs-weapons', label: 'Epic Developer Community — weapon categories', url: 'https://dev.epicgames.com/documentation/en-us/fortnite/weapons-categories', verifiedOn: '2026-11-06' },
  { id: 'epic-og-s3', label: 'Epic Games — Fortnite OG Season 3 item announcement', url: 'https://www.fortnite.com/news/fortnite-og-makes-a-lucky-landing-into-season-3', verifiedOn: '2026-11-06' },
  { id: 'fn-wiki-items', label: 'Fortnite Wiki — full Battle Royale item catalog', url: 'https://fortnite.fandom.com/wiki/Full_List_Of_Items', verifiedOn: '2026-11-06' },
  { id: 'fn-wiki-vehicles', label: 'Fortnite Wiki — vehicle catalog', url: 'https://fortnite.fandom.com/wiki/Full_List_of_Items/Vehicles', verifiedOn: '2026-11-06' },
];

// These are retrieval targets, not evidence that their contents were reviewed.
// Wiki research remains pending. Independently reviewed Epic articles are registered separately.
export const historicalSources: SourceRecord[] = [
 ...seasons.map(season => ({ id: `history-${season.id.toLowerCase()}`, label: `${season.label} historical research`, url: `https://fortnite.wiki/wiki/${season.kind === 'throwback' ? (season.id === 'OG2023' ? 'Fortnite_OG' : 'Chapter_2_Remix') : season.label.replaceAll(' ', '_')}`, status: 'pending' as const, notes: 'Not retrieved. Introduction, availability and relationship claims remain pending.' })),
 ...[['wiki-weapons','Weapons'],['wiki-outfits','Outfits'],['wiki-items','Items'],['wiki-vehicles','Vehicles'],['wiki-events','Live_Events']].map(([id,page]) => ({id,label:`Fortnite Wiki — ${page.replaceAll('_',' ')}`,url:`https://fortnite.wiki/wiki/${page}`,status:'pending' as const,notes:'Research queue; not verified.'})),
];
export const sourceById = new Map([...sources,...historicalSources,...reviewedSources,...classicPatchSources].map(source => [source.id,source]));
