import fs from 'node:fs';
import crypto from 'node:crypto';
// Inputs are saved responses, not executable code. No remote JavaScript is evaluated.
const [apiPath,ggPath,shopPath]=process.argv.slice(2);
if(!apiPath||!ggPath||!shopPath)throw new Error('Usage: node scripts/import-cosmetics.mjs api.json gg-all.en.js shop.json');
const apiRaw=fs.readFileSync(apiPath,'utf8'),ggRaw=fs.readFileSync(ggPath,'utf8'),shopRaw=fs.readFileSync(shopPath,'utf8');
const strings=[];
let data=ggRaw.split('Items=')[1].replace(/"(?:\\.|[^"\\])*"/g,s=>`STRINGTOKEN${strings.push(s)-1}`);
data=data.replace(/([{,])\s*([A-Za-z_$][\w$]*):/g,'$1"$2":').replace(/,\s*([\]}])/g,'$1').replace(/STRINGTOKEN(\d+)/g,(_,i)=>strings[Number(i)]);
const gg=JSON.parse(data),api=JSON.parse(apiRaw).data,shop=JSON.parse(shopRaw).data;
if(!shop.date?.startsWith('2026-11-10'))throw new Error('This importer is pinned to the November 10 UTC snapshot. Update source IDs and the data version before importing another date.');
const types={outfit:1,backpack:2,pickaxe:3,glider:4,contrail:5,emote:6,wrap:7,loadingscreen:12,music:13,spray:9,emoji:10};
const normalize=s=>s.normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]/g,'');
const key=(type,name)=>`${type}:${normalize(name)}`;
const released=gg.filter(r=>Object.values(types).includes(r.type)&&!r.t?.includes(17)&&r.source&&r.name&&!/^(?:TBD|TBA|TODO|\[)/i.test(r.name));
const byName=new Map();for(const r of released){const k=key(r.type,r.name);byName.set(k,[...(byName.get(k)??[]),r]);}
const currentShop=new Map(),bundles=[];
for(const offer of shop.entries??[]){
 const items=offer.brItems??[];
 for(const item of items)currentShop.set(item.id.toLowerCase(),true);
 if(offer.bundle?.name&&items.length>1){
  const id=`offer-${offer.offerId}`;bundles.push({id,name:offer.bundle.name,itemIds:items.map(i=>i.id.toLowerCase())});
 }
}
const groups=new Map(),excluded=[];
for(const r of api){
 if(!types[r.type.value])continue;
 const matches=byName.get(key(types[r.type.value],r.name))??[];
 if(!matches.length&&!currentShop.has(r.id.toLowerCase())){excluded.push({id:r.id,name:r.name,reason:'No released identity corroboration in the reviewed catalog or current shop.'});continue;}
 const k=key(types[r.type.value],r.name);groups.set(k,[...(groups.get(k)??[]),r]);
}
const seriesName=s=>({'MARVEL SERIES':'Marvel Series','DC SERIES':'DC Series','DARK SERIES':'Dark Series','CREW SERIES':'Crew Series'}[s]??s);
const rows=[],duplicates=[],ambiguous=[];
for(const [k,list] of groups){
 const ggMatches=byName.get(k)??[];
 const fingerprints=new Set(list.map(r=>JSON.stringify([r.type.value,r.rarity.backendValue,r.set?.backendValue,r.introduction?.text])));
 if(fingerprints.size>1||ggMatches.length>1){ambiguous.push({key:k,ids:list.map(r=>r.id),reason:'Conflicting same-name metadata; not bulk merged.'});continue;}
 list.sort((a,b)=>Number(/TBD|CINE|NPC|TEST/i.test(a.id))-Number(/TBD|CINE|NPC|TEST/i.test(b.id))||a.id.localeCompare(b.id));
 const a=list[0],g=ggMatches[0];
 if(list.length>1)duplicates.push({canonical:a.id,merged:list.slice(1).map(r=>r.id)});
 const ids=list.map(r=>r.id.toLowerCase());
 const rarity=(a.rarity.backendValue??'').replace('EFortRarity::','').toLowerCase();
 const memberships=bundles.filter(b=>b.itemIds.some(id=>ids.includes(id))).map(({id,name})=>({kind:'bundle',id,name,sourceId:'fnapi-shop-2026-11-10'}));
 if(a.set?.backendValue)memberships.push({kind:'set',id:a.set.backendValue,name:a.set.value,sourceId:'fnapi-cosmetics-2026-11-10'});
 rows.push({id:a.id,name:a.name,type:a.type.value,rarity,series:seriesName(a.series?.value??''),chapter:a.introduction?.chapter??'',season:a.introduction?.season??'',catalogAddedAt:a.added,externalIds:list.map(r=>r.id),ggId:g?.id??0,shopSource:ids.some(id=>currentShop.has(id))?'fnapi-shop-2026-11-10':'fngg-cosmetics-2026-11-10',shop:ids.some(id=>currentShop.has(id))||Boolean(g?.l&&g.l<=261110&&(g.source===1||g.O===1)),battlePass:(g?.source===3||g?.O===3)&&a.introduction?.season!=='OG',memberships});
}
// Released catalog records with no API-name match retain the catalog's own stable identity.
const used=new Set(rows.map(r=>key(types[r.type],r.name)));
const rarities={1:'common',2:'uncommon',3:'rare',4:'epic',5:'legendary'};
const series={6:'Dark Series',7:'Frozen Series',8:'Lava Series',9:'Shadow Series',10:'Slurp Series',11:'Icon Series',12:'Star Wars Series',13:'DC Series',14:'Marvel Series',15:'Gaming Legends Series'};
for(const [k,list] of byName){if(used.has(k)||groups.has(k)||list.length!==1)continue;const g=list[0];
 rows.push({id:`gg-${g.id}`,name:g.name,type:Object.keys(types).find(t=>types[t]===g.type),rarity:rarities[g.r]??'',series:series[g.rarity]??'',chapter:'',season:'',catalogAddedAt:'',externalIds:[],ggId:g.id,shopSource:'fngg-cosmetics-2026-11-10',shop:Boolean(g.l&&g.l<=261110&&(g.source===1||g.O===1)),battlePass:g.source===3||g.O===3,memberships:[]});
}
rows.sort((a,b)=>a.id.localeCompare(b.id));
fs.writeFileSync('src/data/cosmetics/catalog.json','[\n'+rows.map(r=>JSON.stringify(r)).join(',\n')+'\n]\n');
const hash=s=>crypto.createHash('sha256').update(s).digest('hex');
fs.writeFileSync('docs/phase4b-cosmetic-import.json',JSON.stringify({retrievedOn:'2026-11-10',api:{url:'https://fortnite-api.com/v2/cosmetics/br',sha256:hash(apiRaw),records:api.length},catalog:{url:'https://fortnite.gg/data/items/all.en.js',sha256:hash(ggRaw),records:gg.length},shop:{url:'https://fortnite-api.com/v2/shop',sha256:hash(shopRaw),date:shop.date,bundles:bundles.length},imported:rows.length,duplicates,ambiguous,excluded,types:Object.fromEntries(Object.keys(types).map(t=>[t,rows.filter(r=>r.type===t).length]))},null,2)+'\n');
console.log(`Imported ${rows.length} records, merged ${duplicates.length} duplicate groups, withheld ${ambiguous.length} conflicting groups.`);
