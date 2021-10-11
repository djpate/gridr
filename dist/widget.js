"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Widget = void 0;
var lodash_1 = require("lodash");
var draggable_1 = require("./decorators/draggable");
var resizable_1 = require("./decorators/resizable");
var deletable_1 = require("./decorators/deletable");
var Widget = /** @class */ (function () {
    function Widget(element, placement, grid, constraints) {
        // used during drag and resize events, not contained to grid
        Object.defineProperty(this, "_coords", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: {
                height: 0,
                width: 0,
                top: 0,
                left: 0
            }
        });
        Object.defineProperty(this, "_moving", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
        Object.defineProperty(this, "_reflowed", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
        Object.defineProperty(this, "moved", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
        Object.defineProperty(this, "constraints", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "moveTimeout", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        Object.defineProperty(this, "element", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "originalElement", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        // unique id to identify the widget
        Object.defineProperty(this, "id", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_placement", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: null
        });
        Object.defineProperty(this, "previousPlacement", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: null
        });
        Object.defineProperty(this, "grid", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.grid = grid;
        this.originalElement = element;
        this.element = element;
        this.placement = placement;
        this.id = element.id || (0, lodash_1.uniqueId)();
        this.constraints = constraints;
        this.setupWidgetWrapper();
        (0, resizable_1.resizable)(this);
        (0, draggable_1.draggable)(this);
        (0, deletable_1.deletable)(this);
        this.snap();
    }
    Object.defineProperty(Widget.prototype, "setupWidgetWrapper", {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function () {
            var wrapped = document.createElement('div');
            wrapped.appendChild(this.element);
            wrapped.id = "widget_container_" + this.id;
            wrapped.classList.add('widget_container');
            this.element = wrapped;
            this.grid.rootElement.appendChild(wrapped);
            this.originalElement.dispatchEvent(new CustomEvent('widgetized', { detail: { widget: this } }));
        }
    });
    Object.defineProperty(Widget.prototype, "snap", {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function () {
            if (!this.placement)
                return;
            clearTimeout(this.moveTimeout);
            this.element.classList.add('snapped');
            this.applyCoords({
                top: this.placement.startRow * this.grid.rowHeight + this.placement.startRow * this.grid.rowPadding,
                left: (this.placement.startCol * this.grid.columnWidth) + this.placement.startCol * this.grid.columnPadding,
                width: Math.floor(this.grid.columnWidth * this.placement.width + (this.placement.width - 1) * (this.grid.columnPadding)),
                height: Math.floor(this.grid.rowHeight * this.placement.height + (this.placement.height - 1) * (this.grid.rowPadding))
            });
        }
    });
    Object.defineProperty(Widget.prototype, "width", {
        get: function () {
            return this.element.getBoundingClientRect().width;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Widget.prototype, "widthUnit", {
        get: function () {
            return Math.ceil(this.width / this.grid.columnWidth);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Widget.prototype, "height", {
        get: function () {
            return this.element.getBoundingClientRect().height;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Widget.prototype, "heightUnit", {
        get: function () {
            return Math.floor(this.height / this.grid.rowHeight);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Widget.prototype, "minWidthUnit", {
        get: function () {
            var _a;
            return (((_a = this.constraints) === null || _a === void 0 ? void 0 : _a.minWidth) || 1);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Widget.prototype, "minHeightUnit", {
        get: function () {
            var _a;
            return (((_a = this.constraints) === null || _a === void 0 ? void 0 : _a.minHeight) || 1);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Widget.prototype, "minWidth", {
        get: function () {
            var unit = this.minWidthUnit;
            return unit * this.grid.columnWidth + ((unit - 1) * this.grid.columnPadding);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Widget.prototype, "minHeight", {
        get: function () {
            var unit = this.minHeightUnit;
            return unit * this.grid.rowHeight + ((unit - 1) * this.grid.rowPadding);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Widget.prototype, "moving", {
        set: function (state) {
            var _a;
            if (state) {
                this.element.classList.remove('snapped');
                this.element.classList.add('moving');
                this.previousPlacement = this.placement.clone();
                this.placement = null;
            }
            else {
                clearTimeout(this.moveTimeout);
                (_a = this.placement) !== null && _a !== void 0 ? _a : (this.placement = this.previousPlacement);
                this.element.classList.remove('moving');
                this.grid.clearGhost();
                this.snap();
            }
            this._moving = state;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Widget.prototype, "closestNewSpot", {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function () {
            // remove yourself from the grid
            var placement = this.placement.clone();
            this.placement = null;
            return this.grid.gridMap.firstAvailablePlacement(placement.width, placement.height);
        }
    });
    Object.defineProperty(Widget.prototype, "move", {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function (placement) {
            var _this = this;
            clearTimeout(this.moveTimeout);
            if (this.placement && this.placement.sameAs(placement))
                return;
            var collisions = this.grid.gridMap.collisions(placement, this.id);
            var delay = collisions.length ? 150 : 0;
            this.moveTimeout = setTimeout(function () {
                _this.placement = placement;
                _this.grid.setContainerHeight();
                collisions.forEach(function (collidingWidget) {
                    var newPlacement = collidingWidget.closestNewSpot();
                    collidingWidget.placement = newPlacement;
                    collidingWidget.snap();
                });
            }, delay);
        }
    });
    Object.defineProperty(Widget.prototype, "delete", {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function () {
            this.element.remove();
            this.grid.delete(this);
        }
    });
    Object.defineProperty(Widget.prototype, "applyCoords", {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function (coords) {
            var _this = this;
            // if (this.constraints?.ratio && coords.width && coords.height) {
            //   let widthUnit = coords.width / (this.grid.columnWidth + this.grid.columnPadding)
            //   let heightUnit = coords.height / (this.grid.rowHeight + this.grid.rowPadding)
            //   if (widthUnit > heightUnit) {
            //     let minHeightUnit = (widthUnit / this.constraints.ratio)
            //     let minHeight = Math.max(this.minHeight, minHeightUnit * this.grid.rowHeight + ((Math.ceil(minHeightUnit) - 1) * this.grid.rowPadding))
            //     coords.height = Math.max(minHeight, coords.height)
            //   } else {
            //     let minWidthUnit = (heightUnit * this.constraints.ratio)
            //     let minWidth = Math.max(this.minWidth, minWidthUnit * this.grid.columnWidth + ((Math.ceil(minWidthUnit) - 1) * this.grid.columnPadding))
            //     coords.width = clamp(coords.width, minWidth, this.grid.width)
            //   }
            // }
            Object.keys(coords).forEach(function (key) {
                var value = coords[key];
                _this.element.style.setProperty(key, value + "px");
            });
        }
    });
    Object.defineProperty(Widget.prototype, "placement", {
        get: function () {
            return this._placement;
        },
        set: function (placement) {
            this._placement = placement;
        },
        enumerable: false,
        configurable: true
    });
    return Widget;
}());
exports.Widget = Widget;
//# sourceMappingURL=widget.js.map