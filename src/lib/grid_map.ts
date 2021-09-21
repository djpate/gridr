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

  firstFreeSpot(width: number, height: number): Placement {
    let found = false
    let row = 0
    let placement: Placement
    while(found === false) {
      for(let col = 0; col < this.grid.columns; col++) {
        placement = new Placement(col, row, width, height)
        if (this.canFitWithoutColliding(placement, uuid())) {
          found = true
          break
        }
      }
      row++
    }
    return placement!
  }

  get lastRow() {
    return Object.keys(this.map).length - 1
  }

  canFitWithoutColliding(placement: Placement, id: string): boolean {
    const mock = new Widget(placement)
    mock.id = id // this let's us prevent colliding with yourself
    return !this.grid.widgets.map((Widget) => Widget.collides(mock)).some(Boolean)
  }

  get map(){
    const grid: {[key: number]: string[]} = {}
    this.grid.widgets.forEach((widget) => {
      const ranges = widget.placementRanges
      ranges.row.forEach((row) => {
        grid[row] ??= []
        ranges.col.forEach((col) => {
          grid[row][col] = widget.id
        })
      })
    })
    return grid
  }
}`1`