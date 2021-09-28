import { Coords } from "./types"
import { uniqueId, wrap } from "lodash"
import { draggable } from "./decorators/draggable"
import { resizable } from "./decorators/resizable"
import { deletable } from "./decorators/deletable"
import { Grid } from "./grid"
import { Placement } from "./placement"

export class Widget {
  // used during drag and resize events, not contained to grid
  _coords: Coords = {
    height: 0,
    width: 0,
    top: 0,
    left: 0
  }

  _moving = false
  _reflowed = false
  minWidth = 1
  minHeight = 1
  moved: Widget[] = []

  element: HTMLDivElement

  // unique id to identify the widget
  id: string

  _placement: Placement | null = null
  previousPlacement: Placement | null = null
  grid: Grid

  constructor(element: HTMLDivElement, placement: Placement, grid: Grid) {
    this.grid = grid
    this.element = element
    this.placement = placement
    this.id = element.id || uniqueId();
    this.setupWidgetWrapper()
    resizable(this)
    draggable(this)
    deletable(this)
    this.snap()
  }

  setupWidgetWrapper(): void {
    const wrapped = document.createElement('div')
    wrapped.appendChild(this.element)
    wrapped.id = `widget_container_${this.id}`
    wrapped.classList.add('widget_container')
    this.element = wrapped

    this.grid.rootElement.appendChild(wrapped)
  }

  snap(): void {
    if (!this.placement) debugger
    if (!this.placement) return
    this.element.classList.add('snapped')
    this.applyCoords({
      top: this.placement.startRow * this.grid.rowHeight + this.placement.startRow * 20,
      left: (this.placement.startCol * this.grid.columnWidth) + this.placement.startCol * 20,
      width: Math.floor(this.grid.columnWidth * this.placement.width + (this.placement.width - 1) * 20),
      height: Math.floor(this.grid.rowHeight * this.placement.height + (this.placement.height - 1) * 20)
    })
  }

  set moving(state: boolean) {
    if (state) {
      this.element.classList.remove('snapped')
      this.element.classList.add('moving')
      this.previousPlacement = this.placement!.clone()
      this.placement = null
    } else {
      this.placement ??= this.previousPlacement
      this.element.classList.remove('moving')
      this.grid.clearGhost()
      this.snap()
    }
    this._moving = state
  }

  closestNewSpot(): Placement {
    // remove yourself from the grid
    const placement = this.placement!.clone()
    this.placement = null
    return this.grid.gridMap.firstAvailablePlacement(placement.width, placement.height)!
  }

  move(placement: Placement): void {
    if (this.placement && this.placement.sameAs(placement)) return
    const collisions = this.grid.gridMap.collisions(placement, this.id)
    this.placement = placement
    collisions.forEach((collidingWidget) => {
      const newPlacement = collidingWidget.closestNewSpot()
      collidingWidget.placement = newPlacement
      collidingWidget.snap()
    })
  }

  delete(): void {
    this.element.remove()
    this.grid.delete(this)
  }

  applyCoords(coords: Coords): void {
    Object.keys(coords).forEach((key) => {
      const value: number = coords[key as keyof Coords]!
      this.element.style.setProperty(key, `${value}px`)
    })
  }

  set placement(placement: Placement | null) {
    this._placement = placement
  }

  get placement(): Placement | null {
    return this._placement
  }
}
