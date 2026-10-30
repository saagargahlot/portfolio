import React,{useEffect,useLayoutEffect,useRef,useState} from 'react';
import {agentSteps} from './agent-workflow.js';
import {AgentScreen} from './AgentWorkflow.jsx';
import {createWorkspaceEntry} from './workspace-entry.js';
import {fitWorkstation,typingDelay} from './workstation-layout.js';
import coreSource from './game-core.js?raw';
import demoSource from './demo.js?raw';
import {initialBoard,findGroup,fallBoard,advance,replay,INITIAL_SEED,selectCell} from './demo.js';

export default function WorkstationBackdrop(){
  const playback=useRef(null),visit=useRef(null);
  const pose=useRef({depth:0,x:0,y:0}),companion=useRef(null),keyboard=useRef(null),scene=useRef(null), terminal=useRef(null), board=useRef(null), editor=useRef(null), gutter=useRef(null), backdrop=useRef(null);
  const [paused,setPaused]=useState(false),[reduced,setReduced]=useState(false),[hidden,setHidden]=useState(false);
  useLayoutEffect(()=>{
    const media=matchMedia('(prefers-reduced-motion: reduce)');
    let {x,y}=pose.current;
    let depth=Math.min(1,Math.max(0,scrollY/Math.max(1,document.documentElement.scrollHeight-innerHeight)));
    let frame=0,targetDepth=depth,targetX=x,targetY=y;
    const still=()=>paused||media.matches;
    function paint(){
      frame=0;
      if(document.hidden)return;
      depth+=(targetDepth-depth)*.09;x+=(targetX-x)*.12;y+=(targetY-y)*.12;
      pose.current={depth,x,y};
      backdrop.current.style.setProperty('--scene-depth',String(depth));
      backdrop.current.style.setProperty('--scene-x',`${x*28}px`);
      backdrop.current.style.setProperty('--scene-y',`${y*18}px`);
      const closing = Math.max(0, Math.min(1, (depth - .83) / .17));
      const settle = closing * closing * (3 - 2 * closing);
      backdrop.current.style.setProperty('--scene-opacity', String(.8 - .1 * Math.sin(depth * Math.PI)));
      backdrop.current.style.setProperty('--scene-closing', String(settle));
      companion.current.style.transform=`translate3d(${-x*10}px,${-depth*25+y*6}px,0) rotateY(${4-x*2}deg)`;
      const fit = fitWorkstation(innerWidth, innerHeight);
      const companionLeft=Math.min(180,Math.max(110,innerWidth*.09));
      const noteX=Math.max(companionLeft+138,fit.x-190);
      const noteY=Math.max(100,Math.min(innerHeight-275,innerHeight*.68));
      backdrop.current.style.setProperty('--notebook-dock-x',`${noteX-companionLeft-138}px`);
      backdrop.current.style.setProperty('--notebook-dock-y',`${noteY-innerHeight*.36-75+depth*25}px`);
      scene.current.style.transform=`translate3d(${fit.x}px,${fit.y}px,0) rotateX(${(1+y)*(1-settle)}deg) rotateY(${(-5+x*3)*(1-settle)}deg) rotateZ(${(-1+x)*(1-settle)}deg) scale(${fit.scale})`;
      if(!still()&&Math.abs(depth-targetDepth)+Math.abs(x-targetX)+Math.abs(y-targetY)>.002)frame=requestAnimationFrame(paint);
    }
    function request(){if(!frame&&!document.hidden)frame=requestAnimationFrame(paint);}
    function scroll(){
      if(still()){request();return;}
      targetDepth=Math.min(1,Math.max(0,scrollY/Math.max(1,document.documentElement.scrollHeight-innerHeight)));request();
    }
    function pointer(event){
      if(still()||event.pointerType==='touch')return;
      targetX=event.clientX/innerWidth-.5;targetY=event.clientY/innerHeight-.5;request();
    }
    function leave(){if(still())return;targetX=0;targetY=0;request();}
    function sync(){
      setReduced(media.matches);setHidden(document.hidden);
      if(still()||document.hidden){cancelAnimationFrame(frame);frame=0;targetDepth=depth;targetX=x;targetY=y;}
      else scroll();
    }
    function restore(){
      depth=targetDepth=Math.min(1,Math.max(0,scrollY/Math.max(1,document.documentElement.scrollHeight-innerHeight)));
      paint();sync();
    }
    paint();sync();window.addEventListener('pageshow',restore);
    window.addEventListener('scroll',scroll,{passive:true});window.addEventListener('resize',scroll);
    window.addEventListener('pointermove',pointer,{passive:true});window.addEventListener('blur',leave);
    document.documentElement.addEventListener('pointerleave',leave);document.addEventListener('visibilitychange',sync);media.addEventListener('change',sync);
    return()=>{window.removeEventListener('pageshow',restore);cancelAnimationFrame(frame);window.removeEventListener('scroll',scroll);window.removeEventListener('resize',scroll);window.removeEventListener('pointermove',pointer);window.removeEventListener('blur',leave);document.documentElement.removeEventListener('pointerleave',leave);document.removeEventListener('visibilitychange',sync);media.removeEventListener('change',sync);};
  },[paused]);
  useLayoutEffect(()=>{
    if(!visit.current){
      let previous=-1;
      try{previous=Number(sessionStorage.getItem('portfolio.workspace.variant') ?? -1);}catch{}
      visit.current=createWorkspaceEntry(Math.random,previous);
      try{sessionStorage.setItem('portfolio.workspace.variant',String(visit.current.variant));}catch{}
    }
    const entry=visit.current;
    let sources=[coreSource.slice(coreSource.indexOf('export function findGroup'),coreSource.indexOf('export function fallBoard')).trim(),coreSource.slice(coreSource.indexOf('export function fallBoard')).trim(),demoSource.slice(demoSource.indexOf('export function replay')).trim()];
    let labels=['game-core.js','gravity.js','replay.js'];
    const baseSources=[...sources];
    const selectionSource=demoSource.slice(demoSource.indexOf('export function selectCell'),demoSource.indexOf('export function advance')).trim();
    const advanceSource=demoSource.slice(demoSource.indexOf('export function advance'),demoSource.indexOf('export function replay')).trim();
    const notes=['Match both color and shape.','Keep the surviving order.','Same moves. Same board.'];
    const notePaths=[
      'M40 22H78V54H115M40 54H78',
      'M40 22C85 22 70 54 115 54M40 54C85 54 70 86 115 86',
      'M40 22H100Q132 22 132 54V86M120 78L132 90L144 78',
    ];
    let timer,phase=entry.phase,round=entry.family,character=0,motions=[],keyMotions=new Map();
    let suspended=false,pending=null,remaining=0,startedAt=0,renderedLines=[];
    let cells=entry.cells,seed=entry.seed,moves=entry.moves.map(move=>[...move]),group=entry.group,next=entry.next;
    if(entry.family){sources=[selectionSource,advanceSource,baseSources[2]];labels=['selection.js','advance.js','replay.js'];}
    backdrop.current.querySelectorAll('.studio-editor-tabs span').forEach((tab,i)=>{tab.textContent=labels[i];});
    const trace=backdrop.current.querySelector('.notebook-trace');
    const note=backdrop.current.querySelector('.notebook-page h4');
    const noteStatus=backdrop.current.querySelector('.notebook-page p');
    function schedule(callback,delay){
      clearTimeout(timer);pending=callback;remaining=delay;startedAt=performance.now();
      if(!suspended)timer=setTimeout(()=>{pending=null;callback();},delay);
    }
    playback.current={setPaused(value){
      if(value===suspended)return;
      suspended=value;
      if(value){
        clearTimeout(timer);
        remaining=Math.max(0,remaining-(performance.now()-startedAt));
        [...motions,...keyMotions.values()].forEach(m=>{if(m.playState==='running')m.pause();});
      }else{
        [...motions,...keyMotions.values()].forEach(m=>{if(m.playState==='paused')m.play();});
        if(pending)schedule(pending,remaining);
      }
    }};
    function keypress(char){
      const name=/[a-z0-9]/i.test(char)?char.toLowerCase():char==='\n'?'enter':char===' '?'space':'shift';
      const key=[...keyboard.current.querySelectorAll('[data-key]')].find(el=>el.dataset.key===name);
      if(!key)return;
      keyMotions.get(key)?.cancel();
      const motion=key.animate([{transform:'translateY(0)',background:'#243a49'},{transform:'translateY(2px)',background:'#78b8b5',offset:.35},{transform:'translateY(0)',background:'#243a49'}],{duration:150,easing:'ease-out'});
      keyMotions.set(key,motion);
    }

    function paint(cells,origins){
      motions.forEach(m=>m.cancel());motions=[];
      const pitch=board.current.children[5].offsetTop-board.current.children[0].offsetTop;
      [...board.current.children].forEach((cell,i)=>{
        cell.textContent=cells[i].sym;cell.style.color=cells[i].col;cell.style.borderColor=cells[i].col+'66';
        cell.classList.remove('is-traced');
        if(origins){const from=origins[i],rows=from<0?from-Math.floor(i/5):Math.floor(from/5)-Math.floor(i/5);
          if(rows)motions.push(cell.animate([{transform:`translateY(${rows*pitch}px)`,opacity:0},{transform:'none',opacity:1}],{duration:800,easing:'cubic-bezier(.22,1,.36,1)'}));}
      });
    }
    function renderCode(){
      const source=sources[phase];
      const lines=source.slice(0,character).split('\n');
      lines.forEach((text,index)=>{
        const existing=editor.current.children[index];
        if(existing&&renderedLines[index]===text){
          if(index<lines.length-1)existing.querySelector('.workspace-code-cursor')?.remove();
          return;
        }
        const row=document.createElement('span');row.className='workspace-code-line';row.dataset.line=String(index+1);
        const tokens=/\/\/[^\n]*|"[^"\n]*"|'[^'\n]*'|\b(?:export|function|const|let|return|if|for|while|async|await)\b|\b\d+\b/g;
        let end=0;
        for(const match of text.matchAll(tokens)){
          row.append(document.createTextNode(text.slice(end,match.index)));
          const token=document.createElement('span');token.textContent=match[0];
          token.className=match[0].startsWith('//')?'code-comment':/^['"]/.test(match[0])?'code-string':/^\d/.test(match[0])?'code-number':'code-keyword';
          row.append(token);end=match.index+match[0].length;
        }
        row.append(document.createTextNode(text.slice(end)||(!text?' ':'')));
        if(index===lines.length-1){const cursor=document.createElement('i');cursor.className='workspace-code-cursor';row.append(cursor);}
        if(existing)existing.replaceWith(row);else editor.current.append(row);
      });
      while(editor.current.children.length>lines.length)editor.current.lastElementChild.remove();
      renderedLines=lines;
      editor.current.scrollTop=editor.current.scrollHeight;
      backdrop.current.dataset.editorPhase=String(phase);
    }
    function begin(openingStage=null){
      backdrop.current.dataset.workStage='typing';
      backdrop.current.dataset.editorPhase=String(phase);
      note.textContent=notes[phase];
      noteStatus.textContent='Working through the next step.';
      trace.setAttribute('d',notePaths[phase]);
      trace.style.strokeDashoffset='1';
      const source=sources[phase];
      renderedLines=[];editor.current.replaceChildren();
      const start=source.indexOf('\n',Math.floor(source.length*(openingStage?entry.editFraction:.72)));
      character=start<0?0:start+1;
      if(phase===0){
        const candidates=cells.map((_,index)=>findGroup(cells,5,index)).filter(found=>found.length>=2);
        group=candidates[(entry.selectionOffset+round*7)%Math.max(1,candidates.length)]||[];
        next=advance(cells,group,seed);
      }
      paint(cells);
      if(openingStage==='running')character=source.length;
      renderCode();
      if(openingStage==='running'){run();return;}
      terminal.current.textContent=labels[phase]+' · unsaved changes';
      schedule(tick,380);
    }
    function tick(){
      const source=sources[phase];
      const char=source[character++];
      keypress(char);
      if(char==='\n')while(source[character]===' ')character++;
      renderCode();
      if(character<source.length){schedule(tick,typingDelay(char,character));return;}
      backdrop.current.dataset.workStage='reading';
      terminal.current.textContent='Saved '+labels[phase];
      schedule(run,560);
    }
    function run(){
      backdrop.current.dataset.workStage='running';
      keypress('\n');
      terminal.current.textContent=phase===0?`> findGroup(board, 5, ${group[0] ?? 0})`:phase===1?'> advance(board, selection, seed)':'> replay([selection])';
      noteStatus.textContent='Checking the result…';
      schedule(showResult,360);
    }
    function showResult(){
      backdrop.current.dataset.workStage='result';
      motions.push(trace.animate([{strokeDashoffset:1},{strokeDashoffset:0}],{duration:1100,easing:'ease-in-out',fill:'forwards'}));
      if(phase===0){
        let selection=[],index=0;
        function traceSelection(){
          if(index<group.length){
            selection=selectCell(cells,selection,group[index++]);
            [...board.current.children].forEach((cell,i)=>cell.classList.toggle('is-traced',selection.includes(i)));
            terminal.current.textContent=selection.length+' selected · matching neighbors';
            schedule(traceSelection,120);return;
          }
          noteStatus.textContent='Neighbors share an edge, color and shape.';
          schedule(nextPhase,1700);
        }
        traceSelection();return;
      }
      if(phase===1&&next){
        moves.push([...group]);cells=next.cells;seed=next.seed;
        paint(cells,next.origins);
        motions.push(trace.animate([{strokeDashoffset:1},{strokeDashoffset:0}],{duration:1100,easing:'ease-in-out',fill:'forwards'}));
        terminal.current.textContent=next.cleared+' removed · surviving order preserved';
        noteStatus.textContent='Only the affected columns fall.';
      }
      if(phase===2){
        const result=replay(moves);
        const matches=result&&next&&result.seed===next.seed&&JSON.stringify(result.cells)===JSON.stringify(next.cells);
        terminal.current.textContent=matches?'Board and random seed match.':'Replay could not be verified.';
        noteStatus.textContent=matches?'The move log reproduces this board.':'Check the move log.';
      }
      schedule(nextPhase,2500);
    }
    function nextPhase(){
      phase=(phase+1)%sources.length;
      if(phase===0){
        round++;
        if(round%3===0||!cells.some((_,i)=>findGroup(cells,5,i).length>=2)){
          cells=initialBoard;seed=INITIAL_SEED;moves=[];
        }
        sources=round%2?[selectionSource,advanceSource,baseSources[2]]:[...baseSources];
        labels=round%2?['selection.js','advance.js','replay.js']:['game-core.js','gravity.js','replay.js'];
        const tabs=backdrop.current.querySelectorAll('.studio-editor-tabs span');
        tabs.forEach((tab,i)=>{tab.textContent=labels[i];});
      }
      if(phase===0&&round%2===0){playAgentFlow();return;}
      begin();
    }
    function playAgentFlow(){
      backdrop.current.dataset.agentActive='true';
      let step=0;
      function progress(){
        backdrop.current.dataset.agentStep=String(step);
        if(step===4)keypress('enter');
        schedule(()=>{
          if(step<agentSteps.length-1){step++;progress();}
          else{backdrop.current.dataset.agentActive='false';begin();}
        },agentSteps[step].duration);
      }
      progress();
    }
    if(entry.variant%3===0)playAgentFlow();else begin(entry.stage);
    return()=>{clearTimeout(timer);playback.current=null;backdrop.current.dataset.agentActive='false';motions.forEach(m=>m.cancel());keyMotions.forEach(m=>m.cancel());};
  },[]);
  useEffect(()=>{playback.current?.setPaused(paused||reduced||hidden);},[paused,reduced,hidden]);
  return <>
    <div ref={backdrop} className="studio-backdrop" data-still={paused||reduced||hidden} aria-hidden="true">
      <div className="studio-coordinate-field"/>
      <svg className="studio-tides" viewBox="0 0 1440 900" preserveAspectRatio="none">
        {[0,1,2,3,4].map(i=><path key={i} style={{'--tide-index':i}} d={`M-100 ${500+i*24}C200 ${220+i*35} 430 ${810+i*8} 760 ${550+i*18}S1190 ${180+i*25} 1540 ${420+i*22}`}/>)}
      </svg>
      <div className="studio-dots">{Array.from({length:18},(_,i)=><i key={i} style={{left:`${5+(i*37)%90}%`,top:`${12+(i*23)%77}%`,animationDelay:`${-i*.7}s`}}/>)}</div>
      <svg className="studio-agent-connection" viewBox="0 0 1440 900" preserveAspectRatio="none"><path pathLength="1" d="M150 420C360 420 460 230 920 300"/></svg>
      <div ref={companion} className="studio-companion">
      <div className="studio-native"><div className="studio-native-caption">Dungeon Break <span>Swift · SpriteKit</span></div><div className="studio-native-device"><div className="studio-discord-chat"><small>Discord</small><p>Check why this selection crosses a row.</p><span>Delivered</span><p className="studio-agent-reply">Change and checks ready to review.</p></div><img src="/photo/dungeon-break.webp" alt=""/><i/></div><div className="studio-native-shadow"/></div>
        <div className="studio-notebook"><div className="notebook-binding"/><div className="notebook-page"><small>Board notes</small><h4>Keep the order.</h4>
          <svg viewBox="0 0 160 110"><g className="notebook-cells"><rect x="12" y="10" width="24" height="24"/><rect x="12" y="42" width="24" height="24"/><rect x="12" y="74" width="24" height="24"/><rect x="120" y="10" width="24" height="24"/><rect x="120" y="42" width="24" height="24"/><rect x="120" y="74" width="24" height="24"/></g><path className="notebook-trace" pathLength="1" d="M40 22C85 22 70 54 115 54M40 54C85 54 70 86 115 86"/><circle cx="24" cy="22" r="4"/><circle cx="132" cy="54" r="4"/></svg>
          <p>Find neighbors.<br/>Let pieces fall.<br/>Replay the seed.</p><span className="notebook-pencil"/>
        </div></div>
      </div>
      <div ref={scene} className="studio-workstation">

        <div className="studio-monitor"><div className="studio-display"><AgentScreen/>
          <div className="studio-toolbar"><i/><i/><i/><span>saagar / workspace</span></div>
          <div className="studio-editor-tabs"><span>game-core.js</span><span>gravity.js</span><span>replay.js</span></div>
          <div className="studio-screen-content"><div className="studio-editor"><div className="studio-gutter"><div ref={gutter}>{Array.from({length:40},(_,i)=><span key={i}>{i+1}</span>)}</div></div><pre ref={editor}>{coreSource.slice(coreSource.indexOf('export function findGroup'),coreSource.indexOf('export function fallBoard')).trim()}</pre></div><div className="studio-output"><div ref={board} className="studio-board">{initialBoard.map((piece,i)=><span key={i} style={{color:piece.col,borderColor:piece.col+'55'}}>{piece.sym}</span>)}</div><div className="studio-server-output"><span>Client</span><i/><span>Authorized room</span><i/><span>Connected peers</span></div><div className="studio-browser-output"><b>saagar.</b><strong>I build what<br/>sparks my curiosity.</strong><div/><div/><small>Featured work</small></div></div></div>
          <div className="studio-terminal"><span ref={terminal}>const group = findGroup(cells, 5, 0);</span><span className="studio-caret"/></div><div className="studio-status"><span>JavaScript</span><span>UTF-8 · LF</span></div>
        </div><span className="studio-power"/></div>
        <div className="studio-neck"/><div className="studio-foot"/>
        <div className="studio-desk-surface"/><div className="studio-screen-reflection"/>
        <svg className="studio-light" viewBox="0 0 150 250" aria-hidden="true">
          <defs>
            <linearGradient id="lamp-metal" x1="0" y1="0" x2="1" y2="0"><stop stopColor="#1b303e"/><stop offset=".48" stopColor="#708b96"/><stop offset="1" stopColor="#2a424f"/></linearGradient>
            <radialGradient id="lamp-spill"><stop stopColor="#efd7aa" stopOpacity=".25"/><stop offset="1" stopColor="#efd7aa" stopOpacity="0"/></radialGradient>
            <linearGradient id="lamp-beam" x1="0" y1="0" x2="0" y2="1"><stop stopColor="#f5deb1" stopOpacity=".16"/><stop offset="1" stopColor="#f5deb1" stopOpacity="0"/></linearGradient>
          </defs>
          <path d="M71 72L26 229H149L113 72Z" fill="url(#lamp-beam)"/>
          <ellipse cx="92" cy="228" rx="67" ry="17" fill="url(#lamp-spill)"/>
          <ellipse cx="48" cy="239" rx="36" ry="7" fill="#070f18" opacity=".6"/>
          <path d="M13 228Q48 213 83 228V234Q48 245 13 234Z" fill="url(#lamp-metal)" stroke="#66818d"/>
          <path d="M48 225V209L22 128L81 48" fill="none" stroke="#172a37" strokeWidth="11" strokeLinejoin="round"/>
          <path d="M48 225V209L22 128L81 48" fill="none" stroke="url(#lamp-metal)" strokeWidth="7" strokeLinejoin="round"/>
          <path d="M44 201L29 149M32 125L70 72" fill="none" stroke="#91a5ad" strokeWidth="2"/>
          <path d="M41 195L32 158M39 123L62 91" fill="none" stroke="#3c5664" strokeWidth="4" strokeDasharray="2 3"/>
          <g fill="#314c5b" stroke="#809ba5" strokeWidth="2"><circle cx="48" cy="209" r="7"/><circle cx="22" cy="128" r="8"/><circle cx="81" cy="48" r="6"/></g>
          <g fill="#142733"><circle cx="48" cy="209" r="2"/><circle cx="22" cy="128" r="2"/><circle cx="81" cy="48" r="2"/></g>
          <path d="M81 48L92 44" stroke="#8298a1" strokeWidth="5"/>
          <path d="M82 40Q95 34 104 43L121 68Q98 81 68 68Z" fill="url(#lamp-metal)" stroke="#91a5ad"/>
          <ellipse cx="95" cy="69" rx="26" ry="5" fill="#182a33" stroke="#80949a"/>
          <ellipse cx="95" cy="69" rx="19" ry="2" fill="#f2dbad"/>
        </svg>
        <svg className="studio-cable" viewBox="0 0 600 520" aria-hidden="true"><path d="M420 323C420 385 575 350 575 408C575 440 510 421 510 455"/></svg>
        <div className="studio-mouse"><i/></div>
        <div ref={keyboard} className="studio-keyboard">{['1234567890','qwertyuiop','asdfghjkl','zxcvbnm'].map((row,i)=><div className="studio-key-row" key={i}>{[...row].map(key=><i key={key} data-key={key}>{key.toUpperCase()}</i>)}{i===2&&<i data-key="enter" className="key-wide">↵</i>}</div>)}<div className="studio-key-row"><i data-key="shift" className="key-wide">⇧</i><i data-key="space" className="key-space"/><i className="key-wide">⌘</i></div></div>
        <div className="studio-ground"/>
      </div>
    </div>
    <button className="ocean-motion" aria-pressed={paused||reduced} disabled={reduced} onClick={()=>setPaused(v=>!v)}>{reduced?'Motion off':paused?'Resume scene':'Pause scene'}</button>
  </>;
}
