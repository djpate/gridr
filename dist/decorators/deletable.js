"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deletable = void 0;
var deletable = function (widget) {
    Array.from(widget.element.getElementsByClassName('closeHandle')).forEach(function (handler) {
        handler.addEventListener('click', function () {
            widget.delete();
        });
    });
};
exports.deletable = deletable;
//# sourceMappingURL=deletable.js.map