# Phase 5D addendum — answer clarification

Continues GitHub main `952a03bacc5be7e10afa4e0f3308c0f6fab52ac3`. Implements the uploaded clarification addendum against the latest available checkpoint. The catalog remains the Phase 5C dataset: 17,344 playable entities, 319 normal variants and 166 independent Daily variants. No canonical identities are merged, question populations changed or unreviewed aliases imported.

## Acceptance and clarification

Exact normalized canonical names take priority over explicit aliases. Existing punctuation, case, diacritic and possessive normalization is retained. Missing-space matching can accept an unambiguous canonical/alias spelling, but an official ineligible identity cannot silently become a different spaced name: Fishstick does not automatically become the Fish Stick pickaxe. An alias that names another official identity of the same entity type requires clarification. John Wick does not silently become The Reaper, and Aang does not become Avatar State Aang.

Everything requiring typo correction, reordered words or partial-name interpretation needs a player confirmation. The previous one-edit automatic scoring path is removed. Up to three eligible candidates appear after an unsuccessful submission; the player can confirm a named button, continue typing or dismiss with Keep typing/Escape. Normal autocomplete still fills the input for a subsequent submission. Confirm buttons use native mouse, keyboard and touch activation. Changing input clears the previous clarification; dismissing it also hides the current autocomplete proposals until typing resumes.

Ranking uses exact names, aliases, compact prefixes, token prefixes, bounded substrings and Damerau-style edit distance. Fuzzy proposals require at least four compact characters and allow one edit through length 16, or two for longer names. Fuzzy matching never awards points. Short autocomplete remains suppressed below three characters, and input over 128 normalized characters is not searched. Suggestions always come from the question's frozen eligible IDs.

Examples verified in tests and the [matching report](phase5d-matching-report.json):

| Input | Result when eligible |
| --- | --- |
| Pleasent Park | Confirm Pleasant Park |
| shock wave | Confirm Shockwave Grenade |
| makeshift shotty | Confirm Makeshift Shotgun |
| avatar aang | Select Aang or Avatar State Aang |
| shockwavegrenade | Unambiguous normalized canonical match |
| tac shotty / scar / deagle / minis | Existing curated alias rules, within the active bank |
| drum gun | Exact base identity when eligible; partial variant proposals remain separate |

“Shotty” expansion and the Avatar/Aang query interpretation are suggestion rules, not new verified identity aliases. Ambiguous Mythic owners, cosmetic identities and character-versus-outfit roles remain separate. An invalid but similar name can only lead to a proposal; it cannot score without choosing an eligible canonical answer.

## Deadline, scoring and reports

The original absolute twenty-second deadline is unchanged. Failed submissions, typing, dismissal, report editing and confirmation do not restart or pause it. Confirmation calls the existing validation and rarity-scoring path using the selected canonical name; the deadline and synchronous submission lock are checked again. Late confirmation times out, and repeated clicks cannot score twice. The rarity component and its animation are unchanged.

After failure, Report missing answer opens a local report with question ID/wording, attempted answer, exact matching catalog identities and their eligibility, dataset version, timestamp and optional explanation. It explicitly says nothing is sent. Copy and JSON download are local actions; a clipboard failure leaves selectable text and download available. There is no endpoint, telemetry or additional personal-data collection. The full-catalog exact-name lookup is built only on opening a report, not on keystrokes. Closing a report returns focus and scroll to the answer area; while its extra content scrolls, the live clock stays visible.

## Performance and validation

Normalized exact indexes are cached per stable question bank. Prefix/token and trigram postings are prepared lazily; at most 600 shortlisted entries reach expensive scoring. A broad-bank query does not perform edit distance across the full catalog on every keystroke. Home's deferred catalog loading is preserved.

The [benchmark](phase5d-matching-report.json) measures one cold index/query and 200 warm queries over 11,657 cosmetic entries, including p50/p95 times. It also checks every canonical answer in every normal bank; failures are zero. This run measured 139.69 ms cold, 0.923 ms warm median and 1.540 ms warm p95. Measurements are environment-specific, not a latency guarantee.

All **177 tests across 25 files** pass. The full suite covers typos, punctuation/spaces, aliases, ambiguous variants, distinct cosmetics, ineligible lookalikes, unchanged scoring, repeated failures, duplicate confirmation, reports, timeout and large banks. Source/question-bank, quality and Phase 4B/5A/5B compatibility audits pass. Historical audit reports are preserved using temporary output paths. TypeScript and the production build pass.

Chromium exercises mouse, Tab/Enter and touch confirmation, Escape dismissal, local report copies/downloads, optional explanations, exact canonical points and expiration after repeated submissions while confirmation is pending. The [interaction report](phase5d-browser-smoke.json) records zero page errors/external requests and no overflow. [Mobile clarification](screenshots/phase5d-touch-clarification.png) and [desktop clarification](screenshots/phase5d-mouse-clarification.png) show the retained design. The [layout smoke](phase5d-layout-browser-smoke.json) covers 375, 768, 1280, 1440 and 1920 pixels, seven scored Daily rounds, existing autocomplete, rarity reveals, Unlimited timeout/history and direct entry.

`.openai/hosting.json`, base layout/styles, rarity animation, Daily generation, local stats keys and question data are preserved. The only additional styling belongs to the report and its conditional clock visibility. GitHub delivery is separate from a live ChatGPT Sites publication.

```sh
npm test
npm run audit
npm run audit:quality -- --output /tmp/phase5d-quality.json
npm run audit:phase5d
npm run build
npm run preview -- --port 4173
# In another terminal:
PLAYWRIGHT_MODULE=/path/to/playwright/index.mjs CHROMIUM_PATH=/usr/bin/chromium node scripts/smoke-phase5d.mjs
PLAYWRIGHT_MODULE=/path/to/playwright/index.mjs CHROMIUM_PATH=/usr/bin/chromium node scripts/smoke-phase5d-layout.mjs
```
