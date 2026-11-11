# Phase 5B source and relationship review

Reviewed November 10 Pacific / November 11, 2026 UTC. This continues the existing Phase 5A snapshot. No cosmetic, creator or competitive catalog is imported. The game uses local compiled facts; research URLs are not runtime dependencies.

## Provenance and data model

`src/data/research/phase5b.json` stores factual identities, classification decisions, response SHA-256 hashes, wiki revisions, positive season scopes and exclusions. `phase5b-response-manifest.json` preserves the reviewed category/profile URL mappings. `phase5b-mechanics-review.json` records original short editorial explanations of conditional effects. No illustrations, article descriptions or third-party executable JavaScript are redistributed.

Every admitted field has a source proof. The typed graph in `world-relations.ts` separates **carries**, **mythicCarry**, **drops**, **mythicDrop**, **spawnsAt**, **near**, **vaultIn**, **keycard**, **sells**, **offersService**, **faction**, **foodBusinessAt**, **gasStationIn** and **upgradeBenchIn**. Source labels remain in the research snapshot, even when canonical aliases reconcile a name. Missing dates mean unknown, not continuous availability. Original and special BR seasons remain distinguishable; Reload/OG/Creative/LTM acquisition branches do not become ordinary BR drops.

## Bosses, equipment, vaults and guards

