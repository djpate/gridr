import { Coords, Placement } from "@/components/types"
import { v4 as uuid } from 'uuid';
import range from 'lodash/range'
import intersection from 'lodash/intersection'

// prevents the widget boundaries to leave the allowed grid
export const constrainedInGrid = (coords: Coords, gridWidth: number): Coords => {
  return {
    height: coords.height,
    width: coords.width,
    top: Math.max(0, coords.top),
    left: Math.min(gridWidth - coords.width, Math.max(0, coords.left))
  }
}

export const getCoordsForElement = (element: HTMLElement): Coords => {
  return {
    height: parseInt(element.style.height),
    width: parseInt(element.style.width),
    top: parseInt(element.style.top),
    left: parseInt(element.style.left)
  }
}

const placementRanges = (placement: Placement) : {col: number[], row: number[]} => {
  return {
    col: range(placement.col, placement.col + placement.width),
    row: range(placement.row, placement.row + placement.height)
  }
}

export class Widget {
  placement: Placement
  id: string

  constructor(placement: Placement) {
    this.id = uuid()
    this.placement = placement
  }

  colides(anotherPlacement: Placement): boolean {
    // if (this.id == anotherWidget.id) return false
    const ranges = placementRanges(this.placement)
    const otherRange = placementRanges(anotherPlacement)
    // console.log('existing', this.columnRange)
    // console.log('dragging', anotherWidget.columnRange)
    // console.log('col intersection', intersection(this.columnRange, anotherWidget.columnRange))
    // console.log('row intersection', intersection(this.rowRange, anotherWidget.rowRange))
    return intersection(ranges.col, otherRange.col).length > 0 &&
           intersection(ranges.row, otherRange.row).length > 0
  }
}

export class Grid {
  _widgets: {[key: string]: Widget}

  rowHeight = 150
  columnPadding = 20
  rowPadding = 20
  
  width: number
  columns: number

  constructor(width: number, columns: number) {
    this._widgets = {}
    this.width = width
    this.columns = columns
  }

  get columnWidth(): number {
    return (this.width - (this.columnPadding * (this.columns - 1))) / this.columns
  }

  get widgets(): Widget[] {
    return Object.values(this._widgets)
  }

  snappedPlacement(widget: Widget, coords: Coords): Placement {
    const desired: Placement = {
      col: Math.floor(coords.left / this.columnWidth),
      row: Math.floor(coords.top / this.rowHeight),
      width: Math.ceil(coords.width / (this.columnWidth + this.columnPadding)),
      height: Math.ceil(coords.height / (this.rowHeight + this.rowPadding))
    }
    this.widgets.forEach((otherWidget) => {
      if (widget.id !== otherWidget.id && otherWidget.colides(desired)) {
        otherWidget.placement = {
          col: otherWidget.placement.col,
          row: (desired.row + desired.height),
          width: otherWidget.placement.width,
          height: otherWidget.placement.height
        }
      }
    })
    return desired
  }

  addWidget(widget: Widget) {
    this._widgets[widget.id] = widget
  }

  removeWidget(id: string) {
    delete this._widgets[id]
  }
}