import { times } from "lodash";
import { Grid } from "./grid";
import { Placement } from "./placement";
import { Widget } from "./widget";
import { v4 as uuid } from 'uuid'

export class GridMap {
  grid: Grid
  constructor(grid: Grid) {
    this.grid = grid
  }

  rowData(index: number): string[] {
    return this.map[index] || []
  }

  firstAvailablePlacement(width: number, height: number, widgetId?: string): Placement | undefined{
    let row = 0
    for(;;) {
      let startCol = 0
      let startRow = 0
      let fit
      for(let i = 0; i < height; i++) {
        fit = this.canFitInRow(row + i, width, startCol, widgetId)
        if (fit === undefined) break
        if (i === 0) {
          startCol = fit
          startRow = row
        }
      }
      if (fit !== undefined) {
        return new Placement(startCol, startCol + width, startRow, startRow! + height)
      } else {
        row++
      }
    }
  }

  private canFitInRow(rowIndex: number, width: number, startingCol = 0, widgetId?: string): number | undefined {
    const data = this.rowData(rowIndex)
    let freeSpots = 0
    let startCol
    for(let col = startingCol; col < this.grid.columns; col++) {
      freeSpots = (data[col] === undefined || (widgetId && widgetId === data[col])) ? freeSpots + 1 : 0
      if (freeSpots === width) {
        startCol = col - width + 1
        break
      }
    }
    return startCol
  }

  get map(){
    const grid: {[key: number]: string[]} = {}
    this.grid.widgets.forEach((widget) => {
      if (widget.placement) {
        const ranges = widget.placement.ranges
        ranges.row.forEach((row) => {
          grid[row] ??= []
          ranges.col.forEach((col) => {
            grid[row][col] = widget.id
          })
        })
      }
    })
    return grid
  }

  collisions(placement: Placement, widgetToIgnore?: string): Widget[] {
    const colliding_ids = new Set<string>()
    for(let row = placement.startRow; row < placement.endRow; row++) {
      const rowData = this.rowData(row)
      for(let col = placement.startCol; col < placement.endCol; col++) {
        if (rowData[col] !== undefined && rowData[col] !== widgetToIgnore) {
          colliding_ids.add(rowData[col])
        }
      }
    }
    return Array.from(colliding_ids).map((id) => this.grid._widgets[id])
  }
}