The full [AI boss index](https://fortnite.weirdgloop.org/w/Bosses) supplies 152 humanoid/creature encounter rows. Player-controlled transformations are excluded. **Loadout icons alone do not prove a drop.** All 162 linked item profiles were checked; explicit acquisition-history clauses identify a boss and season before a player-obtainable drop is promoted. Prior explicit Epic/reviewed Mythic edges remain in use. Owner fields and possessive names alone are insufficient. NPC-only equipment such as the Spire Guardian's Primal Assault Rifle stays outside the obtainable Mythic bank. Generic “Ranged Weapon” entries do not define a complete random loot pool, so the unrestricted ordinary boss-drop question stays pending.

The older Phase 5A extractor mistook health-icon labels in two animated name headers for a boss identity. That non-identity is now excluded; the actual Darth Vader and Daigo encounters are read from their name headers. Existing Darth Vader IDs are preserved. This is a factual correction; the original raw Phase 5A response record remains available for comparison.

The [vault index](https://fortnite.weirdgloop.org/w/Vaults) and individual acquisition clauses supplement the [Character Collection](https://fortnite.weirdgloop.org/w/Characters) boss-location records, including original Chapter 2 locations. Explicit Boss-column portrait labels are reconciled to canonical boss names. “Deadpool’s Yacht” reconciles to The Yacht. A keycard association does not prove the particular door it opens. Explicitly enumerated Seven Outpost ranges are location names, not guessed spawn counts.

All 83 season guard rows in [Henchmen](https://fortnite.weirdgloop.org/w/Henchmen) and their 62 linked archetype/profile records were reviewed. Impossible Escape-only guards are excluded. Single explicit affiliation fields produce faction edges. Shared pages with multiple affiliations remain unresolved rather than assigning every faction to every variant. Affiliations without dated membership evidence stay undated. The First Order display label is reconciled to its linked First Order Stormtrooper archetype, rather than counted as another guard type.

## World locations and businesses

The island navigation in [Landmarks](https://fortnite.weirdgloop.org/w/Landmarks) explicitly distinguishes landmarks, unnamed places and named POIs. These labels support chapter/island classification, not guessed introductions or uninterrupted season histories. Original chapters, OG/Remix and special islands remain separate in the data. Generic “Minor Unnamed Locations” and unanswerable “???” labels are excluded. The [Motel article](https://fortnite.weirdgloop.org/w/Motel) supplies an explicit Chapter 1 correction to an omission in the navigation index and distinguishes the original location from Reload. No exact Motel introduction season is inferred from that statement.

The [gas-station index](https://fortnite.weirdgloop.org/w/Gas_Station) and [Upgrade Bench](https://fortnite.weirdgloop.org/w/Upgrade_Bench) enumerations retain their season labels. “Near,” “between” and compass-relative sites produce proximity edges, not containment. Reload/Blitz/standalone OG rows are excluded from ordinary BR membership. A listed bench snapshot means it existed at that point; it does not prove every day of that season.

All 90 members of [Companies](https://fortnite.weirdgloop.org/w/Category:Companies) were reviewed for actual food/drink businesses. Thirty-five meet the reviewed factual scope, including restaurants, cafés, groceries and beverage producers. The prompt says **food or drink business**, not exclusively restaurants. The Save the World-only Ballers Pub is excluded. Infobox branch locations join only recognized BR world locations; Party Royale/lore/STW references are not silently promoted. Undated branch relationships remain undated.

## Functions, vehicles and historical availability

[Utility Items](https://fortnite.weirdgloop.org/w/Utility_Items), [Consumables](https://fortnite.weirdgloop.org/w/Consumables), [Explosive Weapons](https://fortnite.weirdgloop.org/w/Explosive_Weapons), [Healing Items](https://fortnite.weirdgloop.org/w/Healing_Items), [Low Gravity](https://fortnite.weirdgloop.org/w/Low_Gravity), [Fire](https://fortnite.weirdgloop.org/w/Fire), [Vehicles](https://fortnite.weirdgloop.org/w/Vehicles) and individual mechanics articles provide positive classifications. Explicit other-mode tails are excluded. A table's category/introduction chapter does not establish continued availability. API catalog dates and asset presence never become BR spawn evidence.

Individual effect review preserves conditions: a connected Grappler protects the following landing; Shadow Stone protection ends with Shadow Form; Jetpacks do not automatically negate falling damage; Impulse Grenades do not grant immunity. Low-gravity protection is derived only for actual documented effects, excluding visual-only immunity entries. Slap stamina regeneration is not automatically a movement-speed increase. Mythic rarity in a Creative/NPC definition does not establish a player-obtainable BR Mythic.

Vehicle seats come from gameplay vehicle tables, never cosmetic car bodies. Canonical All Terrain Kart, The Baller, Whiplash and Bear IDs are retained. Legacy/modern consumable names and foraged/held forms do not become extra canonical answers. Deadpool’s Dual Hand Cannons reconciles to the existing Hand Cannons ID with an official-name alias. Small Fry's new positive Chapter 2 Season 1 presence proof does not promote its unknown first introduction. Thermal Fish's health effect now has explicit healing-table evidence; Cuddle Fish is not invented into a healing fish.

The Utility Items index labels Shockwave Grenade earlier than its retained verified introduction. That earlier availability claim is withheld. Pending legacy introduction guesses cannot invalidate independently verified earlier appearances; the audit now distinguishes pending guesses from verified chronological contradictions. Low Gravity's seasonal column also contains an obvious Mechanical Shockwave Bow chronology conflict, so that table's dates are not used to establish appearances.

Positive structure-damage examples do not cover every ordinary weapon and environmental prop. The broad structure-damage question remains pending. Full vendor inventories, precise intra-season spawn windows and global location transitions likewise remain research gaps rather than silently complete banks.

## Spatial evidence

[The spatial report](phase5b-spatial-research.json) records the Fortnite.gg spawn response hash and a public repository search. The current `window.Spawns` response contains coordinate layers, including fishing-rod/fishing-hole layers. It was parsed as JSON without executing site JavaScript. No reviewed game-build contract, defensible historical POI polygons or candidate-versus-guaranteed spawn definition was found. Therefore **“at least 10 fishing barrels” remains disabled**; coordinates or screenshots alone cannot justify per-location counts.

## Attribution and reproduction

Fortnite Wiki contributors identify their content license as **CC BY-NC-SA 3.0**, with additional terms potentially applying. Attribution, revision links and fingerprints are retained. Fortnite.gg does not grant blanket open-content redistribution permission; see the earlier [source review](PHASE4B_SOURCES.md). No images, full descriptions or executable site code are committed, and no commercial-use permission or Epic endorsement is claimed.

To reproduce extraction, save the listed response pages under their URL page names in a cache directory, preserving percent-encoded profile filenames. The committed response manifest supplies the category/profile mappings when cache index files are absent:

```sh
python scripts/research-phase5b.py /tmp/phase5b-cache
npm run audit:phase5b
npm run audit:quality -- --output docs/phase5b-quality-report.json
```

Use the recorded revisions/hashes when comparing snapshots. Live responses can change. The extractor uses Python's standard HTML parser, performs no network calls and changes no proxy/TLS settings. The one-time baseline capture belongs to starting commit `b4a256f`; it refuses to overwrite that historical report from the expanded checkout.
