import React, { useEffect, useRef, useState } from 'react';
import { animate } from 'animejs';
import { addRipple, rippleDisplacement, RIPPLE_LIFETIME } from './water.js';

export default function OceanBackdrop() {
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
    let lastFrame = 0, frame = 0, ripples = [], lastImpulse = 0;
    const pointer = { x: -1000, y: -1000, targetX: -1000, targetY: -1000, strength: 0, active: false };
    let lastPointer = null;
    const still = () => paused || media.matches;

    function draw(force = false) {
      const now = performance.now();
      if (!force && now - lastFrame < 33) return;
      lastFrame = now;
      depth = still() ? targetDepth : depth + (targetDepth - depth) * 0.1;
      const t = tide.phase * Math.PI * 2;
      ctx.clearRect(0, 0, width, height);
      const water = ctx.createLinearGradient(0, 0, width * .3, height);
      water.addColorStop(0, `rgb(${8-depth*4},${46-depth*22},${65-depth*28})`);
      water.addColorStop(1, '#061521');
      ctx.fillStyle = water;
      ctx.fillRect(0, 0, width, height);

      ripples = ripples.filter(r => now-r.born < RIPPLE_LIFETIME);
      pointer.x += (pointer.targetX-pointer.x)*.16;
      pointer.y += (pointer.targetY-pointer.y)*.16;
      pointer.strength += ((pointer.active && !still() ? 1 : 0)-pointer.strength)*.08;

      const drift=Math.sin(t)*35 + pointer.strength*(pointer.x-width*.5)*.035;
      for(let band=0;band<3;band++) {
        const x=width*(.72+band*.14)+drift;
        const beam=ctx.createLinearGradient(x,0,x-width*.48,height);
        beam.addColorStop(0,'rgba(88,197,204,0)');
        beam.addColorStop(.28,`rgba(68,171,188,${.13-band*.025})`);
        beam.addColorStop(.68,'rgba(51,119,157,.04)');
        beam.addColorStop(1,'rgba(51,119,157,0)');
        ctx.beginPath();ctx.moveTo(x,-80);
        ctx.bezierCurveTo(x-160,height*.25,x+60,height*.48,x-width*.48,height+80);
        ctx.strokeStyle=beam;ctx.lineWidth=65+band*35;ctx.stroke();
      }

      const lines = width < 650 ? 16 : 26;
      for (let layer=0; layer<lines; layer++) {
        const baseY=height*(layer+.5)/lines;
        ctx.beginPath();
        for(let x=-24;x<=width+24;x+=18) {
          const current=Math.sin(x/270+t+layer*.21)*23
            +Math.sin(x/490-t*.5+layer*.38)*19;
          const y=baseY+current-depth*22;
          const dx=x-pointer.x,dy=y-pointer.y;
          const lens=Math.exp(-(dx*dx+dy*dy)/48000)*pointer.strength;
          const bend=dy*lens*.32;
          const ripple=still()?0:rippleDisplacement(x,y,now,ripples);
          if(x===-24)ctx.moveTo(x,y+bend+ripple);
          else ctx.lineTo(x,y+bend+ripple);
        }
        const band=ctx.createLinearGradient(0,0,width,0);
        band.addColorStop(0,'rgba(83,192,203,.16)');
        band.addColorStop(.32,'rgba(100,193,214,.065)');
        band.addColorStop(.67,'rgba(100,193,214,.075)');
        band.addColorStop(1,'rgba(94,205,211,.25)');
        ctx.strokeStyle=band;ctx.lineWidth=layer%4===0?1.2:.65;ctx.stroke();
      }
      for(const ripple of ripples) {
        if(still())break;
        const age=now-ripple.born;
        const radius=age*.19;
        const opacity=Math.pow(1-age/RIPPLE_LIFETIME,2)*.13*ripple.strength;
        ctx.beginPath();ctx.ellipse(ripple.x,ripple.y,radius,radius*.48,-.18,0,Math.PI*2);
        ctx.strokeStyle=`rgba(135,219,224,${opacity})`;ctx.lineWidth=1;ctx.stroke();
      }
      const light=ctx.createRadialGradient(width*.82,0,0,width*.82,0,height);
      light.addColorStop(0,'rgba(67,162,178,.10)');light.addColorStop(1,'rgba(6,21,33,0)');
      ctx.fillStyle=light;ctx.fillRect(0,0,width,height);

      const shade=ctx.createLinearGradient(0,0,width,0);
      shade.addColorStop(0,'rgba(5,18,29,0)');shade.addColorStop(.22,'rgba(5,18,29,.35)');
      shade.addColorStop(.78,'rgba(5,18,29,.35)');shade.addColorStop(1,'rgba(5,18,29,0)');
      ctx.fillStyle=shade;ctx.fillRect(0,0,width,height);
    }
    function disturb(event) {
      if(still() || document.hidden || (event.type==='pointermove' && event.pointerType==='touch'))return;
      const now=performance.now();
      pointer.targetX=event.clientX;pointer.targetY=event.clientY;pointer.active=true;
      if(!lastPointer){pointer.x=event.clientX;pointer.y=event.clientY;}
      const distance=lastPointer?Math.hypot(event.clientX-lastPointer.x,event.clientY-lastPointer.y):40;
      if(event.type==='pointerdown' || (distance>28 && now-lastImpulse>110)) {
        ripples=addRipple(ripples,event.clientX,event.clientY,now,event.type==='pointerdown'?1.4:.75);
        lastImpulse=now;lastPointer={x:event.clientX,y:event.clientY};
      }
      if(event.pointerType==='touch')pointer.active=false;
    }
    function leave(){pointer.active=false;lastPointer=null;}
    function readScroll() {
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
      if(still() || document.hidden){motion.pause();ripples=[];pointer.active=false;pointer.strength=0;}else motion.play();
      if(!document.hidden)requestDraw();
    }
    resize();sync();
    window.addEventListener('scroll',requestDraw,{passive:true});
    window.addEventListener('pointermove',disturb,{passive:true});
    window.addEventListener('pointerdown',disturb,{passive:true});
    document.documentElement.addEventListener('pointerleave',leave);
    window.addEventListener('blur',leave);
    window.addEventListener('resize',resize);
    document.addEventListener('visibilitychange',sync);
    media.addEventListener('change',sync);
    return ()=>{
      motion.cancel();cancelAnimationFrame(frame);
      window.removeEventListener('scroll',requestDraw);
      window.removeEventListener('pointermove',disturb);
      window.removeEventListener('pointerdown',disturb);
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
      <span aria-hidden="true">≈</span> {reduced ? 'Ocean motion off' : paused ? 'Resume ocean' : 'Pause ocean'}
    </button>
  </>;
}
