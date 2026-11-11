# Phase 5C — nostalgia, world history and gameplay

Continues main `7095271026ff19ba674c686ac93c03ff85cc3cde`. Data version `fortnite-phase5c-2026.11.11`. This expands the existing game and preserves its responsive UI, rarity animation, timers, retries, scoring, stats, autocomplete and Sites project binding.

| Measure | Phase 5B baseline | Phase 5C |
| --- | ---: | ---: |
| Playable canonical entities | 17,090 | **17,344** |
| Normal variants | 298 | **319** |
| Independent Daily variants | 149 | **166** |
| Non-cosmetic independent Daily variants | 92 | **109** |
| Additional Expert archive | 85 | **85** |
| Verified world graph edges | 1,543 | **1,899** |

The 175–200 independent Daily aspiration is **not met**. All 17 additional Daily variants are non-cosmetic. No threshold was reduced or cosmetic bank added. Familiarity remains an editorial estimate; small recent container banks retain their gates without score boosts. There are 17,439 catalog entities, 104 normal semantic families and 89 Daily families. Raw Daily eligibility is 167; the existing shotgun-ammunition near-duplicate is excluded. The [baseline](phase5c-baseline.json) preserves the complete committed Phase 5B report captured before edits. The [final audit](phase5c-report.json) contains every question, verified answer count, era, group, family, overlap exclusion, graph extension and measured repetition.

## Coverage across the nine categories

| Category | Delivered coverage and banks | Limit |
| --- | --- | --- |
| A. Drop spots | Existing Chapter 1–7 POIs/landmarks/unnamed places retained; 65 event-linked places and four explicit transformation edges extend history | Launch, global rename and true-return populations remain gated |
| B. Bosses | Existing carries/drops/keycards/guard graph retained; recent-era boss bank has 85 answers, middle-era 22 | Ordinary/random drops and complete dated faction control remain incomplete |
| C. Equipment | 449 index rows compared; Overdrive functions corrected; Explosive Batarang added; four spelling aliases reconciled; 13 traps | Not every weapon archive or full seasonal loot pool is complete |
| D. LTMs | 80 canonical historical BR LTMs, including former permanent-mode origins; aliases, release labels and positive rule edges | Large-team, respawn/build-rule and return populations remain partial |
| E. Events | 67 events/story moments; 31 classic, 10 middle, 26 recent; 65 associated locations | Main storyline scope excludes separate Creative/Party Royale experiences and future events |
| F. Wildlife/NPCs | 19 interactive wildlife identities; recent Character Collection bank 206, middle 124; riding/taming separate | Small riding/taming banks stay below activation thresholds |
| G. Loot sources | 75 original containers preserved plus two distinct types; 34 explicit named-loot edges; environmental sources separate | Numeric counts and complete per-season loot tables remain gated |
| H. Businesses | 53 retail businesses, 85 parent places, 209 undated branch edges | An undated branch list does not establish a season or building identity |
| I. Mobility | 73-answer rotation bank retained/expanded, Overdrive added to its documented functions; equipment era banks 205/153/297 | General equipment presence is not a claim that every item grants mobility |

[Source review and reproduction](PHASE5C_SOURCES.md) explain exclusions, full-index checks and contradictions. The catalog-diff workflow generates review candidates and cannot automatically import them into gameplay. Wiki responses retain revision/hash provenance; Epic independently corroborates Overdrive's movement role. The application needs no external runtime service.

Named-POI coverage is unchanged: Chapters **1:38, 2:41, 3:36, 4:19, 5:26, 6:56, 7:50**. Published Chapter 7 snapshots and special-island identities are preserved. No season appearance is promoted to launch presence. Mere event attendance, transformation, destruction, rename and replacement remain different claims.

## Era preferences and repeat measurement

Editorial eras describe a question's scope: classic C1–2, middle C3–4, recent C5–7, and cross-era/general. Throwback-map prompts are classic nostalgia. These labels do not change historical evidence or manufacture dates. New era scopes reuse verified chapter memberships. Daily's soft era cost operates below exact cooldowns and short family cooldowns; category caps and seven knowledge groups still apply.

The independent Daily pool contains **21 classic, 12 middle, 15 recent and 118 cross-era/general** variants. Over 120 UTC days, September 1–December 29, 2026:

- All 840 rounds have at least 15 field-verified answers; the measured minimum is 16.
- All games have seven distinct knowledge groups, at most two cosmetics and five banks with at least 20 verified answers.
- There are **zero exact repeats inside 7 or 14 days**, and zero family recurrences inside three days. Minimum exact gap is 14; mean gap is 20.61 days. There are 676 repeat occurrences across the full window, all beyond the short cooldown.
- 164 of 166 eligible questions appear. The excluded questions are not reclassified or given artificial familiarity to force usage.
- Era appearances are **138 classic, 63 middle, 119 recent, 520 cross-era**. That averages 1.68 classic/middle, 0.99 explicit recent, and 4.33 general/cross-era per game. The suggested two recent rounds remains a capacity gap; the preference does not override evidence or cooldowns.
- Exact chapter parameters recur on adjacent days 63 times; this counts matching chapter parameters, not inferred chapters for general/era questions. Era-level and per-day distributions are recorded separately in the audit.

The fourteen-day outcome is measured for this sample, not a universal mathematical guarantee. Unlimited retains category filters, encountered-question exclusion and oldest-first fallback when a filtered bank is exhausted. Identical display names across typed identities now count once within a question, fixing full-name ambiguity for Mounted Turret while preserving both catalog IDs.

## Validation and delivery

169 tests across 23 files pass, including all original gameplay tests and new checks for wildlife versus cosmetics, historical versus permanent/Creative modes, aliases, Overdrive conditions, item-index identity review, canonical matching, source relationships, numeric gating, editorial eras, deterministic rotation and Unlimited filters. Vitest uses two workers and fifteen-second test deadlines for the larger source graph/UTC-history simulations; the game's twenty-second deadlines are unchanged.

Question-bank/source, quality and Phase 4B/5A/5B compatibility audits pass; historical reports are preserved through output overrides. TypeScript and the production build pass. Chromium checks cover 375, 768, 1280, 1440 and 1920 pixels, seven scored Daily rounds, invalid retries, scoped autocomplete, rarity reveals, deadline resets, Unlimited timeout/history and direct entry. No horizontal overflow, page errors or external runtime requests occur. See [browser measurements](phase5c-browser-smoke.json), [desktop](screenshots/phase5c-1440-game.png), [mobile](screenshots/phase5c-375-game.png) and [results](screenshots/phase5c-1440-results.png).

UI, CSS, rarity artwork/animation and `.openai/hosting.json` are unchanged. The lightweight home bootstrap and deferred local catalog remain; Vite's existing large deferred-chunk advisory remains. This phase delivers a commit/push to GitHub main and a production build; it does not assert a separate live ChatGPT Sites publication.

```sh
npm test
npm run audit
npm run audit:phase5c
npm run audit:quality -- --output docs/phase5c-quality-report.json
npm run audit:catalog-diff
PHASE4B_REPORT_OUTPUT=/tmp/phase4b-compat.json npm run audit:phase4b
PHASE5A_REPORT_OUTPUT=/tmp/phase5a-compat.json npm run audit:phase5a
PHASE5B_REPORT_OUTPUT=/tmp/phase5b-compat.json npm run audit:phase5b
npm run build
npm run preview -- --port 4173
# In another terminal, with the installed browser tooling:
PLAYWRIGHT_MODULE=/path/to/playwright/index.mjs CHROMIUM_PATH=/usr/bin/chromium node scripts/smoke-phase5c.mjs
```
