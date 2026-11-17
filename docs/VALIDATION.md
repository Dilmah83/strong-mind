# V2 validation record

Date: 2026-11-17. Baseline repository main: `5877a80`.

## Automated checks

- `npm run check`: syntax checks for application, optional proxy, build/research scripts and JavaScript tests.
- `npm run build`: produces the complete Render-ready `dist/` tree with manifest, icons, all offline modules and source-attributed food datasets.
- `npm test`: original tests plus V2 tests. Covers exact original programme endpoints, migrations from ZIP/V1 formats, 26 fields, sign-off requirements, quote stability around leap/DST boundaries, fractional and metric/imperial conversions, food-specific density and portions, recipe yields and partial nutrients, backup round-trip/corruption/quota/conflicts, provider units/errors/caching, offline worker responses, source coverage and optional proxy privacy.
- Quote research check: all 100 exact excerpts match the cited book/section in downloaded public-domain George Long texts, with whitespace normalisation only. `MARCUS_SOURCE=/tmp/marcus.txt EPICTETUS_SOURCE=/tmp/enchiridion/text/EN_long.txt node scripts/verify-quotes.mjs` passed. The normal build/test does not depend on those temporary research files.

## Browser QA

`python test/browser-smoke.py` uses the environment’s installed Chromium through Python Playwright. It exercises actual pages/forms/service workers, not a DOM mock. Checks:

- Layouts at 320, 375, 390, 430 and 1,280 px; no horizontal document overflow on primary screens.
- Published milk density: 250 mL → 257.5 g; measured peanut-butter tablespoons remembered on subsequent use.
- Recipe ingredient addition, save/reload and logging controls.
- Journal autosave, sign-off requirements, editing resets sign-off, quote selection/favourites/reflection persistence.
- Story filters, quote archive and primary navigation.
- Offline cold reload with the FSANZ library, quote, stories and journal edits available.
- Browser-level V1 migration preserving food-history snapshots and an untouched original copy; corrupt records stay intact and saving is blocked.
- No uncaught page errors.

Provider responses in the deterministic browser suite are synthetic test fixtures. Separate live connectivity checks returned Open Food Facts barcode `9300652010794` (Weet-Bix) and 24 USDA results for “chicken breast”. Initial Node/browser attempts failed because this workspace’s intercepted HTTPS certificate was not trusted. A **separate test-only browser context** with certificate-error override allowed live requests. No TLS checks are disabled in application or proxy code. Curl also retrieved both provider responses during research. Source availability, browser policy and rate limits can change.

## Remaining verification

No physical iPhone or Safari test was performed. Verify Safari standalone install, VoiceOver/text enlargement, Home Screen launch, iOS storage behaviour and an offline relaunch on the user’s device. External audio/catalogue URLs were preserved; individual episode availability and subscriptions were not exhaustively verified. Restaurant/brand shortcuts do not guarantee coverage. Actual Render service deployment/status was not accessible through this repository task; configuration is ready for its existing static site.
