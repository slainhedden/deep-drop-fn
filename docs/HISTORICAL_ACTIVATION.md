# Phase 2 historical activation continuation

This report compares the start of this continuation with its completed code/data state. The baseline is 932 records, 293 entities with reviewed claims, 440 pending entities, 472 playable entities, 96 templates (30 enabled), 153 variants and 2,646 accepted answer/question combinations. The initial baseline was captured before this continuation's edits; the previous uncommitted work was preserved.

## Results

| Measure | Baseline | Current | Change |
| --- | ---: | ---: | ---: |
| Records | 932 | 938 | +6 verified records; no new pending queue |
| Entities with reviewed claims | 293 | 346 | +53: 47 existing and 6 new |
| Pending entities | 440 | 418 | 22 existing candidates promoted |
| Playable entities | 472 | 495 | +23 |
| Enabled templates | 30 | 38 | +8 |
| Pending templates | 66 | 58 | −8 |
| Unique playable variants | 153 | 162 | +9 |
| Accepted answer/question combinations | 2,646 | 2,733 | +87 |

Of the 47 existing entities newly marked reviewed, 22 were pending and 25 retained legacy classifications. Separately, existing reviewed entities gained additional sourced history. A reviewed entity still has only its individually supported fields verified. Unknown introductions and unsupported relationships remain pending. The six new records fill documented omissions: Boom Bow, Balloons, Crossbow, Light Machine Gun, Shadow Bomb and Makeshift Bow.

All 472 previously playable entities remain playable. This was checked by reproducing eligibility from the captured baseline entities and the original enabled scopes, then comparing canonical IDs. The catalog still uses the original stable IDs. Dataset version is `fortnite-br-history-2026.11.5`.

## Activated scopes

The eight previously pending template IDs are:

1. `location-introduced-range`: original C1S7–C1S8 only, with the complete six first introductions: Frosty Flights, Polar Peak, Happy Hamlet, The Block, Lazy Lagoon and Sunny Steps. Other ranges remain unapproved, even when they have five matching records. Moving The Block does not count as a new canonical introduction.
2. `location-return-og`: the five returning Chapter 1 named POIs actually mentioned in Epic's OG announcement: Tilted Towers, Greasy Grove, Risky Reels, Loot Lake and Frosty Flights. The prompt explicitly names the announcement; this is not a claim to cover the entire OG map.
3. `vehicle-introduced-chapter`: Chapter 1 only. Shopping Cart, All Terrain Kart, Quadcrasher, X-4 Stormwing, Driftboard, Pirate Cannon, The Baller and B.R.U.T.E. form the complete original player-operated BR vehicle set. Stationary traps, wildlife and Creative-only vehicles are excluded.
4. `weapon-vaulted`: complete weapon entries in the reviewed original C1 Season 4–X launch vault lists.
5. `item-vaulted`: complete non-weapon item entries in the same launch vault lists.
6. `vehicle-vaulted`: complete vehicle entries in those launch vault lists. The scope is the original launch notes, not every later seasonal vault.
7. `weapon-unvaulted`: the complete weapon unvaults in the Tilted Town content update and v10.30. The four Tilted Town weapons retain their location restriction. The v10.10 Infinity Blade exception was LTM-only and does not qualify.
8. `weapon-available-season`: two independently bounded parameters. C2S6 asks for the ten weapons explicitly named in Epic's Primal crafting guide; C1S6 asks for the six canonical weapons with loot-rate adjustments in v6.02. Neither prompt claims the whole season loot pool. The guide's deliberately unnamed challenge bows are not eligible answers.

The obsolete OG named-POI overview parameter is suppressed because the activated OG-return family now owns that identical answer set. Counts do not inflate that duplicate. The other overview parameters remain intact.

## Evidence and research

The useful primary archive route is **`https://www.fortnite.com/patch-notes/...`**. Several corresponding `/news/...` pages return only a title, but the patch route serves the complete historical notes. Source definitions and exact URLs are in `src/data/classic-patch-sources.ts`; applied claims are in `src/data/catalog/classic-history.ts`.

Examples:

