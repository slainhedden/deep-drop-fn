import { useCallback,useEffect,useMemo,useRef,useState } from 'react';
import { BarChart3,CalendarDays,Check,ChevronLeft,ChevronRight,Clock3,Gift,Home,MapPin,Package,Settings,Shield,Star,Swords,Target,Trophy,UserRound,Zap } from 'lucide-react';
import type { GeneratedQuestion,RoundResult } from './domain/types';
import { dailySeed,generateGame } from './engine/questions';
import { suggestionsFor } from './engine/resolve';
import { validateAnswer } from './engine/validation';
import { loadStats,recordGame,type PlayerStats } from './storage/stats';
import { RarityDrop } from './components/RarityDrop';
import { questionPool } from './engine/questions';

type Screen='home'|'drop'|'game'|'results'|'leaderboard'|'stats'|'drops'|'demo';
type Mode='daily'|'practice';
const day=()=>new Date().toISOString().slice(0,10);
const fmt=(n:number)=>new Intl.NumberFormat('en-US').format(n);
const dropNumber=()=>Math.floor((Date.now()-Date.UTC(2026,0,1))/86400000)+1;
const demoQuestion=questionPool().find(question=>question.validAnswerIds.includes('zapotron'))!;
const demoRound:RoundResult={question:demoQuestion,result:{submitted:'Zapotron',canonicalAnswer:'Zapotron',answerId:'zapotron',correct:true,timedOut:false,points:1000,tier:'Legendary',explanation:'Animation preview',frequencySource:'estimated',estimatedFrequency:.0001,matchedVia:'canonical'}};

export default function App(){
 const [screen,setScreen]=useState<Screen>('home');
 const [mode,setMode]=useState<Mode>('daily');
 const [questions,setQuestions]=useState<GeneratedQuestion[]>([]);
 const [round,setRound]=useState(0);
 const [results,setResults]=useState<RoundResult[]>([]);
 const [answer,setAnswer]=useState('');
 const [locked,setLocked]=useState(false);
 const [seconds,setSeconds]=useState(20);
 const [stats,setStats]=useState<PlayerStats>(loadStats);
 const finalized=useRef(false);
 const inputRef=useRef<HTMLInputElement>(null);
 const question=questions[round];
 const current=results.length===round+1?results[results.length-1]:undefined;
 const total=results.reduce((sum,item)=>sum+item.result.points,0);

 const openDrop=()=>setScreen('drop');
 const start=useCallback((nextMode:Mode)=>{
  const seed=nextMode==='daily'?dailySeed():`practice-${Date.now()}`;
  setMode(nextMode);setQuestions(generateGame(seed,7));setRound(0);setResults([]);setAnswer('');setLocked(false);setSeconds(20);setScreen('game');finalized.current=false;
 },[]);
 const submit=useCallback((timedOut=false)=>{
  if(!question||locked)return;
  setResults(previous=>[...previous,{question,result:validateAnswer(question,answer,timedOut)}]);setLocked(true);
 },[answer,locked,question]);
 useEffect(()=>{if(screen!=='game'||locked||!question)return;if(seconds<=0){submit(true);return}const timer=window.setTimeout(()=>setSeconds(v=>v-1),1000);return()=>window.clearTimeout(timer)},[screen,locked,question,seconds,submit]);
 useEffect(()=>{if(screen==='game'&&!locked)inputRef.current?.focus()},[screen,round,locked]);
 const next=()=>{if(round+1>=questions.length){if(!finalized.current){setStats(recordGame(results,mode==='daily'?'daily':'unlimited',day()));finalized.current=true}setScreen('results');return}setRound(v=>v+1);setAnswer('');setLocked(false);setSeconds(20)};
 const navigate=(nextScreen:Screen)=>{setScreen(nextScreen);if(nextScreen!=='game'){setQuestions([]);setResults([])}};
 return <div className="page"><div className="phone-app">
  {screen==='game'?<GameHeader round={round} total={questions.length} score={total}/>:<Header/>}
  <div className="screen">
   {screen==='home'&&<HomeScreen onPlay={openDrop} streak={stats.currentStreak}/>} 
   {screen==='drop'&&<DropScreen stats={stats} onStart={start} onPreview={()=>setScreen('demo')}/>} 
   {screen==='game'&&question&&<GameScreen question={question} round={round} total={questions.length} seconds={seconds} score={total} answer={answer} setAnswer={setAnswer} locked={locked} onSubmit={()=>submit(false)} current={current} onNext={next} inputRef={inputRef}/>} 
   {screen==='results'&&<Results results={results} score={total} onAgain={openDrop} onLeaderboard={()=>navigate('leaderboard')}/>} 
   {screen==='leaderboard'&&<Leaderboard stats={stats}/>} 
   {screen==='stats'&&<Stats stats={stats}/>} 
   {screen==='drops'&&<Drops stats={stats}/>} 
   {screen==='demo'&&<RarityDrop round={demoRound} demo onContinue={()=>setScreen('drop')}/>} 
  </div>
  {screen!=='game'&&screen!=='results'&&screen!=='demo'&&<BottomNav active={screen} navigate={navigate}/>} 
 </div></div>;
}

