import { Widget } from "../widget"
import debounce from 'lodash/debounce'
type initialCoordinates = {
  offsetX: number,
  offsetY: number,
  width: number,
  height: number
}

export const draggable = (widget: Widget): void => {
  const dragHandle = document.createElement("div")
  dragHandle.classList.add('dragger')
  dragHandle.addEventListener('mousedown', startDrag.bind(widget))
  widget.element.appendChild(dragHandle)
}

const startDrag = function(this: Widget, event: DragEvent) {
  event.preventDefault()
  const gridSize = this.grid.rootElement.getBoundingClientRect()
  const size = this.element.getBoundingClientRect()
  const initial: initialCoordinates = {
    offsetX:  event.offsetX,
    offsetY: event.offsetY,
    width: size.width,
    height: size.height
  }
  // this.element.style.position = 'absolute'
  this.element.style.width = `${size.width}px`
  this.element.style.height = `${size.height}px`
  this.element.style.top = `${String(size.top - gridSize.top)}px`
  this.element.style.left =`${String(size.left - gridSize.left)}px`
  this.element.style.gridArea = ""
  this.moving = true
  const mouseMoveHandler = debounce(drag.bind(this, initial))
  window.addEventListener('mousemove', mouseMoveHandler)
  window.addEventListener('mouseup', stopDrag.bind(this, mouseMoveHandler), {once: true})
}

const stopDrag = function (this: Widget, mouseMoveHandler: any, event: MouseEvent) {
  event.preventDefault()
  this.moving = false
  window.removeEventListener('mousemove', mouseMoveHandler)
  this.snap()
}

const drag = function(this: Widget, initial: initialCoordinates, event: DragEvent) {
  // console.log(event)
  event.preventDefault()
  // console.log('offset', this.grid.rootElement.offsetTop)
  const top = Math.floor(event.pageY - this.grid.rootElement.offsetTop - initial.offsetY - initial.height)
  const left = Math.floor(event.pageX - initial.offsetX)
  // console.log('top', top)
  // console.log('left', left)
  this.element.style.top = `${String(top)}px`
  this.element.style.left = `${String(left)}px`
  // // this.element.style.transform = `translate(${left}px,${top}px)`
  const ghostPlacement = this.grid.placement(this.element.getBoundingClientRect())
  this.grid.setGhost(ghostPlacement)
}