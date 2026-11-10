const KEY='deep-drop-practice-history-v1';
const LIMIT=140;
export function loadPracticeHistory():string[]{
 try{const value=JSON.parse(localStorage.getItem(KEY)??'[]');return Array.isArray(value)?value.filter((id:unknown):id is string=>typeof id==='string').slice(-LIMIT):[];}catch{return [];}
}
export function rememberPracticeQuestion(id:string):void {
 try{const recent=loadPracticeHistory().filter(q=>q!==id);localStorage.setItem(KEY,JSON.stringify([...recent,id].slice(-LIMIT)));}catch{/* Playing works with unavailable storage. */}
}