function Brand(){return <div className="brand"><span>DEEP</span><b>DROP</b><em>FN</em></div>}
function Header(){return <header className="topbar"><button className="gear" aria-label="Settings"><Settings/></button><Brand/><div className="top-spacer"/></header>}
function GameHeader({round,total,score}:{round:number;total:number;score:number}){return <><header className="topbar game-top"><button className="gear" aria-label="Settings"><Settings/></button><Brand/><div className="live-score">{fmt(score)}</div></header><div className="game-progress"><span>Q{round+1} of {total}</span><div>{Array.from({length:total},(_,i)=><i key={i} className={i<round?'done':i===round?'active':''}/>)}</div></div></>}

function HomeScreen({onPlay,streak}:{onPlay:()=>void;streak:number}){return <section className="splash scene">
 <div className="crown">♛</div><div className="hero-brand"><Brand/></div>
 <div className="drop-orb"><Zap/><span/></div>
 <h1>The daily Fortnite trivia game.</h1><p>The rarer your answer, the more points you earn.</p>
 <div className="benefits"><span><CalendarDays/>New questions every day</span><span><Swords/>Challenge the same seven prompts</span><span><Zap/>Prove your deep-cut knowledge</span></div>
 <button className="lime-button" onClick={onPlay}>PLAY TODAY <ChevronRight/></button>{streak>0&&<small className="streak-note">🔥 {streak} day streak</small>}
 </section>}

function DropScreen({stats,onStart,onPreview}:{stats:PlayerStats;onStart:(mode:Mode)=>void;onPreview:()=>void}){
 const dailyDone=stats.completedDailyDates.includes(day());
 const preview=generateGame(dailySeed(),7);
 const counts=preview.reduce<Record<string,number>>((all,q)=>({...all,[q.category]:(all[q.category]??0)+1}),{});
 const icons:Record<string,React.ReactNode>={Weapons:<Zap/>,Locations:<MapPin/>,Skins:<UserRound/>,Events:<Star/>,Items:<Package/>,Vehicles:<Swords/>,Crossovers:<Star/>};
 return <section className="drop-screen scene"><div className="daily-title"><CalendarDays/><div><h1>DAILY DROP #{String(dropNumber()).padStart(3,'0')}</h1><p>Everyone gets the same seven questions.</p></div></div>
  <div className="topic-card"><h2>Today’s Topics</h2>{Object.entries(counts).map(([name,count])=><div className="topic" key={name}><span>{icons[name]}</span><b>{name}</b><em>{count}</em></div>)}<div className="reset"><Clock3/>Resets at <b>00:00 UTC</b></div></div>
  {!dailyDone?<button className="lime-button" onClick={()=>onStart('daily')}>START GAME <ChevronRight/></button>:<><div className="completed"><Check/>Today’s ranked drop is complete</div><button className="lime-button" onClick={()=>onStart('practice')}>PRACTICE AGAIN <ChevronRight/></button></>}
  <button className="preview-drop" onClick={onPreview}><Zap/> Preview Chapter 1 OG reveal</button>
 </section>}

function GameScreen({question,round,total,seconds,score,answer,setAnswer,locked,onSubmit,current,onNext,inputRef}:{question:GeneratedQuestion;round:number;total:number;seconds:number;score:number;answer:string;setAnswer:(value:string)=>void;locked:boolean;onSubmit:()=>void;current?:RoundResult;onNext:()=>void;inputRef:React.RefObject<HTMLInputElement|null>}){
 const suggestions=useMemo(()=>suggestionsFor(answer,question.answerType,3),[answer,question.answerType]);
 if(locked&&current)return <Feedback round={current} onNext={onNext} last={round+1===total}/>;
 return <section className="game-screen scene"><div className={`clock ${seconds<=5?'urgent':''}`}><Clock3/>00:{String(seconds).padStart(2,'0')}</div>
  <div className="question-card"><span>{question.category.toUpperCase()}</span><h1>{question.prompt}</h1><small>{question.validAnswerIds.length} verified answers</small></div>
  <form onSubmit={event=>{event.preventDefault();if(answer.trim())onSubmit()}} className="game-form"><label htmlFor="answer">YOUR ANSWER</label><input ref={inputRef} id="answer" value={answer} onChange={e=>setAnswer(e.target.value)} placeholder="Type a name or nickname…" autoComplete="off"/>
   {suggestions.length>0&&<div className="suggestions">{suggestions.map(item=><button type="button" key={item.id} onClick={()=>setAnswer(item.name)}>{item.name}</button>)}</div>}
   <small>Slang and small typos count. Suggestions search the full catalog.</small><button className="lime-button" disabled={!answer.trim()}>SUBMIT <ChevronRight/></button>
  </form><div className="score-corner">SCORE <b>{fmt(score)}</b></div>
 </section>}

