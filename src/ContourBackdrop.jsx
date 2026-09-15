import React,{useEffect,useRef,useState} from 'react';

// A projected contour globe. Canvas keeps this scene independent of a GPU library.
export default function ContourBackdrop(){
  const canvas=useRef(null),time=useRef(0),pose=useRef({x:0,y:0,depth:0});
  const [paused,setPaused]=useState(false),[reduced,setReduced]=useState(false);
  useEffect(()=>{
    const el=canvas.current,ctx=el.getContext('2d',{alpha:true});
    if(!ctx)return;
    const media=matchMedia('(prefers-reduced-motion: reduce)');
    let width=1,height=1,dpr=1,frame=0,last=0,painted=0;
    let {x,y,depth}=pose.current,tx=x,ty=y,targetDepth=depth;
    const still=()=>paused||media.matches;
    function resize(){
      width=innerWidth;height=innerHeight;dpr=Math.min(devicePixelRatio||1,1.5,Math.sqrt(1800000/(width*height)));
      el.width=Math.round(width*dpr);el.height=Math.round(height*dpr);
      ctx.setTransform(dpr,0,0,dpr,0,0);scroll();draw();
    }
    function scroll(){targetDepth=Math.min(1,scrollY/Math.max(1,document.documentElement.scrollHeight-height));}
    function pointer(event){if(event.pointerType==='touch'||still())return;tx=event.clientX/width-.5;ty=event.clientY/height-.5;}
    function leave(){tx=0;ty=0;}
    function draw(){
      pose.current={x,y,depth};
      ctx.clearRect(0,0,width,height);
      const t=time.current,small=width<700;
      const radius=Math.min(width*(small?.65:.31),height*.52);
      const cx=width*(small?.91:.79)+x*26,cy=height*(.46-depth*.06)+y*20;
      const yaw=t*.055+depth*1.35+x*.25,tilt=-.32+y*.2+depth*.3;
      const sy=Math.sin(yaw),cyaw=Math.cos(yaw),st=Math.sin(tilt),ct=Math.cos(tilt);
      const strength=small?.6:1-depth*.28;
      const halo=ctx.createRadialGradient(cx,cy,radius*.1,cx,cy,radius*1.45);
      halo.addColorStop(0,'rgba(37,115,137,.10)');halo.addColorStop(.65,'rgba(24,95,115,.055)');halo.addColorStop(1,'rgba(16,21,29,0)');
      ctx.fillStyle=halo;ctx.fillRect(0,0,width,height);
      function project(lat,lon){
        const wave=1+.023*Math.sin(lon*5+t*.48+lat*3)+.014*Math.cos(lat*7-t*.35);
        const a=Math.cos(lat)*Math.cos(lon)*wave,b=Math.sin(lat)*wave,c=Math.cos(lat)*Math.sin(lon)*wave;
        const xx=a*cyaw+c*sy,zz=c*cyaw-a*sy,yy=b*ct-zz*st,z=b*st+zz*ct;
        const perspective=3.8/(3.8-z);
        return {x:cx+xx*radius*perspective,y:cy+yy*radius*perspective,z};
      }
      function line(points,color){
        for(let i=1;i<points.length;i++){
          const a=points[i-1],b=points[i],front=(a.z+b.z)*.5;
          ctx.strokeStyle=`rgba(${color},${(.045+Math.max(0,front)*.4)*strength})`;
          ctx.lineWidth=front>.55?1.15:.65;ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();
        }
      }
      const segments=small?44:72,rings=small?15:23;
      for(let row=1;row<rings;row++){
        const lat=-Math.PI/2+row/rings*Math.PI,points=[];
        for(let i=0;i<=segments;i++)points.push(project(lat,i/segments*Math.PI*2));
        line(points,row%4===0?'160,209,231':'84,166,181');
      }
      for(let col=0;col<14;col++){
        const points=[];for(let i=0;i<=36;i++)points.push(project(-Math.PI/2+i/36*Math.PI,col/14*Math.PI*2));
        line(points,'100,159,183');
      }
      // A few traveling lights follow actual latitude contours.
      for(let i=0;i<9;i++){
        const p=project(-.95+i*.23,t*(.11+i*.004)+i*2.4);
        if(p.z<0)continue;
        ctx.fillStyle=`rgba(179,234,231,${p.z*.8*strength})`;ctx.beginPath();ctx.arc(p.x,p.y,1.4+p.z,0,Math.PI*2);ctx.fill();
      }
    }
    function tick(now){
      frame=0;if(document.hidden||still())return;
      if(!last)last=now;
      const delta=Math.min(50,now-last);last=now;time.current+=delta/1000;
      if(now-painted>=32){x+=(tx-x)*.08;y+=(ty-y)*.08;depth+=(targetDepth-depth)*.06;draw();painted=now;}
      frame=requestAnimationFrame(tick);
    }
    function sync(){
      setReduced(media.matches);cancelAnimationFrame(frame);frame=0;last=0;
      if(document.hidden)return;
      if(still()){draw();return;}frame=requestAnimationFrame(tick);
    }
    resize();sync();
    window.addEventListener('resize',resize);window.addEventListener('scroll',scroll,{passive:true});window.addEventListener('pointermove',pointer,{passive:true});window.addEventListener('blur',leave);
    document.addEventListener('visibilitychange',sync);media.addEventListener('change',sync);
    return()=>{cancelAnimationFrame(frame);window.removeEventListener('resize',resize);window.removeEventListener('scroll',scroll);window.removeEventListener('pointermove',pointer);window.removeEventListener('blur',leave);document.removeEventListener('visibilitychange',sync);media.removeEventListener('change',sync);};
  },[paused]);
  return <><div className="contour-backdrop" aria-hidden="true"><canvas ref={canvas}/></div><button className="ocean-motion" disabled={reduced} aria-pressed={paused||reduced} onClick={()=>setPaused(v=>!v)}>{reduced?'Motion off':paused?'Resume scene':'Pause scene'}</button></>;
}
