"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GridMap = void 0;
var lodash_1 = require("lodash");
var placement_1 = require("./placement");
var GridMap = /** @class */ (function () {
    function GridMap(grid) {
        Object.defineProperty(this, "grid", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.grid = grid;
    }
    Object.defineProperty(GridMap.prototype, "rowData", {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function (index) {
            return this.map[index] || [];
        }
    });
    Object.defineProperty(GridMap.prototype, "firstAvailablePlacement", {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function (width, height, widgetId) {
            var row = 0;
            var counter = 0;
            var previousColumns;
            for (;;) {
                var columns = this.potentialStartColumnsInRow(row, width);
                previousColumns = (previousColumns && previousColumns.length) ? lodash_1.intersection(previousColumns, columns) : columns;
                if (previousColumns.length) {
                    counter++;
                }
                else {
                    counter = 0;
                }
                if (counter === height) {
                    return new placement_1.Placement(previousColumns[0], previousColumns[0] + width, row - height + 1, row + 1);
                }
                else {
                    row++;
                }
            }
        }
    });
    Object.defineProperty(GridMap.prototype, "maxStartingRowByCol", {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function (col, widget) {
            var row = 0;
            var max = 0;
            var lastWidgetOnCol;
            for (;;) {
                var rowData = this.rowData(row);
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
            return max;
        }
    });
    // given a row and width give me all the potential cols 
    // I could start at without colliding with something
    Object.defineProperty(GridMap.prototype, "potentialStartColumnsInRow", {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function (rowIndex, width) {
            var cols = [];
            var rowData = this.rowData(rowIndex);
            var columnsInRow = rowData.filter(function (cell) { return cell !== undefined; }).length;
            if (columnsInRow > (this.grid.columns - width))
                return [];
            if (columnsInRow === 0)
                return lodash_1.range(this.grid.columns);
            var counter = 0;
            for (var i = 0; i < this.grid.columns; i++) {
                if (rowData[i] === undefined)
                    counter++;
                else
                    counter = 0;
                if (counter >= width)
                    cols.push(i - (width - 1));
            }
            return cols;
        }
    });
    Object.defineProperty(GridMap.prototype, "map", {
        get: function () {
            var grid = {};
            this.grid.widgets.forEach(function (widget) {
                if (widget.placement) {
                    var ranges_1 = widget.placement.ranges;
                    ranges_1.row.forEach(function (row) {
                        var _a;
                        (_a = grid[row]) !== null && _a !== void 0 ? _a : (grid[row] = []);
                        ranges_1.col.forEach(function (col) {
                            grid[row][col] = widget.id;
                        });
                    });
                }
            });
            return grid;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(GridMap.prototype, "lastRow", {
        get: function () {
            var rowIds = Object.keys(this.map);
            return rowIds.length ? Number(lodash_1.last(Object.keys(this.map).sort())) : 0;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(GridMap.prototype, "deleteRow", {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function (rowId) {
            var _this = this;
            var lastRow = this.lastRow;
            var visited = new Set();
            for (var i = rowId; i <= lastRow; i++) {
                var rowData = this.rowData(i);
                for (var y = 0; y < this.grid.columns; y++) {
                    if (rowData[y] !== undefined && !visited.has(rowData[y])) {
                        visited.add(rowData[y]);
                    }
                }
            }
            visited.forEach(function (widgetId) {
                var widget = _this.grid.widget(widgetId);
                var placement = _this.grid.widget(widgetId).placement.clone();
                placement.startRow = placement.startRow - 1;
                placement.endRow = placement.endRow - 1;
                widget.placement = placement;
                widget.snap();
            });
        }
    });
    Object.defineProperty(GridMap.prototype, "collisions", {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function (placement, widgetToIgnore) {
            var _this = this;
            var colliding_ids = new Set();
            for (var row = placement.startRow; row < placement.endRow; row++) {
                var rowData = this.rowData(row);
                for (var col = placement.startCol; col < placement.endCol; col++) {
                    if (rowData[col] !== undefined && rowData[col] !== widgetToIgnore) {
                        colliding_ids.add(rowData[col]);
                    }
                }
            }
            return Array.from(colliding_ids).map(function (id) { return _this.grid._widgets[id]; });
        }
    });
    return GridMap;
}());
exports.GridMap = GridMap;
//# sourceMappingURL=grid_map.js.map