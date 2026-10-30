import React,{useEffect,useLayoutEffect,useRef,useState} from 'react';
import coreSource from './game-core.js?raw';
import demoSource from './demo.js?raw';
import {initialBoard,INITIAL_SEED,selectCell,advance,replay} from './demo.js';
export default function GameplayShowcase(){
  const [view,setView]=useState('product'),[topic,setTopic]=useState('gravity');
  const [board,setBoard]=useState(initialBoard),[selection,setSelection]=useState([]);
  const [moves,setMoves]=useState([]),[seed,setSeed]=useState(INITIAL_SEED),[busy,setBusy]=useState(false);
  const [message,setMessage]=useState('Connect 2 or more matching pieces along their sides. Clear three groups to finish.');
  const panel=useRef(null),boardRef=useRef(null),timer=useRef(null),animations=useRef([]),fall=useRef(null);
  const reduced=()=>window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  useEffect(()=>()=>{clearTimeout(timer.current);animations.current.forEach(a=>a.cancel());},[]);
  useLayoutEffect(()=>{
    if(!fall.current||!boardRef.current)return;
    const origins=fall.current;fall.current=null;
    if(reduced())return;
    animations.current.forEach(a=>a.cancel());animations.current=[];
    const pitch=boardRef.current.children[5].offsetTop-boardRef.current.children[0].offsetTop;
    [...boardRef.current.children].forEach((cell,i)=>{
      const from=origins[i],rows=from<0?from-Math.floor(i/5):Math.floor(from/5)-Math.floor(i/5);
      if(rows)animations.current.push(cell.animate([{transform:`translateY(${rows*pitch}px)`,opacity:from<0?0:1},{transform:'none',opacity:1}],{duration:440,easing:'cubic-bezier(.22,1,.36,1)'}));
    });
  },[board]);
  useLayoutEffect(()=>{
    if(reduced() || !panel.current)return;
    const motion=panel.current.animate([{transform:'translateY(6px)'},{transform:'none'}],{duration:380,easing:'cubic-bezier(.22,1,.36,1)'});
    return ()=>motion.cancel();
  },[view,topic]);
  function clear(){
    if(busy||moves.length===3)return;
    const result=advance(board,selection,seed);if(!result){setMessage('Choose a connected group of matching pieces.');return;}
    setBusy(true);
    const commit=()=>{
      fall.current=result.origins;setBoard(result.cells);setSeed(result.seed);setMoves(prev=>[...prev,[...selection]]);setSelection([]);
      setMessage(moves.length===2?'Three clears complete. Open Engineering to inspect and replay your run.':`${result.cleared} cleared. Pieces fall down their columns; new pieces enter from above.`);
      timer.current=setTimeout(()=>setBusy(false),reduced()?0:460);
    };
    if(reduced()){commit();return;}
    animations.current.forEach(a=>a.cancel());animations.current=[];
    selection.forEach(i=>animations.current.push(boardRef.current.children[i].animate([{transform:'scale(1)',opacity:1},{transform:'scale(.35)',opacity:0}],{duration:220,easing:'ease-in',fill:'forwards'})));
    timer.current=setTimeout(commit,230);
  }
  function reset(){
    clearTimeout(timer.current);animations.current.forEach(a=>a.cancel());animations.current=[];fall.current=null;
    setBoard(initialBoard.map(c=>({...c})));setSelection([]);setSeed(INITIAL_SEED);setMoves([]);setBusy(false);
    setMessage('Connect 2 or more matching pieces along their sides. Clear three groups to finish.');
  }
  const replayed=replay(moves),verified=JSON.stringify(replayed?.cells)===JSON.stringify(board)&&replayed?.seed===seed;
  const topics={
    gravity:{title:'Gravity preserves order.',description:'This is the same column-compaction helper used in Fluctra’s web preview. Each affected column retains its survivors in order, inserts replacements above them, and records where every tile came from. Those origins drive the falling animation.',code:coreSource.slice(coreSource.indexOf('export function fallBoard')).trim(),note:'Invariant: untouched columns are unchanged. Surviving pieces never cross columns. Animation is derived from the result; it does not decide game state.'},
    replay:{title:'A run you can reproduce.',description:'Randomness is explicit state. The starting board, initial seed and move log are enough to reproduce this three-turn demo. The check below replays your moves and compares both the final board and seed.',code:demoSource.slice(demoSource.indexOf('export function nextRandom'),demoSource.indexOf('export function selectCell')).trim()+'\n\n'+demoSource.slice(demoSource.indexOf('export function replay')).trim(),note:`Replay check: ${verified?'MATCH':'MISMATCH'}\nInitial seed: ${INITIAL_SEED}\nCurrent seed: ${seed}\nMoves: ${JSON.stringify(moves)}`},
    trust:{title:'Reproducible does not mean trusted.',description:'A deterministic client is useful for debugging, but a player can modify it. A competitive backend must validate the run independently before accepting a score. This portfolio demo stays local and submits nothing.',code:'// Illustrative server boundary, not called by this demo.\nconst challenge = await loadIssuedChallenge(user, runId);\nassertValidMoveSequence(challenge.board, moves);\nconst result = replayWithRules(challenge.seed, moves);\nawait saveResultOnce({ user, runId, result });',note:'The server owns the issued challenge, allowed rules, deadline and final score. A unique run ID prevents duplicate submissions; purchase rewards require independent receipt validation.'}
  };
  const info=topics[topic];
  return <div className="showcase">
    <div className="showcase-top"><span className="demo-label"><span className="status-dot"/>Play a three-clear round</span><div className="view-switch" role="group" aria-label="Showcase view">{['product','engineering'].map(mode=><button key={mode} disabled={busy} aria-pressed={view===mode} onClick={()=>setView(mode)}>{mode==='product'?'Product':'Engineering'}</button>)}</div></div>
    <div ref={panel} className="showcase-stage">{view==='product'?<div className="product-view"><div className="demo-game"><div className="game-heading"><span>FLUCTRA</span><small>{moves.length} / 3 clears</small></div>
      <div ref={boardRef} className="demo-grid" aria-label="Three-clear Fluctra gameplay excerpt">{board.map((piece,i)=><button key={`${moves.length}-${i}`} disabled={busy||moves.length===3} style={{'--piece':piece.col}} aria-label={`Row ${Math.floor(i/5)+1}, column ${i%5+1}: ${piece.sym}`} aria-pressed={selection.includes(i)} onClick={()=>setSelection(selectCell(board,selection,i))}>{piece.sym}{selection.includes(i)&&<small>{selection.indexOf(i)+1}</small>}</button>)}</div>
      <div className="demo-actions">{moves.length===3?<button className="button mint" disabled={busy} onClick={()=>{setTopic('replay');setView('engineering');}}>Inspect your replay</button>:<button className="button mint" disabled={busy||selection.length<2} onClick={clear}>{busy?'Pieces falling…':`Clear${selection.length?' '+selection.length+' selected':''}`}</button>}<button className="text-button" disabled={busy} onClick={reset}>Restart</button></div><p className="demo-help" role="status">{message}</p>
      </div><figure className="phone"><img src="/photo/fluctra-iphone.jpg" alt="Fluctra’s native iPhone app" width="600" height="1300"/><figcaption>The native iPhone app</figcaption></figure></div>:<div className="engineering-view engineering-deep"><div className="engineering-tabs" role="group" aria-label="Engineering topic">{Object.keys(topics).map(key=><button key={key} aria-pressed={topic===key} onClick={()=>setTopic(key)}>{key==='gravity'?'Gravity':key==='replay'?'Deterministic replay':'Server boundary'}</button>)}</div><h3>{info.title}</h3><p>{info.description}</p><pre tabIndex="0" aria-label={`${info.title} code`}><code>{info.code}</code></pre><p className="engineering-note">{info.note}</p></div>}</div>
    <div className="showcase-bottom"><span>Connected groups · gravity · seeded refill</span><a href="https://fluctra.com" target="_blank" rel="noopener noreferrer">Play the full game ↗</a></div>
  </div>;
}
