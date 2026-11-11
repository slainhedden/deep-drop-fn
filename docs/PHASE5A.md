# Phase 5A — question diversity and responsive desktop

Continues GitHub main checkpoint `3dda17e444417edb1f8aefddd9b858867169d19f`. Data version: `fortnite-phase5a-2026.11.11`. Existing mobile branding, rarity artwork/animation code, 20-second deadlines, invalid-answer retries, seven-round Daily Drop, local scoring and Unlimited practice are preserved. `.openai/hosting.json` is unchanged.

## Verified question banks

| Measure | Phase 4B | Phase 5A |
| --- | ---: | ---: |
| Playable canonical entities | 15,076 | **15,889** |
| Normal-play variants | 176 | **238** |
| Independent Daily variants | 56 | **102** |
| Additional Expert archive variants | 75 | **75** |

There are 15,984 catalog entities, 70 normal semantic families and 53 Daily semantic families. 103 variants pass raw Daily thresholds; one shotgun-shell ammunition bank overlaps the shotgun class bank by 91.6% and is excluded from Daily rotation/counting. Independence is assessed by Jaccard overlap of normalized display names, including across entity types, with an 85% near-duplicate threshold. Wording and parameter IDs do not create independence by themselves. Related chapter/set variants remain grouped as families, not counted as new families.

Daily retains ≥15 field-verified answers, ≥3 recognizable editorial estimates and appropriate scope; practice retains ≥10 verified answers. The actual independent Daily minimum is 16, median 75; 85 of 102 banks have ≥30 answers and 46 have ≥100. Familiarity is an editorial prior, not measured player popularity. Smaller approved scopes remain in the separate Expert archive.

New reusable facts support shop cosmetics by type, Battle Pass cosmetics, historical rarity, introduction chapter, additional real set scopes, Icon outfits, 304 outfits with selectable styles, ammunition, automatic weapons, consumables, Character Collections, AI bosses, chest variants and vault relationships. Source definitions, exclusions, licensing notes and reproduction steps are in [the source review](PHASE5A_SOURCES.md). No creator or competitive database was imported.

Selected banks:

| Scope | Verified answers | Daily |
| --- | ---: | --- |
| Automatic firing mode | 59 | Yes |
| Burst-fire weapons | 11 | Practice |
| Character Collection | 418 | Yes |
| Collection NPC in multiple chapters | 39 | Yes |
| AI bosses | 129 | Yes |
| Boss with documented Mythic loot | 89 | Yes |
| Chest variants | 32 | Yes |
| Named location with a vault | 41 | Yes |
| Named location with a documented vault boss | 23 | Yes |
| Named location in multiple seasons | 140 | Yes |

Named-POI coverage by numbered chapter is **1:38, 2:41, 3:36, 4:19, 5:26, 6:56, 7:50**. Original Chapter 2/6/7 snapshots and special islands are retained. OG/Remix throwbacks have separate prompts and do not qualify for Chapter 4/5 original island populations. Doom’s Courtyard remains a landmark following the reviewed Epic announcement. Global return/rename/replacement templates remain gated because positive membership alone does not establish continuity or a complete transformation history.

## Rotation and its actual limits

The selector remains a deterministic UTC history, independent of local play order/statistics. It enforces seven different knowledge groups, no repeated family within a day, at most two cosmetic rounds, one location round, at least one item round, at most two weapon/item rounds each, and at most one NPC/boss round each. At least five rounds have ≥20 verified answers. Recent exact questions and semantic families receive cooldown costs; insufficient categories relax oldest-first rather than breaking verified minimums or category balance. Unlimited continues using persisted encountered-question exclusions and recent-family preferences.

Measured over **120 UTC days, September 1–December 29, 2026, 840 rounds**:

| Measure | Committed Phase 4B baseline | Phase 5A |
| --- | ---: | ---: |
| Distinct questions used | 56 | 102 |
| Adjacent-day exact repeats | 0 | 0 |
| Exact repeats with gap <7 days | 0 (minimum gap 7) | 0 |
| Exact repeats with gap <14 days | 784 | 555 |
| Mean exact repeat gap | 7.99 days | 12.65 days |
| Family recurrences with gap <3 days | 279 | 155 |

That is about **29% fewer short-window exact repeats** and **44% fewer short-window family recurrences**. Family definitions/populations expanded, so the family comparison is descriptive rather than a controlled experiment. All 120 games have seven rounds, seven knowledge groups, at most two cosmetics, exactly one location and five broad rounds. Minimum category diversity is four categories (knowledge groups distinguish different mechanics within categories).

