export function createFullFloor(size) {
    return Array.from({ length: size }, () => Array(size).fill(1));
}

export function createHorizontalConveyor(row, startCol, idPrefix, allowDrop = false) {
    return [0, 1, 2].map((frame, index) => ({
        type: "conveyor",
        row,
        col: startCol + index,
        id: `${idPrefix}_${index}`,
        attributes: { allowDrop, frame }
    }));
}

export function createVerticalConveyor(startRow, col, idPrefix, allowDrop = false) {
    return [5 , 4, 3].map((frame, index) => ({
        type: "conveyor",
        row: startRow + index,
        col,
        id: `${idPrefix}_${index}`,
        attributes: { allowDrop, frame }
    }));
}

export function createEdgeWalls(leftRows, topCols) {
    return [
        ...leftRows.map((row) => ({
            type: "walls",
            row,
            col: 0,
            id: `wall_left_${row}`,
            attributes: { allowDrop: false, frame: 0 }
        })),
        ...topCols.map((col) => ({
            type: "walls",
            row: 0,
            col,
            id: `wall_top_${col}`,
            attributes: { allowDrop: false, frame: 1 }
        }))
    ];
}
