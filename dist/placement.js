"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Placement = void 0;
var lodash_1 = require("lodash");
var Placement = /** @class */ (function () {
    function Placement(startCol, endCol, startRow, endRow) {
        Object.defineProperty(this, "startCol", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "endCol", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "startRow", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "endRow", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.startCol = startCol;
        this.endCol = endCol;
        this.startRow = startRow;
        this.endRow = endRow;
    }
    Object.defineProperty(Placement.prototype, "width", {
        get: function () {
            return this.endCol - this.startCol;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Placement.prototype, "height", {
        get: function () {
            return this.endRow - this.startRow;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Placement.prototype, "ranges", {
        get: function () {
            return {
                col: (0, lodash_1.range)(this.startCol, this.endCol),
                row: (0, lodash_1.range)(this.startRow, this.endRow)
            };
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Placement.prototype, "moveColumn", {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function (columnIndex) {
            var width = this.width;
            this.startCol = columnIndex;
            this.endCol = columnIndex + width;
        }
    });
    Object.defineProperty(Placement.prototype, "sameAs", {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function (placement) {
            return placement.startCol == this.startCol &&
                placement.endCol == this.endCol &&
                placement.startRow == this.startRow &&
                placement.endRow == this.endRow;
        }
    });
    Object.defineProperty(Placement.prototype, "clone", {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function () {
            return new Placement(this.startCol, this.endCol, this.startRow, this.endRow);
        }
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Object.defineProperty(Placement.prototype, "foreachRow", {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function (callback) {
            for (var i = this.startRow; i < this.endRow; i++) {
                callback(i);
            }
        }
    });
    return Placement;
}());
exports.Placement = Placement;
//# sourceMappingURL=placement.js.map