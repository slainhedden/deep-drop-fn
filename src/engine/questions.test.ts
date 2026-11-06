import { describe,expect,it } from 'vitest';
import { dailySeed, generateGame, questionPool } from './questions';

describe('question generation',()=>{
  it('only emits answerable questions',()=>{
    for(const question of questionPool()) expect(question.validAnswerIds.length).toBeGreaterThanOrEqual(5);
  });
  it('produces reproducible daily games',()=>{
    const date=new Date('2026-11-05T18:00:00Z');
    expect(generateGame(dailySeed(date),10).map(q=>q.id)).toEqual(generateGame(dailySeed(date),10).map(q=>q.id));
  });
  it('changes the seed at the UTC boundary',()=>{
    expect(dailySeed(new Date('2026-11-05T23:59:59Z'))).not.toBe(dailySeed(new Date('2026-11-06T00:00:00Z')));
  });
  it('supports category filtering',()=>expect(generateGame('weapons',5,['Weapons']).every(q=>q.category==='Weapons')).toBe(true));
});
