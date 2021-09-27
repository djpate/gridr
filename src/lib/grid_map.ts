import { intersection, range, times } from "lodash";
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

  firstAvailablePlacement(width: number, height: number, widgetId?: string): Placement{
    let row = 0
    let counter = 0
    let previousColumns
    for(;;) {
      const columns = this.potentialStartColumnsInRow(row, width)
      previousColumns = (previousColumns && previousColumns.length) ? intersection(previousColumns, columns) : columns
      if (previousColumns.length) {
        counter++
      } else {
        counter = 0
      }
      console.log(counter)
      if (counter === height) {
        return new Placement(previousColumns[0], previousColumns[0] + width, row - height + 1, row + height)
      } else {
        row++
      }
    }
  }

  // given a row and width give me all the potential cols 
  // I could start at without colliding with something
  private potentialStartColumnsInRow(rowIndex: number, width: number): number[] {
    const cols: number[] = []
    const rowData = this.rowData(rowIndex)
    if (rowData.length > this.grid.columns - width) return []
    if (rowData.length === 0) return range(this.grid.columns)
    let counter = 0
    for(let i = 0; i < this.grid.columns; i++) {
      if (rowData[i] === undefined) counter++
      else counter = 0
      if (counter >= width) cols.push(i - (width - 1))
    }
    return cols
  }

  get map(): {[key: number]: string[]}{
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