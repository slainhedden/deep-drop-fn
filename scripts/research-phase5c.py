"""Rebuild factual review candidates; never imports unreviewed entries into gameplay."""
import runpy,json,re,hashlib,subprocess,concurrent.futures,os
from pathlib import Path
from urllib.parse import unquote
DOM=runpy.run_path('scripts/wiki-dom.py')['DOM']; cache=Path(os.environ.get('PHASE5C_CACHE_DIR','/tmp/p5c'));cache.mkdir(exist_ok=True)
def page(title):
 p=cache/(title.replace('/','%2F')+'.html')
 if not p.exists():subprocess.run(['curl','--fail','-sS','--max-time','60','https://fortnite.weirdgloop.org/w/'+title,'-o',str(p)],check=True)
 return p.read_text()
def source(title):
 s=page(title);rev=re.search(r'"wgRevisionId":(\d+)',s)
 return dict(id='p5c-'+re.sub('[^a-z0-9]+','-',title.lower()).strip('-'),url='https://fortnite.weirdgloop.org/w/'+title,revision=int(rev[1]) if rev else None,sha256=hashlib.sha256(s.encode()).hexdigest())
sources=[]
def doc(title):
 sources.append(source(title));return DOM(page(title)).root,sources[-1]['id']
root,sid=doc('Limited_Time_Modes');heads=root.all('h3');modes=[]
for tile in root.all('div'):
 if 'cosmetic-tile' not in tile.a.get('class',''):continue
 section=next((h.text().split(' [')[0] for h in reversed(heads) if h.order<tile.order),'')
 if section not in ['Current','Former','PvP','CO-OP','Classic Modes','Large-Team Modes','Special Modes','Icon Modes']:continue
 links=[a for a in tile.all('a') if a.a.get('href','').startswith('/w/') and not a.a['href'].startswith('/w/File:')]
 if not links:continue
 a=links[-1];name=tile.text();href=a.a['href'].split('?')[0]
 modes.append(dict(name=name,title=href[3:],group=section,sourceId=sid,profileAvailable='new' not in a.a.get('class','')))
# Profiles provide source-specific rules/availability. They do not automatically promote facts.
def profile(row):
 if not row['profileAvailable']:return
 try:
  title=row['title'];s=page(title);d=DOM(s).root;content=next(n for n in d.all('div') if 'mw-parser-output' in n.a.get('class',''));(cache/(title.replace('/','%2F')+'.txt')).write_text(content.text());return source(title)
 except Exception as e:return {'error':str(e),'title':row['title']}
with concurrent.futures.ThreadPoolExecutor(max_workers=6) as ex: results=list(ex.map(profile,modes))
sources.extend(r for r in results if r and 'error' not in r)
modeProfiles=[]
for row in modes:
 if not row['profileAvailable']:continue
 title=row['title'];text=(cache/(title.replace('/','%2F')+'.txt')).read_text()
 date=re.search(r'"release_date":"((?:\\.|[^"\\])*)"',text)
 if date:modeProfiles.append(dict(name=row['name'],sourceId=source(title)['id'],releaseDateLabel=json.loads('"'+date[1]+'"')))
root,sid=doc('Live_Events');events=[]
for table in root.all('table'):
 rows=table.all('tr')
 if not rows or 'Summary' not in rows[0].text():continue
 # Stop before OG/Creative/Party Royale duplicate and separate-island tables.
 prev=[h for h in root.all('h2') if h.order<table.order]
 chapter=re.match(r'Chapter (\d) Events',prev[-1].text() if prev else '')
 if not chapter:continue
 for row in rows[1:]:
  cs=[n for n in row.kids if not isinstance(n,str) and n.tag in ['td','th']]
  if len(cs)!=5:continue
  name,when,where,summary,kind=[c.text() for c in cs]
  if name=='THE TREASURE':continue # Future announced event, not historical occurrence.
  # Same names in different chapters denote different events.
  season=re.search(r'Chapter (\d): Season (\d)',when)
  sidseason='c'+season[1]+'s'+season[2] if season else ('c1s'+re.search(r'Season (\d)',when)[1] if re.search(r'Season (\d)',when) else None)
  if 'Season X' in when:sidseason='C1SX'
  if 'Remix' in when:sidseason='REMIX2024'
  if 'Season OG' in when:sidseason='OG2023'
  if 'Mini Season 1' in when:sidseason='C6GALACTIC2025'
  if 'Mini Season 2' in when:sidseason='C6SIMPSONS2025'
  events.append(dict(name=name,chapter=int(chapter[1]),season=sidseason.upper() if sidseason else None,kind=kind,locations=[a.text() for a in cs[2].all('a') if a.text()],sourceId=sid))
root,sid=doc('Wildlife');wildlife=[]
for table in root.all('table'):
 if not ('Vaulted Wildlife' in table.text() or 'Unvaulted Wildlife' in table.text()):continue
 for row in table.all('tr'):
  cs=[n for n in row.kids if not isinstance(n,str) and n.tag in ['td','th']]
  if len(cs)!=2:continue
  name=cs[0].text();text=cs[1].text()
  if name and name!='Image' and name not in [r['name'] for r in wildlife]:wildlife.append(dict(name=name,sourceId=sid,tameable=bool(re.search(r'can (?:still )?be [Tt]amed',text)),rideable=name in ['Wolf','Boar','Raptor','Loot Shark'],hostile=bool(re.search(r'Hostile [Ww]ildlife',text))))
