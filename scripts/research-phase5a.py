import re,json,html,hashlib
from urllib.parse import unquote
from pathlib import Path
from html.parser import HTMLParser
class N:
 def __init__(self,tag='',attrs=(),parent=None,order=0):self.tag=tag;self.a=dict(attrs);self.parent=parent;self.kids=[];self.order=order
 def text(self):return re.sub(r'\s+',' ',''.join(c if isinstance(c,str) else c.text()+' ' for c in self.kids)).strip()
 def all(self,tag):
  out=[]
  for c in self.kids:
   if isinstance(c,N):
    if c.tag==tag:out.append(c)
    out.extend(c.all(tag))
  return out
 def parents(self):
  n=self.parent
  while n:yield n;n=n.parent
class DOM(HTMLParser):
 def __init__(self,s):super().__init__();self.root=N();self.stack=[self.root];self.order=0;self.feed(s)
 def handle_starttag(self,t,a):
  self.order+=1;n=N(t,a,self.stack[-1],self.order);self.stack[-1].kids.append(n)
  if t not in ['br','img','hr','input','link','meta','source','wbr','area']:self.stack.append(n)
 def handle_endtag(self,t):
  for i in range(len(self.stack)-1,0,-1):
   if self.stack[i].tag==t:self.stack=self.stack[:i];break
 def handle_data(self,s):self.stack[-1].kids.append(s)
import argparse
parser=argparse.ArgumentParser(description='Extract the reviewed Phase 5A factual snapshot from saved public responses.')
parser.add_argument('cache',type=Path,help='Directory with p5-PAGE.html and p5-cosmetics.json responses')
parser.add_argument('--output',type=Path,default=Path('src/data/research/phase5a.json'))
args=parser.parse_args()
sources=[]
def read(name):
 p=(args.cache/('p5-'+name+'.html'));raw=p.read_bytes();s=raw.decode();rev=re.search(r'"wgRevisionId":(\d+)',s)
 if not rev:raise Exception(name)
 sid='phase5-'+name.lower().replace('_','-');sources.append(dict(id=sid,url='https://fortnite.weirdgloop.org/w/'+name,revision=int(rev[1]),sha256=hashlib.sha256(raw).hexdigest()))
 return DOM(s).root,sid
# Retain complete population tables and original flags; no update-date or introduction inference.
root,sid=read('Named_Locations');locations=[]
for table in root.all('table')[:12]:
 rows=table.all('tr');heads=[c.text() for c in rows[0].kids if isinstance(c,N) and c.tag in ['th','td']] if rows else []
 if not rows or 'Seasons' not in heads:continue
 labels=[c.text() for c in rows[1].kids if isinstance(c,N) and c.tag in ['th','td']]
 chapter=1 if labels==['PS','S1','S2','S3','S4','S5','S6','S7','S8','S9','SX','OG'] else None
 # Match the explicit island note in the table, never its numeric position.
 text=table.text()
 if 'Artemis island' in text:chapter=3
 elif 'Asteria island' in text:chapter=4
 elif 'Helios island' in text:chapter=5
 if chapter not in [1,3,4,5]:continue
 for tr in rows[2:]:
  cells=[c.text() for c in tr.kids if isinstance(c,N) and c.tag in ['th','td']]
  if len(cells)!=len(labels)+3:continue
  flags=dict(zip(labels,cells[2:-1]));periods=[]
  for flag,v in flags.items():
   if v!='✓' or flag=='PS':continue
   periods.append('OG2023' if flag=='OG' else f'C{chapter}{flag}')
  locations.append(dict(name=cells[0],chapter=chapter,seasons=periods,flags=flags,sourceId=sid))
root,sid=read('Characters');characters=[]
cut=min((n.order for n in root.all('h3')+root.all('h2') if n.a.get('id','').startswith('Excluded_or_Removed')),default=10**9)
for table in root.all('table'):
 if table.order>=cut:continue
 labels=[p.a.get('data-title','') for p in table.parents()];period=next((t for t in labels if re.fullmatch(r'C\d+(?:S\d+|MS\d*)',t)),None)
 if not period:continue
 rows=table.all('tr')
 if not rows or 'Biography' not in rows[0].text() or 'Location' not in rows[0].text():continue
 for tr in rows[1:]:
  cells=[c for c in tr.kids if isinstance(c,N) and c.tag in ['th','td']]
  if len(cells)<4:continue
  name=cells[1].text()
  if name:characters.append(dict(name=name,period=period,sourceId=sid))