- [v5.0](https://www.fortnite.com/patch-notes/v5-0): Paradise Palms, Lazy Links and the All Terrain Kart.
- [v7.00](https://www.fortnite.com/patch-notes/v7-00), [The Block](https://www.fortnite.com/news/the-block), [v8.00](https://www.fortnite.com/patch-notes/v8-00): the complete original C1S7–C1S8 named-POI introduction scope.
- [v10.00 content update](https://www.fortnite.com/patch-notes/v10-00-content-update): Neo Tilted becoming Tilted Town and the four location-restricted weapon unvaults.
- [v10.10](https://www.fortnite.com/patch-notes/v10-10-patch-notes): Mega Mall replaced by Retail Row; the Infinity Blade's LTM-only exception.
- [v10.30](https://www.fortnite.com/patch-notes/v10-30-patch-notes): Paradise Palms becoming Moisty Palms, Greasy Grove returning and Tactical SMG unvaulting.
- [v10.40](https://www.fortnite.com/patch-notes/v10-40-patch-notes): Starry Suburbs and Bouncer unvaulting context; no live-event destruction is inferred.
- [v7.01](https://www.fortnite.com/patch-notes/v7-01): the Mythic Infinity Blade at Polar Peak.
- [Primal guide](https://www.fortnite.com/news/fortnite-primal-survival-crafting-guide): explicit crafting paths and named weapons, without inventing first-release dates for every bow.

Only Battle Royale sections qualify. Creative prefab additions and Save the World weapons do not establish BR introductions. New Epic/Legendary Pump and Tactical Shotgun variants do not become new canonical weapons or overwrite original introductions. A temporary Port-A-Fortress disable is not a vaulting.

### Alternative archive assessment

The GitHub repository [yaelbrinkert/fortnite-archives](https://github.com/yaelbrinkert/fortnite-archives), pinned at `5dadbe52f502a36cdf7b86cd7d1eeaa32b799400`, has maps and Wiki-derived location JSON spanning chapters. Its README, manifest, aggregate timeline, a C2S2 POI JSON and its map image were inspected.

The aggregate has sandbox/LEGO rows, omissions and ambiguous change-version boundaries. The inspected C2S2 JSON contains only eight locations and omits known named POIs; the map image has no labels. Consequently these files cannot establish a complete C2S2 named-POI bank or a first-introduction/removal date. No bulk import or status promotion was made from them. The separate `stl1988/fnHistory` repository was also inspected as a historical map-index lead; it did not supply a verified complete named-POI timeline.

One narrow aggregate claim was used as corroboration: Frosty Flights' positive references to updates 27.10 and 27.11, alongside the same place in Epic's OG snow-biome rollout. The citation explicitly limits its verification to that claim. It does not endorse the rest of the aggregate.

Fortnite.gg, archived Epic pages, web.archive.org and publication access were tested. Although the user expanded the settings, the **attached running instance continued to report an enforced allowlist containing only `fortnite.com`, `fortnite.fandom.com`, `fortnite.wiki` and `www.fortnite.com`**. Fresh requests to the added research destinations returned CONNECT 403. Draft inspection also returned `INVALID_ARGUMENT`, so no agent-side configuration persistence/application was claimed. Research continued with the accessible Epic and GitHub sources, without repeating domain permission requests.

## Historical precision

There are 109 new verified update observations: 71 present and 38 absent. `availabilityAtUpdate` distinguishes `present`, `absent` and `unknown` for a specific core-BR update. An absence at launch does not establish absence for the entire season or later history. A named POI replaced during a Season X update can still have verified presence earlier in that same season. Existing inclusive/disjoint appearance periods remain the season-level model.

The source-backed replacement records for Neo Tilted, Mega Mall and Paradise Palms are ordinary Rift Zone changes, not playable live-event destruction. Retail Row and Greasy Grove have explicit reintroduction records. Floating Island's documented return is recorded without promoting it to a named POI. No new event-destruction claim was fabricated to enable a five-answer family.

Template `coverage` records now state the approving sources, review date, scope note and any approved parameter rows. The coverage gate is independent of the five-answer rule; the audit distinguishes `coverage-incomplete`, `pending-review` and `insufficient-answers`. Shared parameter arrays are cloned before adding the one approved POI range, so unrelated templates do not silently acquire new parameter combinations.

The data editor is shared between the previous review layer and this continuation. It checks that claim sources are reviewed. Reviewing only a date on a legacy entity does not silently reverify its other classifications. Legacy classification behavior and its original provenance are retained in that case.

## POI coverage after this pass

Counts are verified named-POI **appearance assignments by chapter**, with returns counted in their actual chapter, not unique introduction counts. OG2023 belongs to Chapter 4. Some locations have reviewed existence but unverified map-label status and therefore are not promoted to named POIs.

| Chapter | Before reviewed | After reviewed | Still pending |
| --- | ---: | ---: | ---: |
| 1 | 8 | 18 | 20 |
| 2 | 0 | 0 | 38 |
| 3 | 11 | 11 | 23 |
| 4 | 17 | 18 | 22 |
| 5 | 3 | 3 | 33 |
| 6 | 0 | 0 | 17 |
| 7 | 1 | 1 | 0 |

The Chapter 4 increase is Frosty Flights' OG return. The unchanged Chapter 2/6 columns are verification gaps, not assertions that those POIs did not exist. Chapter 7's limited named-POI coverage still is not comprehensive.

## Daily variety and validation

The existing generator, UI and scoring are retained. The daily seven-round selection now considers knowledge axes in addition to answer categories and families. Vaulting questions across weapons, items and vehicles share a diversity group, preventing three similarly worded vault-list questions in one daily game. Fresh knowledge groups are preferred while retaining deterministic seeds, duplicate/near-duplicate protection, and the ability to fill seven rounds. Practice category filtering remains intact.

Validation passed:

- **78 tests in 13 files**, including 60 daily seeds with seven distinct knowledge axes and reproducible order.
- Standalone dataset audit: **no structural errors**; coverage-limited combinations remain reported rather than auto-enabled.
- TypeScript and Vite production build.
- Whitespace/diff check.
- Baseline canonical-answer comparison: **472 reproduced, zero removed**.

Remaining work is substantial: the 418 pending entities, full Chapter 2/6 map histories, original launch POIs and early-season additions lacking retrievable primary evidence, exact continuous availability, renamed/destroyed/transformed event banks, and wider Chapter 3–7 historical coverage. Those families remain pending until their complete stated scopes can be independently supported.

See `historical-activation-report.json` for the exact activated IDs, coverage approvals and newly reviewed existing/new records.
