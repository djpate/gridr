import { Widget } from "../widget"

type initialCoordinates = {
  mousex: number,
  mousey: number,
  width: number,
  height: number
}

export const resizable = (widget: Widget): void => {
  ['top-left', 'top-right', 'bottom-left', 'bottom-right'].forEach((position) => {
    const resizeHandle = document.createElement("div")
    resizeHandle.classList.add('resizer')
    resizeHandle.classList.add(position)
    resizeHandle.addEventListener('mousedown', startResize.bind(widget))
    widget.element.appendChild(resizeHandle)
  })
}

const startResize = function(this: Widget, event: MouseEvent) {
  event.preventDefault()
  const size = this.element.getBoundingClientRect()
  const initial: initialCoordinates = {
    mousex:  event.pageX,
    mousey: event.pageY,
    width: size.width,
    height: size.height
  }
  this.element.style.width = `${size.width}px`
  this.element.style.height = `${size.height}px`
  this.element.style.top = String(size.top)
  this.element.style.left = String(size.left)
  // this.element.style.position = 'absolute'
  this.moving = true
  const mouseMoveHandler = resize.bind(this, initial)
  const mouseUpHandler = stopResize.bind(this, mouseMoveHandler)
  window.addEventListener('mousemove', mouseMoveHandler)
  window.addEventListener('mouseup', mouseUpHandler, {once: true})
}

const stopResize = function(this: Widget, mouseMoveHandler: any, event: MouseEvent) {
  this.moving = false
  window.removeEventListener('mousemove', mouseMoveHandler)
  this.snap()
}

const resize = function (this: Widget, initial: initialCoordinates,  event: MouseEvent) {
  event.preventDefault()
  this.element.style.width = `${initial.width + (event.pageX - initial.mousex)}px`
  this.element.style.height = `${initial.height + (event.pageY - initial.mousey)}px`
  const ghostPlacement = this.grid.placement(this.element.getBoundingClientRect())
  this.grid.setGhost(ghostPlacement)
}