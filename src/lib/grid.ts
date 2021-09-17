import { Coords, Placement } from "@/components/types"
import { v4 as uuid } from 'uuid';

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

export class Widget {
  placement: Placement
  id: string

  constructor(placement: Placement) {
    this.id = uuid()
    this.placement = placement
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
    return {
      col: Math.floor(coords.left / this.columnWidth),
      row: Math.floor(coords.top / this.rowHeight),
      width: Math.ceil(coords.width / (this.columnWidth + this.columnPadding)),
      height: Math.ceil(coords.height / (this.rowHeight + this.rowPadding))
    }
  }

  addWidget(widget: Widget) {
    this._widgets[widget.id] = widget
  }

  removeWidget(id: string) {
    delete this._widgets[id]
  }
}