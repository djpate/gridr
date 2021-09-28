import { Coords } from "./types";
import { Grid } from "./grid";
import { Placement } from "./placement";
export declare class Widget {
    _coords: Coords;
    _moving: boolean;
    _reflowed: boolean;
    minWidth: number;
    minHeight: number;
    moved: Widget[];
    element: HTMLDivElement;
    id: string;
    _placement: Placement | null;
    previousPlacement: Placement | null;
    grid: Grid;
    constructor(element: HTMLDivElement, placement: Placement, grid: Grid);
    setupWidgetWrapper(): void;
    snap(): void;
    set moving(state: boolean);
    closestNewSpot(): Placement;
    move(placement: Placement): void;
    delete(): void;
    applyCoords(coords: Coords): void;
    set placement(placement: Placement | null);
    get placement(): Placement | null;
}
