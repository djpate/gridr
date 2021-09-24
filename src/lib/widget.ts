import { Coords } from "@/components/types"
import { uniqueId, wrap } from "lodash"
import { draggable } from "./decorators/draggable"
import { resizable } from "./decorators/resizable"
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

  // placement: Placement
  originalPlacement: Placement | null = null
  _moving = false
  _reflowed = false
  minWidth = 1
  minHeight = 1
  moved: Widget[] = []

  element: HTMLDivElement

  // unique id to identify the widget
  id: string

  listeners: {[key: string]: any} = {}
  placement: Placement
  grid: Grid

  constructor(element: HTMLDivElement, grid: Grid) {
    this.grid = grid
    this.element = element
    this.id = element.id || uniqueId();
    this.placement = new Placement(0, 1, 0, 1)
    this.setupWidgetWrapper()
    resizable(this)
    draggable(this)
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

  snap() {
    const placement = this.grid.placement(this.element.getBoundingClientRect())
    this.applyCoords({
      top: placement.startRow * this.grid.rowHeight + placement.startRow * 20,
      left: (placement.startCol * this.grid.columnWidth) + placement.startCol * 20,
      width: Math.floor(this.grid.columnWidth * placement.width + (placement.width - 1) * 20),
      height: Math.floor(this.grid.rowHeight * placement.height + (placement.height - 1) * 20)
    })
  }

  set moving(state: boolean) {
    if (state) {
      this.element.classList.remove('snapped')
      this.element.classList.add('moving')
    } else {
      this.element.classList.remove('moving')
      this.element.classList.add('snapped')
      this.grid.clearGhost()
      this.snap()
    }
    this._moving = state
  }

  applyCoords(coords: Coords): void {
    Object.keys(coords).forEach((key) => {
      const value: number = coords[key as keyof Coords]!
      this.element.style.setProperty(key, `${value}px`)
    })
  }
  
  // collides(anotherWidget: Widget): boolean {
  //   // you cannot collide with yourself or a moving widget
  //   if (this.id == anotherWidget.id || this.moving) return false
  //   const collides =  intersection(this.placementRanges.col, anotherWidget.placementRanges.col).length > 0 &&
  //          intersection(this.placementRanges.row, anotherWidget.placementRanges.row).length > 0
  //   return collides
  // }

  // set coords(coords: Coords) {
  //   this._coords = coords
  //   if (!this.element) return
  //   this.element.style.height = this._coords.height + 'px'
  //   this.element.style.width = this._coords.width + 'px'
  //   this.element.style.top = this._coords.top + 'px'
  //   this.element.style.left = this._coords.left + 'px'
  // }

  // get coords(): Coords {
  //   return this._coords
  // }

  // get moving(): boolean {
  //   return this._moving
  // }

  // set moving(state: boolean) {
  //   if (state) {
  //     this.originalPlacement = this.placement.clone
  //   } else {
  //     console.log('moved', this.moved.length)
  //     console.log('stopped moving')
  //     this.moved = []
  //     this.originalPlacement = null
  //   }
  //   this._moving = state
  // }

  // get reflowed(): boolean {
  //   return this._reflowed
  // }

  // set reflowed(state: boolean) {
  //   console.log(this.id, 'was marked as reflowed')
  //   if (state) {
  //     console.log(this.placement.clone)
  //     this.originalPlacement = this.placement.clone
  //   }
  //   this._reflowed = state
  // }

  // get placementRanges() : {col: number[], row: number[]} {
  //   return {
  //     col: range(this.placement.col, this.placement.col + this.placement.width),
  //     row: range(this.placement.row, this.placement.row + this.placement.height)
  //   }
  // }
}

function getKeyValue<T>(key: string): any {
  throw new Error("Function not implemented.")
}
