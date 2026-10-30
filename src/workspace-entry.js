import { initialBoard, INITIAL_SEED, findGroup, advance } from './demo.js';

export function createWorkspaceEntry(random = Math.random, previous = -1) {
  const sample = () => Math.max(0, Math.min(.999999, random()));
  const count = 12;
  let variant = Math.floor(sample() * count);
  if (variant === previous) variant = (variant + 1 + Math.floor(sample() * (count - 1))) % count;
  const phase = variant % 3;
  const family = Math.floor(variant / 3) % 2;
  const stage = variant < 6 ? 'typing' : 'running';
  let cells = initialBoard, seed = INITIAL_SEED;
  const moves = [];
  const turns = 1 + Math.floor(sample() * 3);
  const groups = board => [...new Map(board.map((_, index) => {
    const group = findGroup(board, 5, index);
    return [group.slice().sort((a,b)=>a-b).join(','), group];
  })).values()].filter(group => group.length >= 2);

  for (let turn = 0; turn < turns; turn++) {
    const candidates = groups(cells);
    if (!candidates.length) break;
    const move = candidates[Math.floor(sample() * candidates.length)];
    const result = advance(cells, move, seed);
    moves.push(move);
    cells = result.cells;
    seed = result.seed;
  }
  const candidates = groups(cells);
  const group = candidates[Math.floor(sample() * candidates.length)] || [];
  return {
    variant, phase, family, stage, cells, seed, moves, group,
    next: phase === 2 ? { cells, seed } : advance(cells, group, seed),
    editFraction: .55 + sample() * .28,
    selectionOffset: Math.floor(sample() * 25),
  };
}
