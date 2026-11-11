"""Extract reviewed, positive BR relationships from saved wiki responses. No network calls."""
import argparse,hashlib,json,re,runpy
from pathlib import Path
dom=runpy.run_path(str(Path(__file__).with_name('wiki-dom.py')))
N,DOM=dom['N'],dom['DOM']
a=argparse.ArgumentParser();a.add_argument('cache',type=Path);a.add_argument('--output',type=Path,default=Path('src/data/research/phase5b.json'));args=a.parse_args()
sources=[]
manifest=json.loads(Path('src/data/research/phase5b-response-manifest.json').read_text())
def index_file(key):
 p=args.cache/(key+'.json')
 return json.loads(p.read_text())if p.exists()else manifest[key]
def read(page):
 raw=(args.cache/(page+'.html')).read_bytes();rev=re.search(r'"wgRevisionId":(\d+)',raw.decode());assert rev,page
 sid='p5b-'+page.lower().replace('_','-');sources.append(dict(id=sid,url='https://fortnite.weirdgloop.org/w/'+page,revision=int(rev[1]),sha256=hashlib.sha256(raw).hexdigest()))
 return DOM(raw.decode()).root,sid
def cells(tr):return[c for c in tr.kids if isinstance(c,N)and c.tag in ['td','th']]
def links(n):return[a for a in n.all('a')if a.a.get('href','').startswith('/w/')and not re.search(r'/w/(File:|Category:|Template:)',a.a.get('href',''))]
def name(a):return a.text()or a.a.get('title','')
def period(text):
 text=re.sub(r'\s*\[.*','',text).strip()
 if 'Remix' in text:return'REMIX2024'
 if text=='Galactic Battle':return'C6GALACTIC2025'
 if text=='The Simpsons':return'C6SIMPSONS2025'
 if text in ['Treasure Hunters','Chapter 7: Mini Season']:return'C7TREASURE2026'
 if 'Chapter 6: Mini Season 1'in text:return'C6GALACTIC2025'
 if 'Chapter 6: Mini Season 2'in text:return'C6SIMPSONS2025'
 m=re.fullmatch(r'Chapter (\d): Season (\d|X)',text)
 if m:return'C'+m[1]+'S'+m[2]
 m=re.fullmatch(r'Season (\d|X)',text)
 if m:return'C1S'+m[1]
 if text=='Chapter 4: Season OG':return'OG2023'
 return None
exclusions=[];items=[]
for page in ['Utility_Items','Consumables','Explosive_Weapons']:
 root,sid=read(page)
 for ti,t in enumerate(root.all('table')):
  rows=t.all('tr');header=' '.join(tr.text()for tr in rows[:2])
  if page=='Explosive_Weapons':valid='Explosive Weapons'in header and'Season Description'in header
  else:valid='Chapter'in header and'Season Description'in header
  if not valid:continue
  other=False
  for ri,tr in enumerate(rows[2:],2):
   if 'Exclusive to other modes'in tr.text():other=True;continue
   cs=cells(tr)
   if len(cs)!=(4 if page=='Explosive_Weapons'else 5):continue
   nm=cs[0].text();desc=cs[-1].text();when=period(cs[2 if page=='Explosive_Weapons'else 3].text())
   if other or any(x in desc for x in ['Exclusive to Fortnite: Creative','Exclusive to Blitz','Exclusive to Spy Games','Exclusive to Fortnite OG','Exclusive to the Endgame']):
    # Original Jetpack's Epic rarity is Spy Games-only; base original BR identity is still valid.
    if nm!='Jetpack' or other:exclusions.append(dict(name=nm,sourceId=sid,reason='Explicit other-mode scope'));continue
   tags=[]
   if re.search(r'knocks? back|knockback|impulse players',desc,re.I):tags.append('knockback')
   if re.search(r'damage structures|destroys structures|bust through walls|ram into players and structures|taking down just about anything',desc,re.I):tags.append('structureDamage')
   if re.search(r'reveals? (?:nearby )?(?:enemies|enemy)|reveal nearby foes|pulse scanning',desc,re.I):tags.append('reveal')
   if re.search(r'speed boost|sprint speed|increased speed|health and speed|run faster',desc,re.I):tags.append('speed')
   if re.search(r'launch(?:es)? (?:you|players|a player|yourself)(?: high)? into the air|air jump',desc,re.I):tags+=['launch','rotate']
   if re.search(r'deploy.*glider|flight mode|fly across|soar through the skies|boost up by Jumping|soar through the air',desc,re.I):tags+=['fly','rotate']
   if re.search(r'swing through the air|pull yourself towards|enhance your mobility|spin dash|dash abilities',desc,re.I):tags.append('rotate')
   if re.search(r'disguise|cloak|invisib|obscures your location',desc,re.I):tags.append('stealth')
   if re.search(r'heal|health',desc,re.I):tags.append('health')
   if re.search(r'(?:grants?|applies|heals?|restores?) (?:\w+ )?(?:shield|Health, Shields)|health and shields',desc,re.I):tags.append('shield')
   if page=='Explosive_Weapons':tags.append('explosive')
   items.append(dict(name=nm,season=when,sourceId=sid,row=f'{ti}:{ri}',tags=sorted(set(tags)),kind='weapon'if page=='Explosive_Weapons'else'item'))
