# Phase 5B — Fortnite world and gameplay knowledge

Continues GitHub main checkpoint `b4a256f9422343da353668f56dce552d7a62e05a`. Data version `fortnite-phase5b-2026.11.11`. The desktop/mobile UI, rarity animation, seven-round Daily Drop, Unlimited, local statistics, autocomplete and `.openai/hosting.json` are preserved.

## Result

| Measure | Phase 5A | Phase 5B |
| --- | ---: | ---: |
| Playable canonical entities | 15,889 | **17,090** |
| Normal questions | 238 | **298** |
| Independent Daily questions | 102 | **149** |
| Independent non-cosmetic Daily questions | 45 | **92** |
| Additional Expert archive questions | 75 | **85** |

All Daily growth is non-cosmetic. No cosmetic, competitive, YouTube or Twitch import was added. There are 17,248 catalog entities, 95 normal semantic families and 81 Daily semantic families. Raw eligibility is 150; near-duplicate populations are excluded from the independent count. The initial 150 target is **not claimed**: the actual result is 149, rather than a padded extra question.

[The baseline report](phase5b-baseline.json) lists all original 238 normal and 102 independent Daily questions, family/type counts, overlap, practice candidates, unused verified fields, entities and existing relationship candidates. It was captured before research or data expansion. [The final report](phase5b-report.json) records every Daily question and new normal scope, exact populations, aliases, provenance, relationships, repetition and remaining gaps. [The quality report](phase5b-quality-report.json) contains every assessment.

## Relationships and answer banks

There are **1,543 positive graph edges**, including 93 confirmed seasonal Mythic drops, 658 spawn-location edges, 13 explicit NPC sale edges, 12 service edges and 33 guard-affiliation edges. Carried equipment is separate from confirmed drops. 1,387 edges have explicit seasons; 156 undated branch/affiliation edges remain unknown in season-specific queries. Near a POI never means inside it.

The review covers all 152 AI boss encounter rows, all 162 linked item profiles, 83 seasonal guard records, 62 linked guard profiles, all 90 company-category members, Character Collection locations, vehicle seats, vaults, gas stations, upgrade benches and individual movement/effect sources. The [source review](PHASE5B_SOURCES.md) explains mode exclusions, conditional effects, canonical reconciliation and factual corrections.

| New question | Verified answers | Scope |
| --- | ---: | --- |
| Name a Fortnite food or drink business. | 35 | Daily |
| Name a location that had a food or drink business. | 61 | Daily |
| Name a Fortnite boss with a keycard. | 30 | Daily |
| Name a boss that dropped a Mythic weapon. | 61 | Daily |
| Name a Mythic item obtainable from a Fortnite boss. | 88 | Daily |
| Name a POI or landmark that had a vault. | 65 | Daily |
| Name a location where an AI boss spawned. | 92 | Daily |
| Name a location where a Mythic boss spawned. | 59 | Daily |
| Name a location where a Character Collection NPC appeared. | 299 | Daily |
| Name a type of NPC guard in Fortnite Battle Royale. | 58 | Daily |
| Name a service or interaction offered by a Fortnite NPC. | 19 | Daily |
| Name something that restores health or shield over time. | 42 | Daily |
| Name something that can give you a low-gravity effect in Fortnite. | 28 | Daily |
| Name something that can prevent fall damage in Fortnite. | 44 | Daily |
| Name a Fortnite vehicle with at least two seats. | 31 | Daily |
| Name something that can knock back a player. | 20 | Daily |
| Name a Fortnite explosive weapon. | 43 | Daily |
| Name something that can start a fire in Fortnite. | 17 | Daily |

Chapter scopes reuse verified memberships rather than handpicked answer lists. Landmarks and unnamed sites keep distinct classifications; a landmark inside a POI does not become a named POI. Existing Chapter 2/6/7 snapshots and special-island distinctions remain intact. NPC-only carried equipment does not become a player-obtainable Mythic. Historical presence does not imply continuous availability or original introduction.

Daily keeps ≥15 field-verified answers and ≥3 recognizable editorial estimates; normal play keeps ≥10. The actual Daily minimum is 16, median 61; 121 banks have ≥30 answers and 53 have ≥100. Familiarity is an estimate, not observed player data. Newly approved small scopes join the Expert archive; the original smaller banks remain available.

