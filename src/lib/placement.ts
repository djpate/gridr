export class Placement {
  col: number
  row: number
  width: number
  height: number

  constructor(col: number, row: number, width: number, height: number) {
    this.col = col
    this.row = row
    this.width = width
    this.height = height
  }

  sameAs(placement: Placement): boolean {
    return this.col == placement.col && this.row == placement.row && this.width == placement.width && this.height == placement.height
  }
}