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
  const mouseMoveHandler = HandlerMap[position].bind(this, initial)
  const mouseUpHandler = stopResize.bind(this, mouseMoveHandler)
  window.addEventListener('mousemove', mouseMoveHandler)
  window.addEventListener('mouseup', mouseUpHandler, {once: true})
}

const stopResize = function(this: Widget, mouseMoveHandler: any, event: MouseEvent) {
  window.removeEventListener('mousemove', mouseMoveHandler)
  this.moving = false
  this.element.dispatchEvent(new CustomEvent('resized'))
}

const bottomRight = function(this: Widget, initial: initialCoordinates, event: MouseEvent) {
  const maxWidth = this.grid.width - initial.originalx
  this.applyCoords({
    width: Math.min(maxWidth, initial.width + (event.pageX - initial.mousex)),
    height: initial.height + (event.pageY - initial.mousey),
  })
  const ghostPlacement = this.grid.placement(this)
  this.grid.setGhost(ghostPlacement)
  this.move(ghostPlacement)
}

const bottomLeft = function(this: Widget, initial: initialCoordinates, event: MouseEvent) {
  let originalRight = initial.originalx + initial.width
  let maxLeft = originalRight - ((this.constraints?.minWidth || 1) * this.grid.columnWidth)
  this.applyCoords({
    width: initial.width - (event.pageX - initial.mousex),
    height: initial.height + (event.pageY - initial.mousey),
    left: Math.min(maxLeft, initial.originalx + (event.pageX - initial.mousex))
  })
  const ghostPlacement = this.grid.placement(this)
  this.grid.setGhost(ghostPlacement)
  this.move(ghostPlacement)
}

const topRight = function(this: Widget, initial: initialCoordinates, event: MouseEvent)  {
  const maxWidth = this.grid.width - initial.originalx
  console.log('height', initial.height)
  console.log('pagey', event.pageY)
  console.log('mousey', initial.mousey)
  console.log('diff', event.pageY - initial.mousey)
  this.applyCoords({
    width: Math.min(maxWidth, initial.width + (event.pageX - initial.mousex)),
    height: initial.height - (Math.max(event.pageY, initial.topOffset) - initial.mousey),
    top: initial.originaly + (event.pageY - initial.mousey),
  })
  const ghostPlacement = this.grid.placement(this)
  this.grid.setGhost(ghostPlacement)
  this.move(ghostPlacement)
}

const topLeft = function(this: Widget, initial: initialCoordinates, event: MouseEvent)  {
  this.applyCoords({
    width: initial.width - (event.pageX - initial.mousex),
    height: initial.height - (Math.max(event.pageY, initial.topOffset) - initial.mousey),
    top:  initial.originaly + (event.pageY - initial.mousey),
    left: initial.originalx + (event.pageX - initial.mousex)
  })
  const ghostPlacement = this.grid.placement(this)
  this.grid.setGhost(ghostPlacement)
  this.move(ghostPlacement)
}

const HandlerMap = {
  [Position.topLeft]: topLeft,
  [Position.topRight]: topRight,
  [Position.bottomLeft]: bottomLeft,
  [Position.bottomRight]: bottomRight
}