# Full AI boss encounter cards, excluding player-controlled and LTM sections.
root,sid=read('Bosses');bosses=[];active=False;when=None
for n in sorted(root.all('h2')+root.all('h3')+root.all('table'),key=lambda n:n.order):
 if n.tag=='h2':active=n.a.get('id')in ['Humanoid_Bosses_2','Creature_Bosses_2']
 elif n.tag=='h3':when=period(n.text())
 elif active and n.tag=='table':
  for tr in n.all('tr'):
   for td in cells(tr):
    label=next((l for l in links(td)if l.text()and l.a.get('title')!='Health (Battle Royale)'),None)
    if not label:continue
    bold=next((p for p in label.parents()if p.tag=='b'or(p.tag=='span'and'animated'in p.a.get('class','').split())),label)
    boss=name(label);loot=[]
    for div in td.all('div'):
     rarity=next((r for r in ['mythic','exotic','legendary','epic','rare','uncommon','common']if r in div.a.get('class','').split()),None)
     if not rarity:continue
     for l in links(div):
      title=l.a.get('title','')
      if title and title not in ['Health (Battle Royale)','Medallions','Boons']:loot.append(dict(name=title,rarity=rarity))
    bosses.append(dict(name=boss,season=when,sourceId=sid,loot=list({(x['name'],x['rarity']):x for x in loot}.values()),locations=[name(l)for l in links(bold)if name(l)!=boss],keycard=any(l.a.get('title')=='Keycards'for l in links(td))))
# Positive NPC location edges only. Compass/proximity cells are explicitly nearby, not inside.
root,sid=read('Characters');npcs=[];bossLocations=[]
for t in root.all('table'):
 labels=[p.a.get('data-title','')for p in t.parents()];tag=next((x for x in labels if re.fullmatch(r'C\d+(?:S\d+|MS\d*)',x)),None)
 if not tag:continue
 when={'C6MS1':'C6GALACTIC2025','C6MS2':'C6SIMPSONS2025','C7MS':'C7TREASURE2026'}.get(tag,tag)
 rows=t.all('tr');header=rows[0].text()if rows else''
 if 'Biography'not in header or'Location'not in header:continue
 isExcluded='Other'in header
 for tr in rows[1:]:
  cs=cells(tr)
  if len(cs)<4:continue
  nm=cs[1].text();loc=cs[3];near=bool(re.search(r'\bnear\b|north|south|east|west|between',loc.text(),re.I))
  locations=[name(l)for l in links(loc)if not name(l).startswith(('Removed','Chapter','Season'))]
  if isExcluded:
   if 'Boss'in cs[-1].text():bossLocations.append(dict(name=nm,locations=locations,near=near,season=when,sourceId=sid))
  elif t.order<min((n.order for n in root.all('h3')if n.a.get('id','').startswith('Excluded_or_Removed')),default=10**9):npcs.append(dict(name=nm,locations=locations,near=near,season=when,sourceId=sid))
