var Position;
(function (Position) {
    Position["topLeft"] = "topLeft";
    Position["topRight"] = "topRight";
    Position["bottomLeft"] = "bottomLeft";
    Position["bottomRight"] = "bottomRight";
})(Position || (Position = {}));
export const resizable = (widget) => {
    [Position.topLeft, Position.topRight, Position.bottomLeft, Position.bottomRight].forEach((position) => {
        const resizeHandle = document.createElement("div");
        resizeHandle.classList.add('resizer');
        resizeHandle.classList.add(String(position));
        resizeHandle.addEventListener('mousedown', startResize.bind(widget, position));
        widget.element.appendChild(resizeHandle);
    });
};
const startResize = function (position, event) {
    event.preventDefault();
    const size = this.element.getBoundingClientRect();
    const initial = {
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
    const mouseMoveHandler = HandlerMap[position].bind(this, initial);
    const mouseUpHandler = stopResize.bind(this, mouseMoveHandler);
    window.addEventListener('mousemove', mouseMoveHandler);
    window.addEventListener('mouseup', mouseUpHandler, { once: true });
};
const stopResize = function (mouseMoveHandler, event) {
    window.removeEventListener('mousemove', mouseMoveHandler);
    this.moving = false;
};
const bottomRight = function (initial, event) {
    this.applyCoords({
        width: initial.width + (event.pageX - initial.mousex),
        height: initial.height + (event.pageY - initial.mousey),
    });
    const ghostPlacement = this.grid.placement(this);
    this.grid.setGhost(ghostPlacement);
    this.move(ghostPlacement);
};
const bottomLeft = function (initial, event) {
    this.applyCoords({
        width: initial.width - (event.pageX - initial.mousex),
        height: initial.height + (event.pageY - initial.mousey),
        left: initial.originalx + (event.pageX - initial.mousex)
    });
    const ghostPlacement = this.grid.placement(this);
    this.grid.setGhost(ghostPlacement);
    this.move(ghostPlacement);
};
const topRight = function (initial, event) {
    this.applyCoords({
        width: initial.width + (event.pageX - initial.mousex),
        height: initial.height - (event.pageY - initial.mousey),
        top: initial.originaly + (event.pageY - initial.mousey),
    });
    const ghostPlacement = this.grid.placement(this);
    this.grid.setGhost(ghostPlacement);
    this.move(ghostPlacement);
};
const topLeft = function (initial, event) {
    this.applyCoords({
        width: initial.width - (event.pageX - initial.mousex),
        height: initial.height - (event.pageY - initial.mousey),
        top: initial.originaly + (event.pageY - initial.mousey),
        left: initial.originalx + (event.pageX - initial.mousex)
    });
    const ghostPlacement = this.grid.placement(this);
    this.grid.setGhost(ghostPlacement);
    this.move(ghostPlacement);
};
const HandlerMap = {
    [Position.topLeft]: topLeft,
    [Position.topRight]: topRight,
    [Position.bottomLeft]: bottomLeft,
    [Position.bottomRight]: bottomRight
};
//# sourceMappingURL=resizable.js.map