# Phase 2 historical catalog: implemented scope and verification gaps

This document records the pre-continuation baseline. Current field-level eligibility and deployment behavior are documented in [answer-bank fixes](ANSWER_BANK_AND_DEPLOYMENT.md). See [historical activation continuation](HISTORICAL_ACTIVATION.md) for current counts, additional sources, activated templates and remaining access gaps.

The history model, modular catalog, reviewed launch questions, source provenance, matching safeguards, game diversity and audit are implemented. Official Epic articles became accessible after the environment allowlist update. Wiki requests still fail (Fortnite Wiki CONNECT 403; Fandom 402), and several old Epic pages return only a title or 404. **This is a substantial playable expansion, not a complete independently verified history of Fortnite.** Unreviewed content stays pending.

## Current counts

| Category | All records, including pending |
| --- | ---: |
| Outfits | 339 |
| Weapons | 181 |
| Locations, including landmarks | 182 |
| Crossover characters | 43 |
| Items | 98 |
| Vehicles | 26 |
| Live events | 19 |
| Bosses | 41 |
| Friendly NPCs | 3 |
| **Total** | **932** |

There are 664 records beyond the original tracked catalog of 268, including the partial historical additions already in the working tree when this implementation began. Actual gameplay now has **472 distinct accepted entities, 204 more than the original catalog**. There are 293 entities with individually reviewed claims, 199 retaining legacy classifications, and 440 pending candidates. A reviewed entity can still have pending timeline fields; its verification status never bulk-promotes those fields.

The bank contains **96 templates: 30 enabled and 66 pending**. The deduplicated playable pool has **153 variants** and **2,646 answer/question combinations**. Questions have 5–123 accepted answers (median 12). Twenty of the enabled templates use newly reviewed source scopes; ten retain or extend the original gameplay families. The original nine-template bank therefore has a net expansion of 87 implemented templates, but the goal of 30 *new enabled* historical families is not yet met. Unsupported parameter combinations remain disabled. No short bank is padded to meet five answers.

The 150-variant target is met for the total playable pool; this includes retained legacy questions. It is not a claim that every original classification has been independently reverified. Family variants with identical accepted answer sets are removed before counting; game selection also avoids repeated prompts and near-identical sets.

## POI history coverage

These are named-POI appearance assignments, not unique introduction counts. A location can appear in multiple chapters. OG2023 is Chapter 4's OG season and Remix2024 belongs to Chapter 5. Chapter 7 includes the documented 2026 Treasure Hunters special season. Pending assignments are research candidates, not verified facts.

| Chapter | Reviewed appearance assignments | Pending assignments |
| --- | ---: | ---: |
| 1 | 8 | 30 |
| 2 | 0 | 38 |
| 3 | 11 | 23 |
| 4 | 17 | 22 |
| 5 | 3 | 33 |
| 6 | 0 | 17 |
| 7 | 1 | 0 |

Some new locations have verified existence but unknown official map-label status and are deliberately excluded from named-POI totals and questions. Doom’s Courtyard and Fractured Four are explicitly landmarks in Epic’s Absolute Doom article. Broad chapter-wide location questions remain pending rather than using the old, imprecise `facts.chapters` arrays.

## Reviewed playable scopes

- Complete eight-outfit Battle Pass lineups for all four Chapter 3 seasons and all four Chapter 4 seasons, plus the full Absolute Doom pass. Release-range questions stay inside completely reviewed season blocks. The four OG Pass outfits are distinct from Battle Pass acquisition and included only when wording includes the OG Pass.
- Explicit new, unvaulted and carryover weapon lists in the Flipped, Resistance, Vibin’, Paradise, Chapter 4, MEGA, Wilds, Last Resort and Absolute Doom announcements. Questions distinguish introduction from actual season appearances, first introduction from unvaulting, and the intersection of two launch pools from a continuous availability span.
- Weapon classes, inclusive launch-introduction ranges, Exotic loot, named historical Mythic vault weapons, and documented Mythic-source POIs.
- Named POIs actually discussed in reviewed launch overviews; classic POIs described in original Season 8, Season 9 and OG announcements.
- OG vehicle and gear returns, documented mobility functions, and five bosses described as special-weapon sources. Friendly Characters such as Guaco are separate NPC records, not bosses.
- Partial contemporary additions from the official Showdown, Runners, Override and Treasure Hunters announcements and the Shattered event announcement. Incomplete modern pass lineups do not enable full-pass questions. Shop arrivals after the verification date are not promoted.

Claims currently reference 18 reviewed Epic articles, with exact URLs and the review date in `src/data/reviewed-announcements.ts`. The primary launch corpus includes:

