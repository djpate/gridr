export const draggable = (widget) => {
    Array.from(widget.element.getElementsByClassName('dragHandle')).forEach((handler) => {
        handler.addEventListener('mousedown', startDrag.bind(widget));
        handler.style.cursor = 'grab';
    });
};
const startDrag = function (event) {
    event.preventDefault();
    const gridSize = this.grid.rootElement.getBoundingClientRect();
    const size = this.element.getBoundingClientRect();
    const initial = {
        offsetX: event.offsetX,
        offsetY: event.offsetY,
        width: size.width,
        height: size.height
    };
    this.element.style.width = `${size.width}px`;
    this.element.style.height = `${size.height}px`;
    this.element.style.top = `${String(size.top - gridSize.top)}px`;
    this.element.style.left = `${String(size.left - gridSize.left)}px`;
    this.moving = true;
    const mouseMoveHandler = drag.bind(this, initial);
    window.addEventListener('mousemove', mouseMoveHandler);
    window.addEventListener('mouseup', stopDrag.bind(this, mouseMoveHandler), { once: true });
};
const stopDrag = function (mouseMoveHandler, event) {
    event.preventDefault();
    this.moving = false;
    window.removeEventListener('mousemove', mouseMoveHandler);
};
const drag = function (initial, event) {
    event.preventDefault();
    const coord = {
        top: Math.floor(event.pageY - this.grid.rootElement.offsetTop - initial.offsetY),
        left: Math.floor(event.pageX - initial.offsetX),
    };
    this.applyCoords(coord);
    const ghostPlacement = this.grid.placement(this);
    if (this.placement && ghostPlacement.sameAs(this.placement))
        return;
    this.grid.setGhost(ghostPlacement);
    this.move(ghostPlacement);
};
//# sourceMappingURL=draggable.js.map