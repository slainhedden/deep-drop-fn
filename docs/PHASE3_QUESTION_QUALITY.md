# Phase 3 — approachable questions and retry behavior

This report preserves the Phase 3 checkpoint before the subsequent Phase 4A work. The prior GitHub publication was `d2c1fbb`. Design, rarity scoring, navigation, animations, statistics and `.openai/hosting.json` are preserved.

## Measured changes

| Measure | Before | Phase 3 |
| --- | ---: | ---: |
| Catalog records | 938 | 970 |
| Playable canonical entities | 496 | 519 |
| Enabled templates | 38 | 48 |
| Playable question variants | 162 | 172 |
| Full practice-pool median answers | 11 | 11 |
| Daily rounds with 20+ answers, 120 UTC dates | 19.3% | 71.4% |

The full median intentionally retains narrow historical practice questions. Every tested daily contains five banks with at least 20 answers, seven distinct knowledge groups, at most one weapon question, and at most one bank below 12 answers. Practice keeps the full supported pool. Daily composition targets accessibility and topic diversity rather than rigid difficulty slots; present content does not justify a separate moderately difficult round every day.

New banks: weapons 147, crossover characters 43, weapons with Mythic versions 18, Exotic weapons 9, loot containers 8, mobility equipment 18, throwable utility items 6, placeable traps 7, classic firearm ammunition classes 5, and foraged consumables 5. These counts include previously accepted legacy classifications where applicable. The quality report separately counts explicitly field-verified answers; legacy content is not relabeled as newly reviewed.

## Quality policy

Each active variant reports accepted and field-verified counts, editorial recognizable-answer estimates, breadth, historical specificity, estimated difficulty, clarity, rare-answer tail and daily eligibility. Count bands follow the proposed broad/standard/medium/hard/expert guidelines without padding. Familiarity estimates are editorial priors, not observed player recall.

Daily candidates need at least eight answers, three estimated recognizable answers, no advanced restriction, and no single-season/patch interval requirement. Five rounds target 20+ answers. An accessible 8–11-answer bank may appear once as a wildcard. The selector also retains category/family/answer-overlap controls and deterministic seeded ordering. Static question and quality caches avoid recomputing the complete catalog on every selection.

## Gameplay and source model

Invalid, unrecognized and ambiguous answers show polite inline feedback without locking the round. The input remains usable, and Enter submits. Only a successful answer or the original deadline ends the round. An absolute 20-second deadline prevents typing and failed retries from restarting the timer; synchronous locking prevents duplicate successes. Timeout remains zero points; successful rarity calculations and animation are unchanged.

Autocomplete remains restricted to the question snapshot and now requires three characters. Mixed item/weapon banks use canonical IDs consistently in suggestions, validation and inspection.

Added entity support: containers, ammunition, materials and factions. Verified relationship kinds include `droppedBy`, `foundIn`, `obtainableAt` and `faction`; optional relationship season predicates prevent transferring a drop across seasons. Existing appearance evidence remains required for availability questions. Exact Marauder and container-loot questions remain pending because individual source mentions do not establish full loot tables.

## Research limits

Direct Krillion home/FAQ requests were rejected by the environment proxy with 403. No claim is made to have inspected the live game or verified the independent 150-answer median. The request's broad reference-dataset/editorial principles guided the implementation; no artwork or proprietary bank was copied.

Fresh Epic requests returned 403. Existing retained Epic article bodies from earlier research were re-reviewed claim by claim. [Source excerpts](phase3-source-excerpts.json) record URLs, retained text fingerprints and short quotations. Mythic classification does not imply a verified first-release season. Generic rarity upgrades do not create duplicate canonical entities; named Mythics are separate only where the official article names them separately. Exotic Chug Cannon remains a utility item rather than a weapon, following Epic's explicit distinction.

Outstanding: complete Chapter 2 named Mythic/boss tables, fish functionality/catchability, Rare/Faction/Produce/Cooler container taxonomy and complete contents, and C2S3 Marauder loot granularity. Skye’s Assault Rifle and Brutus’ Minigun remain review examples rather than guessed promotions. Broad classification remains independent of unrelated pending history.

## Developer tools and validation

```bash
npm run audit:quality -- --output /tmp/question-quality.json
npm run inspect:answers -- --template weapon-mythic-version
npm run inspect:answers -- --template marauder-drops
npm test
npm run audit
npm run build
```

[Machine-readable baseline and quality report](phase3-quality-report.json) covers every active variant, count distributions, repeated families and incomplete content. It is developer-only and is not shipped in `dist`. Build metadata publishes only aggregate quality/count diagnostics.

116 tests in 17 files passed, including classification, relationships, season boundaries, scoring, fixed-deadline retries, 120 daily seeds, ambiguity and question-specific suggestions. Audit reported no errors, and TypeScript/Vite production build passed. A real Chromium production smoke passed invalid retry, three-character suggestions, canonical success lock, next-round 20-second reset and no page errors.

Publish from GitHub `main` using `npm ci`, `npm run build`, and static directory `dist`. Preserve the existing project binding. Compare the deployed `/build-info.json` with the published commit and generated fingerprint; a game HTML response is not metadata. No live Sites publication is asserted here.
