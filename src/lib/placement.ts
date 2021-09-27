import { range } from 'lodash'
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

  get width(): number {
    return this.endCol - this.startCol
  }

  get height(): number {
    return this.endRow - this.startRow
  }

  get ranges(): {col: number[], row: number[]} {
    return {
      col: range(this.startCol, this.endCol),
      row: range(this.startRow, this.endRow)
    }
  }

  moveColumn(columnIndex: number): void {
    const width = this.width
    this.startCol = columnIndex
    this.endCol = columnIndex + width
  }

  sameAs(placement: Placement): boolean {
    return placement.startCol == this.startCol && 
           placement.endCol == this.endCol && 
           placement.startRow == this.startRow &&
           placement.endRow == this.endRow
  }

  clone() : Placement {
    return new Placement(this.startCol, this.endCol, this.startRow, this.endRow)
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  foreachRow(callback: (rowId: number) => any): void {
    for(let i=this.startRow; i < this.endRow; i++) {
      callback(i)
    }
  }

}