# Seat capacity, not cosmetic vehicle body names; never import other-mode tail rows.
root,sid=read('Vehicles');vehicles=[]
for t in root.all('table'):
 rows=t.all('tr')
 if len(rows)<3 or'Seats'not in rows[1].text():continue
 other=False
 for tr in rows[2:]:
  if'Exclusive to other modes'in tr.text():other=True;continue
  cs=cells(tr)
  if len(cs)!=5 or other:continue
  try:seats=int(cs[2].text())
  except ValueError:continue
  vehicles.append(dict(name=cs[0].text(),seats=seats,season=period(cs[4].text()),sourceId=sid))
# Gas station parent relations with exact added scope carried across actual rowspans.
root,sid=read('Gas_Station');gas=[]
for t in root.all('table')[:8]:
 when=None;scope=None
 for tr in t.all('tr')[2:]:
  cs=cells(tr)
  if len(cs)<2:continue
  if len(cs)==3:scope=cs[-1].text();when=period(scope)
  if not when:continue
  loc=cs[1]
  if 'Blitz'in loc.text()or'Reload'in loc.text():continue
  near='Near'in loc.text()or'near'in loc.text()
  for l in links(loc):gas.append(dict(name=name(l),near=near,season=when,sourceId=sid))
# Exact, enumerated Upgrade Bench locations (not arbitrary extrapolated whole-season availability).
root,sid=read('Upgrade_Bench');benches=[];when=None;active=False
for n in sorted(root.all('h2')+root.all('h3')+root.all('ul'),key=lambda n:n.order):
 if n.tag=='h2':active=n.a.get('id')=='Locations'
 elif n.tag=='h3':when=period(n.text())
 elif active and when and n.tag=='ul'and not any(p.tag=='ul'for p in n.parents()):
  for l in links(n):
   # Direct location links in enumerated lists; relational directions remain near.
   li=next((p for p in l.parents()if p.tag=='li'),n);near=bool(re.search(r'\b(?:East|West|North|South)',li.text()))
   benches.append(dict(name=name(l),season=when,near=near,sourceId=sid))
# Explicit primary landmark table, not navigation templates or island-mode speculation.
root,sid=read('Landmarks');landmarks=[]
for t in root.all('table')[:2]:
 for tr in t.all('tr')[1:]:
  cs=cells(tr)
  if len(cs)<4 or not links(cs[0]):continue
  nm=name(links(cs[0])[0]);ss=[period(name(l))for l in links(cs[2])];ss=[s for s in ss if s]
  if nm=='???':exclusions.append(dict(name=nm,sourceId=sid,reason='No answerable normalized name'));continue
  landmarks.append(dict(name=nm,seasons=ss,sourceId=sid))
