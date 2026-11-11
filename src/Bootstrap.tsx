import {lazy,Suspense,useState} from 'react';
import {BarChart3,Home,MapPin,Settings,Trophy} from 'lucide-react';
import {AppFrame,Brand,type InitialRoute} from './components/AppFrame';
import {HomeScreen} from './components/HomeScreen';
import {loadStats} from './storage/stats';
let application:ReturnType<typeof importApplication>|undefined;
function importApplication(){return import('./App');}
const prepare=()=>application??(application=importApplication());
const Game=lazy(prepare);
export default function Bootstrap(){
 const [route,setRoute]=useState<InitialRoute>();const [stats]=useState(loadStats);
 const frame=(children:React.ReactNode)=> <AppFrame screen="home" stats={stats} onDaily={()=>setRoute('drop')} onPractice={()=>setRoute('practice')} onHome={()=>setRoute('home')}><header className="topbar"><button className="gear" aria-label="Settings"><Settings/></button><Brand/><div className="top-spacer"/></header><div className="screen">{children}</div><nav className="bottom-nav" aria-label="Main navigation">{[{label:'Home',icon:Home,route:'home'},{label:'My Stats',icon:BarChart3,route:'stats'},{label:'Daily Drops',icon:MapPin,route:'drops'},{label:'Leaderboard',icon:Trophy,route:'leaderboard'}].map(item=><button key={item.route} onClick={()=>setRoute(item.route as InitialRoute)}><item.icon/>{item.label}</button>)}</nav></AppFrame>;
 if(route)return <Suspense fallback={frame(<section className="game-loading" role="status"><div className="loading-orb"/><h1>Getting your drop ready…</h1><p>Your next seven questions are on their way.</p></section>)}><Game initialRoute={route}/></Suspense>;
 return frame(<HomeScreen onPlay={()=>setRoute('drop')} onPrepare={()=>{void prepare();}} streak={stats.currentStreak}/>);
}
