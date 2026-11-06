import { describe,expect,it } from 'vitest';
import { entitiesByType } from '../data/entities';
import { resolveAnswer,suggestionsFor } from './resolve';

describe('Fortnite answer resolver',()=>{
 const weapons=entitiesByType('weapon');
 it('accepts curated kid slang',()=>expect(resolveAnswer('tac shotty',weapons).entity?.name).toBe('Tactical Shotgun'));
 it('accepts a clear transposition typo',()=>expect(resolveAnswer('tactial shotgun',weapons)).toMatchObject({entity:{name:'Tactical Shotgun'},via:'autocorrect'}));
 it('does not turn a different-looking name into an answer',()=>expect(resolveAnswer('Pumped Shotgun',weapons).entity).toBeUndefined());
 it('offers catalog-wide prefix suggestions',()=>expect(suggestionsFor('tac sh','weapon').some(entity=>entity.name==='Tactical Shotgun')).toBe(true));
});
