import { group, type AliasSeed, type Row } from './base-helpers';
const poi=(id:string,name:string,familiarity:number,chapters:number[],aliases:AliasSeed[]=[]):Row=>[id,name,familiarity,{chapters,namedPoi:true},aliases];
export const locations=group('location',[
 poi('tilted','Tilted Towers',.99,[1,2,3,4],['tilted']),poi('pleasant','Pleasant Park',.96,[1,2],['pleasant','PP']),poi('retail','Retail Row',.88,[1,2],['retail']),poi('salty','Salty Springs',.91,[1,2],['salty']),poi('risky','Risky Reels',.72,[1,2,3],['risky']),
 poi('lonely','Lonely Lodge',.5,[1],['lonely']),poi('haunted','Haunted Hills',.53,[1],['haunted']),poi('junk','Junk Junction',.45,[1],['junk']),poi('snobby','Snobby Shores',.49,[1],['snobby']),poi('wailing','Wailing Woods',.67,[1],['wailing']),
 poi('greasy','Greasy Grove',.83,[1,3],['greasy']),poi('dusty-depot','Dusty Depot',.82,[1],['dusty']),poi('dusty-divot','Dusty Divot',.78,[1],['divot']),poi('loot-lake','Loot Lake',.89,[1],['loot']),poi('fatal','Fatal Fields',.75,[1],['fatal']),
 poi('flush','Flush Factory',.62,[1,2],['flush']),poi('tomato','Tomato Town',.7,[1],['tomato']),poi('moisty','Moisty Mire',.58,[1],['moisty']),poi('shifty','Shifty Shafts',.7,[1,3],['shifty']),poi('lucky','Lucky Landing',.62,[1],['lucky']),
 poi('paradise','Paradise Palms',.72,[1],['paradise']),poi('lazy-links','Lazy Links',.64,[1],['links']),poi('happy','Happy Hamlet',.57,[1],['happy']),poi('polar','Polar Peak',.65,[1],['polar']),poi('agency','The Agency',.93,[2],['agency']),
 poi('misty','Misty Meadows',.76,[2],['misty']),poi('lazy-lake','Lazy Lake',.78,[2]),poi('holly','Holly Hedges',.65,[2],['holly']),poi('craggy','Craggy Cliffs',.58,[2],['craggy']),poi('steamy','Steamy Stacks',.67,[2],['steamy']),
 poi('slurpy','Slurpy Swamp',.72,[2],['slurpy']),poi('dirty','Dirty Docks',.57,[2],['dirty']),poi('sweaty','Sweaty Sands',.72,[2],['sweaty']),poi('frenzy-farm','Frenzy Farm',.7,[2],['frenzy farm']),poi('weeping','Weeping Woods',.68,[2],['weeping']),
 poi('grotto','The Grotto',.86,[2],['grotto']),poi('rig','The Rig',.73,[2],['rig']),poi('yacht','The Yacht',.78,[2],['yacht']),poi('catty','Catty Corner',.68,[2],['catty']),poi('coral','Coral Castle',.67,[2],['coral']),
],['epic-map','fn-wiki']);
