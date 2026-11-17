# Strong Mind V2

A complete local-first, installable Progressive Web App for a deliberate daily practice. Outdoor/stoic visual design, original 30-day programme, 100 sourced quotes, 20 researched success stories, Australian nutrition reference data, flexible portions and reusable recipes. No accounts or cloud synchronisation; private journals and nutrition history remain in the browser.

## Build, run and test

Node.js 22+ (CI uses 24). No runtime or build dependencies are required; a lockfile is included.

```sh
npm ci
npm run check && npm run build && npm test
npm start
```

Open `http://localhost:3000`. `PORT` changes the local port. Build output is `dist/`. `npm run check` checks all application, proxy, build and test JavaScript. `npm test` runs the original domain tests and V2 migration, persistence, unit, recipe, food API, offline cache and proxy tests. No private credentials are used by these tests.

Optional browser smoke suite (Chromium, not physical iPhone/Safari):

```sh
# Requires Python playwright and a local Chromium, separate QA-only dependencies.
PORT=4173 npm start
# In another terminal:
python test/browser-smoke.py
```

`TEST_BASE_URL` and `CHROMIUM_PATH` override defaults. To install the optional runner where absent: `python -m pip install playwright`, then use your installed Chromium or `python -m playwright install chromium` and set `CHROMIUM_PATH`. This is not needed for Render or normal validation. The suite tests 320/375/390/430/1280 px widths, food portions, journal/checklist persistence, recipe saving, quote favourites, offline cold loads, V1 migration and corrupt-record protection. Deterministic provider responses are stubbed in browser tests; live API checks are reported separately.

## Deploy on the existing Render Static Site

Use the existing `Dilmah83/strong-mind` repository; branch **main**. Do not create another repository or change origins unnecessarily.

- Build command: `npm run check && npm run build && npm test`
- Publish directory: `dist`
- Root directory: blank
- Environment variables: none for the static app
- Node: 22 or newer (24 recommended)

`render.yaml` is a ready-to-use static-site Blueprint. Hash routes require no SPA rewrite. The source and PNG icons/manifest are included. Render provides HTTPS, which is required for PWA installation and service workers. Existing auto-deploy can deploy new main commits; otherwise use **Manual Deploy → Deploy latest commit** in the existing service. Actual Render deployment/access is not controlled by this repository task.

## Install/update on iPhone

Open the HTTPS Render URL in Safari → Share → Add to Home Screen → Open as Web App → Add. Launch online once and wait for the “Offline library prepared” notice before using offline. Physical iPhone and Safari install QA must still be performed; Chromium viewport tests are not equivalent.

Service-worker assets use one versioned release cache, so a running app does not mix old and new modules/data. New versions install in the background and wait for old windows to close. **Close every Strong Mind window and reopen** to activate the new release. Bump `CACHE` in `public/sw.js` when changing shell assets. User records are separate from the disposable shell/API caches and are not deleted by a service-worker update.

## Implemented

- Outdoor forest/olive/sandstone/charcoal/bronze interface with original mountain, forest and contour artwork, responsive cards, one-hand bottom navigation, reduced-motion support and native accessible forms.
- Original 30-day programme content and existing audio URLs preserved. Calm 10 min, audio 35 min, practical action 10 min, reflection 5 min. Saved checklists, mood ratings, timestamped sign-offs and journals; editing a signed day clears its sign-off. Added YouTube links are labelled searches.
- 100 source-matched public-domain excerpts from Marcus Aurelius and Epictetus, work/book/section references, original practical interpretations, challenges/questions, deterministic local-calendar-date selection, reflection checkbox, favourites and 30-day archive. Optional, not part of required programme completion.
- 20 short researched success stories with all seven filters, daily feature, challenge/actions/outcome/lesson/application and direct evidence links. First-person claims are distinguished from institutional records. Optional five-minute reading/listening/reflection.
- 1,588 official FSANZ AFCD Release 3 Australian food records offline; 38 Australian-listed Open Food Facts label snapshots, plus the original 36 generic estimates retained for compatibility. Raw/cooked foods remain distinct. Source IDs, derivation/confidence and nutrient conventions are visible.
- Live Australian-filtered Open Food Facts brand/product search and barcode lookup; USDA FoodData Central search with public demo access or optional secure proxy. Brand/retailer and restaurant shortcuts, source/menu links, spelling aliases, recent foods, favourites, custom foods and duplicate barcode detection. No promise that every brand/product is available.
- Six editable multi-ingredient example meals plus a recipe workshop. Save complete meals, set measured finished yield and log any portion. Partial micronutrients are marked; missing values are never replaced with invented zeroes.
- Grams, kilograms, millilitres, litres, ounces, US fluid ounces, Australian cups/tablespoons, teaspoons, pieces, slices, scoops, servings, packets, containers, bottles and custom measures. Decimal/fraction quantities, live nutrient preview, saved food-specific portions/density and canonical gram snapshots.
- All 26 existing nutrition fields/goals, daily meal/date history, deletion undo, calorie/protein/micronutrient home summary, completion/streak/mood charts and accessible numeric nutrition tables.
- Local persistence, validated backups/import, previous-copy restoration, untouched pre-V2 migration backup, quota/error handling, corrupt-record protection and concurrent-window conflict detection. No private-data transmission or telemetry.

