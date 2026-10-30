import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync} from 'node:fs';
import {initialBoard,INITIAL_SEED,advance,replay,selectCell,findGroup,fallBoard} from '../src/demo.js';
test('matching selection respects sides, not diagonals or wrapping rows',()=>{
 assert.deepEqual(selectCell(initialBoard,[0],1),[0,1]);
 assert.deepEqual(selectCell(initialBoard,[1],5),[1]);
 assert.deepEqual(selectCell(initialBoard,[0],2),[0]);
});
test('invalid or disconnected clear cannot mutate a run',()=>{
 assert.equal(advance(initialBoard,[0],INITIAL_SEED),null);
 assert.equal(advance(initialBoard,[0,0],INITIAL_SEED),null);
 assert.equal(advance(initialBoard,[0,2],INITIAL_SEED),null);
});
test('column gravity preserves order and untouched columns',()=>{
 const cells=Array.from({length:25},(_,i)=>({col:String(i),sym:'x'}));
 const result=fallBoard(cells,[10,15],5,[{col:'new',sym:'n'}]);
 assert.equal(result.cells[20].col,'20');assert.equal(result.cells[15].col,'5');assert.equal(result.cells[10].col,'0');
 for(let i=0;i<25;i++)if(i%5!==0)assert.deepEqual(result.cells[i],cells[i]);
 assert.equal(result.origins[15],5);assert.equal(result.origins[0],-2);
});
test('three real clears replay to identical board and seed',()=>{
 let board=initialBoard,seed=INITIAL_SEED;const moves=[];
 for(let turn=0;turn<3;turn++){
  const group=board.map((_,i)=>findGroup(board,5,i)).find(g=>g.length>=2);assert.ok(group);
  moves.push(group);const next=advance(board,group,seed);assert.ok(next);board=next.cells;seed=next.seed;
 }
 assert.deepEqual(replay(moves),{cells:board,seed});assert.notEqual(seed,INITIAL_SEED);
});
test('resume and real project images remain available',()=>{
 for(const name of ['ResumeUpdated.pdf','photo/fluctra-iphone.jpg','photo/dungeon-break.webp',...[2,3,4,5].map(n=>`photo/dungeon-break-${n}.webp`),'photo/dungeon-break-qr.png'])assert.ok(existsSync(new URL('../public/'+name,import.meta.url)));
});

test('the complete workstation stays inside narrow and short viewports', async () => {
  const { fitWorkstation } = await import('../src/workstation-layout.js');
  for (const [width, height] of [[320,568],[390,844],[768,1024],[1024,600],[1366,768],[1920,1080],[2560,1440]]) {
    const { x, y, scale } = fitWorkstation(width, height);
    // Includes a conservative margin around the lamp, cable and 3D tilt.
    assert.ok(x - 170 * scale >= 0, `left edge at ${width}×${height}`);
    assert.ok(x + 650 * scale <= width, `right edge at ${width}×${height}`);
    assert.ok(y - 60 * scale >= 0, `top edge at ${width}×${height}`);
    assert.ok(y + 660 * scale <= height, `bottom edge at ${width}×${height}`);
  }
});

test('random workspace entries retain valid board history in every tab and stage', async () => {
  const {createWorkspaceEntry} = await import('../src/workspace-entry.js');
  for (let variant=0; variant<12; variant++) {
    const entry=createWorkspaceEntry(()=> (variant+.25)/12);
    assert.equal(entry.variant,variant);
    assert.deepEqual(replay(entry.moves),{cells:entry.cells,seed:entry.seed});
    assert.ok(entry.moves.length>=1);
    if(entry.phase!==2)assert.deepEqual(entry.next,advance(entry.cells,entry.group,entry.seed));
    assert.notEqual(createWorkspaceEntry(()=>(variant+.25)/12,variant).variant,variant);
  }
});
