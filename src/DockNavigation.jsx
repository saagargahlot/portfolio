import React,{useLayoutEffect,useRef,useState} from 'react';

export default function DockNavigation(){
  const header=useRef(null),previous=useRef(null),motions=useRef([]),dockedRef=useRef(false);
  const [docked,setDocked]=useState(false);
  useLayoutEffect(()=>{
    let frame,initialized=false;
    function update(){
      frame=0;
      const next=innerWidth>=1100 && scrollY>(dockedRef.current?170:230);
      if(next===dockedRef.current){initialized=true;return;}
      const links=[...header.current.querySelectorAll('a')];
      previous.current=initialized?links.map(link=>link.getBoundingClientRect()):null;
      initialized=true;
      motions.current.forEach(m=>m.cancel());motions.current=[];
      dockedRef.current=next;setDocked(next);
    }
    const request=()=>{if(!frame)frame=requestAnimationFrame(update);};
    const resize=()=>{motions.current.forEach(m=>m.cancel());motions.current=[];previous.current=null;request();};
    update();window.addEventListener('scroll',request,{passive:true});window.addEventListener('resize',resize);
    const media=matchMedia('(prefers-reduced-motion: reduce)');
    const settle=()=>{if(media.matches)motions.current.forEach(m=>m.cancel());};media.addEventListener('change',settle);
    return()=>{cancelAnimationFrame(frame);motions.current.forEach(m=>m.cancel());window.removeEventListener('scroll',request);window.removeEventListener('resize',resize);media.removeEventListener('change',settle);};
  },[]);
  useLayoutEffect(()=>{
    if(!previous.current)return;
    const before=previous.current;previous.current=null;
    if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
    header.current.querySelectorAll('a').forEach((link,i)=>{
      const after=link.getBoundingClientRect(),old=before[i];
      if(!old)return;
      motions.current.push(link.animate([
        {transform:`translate(${old.left-after.left}px,${old.top-after.top}px)`,transformOrigin:'top left'},
        {transform:'none',transformOrigin:'top left'}
      ],{duration:650,fill:'backwards',easing:'cubic-bezier(.22,1,.36,1)'}));
    });
  },[docked]);
  return <div className="nav-home"><header ref={header} className={'site-header'+(docked?' nav-docked':'')}>
    <a className="wordmark" href="#" aria-label="Saagar Gahlot home">saagar<span>.</span></a>
    <nav aria-label="Main navigation"><a href="#work">Work</a><a href="#about">About</a><a href="/ResumeUpdated.pdf">Resume ↗</a><a href="#contact">Contact ↗</a></nav>
  </header></div>;
}
