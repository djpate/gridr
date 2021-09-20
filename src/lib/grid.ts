import { Coords } from "@/components/types"
import { GridMap } from "./grid_map";
import { Placement } from "./placement";
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
    return new Placement(
      Math.min(this.columns, Math.max(0, Math.floor(widget.coords.left / this.columnWidth))),
      Math.max(0, Math.floor(widget.coords.top / this.rowHeight)),
      Math.ceil(widget.coords.width / (this.columnWidth + this.columnPadding)),
      Math.ceil(widget.coords.height / (this.rowHeight + this.rowPadding))
    )
  }

  placementFromCoords(coords: Coords): Placement {
    return new Placement(
      Math.min(this.columns, Math.max(0, Math.floor(coords.left / this.columnWidth))),
      Math.max(0, Math.floor(coords.top / this.rowHeight)),
      Math.ceil(coords.width / (this.columnWidth + this.columnPadding)),
      Math.ceil(coords.height / (this.rowHeight + this.rowPadding))
    )
  }

  updatePlacement(widget: Widget, placement: Placement): void {
    widget.placement = placement
    this.handleColisions(widget)
  }

  snap(widget: Widget, checkCollisions = true ): void {
    widget.coords = this.constrainedInGrid({
      top: widget.placement.row * this.rowHeight + widget.placement.row * 20,
      left: (widget.placement.col * this.columnWidth) + widget.placement.col * 20,
      width: Math.floor(this.columnWidth * widget.placement.width + (widget.placement.width - 1) * 20),
      height: Math.floor(this.rowHeight * widget.placement.height + (widget.placement.height - 1) * 20),
    })
    if (checkCollisions) this.handleColisions(widget)
  }

  handleColisions(snappedWidget: Widget): void {
    this.widgets.forEach((widget) => {
      console.log('checking', widget.id, 'against', snappedWidget.id)
      if (widget.collides(snappedWidget)) {
        console.log('collided')
        const newPlacement = new Placement(
          widget.placement.col,
          (snappedWidget.placement.row + snappedWidget.placement.height),
          widget.placement.width,
          widget.placement.height
        )
        widget.placement = newPlacement
        this.snap(widget)
      } else {
        console.log('not collided')
      }
    })
  }

  get gridMap(): GridMap {
    return new GridMap(this)
  }

  addWidget(widget: Widget): void {
    this._widgets[widget.id] = widget
    this.snap(widget)
  }

  moveEverythingUp(rowIndex: number): void {
    if (this.gridMap.rowData(rowIndex).length !== 0) return
    this.widgets.forEach((widget) => {
      if (widget.placement.row > rowIndex) {
        widget.placement.row = Math.max(0, widget.placement.row - 1)
        this.snap(widget, false)
      }
    })
    this.moveEverythingUp(rowIndex)
  }

  removeWidget(id: string): void {
    const widgetToRemove = this._widgets[id]
    const widthRemoved = widgetToRemove.placement.width
    const colRemoved = widgetToRemove.placement.col
    delete this._widgets[id]
    const rowData = this.gridMap.rowData(widgetToRemove.placement.row)
    this.moveEverythingUp(widgetToRemove.placement.row)
    console.log(rowData)
    let lastMoved: null | string = null
    for(let i = 0; i < widthRemoved; i ++) {
      const cell = rowData[colRemoved + i + 1]
      if (cell !== undefined && lastMoved !== cell) {
        lastMoved = cell
        const widgetToMove = this._widgets[cell]
        const placement = widgetToMove.placement.clone
        placement.col = placement.col - widthRemoved
        if (this.gridMap.canFitWithoutColliding(placement, widgetToMove.id)) {
          this.updatePlacement(widgetToMove, placement)
          this.snap(widgetToMove)
        }
      }
    }
  }

  setCoords(widget: Widget, coords: Coords): void {
    const fixed_coords = this.constrainedInGrid(coords)
    const minHeight = (widget.minHeight * (this.rowHeight + this.rowPadding)) - this.rowPadding
    const minWidth = (widget.minWidth * (this.columnWidth + this.columnPadding)) - this.columnPadding
    fixed_coords['width'] = Math.max(fixed_coords.width, minWidth)
    fixed_coords['height'] = Math.max(fixed_coords.height, minHeight)
    widget.coords = fixed_coords
  }

  constrainedInGrid(coords: Coords): Coords {
    return {
      height: Math.max(0, coords.height),
      width: Math.max(0, Math.min(coords.width, (this.columnWidth + this.columnPadding) * this.columns)),
      top: Math.max(0, coords.top),
      left: Math.min(this.width - coords.width, Math.max(0, coords.left))
    }
  }
}