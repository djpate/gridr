"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Grid = exports.getCoordsForElement = exports.constrainedInGrid = void 0;
var grid_map_1 = require("./grid_map");
var placement_1 = require("./placement");
var widget_1 = require("./widget");
var lodash_1 = require("lodash");
// prevents the widget boundaries to leave the allowed grid
var constrainedInGrid = function (coords, gridWidth) {
    // return {
    //   height: coords.height,
    //   width: coords.width,
    //   top: Math.max(0, coords.top),
    //   left: Math.min(gridWidth - coords.width, Math.max(0, coords.left))
    // }
    return coords;
};
exports.constrainedInGrid = constrainedInGrid;
var getCoordsForElement = function (element) {
    return {
        height: parseInt(element.style.height),
        width: parseInt(element.style.width),
        top: parseInt(element.style.top),
        left: parseInt(element.style.left)
    };
};
exports.getCoordsForElement = getCoordsForElement;
var Grid = /** @class */ (function () {
    function Grid(id, columns) {
        Object.defineProperty(this, "_widgets", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: {}
        });
        Object.defineProperty(this, "rootElement", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "rowHeight", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 150
        });
        Object.defineProperty(this, "columnPadding", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 20
        });
        Object.defineProperty(this, "rowPadding", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 20
        });
        Object.defineProperty(this, "_width", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_columnWidth", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_gridMap", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "columns", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "movingWidget", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
        Object.defineProperty(this, "observer", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        var rootElement = document.getElementById(id);
        if (!rootElement)
            throw ("Could not create grid!, id #{id} not found");
        this.rootElement = rootElement;
        this.rootElement.classList.add('grid_root');
        // create shadow grid
        var shadowGrid = document.createElement("div");
        shadowGrid.classList.add('shadowGrid');
        rootElement.appendChild(shadowGrid);
        this.columns = columns;
        this.observer = new MutationObserver(this.newWidgetObserver.bind(this));
        this.observer.observe(this.rootElement, { subtree: false, childList: true });
        this.setupInitialWidgets();
        this.setContainerHeight();
        window.addEventListener('resize', this.resized.bind(this));
    }
    Object.defineProperty(Grid.prototype, "resized", {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function () {
            this._width = undefined;
            this._columnWidth = undefined;
            this.widgets.forEach(function (widget) { return widget.snap(); });
            this.setContainerHeight();
        }
    });
    Object.defineProperty(Grid.prototype, "setContainerHeight", {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function () {
            var lastRow = this.gridMap.lastRow + 1;
            this.rootElement.style.minHeight = lastRow * this.rowHeight + ((lastRow - 1) * this.rowPadding) + "px";
        }
    });
    Object.defineProperty(Grid.prototype, "setupInitialWidgets", {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function () {
            var _this = this;
            var widgets = Array.from(this.rootElement.getElementsByClassName('widget'));
            Array.from(widgets).forEach(function (widgetNode) {
                _this.setupWidget(widgetNode);
            });
            var ghost = document.createElement("div");
            ghost.classList.add('ghost');
            var inner = document.createElement("div");
            inner.classList.add('inner');
            ghost.appendChild(inner);
            this.rootElement.appendChild(ghost);
        }
    });
    Object.defineProperty(Grid.prototype, "setupWidget", {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function (element) {
            var width = Number(element.dataset.width) || 1;
            var height = Number(element.dataset.height) || 1;
            var minWidth = Number(element.dataset.minWidth) || 1;
            var ratio = element.dataset.ratio == "true" ? width / height : undefined;
            var placement = this.gridMap.firstAvailablePlacement(width, height);
            var widget = new widget_1.Widget(element, placement, this, { minWidth: minWidth, ratio: ratio });
            this._widgets[widget.id] = widget;
            this.setContainerHeight();
        }
    });
    Object.defineProperty(Grid.prototype, "newWidgetObserver", {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function (mutations, observer) {
            var _this = this;
            mutations.forEach(function (mutation_record) {
                mutation_record.addedNodes.forEach(function (addedNode) {
                    if (addedNode.classList.contains('widget')) {
                        _this.setupWidget(addedNode);
                    }
                });
            });
        }
    });
    Object.defineProperty(Grid.prototype, "width", {
        get: function () {
            var _a;
            return (_a = this._width) !== null && _a !== void 0 ? _a : (this._width = this.rootElement.clientWidth);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Grid.prototype, "columnWidth", {
        get: function () {
            var _a;
            // 2 is for each border
            // full width - the paddings, only n-2 since we don't want padding at the first and last columns
            var availableWidth = this.width - (this.columnPadding * (this.columns - 1));
            return (_a = this._columnWidth) !== null && _a !== void 0 ? _a : (this._columnWidth = Math.floor(availableWidth / this.columns));
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Grid.prototype, "widgets", {
        get: function () {
            return Object.values(this._widgets);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Grid.prototype, "clearGhost", {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function () {
            this.rootElement.classList.remove('moving');
            var ghost = this.rootElement.getElementsByClassName('ghost')[0];
            ghost.style.display = 'none';
            Array.from(this.rootElement.getElementsByClassName("shadowRow")).forEach(function (row) {
                row.remove();
            });
        }
    });
    Object.defineProperty(Grid.prototype, "setGhost", {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function (placement) {
            this.clearGhost();
            this.rootElement.classList.add('moving');
            var shadowGrid = this.rootElement.getElementsByClassName('shadowGrid')[0];
            for (var row = 0; row <= placement.endRow; row++) {
                var rowElement = document.createElement('div');
                rowElement.classList.add('shadowRow');
                shadowGrid.appendChild(rowElement);
                for (var col = 0; col < Math.min(this.columns, placement.endCol + 1); col++) {
                    var cell = document.createElement("div");
                    cell.classList.add('shadowCol');
                    cell.style.flexBasis = this.columnWidth + "px";
                    cell.style.maxWidth = this.columnWidth + "px";
                    rowElement.appendChild(cell);
                }
            }
            var ghost = this.rootElement.getElementsByClassName('ghost')[0];
            ghost.style.display = 'block';
            var ghostPadding = 20;
            var width = (placement.width * (this.columnWidth + this.columnPadding)) - this.columnPadding - ghostPadding;
            var height = ((placement.height * (this.rowHeight + this.rowPadding)) - this.rowPadding) - ghostPadding;
            var top = Math.max(0, placement.startRow * (this.rowHeight + this.rowPadding)) + ghostPadding / 2;
            var left = (placement.startCol * (this.columnWidth + this.columnPadding)) + ghostPadding / 2;
            var maxLeft = this.width - (placement.width * this.columnWidth) - ((placement.width - 1) * this.columnPadding);
            left = (0, lodash_1.clamp)(left, 0, maxLeft);
            ghost.style.top = top + 'px';
            ghost.style.left = left + 'px';
            ghost.style.width = width + 'px';
            ghost.style.height = height + 'px';
        }
    });
    Object.defineProperty(Grid.prototype, "widget", {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function (id) {
            return this._widgets[id];
        }
    });
    Object.defineProperty(Grid.prototype, "placement", {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function (widget) {
            var size = widget.element.getBoundingClientRect();
            var parentRect = this.rootElement.getBoundingClientRect();
            var top = size.top - parentRect.top;
            var left = size.left - parentRect.left;
            var width = Math.ceil(size.width / (this.columnPadding + this.columnWidth));
            var startCol = Math.floor(left / this.columnWidth);
            startCol = (0, lodash_1.clamp)(startCol, 0, this.columns - width);
            var endCol = startCol + width;
            var height = Math.ceil(size.height / (this.rowHeight + this.rowPadding));
            var startRow = Math.floor(top / (this.rowHeight + this.rowPadding));
            startRow = (0, lodash_1.clamp)(startRow, 0, 100);
            var endRow = startRow + height;
            return new placement_1.Placement(startCol, endCol, startRow, endRow);
        }
    });
    Object.defineProperty(Grid.prototype, "delete", {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function (widget) {
            delete this._widgets[widget.id];
            if (!widget.placement) {
                console.error('widget', widget.id, 'does not have a placement ?');
                return;
            }
            for (var row = widget.placement.endRow; row >= widget.placement.startRow; row--) {
                var rowData = this.gridMap.rowData(row);
                if (!rowData.length)
                    this.gridMap.deleteRow(row);
            }
        }
    });
    Object.defineProperty(Grid.prototype, "gridMap", {
        get: function () {
            var _a;
            return (_a = this._gridMap) !== null && _a !== void 0 ? _a : (this._gridMap = new grid_map_1.GridMap(this));
        },
        enumerable: false,
        configurable: true
    });
    return Grid;
}());
exports.Grid = Grid;
//# sourceMappingURL=grid.js.map