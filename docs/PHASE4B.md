# Phase 4B — natural questions, cosmetics and rotation

Continues committed Phase 4A checkpoint `10af07e68ebf7a13cbf62f58d710e4da9dd56e5e`. The existing application, branding, layout, rarity animation, 20-second deadline, invalid-answer retries, seven-round Daily Drop, unlimited practice, question-specific autocomplete, local statistics and `.openai/hosting.json` are preserved.

## Counts

**15,076 playable canonical entities**, **57 enabled normal-play templates**, **176 normal variants**, and **75 additional Expert-archive variants**. There are 15,281 catalog records. Earlier 201-variant counts included narrow five-answer scopes; normal-play totals now enforce ten field-verified answers instead of inflating the count with those scopes.

| Playable category | Entities |
| --- | ---: |
| Crossover characters | 43 |
| Loot containers | 75 |
| Other cosmetics | 11,656 |
| Items | 102 |
| Locations | 239 |
| Skins | 2,786 |
| Vehicles | 22 |
| Weapons | 153 |

Other retained categories with no viable normal question currently have zero playable answers; their historical data remains in the catalog.

### Cosmetic catalog

The bulk import contains 14,438 reconciled records, plus two individually reviewed Epic pass outfits and one Winterfest banner. 32 duplicate groups were reconciled; 51 conflicting groups were withheld. There are no duplicate canonical names within a cosmetic type. Same-named outfits, pickaxes and other cosmetic types remain distinct.

| Type | Catalog records |
| --- | ---: |
| backpack | 2,546 |
| banner | 1 |
| contrail | 265 |
| emoji | 774 |
| emote | 1,685 |
| glider | 733 |
| loadingscreen | 1,007 |
| music | 194 |
| outfit | 2,784 |
| pickaxe | 2,193 |
| spray | 1,101 |
| wrap | 1,158 |

Reviewed Epic pass outfits are retained even when external metadata is withheld. One symbol-only name has no usable normalized answer and is excluded from play. Two further retained legacy skin records remain playable in existing scoped banks without newly imported cosmetic metadata. Missing release dates are unknown; API `added` dates are never relabeled release dates.

## Broad answer banks

| Question | Accepted / field-verified | Daily eligible |
| --- | ---: | --- |
| Name a Fortnite Battle Royale loot container. | 75 / 75 | Yes |
| Name something you can use to rotate in Fortnite. | 48 / 48 | Yes |
| Name something that gives you health or shield. | 38 / 38 | Yes |
| Name an item that helps you get high ground. | 19 / 19 | Yes |
| Name something that lets you fly or glide. | 11 / 11 | Practice |
| Name an item that can launch you into the air. | 14 / 14 | Practice |
| Name a throwable item in Fortnite. | 54 / 54 | Yes |
| Name a skin with Uncommon (green) historical rarity. | 252 / 252 | Yes |
| Name a skin with Rare historical rarity. | 509 / 509 | Yes |
| Name a skin with Epic historical rarity. | 1,298 / 1,298 | Yes |
| Name a skin with Legendary historical rarity. | 139 / 139 | Yes |
| Name a skin that has appeared in the Item Shop. | 2,113 / 2,113 | Yes |
| Name a skin in a bundle from the November 9, 2026 evening Item Shop. | 32 / 32 | Practice |
| Name a cosmetic present from Winterfest 2021 or 2022. | 31 / 31 | Yes |

The catalog also supports broad outfit, pickaxe, emote, glider, Back Bling, wrap, contrail, loading-screen, music-pack, spray and emoticon questions; series queries; Marvel/DC/Star Wars outfits; original-chapter Battle Pass queries; and twelve selected set scopes. These are reusable families with typed predicates, not hundreds of manually authored near-duplicates. See the machine-readable quality report for every exact population.

Verified functions are shared across items, weapons and vehicles. Rotation has separate player-operated traversal evidence; cosmetic car bodies are not gameplay vehicles. Placeable equipment stays distinct from environmental mobility. Common answers such as Med Kit, Bandage, Small Shield Potion, Shield Potion and Chug Jug received explicit effect review rather than relying solely on legacy labels. The Cozy Campfire review uses the BR Campfire article, not the similarly named Save the World trap article.

## Question rules and rarity

Normal play requires at least ten field-verified answers after predicate evaluation, canonical deduplication and answerability checks. Daily eligibility requires fifteen, recognizable choices and an appropriate scope. Trusted legacy answers remain separately reported and never count toward those verified minimums. Research-approved 5–9-verified-answer scopes remain accessible through `questionPool({expert:true})` / `buildQuestion(...,{expert:true})` for future Expert Mode, without entering normal play.

Precise map questions now display reviewed season identities and calendar dates. A snapshot is not broadened into a whole-season population. All normal and archived prompts are checked for exposed patch IDs; displayed explanations also translate registered patch references.

