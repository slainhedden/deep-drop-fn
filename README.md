# Deep Drop FN

An unofficial, fan-made Fortnite rarity trivia game. Players name one valid answer per round; less obvious answers earn more points.

## Run it

Requires Node 20.19+ or 22.12+; this environment uses Node 24.

```bash
npm install
npm run dev
```

Open the URL Vite prints. Production and verification commands:

```bash
npm run build
npm test
npm run audit
```

## What is implemented

- Mobile-first seven-round Daily Drop modeled after the supplied arcade UI reference
- Responsive app shell with home, daily briefing, game, reveal, results, local leaderboard, stats, and drop calendar screens
- Server-compatible 20-second round model
- One locked answer per round, strict canonical matching, and timeout handling
- Deterministic daily question ordering with a UTC boundary and one local ranked attempt
- Unlimited randomized play
- Local player statistics, streaks, results breakdown, and answer-safe result sharing
- Broad template-generated skin, weapon, named-POI, crossover, healing/shield item, utility, vehicle, and live-event questions
- Curated Fortnite slang, catalog-wide autocomplete, and conservative typo correction
- 3.6-second rarity-drop reveal with six stacked tiers, original pixel bus/diver/glider art, particles, glider landing, reduced-motion support, and a labeled Chapter 1 OG preview
- Composable predicates and advanced multi-condition outfit questions
- Question-specific deterministic baseline rarity on a 100–1000 scale
- Dataset and template audit, unit tests, and production build

No multiplayer server, account authentication, global leaderboards, or observed player-frequency store is included yet. The UI identifies friend matches as in development instead of presenting a mock flow.

## Architecture

```text
src/domain/       shared, game-agnostic contracts
src/engine/       predicates, generation, validation, scoring, session gates
src/data/         curated Fortnite entities, sources, and templates
src/storage/      replaceable local statistics adapter
src/components/   shared visual elements
```

`GeneratedQuestion` stores its template ID, parameters, accepted canonical IDs, and data version. Validation always uses that snapshot. `RoundGate` is the boundary intended to run on an authoritative API when multiplayer and ranked persistence are added.

## Add a question type

1. Add only source-backed entity metadata in `src/data/entities.ts`. Missing metadata must stay missing; do not turn unknown into `false`.
2. Add a `QuestionTemplate` in `src/data/templates.ts` with parameter options, predicates, prompt text, and an explanation.
3. Use stable canonical IDs. Add only verified, unambiguous aliases.
4. Run `npm run audit`. A parameter combination with fewer than five answers is disabled automatically; a template with no viable combinations fails the audit.
5. Add targeted historical or classification tests before enabling the template.

Predicates are deliberately generic. A future Minecraft or Pokémon pack can provide its own entities/templates without changing normalization, generation, session, or scoring modules.

## Update the Fortnite dataset

1. Verify facts against official Epic/Fortnite material and a second reliable catalog where historical context is needed.
2. Add/update the source record in `src/data/sources.ts`, including verification date.
3. Increment `DATA_VERSION`; never silently modify a live competitive snapshot.
4. Update modular entities and retain stable IDs across display-name changes.
5. Run `npm test`, `npm run audit`, and `npm run build`.
6. For a production database import, publish the new version alongside the old one so existing matches continue resolving against their frozen version.

The seed dataset is intentionally compact and curated. Source URLs identify the source collections used, not a claim that one generic page proves every row. Before public competitive deployment, preserve per-field citations in the persistence layer and perform an editorial review against the current Epic archives.

## Scoring

Each entity has a curated familiarity prior representing how likely it is to come to mind—not cosmetic ownership rarity. Within a question's accepted set, priors are normalized into an estimated answer frequency. The inverse-frequency curve produces a deterministic 100–1000 score. The result explicitly says “baseline estimate”; it never fabricates a player percentage.

The engine includes Bayesian smoothing for observed counts. A production service should aggregate only identical template IDs + parameters + accepted-answer snapshots + data versions, freeze the resulting scoring snapshot at match start, and keep historical scores immutable.

## Data and product limitations

- Current full support: Battle Pass outfits; six weapon classes; Chapter 1–2 named POIs; Marvel, Star Wars, anime, and video-game crossovers; healing, shield, and utility items; vehicles; and major live events.
- Partial/framework support: cross-category predicates, daily scheduling, local stats, authoritative round locking.
- Needs curated data before enabling: items, vehicles, bosses/NPCs, events, other cosmetic types, season relationships, and competitive results.
- Multiplayer requires a deployed API, shared persistence, rate limiting, and realtime transport. Global daily ranks require authenticated or abuse-resistant player identity.
- This project contains no Epic artwork and makes no official-affiliation claim.

Fortnite and Epic Games are trademarks of Epic Games, Inc. This project is not endorsed by Epic Games.

## Historical expansion status

The Phase 2 catalog includes reviewed release and launch questions alongside a pending research queue. Unverified historical claims stay out of gameplay until source and coverage review. See [historical data status and verification workflow](docs/HISTORICAL_DATA.md) for catalog counts, disabled families, chronology semantics, research blockers and audit details.

The [historical activation continuation](docs/HISTORICAL_ACTIVATION.md) records the historical review baseline: 38 enabled templates, 162 playable variants, 495 playable answers, source coverage and outstanding verification gaps.

## Answer-bank diagnostics and deployment

Broad classifications now use field-level eligibility, and autocomplete searches only the current question’s accepted bank. See [answer-bank and deployment instructions](docs/ANSWER_BANK_AND_DEPLOYMENT.md) for counts, the developer inspector, version diagnostics and redeployment steps. Use `npm run package:site` to prepare the latest static and source archives.


### Phase 3 question quality

Daily Drop now favors accessible banks: five of seven rounds target 20+ accepted answers, with distinct knowledge topics. Narrow history remains in practice. Invalid or ambiguous answers can be retried within the original 20-second deadline. Suggestions require three characters and remain question-specific.

Run `npm run audit:quality -- --output /tmp/question-quality.json` for every active question's accessibility assessment, verified versus legacy counts, distribution, practice/daily eligibility and research gaps. See [Phase 3 results and source limitations](docs/PHASE3_QUESTION_QUALITY.md). Gameplay design, scoring and Sites project configuration are preserved.
