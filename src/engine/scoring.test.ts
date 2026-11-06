import { describe,expect,it } from 'vitest';
import { rarityTier, scoreFrequency, smoothedObservedFrequency } from './scoring';

describe('rarity scoring',()=>{
  it('rewards lower answer frequency',()=>expect(scoreFrequency(.02)).toBeGreaterThan(scoreFrequency(.20)));
  it('keeps scores on the 100–1000 scale',()=>{expect(scoreFrequency(0)).toBe(1000);expect(scoreFrequency(1)).toBe(100)});
  it('maps presentation tiers at documented boundaries',()=>{expect(rarityTier(249)).toBe('Very Common');expect(rarityTier(850)).toBe('Legendary')});
  it('uses a prior to control sparse observed samples',()=>expect(smoothedObservedFrequency(0,1,.2)).toBeGreaterThan(.15));
});
