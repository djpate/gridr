"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.draggable = void 0;
var lodash_1 = require("lodash");
var draggable = function (widget) {
    Array.from(widget.element.getElementsByClassName('dragHandle')).forEach(function (handler) {
        handler.addEventListener('mousedown', startDrag.bind(widget));
        handler.style.cursor = 'grab';
    });
};
exports.draggable = draggable;
var startDrag = function (event) {
    event.preventDefault();
    var gridSize = this.grid.rootElement.getBoundingClientRect();
    var size = this.element.getBoundingClientRect();
    var initial = {
        offsetX: event.offsetX,
        offsetY: event.offsetY,
        width: size.width,
        height: size.height
    };
    this.element.style.width = size.width + "px";
    this.element.style.height = size.height + "px";
    this.element.style.top = String(size.top - gridSize.top) + "px";
    this.element.style.left = String(size.left - gridSize.left) + "px";
    this.moving = true;
    var mouseMoveHandler = drag.bind(this, initial);
    window.addEventListener('mousemove', mouseMoveHandler);
    window.addEventListener('mouseup', stopDrag.bind(this, mouseMoveHandler), { once: true });
};
var stopDrag = function (mouseMoveHandler, event) {
    event.preventDefault();
    this.moving = false;
    window.removeEventListener('mousemove', mouseMoveHandler);
};
var drag = function (initial, event) {
    event.preventDefault();
    var gridSize = this.grid.rootElement.getBoundingClientRect();
    var offsetTop = gridSize.top + window.scrollY;
    var offsetLeft = gridSize.left;
    var top = Math.floor(event.pageY - offsetTop - initial.offsetY);
    var left = Math.floor(event.pageX - initial.offsetX - offsetLeft);
    var maxLeft = gridSize.width - this.grid.columnWidth - (this.grid.columnPadding / 2);
    var coord = {
        top: Math.max(0, top),
        left: (0, lodash_1.clamp)(left, 0, maxLeft)
    };
    this.applyCoords(coord);
    var ghostPlacement = this.grid.placement(this);
    if (this.placement && ghostPlacement.sameAs(this.placement))
        return;
    this.grid.setGhost(ghostPlacement);
    this.move(ghostPlacement);
    console.log(ghostPlacement);
};
//# sourceMappingURL=draggable.js.map