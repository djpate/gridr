import { Coords } from "./types";
import { GridMap } from "./grid_map";
import { Placement } from "./placement";
import { Widget } from "./widget";
export declare const constrainedInGrid: (coords: Coords, gridWidth: number) => Coords;
export declare const getCoordsForElement: (element: HTMLElement) => Coords;
export declare class Grid {
    _widgets: {
        [key: string]: Widget;
    };
    rootElement: HTMLDivElement;
    rowHeight: number;
    columnPadding: number;
    rowPadding: number;
    _width: number | undefined;
    _columnWidth: number | undefined;
    _gridMap: GridMap | undefined;
    columns: number;
    movingWidget: boolean;
    observer: MutationObserver;
    constructor(id: string, columns: number);
    resized(): void;
    setContainerHeight(): void;
    setupInitialWidgets(): void;
    setupWidget(element: HTMLDivElement): void;
    newWidgetObserver(mutations: MutationRecord[], observer: MutationObserver): void;
    get width(): number;
    get columnWidth(): number;
    get widgets(): Widget[];
    get ratio(): number;
    clearGhost(): void;
    setGhost(placement: Placement): void;
    widget(id: string): Widget;
    placement(widget: Widget): Placement;
    delete(widget: Widget): void;
    get gridMap(): GridMap;
}
