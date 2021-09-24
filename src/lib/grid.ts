import { Coords } from "@/components/types"
import { isGloballyWhitelisted } from "@vue/shared";
import { add, uniqueId } from "lodash";
import { GridMap } from "./grid_map";
import { Placement } from "./placement";
import { Widget } from "./widget";

// prevents the widget boundaries to leave the allowed grid
export const constrainedInGrid = (coords: Coords, gridWidth: number): Coords => {
  // return {
  //   height: coords.height,
  //   width: coords.width,
  //   top: Math.max(0, coords.top),
  //   left: Math.min(gridWidth - coords.width, Math.max(0, coords.left))
  // }
  return coords
}

export const getCoordsForElement = (element: HTMLElement): Coords => {
  return {
    height: parseInt(element.style.height),
    width: parseInt(element.style.width),
    top: parseInt(element.style.top),
    left: parseInt(element.style.left)
  }
}

export class Grid {
  _widgets: {[key: string]: Widget} = {}
  rootElement: HTMLDivElement

  rowHeight = 150
  columnPadding = 20
  rowPadding = 20
  
  columns: number
  movingWidget = false
  observer: MutationObserver
  listeners: {[key: string]: any} = {}

  constructor(id: string, columns: number) {
    const rootElement = document.getElementById(id)
    if (!rootElement) throw("Could not create grid!, id #{id} not found")
    this.rootElement = rootElement as HTMLDivElement
    this.rootElement.classList.add('grid_root')
    
    // create shadow grid
    const shadowGrid = document.createElement("div")
    shadowGrid.classList.add('shadowGrid')
    rootElement.appendChild(shadowGrid)
    
    this.columns = columns
    this.listeners = {}
    this.observer = new MutationObserver(this.newWidgetObserver.bind(this))
    this.observer.observe(this.rootElement, {subtree: false, childList: true})
    this.setupInitialWidgets()
  }

  setupInitialWidgets(): void {
    const widgets = Array.from(this.rootElement.getElementsByClassName('widget'))
    Array.from(widgets).forEach((widgetNode) => {
      this.setupWidget(widgetNode as HTMLDivElement)
    })
    const ghost = document.createElement("div")
    ghost.classList.add('ghost')
    const inner = document.createElement("div")
    inner.classList.add('inner')
    ghost.appendChild(inner)
    this.rootElement.appendChild(ghost)
  }

  setupWidget(element: HTMLDivElement) {
    const width = Number(element.dataset.width) || 1
    const height = Number(element.dataset.height) || 1
    const placement = this.gridMap.firstAvailablePlacement(width, height)!
    const widget = new Widget(element as HTMLDivElement, placement, this)
    this._widgets[widget.id] = widget
  }

  newWidgetObserver(mutations: MutationRecord[], observer: MutationObserver) {
    mutations.forEach((mutation_record) => {
      mutation_record.addedNodes.forEach((addedNode) => {
        if ((addedNode as HTMLElement).classList.contains('widget')) {
          this.setupWidget(addedNode as HTMLDivElement)
        }
      })
    })
  }

  get width(): number {
    return this.rootElement.clientWidth
  }

  get columnWidth(): number {
    return (this.width - (this.columnPadding * (this.columns - 1))) / this.columns
  }

  get widgets(): Widget[] {
    return Object.values(this._widgets)
  }

  clearGhost() {
    const ghost = this.rootElement.getElementsByClassName('ghost')[0] as HTMLDivElement
    ghost.style.display = 'none'
    Array.from(this.rootElement.getElementsByClassName("shadowRow")).forEach((row) => {
      row.remove()
    })
  }

  setGhost(placement: Placement) {
    this.clearGhost()
    const shadowGrid = this.rootElement.getElementsByClassName('shadowGrid')[0] as HTMLDivElement
    for(let row = 0; row < placement.height; row++) {
      const rowElement = document.createElement('div')
      rowElement.classList.add('shadowRow')
      shadowGrid.appendChild(rowElement)
      for(let col = 0; col < placement.endCol; col++) {
        const cell = document.createElement("div")
        cell.classList.add('shadowCol')
        rowElement.appendChild(cell)
      }
    }
    const ghost = this.rootElement.getElementsByClassName('ghost')[0] as HTMLDivElement
    ghost.style.display = 'block';
    const ghostPadding = 20;
    const width = (placement.width * (this.columnWidth + this.columnPadding)) - this.columnPadding - ghostPadding
    const height = ((placement.height * (this.rowHeight + this.rowPadding)) - this.rowPadding) - ghostPadding
    const top = Math.max(0, placement.startRow * (this.rowHeight + this.rowPadding)) + ghostPadding / 2
    const left = Math.max(0, placement.startCol * (this.columnWidth + this.columnPadding)) + ghostPadding / 2
    ghost.style.top = top + 'px'
    ghost.style.left = left + 'px';
    ghost.style.width = width + 'px'
    ghost.style.height = height + 'px'
  }

