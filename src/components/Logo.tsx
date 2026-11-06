import { Zap } from 'lucide-react';

export function Logo({compact=false}:{compact?:boolean}) {
  return <div className="logo" aria-label="Storm Rare home"><span className="logo-mark"><Zap size={20} fill="currentColor" /></span>{!compact && <span>STORM<span>RARE</span></span>}</div>;
}
