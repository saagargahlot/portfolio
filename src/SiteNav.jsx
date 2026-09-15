import React,{useEffect,useRef,useState} from 'react';
export default function SiteNav(){
  const [active,setActive]=useState(''),[scrolled,setScrolled]=useState(false);
  const progress=useRef(null);
  useEffect(()=>{
    let frame=0;
    const sections=['work','about','contact'].map(id=>document.getElementById(id)).filter(Boolean);
    function update(){
      frame=0;
      const y=window.scrollY,max=document.documentElement.scrollHeight-window.innerHeight;
      setScrolled(y>30);
      let current='';
      for(const section of sections)if(section.getBoundingClientRect().top<=window.innerHeight*.38)current=section.id;
      if(max>0 && y>=max-5)current='contact';
      setActive(current);
      if(progress.current)progress.current.style.transform=`scaleX(${max>0?Math.min(1,y/max):0})`;
    }
    function request(){if(!frame)frame=requestAnimationFrame(update);}
    update();window.addEventListener('scroll',request,{passive:true});window.addEventListener('resize',request);
    return()=>{cancelAnimationFrame(frame);window.removeEventListener('scroll',request);window.removeEventListener('resize',request);};
  },[]);
  return <header className="site-header portfolio-nav" data-scrolled={scrolled}>
    <a className="wordmark" href="#main" aria-label="Saagar Gahlot, back to introduction">saagar<span>.</span></a>
    <nav aria-label="Main navigation">
      {['work','about'].map(id=><a key={id} href={`#${id}`} aria-current={active===id?'location':undefined}>{id==='work'?'Work':'About'}</a>)}
      <a href="/ResumeUpdated.pdf" aria-label="Read my resume"><span className="nav-resume-long">Resume ↗</span><span className="nav-resume-short" aria-hidden="true">CV ↗</span></a>
      <a href="#contact" aria-current={active==='contact'?'location':undefined}>Contact <span aria-hidden="true">↗</span></a>
    </nav>
    <span className="nav-reading-track" aria-hidden="true"><span ref={progress}/></span>
  </header>;
}
