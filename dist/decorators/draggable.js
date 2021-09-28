"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.draggable = void 0;
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
    var offsetTop = this.grid.rootElement.getBoundingClientRect().top + window.scrollY;
    var offsetLeft = this.grid.rootElement.getBoundingClientRect().left;
    var coord = {
        top: Math.floor(event.pageY - offsetTop - initial.offsetY),
        left: Math.floor(event.pageX - initial.offsetX - offsetLeft),
    };
    this.applyCoords(coord);
    var ghostPlacement = this.grid.placement(this);
    if (this.placement && ghostPlacement.sameAs(this.placement))
        return;
    this.grid.setGhost(ghostPlacement);
    this.move(ghostPlacement);
};
//# sourceMappingURL=draggable.js.map