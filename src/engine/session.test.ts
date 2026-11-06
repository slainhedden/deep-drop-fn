import { describe,expect,it } from 'vitest';
import { questionPool } from './questions';
import { RoundGate } from './session';

describe('RoundGate',()=>{
  const question=questionPool().find(q=>q.templateId==='skin-battle-pass')!;
  it('locks the first answer per player',()=>{
    const gate=new RoundGate(question,2000);
    const first=gate.submit({playerId:'p1',questionId:question.id,answer:'Midas',receivedAt:1000});
    const second=gate.submit({playerId:'p1',questionId:question.id,answer:'not valid',receivedAt:1200});
    expect(second).toEqual(first);expect(second.correct).toBe(true);
  });
  it('enforces the authoritative deadline',()=>expect(new RoundGate(question,1000).submit({playerId:'p1',questionId:question.id,answer:'Midas',receivedAt:1001}).timedOut).toBe(true));
});
