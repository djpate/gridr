import { Coords, Placement } from "@/components/types"
import { Widget } from "./widget";

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

export class Grid {
  _widgets: {[key: string]: Widget}

  rowHeight = 150
  columnPadding = 20
  rowPadding = 20
  
  _width: number
  columns: number

  constructor(width: number, columns: number) {
    this._widgets = {}
    this._width = width
    this.columns = columns
  }

  get width(): number {
    return this._width
  }

  set width(newWidth: number) {
    this._width = newWidth
    this.widgets.forEach(widget => {
      this.snap(widget)
    });
  }

  get columnWidth(): number {
    return (this.width - (this.columnPadding * (this.columns - 1))) / this.columns
  }

  get widgets(): Widget[] {
    return Object.values(this._widgets)
  }

  // return a snapped placement for a given coordinates
  desiredPlacement(widget: Widget): Placement {
    const placement = {
      col: Math.floor(widget.coords.left / this.columnWidth),
      row: Math.floor(widget.coords.top / this.rowHeight),
      width: Math.ceil(widget.coords.width / (this.columnWidth + this.columnPadding)),
      height: Math.ceil(widget.coords.height / (this.rowHeight + this.rowPadding))
    }
    widget.placement = placement
    this.handleColisions(widget)
    return placement
  }

  snap(widget: Widget): void {
    widget.coords = this.constrainedInGrid({
      top: widget.placement.row * this.rowHeight + widget.placement.row * 20,
      left: (widget.placement.col * this.columnWidth) + widget.placement.col * 20,
      width: Math.floor(this.columnWidth * widget.placement.width + (widget.placement.width - 1) * 20),
      height: Math.floor(this.rowHeight * widget.placement.height + (widget.placement.height - 1) * 20),
    })
    this.handleColisions(widget)
  }

  handleColisions(snappedWidget: Widget): void {
    this.widgets.forEach((widget) => {
      if (widget.collides(snappedWidget)) {
        const newPlacement = {
          col: widget.placement.col,
          row: (snappedWidget.placement.row + snappedWidget.placement.height),
          width: widget.placement.width,
          height: widget.placement.height
        }
        widget.placement = newPlacement
        this.snap(widget)
      }
    })
  }

  // moveWidget(widget: Widget, placement: Placement): void {
  //   widget.placement = placement
  //   this.widgets.forEach((otherWidget) => {
  //     if (widget.id !== otherWidget.id && otherWidget.colides(widget)) {
  //       otherWidget.placement = {
  //         col: otherWidget.placement.col,
  //         row: (widget.placement.row + widget.placement.height),
  //         width: otherWidget.placement.width,
  //         height: otherWidget.placement.height
  //       }
  //     }
  //   })
  // }

  addWidget(widget: Widget): void {
    this._widgets[widget.id] = widget
    this.snap(widget)
  }

  removeWidget(id: string): void {
    delete this._widgets[id]
  }

  constrainedInGrid(coords: Coords): Coords {
    return {
      height: coords.height,
      width: coords.width,
      top: Math.max(0, coords.top),
      left: Math.min(this.width - coords.width, Math.max(0, coords.left))
    }
  }
}