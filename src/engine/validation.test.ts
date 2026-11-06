import { describe,expect,it } from 'vitest';
import { questionPool } from './questions';
import { validateAnswer } from './validation';

describe('answer validation',()=>{
  const shotgun=questionPool().find(q=>q.templateId==='weapon-class'&&q.parameters.weaponClass==='shotgun')!;
  it('accepts harmless capitalization and spacing',()=>expect(validateAnswer(shotgun,'  PUMP   shotgun ').canonicalAnswer).toBe('Pump Shotgun'));
  it('does not use unrestricted fuzzy matching',()=>expect(validateAnswer(shotgun,'Pumped Shotgun').correct).toBe(false));
  it('rejects a real weapon outside the predicate',()=>expect(validateAnswer(shotgun,'Assault Rifle').correct).toBe(false));
  it('scores timeouts as zero',()=>expect(validateAnswer(shotgun,'Pump Shotgun',true)).toMatchObject({correct:false,timedOut:true,points:0}));
});
