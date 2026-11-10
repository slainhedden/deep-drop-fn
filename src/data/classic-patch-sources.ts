import type { SourceRecord } from '../domain/types';

export const classicPatchSlugs=[
 'v4-0','v4-2','v4-3','v4-4','v4-5','v4-5-content-update','v5-0','v5-10','v5-20','v5-21','v5-30','v5-30-content-update','v5-40','v5-40-content-update','v5-41',
 'v6-00','v6-01','v6-02','v6-10','v6-20','v6-21','v6-22','v6-30','v6-31',
 'v7-00','v7-01','v7-10','v7-20','v7-30','v7-40','v7-40-content-update','v8-00','v8-01','v8-10','v8-11','v8-20','v8-20-content-update',
 'v9-00','v9-01','v9-10-content-update','v9-20','v9-21','v9-30','v9-40',
 'v10-00-patch-notes','v10-00-content-update','v10-10-patch-notes','v10-20-patch-notes','v10-20-content-update','v10-30-patch-notes','v10-40-patch-notes',
] as const;
export const patchSource=(slug:string)=>`epic-patch-${slug}`;
export const classicPatchSources:SourceRecord[]=classicPatchSlugs.map(slug=>({id:patchSource(slug),label:`Epic Games — archived ${slug} patch notes`,url:`https://www.fortnite.com/patch-notes/${slug}`,status:'verified',verifiedOn:'2026-11-09',notes:'Full archived text retrieved from the patch-notes route. Claims use Battle Royale sections only; Creative and Save the World sections do not establish Battle Royale availability. Patch numbers identify updates, not inferred continuous season spans.'}));
classicPatchSources.push({id:'epic-block-2018',label:'Epic Games — The Block announcement',url:'https://www.fortnite.com/news/the-block',status:'verified',verifiedOn:'2026-11-09',notes:'December 6, 2018 article explicitly introduces The Block as a new feature on the Battle Royale map.'});

classicPatchSources.push({id:'archive-frosty-og-corroboration',label:'Fortnite Archives — pinned Frosty Flights update references',url:'https://github.com/yaelbrinkert/fortnite-archives/blob/5dadbe52f502a36cdf7b86cd7d1eeaa32b799400/named_locations_through_updates.json',status:'verified',verifiedOn:'2026-11-09',notes:'Narrow corroboration only: Frosty Flights references 27.10 and 27.11, matching the location in Epic’s OG snow-biome rollout. This aggregate has omissions, sandbox rows and ambiguous change boundaries. No other claim is promoted from this file; first/last versions must never be interpreted as introduction/removal dates.'});
