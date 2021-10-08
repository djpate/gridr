import { Coords } from "./types"
import { clamp, replace, uniqueId } from "lodash"
import { draggable } from "./decorators/draggable"
import { resizable } from "./decorators/resizable"
import { deletable } from "./decorators/deletable"
import { Grid } from "./grid"
import { Placement } from "./placement"

type Constraints = {
  minWidth?: number,
  minHeight?: number,
  ratio?: number
}

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
  moved: Widget[] = []
  constraints: Constraints | undefined
  moveTimeout = 0

  element: HTMLDivElement
  originalElement: HTMLDivElement

  // unique id to identify the widget
  id: string

  _placement: Placement | null = null
  previousPlacement: Placement | null = null
  grid: Grid

  constructor(element: HTMLDivElement, placement: Placement, grid: Grid, constraints?: Constraints) {
    this.grid = grid
    this.originalElement = element
    this.element = element
    this.placement = placement
    this.id = element.id || uniqueId();
    this.constraints = constraints
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
    this.originalElement.dispatchEvent(new CustomEvent('widgetized', {detail: {widget: this}}))
  }

  snap(): void {
    if (!this.placement) return
    clearTimeout(this.moveTimeout)
    this.element.classList.add('snapped')
    this.applyCoords({
      top: this.placement.startRow * this.grid.rowHeight + this.placement.startRow * this.grid.rowPadding,
      left: (this.placement.startCol * this.grid.columnWidth) + this.placement.startCol * this.grid.columnPadding,
      width: Math.floor(this.grid.columnWidth * this.placement.width + (this.placement.width - 1) * (this.grid.columnPadding)),
      height: Math.floor(this.grid.rowHeight * this.placement.height + (this.placement.height - 1) * (this.grid.rowPadding))
    })
  }

  get width(): number {
    return this.element.getBoundingClientRect().width
  }

  get widthUnit(): number {
    return Math.ceil(this.width / this.grid.columnWidth)
  }

  get height(): number {
    return this.element.getBoundingClientRect().height
  }

  get heightUnit(): number {
    return Math.floor(this.height / this.grid.rowHeight)
  }

  get minWidthUnit(): number {
    return (this.constraints?.minWidth || 1)
  }

  get minHeightUnit(): number {
    return (this.constraints?.minHeight || 1)
  }

  get minWidth(): number {
    const unit = this.minWidthUnit
    return unit * this.grid.columnWidth + ((unit - 1) * this.grid.columnPadding)
  }

  get minHeight(): number {
    const unit = this.minHeightUnit
    return unit * this.grid.rowHeight + ((unit - 1) * this.grid.rowPadding)
  }

  set moving(state: boolean) {
    if (state) {
      this.element.classList.remove('snapped')
      this.element.classList.add('moving')
      this.previousPlacement = this.placement!.clone()
      this.placement = null
    } else {
      clearTimeout(this.moveTimeout)
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
    clearTimeout(this.moveTimeout)
    if (this.placement && this.placement.sameAs(placement)) return
    const collisions = this.grid.gridMap.collisions(placement, this.id)
    const delay = collisions.length ? 150 : 0
    this.moveTimeout = setTimeout(() => {
      this.placement = placement
      this.grid.setContainerHeight()
      collisions.forEach((collidingWidget) => {
        const newPlacement = collidingWidget.closestNewSpot()
        collidingWidget.placement = newPlacement
        collidingWidget.snap()
      })
    }, delay)
  }

  delete(): void {
    this.element.remove()
    this.grid.delete(this)
  }

  applyCoords(coords: Partial<Coords>): void {
    if (this.constraints?.ratio && coords.width && coords.height) {
      let widthUnit = coords.width / (this.grid.columnWidth + this.grid.columnPadding)
      let heightUnit = coords.height / (this.grid.rowHeight + this.grid.rowPadding)
      if (widthUnit > heightUnit) {
        let minHeightUnit = (widthUnit / this.constraints.ratio)
        let minHeight = minHeightUnit * this.grid.rowHeight + ((Math.ceil(minHeightUnit) - 1) * this.grid.rowPadding)
        coords.height = Math.max(minHeight, coords.height)
      } else {
        let minWidthUnit = (heightUnit * this.constraints.ratio)
        let minWidth = minWidthUnit * this.grid.columnWidth + ((Math.ceil(minWidthUnit) - 1) * this.grid.columnPadding)
        coords.width = clamp(coords.width, minWidth, this.grid.width)
      }
    }
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