## Rotation

The UTC selector remains independent of local statistics and request order. It permits **one to two location rounds**, seven distinct knowledge groups and at most two cosmetic rounds. Related vault prompts share a group; restoration variants also share a group. This uses the larger world bank without counting closely related prompts as different daily knowledge areas. The old one-location maximum would unnecessarily constrain the expanded location population.

For 120 consecutive UTC days, September 1–December 29, 2026:

| Measure | Phase 5A | Phase 5B |
| --- | ---: | ---: |
| Exact repeats with gap <7 days | 0 | 0 |
| Exact repeats with gap <14 days | 555 | **0** |
| Family recurrences with gap <3 days | 155 | **0** |
| Minimum exact-repeat gap | 7 days | 14 days |
| Mean exact-repeat gap | 12.65 days | 19.24 days |

All 120 sampled days have seven rounds, seven knowledge groups and five rounds with ≥20 verified answers. The sample uses 147 of 149 eligible questions. These are measured outcomes, not a mathematical guarantee for every possible future content snapshot. Family definitions and category capacity expanded, so baseline comparisons describe the delivered system rather than a controlled selector-only experiment.

## Incomplete candidates

- Ordinary/random boss drop populations and broad structure damage remain **disabled**. Loadouts and a handful of positive effects do not prove those complete populations.
- NPC sales/services and guard affiliations have positive records, but complete vendor inventories, changing prices and every dated faction/guard spawn join are unfinished. Ambiguous shared-profile affiliations remain withheld.
- Full season loot pools, season-as-answer prompts, precise intra-season windows and unrestricted global location returns/renames/replacements remain gated.
- The fishing-barrel count question remains **disabled**: a current coordinate layer without versioned POI boundaries and spawn semantics is insufficient. See [spatial research](phase5b-spatial-research.json).
- Rideable wildlife and the reviewed environmental-mobility taxonomy are below normal/Daily thresholds. Narrow or low-recognition chapter scopes stay in practice/Expert rather than receiving artificial answers or familiarity boosts.

## Validation and UI preservation

161 tests across 22 files pass, including graph provenance, mode/season scopes, canonical reconciliation, aliases, Small Fry, conditional fall protection, pending introductions, numeric-question gating and 120 balanced UTC dailies. Source/question-bank, quality, Phase 4B compatibility, Phase 5A compatibility and Phase 5B audits report no errors. TypeScript and the production build pass. The source-audit tests allow fifteen seconds for the larger graph and historical simulation under parallel test load; gameplay deadlines are unchanged.

Chromium production smoke covers 375, 768, 1280, 1440 and 1920 pixels, with no horizontal overflow, page errors or external runtime requests. It completes seven scored Daily rounds, invalid retries, question-specific suggestions/selection, rarity reveals, deadline resets, Unlimited timeout, history persistence and direct Unlimited entry. [Measurements](phase5b-browser-smoke.json) and screenshots: [mobile](screenshots/phase5b-375-game.png), [tablet](screenshots/phase5b-768-game.png), [desktop](screenshots/phase5b-1440-game.png), [large desktop](screenshots/phase5b-1920-game.png), [rarity](screenshots/phase5b-1440-rarity.png), [results](screenshots/phase5b-1440-results.png).

Home retains its lightweight bootstrap and deferred local catalog. No required backend, external runtime API, new visual theme or rarity animation change was introduced. The deferred game chunk remains large; Vite retains its non-blocking size advisory. Existing hosting/project configuration and earlier checkpoint reports are unchanged.

```sh
npm test
npm run audit
npm run audit:quality -- --output docs/phase5b-quality-report.json
PHASE4B_REPORT_OUTPUT=/tmp/phase4b-compatibility.json npm run audit:phase4b
PHASE5A_REPORT_OUTPUT=/tmp/phase5a-compatibility.json npm run audit:phase5a
npm run audit:phase5b
npm run build
npm run preview -- --port 4173
# In another terminal, using an installed Playwright module and Chromium:
PLAYWRIGHT_MODULE=/path/to/playwright/index.mjs CHROMIUM_PATH=/usr/bin/chromium node scripts/smoke-phase5b.mjs
```

Compatibility audits can write to temporary paths so committed Phase 4B/5A reports remain historical baselines. This document records GitHub delivery; it does not assert a separate live Sites publication.
