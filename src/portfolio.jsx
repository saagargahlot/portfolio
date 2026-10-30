import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import GameplayShowcase from './GameplayShowcase.jsx';
import WorkstationBackdrop from './WorkstationBackdrop.jsx';
import CuriosityHeading from './CuriosityHeading.jsx';
import DockNavigation from './DockNavigation.jsx';
import AgentWorkflow from './AgentWorkflow.jsx';
import DungeonShowcase, {dungeonURL} from './DungeonShowcase.jsx';

const appURL = 'https://apps.apple.com/ca/app/fluctra-puzzle-game/id6780735887';
function External({ href, children, className = '' }) { return <a className={className} href={href} target="_blank" rel="noopener noreferrer">{children}<span aria-hidden="true"> ↗</span></a>; }
const otherProjects = [
  ['Moviezilla','Authentication, movie management and an admin dashboard.','Node · MongoDB','proj-moviezilla'],
  ['Streetwear store','Product filtering, cart state and a multistep checkout interface.','React','saagars-clothing'],
  ['Memory Garden','A generative garden drawn by movement, with timelapse export.','Python · Pygame','memory-garden'],
  ['Highway Racer','An arcade driving game with multiple game modes.','Python · Pygame','racing-game'],
  ['Pac-Man','An arcade classic rebuilt for the browser.','React · TypeScript','Pac-Man-Arcade-Game'],
  ['2048','Tile movement, merging and persistent game state.','React · Zustand','2048-game'],
];
function CaseStudy({children,title='Explore the build'}){
  const details=useRef(null),motion=useRef(null),intent=useRef(false);
  function settle(){
    motion.current?.cancel();motion.current=null;
    if(details.current){details.current.open=intent.current;details.current.style.overflow='';}
  }
  useEffect(()=>{
    const media=matchMedia('(prefers-reduced-motion: reduce)');
    const change=()=>{if(media.matches)settle();};
    media.addEventListener('change',change);window.addEventListener('resize',settle);
    return()=>{motion.current?.cancel();media.removeEventListener('change',change);window.removeEventListener('resize',settle);};
  },[]);
  function toggle(event){
    event.preventDefault();
    const el=details.current,from=el.getBoundingClientRect().height;
    intent.current=!intent.current;motion.current?.cancel();
    if(matchMedia('(prefers-reduced-motion: reduce)').matches||!el.animate){settle();return;}
    el.open=intent.current;
    const to=el.getBoundingClientRect().height;
    // Keep content mounted through the closing motion; release it at rest.
    el.open=true;el.style.overflow='hidden';
    const animation=el.animate([{height:`${from}px`},{height:`${to}px`}],{duration:480,easing:'cubic-bezier(.22,1,.36,1)'});
    motion.current=animation;
    animation.onfinish=()=>{if(motion.current===animation)settle();};
  }
  return <details ref={details} className="case-study"><summary onClick={toggle}>{title}<span className="case-cue" aria-hidden="true"><i>Show details</i><i>Hide details</i></span><span aria-hidden="true">+</span></summary><div className="case-body">{children}</div></details>;
}

