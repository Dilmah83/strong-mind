# Strong Mind

Installable, mobile-first iPhone Progressive Web App for a 30-day wellbeing practice and daily nutrition tracking. Vanilla JavaScript, no dependencies, accounts, API keys or build service required. Dark interface, responsive layouts, safe-area navigation and accessible native forms.

## Run and verify

Use Node.js 22 or newer (CI uses 24):

```sh
npm run check
npm run build
npm test
npm start
```

Open http://localhost:3000. The build copies source and static assets into `dist/`. There are no dependencies to install. `PORT` optionally configures the local server. Production should serve `dist/` over HTTPS.

## Deploy on Render

1. Merge the pull request into `main`.
2. In Render, choose **New → Blueprint**, connect this GitHub repository, and select `render.yaml`. Review and create the static site.
3. Alternatively create a **Static Site**, choose this repository and branch, set build command to `npm run check && npm run build && npm test`, and publish directory to `dist`.
4. No environment variables, API keys, database or paid web service are needed. Render provides an HTTPS URL. No SPA rewrite is required: app routes use hash fragments.
5. Open the deployed URL online once, wait for the first load to finish, then reload in airplane mode to confirm the app shell is cached. External links require connectivity.

Deployments are intentionally not triggered from this development environment; use your Render account to connect the repository. Update the cache version in `public/sw.js` whenever changing precached assets. Updates use normal service-worker lifecycle: close all app windows and reopen to activate a newly installed version. Active pages continue using the previous worker until then.

## Install on iPhone

Open the Render HTTPS URL in **Safari → Share → Add to Home Screen → Open as Web App → Add**. Launch online once before using offline. Manifest includes 192/512 PNG icons, standalone display, theme colour and Apple touch icon. Actual installation and layout should be checked on an iPhone before a production release; this environment did not provide browser QA tooling.

## Implemented features

- Thirty distinct daily lessons, practical activities, reflection prompts, mood ratings and timestamped sign-offs. A day requires all three practices plus a nonblank journal to sign off. Editing a signed day clears its sign-off.
- Daily Spotify and podcast topic-search links plus Calm catalogue links and suggested practices. Days can be revisited freely.
- Searchable offline database of 36 generic foods; custom foods with any supported nutrient; portion scaling per 100 g; breakfast/lunch/dinner/snack logging, deletion and date-based history.
- Calories, protein, carbohydrates, fat, fibre, vitamins A/C/D/E/K/B1/B2/B3/B6/B12, folate, calcium, iron, magnesium, potassium, zinc, selenium and sodium. All goals are configurable; sodium is a limit.
- Completion and mood charts, 14-day calorie chart and numeric macronutrient history table.
- Local persistence, quota/error notification, optional persistent-storage request, validated JSON backup/restore and offline service-worker asset caching.
- Automated syntax, domain and packaging checks plus GitHub Actions CI.

## Content and integration limitations

**The original programme was not accessible.** The repository contained `strong-mind-app-repacked.zip`; GitHub's connected tools rejected its binary contents and direct network download failed. The archive is preserved unchanged. The app therefore explicitly labels its 30-day content as a replacement. Update `src/programme.js` with the earlier approved plan and specific episode/session URLs when available. This implementation does not claim to reproduce that unseen design.

Spotify and podcast links open topic searches, **not curated or verified individual episodes**. Calm opens its meditation catalogue, not a guaranteed specific session. These links require no app credentials; playback, regional availability, account access and paid subscriptions are controlled by those services. There is no embedded playback, Spotify OAuth or offline licensed audio.

The food database is deliberately local and finite, not a live commercial nutrition catalogue. Values are approximate generic estimates per 100 g, not certified analysis. Seed foods include macros and selected micronutrients. Missing values are unknown and labelled in totals; they must not be interpreted as measured zero. Custom foods can record all supported vitamins/minerals using package labels. No live food API is configured. Adding a larger USDA or commercial database requires a data import, attribution review or backend API proxy with provider credentials; never put private API keys in client code.

Data is **device/browser-local**, not cloud-synchronised. Clearing Safari storage, uninstalling the app or iOS eviction can remove data. Export backups regularly and treat them as private health-related records. There is no server account, encryption-at-rest layer, push notification service or cross-device sync. Nutrition targets are editable examples, not medical prescriptions.

## Source map

- `src/app.js`: views, forms and persistence
- `src/model.js`: nutrient schema, calculations and backup validation
- `src/programme.js`: editable 30-day content
- `src/foods.js`: offline food records and coverage notes
- `public/sw.js`: offline shell caching
- `public/manifest.webmanifest`: PWA installation metadata
- `render.yaml`: Render static-site blueprint

## Release verification

Automated checks cover portion/date calculations, sign-off prerequisites, backup round-trip and rejection, complete programme records, database IDs, nutrient schema, precached assets and PNG icon dimensions. Browser and physical iPhone checks are still required:

- Add the site to Home Screen and launch standalone.
- Complete a lesson, reload, edit it and confirm sign-off resets.
- Add 150 g of a food; verify 1.5× its per-100 g values. Change date and inspect history.
- Create a food with vitamin/mineral values and verify totals and missing-data labels.
- Change goals; export, then restore a backup and inspect journals and meals.
- Relaunch offline after an online visit and verify journals, custom foods and logging work.
- Check VoiceOver, keyboard navigation, text scaling and layouts on a small iPhone.
