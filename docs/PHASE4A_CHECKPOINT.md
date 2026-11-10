# Phase 4A checkpoint and fresh-task handoff

> Latest continuation: [Phase 4B natural questions, cosmetics and rotation](PHASE4B.md). Earlier checkpoint details below remain preserved.

> Continued from this committed checkpoint: see [Phase 4A location-history continuation](PHASE4A_LOCATION_HISTORY.md) for the resolved network blocker, reviewed Chapter 2/6/7 populations, enabled chapter questions, current counts, and remaining global coverage gates. The text below preserves the original checkpoint.

## Published foundation and completed work

Phase 3 was preserved, tested and pushed to `main` as `5fca4615d31c2e9a0edc821e0af12b881d93ca1b`. Its checkpoint has 970 records, 519 playable entities, 48 enabled templates and 172 variants. This Phase 4A continuation changes data, verification/audits and tests; it retains Phase 3's design, seven-round daily selector, unlimited mode, retries, absolute 20-second deadline, scoring, animation, question-specific autocomplete and Sites project binding.

| Measure | Phase 3 | Phase 4A checkpoint |
| --- | ---: | ---: |
| Catalog records | 970 | 1,054 |
| Playable canonical entities | 519 | 612 (+93) |
| Enabled templates | 48 | 51 (+3) |
| Playable question variants | 172 | 178 (+6) |
| Full practice-pool median answer count | 11 | 12 |
| Daily rounds with at least 20 answers, 120 dates | 71.4% | 71.4% |

Current broad banks: health 30 accepted / 24 explicitly verified; shield 19 / 13; fish 16 / 16; foraged 13 / 13; Mythic weapons 24 / 24; Exotic weapons 9 / 9; named POIs 106 / 75; landmarks 35 / 35. Retained legacy classifications account for the accepted-versus-explicit-review difference. No legacy provenance was silently relabeled as new review.

Newly enabled template IDs: `fish-class`, `landmark-general`, `location-reviewed-map`. The last template has four distinct answer sets after duplicate-snapshot suppression, all practice-only. It is explicitly scoped to the reviewed map version, with thirteen named POIs per snapshot. Whole-chapter history remains gated; map snippets were not presented as complete chapter tables.

[Machine-readable checkpoint report](phase4a-checkpoint-report.json) contains all broad-bank counts, explicit verification counts, complete distributions, season assignments and pending-claim counts.

## Items and field-level facts

Small Fry is accepted by both `health-item` and `fish-class`. Its player-facing archived Athena definition says “Consume for some light Health.” Fish classification uses the Athena Flopper/Fish definition family, separately from the healing description. The source's `CH2S1` Creative catalog tag is retained as `catalogSeasonTag`, never promoted to a verified first-release date or actual in-match availability window.

Sixteen canonical fish are reviewed: Small Fry, Flopper, Slurpfish, Shield Fish, Jellyfish, Hop Flopper, Thermal Fish, Spicy Fish, Snowy Flopper, Cuddle Fish, Rift Fish, Vendetta Flopper, Midas Flopper, Stink Fish, Zero Point Fish and Shadow Flopper. Cosmetic fish colors are not separate answers.

Shared `restoresHealth` and `restoresShield` attributes now drive the general healing questions. Existing trusted classifications are normalized into those attributes with their original verification status. Explicit definition descriptions verify new attributes individually. `isFish`, `isForaged`, `isConsumable`, `isThrowable`, `playerMobility`, catalog rarity and ammunition type are independently sourced where available. A fish's `Regenerative` tag alone never identifies a health or shield effect. Cuddle Fish is not automatically a healing answer. Secondary effects of eleven fish remain partially undocumented here; missing attributes mean unknown, not a proved absence of an effect.

Corn, Cabbage, Slurp Mushroom and Halloween foraged consumables received explicit function review. Named Mythic reviews include Skye’s Assault Rifle, Brutus’ Minigun, Meowscles’ Peow Peow Rifle, Jules’ Drum Gun, Ocean’s Burst Assault Rifle and Shadow Midas’ Drum Gun. The actual SMG/Minigun tags take precedence over broad “Assault Weapon” description wording. Skye’s Grappler and Jules’ Glider Gun remain mobility utility items, not offensive weapons. No boss-drop edge is inferred solely from a possessive name.

Evidence is committed in `src/data/research/{fish,food,weapon}-definitions.json`; `phase4-sources.ts` records immutable GitHub URLs and full-file SHA-256 fingerprints. These are extracted first-party game definitions hosted by a third party, not new Epic announcements. Cooked definitions can persist after vaulting; they establish the reviewed identity/function fields, not current spawn availability or a historical drop table.

## Chapter coverage: what is verified and what remains blocked

| Chapter | Distinct named POIs with reviewed appearances | Named-POI/season assignments |
| --- | ---: | ---: |
| 1 | 18 | See full audit |
| 2 | 0 | 0 — blocked research, not completed |
| 3 | 11 | See full audit |
| 4 | 18 | See full audit |
| 5 | 3 | See full audit |
| 6 | 0 | 0 — blocked research, not completed |
| 7 | 31 (previously 1) | 41 (previously 1) |

Chapter 7 assignments are 13 in C7S3, 15 across C7S4, and 13 in `C7TREASURE2026`; C7S1 and C7S2 remain unreviewed. Seven typed snapshots from v41.20–42.40 and the v43.00 snapshot were reviewed. Each contains exactly thirteen `type:named` core-map entries, separately from named landmarks. OG and rotating-island files were excluded. Blank/internal landmark markers are excluded. The data preserves positive snapshot assignments only, never interpolated continuous spans or inferred removal, replacement, rename or live-event destruction.

