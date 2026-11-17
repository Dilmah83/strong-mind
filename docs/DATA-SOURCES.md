# Food data provenance and licences

Research/import date: 2026-11-17. Do not merge the following datasets into an unattributed proprietary database. Each source is kept identifiable in the UI and on disk. Public source data is separate from private local journal/diary records.

## FSANZ Australian Food Composition Database, Release 3

- Publisher: Food Standards Australia New Zealand (FSANZ).
- [Database](https://www.foodstandards.gov.au/science-data/food-nutrient-databases/afcd) · [Download files](https://www.foodstandards.gov.au/science-data/food-nutrient-databases/afcd/data-files).
- [FSANZ Data User Licence Agreement](https://www.foodstandards.gov.au/science-data/monitoringnutrients/afcd/datauserlicenceagreement), based on CC BY-SA 3.0 Australia. The derived `public/data/afcd.json` is offered under the same terms. © Food Standards Australia New Zealand. No endorsement implied.
- Original inputs: `AFCD Release 3 - Nutrient profiles.xlsx` and `AFCD Release 3 - Food Details.xlsx`, under the publisher's `/sites/default/files/2025-12/` directory. Not redistributed here; download from the source page.
- Import with `python scripts/import-afcd.py nutrient-profiles.xlsx food-details.xlsx`. Standard Python library only. Result: 1,588 foods with official Public Food Keys and derivation labels.
- The importer reads the **All solids & liquids per 100 g** worksheet, not the separate per-100-mL worksheet. Selected columns are mapped to the app schema; missing cells and nonnumeric symbols are omitted. Analysed, borrowed, recipe, imputed and other derivations remain distinguishable.
- Energy with fibre is converted kJ ÷ 4.184 to kcal. Vitamin A is retinol equivalents; folate is total folates, not DFE; vitamin D sums D2 and D3 only when both are reported (not D3 equivalents including metabolites). Vitamin K is not supplied. Do not silently equate different vitamin A/folate conventions across providers.
- Published specific gravity is used as approximate g/mL when positive. No blanket 1 g/mL assumption. Density varies by food and conditions.
- Recipes are editable examples calculated from explicit ingredient weights. They are not laboratory-verified finished dishes or restaurant claims. Omelette example uses 150 g edible raw egg as three example 50 g eggs; users should weigh their own. Cooking retention, cooking loss and unlisted sauces are not modelled; set a measured finished yield.

## Open Food Facts

- [API documentation](https://openfoodfacts.github.io/openfoodfacts-server/api/) · [API/data licensing](https://openfoodfacts.github.io/openfoodfacts-server/api/tutorials/license-be-on-the-legal-side/).
- Contains information from Open Food Facts, made available under the ODbL 1.0; database contents under the Database Contents License. `public/data/branded.json` is a separate derived dataset under those terms. No product images are redistributed.
- Offline snapshot: 38 Australian-listed label records retrieved via `/api/v2/search?countries_tags_en=australia&page_size=40` on 2026-11-17. Records without usable reported nutrition were omitted. They are community label data, not independently verified lab data.
- Live text search: legacy full-text `/cgi/search.pl`, explicitly filtered to Australia. Barcode lookup: `/api/v2/product/{barcode}.json`. Searches run only when the user submits them, never on every keystroke. Query-only requests, credentials omitted, no journal/diary transmission.
- Normalised OFF `*_100g` mass values use grams independent of label `*_unit`. They are scaled to app mg/µg units. The API's `nutriments_estimated` values are not used. Unknown fields stay missing; reported zero remains zero.
- Liquid records inferred from reported mL package/serving basis are labelled per 100 mL and require a measured/published density before converting to canonical grams. Imported serving/package units without a known mass are not treated as grams.
- Brand and restaurant shortcuts prepare searches; they do not claim products exist or are currently stocked. Labels, availability, regions and formulations can change. Official menus are linked as fallback for entering current label values. No restaurant values are fabricated.

## USDA FoodData Central

- [Official API guide](https://fdc.nal.usda.gov/api-guide/). U.S. Department of Agriculture, Agricultural Research Service, FoodData Central. Data is CC0/public domain.
- Search uses `/fdc/v1/foods/search`; nutrient IDs and units are mapped explicitly, and IU values are not guessed into µg. Branded records with mL serving units are treated conservatively as per-100-mL sources and require density.
- The public `DEMO_KEY` is documented for testing: 30 requests per IP/hour and 50 per IP/day. It is not a private credential. For personal-key capacity, deploy `proxy-server.mjs` separately with `USDA_API_KEY` and `ALLOWED_ORIGINS` on the server. No private keys belong in settings, Git, HTML or the static bundle.
- The optional proxy forwards only the `q` food query to one fixed USDA endpoint; it does not accept arbitrary upstream URLs or journal/diary fields and does not log keys or queries. Rate limiting is conservative and process-local; additional production controls may be needed for public/high-volume deployments.

## Legacy data

The original 36 generic estimates are retained so old food IDs and records continue to work. Their confidence remains “Generic estimate”; the official FSANZ library is preferred for new reference searches. Diary entries keep nutrient snapshots even when source records change. Data coverage and preparation differences matter more than apparent numeric precision.
