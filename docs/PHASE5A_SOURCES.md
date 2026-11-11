# Phase 5A source review

Reviewed November 11, 2026 UTC. Continues the Phase 4B cosmetic snapshot, without reimporting the current live cosmetic catalog. Factual structured records, response fingerprints and source revisions are stored in `src/data/research/phase5a.json`; field proofs link to `src/data/phase5-sources.ts`. No artwork, video, article descriptions or third-party application code is imported.

## Source scopes and decisions

- [Fortnite Wiki named-location tables](https://fortnite.weirdgloop.org/w/Named_Locations): complete positive season cells for Chapter 1 (Athena), Chapter 3 (Artemis), Chapter 4 (Asteria), and Chapter 5 (Helios). Preserves previous Chapter 2/6/7 research and its corrections. Tables record presence at some point in a season, not continuous availability. **Doom’s Courtyard remains a landmark**, following the existing explicit Epic announcement proof over the conflicting community-index row. Original introductions, renames and removals are not inferred from blank/cross cells. OG 2023 and Remix 2024 stay separate throwbacks; neither silently qualifies for Chapter 4/5 island questions. Special-season island identities remain intact.
- [Characters](https://fortnite.weirdgloop.org/w/Characters): only explicit numbered-season Character Collection tables, before Excluded/Removed. 593 documented assignments, 418 canonical identities. Scrapped/planned, Reload-only, excluded and non-collection lists are excluded. This supports collection and chapter membership, not exact spawn windows or first introductions. Familiarity is an editorial estimate; an exact matching reviewed outfit may supply its existing prior.
- [Bosses](https://fortnite.weirdgloop.org/w/Bosses): humanoid and creature AI boss sections only. Player-controlled transformations and separate LTM sections are excluded. An explicitly marked Mythic loot entry qualifies its boss for the Mythic-loot prompt; it does not establish an exact drop table. Plural group headings such as Highcards/Gorgers/Spire Guardians reconcile to canonical singular identities, preserving existing IDs and official aliases. No original introduction or active spawn period is inferred.
- [Assault Weapons](https://fortnite.weirdgloop.org/w/Assault_Weapons), [Shotguns](https://fortnite.weirdgloop.org/w/Shotguns), [Submachine Guns](https://fortnite.weirdgloop.org/w/Submachine_Guns), [Pistols](https://fortnite.weirdgloop.org/w/Pistols), [Sniper Rifles](https://fortnite.weirdgloop.org/w/Sniper_Rifles): explicit BR table identity, ammunition and firing-mode facts. Stop before sections explicitly exclusive to other modes. “Assault Weapons” is an umbrella that includes SMGs/miniguns, so it **does not establish assault-rifle classification**. Existing reviewed classes prevail. Modular prefixes reconcile to the existing canonical weapon name. Automatic requires explicit fully automatic/automatic wording; semiautomatic alone does not qualify. Burst requires explicit burst-fire wording. Table rarity labels never establish a BR Mythic version. Energy Cells are withheld from the ammunition prompt because some blasters use this internally with unlimited player ammunition. No complete rockets bank is claimed.
- [Vaults](https://fortnite.weirdgloop.org/w/Vaults): exact canonical named-POI matches only. A vault does not imply a boss. Boss-column names, including labeled File links where the table uses portrait-only cells, must also match a reviewed AI boss. This supports “has had a vault” / “documented vault boss,” not current locations or a season-specific spawn. No images are fetched.
- [Fortnite-API cosmetic definitions](https://fortnite-api.com/v2/cosmetics/br): supplemental selectable STYLE evidence only, with at least two options. Applied only to already accepted public cosmetic IDs; excludes cinematic/test/NPC definitions. Does not import new or unreleased identities, establish acquisition/release dates, or turn duplicate styles into extra entities. Existing shop, set, series, pass and historical-rarity facts are reused from the frozen Phase 4B bank. Additional set prompts use actual set IDs; set membership never proves bundle membership.

Fortnite Wiki contributors identify their content license as **CC BY-NC-SA 3.0**, with additional terms potentially applying. Attribution, revision URLs and hashes are retained. Fortnite-API publicly offers JSON integration but no blanket open-content redistribution license is claimed; see the earlier [usage review](PHASE4B_SOURCES.md). Structured editorial decisions are original; no commercial-use permission or Epic endorsement is implied.

## Reproduction

Save the public responses as `/tmp/p5-PAGE.html` for the nine wiki pages above and the API response as `/tmp/p5-cosmetics.json`, then run:

```sh
python scripts/research-phase5a.py /tmp
npm run audit:phase5a
npm run audit:quality -- --output docs/phase5a-quality-report.json
```

Compare source revisions and SHA-256 hashes before replacing the snapshot: live pages can change. The extractor uses Python's standard HTML parser and parses JSON as data. It makes no network requests and changes no proxy/TLS configuration. The application uses local compiled data only.

## Still incomplete

Global cross-chapter location identity/return/rename/replacement transitions; exact boss-to-weapon drop histories; complete build-destruction, event-item and rockets populations; exact release dates and historical bundles; broad all-year event rewards; remaining fish secondary effects and spawn windows. These are not enabled merely to reach a target. Existing advanced/Expert gates and bounded Winterfest/bundle prompts remain.
