# Sofia Museichuk — Full Stack Developer

Multilingual portfolio: HTML, CSS and vanilla JavaScript; EN/RU/HE with RTL. Interactive case studies, animated illustrations and a scripted drone guide. No paid APIs or database.

## Run locally

```sh
python scripts/build-locales.py
python -m http.server 8080 
```

Open http://localhost:8080.

## Edit

Edit `localization/index.en.html` and `localization/translations.tsv`, then run the locale builder. CSS, JavaScript and assets live in the repository root. Keep commercial client details anonymous.

## Publish

Target repository: `sofia-muse/sofia-muse.github.io`, branch `main`. Choose Deploy from a branch → main → / (root) in Settings → Pages. Run the locale builder before committing content changes.

The API demo is a browser simulation, not a hosted .NET backend. Illustrations were created with AI assistance.