# Island navigation explicitly separates Landmarks from Unnamed Locations and named POIs.
# These are chapter/island classifications only, not season-introduction or continuous-spawn proofs.
mapPlaces=[]
islands={'Athena':1,'Apollo':2,'Artemis':3,'Asteria':4,'Helios':5,'Oninoshima':6,'Springfield Island':6,'Golden Coast':7,'Shattered Coast':7,'Crossbones Isle':7}
for t in root.all('table'):
 rows=[tr for tr in t.all('tr')if next((p for p in tr.parents()if p.tag=='table'),None)is t]
 if not rows or rows[0].text()not in islands:continue
 island=rows[0].text();chapter=islands[island]
 def extract(table):
  direct=[tr for tr in table.all('tr')if next((p for p in tr.parents()if p.tag=='table'),None)is table]
  for tr in direct:
   cs=cells(tr)
   if len(cs)!=2 or cs[0].text()not in ['Landmarks','Unnamed Locations']:continue
   kind=cs[0].text()
   for l in links(cs[1]):
    nm=name(l)
    if nm in ['???','Minor Unnamed Locations']or'Category:'in nm:continue
    mapPlaces.append(dict(name=nm,chapter=chapter,island=island,kind=kind,sourceId=sid))
 if island in ['Athena','Apollo']:
  for tr in rows[1:]:
   cs=cells(tr)
   if len(cs)==2 and cs[0].text()==f'Chapter {chapter}':
    for sub in cs[1].all('table'):extract(sub)
 else:extract(t)
# NPC services are the complete explicitly labeled function taxonomy, not guessed vendor inventories.
root,serviceSid=read('Characters');services=[]
for tr in root.all('table')[0].all('tr')[2:]:
 cs=cells(tr)
 if len(cs)>=2:services.append(dict(name=cs[0].text(),sourceId=serviceSid))
# Factual function lists; Fire is explicitly BR and supplies both items and environmental methods.
root,sid=read('Fire');fire=[]
for tr in root.all('table')[0].all('tr')[1:]:
 cs=cells(tr)
 if len(cs)>=5:fire.append(dict(name=cs[0].text().removeprefix('Legacy '),sourceId=sid))
root,sid=read('Healing_Items');healing=[]
for t in root.all('table')[:7]:
 rows=t.all('tr');m=re.match(r'Chapter (\d)',rows[0].text()if rows else'')
 if not m:continue
 other=False
 for tr in rows[2:]:
  if'Exclusive to other modes'in tr.text():other=True;continue
  cs=cells(tr)
  if len(cs)!=5:continue
  nm=cs[0].text().removeprefix('Legacy ');nm=re.sub(r' \((Foraged|Consumable)\)$','',nm);text=cs[3].text();desc=cs[4].text()
  if other or'Exclusive to'in desc:continue
  hp=bool(re.search(r'Effective Health|\d+ Health|Health per',text));shield=bool(re.search(r'Effective Health|\d+ Shield|Shield per',text))
  overtime=bool(re.search(r'per tick|per second|over time',text))
  allies=bool(re.search(r'allies|all nearby players|splash area',desc,re.I))
  healing.append(dict(name=nm,chapter=int(m[1]),health=hp,shield=shield,overtime=overtime,allies=allies,foraged='Foraged'in cs[2].text(),sourceId=sid))
root,sid=read('Low_Gravity');lowGravity=[]
for tr in root.all('table')[0].all('tr')[2:]:
 cs=cells(tr)
 if len(cs)!=4:continue
 if'visual effect'in cs[2].text():continue
 lowGravity.append(dict(name=cs[0].text(),sourceId=sid))
mechanics=json.loads(Path('src/data/research/phase5b-mechanics-review.json').read_text())
for row in mechanics:
 _,row['sourceId']=read(row['page'])
# All 90 Companies category members were reviewed; factual food/drink types and
# explicit BR descriptions form the included list. STW-only Ballers Pub is excluded.
_,companyIndexSource=read('Category:Companies')
foodNames={"Barrel Restaurant","Big Shots","Bobom Milk Tea","BURD (Company)","Cuddle Buns","Double Plump Buffet","Dumpling","Durrr Burger","Durrr Sushi","Fork Knife","Madbuns","Meowscle's Morsels","Mmmmm!","Noms","Nugget Hut","Oink!","Peely's Banana Stand","Saucy Sausage","Scoops Ahoy","Shakes & Burgers","SoFDeeZ","Sticks","Tacos","Uncle Pete's Pizza Pit","Unnamed Bakery","Unnamed Cafe","Farmers Market","Flow (Company)","Joel's Pub","Kappa Kappa Pickle Co.","Puppuccino","Slap Co.","Slurp Co.","Snow Cones","Super Slurp Juice Co."}
foodBusinesses=[]
for row in index_file('companies-index'):
 if row['name']not in foodNames:continue
 root,source=read(row['page']);locs=[]
 for n in root.all('div'):
  if'infobox-row-container'not in n.a.get('class',''):continue
  cs=[d for d in n.kids if isinstance(d,N)]
  if len(cs)==2 and cs[0].text()in ['Location','Locations']:locs=[name(l)for l in links(cs[1])]
 foodBusinesses.append(dict(name=row['name'].replace(' (Company)',''),locations=locs,sourceId=source,indexSourceId=companyIndexSource))
