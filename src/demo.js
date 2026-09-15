import { findGroup, fallBoard } from './game-core.js';
export { findGroup, fallBoard } from './game-core.js';
export const pieces=[{name:'violet diamond',sym:'◆',col:'#9c8cff'},{name:'pink circle',sym:'●',col:'#ff668e'},{name:'green triangle',sym:'▲',col:'#93df69'},{name:'gold star',sym:'★',col:'#ffd568'}];
export const initialBoard=[0,0,1,2,3,0,1,1,2,3,2,3,1,0,0,2,2,3,0,1,3,2,3,1,1].map(i=>({...pieces[i]}));
export const INITIAL_SEED=713;
export function nextRandom(seed){seed ^= seed << 13; seed ^= seed >> 17; seed ^= seed << 5; return seed >>> 0;}
export function selectCell(board, selection, index) {
  if (!Number.isInteger(index) || !board[index]) return selection;
  if (selection.includes(index)) return selection.filter(cell => cell !== index);
  if (!selection.length) return [index];

  const cell = board[index];
  const first = board[selection[0]];
  if (cell.col !== first.col || cell.sym !== first.sym) return selection;

  const touchesSelection = selection.some(selected => {
    const columnDistance = Math.abs(selected % 5 - index % 5);
    const rowDistance = Math.abs(Math.floor(selected / 5) - Math.floor(index / 5));
    return columnDistance + rowDistance === 1;
  });
  return touchesSelection ? [...selection, index] : selection;
}

export function advance(board, selection, seed) {
  if (selection.length < 2 || new Set(selection).size !== selection.length) return null;
  const group = findGroup(board, 5, selection[0]);
  if (!selection.every(index => group.includes(index))) return null;

  // The chosen pieces must connect without relying on unselected neighbors.
  const selectedBoard = board.map((piece, index) =>
    selection.includes(index) ? piece : { col: 'blocked' + index, sym: '' },
  );
  if (findGroup(selectedBoard, 5, selection[0]).length !== selection.length) return null;

  const beforeSeed = seed;
  const refill = [];
  for (let index = 0; index < selection.length; index++) {
    seed = nextRandom(seed);
    refill.push(pieces[Math.floor(seed / 4294967296 * pieces.length)]);
  }
  const result = fallBoard(board, selection, 5, refill);
  return { ...result, seed, beforeSeed, cleared: selection.length };
}

export function replay(moves) {
  let cells = initialBoard;
  let seed = INITIAL_SEED;

  for (const move of moves) {
    const result = advance(cells, move, seed);
    if (!result) return null;

    // Carry the random state forward with the board.
    cells = result.cells;
    seed = result.seed;
  }

  return { cells, seed };
}
