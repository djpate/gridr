import { Coords } from "@/components/types"
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
  _width: number | undefined
  _columnWidth: number | undefined
  
  columns: number
  movingWidget = false
  observer: MutationObserver

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
    this.observer = new MutationObserver(this.newWidgetObserver.bind(this))
    this.observer.observe(this.rootElement, {subtree: false, childList: true})
    this.setupInitialWidgets()
    window.addEventListener('resize', this.resized.bind(this))
  }

  resized(): void {
    this._width = undefined
    this._columnWidth = undefined
    this.widgets.forEach((widget) => widget.snap())
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

  setupWidget(element: HTMLDivElement): void {
    const width = Number(element.dataset.width) || 1
    const height = Number(element.dataset.height) || 1
    const placement = this.gridMap.firstAvailablePlacement(width, height)!
    const widget = new Widget(element as HTMLDivElement, placement, this)
    this._widgets[widget.id] = widget
  }

  newWidgetObserver(mutations: MutationRecord[], observer: MutationObserver): void {
    mutations.forEach((mutation_record) => {
      mutation_record.addedNodes.forEach((addedNode) => {
        if ((addedNode as HTMLElement).classList.contains('widget')) {
          this.setupWidget(addedNode as HTMLDivElement)
        }
      })
    })
  }

  get width(): number {
    return this._width ??= this.rootElement.clientWidth
  }

  get columnWidth(): number {
    return this._columnWidth ??= Math.round((this.width - (this.columnPadding * (this.columns - 1))) / this.columns)
  }

  get widgets(): Widget[] {
    return Object.values(this._widgets)
  }

  clearGhost(): void {
    this.rootElement.classList.remove('moving')
    const ghost = this.rootElement.getElementsByClassName('ghost')[0] as HTMLDivElement
    ghost.style.display = 'none'
    Array.from(this.rootElement.getElementsByClassName("shadowRow")).forEach((row) => {
      row.remove()
    })
  }

  setGhost(placement: Placement): void {
    this.clearGhost()
    this.rootElement.classList.add('moving')
    const shadowGrid = this.rootElement.getElementsByClassName('shadowGrid')[0] as HTMLDivElement
    for(let row = 0; row <= placement.endRow; row++) {
      const rowElement = document.createElement('div')
      rowElement.classList.add('shadowRow')
      shadowGrid.appendChild(rowElement)
      for(let col = 0; col < Math.min(this.columns, placement.endCol + 1); col++) {
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

  placement(size: DOMRectReadOnly): Placement {
    const parentRect = this.rootElement.getBoundingClientRect()
    const top = size.top - parentRect.top
    const left = size.left - parentRect.left
    const startCol = Math.max(0, Math.min(this.columns, Math.floor(left / this.columnWidth)))
    const endCol = Math.min(this.columns + 1, startCol + Math.ceil(size.width / (this.columnWidth + this.columnPadding)))
    const startRow = Math.max(0, Math.floor(top / this.rowHeight))
    const endRow = startRow + Math.ceil(size.height / (this.rowHeight + this.rowPadding))
    const placement = new Placement(startCol, endCol, startRow, endRow)
    return placement
  }

  delete(widget: Widget): void {
    delete this._widgets[widget.id]
    console.log(widget.placement)
    if (!widget.placement) {
      console.error('widget', widget.id, 'does not have a placement ?')
      return
    }
    for(let row = widget.placement!.endRow; row >= widget.placement!.startRow; row--){
      const rowData = this.gridMap.rowData(row)
      if (!rowData.length) this.gridMap.deleteRow(row)
    }
  }

  get gridMap(): GridMap {
    return new GridMap(this)
  }
}