root,sid=read('Bosses');bosses=[];mode=None;season=None
nodes=sorted(root.all('h2')+root.all('h3')+root.all('table'),key=lambda n:n.order)
for n in nodes:
 if n.tag=='h2':
  id=n.a.get('id','');mode='humanoid' if id=='Humanoid_Bosses_2' else 'creature' if id=='Creature_Bosses_2' else None
 elif n.tag=='h3':season=n.text()
 elif mode and n.tag=='table':
  for tr in n.all('tr'):
   for td in [c for c in tr.kids if isinstance(c,N) and c.tag=='td']:
    bold=next((c for c in td.kids if isinstance(c,N) and c.tag=='b'),None)
    if not bold:continue
    links=[a for a in bold.all('a') if not a.a.get('href','').startswith('/w/File:')]
    if not links:continue
    name=links[0].text() or links[0].a.get('title','');name=re.sub(r'\s*\(Roaming\)$','',name)
    mythic=any('mythic' in d.a.get('class','').split() for d in td.all('div'))
    if name:bosses.append(dict(name=name,kind=mode,season=season,mythicLoot=mythic,sourceId=sid))
weapons=[];exclusions=[]
for page,kind in [('Assault_Weapons','assault rifle'),('Shotguns','shotgun'),('Submachine_Guns','smg'),('Pistols','pistol'),('Sniper_Rifles','sniper rifle')]:
 root,sid=read(page)
 for table in root.all('table'):
  rows=table.all('tr')
  if len(rows)<3 or 'Ammo Type' not in rows[1].text():continue
  other=False
  for tr in rows[2:]:
   cells=[c.text() for c in tr.kids if isinstance(c,N) and c.tag in ['td','th']]
   if 'Exclusive to other modes' in tr.text():other=True;continue
   if len(cells)!=5:continue
   if other:exclusions.append(dict(name=cells[0],reason='Explicit other-mode section',sourceId=sid));continue
   name=cells[0].replace('Modular ','')
   desc=cells[4].replace('Semi-Automatic','semiauto').replace('Semi Automatic','semiauto').replace('semi-automatic','semiauto').replace('Semi-automatic','semiauto')
   automatic=bool(re.search(r'fully[- ]automatic|:\s*automatic|automatic (?:SMG|pistol|shotgun|rifle|weapon)|full[- ]auto',desc,re.I))
   burst=bool(re.search(r'burst[- ](?:fire|firing)|:\s*Burst\b|(?:two|three|2|3)[- ](?:round|shot) burst',desc,re.I))
   weapons.append(dict(name=name,weaponClass=kind,ammo=cells[2],rarities=cells[1].split(),automatic=automatic,burst=burst,sourceId=sid))
# Only positive vault membership for an exact named POI; no spawn-period inference.
root,sid=read('Vaults');vaults=[]
for table in root.all('table'):
 boss_column='Boss' in table.all('tr')[0].text() if table.all('tr') else False
 for tr in table.all('tr'):
  cells=[c for c in tr.kids if isinstance(c,N) and c.tag in ['th','td']]
  if len(cells)<2:continue
  first=cells[0].text();links=[a.a.get('title','') for a in cells[0].all('a') if not a.a.get('href','').startswith('/w/File:')]
  if first and not first.startswith(('Chapter ','Location')):vaults.append(dict(name=first,bossNames=[unquote(a.a.get('href','').split('/w/File:',1)[1]).split('_-_')[0].split('_(')[0].replace('_',' ') for a in cells[2].all('a') if a.a.get('href','').startswith('/w/File:')] if boss_column and len(cells)>2 else [],sourceId=sid))
# Original data and supplemental selectable-style evidence stay separate.
raw=(args.cache/'p5-cosmetics.json').read_bytes();data=json.loads(raw)['data'];styles=[r['id'] for r in data if any(v.get('type')=='STYLE' and len(v.get('options',[]))>1 for v in r.get('variants',[]))]
sources.append(dict(id='phase5-cosmetic-styles',url='https://fortnite-api.com/v2/cosmetics/br',sha256=hashlib.sha256(raw).hexdigest(),revision=None))
artifact=dict(reviewedOn='2026-11-11',sources=sources,locations=locations,characters=characters,bosses=bosses,weapons=weapons,vaults=vaults,styleIds=styles,exclusions=exclusions)
args.output.write_text(json.dumps(artifact,ensure_ascii=False,indent=2)+'\n')
from collections import Counter
print('locations',Counter(r['chapter'] for r in locations),'characters',len(characters),Counter(r['period'] for r in characters),'bosses',len(bosses),'weapons',len(weapons),Counter(r['ammo'] for r in weapons),'vaults',len(vaults),'styles',len(styles))
print('boss samples',bosses[:5]);print('vaults',[r['name'] for r in vaults][:30])
