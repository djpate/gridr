import { intersection, last, range } from "lodash";
import { Placement } from "./placement";
export class GridMap {
    grid;
    constructor(grid) {
        this.grid = grid;
    }
    rowData(index) {
        return this.map[index] || [];
    }
    firstAvailablePlacement(width, height, widgetId) {
        let row = 0;
        let counter = 0;
        let previousColumns;
        for (;;) {
            const columns = this.potentialStartColumnsInRow(row, width);
            previousColumns = (previousColumns && previousColumns.length) ? intersection(previousColumns, columns) : columns;
            if (previousColumns.length) {
                counter++;
            }
            else {
                counter = 0;
            }
            if (counter === height) {
                return new Placement(previousColumns[0], previousColumns[0] + width, row - height + 1, row + 1);
            }
            else {
                row++;
            }
        }
    }
    maxStartingRowByCol(col, widget) {
        let row = 0;
        let max = 0;
        let lastWidgetOnCol;
        console.log(this.map);
        for (;;) {
            const rowData = this.rowData(row);
            if (rowData[col] !== undefined) {
                lastWidgetOnCol = rowData[col];
            }
            else if (lastWidgetOnCol === widget.id) {
                max = row - widget.placement.height;
                break;
            }
            else {
                max = row;
                break;
            }
            row++;
        }
        console.log('last wid', lastWidgetOnCol);
        console.log('max for', col, 'is', max);
        return max;
    }
    // given a row and width give me all the potential cols 
    // I could start at without colliding with something
    potentialStartColumnsInRow(rowIndex, width) {
        const cols = [];
        const rowData = this.rowData(rowIndex);
        const columnsInRow = rowData.filter((cell) => cell !== undefined).length;
        if (columnsInRow > (this.grid.columns - width))
            return [];
        if (columnsInRow === 0)
            return range(this.grid.columns);
        let counter = 0;
        for (let i = 0; i < this.grid.columns; i++) {
            if (rowData[i] === undefined)
                counter++;
            else
                counter = 0;
            if (counter >= width)
                cols.push(i - (width - 1));
        }
        return cols;
    }
    get map() {
        const grid = {};
        this.grid.widgets.forEach((widget) => {
            if (widget.placement) {
                const ranges = widget.placement.ranges;
                ranges.row.forEach((row) => {
                    grid[row] ??= [];
                    ranges.col.forEach((col) => {
                        grid[row][col] = widget.id;
                    });
                });
            }
        });
        return grid;
    }
    get lastRow() {
        const rowIds = Object.keys(this.map);
        return rowIds.length ? Number(last(Object.keys(this.map).sort())) : 0;
    }
    deleteRow(rowId) {
        const lastRow = this.lastRow;
        const visited = new Set();
        for (let i = rowId; i <= lastRow; i++) {
            const rowData = this.rowData(i);
            for (let y = 0; y < this.grid.columns; y++) {
                if (rowData[y] !== undefined && !visited.has(rowData[y])) {
                    visited.add(rowData[y]);
                }
            }
        }
        visited.forEach((widgetId) => {
            const widget = this.grid.widget(widgetId);
            const placement = this.grid.widget(widgetId).placement.clone();
            placement.startRow = placement.startRow - 1;
            placement.endRow = placement.endRow - 1;
            widget.placement = placement;
            widget.snap();
        });
    }
    collisions(placement, widgetToIgnore) {
        const colliding_ids = new Set();
        for (let row = placement.startRow; row < placement.endRow; row++) {
            const rowData = this.rowData(row);
            for (let col = placement.startCol; col < placement.endCol; col++) {
                if (rowData[col] !== undefined && rowData[col] !== widgetToIgnore) {
                    colliding_ids.add(rowData[col]);
                }
            }
        }
        return Array.from(colliding_ids).map((id) => this.grid._widgets[id]);
    }
}
//# sourceMappingURL=grid_map.js.map