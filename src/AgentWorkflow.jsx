import React, {useEffect, useState} from 'react';
import {agentSteps, agentExampleCode} from './agent-workflow.js';

export function AgentScreen() {
  return <div className="agent-screen">
    <small>Example task · Discord bridge</small>
    <h4>Check the row boundary.</h4>
    <div className="agent-screen-log">{agentSteps.slice(2).map((step,index)=><p key={step.title} data-agent-line={index+2}><span>{step.title}</span><small>{step.detail}</small></p>)}</div>
    <pre>{agentExampleCode}</pre>
  </div>;
}

export default function AgentWorkflow() {
  const [step,setStep]=useState(0),[playing,setPlaying]=useState(false);
  useEffect(()=>{
    if(!playing)return;
    const media=matchMedia('(prefers-reduced-motion: reduce)');
    if(media.matches){setPlaying(false);return;}
    const timer=setTimeout(()=>{
      if(step===agentSteps.length-1)setPlaying(false);
      else setStep(value=>value+1);
    },agentSteps[step].duration);
    const stop=()=>{if(document.hidden||media.matches)setPlaying(false);};
    document.addEventListener('visibilitychange',stop);media.addEventListener('change',stop);
    return()=>{clearTimeout(timer);document.removeEventListener('visibilitychange',stop);media.removeEventListener('change',stop);};
  },[step,playing]);
  return <div className="agent-flow-demo" data-step={step} data-playing={playing}>
    <div className="agent-flow-header"><span>Phone → Discord → repository</span><small>Illustrated workflow</small></div>
    <div className="agent-flow-body">
      <div className="agent-flow-phone"><small>Discord · my coding agent</small><p>Check why this selection crosses a row.</p>{step>=1&&<span>Delivered</span>}{step===6&&<p className="agent-reply">Row boundary checked. Change and verification ready to review.</p>}</div>
      <div className="agent-flow-wire" aria-hidden="true"><i/></div>
      <div className="agent-flow-session"><small>{step+1} / {agentSteps.length}</small><h4>{agentSteps[step].title}</h4><p aria-live="polite">{agentSteps[step].detail}</p>{step>=4&&<pre>{agentExampleCode}</pre>}</div>
    </div>
    <div className="agent-flow-controls"><button type="button" className="text-button" onClick={()=>{if(playing){setPlaying(false);return;}if(step===6)setStep(0);setPlaying(true);}}>{playing?'Pause':'Play flow'}</button><button type="button" className="text-button" disabled={playing} onClick={()=>setStep(value=>(value+1)%agentSteps.length)}>Next step →</button></div>
  </div>;
}