export default function Portfolio() {
  const content=useRef(null);
  useLayoutEffect(()=>{
    const root=content.current, media=window.matchMedia('(prefers-reduced-motion: reduce)');
    if(!root || !('IntersectionObserver' in window) || !Element.prototype.animate)return;
    let observer;
    const groups=new Map(), started=new Set(), revealed=new WeakSet();
    const stop=()=>{observer?.disconnect();groups.forEach(list=>list.forEach(m=>m.cancel()));groups.clear();started.clear();};
    function setup(){
      stop();if(media.matches)return;
      const add=(owner,target,frames,delay=0,duration=1000)=>{
        if(!target || revealed.has(target))return;
        // Observe the animated item, not its potentially screen-tall text column.
        const motion=target.animate(frames,{duration:Math.max(1100,duration),delay:Math.min(delay,160),easing:'cubic-bezier(.25,.1,.25,1)',fill:'both'});
        motion.pause();motion.currentTime=0;
        if(!groups.has(target))groups.set(target,[]);
        groups.get(target).push(motion);
        motion.onfinish=()=>{started.delete(motion);motion.cancel();};
      };
      root.querySelectorAll('.section-heading,.project-info,.project-visual,.experiment,.about-photo,.about-copy,.contact').forEach(el=>{
        if(revealed.has(el))return;
        // A restored scroll position should show the content the visitor returned to.
        if(window.scrollY>0&&el.getBoundingClientRect().top<innerHeight){revealed.add(el);return;}
        if(el.matches('.section-heading')){
          add(el,el.querySelector('h2'),[{opacity:0,transform:'translateY(32px)'},{opacity:1,transform:'none'}]);
          add(el,el.querySelector('p'),[{opacity:0,transform:'translateX(36px)'},{opacity:1,transform:'none'}],180);
        }else if(el.matches('.project-info,.about-copy')){
          [...el.children].forEach((child,i)=>add(el,child,[{opacity:0,transform:'translateY(28px)'},{opacity:1,transform:'none'}],i*80,900));
        }else if(el.matches('.fluctra-visual')){
          add(el,el,[{opacity:0,transform:'translateY(24px) scale(.98)'},{opacity:1,transform:'none'}],0,1250);
          add(el,el.querySelector('.platform-line'),[{opacity:0,transform:'translateY(24px)'},{opacity:1,transform:'none'}],500);
        }else if(el.matches('.dungeon-visual')){
          add(el,el,[{opacity:0,transform:'perspective(1000px) rotateY(-18deg) translateY(50px)'},{opacity:1,transform:'none'}],0,1200);
        }else if(el.matches('.chat-visual')){
          el.querySelectorAll('.routing-clients span').forEach((node,i)=>add(el,node,[{opacity:0,transform:'translateX('+ (i<3?-40:40)+'px)'},{opacity:1,transform:'none'}],i*110));
          el.querySelectorAll('.routing-lines').forEach((line,i)=>add(el,line,[{opacity:0,transform:'translateY(12px)'},{opacity:1,transform:'none'}],280+i*350));
          add(el,el.querySelector('.server-node'),[{opacity:0,transform:'scale(.85)'},{opacity:1,transform:'none'}],300);
        }else if(el.matches('.experiment')){
          add(el,el,[{opacity:0,transform:'translateY(24px)'},{opacity:1,transform:'none'}],0,900);
        }else if(el.matches('.about-photo')){
          add(el,el,[{opacity:0,transform:'translateY(24px) scale(.98)'},{opacity:1,transform:'none'}],0,1200);
        }else if(el.matches('.contact')){
          add(el,el.querySelector('h2'),[{opacity:0,transform:'translateY(55px)'},{opacity:1,transform:'none'}],0,1200);
          add(el,el.querySelector('.contact-email'),[{opacity:0,transform:'translateX(-18px)'},{opacity:1,transform:'none'}],300,1200);
        }
      });
      // Once started, finish the entrance even during a fast swipe. Repeated
      // visibility crossings must not freeze content halfway through its reveal.
      observer=new IntersectionObserver(entries=>entries.forEach(entry=>{
        if(!entry.isIntersecting || entry.intersectionRatio<.15)return;
        revealed.add(entry.target);
        (groups.get(entry.target)||[]).forEach(m=>{
          started.add(m);
          if(!document.hidden)m.play();
        });
        observer.unobserve(entry.target);
      }),{threshold:[0,.15],rootMargin:'0px 0px -48px 0px'});
      groups.forEach((_,el)=>observer.observe(el));
    }
    // Keyboard navigation must never land on a visually concealed control.
    const focus=event=>groups.forEach((list,el)=>{if(el.contains(event.target)){revealed.add(el);observer?.unobserve(el);list.forEach(m=>{started.delete(m);m.cancel();});}});
    const visibility=()=>started.forEach(m=>{
      if(document.hidden)m.pause();else m.play();
    });
    const restore=()=>{
      if(!window.scrollY)return;
      groups.forEach((list,el)=>{
        if(el.getBoundingClientRect().top>=innerHeight)return;
        revealed.add(el);observer?.unobserve(el);
        list.forEach(m=>{started.delete(m);m.cancel();});
      });
    };
    window.addEventListener('pageshow',restore);
    setup();media.addEventListener('change',setup);root.addEventListener('focusin',focus);document.addEventListener('visibilitychange',visibility);
    return()=>{window.removeEventListener('pageshow',restore);stop();media.removeEventListener('change',setup);root.removeEventListener('focusin',focus);document.removeEventListener('visibilitychange',visibility);};
  },[]);
  return <><WorkstationBackdrop/><a className="skip-link" href="#main">Skip to content</a><DockNavigation/>
  <main id="main" ref={content}><section className="hero" aria-labelledby="hero-title"><div className="intro-meta"><span>Saagar Gahlot</span><span>Developer · Alberta, Canada</span></div><CuriosityHeading/><div className="hero-bottom"><p>Websites, backend systems, native apps and games.<br/>I build the interfaces people use and the APIs, data models and services that make them work.</p><a href="#work" className="round-link">Explore my work <span aria-hidden="true">↓</span></a></div><GameplayShowcase/></section>
  <section id="work" className="work-section"><div className="section-heading"><h2>Featured work<span> / 01—04</span></h2><p>From game feel to server state.</p></div>
  <article className="project fluctra-project"><div className="project-info"><p className="project-meta">01 / Web & iOS · Independent project</p><h3>Fluctra</h3><p className="project-lead">One puzzle. Two platforms.<br/>Plenty of details to get right.</p><p>A matching game built for quick rounds and daily returns. I’m building both the browser game and the native iOS app, from the board interaction to accounts, leaderboards and purchases.</p><div className="tags"><span>JavaScript</span><span>SwiftUI</span><span>Supabase</span><span>StoreKit</span></div><div className="project-links"><External href="https://fluctra.com" className="button blue">Play Fluctra</External><External href={appURL}>App Store</External></div></div><div className="project-visual fluctra-visual"><img src="/photo/fluctra.png" alt="Fluctra's colorful tile wordmark" width="1200" height="630" loading="lazy"/><div className="platform-line"><span>Browser<br/><b>JavaScript</b></span><span className="platform-connector" aria-hidden="true">↔</span><span>iPhone<br/><b>SwiftUI</b></span></div></div><CaseStudy><div><h4>The challenge</h4><p>Make a puzzle feel consistent across a mouse and a touchscreen, while keeping daily challenges and progression understandable.</p></div><div><h4>What I own</h4><p>The game interfaces, matching interaction, daily challenge experience and integration with account, leaderboard and purchase systems.</p></div><div><h4>The interesting detail</h4><p>Sharing an idea across platforms means checking small things: tile colors, valid connections, board state and when a round’s timer starts. Those details shape how fair the game feels.</p></div><div><h4>Try it</h4><p>Use the demo above, then open the full game or the iPhone app. The demo’s Engineering view shows the gravity code and verifies your move log with a deterministic replay.</p></div></CaseStudy></article>
  <article className="project dungeon-project"><div className="project-info"><p className="project-meta">02 / iOS · Solo development</p><h3>Dungeon Break</h3><p className="project-lead">A dungeon in your pocket.</p><p>A native RPG built with Swift and SpriteKit. I took it from combat and game screens through App Store submission, then iterated using player feedback.</p><div className="tags"><span>Swift</span><span>SpriteKit</span><span>iOS</span></div><div className="project-links"><External href={dungeonURL} className="button blue">App Store</External><a className="inline-link" href="#dungeon-details">Read the development notes ↓</a></div></div><DungeonShowcase/><div id="dungeon-details" className="full-width"><CaseStudy title="Development notes"><div><h4>Built end to end</h4><p>Solo development meant connecting combat, progression and the interface into a complete iOS game, then preparing it for release.</p></div><div><h4>After shipping</h4><p>Player feedback and analytics informed the next update. The work continued beyond the first submission: revisiting the parts of the game people actually used.</p></div></CaseStudy></div></article>
  <article className="project agent-project"><div className="project-info"><p className="project-meta">03 / Developer tools · Personal workflow</p><h3>A coding agent,<br/>one message away.</h3><p className="project-lead">From idea to working code, started from my phone.</p><p>I connected an AI coding agent to Discord so I can hand it work from my phone. Debugging is where I use it most, but the same setup takes an idea all the way to a working, tested change. It combines the Discord bridge, Superpowers development skills, and repository-specific AGENTS.md instructions.</p><div className="tags"><span>Discord</span><span>MCP</span><span>Superpowers</span><span>AGENTS.md</span></div><p>My work is in connecting the pieces and shaping how the agent works: understanding the project, planning or investigating, making a focused change, and reporting what it checked.</p></div><AgentWorkflow/><CaseStudy title="How the workflow fits together"><div><h4>The message is the entry point</h4><p>The Discord bridge passes my message into the coding session. It gives me a way to start and follow the work without sitting at the computer.</p></div><div><h4>Instructions give the task context</h4><p>AGENTS.md carries the repository’s conventions and constraints. For Fluctra, that includes reproducing bugs first and preserving the game’s behavior across platforms.</p></div><div><h4>Skills structure the work</h4><p>Superpowers supplies development workflows for planning, debugging, implementation and verification. I configured the agent around these existing tools rather than building the underlying model or plugin framework.</p></div><div><h4>A result I can review</h4><p>The useful output is a change with an explanation and verification details. The animation shows an example task; it is not a live agent session or a connection to your Discord account.</p></div></CaseStudy></article>
  <article className="project chat-project"><div className="project-info"><p className="project-meta">04 / Backend · Real-time systems</p><h3>Real-Time<br/>Chat Server</h3><p className="project-lead">Messages need somewhere to go.</p><p>A Node.js and Socket.io chat server with public, group and private channels. A project in managing connections and routing messages to the right room.</p><div className="tags"><span>Node.js</span><span>Socket.io</span><span>JavaScript</span></div><External className="inline-link" href="https://github.com/saagargahlot/proj-chat-server">Explore the source</External></div><div className="project-visual chat-visual" role="img" aria-label="Conceptual chat routing: connected clients send messages through Socket.io to public, group and private channels"><div className="routing-clients"><span>Client A</span><span>Client B</span><span>Client C</span></div><div className="routing-lines"/><div className="server-node"><span className="status-dot"/>Socket.io <small>Connection & room routing</small></div><div className="routing-lines"/><div className="routing-clients channels"><span>Public</span><span>Group</span><span>Private</span></div><small className="diagram-caption">Routing model · conceptual diagram</small></div><CaseStudy><div><h4>The problem</h4><p>Connected users can share a public space or communicate in smaller groups. Message delivery has to respect that distinction.</p></div><div><h4>The implementation</h4><p>Socket.io handles persistent client connections and room-based messaging. The source shows how events and channel membership fit together.</p></div></CaseStudy></article>
  </section><section className="more-work"><div className="section-heading"><h2>More experiments</h2><p>Other ways I’ve learned by building.</p></div><div className="experiment-grid">{otherProjects.map(([name,description,stack,repo])=><External key={repo} href={`https://github.com/saagargahlot/${repo}`} className="experiment"><div><h3>{name}</h3><p>{description}</p><small>{stack}</small></div></External>)}</div></section>
  <section id="about" className="about"><div className="about-photo"><img src="/photo/me.webp" alt="Saagar Gahlot" loading="lazy" width="480" height="600"/></div><div className="about-copy"><p className="project-meta">A little about me</p><h2>I like figuring out<br/>how things fit together.</h2><p>I’m Saagar, a Computer Science graduate from Carleton University, based in Alberta. I build for the web and iOS.</p><p>One of my early projects was a kiosk-style ordering interface. Getting the cart, tax and combo pricing to agree taught me something I still like about this work: the visible part is only half the problem.</p><p>These days, that curiosity shows up in games, native apps and the systems that support them.</p><a className="inline-link" href="/ResumeUpdated.pdf">Read my resume ↗</a><div className="experience"><div><span>Feb 2026 — Present</span><h3>Independent iOS developer</h3><p>Building and iterating on native games.</p></div><div><span>Sept 2025 — Jan 2026</span><h3>Data Annotation · Analyst</h3><p>Technical content review and coding evaluation.</p></div></div></div></section>
  <section id="contact" className="contact"><p>Have something in mind?</p><h2>Let’s make<br/><em>something work.</em></h2><a className="contact-email" href="mailto:saagargahlot@gmail.com">saagargahlot@gmail.com <span aria-hidden="true">↗</span></a><div className="contact-links"><External href="https://github.com/saagargahlot">GitHub</External><External href="https://www.linkedin.com/in/saagar-gahlot/">LinkedIn</External><a href="/ResumeUpdated.pdf">Resume ↗</a></div></section></main><footer><span>© {new Date().getFullYear()} Saagar Gahlot</span><span>Built with React. Made to be explored.</span><a href="#">Back to top ↑</a></footer></>;
}
