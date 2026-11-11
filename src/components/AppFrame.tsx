import type {ReactNode} from 'react';
import {CalendarDays,Check,Clock3,Home,Swords,Trophy,Zap} from 'lucide-react';
import type {RoundResult} from '../domain/types';
import type {PlayerStats} from '../storage/stats';
export type AppScreen='home'|'drop'|'game'|'results'|'leaderboard'|'stats'|'drops'|'demo';
export type InitialRoute=AppScreen|'practice';
export function Brand(){return <div className="brand"><span>DEEP</span><b>DROP</b><em>FN</em></div>}
export function AppFrame({children,screen,mode='daily',stats,results=[],round=0,onDaily,onPractice,onHome}:{children:ReactNode;screen:AppScreen;mode?:'daily'|'practice';stats:PlayerStats;results?:RoundResult[];round?:number;onDaily:()=>void;onPractice:()=>void;onHome:()=>void}){
 const playing=screen==='game';const score=results.reduce((sum,r)=>sum+r.result.points,0);
 const drops=results.length?results.slice(-4).reverse().map(r=>({name:r.result.canonicalAnswer??'Time’s up',points:r.result.points})):stats.recentAnswers.slice(0,4);
 return <div className={`page desktop-layout screen-${screen}`}>
  <aside className="desktop-panel navigation-panel" aria-label="Game navigation and progress">
   <div className="desktop-wordmark"><Brand/><span>FORTNITE TRIVIA</span></div>
   <nav className="desktop-mode-nav"><button disabled={playing} onClick={onDaily} className={mode==='daily'?'selected':''}><CalendarDays/><span>Daily Drop<small>One shared challenge. Seven rounds.</small></span></button><button disabled={playing} onClick={onPractice} className={mode==='practice'?'selected':''}><Swords/><span>Unlimited<small>Fresh questions. Keep dropping.</small></span></button><button disabled={playing} onClick={onHome}><Home/><span>Home</span></button></nav>
   <section className="desktop-card"><div className="panel-eyebrow">{playing?'THIS RUN':screen==='results'?'DROP COMPLETE':'YOUR NEXT DROP'}</div><h2>{playing?`Round ${round+1} of 7`:screen==='results'?'Seven rounds. One drop.':'Seven chances to go rare.'}</h2><ol className="desktop-rounds">{Array.from({length:7},(_,i)=><li key={i} className={results[i]?'complete':playing&&i===round?'current':''}><span>{results[i]?<Check/>:String(i+1).padStart(2,'0')}</span><b>{results[i]?(results[i].result.canonicalAnswer??'Time’s up'):playing&&i===round?'You’re up':'Round '+(i+1)}</b>{results[i]&&<em>+{results[i].result.points}</em>}</li>)}</ol></section>
   <div className="panel-footnote"><Clock3/>20 seconds. Trust your Fortnite knowledge.</div>
  </aside>
  <div className="phone-app">{children}</div>
  <aside className="desktop-panel insights-panel" aria-label="Score and recent drops">
   <section className="desktop-card score-panel"><div className="panel-eyebrow">{playing?'RUN SCORE':'PERSONAL BEST'}</div><Trophy/><strong>{(playing?score:stats.highScore).toLocaleString()}</strong><span>POINTS</span></section>
   <section className="desktop-card"><div className="panel-eyebrow">{results.length?'THIS RUN':'ON THIS DEVICE'}</div><h2>Recent drops</h2><div className="recent-drop-list">{drops.length?drops.map((drop,i)=><div key={i}><Zap/><span>{drop.name}</span><b>+{drop.points}</b></div>):<p>Your answers land here. The rarer the answer, the bigger the drop.</p>}</div></section>
   <section className="desktop-card play-guide"><div className="panel-eyebrow">HOW TO DROP</div><h2>Think familiar. Go rare.</h2><p>Any valid answer counts. An unusual answer earns more estimated rarity points.</p><p>A missed guess? Try again before the timer ends.</p><p>Type three letters for suggestions that match your question.</p></section>
  </aside>
 </div>;
}
