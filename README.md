# Sofia Museichuk — multilingual portfolio

Static HTML, CSS and JavaScript, with a Python generator. No framework migration, backend form service, paid API or analytics.

## Run locally

Run `python scripts/build-locales.py`, then `python -m http.server 8080` from this directory. Open http://localhost:8080/ru/ (or / for English, /uk/, /he/).

## Source and editing

- Home: `localization/index.en.html`.
- Project and information pages: `localization/pages/*.en.html`.
- Route registry: `localization/pages.json`.
- Translations: `localization/translations.tsv` (EN|RU|HE), `localization/uk.json`.
- Generate again after content changes. Generated index files should not be edited directly.
- The generator builds 28 pages, shared translation dictionaries, legacy-anchor redirects, the insurance simulation bundle and sitemap.
- Layout refinements: `layout-refinement.css`, `portfolio-pages.css`; shared styles: `cyber.css`.
- Gallery: `gallery.js` / `gallery.css`; accessibility and consent have their own files.
- Insurance simulation source: `demo-model.mjs` and `demo-ui.js`. `insurance-demo.js` is generated as a deferred classic bundle for compatibility with local static servers.

## Pages

Each language has a home page and `/projects/client-dashboard/`, `/projects/cartograph/`, `/projects/life-rpg/`, `/projects/insurance-api/`, `/privacy/`, `/accessibility/`. Language switching preserves the page and hash. Old engineering anchors redirect to their case pages.

Home order: hero, services, commercial case, Gal's permitted testimonial, Cartograph and Life RPG, compact Insurance link, about/CV, contact. Case pages have ordinary navigation and no floating drone.

## Privacy and limitations

The enquiry prepares a local email draft; the visitor sends it in their email client. Nothing is submitted automatically. No analytics. The necessary consent cookie lasts 180 days. Optional preferences are saved only after permission; withdrawal removes them.

Privacy and accessibility pages are explicitly drafts. Confirm business details, email retention and final hosting with appropriate professional advice before publication. No claim of full legal or accessibility compliance. NVDA/VoiceOver and CV PDF audits remain outstanding.

Commercial diagrams are explanatory, not client screenshots. Client identity remains anonymous; Gal's agreed attribution is retained. Personal-project screenshots come from local demos. Insurance is a browser simulation, not a hosted API. No measured business impact is claimed.

## Verification

Run `python scripts/check-site.py` for IDs, headings, ARIA references, paths, cross-page anchors, metadata and language routes. JavaScript syntax and API model checks were also performed. Browser checks covered 28 pages at 320/390/768/1440 px, normal and 150% text, Hebrew RTL, keyboard dialogs, consent, enquiry preview and API retry/conflict behavior.

Lossless WebP replacements reduce five illustration assets from 10,635,639 to 7,193,282 bytes (32.37%). Dimensions, sprite frames and decoded RGBA pixels are unchanged; originals are preserved. This is an asset-size comparison, not a measured LCP improvement. Secondary screenshots and artwork load lazily.

## Delivery

The repository contains the complete source and generated static pages. GitHub Pages is the hosting target; canonical URLs use https://sofia-muse.github.io/. Deployment depends on the repository Pages settings. Privacy and accessibility documents remain drafts for review before public use.