## Food APIs and credentials

**Open Food Facts:** no API key. Text requests are sent only on Search; barcode lookup uses v2. Results are cached locally (up to 15 searches, 24 h fresh; older results usable offline or on errors). Offline library, saved foods and manual labels remain available on timeouts/rate limits/no matches. Community label records require user verification. No scraped commercial menu dataset or invented restaurant nutrition.

**USDA:** the static app works with the official public `DEMO_KEY` (30 requests/IP/hour, 50/IP/day). This key is explicitly public and intended for initial testing. Do **not** put a private key in the browser. For greater capacity deploy the supplied optional proxy as a separate Render Node service using `render-proxy.yaml`:

1. Set `USDA_API_KEY` as a Render secret and `ALLOWED_ORIGINS` to your exact static-site origin (comma-separated if needed).
2. Build `npm ci`; start `node proxy-server.mjs`; health path `/health`.
3. In app Settings enter `https://YOUR-PROXY.onrender.com/api/usda`. Never paste the key itself.

Proxy requests accept only a food query, use a fixed USDA upstream, omit query/key logging, enforce CORS origin allowlisting and a basic process-local rate limit. It adds no accounts or private-data storage. Separate Render web-service hosting may incur charges; this is optional and the static app requires no secret.

## Measurements and data coverage

Canonical diary mass is grams and nutrient snapshots are per 100 g. API records with per-100-mL data require a measured/published density before conversion. **100 mL is never assumed to equal 100 g.** Use FSANZ specific gravity where published, a label portion weight, or enter your own weighed grams per unit. “Remember” stores these user-supplied values locally and labels them as such. Pieces/scoops/slices have no universal weight. For a per-100-mL custom food, provide measured density; volume alone cannot establish mass.

Household standards are explicit: AU cup 250 mL, AU tablespoon 20 mL, teaspoon 5 mL, US fl oz 29.5735295625 mL. Other household standards can use custom measured grams. No raw-to-cooked conversion is guessed. Recipe examples specify ingredient weights; actual cooking retention/loss, brands and sauces vary. Weigh final yield and edit the ingredients to match your meal.

— means unavailable; zero is used only when reported by the source (or when no food is logged). Partial totals reflect only available values. FSANZ vitamin A retinol equivalents and total folates differ from some USDA conventions; see each source’s notes. Nutrition goals are adjustable examples, not personalised clinical advice.

## Data preservation and privacy

The origin and storage key `strong-mind-v1` are retained. V2 schema migration preserves old programme dates, checklists, journals, moods, sign-offs, custom foods, goals and meal snapshots. Original ZIP-era saves/backups are also supported. Before migration, original bytes are retained at `strong-mind-v1-before-v2`; each subsequent successful write retains a previous stored copy. The pre-V2 copy does not overwrite itself. Unreadable primary records pause saving instead of silently resetting/overwriting them; Settings can export the raw recovery file or restore a validated backup. A full-storage failure leaves the old primary record intact and shows an export warning.

Export JSON backups regularly. iOS eviction, deleting browsing data or changing domains can remove access to device-local data. Backup files contain private records and are not encrypted by this app. There are no user accounts, cloud sync, push reminders, health-device imports or analytics. Only explicit food queries go to external food services; source/audio links go to their respective sites. No journal or nutrition history is included in requests.

## Source files and attribution

- `src/app.js`, `src/style.css`: integrated views, forms and outdoor theme
- `src/model.js`, `src/storage.js`: original domain model plus safe V2 migrations/persistence
- `src/wisdom.js`, `src/quotes-data.js`, `src/stories.js`: offline inspiration libraries
- `src/food-api.js`, `src/units.js`, `src/nutrition.js`, `src/recipe-examples.js`: providers, portions, totals and recipes
- `public/data/`: separate attributed FSANZ and OFF datasets
- `public/sw.js`, `public/manifest.webmanifest`, SVG artwork and PNG icons: offline/install assets
- `proxy-server.mjs`, `render-proxy.yaml`: optional private-key USDA proxy
- `test/`, `scripts/`: automated validation, browser QA, quote verification and FSANZ importer

[Food licences/provenance](docs/DATA-SOURCES.md) · [Quote and story research](docs/CONTENT-SOURCES.md). Public in-app attribution is at `/data-sources.html`. Quote verification: `npm run verify:quotes` (optional network check). Seneca/Musonius translations are not included in this release; see the content notes. The original uploaded ZIP remains unchanged.
