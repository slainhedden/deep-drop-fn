import { useEffect,useMemo,useState } from 'react';
import { ChevronRight,FastForward,Share2,Sparkles } from 'lucide-react';
import type { RoundResult } from '../domain/types';

const TIERS=[
 {name:'NOOB',range:'50%+ of players',color:'#a9afb9',glow:'#d7dae0'},
 {name:'BOT',range:'10–50% of players',color:'#65db59',glow:'#9dff7e'},
 {name:'BUILDER',range:'2–10% of players',color:'#39a9ff',glow:'#65d5ff'},
 {name:'CRACKED',range:'0.5–2% of players',color:'#a94cff',glow:'#e174ff'},
 {name:'VETERAN',range:'Under 0.5%',color:'#ffbd25',glow:'#fff07b'},
 {name:'CHAPTER 1 OG',range:'Only player',color:'#ffd63e',glow:'#fff5a5'},
] as const;

function targetTier(round:RoundResult,demo:boolean):number{
 if(demo)return 5;
 const frequency=round.result.estimatedFrequency??1;
 if(frequency>=.5)return 0;
 if(frequency>=.1)return 1;
 if(frequency>=.02)return 2;
 if(frequency>=.005)return 3;
 return 4;
}

function rateLabel(round:RoundResult,demo:boolean){
 if(demo)return 'Only you gave this answer!';
 const rate=(round.result.estimatedFrequency??0)*100;
 const formatted=rate<.1?rate.toFixed(2):rate<1?rate.toFixed(1):Math.round(rate).toString();
 return `~${formatted}% estimated answer rate`;
}

export function RarityDrop({round,onContinue,demo=false}:{round:RoundResult;onContinue:()=>void;demo?:boolean}){
 const [revealed,setRevealed]=useState(false);
 const [running,setRunning]=useState(true);
 const target=useMemo(()=>targetTier(round,demo),[round,demo]);
 const tier=TIERS[target];
 useEffect(()=>{
  const reduced=window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  if(reduced){setRevealed(true);setRunning(false);return}
  const revealTimer=window.setTimeout(()=>setRevealed(true),3150);
  const finishTimer=window.setTimeout(()=>setRunning(false),3600);
  return()=>{window.clearTimeout(revealTimer);window.clearTimeout(finishTimer)};
 },[]);
 const skip=()=>{setRevealed(true);setRunning(false)};
 return <section className={`rarity-drop ${revealed?'is-revealed':''} ${demo?'is-demo':''}`} style={{'--drop-depth':`${-(90+target*170)}px`,'--tier-color':tier.color,'--tier-glow':tier.glow} as React.CSSProperties}>
  {demo&&<div className="demo-ribbon">ANIMATION PREVIEW</div>}
  {running&&<button className="skip-drop" onClick={skip}><FastForward/> Skip</button>}
  <div className="drop-viewport" aria-label={`Rarity drop toward ${tier.name}`}>
   <div className="rarity-world">
    <div className="pixel-bus"><i className="balloon"/><i className="cable one"/><i className="cable two"/><i className="bus-body"/><i className="bus-window"/><i className="bus-wheel left"/><i className="bus-wheel right"/><b>DD</b></div>
    {TIERS.map((item,index)=><div className={`tier-zone zone-${index} ${index===target?'landing-zone':''}`} key={item.name} style={{'--zone-color':item.color,'--zone-glow':item.glow} as React.CSSProperties}>
     <div className="tier-cloud cloud-a"/><div className="tier-cloud cloud-b"/>
     <span className="tier-index">0{index+1}</span><strong>{item.name}</strong><small>{item.range}</small>
     <div className="island-layer"><i/><i/><i/></div>
     {index===target&&<div className="landing-platform"><span>DEEP DROP</span></div>}
    </div>)}
   </div>
   <div className="pixel-diver"><div className="pixel-glider"><i/><b/></div><div className="pixel-head"/><div className="pixel-body"/><div className="pixel-arm left"/><div className="pixel-arm right"/><div className="pixel-leg left"/><div className="pixel-leg right"/><span className="trail one"/><span className="trail two"/></div>
   <div className="speed-lines">{Array.from({length:10},(_,i)=><i key={i}/>)}</div>
   <div className="drop-particles">{Array.from({length:16},(_,i)=><i key={i}/>)}</div>
   {target===5&&<div className="gold-burst"><Sparkles/><i/><i/><i/></div>}
  </div>
  <div className="rarity-banner">
   <span className="banner-kicker">RARITY LOCKED</span><h2>{tier.name}</h2><h1>{round.result.canonicalAnswer}</h1>
   <div className="banner-points">+{round.result.points.toLocaleString()} <small>POINTS</small></div>
   <p>{rateLabel(round,demo)}</p>
   {!demo&&round.result.matchedVia==='autocorrect'&&<div className="banner-correction">We read “{round.result.correctedFrom}” as {round.result.canonicalAnswer}.</div>}
   <div className="banner-actions"><button className="lime-button" onClick={onContinue}>{demo?'BACK TO DROP':'NEXT QUESTION'} <ChevronRight/></button><button className="share-icon" aria-label="Share rare answer" onClick={()=>navigator.share?.({title:'Deep Drop FN',text:`${tier.name}: ${round.result.canonicalAnswer} +${round.result.points} points`})}><Share2/></button></div>
  </div>
 </section>;
}
