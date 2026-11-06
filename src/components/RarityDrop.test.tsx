import { render,screen } from '@testing-library/react';
import { describe,expect,it,vi } from 'vitest';
import { RarityDrop } from './RarityDrop';
import { questionPool } from '../engine/questions';
import type { RoundResult } from '../domain/types';

describe('rarity drop reveal',()=>{
 it('renders the six-tier Zapotron OG preview and final banner',()=>{
  vi.useFakeTimers();
  const question=questionPool().find(item=>item.validAnswerIds.includes('zapotron'))!;
  const round:RoundResult={question,result:{submitted:'Zapotron',canonicalAnswer:'Zapotron',answerId:'zapotron',correct:true,timedOut:false,points:1000,tier:'Legendary',explanation:'Preview',estimatedFrequency:.0001,frequencySource:'estimated'}};
  render(<RarityDrop round={round} demo onContinue={()=>undefined}/>);
  expect(screen.getAllByText('CHAPTER 1 OG').length).toBeGreaterThanOrEqual(2);
  expect(screen.getByText('Only you gave this answer!')).not.toBeNull();
  expect(screen.getByText('+1,000')).not.toBeNull();
  vi.runAllTimers();
  vi.useRealTimers();
 });
});
