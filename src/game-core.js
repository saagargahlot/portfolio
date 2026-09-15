// Fluctra's orthogonal matching and column gravity, shared with the live demo.
export function findGroup(cells, size, start) {
  const first = cells[start];
  if (!first) return [];

  const found = new Set([start]);
  const queue = [start];

  for (let cursor = 0; cursor < queue.length; cursor++) {
    const current = queue[cursor];
    const neighbors = [
      current - size, current + size,
      current - 1, current + 1,
    ];

    for (const neighbor of neighbors) {
      if (!cells[neighbor] || found.has(neighbor)) continue;

      // Adjacent indices can cross a row boundary.
      const columnDistance = Math.abs(current % size - neighbor % size);
      const rowDistance = Math.abs(
        Math.floor(current / size) - Math.floor(neighbor / size),
      );
      if (columnDistance + rowDistance !== 1) continue;

      const piece = cells[neighbor];
      if (piece.sym !== first.sym || piece.col !== first.col) continue;

      found.add(neighbor);
      queue.push(neighbor);
    }
  }

  return [...found];
}

export function fallBoard(cells, cleared, size, refill) {
  const removed = new Set(cleared);
  const output = cells.map(piece => ({ ...piece }));
  const origins = cells.map((_, index) => index);
  const affectedColumns = new Set(cleared.map(index => index % size));
  let refillIndex = 0;

  for (const column of affectedColumns) {
    const indices = Array.from({ length: size }, (_, row) => row * size + column);
    const survivors = indices.filter(index => !removed.has(index));
    const emptyRows = size - survivors.length;

    // Keep the surviving pieces in their original order.
    for (let row = 0; row < size; row++) {
      const destination = row * size + column;
      if (row < emptyRows) {
        output[destination] = { ...refill[refillIndex++ % refill.length] };
        origins[destination] = row - emptyRows;
      } else {
        const source = survivors[row - emptyRows];
        output[destination] = { ...cells[source] };
        origins[destination] = source;
      }
    }
  }

  return { cells: output, origins };
}
