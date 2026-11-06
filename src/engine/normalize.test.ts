import { describe,expect,it } from 'vitest';
import { normalizeAnswer } from './normalize';

describe('normalizeAnswer',()=>{
  it('normalizes case, whitespace and punctuation',()=>expect(normalizeAnswer('  Bolt–Action   Sniper Rifle! ')).toBe('bolt action sniper rifle'));
  it('normalizes unicode accents',()=>expect(normalizeAnswer('ÉZIO AUDITORE')).toBe('ezio auditore'));
  it('normalizes apostrophes without merging unrelated words',()=>expect(normalizeAnswer('Doctor Doom’s')).toBe('doctor dooms'));
});
