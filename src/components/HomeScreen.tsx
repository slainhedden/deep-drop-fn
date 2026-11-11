import {CalendarDays,ChevronRight,Swords,Zap} from 'lucide-react';
import {Brand} from './AppFrame';
export function HomeScreen({onPlay,streak,onPrepare}:{onPlay:()=>void;streak:number;onPrepare?:()=>void}){return <section className="splash scene">
 <div className="crown">♛</div><div className="hero-brand"><Brand/></div>
 <div className="drop-orb"><Zap/><span/></div>
 <h1>The daily Fortnite trivia game.</h1><p>The rarer your answer, the more points you earn.</p>
 <div className="benefits"><span><CalendarDays/>New questions every day</span><span><Swords/>Challenge the same seven prompts</span><span><Zap/>Prove your deep-cut knowledge</span></div>
 <button className="lime-button" onClick={onPlay} onPointerEnter={onPrepare} onFocus={onPrepare}>PLAY TODAY <ChevronRight/></button>{streak>0&&<small className="streak-note">🔥 {streak} day streak</small>}
 </section>}

