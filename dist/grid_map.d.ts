import { Grid } from "./grid";
import { Placement } from "./placement";
import { Widget } from "./widget";
export declare class GridMap {
    grid: Grid;
    constructor(grid: Grid);
    rowData(index: number): string[];
    firstAvailablePlacement(width: number, height: number, widgetId?: string): Placement;
    maxStartingRowByCol(col: number, widget: Widget): number;
    private potentialStartColumnsInRow;
    get map(): {
        [key: number]: string[];
    };
    get lastRow(): number;
    deleteRow(rowId: number): void;
    collisions(placement: Placement, widgetToIgnore?: string): Widget[];
}