root,sid=read('Henchmen');guards=[];when=None;active=False
for n in sorted(root.all('h2')+root.all('h3')+root.all('table'),key=lambda n:n.order):
 if n.tag=='h2':active=n.a.get('id')=='Henchmen'
 elif n.tag=='h3':when=period(n.text())
 elif active and when and n.tag=='table':
  if 'Impossible Escape!'in n.text():continue
  for tr in n.all('tr'):
   for td in cells(tr):
    bold=next((c for c in td.kids if isinstance(c,N)and c.tag=='b'),None)
    if bold and links(bold):guards.append(dict(name=name(links(bold)[0]),season=when,page=links(bold)[0].a.get('href','').split('/w/')[-1].split('#')[0],sourceId=sid))
lootProfiles=[]
for row in index_file('loot-review-index'):
 try:root,source=read(row['page'])
 except (OSError,AssertionError):continue
 vals={}
 for n in root.all('div'):
  if'infobox-row-container'not in n.a.get('class',''):continue
  cs=[d for d in n.kids if isinstance(d,N)]
  if len(cs)==2:vals[cs[0].text()]=cs[1].text()
 headers=sorted(root.all('h2')+root.all('h3')+root.all('h4'),key=lambda n:n.order);acquires=[]
 for li in root.all('li'):
  text=li.text()
  if not re.search(r'Can (?:currently )?be obtained by (?:eliminating|defeating)',text,re.I):continue
  modes=[p.a.get('data-title','')for p in li.parents()if'tabbertab'in p.a.get('class','').split()]
  if any(re.search(r'Reload|Creative|Fortnite OG|Blitz|LTM',m,re.I)for m in modes):continue
  previous=[h for h in headers if h.order<li.order]
  latestH2=next((h.text()for h in reversed(previous)if h.tag=='h2'),'')
  if re.search(r'Reload|Creative|Fortnite OG|Blitz|LTM',latestH2,re.I):continue
  when=next((period(h.text())for h in reversed(previous)if period(h.text())),None)
  if not when:continue
  explicit=[name(l)for l in links(li)if name(l)]
  norm=lambda nm:re.sub(r'^the ','',nm.casefold()).replace('’',"'")
  bossNames={norm(b['name']):b['name']for b in bosses};subject=next((bossNames[norm(nm)]for nm in explicit if norm(nm)in bossNames),None)
  if not subject:continue
  label=next(nm for nm in explicit if norm(nm)==norm(subject))
  tail=text[text.casefold().find(label.casefold())+len(label):]
  marker=re.search(r'\b(?:at|in|inside|near|between|outside|north(?:east|west)?|south(?:east|west)?|east|west)\b',tail,re.I)
  locationText=tail[marker.start():]if marker and' or 'not in tail[:marker.start()]else''
  near=bool(re.search(r'\b(?:near|between|outside|north(?:east|west)?|south(?:east|west)?|east|west)\b',locationText,re.I))
  places=[nm for nm in explicit if locationText and nm.casefold()in locationText.casefold()and norm(nm)not in bossNames and nm.casefold()not in ['boss','bosses','characters','battle royale']]
  acquires.append(dict(boss=subject,season=when,locations=places,near=near))
 sales=[]
 for li in root.all('li'):
  text=li.text()
  if not re.search(r'purchas|bought from|sold by',text,re.I):continue
  modes=[p.a.get('data-title','')for p in li.parents()if'tabbertab'in p.a.get('class','').split()]
  if any(re.search(r'Reload|Creative|Fortnite OG|Blitz|LTM',m,re.I)for m in modes):continue
  previous=[h for h in headers if h.order<li.order];latestH2=next((h.text()for h in reversed(previous)if h.tag=='h2'),'')
  if re.search(r'Reload|Creative|Fortnite OG|Blitz|LTM',latestH2,re.I):continue
  when=next((period(h.text())for h in reversed(previous)if period(h.text())),None)
  if not when:continue
  npcNames={n['name']for n in npcs};explicit=[name(l)for l in links(li)if name(l)]
  sellers=[nm for nm in explicit if nm in npcNames]
  for seller in sellers:sales.append(dict(npc=seller,season=when))
 cls=vals.get('Item Class','');kind='weapon'if re.search(r'Weapon|Rifle|Shotgun|Pistol|Crossbow|Bow|Minigun|Submachine Gun',cls,re.I)else'item'
 lootProfiles.append(dict(name=row['name'],sourceId=source,kind=kind,itemClass=cls,acquires=acquires,sales=sales))
