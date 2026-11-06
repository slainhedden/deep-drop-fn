import type { SourceRecord } from '../domain/types';

export const DATA_VERSION = 'fortnite-br-curated-2026.11.2';

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
