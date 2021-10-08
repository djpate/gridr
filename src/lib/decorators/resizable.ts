import { clamp, max } from "lodash"
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
    width: clamp(initial.width + (event.pageX - initial.mousex), this.minWidth, maxWidth),
    height: Math.max(this.minHeight, initial.height + (event.pageY - initial.mousey)),
  })
  const ghostPlacement = this.grid.placement(this)
  this.grid.setGhost(ghostPlacement)
  this.move(ghostPlacement)
}

const bottomLeft = function(this: Widget, initial: initialCoordinates, event: MouseEvent) {
  let originalRight = initial.originalx + initial.width
  let maxLeft = originalRight - this.minWidth
  this.applyCoords({
    width: Math.max(this.minWidth, initial.width - (Math.max(initial.leftOffset, event.pageX) - initial.mousex)),
    height: Math.max(this.minHeight, initial.height + (event.pageY - initial.mousey)),
    left: clamp(initial.originalx + (event.pageX - initial.mousex), 0, maxLeft)
  })
  const ghostPlacement = this.grid.placement(this)
  this.grid.setGhost(ghostPlacement)
  this.move(ghostPlacement)
}

const topRight = function(this: Widget, initial: initialCoordinates, event: MouseEvent)  {
  const maxWidth = this.grid.width - initial.originalx
  const maxTop = initial.originaly + initial.height - this.minHeight
  this.applyCoords({
    width: clamp(initial.width + (event.pageX - initial.mousex), this.minWidth, maxWidth),
    height: Math.max(this.minHeight, initial.height - (Math.max(event.pageY, initial.topOffset) - initial.mousey)),
    top: clamp(initial.originaly + (event.pageY - initial.mousey), 0, maxTop)
  })
  const ghostPlacement = this.grid.placement(this)
  this.grid.setGhost(ghostPlacement)
  this.move(ghostPlacement)
}

const topLeft = function(this: Widget, initial: initialCoordinates, event: MouseEvent)  {
  let originalRight = initial.originalx + initial.width
  const maxLeft = originalRight - this.minWidth
  const maxTop = initial.originaly + initial.height - this.minHeight
  this.applyCoords({
    width: Math.max(this.minWidth, initial.width - (event.pageX - initial.mousex)),
    height: Math.max(this.minHeight, initial.height - (Math.max(event.pageY, initial.topOffset) - initial.mousey)),
    top: clamp(initial.originaly + (event.pageY - initial.mousey), 0, maxTop),
    left: clamp(initial.originalx + (event.pageX - initial.mousex), 0, maxLeft)
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