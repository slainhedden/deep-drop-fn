# Phase 4A location-history continuation

Continues `522a4f37898dd17e5c29e14596eee782a9d5d42b`; the previous checkpoint remains preserved in `PHASE4A_CHECKPOINT.md`. Research was retrieved November 9, 2026 Pacific time (November 10 UTC). Data review dates use UTC.

## Results

| Measure | Starting checkpoint | This continuation |
| --- | ---: | ---: |
| Catalog records | 1,054 | 1,112 |
| Playable canonical entities | 612 | 710 |
| Enabled templates | 51 | 53 |
| Playable question variants | 178 | 201 |
| Passing tests | 127 | 134 |

The three whole-chapter location variants for Chapters 2, 6 and 7 are enabled, along with the fully reviewed season-level location scopes. First-introduction families and unrestricted cross-chapter return/rename/replacement families remain gated independently of answer counts. Seven-round Daily Drop, unlimited practice, retry deadlines, scoring, autocomplete, item/Mythic/fish banks, UI and rarity animation are preserved. Across the existing 120-date daily sample, 71.4% of rounds still have at least twenty answers.

| Chapter / island | Distinct verified named POIs | Season memberships |
| --- | ---: | --- |
| Original Chapter 2 / Apollo | 41 | S1 13; S2 19; S3 18; S4 19; S5 17; S6 17; S7 17; S8 17 (137 assignments) |
| Chapter 2 Remix / Apollo return | 19 | `REMIX2024`: 19; retains its existing chronology between Chapters 5 and 6 |
| Chapter 6 / Oninoshima | 46 | S1 20; S2 18; Galactic Battle 18; S3 18; S4 27 |
| Chapter 6 / Springfield Island | 10 | Separate Simpsons special season; nine launch positions plus a same-day rename |
| Chapter 7 / Golden Coast | 21 | S1 Pacific Break 16; S2 15 |
| Chapter 7 / Shattered Coast | 18 | S3 13; S4 15 |
| Chapter 7 / Crossbones Isle | 13 | Separate Treasure Hunters special season |

Chapter totals are **41 / 56 / 50** for Chapters **2 / 6 / 7**, with **137 / 111 / 72** season assignments. Chapter 7 has two names shared between Golden Coast and Shattered Coast, so island totals are not additive. Season totals are unions of named status at any point, not simultaneous launch-map counts. Chapter 6 S1 launched with eighteen names; Shattered Span and Kappa Kappa Factory make twenty over the season. Whole-chapter prompts accept the chapter's separately documented special-season locations while their evidence retains the individual island and season. Remix has its own season question and is not relabeled an original Chapter 2 season.

## Evidence and corrections

`src/data/research/location-history.json` retains named-location tables, exact positive/negative flags as retrieved, response SHA-256 hashes, MediaWiki revision IDs, season-map-log excerpts, official Epic excerpts, and explicit corrections. Runtime source URLs pin wiki revisions with `oldid`. The aggregate named-location table supplies the population; season map histories corroborate introductions, changes and major transformations. Official Epic Pacific Break, Showdown and Galactic Battle bodies independently corroborate the original Golden Coast, Season 2 locations, and four Star Wars replacements. The landmark index was also successfully retrieved to distinguish named status from landmark status. Existing immutable v41.20–43.00 map snapshots and their provenance remain intact.

Reviewed corrections are recorded rather than silently rewriting the source:

- **Foxy Floodgate** keeps the previous `location-fox-floodgate` ID; the pending spelling does not create another entity.
- **Coral Castle** appeared August 1 during v13.30, rather than the aggregate note's v13.00.
- **Believer Beach** replaced Sweaty Sands in v17.00, rather than the aggregate note's v16.00.
- **Catty Corner** remained a named Chapter 2 location through S8; the aggregate note's v17.00 removal is not promoted.
- **InnoLoop Labs → Lethal Labs** is explicitly called a rename in the C7S1 log. Both IDs remain distinct and linked.
- **Mayor's Munchies → Corruption Corners** occurred in the November 1 v38.00 hotfix. The launch name is omitted from the aggregate table but explicitly listed in the season log, so both names receive positive season membership.

The Agency, The Authority and The Ruins remain distinct canonical records, as do original and remixed named locations. Changes come from explicit update notes, not absence from a map snapshot. A false table flag never becomes an unsupported whole-season absence claim. `reviewedIslands` and special season IDs prevent transferring Springfield or Crossbones evidence to the original island. Snapshot landmark assignments are not promoted to named-POI appearances.

## Network verification

The new executor is `ccarenv_b64_Y2NhcmVudl85ZWU1MTg0MjJiNmM4MTkxYjllMGQ2OGYyNTQyYjMwYw`. It reports matching spec/observed revision 1, current observations, and an enforced policy containing `fortnite.weirdgloop.org`. Revisions are local to each environment, so this is not the previous executor's revision 2.

Fresh ordinary curl requests to both `/w/Named_Locations` and `/w/Landmarks` returned HTTP 200 and actual wiki HTML. There is no stale-allowlist or site-rejection blocker for these pages. Proxy and TLS security settings were not modified. Dependency installation used a writable `/tmp` npm cache after the default cache path was unavailable; the lockfile was preserved.

## Remaining research gaps

Unrestricted “returned in a later chapter” and “renamed or replaced” answer populations span Chapters 1–7. Complete Chapter 1/3/4/5 table review, conflicting older transitions, and the separate ongoing OG/Reload/Blitz island scopes are not completed here. Existing positive records do not establish a complete global population, so those broad prompts remain disabled. The aggregate Chapter 1/3 tables contain evident disagreements with existing patch evidence; they were not bulk-promoted to make those questions pass a minimum count.

Individual original introductions and transformations have evidence, but complete first-introduction and live-event destruction populations remain gated. Replacement is not automatically destruction, and a general map-transformation narrative is not automatically a playable-event claim. Some transitions remain retained as prose where an exact typed edge would overstate the source.

Previous non-location gaps remain: complete boss/Mythic drop histories, container contents/taxonomy, secondary fish effects and historical catchability, and exact Marauder drops.

## Validation and publication

`npm test`: 134 tests in nineteen files pass. `npm run audit`: no errors. `npm run audit:quality -- --output docs/phase4a-location-quality-report.json`: no errors. `npm run build`: TypeScript and production build pass; Vite reports a non-blocking bundle-size advisory. Regression coverage checks every reviewed season population and every previously committed Chapter 7 snapshot, including their source IDs.

Machine-readable reports: `phase4a-location-report.json` and `phase4a-location-quality-report.json`. `.openai/hosting.json` is unchanged. Build using `npm ci` and `npm run build`, serving `dist`. GitHub main publication is recorded in the task's final response; no separate live ChatGPT Sites deployment is asserted.