# The table omits Crows even though this article explicitly describes them as interactive wildlife.
wildlife.append(dict(name='Crow',sourceId='p5c-wildlife',tameable=False,rideable=False,hostile=False))
# Reviewed profile: collectable firefly swarms and formerly animated Supply Llamas.
wildlife.append(dict(name='Firefly',sourceId='p5c-firefly-jar',tameable=False,rideable=False,hostile=False))
wildlife.append(dict(name='Supply Llama',sourceId='p5c-supply-llama',tameable=False,rideable=False,hostile=False))
for t in ['Sprites','Firefly_Jar','Supply_Llama','Explosive_Batarang','Overdrive_Grenade','Utility_Items','Consumables','Traps','Named_Locations','Landmarks']:sources.append(source(t))
# Review the full companies category, admitting retail identities from explicit type fields.
category,sid=doc('Category:Companies')
categoryPages=next(n for n in category.all('div') if n.a.get('id')=='mw-pages')
companies=[dict(name=a.text(),title=a.a['href'][3:]) for a in categoryPages.all('a') if a.a.get('href','').startswith('/w/')]
def companyProfile(row):
 title=row['title'];root=DOM(page(title)).root
 content=next(n for n in root.all('div') if 'mw-parser-output' in n.a.get('class',''))
 (cache/(title+'.txt')).write_text(content.text())
with concurrent.futures.ThreadPoolExecutor(max_workers=6) as ex:list(ex.map(companyProfile,companies))
retail=[]
for row in companies:
 title=row['title'];text=(cache/(title+'.txt')).read_text();m=re.search(r'"type":"((?:\\.|[^"\\])*)"',text)
 kind=json.loads('"'+m[1]+'"') if m else ''
 if not (re.search(r'store|shop|gas station|dealership|restaurant|fast food|café|cafe|bakery|diner|market|espresso|food stand|ice cream',kind,re.I) or row['name'] in ['Fork Knife',"Joel's Pub",'Snow Cones','Puppuccino']):continue
 if row['name']=='Ballers Pub':continue # Save the World, not BR.
 root=DOM(page(title)).root
 location=next((n for n in root.all('div') if n.a.get('data-source')=='location'),None)
 locations=[a.text() for a in location.all('a') if a.text()] if location else []
 mloc=re.search(r'"location":"((?:\\.|[^"\\])*)"',text)
 if mloc:
  raw=json.loads('"'+mloc[1]+'"');locations=[(label or title).strip() for title,label in re.findall(r'\[\[([^]|]+)(?:\|([^]]+))?\]\]',raw)]
 src=source(title);sources.append(src);retail.append(dict(name=row['name'].replace(' (Company)','').replace(' (Store)',''),sourceId=src['id'],kind=re.sub('<[^>]+>',' ',kind),locations=locations))
externalItems=[];traps=[]
for title in ['Utility_Items','Consumables','Traps']:
 root=DOM(page(title)).root;sid=source(title)['id']
 for tab in root.all('table'):
  if 'Item' not in tab.text()[:100]:continue
  for i,row in enumerate(tab.all('tr')):
   cs=[n for n in row.kids if not isinstance(n,str) and n.tag=='td']
   if len(cs)<4:continue
   name=cs[0].text();season=cs[-2].text();description=cs[-1].text()
   exclusion='Creative/UEFN only' if 'Exclusive to Fortnite: Creative' in description else 'separate mode' if 'Exclusive to' in description else None
   externalItems.append(dict(name=name,seasonLabel=season,sourceId=sid,exclusion=exclusion))
   if title=='Traps' and not exclusion and name not in [r['name'] for r in traps]:traps.append(dict(name=name,sourceId=sid))
root,sid=doc('Containers');containers=[]
for tab in root.all('table')[:7]:
 for row in tab.all('tr'):
  cs=[n for n in row.kids if not isinstance(n,str) and n.tag=='td']
  if len(cs)<5:continue
  name,intro,where,loot,chest=[c.text() for c in cs]
  if name in ['Storm Chest','Extraction Chest','Blitz Chest']:continue
  chapter=re.search(r'Chapter (\d)',intro)
  chapter=int(chapter[1]) if chapter else 7 if intro=='Treasure Hunters' else 1
  containers.append(dict(name=name,chapter=chapter,sourceId=sid,isChest=chest=='✓',lootLinks=[a.text() for a in cs[3].all('a') if a.text()]))
epic=cache/'epic-showdown.html';epicUrl='https://www.fortnite.com/news/showdown-in-the-new-fortnite-battle-royale-season'
if not epic.exists():subprocess.run(['curl','--fail','-sS','--max-time','60',epicUrl,'-o',str(epic)],check=True)
sources.append(dict(id='p5c-epic-showdown',url=epicUrl,revision=None,sha256=hashlib.sha256(epic.read_bytes()).hexdigest()))
result=dict(reviewedOn='2026-11-11',sources=list({s['id']:s for s in sources}.values()),modes=modes,modeProfiles=modeProfiles,events=events,wildlife=wildlife,retail=retail,traps=traps,externalItems=externalItems,containers=containers,profileFailures=[r for r in results if r and 'error' in r])
Path(os.environ.get('PHASE5C_RESEARCH_OUTPUT',str(cache/'research-candidates.json'))).write_text(json.dumps(result,indent=2)+'\n')
print(json.dumps({k:len(v) for k,v in result.items() if isinstance(v,list)}))