  widget(id: string): Widget {
    return this._widgets[id]
  }

  placement(size: DOMRectReadOnly) {
    const parentRect = this.rootElement.getBoundingClientRect()
    const top = size.top - parentRect.top
    const left = size.left - parentRect.left
    const startCol = Math.min(this.columns, Math.floor(left / this.columnWidth))
    const endCol = Math.min(this.columns + 1, startCol + Math.ceil(size.width / (this.columnWidth + this.columnPadding)))
    const startRow = Math.max(0, Math.floor(top / this.rowHeight))
    const endRow = startRow + Math.ceil(size.height / (this.rowHeight + this.rowPadding))
    const placement = new Placement(startCol, endCol, startRow, endRow)
    return placement
  }

  firstAvailablePlacement(width: number, height: number) {
    console.log(this.gridMap.map)
  }

  get gridMap(): GridMap {
    return new GridMap(this)
  }


  // updatePlacement(movingWidget: Widget, placement: Placement): void {
  //   if (movingWidget.placement.sameAs(placement)) return
  //   movingWidget.placement = placement
  //   movingWidget.moved = this.handleColisions(movingWidget)
  //   this.reflowedWidgets.forEach((reflowedWidget) => {
  //     console.log(reflowedWidget.originalPlacement, reflowedWidget.placement)
  //     if (this.gridMap.canFitWithoutColliding(reflowedWidget.originalPlacement!, reflowedWidget.id)) {
  //       reflowedWidget.placement = reflowedWidget.originalPlacement!
  //       reflowedWidget.reflowed = false
  //       this.snap(reflowedWidget)
  //     }
  //   })
  // }

  // handleColisions(snappedWidget: Widget): Widget[] {
  //   const movedWidgets: Widget[] = []
  //   this.widgets.forEach((widget) => {
  //     if (widget.collides(snappedWidget)) {
  //       movedWidgets.push(widget)
  //       widget.reflowed = true
  //       const newPlacement = widget.placement.clone
  //       newPlacement.row = (snappedWidget.placement.row + snappedWidget.placement.height)
  //       // const newPlacement = this.gridMap.firstFreeSpot(widget.placement.width, widget.placement.height)
  //       widget.placement = newPlacement
  //       this.snap(widget)
  //     }
  //   })
  //   return movedWidgets
  // }

  // get gridMap(): GridMap {
  //   return new GridMap(this)
  // }

  // get reflowedWidgets(): Widget[] {
  //   return this.widgets.filter(widget => widget.reflowed)
  // }


  // moveEverythingUp(rowIndex: number): void {
  //   if (this.gridMap.rowData(rowIndex).length !== 0 || rowIndex > this.gridMap.lastRow) return
  //   this.widgets.forEach((widget) => {
  //     if (widget.placement.row > rowIndex) {
  //       widget.placement.row = Math.max(0, widget.placement.row - 1)
  //       this.snap(widget, false)
  //     }
  //   })
  //   this.moveEverythingUp(rowIndex)
  // }

  // removeWidget(id: string): void {
  //   const widgetToRemove = this._widgets[id]
  //   delete this._widgets[id]
  //   const rowData = this.gridMap.rowData(widgetToRemove.placement.row)
    
  //   // if current row is now empty, move everything below it up
  //   this.moveEverythingUp(widgetToRemove.placement.row)

  //   // now let's try to move content on the same row the left
  //   const widgetsToMove = [...new Set(rowData.slice(widgetToRemove.placement.col + widgetToRemove.placement.width))].map((widgetId) => this.widget(widgetId))
  //   widgetsToMove.forEach((widget) => {
  //     const tentativePlacement = widget.placement.clone
  //     tentativePlacement.col = tentativePlacement.col - widgetToRemove.placement.width
  //     if (this.gridMap.canFitWithoutColliding(tentativePlacement, uniqueId())) {
  //       widget.placement = tentativePlacement
  //       this.snap(widget)
  //     }
  //   })

  // }

  // setCoords(widget: Widget, coords: Coords): void {
  //   const fixed_coords = this.constrainedInGrid(coords)
  //   const minHeight = (widget.minHeight * (this.rowHeight + this.rowPadding)) - this.rowPadding
  //   const minWidth = (widget.minWidth * (this.columnWidth + this.columnPadding)) - this.columnPadding
  //   fixed_coords['width'] = Math.max(fixed_coords.width, minWidth)
  //   fixed_coords['height'] = Math.max(fixed_coords.height, minHeight)
  //   widget.coords = fixed_coords
  // }

  // constrainedInGrid(coords: Coords): Coords {
  //   return {
  //     height: Math.max(0, coords.height),
  //     width: Math.max(0, Math.min(coords.width, (this.columnWidth + this.columnPadding) * this.columns)),
  //     top: Math.max(0, coords.top),
  //     left: Math.min(this.width - coords.width, Math.max(0, coords.left))
  //   }
  // }
}