"""Generate complete static language editions, sharing assets and behavior."""
import html
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
translations = {'ru': {}, 'he': {}}
for line in (ROOT / 'localization/translations.tsv').read_text(encoding='utf-8').splitlines():
    if not line.strip():
        continue
    key, ru, he = line.split('|')
    for lang, value in (('ru', ru), ('he', he)):
        if key in translations[lang]:
            raise ValueError(f'Duplicate translation: {key}')
        translations[lang][key] = value

translations['uk'] = json.loads((ROOT / 'localization/uk.json').read_text(encoding='utf-8'))
missing = set(translations['ru']) - set(translations['uk'])
if missing:
    raise ValueError(f'Missing Ukrainian translations: {sorted(missing)}')

template = (ROOT / 'localization/index.en.html').read_text(encoding='utf-8')
template = template.replace('<nav aria-label="Main navigation">', '<div class="header-tools"><nav aria-label="Main navigation">')
template = template.replace('    </nav>\n  </header>', '''    </nav>
    <div class="language-switcher" role="group" aria-label="Language" dir="ltr">
      <select id="language-select" aria-label="Language">
        <option value="en">English</option>
        <option value="uk">Українська</option>
        <option value="ru">Русский</option>
        <option value="he">עברית</option>
      </select>
      <a href="/" hreflang="en" lang="en" data-language="en">English</a>
      <a href="/uk/" hreflang="uk" lang="uk" data-language="uk">Українська</a>
      <a href="/ru/" hreflang="ru" lang="ru" data-language="ru">Русский</a>
      <a href="/he/" hreflang="he" lang="he" data-language="he">עברית</a>
    </div></div>
  </header>''')
template = template.replace('<script src="/site-common.js', '<script src="/locales.js" defer></script>\n  <script src="/site-common.js')

template = template.replace('<meta property="og:type"', '<meta property="og:locale" content="LOCALE_VALUE">\n  <meta property="og:type"')
template = template.replace('<link rel="stylesheet"', '''<link rel="alternate" hreflang="en" href="/">
  <link rel="alternate" hreflang="ru" href="/ru/">
  <link rel="alternate" hreflang="uk" href="/uk/">
  <link rel="alternate" hreflang="he" href="/he/">
  <link rel="alternate" hreflang="x-default" href="/">
  <link rel="stylesheet"''', 1)
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

pages = [{'route':'/','template':None,'features':['home','gallery']}] + json.loads((ROOT/'localization/pages.json').read_text(encoding='utf-8'))
def localized(lang,route):
    return ('/' if lang=='en' else '/'+lang+'/') + route.lstrip('/')
