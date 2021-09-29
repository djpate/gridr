import { Coords } from "./types";
import { Grid } from "./grid";
import { Placement } from "./placement";
declare type Constraints = {
    minWidth?: number;
    ratio?: number;
};
export declare class Widget {
    _coords: Coords;
    _moving: boolean;
    _reflowed: boolean;
    minWidth: number;
    minHeight: number;
    moved: Widget[];
    constraints: Constraints | undefined;
    element: HTMLDivElement;
    originalElement: HTMLDivElement;
    id: string;
    _placement: Placement | null;
    previousPlacement: Placement | null;
    grid: Grid;
    constructor(element: HTMLDivElement, placement: Placement, grid: Grid, constraints?: Constraints);
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
export {};
