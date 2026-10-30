import React, {useEffect, useRef, useState} from 'react';

export const dungeonURL = 'https://apps.apple.com/app/id6760920987';

export const dungeonShots = [
  ['/photo/dungeon-break.webp','Dungeon Break: three heroes face the Slime King with attack, power slash and potion controls',1010],
  ['/photo/dungeon-break-2.webp','The dungeon map, a winding path of numbered floors through the Goblin Forest'],
  ['/photo/dungeon-break-3.webp','The home screen: the party, heroes to recruit and the Enter Dungeon button'],
  ['/photo/dungeon-break-4.webp','The items bag, comparing gear before equipping a hero'],
  ['/photo/dungeon-break-5.webp','The shop, with weapons that unlock by rarity'],
];
const SHOT_MS = 2800, QR_MS = 5000;

export default function DungeonShowcase() {
  const total = dungeonShots.length + 1, last = total - 1;
  const [index,setIndex]=useState(0),[held,setHeld]=useState(false),[onScreen,setOnScreen]=useState(false),[hidden,setHidden]=useState(false),[reduced,setReduced]=useState(false);
  const root=useRef(null), swipe=useRef(null);

  useEffect(()=>{
    const media=matchMedia('(prefers-reduced-motion: reduce)');
    const motion=()=>setReduced(media.matches), page=()=>setHidden(document.hidden);
    motion();page();
    media.addEventListener('change',motion);document.addEventListener('visibilitychange',page);
    const seen=new IntersectionObserver(([entry])=>setOnScreen(entry.isIntersecting),{threshold:.35});
    seen.observe(root.current);
    return()=>{media.removeEventListener('change',motion);document.removeEventListener('visibilitychange',page);seen.disconnect();};
  },[]);

  useEffect(()=>{
    if(held||!onScreen||hidden||reduced)return;
    const timer=setTimeout(()=>setIndex(value=>(value+1)%total),index===last?QR_MS:SHOT_MS);
    return()=>clearTimeout(timer);
  },[index,held,onScreen,hidden,reduced]);

  const go=value=>setIndex((value+total)%total);
  return <figure className="project-visual dungeon-visual" ref={root} aria-roledescription="carousel" aria-label="Dungeon Break screenshots"
    onMouseEnter={()=>setHeld(true)} onMouseLeave={()=>setHeld(false)}
    onFocus={()=>setHeld(true)} onBlur={event=>{if(!root.current.contains(event.relatedTarget))setHeld(false);}}
    onPointerDown={event=>{swipe.current=event.clientX;}}
    onPointerUp={event=>{const dx=event.clientX-(swipe.current??event.clientX);swipe.current=null;if(Math.abs(dx)>40)go(index+(dx<0?1:-1));}}>
    <span className="pixel-decoration" aria-hidden="true">✦</span>
    <div className="dungeon-viewport">
      <div className="dungeon-track" style={{transform:`translateX(-${index*100}%)`}}>
        {dungeonShots.map(([src,alt,height=1075],i)=><div className="dungeon-slide" key={src} aria-hidden={i!==index}>
          <img src={src} alt={alt} width="496" height={height} loading="lazy" draggable="false"/>
        </div>)}
        <div className="dungeon-slide" aria-hidden={index!==last}>
          <div className="app-qr-card">
            <img src="/photo/dungeon-break-qr.png" width="88" height="88" loading="lazy" draggable="false" alt="QR code linking to Dungeon Break on the App Store"/>
            <p>Pick up your iPhone.<br/><span>Scan to open the App Store.</span></p>
            <a className="qr-store-link" href={dungeonURL} target="_blank" rel="noopener noreferrer" tabIndex={index===last?0:-1}>Open in the App Store<span aria-hidden="true"> ↗</span></a>
          </div>
        </div>
      </div>
    </div>
    <div className="dungeon-dots">{Array.from({length:total},(_,i)=><button type="button" key={i} onClick={()=>go(i)}
      aria-label={i===last?'App Store QR code':`Screenshot ${i+1} of ${dungeonShots.length}`} aria-current={i===index}/>)}</div>
  </figure>;
}