(ROOT/'insurance-demo.js').write_text("'use strict';\n(() => {\n"+(ROOT/'demo-model.mjs').read_text(encoding='utf-8').replace('export function','function')+'\n'+re.sub(r'^import[^\n]*\n','',(ROOT/'demo-ui.js').read_text(encoding='utf-8'))+'\n})();',encoding='utf-8')
urls=[]
legacy={}
for page in pages:
    route=page['route']
    page_template=template
    if route != '/':
        fragment=(ROOT/'localization'/page['template']).read_text(encoding='utf-8')
        for identifier in re.findall(r'id="([^"]+)"',fragment):
            legacy[identifier]=route
        current_title=re.search(r'<h1[^>]*>(.*?)</h1>',fragment,re.S)[1]
        main='<main id="main" class="case-main wrap" tabindex="-1"><nav class="breadcrumbs" aria-label="Breadcrumb"><a href="HOME_URL#work">Projects</a><span aria-hidden="true"> / </span><span aria-current="page">'+current_title+'</span></nav>'+fragment+'<p class="case-contact"><a class="button primary" href="HOME_URL#contact">Contact Sofia</a></p></main>'
        page_template=re.sub(r'<main\b.*?</main>',lambda m:main,page_template,flags=re.S)
        page_template=re.sub(r'<aside class="portfolio-guide".*?</aside>','',page_template,flags=re.S)
        for script in ('legacy-anchors','guide','freelance','drone-face','story-motion','about-motion','city-motion'):
            page_template=re.sub(r'<script src="/'+script+r'\.js[^>]*></script>','',page_template)
        page_template=re.sub(r'<link rel="preload" as="image"[^>]*>','',page_template)
        page_template=re.sub(r'<title>.*?</title>','<title>'+html.escape(page['title'])+'</title>',page_template)
        for attr,value in [('name="description"',page['description']),('property="og:description"',page['description']),('property="og:title"',page['title'])]:
            page_template=re.sub(r'(<meta '+attr+r' content=")[^"]*',lambda m:m[1]+html.escape(value,quote=True),page_template)
        scripts=[]
        if 'client' in page['features']:scripts=['case-study.js','motion-stories.js']
        if 'insurance' in page['features']:scripts=['portfolio-depth.js','motion-stories.js','insurance-demo.js']
        page_template=page_template.replace('</head>',''.join('<script src="/'+s+'?v=multipage-32" '+('type="module"' if s=='demo-ui.js' else 'defer')+'></script>' for s in scripts)+'</head>')
    if 'gallery' not in page['features']:
        page_template=re.sub(r'<dialog id="screenshot-dialog".*?</dialog>','',page_template,flags=re.S)
        page_template=re.sub(r'<(?:script|link)[^>]*(?:gallery\.js|gallery\.css)[^>]*>(?:</script>)?','',page_template)
    for lang in ('en', 'uk', 'ru', 'he'):
        source = page_template.replace('<html lang="en">', f'<html lang="{lang}" dir="{"rtl" if lang == "he" else "ltr"}">')
        source = source.replace('HOME_URL',localized(lang,'/'))
        if route != '/':
            source = source.replace('class="wordmark" href="#main"','class="wordmark" href="'+localized(lang,'/')+'#main"')
        canonical = 'https://sofia-muse.github.io' + localized(lang, route)
        urls.append(canonical)
        source = re.sub(r'(<link rel="alternate" hreflang="([^"]+)" href=")[^"]*', lambda m: m[1]+'https://sofia-muse.github.io'+localized('en' if m[2]=='x-default' else m[2],route), source)
        source = re.sub(r'href="(/(?:projects/[^/]+/|privacy/|accessibility/))"',lambda m:'href="'+localized(lang,m[1])+'"',source)
        source = re.sub(r'(<a href=")[^"]*(" hreflang="(en|uk|ru|he)" lang=)', lambda m: m[1]+localized(m[3],route)+m[2], source)
        if route != '/':
            source = re.sub(r'href="#(work|services|about|contact)"',lambda m:'href="'+localized(lang,'/')+'#'+m[1]+'"',source)
        source = source.replace('</head>', f'  <link rel="canonical" href="{canonical}">\n  <meta property="og:url" content="{canonical}">\n</head>')
        source = source.replace('LOCALE_VALUE', {'en':'en_US','uk':'uk_UA','ru':'ru_RU','he':'he_IL'}[lang])
        source = source.replace(f'data-language="{lang}"', f'data-language="{lang}" aria-current="page"')
        source = source.replace(f'<option value="{lang}">', f'<option value="{lang}" selected>')
        if lang != 'en':
            head, body = source.split('<body>', 1)
            head = re.sub(r'(?<=>)[^<>]+(?=<)', lambda m: text_translation(m, lang), head)
            body = re.sub(r'(?<=>)[^<>]+(?=<)', lambda m: text_translation(m, lang, isolate=True), body)
            source = head + '<body>' + body
            def attribute_translation(m):
                key = html.unescape(m.group(2))
                return m.group(1) + html.escape(translations[lang].get(key, key), quote=True) + m.group(3)
            source = re.sub(r'((?:aria-label|alt|content|placeholder|data-caption)=")([^\"]*)(")', attribute_translation, source)
        dest = ROOT / localized(lang, route).strip('/')
        dest.mkdir(parents=True, exist_ok=True)
        (dest / 'index.html').write_text(source, encoding='utf-8')

dictionary = json.dumps(translations, ensure_ascii=False)
(ROOT / 'locales.js').write_text("'use strict';\n(() => {\n const dictionaries = " + dictionary + ";\n const dictionary = dictionaries[document.documentElement.lang] || {};\n window.portfolioI18n = {t: text => dictionary[text] || text};\n document.querySelectorAll('[data-language]').forEach(link => link.addEventListener('click', () => {\n  const destination = new URL(link.href);\n  destination.hash = window.location.hash;\n  link.href = destination.href;\n }));\n})();\n", encoding="utf-8")
(ROOT/'sitemap.xml').write_text('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+''.join('<url><loc>'+url+'</loc></url>' for url in urls)+'</urlset>',encoding='utf-8')
legacy.update({'notes':'/#work','skills':'/#services','skill-insight':'/#services','skills-map':'/#services','production-platforms':'/projects/client-dashboard/'})
(ROOT/'legacy-anchors.js').write_text("'use strict';(()=>{const routes="+json.dumps(legacy)+";function redirect(){const id=decodeURIComponent(location.hash.slice(1));if(!id||document.getElementById(id)||!routes[id])return;const lang=document.documentElement.lang;const route=routes[id];location.replace((lang==='en'?'':'/'+lang)+route+(route.includes('#')?'':'#'+encodeURIComponent(id)));}redirect();addEventListener('hashchange',redirect);})();",encoding='utf-8')
print(f'Generated {len(urls)} localized pages and sitemap.')
