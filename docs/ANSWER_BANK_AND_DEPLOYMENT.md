> Historical answer-bank publication baseline. See [Phase 3](PHASE3_QUESTION_QUALITY.md) for current counts, three-character autocomplete and retry behavior.

# Answer bank, autocomplete and deployment fixes

The latest working source has 938 records, **496 active playable entities**, 38 enabled templates and **162 playable variants**. Dataset version: `fortnite-br-classification-2026.11.6`. This report supersedes the eligibility rules and current counts in the earlier historical checkpoints; those remain useful records of prior research.

## Eligibility and completeness

Generic questions evaluate only their requested classification fields. They do not require an introduction date, current availability or a complete historical record. A `weaponClass` claim with verified evidence qualifies even when the entity's overall research status and introduction remain pending. Explicit pending or missing classification evidence does not qualify. Original legacy classifications remain compatible and are identified separately in the inspector and diagnostics; they are not relabeled as newly reviewed facts.

The broad weapon-class question has no maximum-answer cap. It examines the whole imported weapon bank and deduplicates canonical IDs. Vaulted weapons and named Mythics qualify whenever their class qualifies. Historical questions still require their specific verified timeline predicates and approved coverage scopes. No pending timeline field was promoted by this fix.

The original Git commit contains **18** assault-rifle rows. At the start of this fix, the expanded working tree accepted **26** rifles: 22 with explicit reviewed classification evidence and four retained legacy classifications. Scoped Assault Rifle now contributes another independently reviewed classification, giving **23 field-verified rifles, all accepted**, plus four legacy entries, for **27 accepted**. Its existing introduction claim remains pending. Epic's [v4.4 Battle Royale notes](https://www.fortnite.com/patch-notes/v4-4) explicitly rename Assault Rifle with Scope to Scoped Assault Rifle; this does not establish its first season.

Seven other rifle-class candidates in the database still lack reviewed classification evidence. They are visible in the inspector with the exact missing-verification reason. Their names or proposed historical metadata were not used to bulk-promote them. This is complete acceptance of the qualifying database classifications, not a claim to have verified every assault rifle in Fortnite history.

| Broad question | Explicit field-verified | Accepted, including retained legacy |
| --- | ---: | ---: |
| Assault rifles | 23 | 27 |
| Shotguns | 23 | 29 |
| SMGs | 16 | 18 |
| Sniper rifles | 10 | 13 |
| Pistols | 15 | 18 |
| Explosives | 9 | 13 |
| Named POIs in the catalog | 45 | 76 |
| Battle Pass outfits | 84 | 123 |
| Health items | 12 | 22 |
| Shield items | 7 | 16 |
| Health-and-shield items | 7 | 10 |
| Utility items | 30 | 34 |
| Vehicles | 16 | 21 |
| Live events | 1 | 15 |
| Marvel crossover characters | 0 | 12 |
| Star Wars crossover characters | 0 | 10 |
| Anime crossover characters | 0 | 9 |
| Video-game crossover characters | 0 | 12 |

The crossover rows are retained original curation, not new independent source verification. A marksman-rifle combination remains below the existing five-answer minimum and is disabled. Player labels now say “eligible answers” so retained legacy classifications are not presented as newly source-verified.

## Autocomplete and matching

The game passes the active question snapshot to autocomplete. Suggestions and validation share the same deduplicated canonical-ID bank. Changing to another weapon question refreshes suggestions even when `answerType` stays the same. A selected canonical suggestion is accepted by validation.

Ranking is exact matches, exact prefixes, matching word prefixes, meaningful substrings (at least three characters), then conservative fuzzy matches (at least four characters). The limit is six, and empty/one-character input produces no suggestions. Familiarity does not override textual relevance. Prefix matches for “str”, “hav” and “tac” show all eligible matches up to the limit, with no unrelated type-wide fallback.

Canonical names take priority over another entity's contextual nickname. Shared nicknames still require unambiguous question context. Existing slang such as scar, tac ar, pump, spas, heavy sniper and deagle is retained. Exact word-token reordering is accepted only when it identifies one entity; fuzzy correction retains the second-best ambiguity margin.

## Developer-only inspector

The inspector is a local Node CLI, not a player-facing route or component. It is not included in the static deployment.

```bash
# List every active question and count.
npm run inspect:answers

# Inspect a complete answer bank, qualifications, aliases, relevant evidence and exclusions.
npm run inspect:answers -- --template weapon-class --params '{"weaponClass":"assault rifle"}'

# Filter displayed rows while retaining the full-bank counts.
npm run inspect:answers -- --template weapon-class --params '{"weaponClass":"assault rifle"}' --search scoped

# Inspect an unsupported historical scope and its coverage reason.
npm run inspect:answers -- --template vehicle-introduced-chapter --params '{"chapter":2}'

# Export detailed inspections of all active variants. Pending scopes can be inspected individually.
npm run inspect:answers -- --all --output /tmp/deep-drop-answer-banks.json

# Current source fingerprint, Git state, data version and broad-bank counts.
npm run diagnostics
```