Answer frequency remains an editorial estimate, not observed player data. Existing curated familiarity values are retained. New records have conservative defaults, an explicit early-exposure prior, and named familiar anchors such as Peely, Fishstick, Default Pickaxe, Star Wand and Floss. Cosmetic rarity does not set answer familiarity. For banks over 200 answers, fourth-power familiarity weights separate recognizable choices from obscure ones instead of forcing almost every answer onto the old frequency floor. The 100–1000 score formula and rarity animation are preserved; smaller banks retain the previous weighting.

## Rotation evidence

Daily seeds retain the existing UTC date format. A fixed, deterministically generated history from the 2025 epoch makes selection independent of local player history and the order in which dates are requested. The selector targets a fourteen-day exact-question cooldown, prefers older semantic families, prevents duplicate knowledge groups/closely related franchises within one daily, and relaxes exact cooldowns oldest-first when the eligible content is exhausted.

The current Daily pool has **56 variants**, below the **98** required to supply seven distinct questions on each of fourteen dates. A universal fourteen-day no-repeat guarantee is therefore **not met**. The measured minimum gap is seven days; a larger eligible corpus is still needed. No false fourteen-day claim is made.

Comparison over the same 120 UTC dates and the same Phase 4B eligible pool:

| Metric | Previous independent selector | Historical selector |
| --- | ---: | ---: |
| Distinct questions used | 54 | 56 |
| Adjacent-day exact repeats | 277 | 0 |
| Minimum exact repeat gap, days | 1 | 7 |
| Mean exact repeat gap, days | 6.29 | 7.99 |
| Semantic-family repeats within three days | 465 | 279 |
| Exact repeats inside fourteen days | 683 | 784 |

Immediate repetition and short family repetition decrease, while the fourteen-day repeat count remains constrained by pool capacity and is higher under the more even rotation. The latter is retained in the report rather than hidden.

All 120 sampled dailies have seven knowledge groups and at least five rounds with twenty verified answers. All 840 rounds meet the fifteen-verified-answer floor.

| Verified answers in a daily round | Rounds |
| --- | ---: |
| 15to19 | 99 |
| 20to49 | 294 |
| 50to99 | 76 |
| 100plus | 371 |

Practice uses a bounded local history of actually encountered question IDs, prefers unseen questions and fresh families, and falls back to the oldest seen content when a filtered pool is exhausted. Category filtering is preserved. Twelve sampled practice games produced **84 distinct questions across 84 rounds**. It does not change daily selection or the statistics storage format.

## Quality and remaining research

Normal verified-answer percentiles: {'p10': 12, 'p25': 16, 'p50': 24, 'p75': 48, 'p90': 252}. Questions below 10 / 15 / 20 verified answers: **0 / 38 / 76**. Questions below fifteen remain practice-only. The quality audit also reports clarity, exposed technical wording, recognizable and obscure tails, exact counts, eligibility, repeated semantic families, source coverage and ambiguities.

Remaining gaps: the fourteen-day capacity target; withheld cosmetic identity conflicts and unsupported metadata; complete historical bundles, exact cosmetic release dates and all-year Winterfest/Fortnitemares rewards; other cosmetic types such as instruments, car bodies, Kicks and Sidekicks; complete container-by-season contents; unresolved secondary fish effects; exact boss/Marauder drop tables; and unrestricted global location returns/renames across the still-unreviewed chapters. No uncertain bank is enabled just to meet a count.

## Validation and deployment

148 tests in twenty files pass. The question-bank audit and quality audit have no errors. TypeScript and the production build pass. The source/import audit also reports zero errors and zero same-type cosmetic duplicates.

Real Chromium production smoke: all seven rounds completed; retries, canonical answers, three-character suggestions, deadline resets and local practice history passed. There were zero page errors and zero external requests. Measured cold home readiness was 2191 ms and the first suggestion update 13 ms in this executor; these are local smoke measurements, not a mobile/network benchmark.

The production script is approximately 6.2 MB uncompressed / 0.81 MB gzip. Vite retains its non-blocking chunk-size advisory. Repeated catalog name/answer lookups are cached, no cosmetic images are downloaded, and play needs no runtime API requests. Further payload splitting is a possible future improvement.

```bash
npm test
npm run audit
npm run audit:quality -- --output docs/phase4b-quality-report.json
npm run audit:phase4b
npm run build
```

The static output remains `dist`. `.openai/hosting.json` and its project binding are unchanged. GitHub main publication and the final commit SHA are reported in the task response; this report does not assert a separate live Sites deployment.

Reports: [full Phase 4B audit](phase4b-report.json), [quality audit](phase4b-quality-report.json), [import decisions](phase4b-cosmetic-import.json), [browser smoke](phase4b-browser-smoke.json), and [source/usage review](PHASE4B_SOURCES.md).