**A balanced fourteen-day no-repeat guarantee is not yet feasible.** Although 102 exceeds the global 98-question minimum, two cosmetics maximum requires 70 distinct non-cosmetic banks; only 45 exist. One location/day needs fourteen location banks; there are ten. One item/day likewise has ten banks. Excluding cosmetics and locations leaves 35 banks against a necessary 56. Adding cosmetic variants alone cannot solve this. The 150 stretch target is not claimed. Remaining work should prioritize verified gameplay relationships and independent location scopes rather than cosmetic padding.

[The machine report](phase5a-report.json) includes raw/independent counts, near-duplicate exclusions, answer distributions, recognizable coverage, source status, category counts and remaining gaps. [The per-question quality report](phase5a-quality-report.json) records every scope and exclusion reason. The committed Phase 4B report remains the historical baseline; its compatibility audit can write elsewhere via `PHASE4B_REPORT_OUTPUT`.

## Responsive interface and performance

Desktop uses a large central play area with left mode navigation/round progress and right run score/recent drops/game guide. Results include all seven answers and their points, with internal scrolling for short viewports. Daily and Unlimited are both directly accessible. Below desktop widths, side panels disappear; mobile retains the single-column flow. Tablet increases the useful central width.

Production Chromium checks found no horizontal overflow, page errors or external runtime requests:

| Viewport | Central panel | Visible side panels |
| --- | ---: | ---: |
| 375px | 375px | 0 |
| 768px | 720px | 0 |
| 1280px | 716px | 2 |
| 1440px | 784px | 2 |
| 1920px | 1,156px | 2 |

Screenshots: [mobile game](screenshots/phase5a-375-game.png), [tablet game](screenshots/phase5a-768-game.png), [1280 game](screenshots/phase5a-1280-game.png), [1440 game](screenshots/phase5a-1440-game.png), [1920 game](screenshots/phase5a-1920-game.png), [desktop rarity reveal](screenshots/phase5a-1440-rarity.png), [results](screenshots/phase5a-1440-results.png). Home and rarity screenshots at each width are included alongside these. [Browser measurements](phase5a-browser-smoke.json) capture the actual dimensions and functional checks.

A lightweight bootstrap renders home without importing the answer catalog/engine. Play/navigation intent loads the static local game chunk; hover/focus may warm it. Production output is approximately **235 KB / 74.6 KB gzip initial JS**, plus **6.17 MB / 758 KB gzip deferred game/catalog JS**, and 35.5 KB / 9.1 KB gzip CSS. The game chunk remains large and Vite reports its normal size warning; lazy loading improves initial delivery, not total download. Further normalized/precomputed indexes could reduce that deferred cost. No backend or external runtime API is required, and static hosting configuration is preserved.

## Validation and reproduction

- 153 tests pass across 21 files, including source/threshold gates, canonical deduplication, Chapter 1–7 membership, retained history, scoring, retry and timer regressions, and 120 balanced UTC games.
- Question-bank/source audit, question-quality audit, Phase 4B compatibility audit and Phase 5A audit report no errors.
- TypeScript and production Vite build pass.
- Chromium checks complete seven scored Daily rounds, verify UTC prompts, invalid retries, three-character question-specific suggestions and selection, reset deadlines, Unlimited timeout, persisted practice history, direct Unlimited navigation and normal rarity animation/reveal. Screenshots cover all five requested widths.

```sh
npm test
npm run audit
npm run audit:quality -- --output docs/phase5a-quality-report.json
PHASE4B_REPORT_OUTPUT=/tmp/phase4b-compatibility.json npm run audit:phase4b
npm run audit:phase5a
npm run build
npm run preview -- --port 4173
# In another terminal, with Playwright and Chromium available:
PLAYWRIGHT_MODULE=/path/to/playwright/index.mjs CHROMIUM_PATH=/usr/bin/chromium node scripts/smoke-phase5a.mjs
```

The browser script uses a fixed UTC date and local fixtures produced by the Phase 5A audit. Its real-time wait allows existing CSS animation timing to finish while the simulated gameplay clock remains deterministic.

## Deferred Phase 5B research

A modest competitive database could be researched later using official Fortnite Competitive announcements, published FNCS results and corroborated event records. Define event/year/region scopes before importing; record stable player identities, aliases, team membership and exact result provenance. “FNCS winner” must specify which event levels and team formats count. Do not equate a qualifier or heat with a Major final or Global Championship. Only activate a broad player prompt after reconciling complete scoped rosters/results and identity changes. No competitive questions, YouTube or Twitch imports are enabled here.
