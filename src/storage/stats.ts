import type { RoundResult } from '../domain/types';

export interface PlayerStats {
  gamesPlayed:number;
  correctAnswers:number;
  totalAnswers:number;
  totalScore:number;
  highScore:number;
  bestAnswer?:{name:string;points:number};
  currentStreak:number;
  longestStreak:number;
  lastDailyDate?:string;
  completedDailyDates:string[];
  recentAnswers:Array<{name:string;points:number;tier:string}>;
}

const KEY = 'deep-drop:stats:v2';
export const defaultStats: PlayerStats = { gamesPlayed:0, correctAnswers:0, totalAnswers:0, totalScore:0, highScore:0, currentStreak:0, longestStreak:0, completedDailyDates:[], recentAnswers:[] };

export function loadStats(): PlayerStats {
  try { return { ...defaultStats, ...JSON.parse(localStorage.getItem(KEY) ?? '{}') }; }
  catch { return defaultStats; }
}

function utcDayBefore(date:string):string {
  const previous = new Date(`${date}T00:00:00Z`);
  previous.setUTCDate(previous.getUTCDate()-1);
  return previous.toISOString().slice(0,10);
}

export function recordGame(results:RoundResult[], mode:'daily'|'unlimited', date:string):PlayerStats {
  const old = loadStats();
  const score = results.reduce((sum,round)=>sum+round.result.points,0);
  const correct = results.filter((round)=>round.result.correct).length;
  const best = results.filter((round)=>round.result.correct).sort((a,b)=>b.result.points-a.result.points)[0];
  let streak = old.currentStreak;
  let longest = old.longestStreak;
  let lastDailyDate = old.lastDailyDate;
  let completedDailyDates = old.completedDailyDates;
  if (mode === 'daily' && !completedDailyDates.includes(date)) {
    streak = lastDailyDate === utcDayBefore(date) ? streak + 1 : 1;
    longest = Math.max(longest,streak);
    lastDailyDate = date;
    completedDailyDates = [...completedDailyDates,date].slice(-90);
  }
  const next:PlayerStats = {
    gamesPlayed:old.gamesPlayed+1, correctAnswers:old.correctAnswers+correct, totalAnswers:old.totalAnswers+results.length,
    totalScore:old.totalScore+score, highScore:Math.max(old.highScore,score), currentStreak:streak, longestStreak:longest,
    lastDailyDate, completedDailyDates,
    recentAnswers:[...results.filter(round=>round.result.correct).map(round=>({name:round.result.canonicalAnswer!,points:round.result.points,tier:round.result.tier??'Correct'})).reverse(),...(old.recentAnswers??[])].slice(0,20),
    bestAnswer: !best ? old.bestAnswer : !old.bestAnswer || best.result.points > old.bestAnswer.points ? {name:best.result.canonicalAnswer!,points:best.result.points} : old.bestAnswer,
  };
  localStorage.setItem(KEY,JSON.stringify(next));
  return next;
}