The archive groups v43 under `season_5`, but the independently retained official Treasure Hunters article describes the new Crossbones Isle. Consequently v43 is mapped to the existing **`C7TREASURE2026` special season**, not an invented C7S5 or the original Chapter 7 island. `$.$. Rocky` and “THE $.$. ROCKY” share one canonical entity. This same caution must be used for Chapter 6 mini-seasons; archive folder numbers are not sufficient evidence of official seasonal chronology.

Snapshot provenance: immutable archive revision `5dadbe52f502a36cdf7b86cd7d1eeaa32b799400`, explicit `pois.json` type/tag data, SHA-256 per file, retained in `src/data/research/chapter7-map-snapshots.json`. Snapshot-specific lists are complete for the stated source/map version. They do **not** establish complete Chapter 7 history. Entire-chapter questions, introductions and transitions remain pending until the missing periods are reviewed.

The archive's own `scripts/clean-legacy-pois.js` explicitly warns that pre-v41.20 scraped files are incomplete, average roughly eight locations against maps with 15–25, and mix wiki artifacts. A C6S1 list also contains old OG island locations. Those legacy lists and first/last aggregate version references were investigated but **not promoted** as complete Chapter 2/6 evidence. The unlabeled historical map images do not independently verify official map labels.

## Confirmed stale network configuration

The user reports Weird Gloop is already in their environment settings. This running task still observes:

- Environment: `ccarenv_b64_Y2NhcmVudl81YzQzNGJlNjI5MDQ4MTkxYjllMmJmMjM1NzljYTFmYw`.
- Spec and observed revision: **2**, `observations_current: true`, network state `enforced` — current for this task's old configuration.
- Only four custom allowed hosts: `fortnite.com`, `www.fortnite.com`, `fortnite.wiki`, `fortnite.fandom.com`. Package-manager/GitHub preset hosts are also allowed.
- `fortnite.weirdgloop.org` is absent from the effective runtime allowlist. A fresh ordinary HTTPS request to `/w/Named_Locations` fails on CONNECT with **403 Forbidden**. `/w/Landmarks` fails the same way.
- Fandom's supplied Chapter 6 page/API returns **402**, body `{"message":"Please contact the site owner for access."}`.
- The supplied Epic Chapter 7 Pacific Break URL returns **403**; the apex-host variant returns `error code: 1010`. These access failures do not establish that the articles lack the requested information.
- Two saved-draft read attempts returned `INVALID_ARGUMENT`: “The current environment draft could not be verified. Retry the read before editing the configuration.” The user's saved settings could not be inspected, and were not overwritten.
- No callable runtime refresh, restart or request-changes operation is available in this task. The read-only environment-status tool cannot apply another configuration revision. No workaround disabling the proxy or TLS checks was used.

This is a running-task policy mismatch, **not another request to add the same domain**. Per the user's instruction, completed work is validated and committed/pushed so a fresh task can use the updated environment.

## Resume without repeating completed work

1. Start a fresh task against latest GitHub `main`, using the updated/published environment configuration. Confirm the effective runtime hosts include `fortnite.weirdgloop.org`, not just the settings UI; retry the mirror directly with normal proxy/TLS settings.
2. Read this file and `docs/PHASE3_QUESTION_QUALITY.md`; preserve all completed changes. Do not rebuild the UI or question engine. `git log -2` identifies the Phase 3 and Phase 4A checkpoints.
3. Retrieve `https://fortnite.weirdgloop.org/w/Named_Locations` and `/w/Landmarks`; preserve the chapter tables and exact season flags. Prioritize the eight original C2 seasons and `REMIX2024` as a separate return period, then the original C6 map and special islands separately. Corroborate table transitions using Epic and map snapshots where possible.
4. Review all eighteen C6S1 launch POIs, including **Foxy Floodgate**, and resolve the existing pending “Fox Floodgate” spelling to the same canonical identity when the source confirms it. Do not manufacture a second POI for a typo.
5. Add only supported `namedPoi`, point appearances and explicit changes/relationships, with provenance. Absence from one snapshot is unknown unless a source establishes removal. Only enable `location-chapter`, original-introduction, return and transition scopes after complete answer-population review, using coverage gating independently of answer minimums.
6. Complete C7S1/Pacific Break and C7S2 maps before enabling an unrestricted whole-Chapter-7 bank. Keep the already verified v41.20–43.00 rows. Do not confuse Crossbones Isle or rotating maps with the original island.
7. Resolve secondary fish effects and exact historical availability from readable descriptions/ability data or reliable historical catalogs. Do not equate Creative catalog season tags with spawn evidence. Complete container taxonomy/contents and Marauder exact drops remain separate pending tasks.
8. Run `npm test`, `npm run audit`, `npm run audit:quality -- --output /tmp/quality.json`, and `npm run build`; update the checkpoint counts before the next commit.

## Validation and deployment

127 tests in 18 files pass. The audit has no errors; TypeScript and production build pass. Tests cover Small Fry's two banks, fish functions/unknown effects, all reviewed restorative attributes, Mythic categories, all thirteen named entries in the selected map snapshot, landmarks, Treasure Hunters separation, canonical deduplication, pending Chapter 2/6 predicates, deterministic daily diversity, scoring and fixed-deadline retries.

Build from GitHub `main` with `npm ci` and `npm run build`; serve `dist`. `build-info.json` includes data version `fortnite-br-items-maps-2026.11.10`, source commit/fingerprint, 612 playable entities, 178 variants and aggregate verification counts. The existing `.openai/hosting.json` project ID is unchanged. The live ChatGPT Site has not been verified updated.
