import { clamp } from "lodash"
import { Coords } from "../types"
import { Widget } from "../widget"
type initialCoordinates = {
  offsetX: number,
  offsetY: number,
  width: number,
  height: number
}

export const draggable = (widget: Widget): void => {
  Array.from(widget.element.getElementsByClassName('dragHandle')).forEach((handler: HTMLElement) => {
    handler.addEventListener('mousedown', startDrag.bind(widget))
    handler.style.cursor = 'grab'
  })
}

const startDrag = function(this: Widget, event: MouseEvent) {
  event.preventDefault()
  const gridSize = this.grid.rootElement.getBoundingClientRect()
  const size = this.element.getBoundingClientRect()
  const initial: initialCoordinates = {
    offsetX:  event.offsetX,
    offsetY: event.offsetY,
    width: size.width,
    height: size.height
  }
  this.element.style.width = `${size.width}px`
  this.element.style.height = `${size.height}px`
  this.element.style.top = `${String(size.top - gridSize.top)}px`
  this.element.style.left =`${String(size.left - gridSize.left)}px`
  this.moving = true
  const mouseMoveHandler = drag.bind(this, initial)
  window.addEventListener('mousemove', mouseMoveHandler)
  window.addEventListener('mouseup', stopDrag.bind(this, mouseMoveHandler), {once: true})
}

const stopDrag = function (this: Widget, mouseMoveHandler: (event: MouseEvent) => void, event: MouseEvent) {
  event.preventDefault()
  this.moving = false
  window.removeEventListener('mousemove', mouseMoveHandler)
}

const drag = function(this: Widget, initial: initialCoordinates, event: DragEvent) {
  event.preventDefault()
  const gridSize = this.grid.rootElement.getBoundingClientRect()
  const offsetTop = gridSize.top + window.scrollY
  const offsetLeft = gridSize.left
  const top = Math.floor(event.pageY - offsetTop - initial.offsetY)
  const left = Math.floor(event.pageX - initial.offsetX - offsetLeft)
  const maxLeft = gridSize.width - this.width - 2

  const coord: Coords = {
    top: Math.max(0, top),
    left:  clamp(left, 0, maxLeft)
  }
  this.applyCoords(coord)
  const ghostPlacement = this.grid.placement(this)
  if (this.placement && ghostPlacement.sameAs(this.placement)) return
  this.grid.setGhost(ghostPlacement)
  this.move(ghostPlacement)
  console.log(ghostPlacement)
}