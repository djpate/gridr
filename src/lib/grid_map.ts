import { Grid } from "./grid";
import { Placement } from "./placement";
import { Widget } from "./widget";

export class GridMap {
  grid: Grid
  constructor(grid: Grid) {
    this.grid = grid
  }

  rowData(index: number): string[] {
    return this.map[index] || []
  }

  canFitWithoutColliding(placement: Placement, id: string): boolean {
    const mock = new Widget(placement)
    mock.id = id // this let's up prevent colliding with yourself
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