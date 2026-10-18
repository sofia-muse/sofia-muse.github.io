"""Generate complete static language editions, sharing assets and behavior."""
import html
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
translations = {'ru': {}, 'he': {}}
for line in (ROOT / 'localization/translations.tsv').read_text().splitlines():
    if not line.strip():
        continue
    key, ru, he = line.split('|')
    for lang, value in (('ru', ru), ('he', he)):
        if key in translations[lang]:
            raise ValueError(f'Duplicate translation: {key}')
        translations[lang][key] = value

template = (ROOT / 'localization/index.en.html').read_text()
template = template.replace('<nav aria-label="Main navigation">', '<div class="header-tools"><nav aria-label="Main navigation">')
template = template.replace('    </nav>\n  </header>', '''    </nav>
    <div class="language-switcher" role="group" aria-label="Language" dir="ltr">
      <a href="/" hreflang="en" lang="en" data-language="en">English</a>
      <a href="/ru/" hreflang="ru" lang="ru" data-language="ru">Русский</a>
      <a href="/he/" hreflang="he" lang="he" data-language="he">עברית</a>
    </div></div>
  </header>''')
template = template.replace('<script src="/script.js"', '<script src="/locales.js" defer></script>\n  <script src="/script.js"')
template = template.replace('<h1 id="hero-title">', '<h1 id="hero-title" dir="ltr">')
template = template.replace('<meta property="og:type"', '<meta property="og:locale" content="LOCALE_VALUE">\n  <meta property="og:type"')
template = template.replace('<link rel="stylesheet"', '''<link rel="alternate" hreflang="en" href="/">
  <link rel="alternate" hreflang="ru" href="/ru/">
  <link rel="alternate" hreflang="he" href="/he/">
  <link rel="alternate" hreflang="x-default" href="/">
  <link rel="stylesheet"''')
for marker in ('class="email-link"', 'class="wordmark"', 'class="key-label"', 'class="layer-mark"', 'class="layer-index"', 'class="project-number"', 'class="stack-no"', 'id="demo-request"', 'id="demo-response"', 'id="demo-premium"'):
    template = template.replace(marker, marker + ' dir="ltr"')
template = re.sub(r'<code(?![^>]*dir=)', '<code dir="ltr"', template)

def text_translation(match, lang, isolate=False):
    raw = match.group(0)
    key = html.unescape(raw).strip()
    if key not in translations[lang]:
        if lang == 'he' and isolate and (re.search('[A-Za-z]', key) or re.fullmatch(r'\d{4}[–-]\d{4}', key)) and '\n' not in key:
            return raw[:len(raw)-len(raw.lstrip())] + '<bdi dir="ltr">' + html.escape(key, quote=False) + '</bdi>' + raw[len(raw.rstrip()):]
        return raw
    value = html.escape(translations[lang][key], quote=False)
    if lang == 'he' and isolate:
        # Isolate Latin technology names inside Hebrew prose without mirroring them.
        value = re.sub(r'(?:\.NET|[A-Za-z][A-Za-z0-9.#/+\-]*)(?:[ \t]+[A-Za-z][A-Za-z0-9.#/+\-]*)*', lambda m: '<bdi dir="ltr">' + m.group(0) + '</bdi>', value)
    return raw[:len(raw)-len(raw.lstrip())] + value + raw[len(raw.rstrip()):]

for lang in ('en', 'ru', 'he'):
    source = template.replace('<html lang="en">', f'<html lang="{lang}" dir="{"rtl" if lang == "he" else "ltr"}">')
    source = source.replace('LOCALE_VALUE', {'en':'en_US','ru':'ru_RU','he':'he_IL'}[lang])
    source = source.replace(f'data-language="{lang}"', f'data-language="{lang}" aria-current="page"')
    if lang != 'en':
        head, body = source.split('<body>', 1)
        head = re.sub(r'(?<=>)[^<>]+(?=<)', lambda m: text_translation(m, lang), head)
        body = re.sub(r'(?<=>)[^<>]+(?=<)', lambda m: text_translation(m, lang, isolate=True), body)
        source = head + '<body>' + body
        def attribute_translation(m):
            key = html.unescape(m.group(2))
            return m.group(1) + html.escape(translations[lang].get(key, key), quote=True) + m.group(3)
        source = re.sub(r'((?:aria-label|alt|content|placeholder)=")([^\"]*)(")', attribute_translation, source)
        if lang == 'he':
            source = re.sub(r'(<h2 id="contact-title">).*?(</h2>)', r'\1עבודה טובה מתחילה<br>ב<em>שיחה.</em>\2', source, flags=re.S)
    dest = ROOT / ('' if lang == 'en' else lang)
    dest.mkdir(parents=True, exist_ok=True)
    (dest / 'index.html').write_text(source)

dictionary = json.dumps(translations, ensure_ascii=False)
(ROOT / 'locales.js').write_text("'use strict';\n(() => {\n const dictionaries = " + dictionary + ";\n const dictionary = dictionaries[document.documentElement.lang] || {};\n window.portfolioI18n = {t: text => dictionary[text] || text};\n document.querySelectorAll('[data-language]').forEach(link => link.addEventListener('click', () => {\n  const destination = new URL(link.href);\n  destination.hash = window.location.hash;\n  link.href = destination.href;\n }));\n})();\n")
print('Generated English, Russian and Hebrew editions with localized metadata and shared translations.')
