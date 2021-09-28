import { range } from 'lodash';
export class Placement {
    startCol;
    endCol;
    startRow;
    endRow;
    constructor(startCol, endCol, startRow, endRow) {
        this.startCol = startCol;
        this.endCol = endCol;
        this.startRow = startRow;
        this.endRow = endRow;
    }
    get width() {
        return this.endCol - this.startCol;
    }
    get height() {
        return this.endRow - this.startRow;
    }
    get ranges() {
        return {
            col: range(this.startCol, this.endCol),
            row: range(this.startRow, this.endRow)
        };
    }
    moveColumn(columnIndex) {
        const width = this.width;
        this.startCol = columnIndex;
        this.endCol = columnIndex + width;
    }
    sameAs(placement) {
        return placement.startCol == this.startCol &&
            placement.endCol == this.endCol &&
            placement.startRow == this.startRow &&
            placement.endRow == this.endRow;
    }
    clone() {
        return new Placement(this.startCol, this.endCol, this.startRow, this.endRow);
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    foreachRow(callback) {
        for (let i = this.startRow; i < this.endRow; i++) {
            callback(i);
        }
    }
}
//# sourceMappingURL=placement.js.map