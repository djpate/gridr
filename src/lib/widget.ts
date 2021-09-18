import { Coords, Placement } from "@/components/types"
import { intersection, range } from "lodash"
import {v4 as uuid } from 'uuid'

export class Widget {
  // used during drag and resize events, not contained to grid
  _coords: Coords

  placement: Placement

  element?: HTMLDivElement

  // unique id to identify the widget
  id: string

  constructor(placement: Placement) {
    this.id = uuid()
    this.placement = placement
    this._coords = {
      height: 0,
      width: 0,
      top: 0,
      left: 0
    }
  }

  collides(anotherWidget: Widget): boolean {
    if (this.id == anotherWidget.id) return false
    return intersection(this.placementRanges.col, anotherWidget.placementRanges.col).length > 0 &&
           intersection(this.placementRanges.row, anotherWidget.placementRanges.row).length > 0
  }

  set coords(coords: Coords) {
    this._coords = coords
    if (!this.element) return
    this.element.style.height = this._coords.height + 'px'
    this.element.style.width = this._coords.width + 'px'
    this.element.style.top = this._coords.top + 'px'
    this.element.style.left = this._coords.left + 'px'
  }

  get coords(): Coords {
    return this._coords
  }

  get placementRanges() : {col: number[], row: number[]} {
    return {
      col: range(this.placement.col, this.placement.col + this.placement.width),
      row: range(this.placement.row, this.placement.row + this.placement.height)
    }
  }
}