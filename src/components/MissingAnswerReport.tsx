import './MissingAnswerReport.css';
import {useMemo,useRef,useState} from 'react';
import type {GeneratedQuestion} from '../domain/types';
import {missingAnswerReport} from '../engine/missing-report';
export function MissingAnswerReport({question,attempt,onClose}:{question:GeneratedQuestion;attempt:string;onClose?:()=>void}){
 const [open,setOpen]=useState(false),[explanation,setExplanation]=useState(''),[message,setMessage]=useState('');
 const created=useRef(new Date());
 const report=useMemo(()=>open?missingAnswerReport(question,attempt,explanation,created.current):null,[open,question,attempt,explanation]);
 const text=JSON.stringify(report);
 const close=()=>{setOpen(false);onClose?.()};
 return <div className="missing-answer-report" data-open={open}><button type="button" className="ghost-button" onClick={()=>open?close():setOpen(true)}>Report missing answer</button>{open&&<div>
 <small>Local report only. Nothing is sent. The round timer keeps running.</small>
 <label>Optional explanation<input aria-label="Report explanation" maxLength={500} value={explanation} onChange={e=>setExplanation(e.target.value)}/></label>
 <textarea aria-label="Missing answer report" readOnly value={text}/>
 <div className="suggestions"><button type="button" onClick={async()=>{try{await navigator.clipboard.writeText(text);setMessage('Copied locally.');}catch{setMessage('Copy unavailable. Select the report text or download it.');}}}>Copy report</button>
 <button type="button" onClick={()=>{const url=URL.createObjectURL(new Blob([text],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='deep-drop-missing-answer.json';a.click();window.setTimeout(()=>URL.revokeObjectURL(url),1000);}}>Download report</button>
 <button type="button" onClick={close}>Close report</button></div><small role="status">{message}</small></div>}</div>;
}
