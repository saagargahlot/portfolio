import React, { useEffect, useRef, useState } from 'react';
import { animate } from 'animejs';

// Perspective-projected surface, isolated from React rendering and capped at 30fps.
export default function SpatialBackdrop() {
  const canvasRef = useRef(null);
  const tideRef = useRef({ phase: 0 });
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const tide = tideRef.current;
    let width = 0, height = 0, depth = 0, targetDepth = 0;
    let lastFrame = 0, frame = 0;
    const pointer = { x: -1000, y: -1000, targetX: -1000, targetY: -1000, strength: 0, active: false };
    const still = () => paused || media.matches;

    function draw(force = false) {
      const now = performance.now();
      if (!force && now - lastFrame < 33) return;
      lastFrame = now;
      depth = still() ? depth : depth + (targetDepth - depth) * 0.1;
      const t = tide.phase * Math.PI * 2;
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle='#10151d';ctx.fillRect(0,0,width,height);
      pointer.x+=(pointer.targetX-pointer.x)*.10;pointer.y+=(pointer.targetY-pointer.y)*.10;
      pointer.strength+=((pointer.active && !still()?1:0)-pointer.strength)*.08;
      const px=(pointer.x/width-.5)*.5*pointer.strength;
      const py=(pointer.y/height-.5)*.5*pointer.strength;
      // Scroll drives the main orbit; ambient deformation is periodic at loop boundaries.
      const turn=depth*Math.PI*1.5+Math.sin(t)*.12+px;
      const tilt=.8+depth*1.1+Math.sin(t)*.06+py;
      const scale=Math.min(width*.0024,height*.0032)*(1+Math.sin(depth*Math.PI)*.24);
      function project(u,v){
        const radius=115+38*Math.cos(v);
        const x=radius*Math.cos(u),y=radius*Math.sin(u),z=38*Math.sin(v)+22*Math.sin(u*3+t);
        const xx=x*Math.cos(turn)+z*Math.sin(turn),zz=-x*Math.sin(turn)+z*Math.cos(turn);
        const yy=y*Math.cos(tilt)-zz*Math.sin(tilt),depthZ=y*Math.sin(tilt)+zz*Math.cos(tilt);
        const perspective=520/(520+depthZ);
        return [width*(.78-Math.sin(depth*Math.PI*2)*.16)+xx*scale*perspective,height*(.43+Math.sin(depth*Math.PI)*.16)+yy*scale*perspective,depthZ];
      }
      // A projected, continuously deformed surface: geometry rather than particles.
      for(let ring=0;ring<32;ring++){
        ctx.beginPath();let z=0;
        for(let step=0;step<=40;step++){
          const point=project(ring/32*Math.PI*2,step/40*Math.PI*2);z+=point[2];
          if(!step)ctx.moveTo(point[0],point[1]);else ctx.lineTo(point[0],point[1]);
        }
        ctx.strokeStyle=z<0?'rgba(141,194,200,.24)':'rgba(108,136,156,.10)';
        ctx.lineWidth=.7;ctx.stroke();
      }
      for(let line=0;line<9;line++){
        ctx.beginPath();
        for(let step=0;step<=100;step++){
          const point=project(step/100*Math.PI*2,line/9*Math.PI*2);
          if(!step)ctx.moveTo(point[0],point[1]);else ctx.lineTo(point[0],point[1]);
        }
        ctx.strokeStyle=line===2?'rgba(230,169,125,.42)':'rgba(146,198,202,.14)';
        ctx.lineWidth=line===2?1.4:.6;ctx.stroke();
      }
      const shade=ctx.createLinearGradient(0,0,width,0);
      shade.addColorStop(0,'#10151d');shade.addColorStop(.36,'rgba(16,21,29,.9)');
      shade.addColorStop(.72,'rgba(16,21,29,.18)');shade.addColorStop(1,'rgba(16,21,29,0)');
      ctx.fillStyle=shade;ctx.fillRect(0,0,width,height);
    }
    function disturb(event){
      if(still() || document.hidden || event.pointerType==='touch')return;
      pointer.targetX=event.clientX;pointer.targetY=event.clientY;
      if(!pointer.active){pointer.x=event.clientX;pointer.y=event.clientY;}pointer.active=true;
    }
    function leave(){pointer.active=false;}
    function readScroll() {
      if(still())return;
      targetDepth=Math.min(1,Math.max(0,window.scrollY/Math.max(1,document.documentElement.scrollHeight-window.innerHeight)));
    }
    function requestDraw() {
      if(frame || document.hidden)return;
      frame=requestAnimationFrame(()=>{frame=0;readScroll();draw(true);});
    }
    function resize() {
      width=window.innerWidth;height=window.innerHeight;
      const ratio=Math.min(window.devicePixelRatio || 1,1.5);
      canvas.width=Math.round(width*ratio);canvas.height=Math.round(height*ratio);
      ctx.setTransform(ratio,0,0,ratio,0,0);readScroll();draw(true);
    }
    const motion=animate(tide,{phase:[tide.phase,tide.phase+1],duration:24000,loop:true,ease:'linear',autoplay:false,onUpdate:()=>draw()});
    function sync() {
      setReduced(media.matches);
      if(still() || document.hidden){motion.pause();pointer.active=false;pointer.strength=0;}else motion.play();
      if(!document.hidden)requestDraw();
    }
    resize();sync();
    window.addEventListener('scroll',requestDraw,{passive:true});
    window.addEventListener('pointermove',disturb,{passive:true});
    
    document.documentElement.addEventListener('pointerleave',leave);
    window.addEventListener('blur',leave);
    window.addEventListener('resize',resize);
    document.addEventListener('visibilitychange',sync);
    media.addEventListener('change',sync);
    return ()=>{
      motion.cancel();cancelAnimationFrame(frame);
      window.removeEventListener('scroll',requestDraw);
      window.removeEventListener('pointermove',disturb);
      
      document.documentElement.removeEventListener('pointerleave',leave);
      window.removeEventListener('blur',leave);
      window.removeEventListener('resize',resize);
      document.removeEventListener('visibilitychange',sync);
      media.removeEventListener('change',sync);
    };
  },[paused]);

  return <>
    <div className="ocean-backdrop" aria-hidden="true">
      <canvas ref={canvasRef}/>
    </div>
    <button className="ocean-motion" aria-pressed={paused || reduced} disabled={reduced} onClick={()=>setPaused(value=>!value)}>
      <span aria-hidden="true">◇</span> {reduced ? 'Scene motion off' : paused ? 'Resume motion' : 'Pause motion'}
    </button>
  </>;
}
