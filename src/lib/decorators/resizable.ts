import { Widget } from "../widget"

type initialCoordinates = {
  mousex: number,
  mousey: number,
  originalx: number,
  originaly: number
  width: number,
  height: number,
  topOffset: number
  leftOffset: number
}

enum Position {
  topLeft = 'topLeft',
  topRight = 'topRight',
  bottomLeft = 'bottomLeft',
  bottomRight = 'bottomRight',
}

export const resizable = (widget: Widget): void => {
  [Position.topLeft, Position.topRight, Position.bottomLeft, Position.bottomRight].forEach((position) => {
    const resizeHandle = document.createElement("div")
    resizeHandle.classList.add('resizer')
    resizeHandle.classList.add(String(position))
    resizeHandle.addEventListener('mousedown', startResize.bind(widget, position))
    widget.element.appendChild(resizeHandle)
  })
}

const startResize = function(this: Widget, position: Position, event: MouseEvent) {
  event.preventDefault()
  const size = this.element.getBoundingClientRect()
  const initial: initialCoordinates = {
    mousex:  event.pageX,
    mousey: event.pageY,
    width: size.width,
    height: size.height,
    topOffset: this.grid.rootElement.offsetTop,
    leftOffset: this.grid.rootElement.offsetLeft,
    originalx: this.element.offsetLeft,
    originaly: this.element.offsetTop
  }
  this.element.style.position = 'absolute'
  this.moving = true
  console.log(HandlerMap[position])
  const mouseMoveHandler = HandlerMap[position].bind(this, initial)
  const mouseUpHandler = stopResize.bind(this, mouseMoveHandler)
  window.addEventListener('mousemove', mouseMoveHandler)
  window.addEventListener('mouseup', mouseUpHandler, {once: true})
}

const stopResize = function(this: Widget, mouseMoveHandler: any, event: MouseEvent) {
  window.removeEventListener('mousemove', mouseMoveHandler)
  this.moving = false
}

const bottomRight = function(this: Widget, initial: initialCoordinates, event: MouseEvent) {
  this.applyCoords({
    width: initial.width + (event.pageX - initial.mousex),
    height: initial.height + (event.pageY - initial.mousey),
  })
  const ghostPlacement = this.grid.placement(this.element.getBoundingClientRect())
  this.grid.setGhost(ghostPlacement)
}

const bottomLeft = function(this: Widget, initial: initialCoordinates, event: MouseEvent) {
  this.applyCoords({
    width: initial.width - (event.pageX - initial.mousex),
    height: initial.height + (event.pageY - initial.mousey),
    left: initial.originalx + (event.pageX - initial.mousex)
  })
  const ghostPlacement = this.grid.placement(this.element.getBoundingClientRect())
  this.grid.setGhost(ghostPlacement)
}

const topRight = function(this: Widget, initial: initialCoordinates, event: MouseEvent)  {
  this.applyCoords({
    width: initial.width + (event.pageX - initial.mousex),
    height: initial.height - (event.pageY - initial.mousey),
    top: initial.originaly + (event.pageY - initial.mousey),
  })
  const ghostPlacement = this.grid.placement(this.element.getBoundingClientRect())
  this.grid.setGhost(ghostPlacement)
}

const topLeft = function(this: Widget, initial: initialCoordinates, event: MouseEvent)  {
  this.applyCoords({
    width: initial.width - (event.pageX - initial.mousex),
    height: initial.height - (event.pageY - initial.mousey),
    top:  initial.originaly + (event.pageY - initial.mousey),
    left: initial.originalx + (event.pageX - initial.mousex)
  })
  const ghostPlacement = this.grid.placement(this.element.getBoundingClientRect())
  this.grid.setGhost(ghostPlacement)
}

const HandlerMap = {
  [Position.topLeft]: topLeft,
  [Position.topRight]: topRight,
  [Position.bottomLeft]: bottomLeft,
  [Position.bottomRight]: bottomRight
}