- [Flipped](https://www.fortnite.com/news/whats-new-in-fortnite-battle-royale-chapter-3-season-1-flipped), [Resistance](https://www.fortnite.com/news/whats-new-in-fortnite-battle-royale-chapter-3-season-2-resistance), [Vibin’](https://www.fortnite.com/news/whats-new-in-fortnite-battle-royale-chapter-3-season-3-vibin), [Paradise](https://www.fortnite.com/news/whats-new-in-fortnite-battle-royale-chapter-3-season-4-paradise).
- [Chapter 4 Season 1](https://www.fortnite.com/news/welcome-to-fortnite-battle-royale-chapter-4-season-1), [MEGA](https://www.fortnite.com/news/whats-new-in-fortnite-battle-royale-chapter-4-season-2-mega), [Wilds](https://www.fortnite.com/news/whats-new-in-fortnite-battle-royale-chapter-4-season-3-wilds), [Last Resort](https://www.fortnite.com/news/whats-new-in-fortnite-battle-royale-chapter-4-season-4-last-resort).
- [Absolute Doom](https://www.fortnite.com/news/be-a-marvel-hero-in-fortnite-battle-royale-chapter-5-season-4-absolute-doom), [OG rollout](https://www.fortnite.com/news/fortnite-og-drop-back-into-battle-royale-chapter-1), [OG Pass](https://www.fortnite.com/news/run-it-back-with-the-og-pass-and-og-shop-in-fortnite-battle-royale).

An article naming a weapon in a balance paragraph does not prove it was available: Heavy Sniper Rifle’s Paradise balance mention does not place it in the Paradise loot pool. A first-release claim is never inferred from an ordinary later appearance.

## Data organization and contracts

`src/data/entities.ts` remains the public facade. Original IDs and familiarity priors are preserved. The `base-*.ts` files retain the original rows by category; category files hold research candidates. `history-seeds.ts` holds pending timelines and relationships. `reviewed.ts` applies individual reviewed claims, `reviewed-announcements.ts` records explicit article sections, and `reviewed-templates.ts` defines bounded playable scopes. Recall priors are editorial estimates, never cosmetic ownership rarity or measured answer frequencies.

The ordered season registry supports inclusive chronological comparison, unknown-ID rejection and reversed-range rejection. It contains numbered seasons through Chapter 7 Season 4 plus OG2023, REMIX2024 and the named Treasure Hunters 2026 special. **It is not a complete calendar of every parallel OG season or intermediate mini-season.** Registry length must not be treated as elapsed time. Other exceptional seasons need exact ordering and provenance before being added.

Introduction, availability and changes are separate. Appearance periods can be disjoint and mean presence at some point during each listed season, not uninterrupted availability throughout it. Introduction snapshots do not imply future appearances. Missing records mean unknown, not proven absence. Named-POI queries require the appearance’s `namedPoi` flag, so a later landmark does not qualify as a named POI.

Removal, vaulting, replacement, renaming, destruction and transformation are distinct change kinds. Condo Canyon becoming Cloudy Condos is a reviewed rename, not a live-event destruction. Tilted’s reviewed original introduction and later OG return do not promote its still-pending destruction claim. Event effects are derived from location records through `eventLocationChanges`, rather than duplicated in event rows. Boss drop relationships can qualify a Mythic version without creating a canonical answer for every generic rarity variant.

`factEvidence` gates individually reviewed classification fields; history evidence gates introductions, appearances, changes, flags and relationships separately. Pending entities are excluded from production answers and autocomplete. `includePending` is only for research diagnostics and tests. The audit rejects verified evidence citing unreviewed or undated sources. Existing legacy source dates are inherited metadata, not a claim that their pages were retrieved again.

Shared aliases are reported rather than rejected as dataset errors. “Dusty” needs one possible referent in the question context; “dub” distinguishes the named Exotic from the generic Double Barrel nickname. Normalization handles punctuation and apostrophes. Name caches and input bounds keep autocomplete and conservative typo correction efficient without relaxing the second-best ambiguity margin.

Daily generation is deterministic and favors fresh categories and families. It never cycles a narrow pool to fill a session. The standard seven-round daily game still has seven distinct questions/categories. UI structure, animations, storage, round gates and the 100–1000 estimated rarity calculation remain intact; the only UI adjustment adds icons for the new boss/NPC category names.

## Remaining verification work

The research queue has 440 pending entities and 420 missing introduction/availability fields. Many non-missing fields are also pending. The broad historical families remain disabled until both facts and answer-bank scope are complete, even if five candidates happen to match. Important gaps include Chapter 2 and Chapter 6 POI history, full availability periods, within-season map updates, live-event destruction, biomes, short original lifetimes, secret outfits, flight-capable vehicles and exact vault/unvault histories.

Continue with accessible primary archives or restored wiki access, attach exact article-level citations to each claim, and review coverage before enabling a family. Do not bulk-flip pending statuses, infer absence from missing data, or invent intervening season ranges. Five answers alone never establish a complete answer bank.

## Validation

Run `npm test`, `npm run audit` and `npm run build`. The current validation passes 62 tests in 12 files, the standalone audit with no structural errors, and the TypeScript/Vite production build. Tests cover chronology, inclusive boundaries, disjoint periods, introductions versus returns, map-change distinctions, event relationships, aliases, duplicate IDs, evidence gates, source provenance, exact pass lineups, deterministic variety, answer acceptance/rejection, scoring bounds and explanations. Passing these checks does not verify pending research candidates.

`auditQuestionBank()` exposes entity and playable-answer counts, template/variant counts, total answer/question combinations, answer minimum/maximum/median, each disabled combination with eligible/candidate counts and its reason, missing-field diagnostics, ambiguous aliases, source coverage and chapter coverage. `npm run audit` prints a readable summary. Pending content and retained legacy classifications are reported separately from newly reviewed evidence.
