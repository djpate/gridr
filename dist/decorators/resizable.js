"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.resizable = void 0;
var Position;
(function (Position) {
    Position["topLeft"] = "topLeft";
    Position["topRight"] = "topRight";
    Position["bottomLeft"] = "bottomLeft";
    Position["bottomRight"] = "bottomRight";
})(Position || (Position = {}));
var resizable = function (widget) {
    [Position.topLeft, Position.topRight, Position.bottomLeft, Position.bottomRight].forEach(function (position) {
        var resizeHandle = document.createElement("div");
        resizeHandle.classList.add('resizer');
        resizeHandle.classList.add(String(position));
        resizeHandle.addEventListener('mousedown', startResize.bind(widget, position));
        widget.element.appendChild(resizeHandle);
    });
};
exports.resizable = resizable;
var startResize = function (position, event) {
    event.preventDefault();
    var size = this.element.getBoundingClientRect();
    var initial = {
        mousex: event.pageX,
        mousey: event.pageY,
        width: size.width,
        height: size.height,
        topOffset: this.grid.rootElement.offsetTop,
        leftOffset: this.grid.rootElement.offsetLeft,
        originalx: this.element.offsetLeft,
        originaly: this.element.offsetTop
    };
    this.element.style.position = 'absolute';
    this.moving = true;
    var mouseMoveHandler = HandlerMap[position].bind(this, initial);
    var mouseUpHandler = stopResize.bind(this, mouseMoveHandler);
    window.addEventListener('mousemove', mouseMoveHandler);
    window.addEventListener('mouseup', mouseUpHandler, { once: true });
};
var stopResize = function (mouseMoveHandler, event) {
    window.removeEventListener('mousemove', mouseMoveHandler);
    this.moving = false;
    this.element.dispatchEvent(new CustomEvent('resized'));
};
var bottomRight = function (initial, event) {
    this.applyCoords({
        width: initial.width + (event.pageX - initial.mousex),
        height: initial.height + (event.pageY - initial.mousey),
    });
    var ghostPlacement = this.grid.placement(this);
    this.grid.setGhost(ghostPlacement);
    this.move(ghostPlacement);
};
var bottomLeft = function (initial, event) {
    this.applyCoords({
        width: initial.width - (event.pageX - initial.mousex),
        height: initial.height + (event.pageY - initial.mousey),
        left: initial.originalx + (event.pageX - initial.mousex)
    });
    var ghostPlacement = this.grid.placement(this);
    this.grid.setGhost(ghostPlacement);
    this.move(ghostPlacement);
};
var topRight = function (initial, event) {
    this.applyCoords({
        width: initial.width + (event.pageX - initial.mousex),
        height: initial.height - (event.pageY - initial.mousey),
        top: initial.originaly + (event.pageY - initial.mousey),
    });
    var ghostPlacement = this.grid.placement(this);
    this.grid.setGhost(ghostPlacement);
    this.move(ghostPlacement);
};
var topLeft = function (initial, event) {
    this.applyCoords({
        width: initial.width - (event.pageX - initial.mousex),
        height: initial.height - (event.pageY - initial.mousey),
        top: initial.originaly + (event.pageY - initial.mousey),
        left: initial.originalx + (event.pageX - initial.mousex)
    });
    var ghostPlacement = this.grid.placement(this);
    this.grid.setGhost(ghostPlacement);
    this.move(ghostPlacement);
};
var HandlerMap = (_a = {},
    _a[Position.topLeft] = topLeft,
    _a[Position.topRight] = topRight,
    _a[Position.bottomLeft] = bottomLeft,
    _a[Position.bottomRight] = bottomRight,
    _a);
//# sourceMappingURL=resizable.js.map