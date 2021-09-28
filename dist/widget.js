"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Widget = void 0;
var lodash_1 = require("lodash");
var draggable_1 = require("./decorators/draggable");
var resizable_1 = require("./decorators/resizable");
var deletable_1 = require("./decorators/deletable");
var Widget = /** @class */ (function () {
    function Widget(element, placement, grid) {
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
        Object.defineProperty(this, "minWidth", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 1
        });
        Object.defineProperty(this, "minHeight", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 1
        });
        Object.defineProperty(this, "moved", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
        Object.defineProperty(this, "element", {
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
        this.element = element;
        this.placement = placement;
        this.id = element.id || lodash_1.uniqueId();
        this.setupWidgetWrapper();
        resizable_1.resizable(this);
        draggable_1.draggable(this);
        deletable_1.deletable(this);
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
        }
    });
    Object.defineProperty(Widget.prototype, "snap", {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function () {
            if (!this.placement)
                return;
            this.element.classList.add('snapped');
            this.applyCoords({
                top: this.placement.startRow * this.grid.rowHeight + this.placement.startRow * 20,
                left: (this.placement.startCol * this.grid.columnWidth) + this.placement.startCol * 20,
                width: Math.floor(this.grid.columnWidth * this.placement.width + (this.placement.width - 1) * 20),
                height: Math.floor(this.grid.rowHeight * this.placement.height + (this.placement.height - 1) * 20)
            });
        }
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
            if (this.placement && this.placement.sameAs(placement))
                return;
            var collisions = this.grid.gridMap.collisions(placement, this.id);
            this.placement = placement;
            this.grid.setContainerHeight();
            collisions.forEach(function (collidingWidget) {
                var newPlacement = collidingWidget.closestNewSpot();
                collidingWidget.placement = newPlacement;
                collidingWidget.snap();
            });
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