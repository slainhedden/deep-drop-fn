# Phase 4B source and import review

Reviewed November 9, 2026 Pacific time / November 10 UTC. This phase imports factual metadata, not artwork, videos, cosmetic descriptions, or third-party application code.

## Sources and usage review

- **Fortnite-API** (`https://fortnite-api.com/`, `/v2/cosmetics/br`, `/v2/shop`): its homepage explicitly offers free JSON integration and identifies the service as non-official and not endorsed by Epic. The cosmetic endpoint includes unreleased files. Its `added` field is an API-catalog timestamp, not a release date. The homepage retains an all-rights-reserved notice; `/terms` returned 404, so no open-content license or blanket redistribution permission is claimed. Only selected factual identity/type/rarity/set/introduction fields and explicit offer membership are included, with attribution and response fingerprints. No image assets or descriptive prose are copied.
- **Fortnite.GG** (`https://fortnite.gg/cosmetics`, `/data/items/all.en.js`, `/legal/terms`): reviewed its source classifications and last-shop filter semantics. Its terms reserve rights in content/software and do not provide an open-content license. The importer extracts selected factual identity, acquisition and observed-shop information; it does not redistribute or execute the site's JavaScript application, download images, or copy its interface. Source classifications alone never prove an Item Shop appearance: an observed shop date or explicit shop offer is required. The external `unreleased` tag is excluded. The reviewed data labels shop=1, Battle Pass=3 and OG Pass=8; independently verified curated OG Pass records override the broad pass grouping.
- **Fortnite Wiki / Weird Gloop**: factual gameplay classifications and year-bounded event reward lists are attributed to Fortnite Wiki contributors. The site identifies its content license as **CC BY-NC-SA 3.0**; additional terms may apply. Individual URLs, revisions and response hashes are recorded. This phase records item/container names and original structured classification decisions rather than reproducing article prose or illustrations. Existing earlier-phase source excerpts are preserved with their provenance.
- **Existing Epic announcements and archived patch notes**: retained field-level proofs remain in use. They establish the specific functions or release scopes they actually describe; a name in a vault list is not automatically a first-introduction or boss-drop claim.

Source reliability is field-specific. Neither a game-file catalog nor an API introduction tag proves an exact release date, shop appearance, historical spawn window, or bundle relationship. API series capitalization is normalized (`MARVEL SERIES` → `Marvel Series`, for example), without changing the classification.

## Reproduction and provenance

`docs/phase4b-cosmetic-import.json` records response SHA-256 hashes, source counts, duplicate reconciliation, withheld conflicting groups and excluded records. The public endpoints can change, so reproducing the exact snapshot requires saved responses with those hashes. Raw third-party JavaScript and image files are not committed.

```bash
curl -fsSL https://fortnite-api.com/v2/cosmetics/br -o /tmp/cosmetics.json
curl -fsSL https://fortnite.gg/data/items/all.en.js -o /tmp/gg-items.js
curl -fsSL https://fortnite-api.com/v2/shop -o /tmp/shop.json
node scripts/import-cosmetics.mjs /tmp/cosmetics.json /tmp/gg-items.js /tmp/shop.json
```

The importer is pinned to the November 10 UTC shop snapshot and refuses a different shop date. Update source IDs and the data version deliberately for a new snapshot. Remote data is parsed as JSON-compatible data, never evaluated as JavaScript. Normal proxy and TLS settings are retained.

The preprocessing output is `src/data/cosmetics/catalog.json`. Outfit rows reconcile against existing canonical skin IDs. New records use stable external IDs. Same-named cosmetics of different types remain separate identities; cosmetic styles and duplicate cinematic definitions do not become extra answers. Conflicting same-name records are withheld instead of guessed. Broad multi-type prompts count a shared display name once so the name remains unambiguous in that question.

Memberships are typed `set` or `bundle`, with individual source IDs. Set membership comes from explicit catalog fields. Bundle membership comes exclusively from the named offer's `brItems`. Sharing a set never establishes a bundle. The bundle prompt is bounded to the captured shop; it is not a claim to cover all historical bundles.

`src/data/research/phase4b-gameplay.json` retains reviewed container identities, aliases, exclusions, function claims and Winterfest reward lists, with source revisions/hashes. Equipment caches are distinguished from chests. Freezer/Ice Machine and Seven Chest/Seven Supply Chest are aliases. Mothership loot-tier upgrades remain one container identity. Rare Chests remain distinct because their gameplay/audio/loot distinction is documented. Pure reskins, environmental sources, Blitz/Horde Rush objects, and a chest that drops no loot are not padded into the core BR loot-container bank.

The explicit update registry preserves patch-specific answer sets while displaying a verified chapter/season and update date. The cosmetic-season registry separately maps catalog tags to actual season identities: Chapter 2 Remix remains a throwback, catalog Chapter 6 tags 3–6 map to Galactic Battle / Super / Shock 'N Awesome / The Simpsons, and Chapter 7 tag 5 maps to Treasure Hunters. Throwbacks do not silently qualify for original-chapter Battle Pass questions. Unmapped tags remain unknown.

Only Winterfest 2021 and 2022 present lists are approved for the new reward prompt. Holiday-themed Item Shop cosmetics are not treated as rewards. Exact general release dates, all-year holiday rewards, complete historical bundle membership, and unresolved external identity conflicts remain open research.