# Versioned vault index: explicit season headers, no inferred current spawn windows.
root,sid=read('Vaults');vaults=[]
for t in root.all('table')[:10]:
 rows=t.all('tr');hasBoss=bool(rows and'Boss'in rows[0].text());when=None
 for tr in rows[1:]:
  cs=cells(tr)
  if len(cs)==1:
   candidate=period(cs[0].text())
   if candidate:when=candidate
   continue
  if not when or len(cs)<2:continue
  locs=[name(l)for l in links(cs[0])if name(l)]or[cs[0].text()]
  if not locs:continue
  bossNames=[]
  if hasBoss and len(cs)>2:
   for l in cs[2].all('a'):
    href=l.a.get('href','')
    if href.startswith('/w/File:'):
     from urllib.parse import unquote
     bossNames.append(unquote(href.split('/w/File:',1)[1]).split('_-_')[0].split('_(')[0].replace('_',' '))
  vaults.append(dict(locationText=cs[0].text(),locations=locs,bossNames=bossNames,season=when,sourceId=sid))
guardProfiles=[]
for row in index_file('guard-refs-index'):
 try:root,source=read(row['page'])
 except (OSError,AssertionError):continue
 factions=[]
 for n in root.all('div'):
  if'infobox-row-container'not in n.a.get('class',''):continue
  cs=[d for d in n.kids if isinstance(d,N)]
  if len(cs)==2 and cs[0].text()in ['Faction','Affiliation','Affiliations']:
   factions +=[name(l)for l in links(cs[1])if name(l)]
 factions=sorted(set(factions))
 # Multiple affiliations on a shared archetype page require scoped manual review.
 guardProfiles.append(dict(name=row['name'],sourceId=source,factions=factions if len(factions)==1 else[],ambiguousFactions=factions if len(factions)>1 else[]))
# Supplemental correction for a well-documented omission in the navigation index.
read('Motel')
result=dict(reviewedOn='2026-11-11',sources=list({s['id']:s for s in sources}.values()),items=items,bosses=bosses,npcLocations=npcs,bossLocations=bossLocations,vehicles=vehicles,gasStations=gas,upgradeBenches=benches,landmarks=landmarks,mapPlaces=mapPlaces,services=services,foodBusinesses=foodBusinesses,healing=healing,lowGravity=lowGravity,mechanics=mechanics,guards=guards,guardProfiles=guardProfiles,lootProfiles=lootProfiles,vaults=vaults,fire=fire,exclusions=exclusions)
args.output.write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
print({k:len(v)for k,v in result.items()if isinstance(v,list)})