Each detailed inspection includes the exact prompt, template and question IDs, parameters, data version, accepted count, all accepted canonical entities, aliases, predicate assessments, verified facts, excluded entities and exact exclusion reasons. A disabled question separately reports coverage restrictions and minimum-answer failures. Parameters are validated rather than silently ignored.

## Repository and deployment findings

Before publication, local `work` and GitHub `main` pointed to the original import commit `c932130917bc34cfe93994810b5b5c11647e9174`; all expansion and fixes were uncommitted. This publication moves the complete implementation onto `main` with a normal fast-forward push. Verify the published commit with `git ls-remote origin refs/heads/main` and the build's `sourceCommit`.

The user confirmed that the public Site's `/build-info.json` returned the game rather than JSON. That means the endpoint is falling back to the SPA instead of serving the new metadata; it does not identify the exact deployed commit. This environment's network proxy blocks the public Site, so live publication must be verified in the user's browser.

`.openai/hosting.json` already binds the project and sets the static directory to **`dist`**. Its project ID and the product design were preserved. The source archive includes that existing configuration.

`npm run build` first generates provenance, then runs TypeScript and Vite. The resulting `dist/build-info.json` contains the data version, source commit and branch when available, a dirty-worktree flag, a SHA-256 fingerprint of app/tooling source, build ID, and playable/count diagnostics. It contains no answer lists or exclusion inspector. There is no production diagnostic UI; the JSON is safe build metadata for checking an actual deployed snapshot.

An unchanged source commit is not falsely presented as containing the working edits: dirty builds include both `dirty: true` and a distinct source fingerprint. A rebuild from an imported archive without Git reports no Git commit. The content fingerprint identifies the source independently of whether it was imported as a dirty snapshot or later committed.

## Rebuild and package

Node 24 is tested. Vite's supported Node versions are required (20.19+ or 22.12+). Packaging additionally uses Python 3, available in this cloud environment; normal application builds do not require Python.

```bash
npm ci
npm test
npm run audit
npm run build
npm run package:site
```

Packaging performs a fresh build and checks that its source fingerprint still matches the working source. It creates:

- `artifacts/deep-drop-fn-static-<fingerprint>.zip`: the contents of `dist`, ready for a static host.
- `artifacts/deep-drop-fn-source-<fingerprint>.tar.gz`: source, lockfile, developer scripts, docs and existing hosting configuration, including uncommitted working changes.
- `artifacts/SHA256SUMS`: checksums for both archives.

The source archive excludes Git history, dependencies, build outputs, environment files and local generated state. A `SOURCE_MANIFEST.json` records the snapshot's provenance. The static archive excludes developer inspector code/scripts and all source documentation.

## Updating the existing ChatGPT Site

**The existing Site has not been confirmed updated.** There is no publishing tool attached to this task. Use the Site's source import/build/publish workflow; rebuilding this workspace alone does not replace a previously imported snapshot.

For the existing GitHub-backed Site, update the source snapshot from **`slainhedden/deep-drop-fn`, branch `main`** after the publication push. Do this in the original Site's editing/project context so the existing project binding and URL are retained. A GitHub push alone does not establish that Sites refreshed an imported snapshot.

Use the Site's existing source import/refresh workflow to fetch the latest `main`, rather than resuming an old imported source tree. If the workflow does not expose source refresh, ask the Site editor to import the current GitHub `main` into this existing project. Keep `.openai/hosting.json` and its existing project ID. Confirm the imported commit equals GitHub `main` before building.

Use these build settings:

```bash
npm ci
npm run build
```

Serve **`dist`**, including its `assets` directory and **`build-info.json`**, then publish the updated build to the existing Site. Run `npm run build`, not bare `vite build`, because the npm script generates the metadata first. If the workflow supports source-archive import instead, use a freshly generated source archive; if it supports static upload, upload the contents of the fresh static ZIP. Exact Sites control labels are not available in this environment; these are the required source/build/publish operations, not assumed button names.

After publishing, request the Site's actual `/build-info.json` and compare **`sourceFingerprint`**, `dataVersion`, `playableEntities: 496`, `questionVariants: 162`, and the 27-rifle broad count against the prepared artifact. Require parseable JSON with the expected fields; an HTTP 200 returning the SPA HTML is not proof. The source commit/dirty fields may legitimately change after committing identical source; the content fingerprint should stay the same.

The current source archive and static ZIP contain the latest working code, but their creation is not evidence that the remote Site was republished.

## Validation

- 99 tests in 15 files passed, including all field-verified broad classifications, pending-history eligibility, vaulted and Mythic weapons, valid-only suggestions, same-type question switching, canonical submission, slang, word ordering, fuzzy ambiguity, ranking, duplicate-ID scoring, deterministic Daily Drop and UI regression tests.
- Standalone audit passed with no structural errors.
- TypeScript and production build passed.
- All 162 active question inspections were exported and checked against the generated count metadata.
- Packaged production HTTP/asset/metadata checks and archive checksums are recorded in the final handoff; no live Sites update is implied.
