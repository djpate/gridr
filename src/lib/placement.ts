import clone from 'lodash/clone'
export class Placement {
  startCol: number
  endCol: number
  startRow: number
  endRow: number

  constructor(startCol: number, endCol: number, startRow: number, endRow: number) {
    this.startCol = startCol
    this.endCol = endCol
    this.startRow = startRow
    this.endRow = endRow
  }

  get width() {
    return this.endCol - this.startCol
  }

  get height() {
    return this.endRow - this.startRow
  }

}