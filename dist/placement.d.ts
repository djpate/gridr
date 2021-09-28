export declare class Placement {
    startCol: number;
    endCol: number;
    startRow: number;
    endRow: number;
    constructor(startCol: number, endCol: number, startRow: number, endRow: number);
    get width(): number;
    get height(): number;
    get ranges(): {
        col: number[];
        row: number[];
    };
    moveColumn(columnIndex: number): void;
    sameAs(placement: Placement): boolean;
    clone(): Placement;
    foreachRow(callback: (rowId: number) => any): void;
}
