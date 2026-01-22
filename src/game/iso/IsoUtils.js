// Convert grid coordinates to screen coordinates using isometric projection
export function gridToScreen(gridRow, gridCol, tileWidth, tileHeight, z = 0) {
  // Isometric projection formula:
  // screenX = (col - row) * (tileWidth / 2)
  // screenY = (col + row) * (tileHeight / 2) - z
  const x = (gridCol - gridRow) * (tileWidth / 2);
  const y = (gridCol + gridRow) * (tileHeight / 2) - z;
  return { x, y };
}

// Convert screen coordinates to grid coordinates
export function screenToGrid(screenX, screenY, tileWidth, tileHeight) {
  const gridCol = (screenX / (tileWidth / 2) + screenY / (tileHeight / 2)) / 2;
  const gridRow = (screenY / (tileHeight / 2) - screenX / (tileWidth / 2)) / 2;
  return { row: Math.floor(gridRow), col: Math.floor(gridCol) };
}
