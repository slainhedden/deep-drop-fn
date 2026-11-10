import type { EntityAlias, EntityType, FortniteEntity } from '../../domain/types';
import { DATA_VERSION } from '../sources';
export type AliasSeed=string|[string,EntityAlias['kind'],EntityAlias['confidence']?];
type Facts=Record<string,string|number|boolean|string[]|number[]|undefined>;
export type Row=[string,string,number,Facts,AliasSeed[]?];
const alias=(value:AliasSeed):EntityAlias=>typeof value==='string'?{text:value,kind:'slang',confidence:'strong'}:{text:value[0],kind:value[1],confidence:value[2]??'strong'};
export const group=(type:EntityType,rows:Row[],sourceIds=['fn-wiki']):FortniteEntity[]=>rows.map(([id,name,familiarity,facts,aliases=[]])=>({id,name,type,familiarity,facts,aliases:aliases.map(alias),sourceIds,dataVersion:DATA_VERSION}));