function Feedback({round,onNext,last}:{round:RoundResult;onNext:()=>void;last:boolean}){const a=round.result;if(a.correct)return <RarityDrop round={round} onContinue={onNext}/>;return <section className="reveal scene lose">
 <span className="reveal-label">NO POINTS</span><h1>{a.timedOut?'TIME’S UP':a.submitted||'NO ANSWER'}</h1>
 <div className="reveal-art"><Shield/><i/><i/></div>
 <div className="big-points zero">+0 <small>POINTS</small></div><p>{a.explanation}</p>
 <div className="verified-box"><UserRound/>1 of {round.question.validAnswerIds.length} verified answers in this prompt</div><button className="lime-button" onClick={onNext}>{last?'VIEW RESULTS':'NEXT QUESTION'} <ChevronRight/></button>
 </section>}

function Results({results,score,onAgain,onLeaderboard}:{results:RoundResult[];score:number;onAgain:()=>void;onLeaderboard:()=>void}){const correct=results.filter(r=>r.result.correct);const best=[...correct].sort((a,b)=>b.result.points-a.result.points)[0];return <section className="results scene"><h2>DAILY DROP #{String(dropNumber()).padStart(3,'0')}</h2><span>Results</span><div className="score-burst"><small>TOTAL SCORE</small><strong>{fmt(score)}</strong></div><div className="rank-line"><Trophy/>Your score is saved on this device</div><div className="result-grid"><div><Target/><b>{correct.length}/{results.length}</b><small>Correct</small></div><div><BarChart3/><b>{correct.length?Math.round(score/correct.length):0}</b><small>Avg points</small></div></div><div className="best-answer"><Zap/><span><small>BEST ANSWER</small><b>{best?.result.canonicalAnswer??'—'}</b></span><strong>+{best?.result.points??0}</strong></div><button className="lime-button" onClick={onLeaderboard}>VIEW LEADERBOARD</button><button className="ghost-button" onClick={onAgain}>PLAY AGAIN <ChevronRight/></button></section>}

function Leaderboard({stats}:{stats:PlayerStats}){return <section className="standard"><h1>LEADERBOARD</h1><p>Daily Drop #{String(dropNumber()).padStart(3,'0')}</p><div className="tabs"><b>THIS DEVICE</b><span>FRIENDS — SOON</span></div><div className="leader-row you"><span>1</span><div><b>You</b><small>Personal best</small></div><strong>{fmt(stats.highScore)}</strong></div><div className="empty-card"><Swords/><h2>Friend rankings are next</h2><p>The current MVP keeps scores honest on each device. Shared rooms and verified global ranks need the multiplayer service.</p></div></section>}

function Stats({stats}:{stats:PlayerStats}){return <section className="standard"><h1>MY STATS</h1><div className="stat-grid"><div><span>🔥</span><b>{stats.currentStreak}</b><small>Day Streak</small></div><div><BarChart3/><b>{fmt(stats.highScore)}</b><small>Best Score</small></div><div><Target/><b>{stats.totalAnswers?Math.round(stats.correctAnswers/stats.totalAnswers*100):0}%</b><small>Accuracy</small></div><div><Star/><b>{fmt(stats.totalScore)}</b><small>Total Points</small></div></div><h2>Answer History</h2><div className="history">{stats.recentAnswers.length?stats.recentAnswers.slice(0,6).map((item,index)=><div key={`${item.name}-${index}`}><Zap/><span><b>{item.name}</b><small>{item.tier}</small></span><strong>+{item.points}</strong></div>):<p>Play a drop to start your history.</p>}</div></section>}

function Drops({stats}:{stats:PlayerStats}){const now=new Date();const year=now.getUTCFullYear(),month=now.getUTCMonth();const count=new Date(Date.UTC(year,month+1,0)).getUTCDate();const first=new Date(Date.UTC(year,month,1)).getUTCDay();return <section className="standard"><h1>DAILY DROPS</h1><div className="calendar"><div className="month"><ChevronLeft/><b>{now.toLocaleString('en',{month:'long',timeZone:'UTC'}).toUpperCase()}</b><ChevronRight/></div><div className="week">{['S','M','T','W','T','F','S'].map((d,i)=><span key={`${d}${i}`}>{d}</span>)}</div><div className="days">{Array.from({length:first},(_,i)=><i key={`blank${i}`}/>)}{Array.from({length:count},(_,i)=>{const date=`${year}-${String(month+1).padStart(2,'0')}-${String(i+1).padStart(2,'0')}`;const done=stats.completedDailyDates.includes(date);return <span key={date} className={done?'done':date===day()?'today':''}>{done?'✓':i+1}</span>})}</div></div><div className="drop-milestones"><div>🔥<b>{stats.currentStreak}</b><small>Day Streak</small></div><div>🎁<b>{Math.max(0,7-stats.currentStreak%7)} Days</b><small>Next Milestone</small></div></div></section>}

function BottomNav({active,navigate}:{active:Screen;navigate:(screen:Screen)=>void}){const items:[Screen,React.ReactNode,string][]=[['home',<Home/>,'Home'],['leaderboard',<Trophy/>,'Leaderboard'],['stats',<BarChart3/>,'Stats'],['drops',<Gift/>,'Drops']];return <nav className="bottom-nav">{items.map(([screen,icon,label])=><button key={screen} className={active===screen?'active':''} onClick={()=>navigate(screen)}>{icon}<span>{label}</span></button>)}</nav>}
