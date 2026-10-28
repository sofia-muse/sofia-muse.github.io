from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit,unquote
from collections import Counter
root=Path(__file__).resolve().parent.parent
class Page(HTMLParser):
 def __init__(self):super().__init__();self.ids=[];self.refs=[];self.urls=[];self.h1=0
 def handle_starttag(self,tag,attrs):
  a=dict(attrs)
  if 'id' in a:self.ids.append(a['id'])
  if tag=='h1':self.h1+=1
  for key in ('aria-labelledby','aria-describedby','aria-controls','for'):self.refs+=a.get(key,'').split()
  for key in ('src','href'):
   url=a.get(key,'')
   if url.startswith(('/','#')) and not url.startswith('//'):self.urls.append(url)
files=[root/'index.html']+[root/lang/'index.html' for lang in ('uk','ru','he')]+list((root/'projects').glob('*/index.html'))+[root/r/'index.html' for r in ('privacy','accessibility')]+[p for lang in ('uk','ru','he') for p in (root/lang).rglob('index.html') if p!=root/lang/'index.html']
parsed={}
for file in files:
 p=Page();p.feed(file.read_text(encoding='utf-8'));parsed[file.resolve()]=p
 assert p.h1==1,(file,p.h1)
 assert len(p.ids)==len(set(p.ids)),(file,[x for x,n in Counter(p.ids).items() if n>1])
 assert not set(p.refs)-set(p.ids),(file,set(p.refs)-set(p.ids))
for file,p in parsed.items():
 for url in p.urls:
  u=urlsplit(url);target=(root/unquote(u.path).lstrip('/')) if u.path else file
  if target.is_dir():target=target/'index.html'
  assert target.exists(),(file,url)
  if u.fragment and target.resolve() in parsed:assert unquote(u.fragment) in parsed[target.resolve()].ids,(file,url)
print(f'{len(parsed)} pages: unique IDs, single H1, ARIA references, local assets and cross-page anchors OK')

import re
from xml.etree import ElementTree as ET
urls={e.text for e in ET.parse(root/'sitemap.xml').iter('{http://www.sitemaps.org/schemas/sitemap/0.9}loc')}
assert len(urls)==28
for file in parsed:
 s=file.read_text(encoding='utf-8');route='/' + file.parent.relative_to(root.resolve()).as_posix().strip('.')
 route=route.rstrip('/')+'/' if route!='/' else '/'
 canonical='https://sofia-muse.github.io'+route
 assert f'rel="canonical" href="{canonical}"' in s,(file,canonical)
 assert canonical in urls
 assert len(re.findall(r'<link rel="alternate"',s))==5
 lang=re.search(r'<html lang="([^"]+)"',s)[1]
 for target_lang in ('en','uk','ru','he'):
  link=re.search(r'<a href="([^"]+)" hreflang="'+target_lang+r'" lang=',s)[1]
  base=re.sub(r'^/(uk|ru|he)/','/',route)
  expected=('' if target_lang=='en' else '/'+target_lang)+base
  assert link==expected,(file,target_lang,link,expected)
print('Canonical, hreflang, language destinations and 28-entry sitemap OK')
