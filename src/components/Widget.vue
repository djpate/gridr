<template>
  <div class="widget_container" ref='container' :class="{ snapped: snapped }">
    <div class="inner">
      <div class="title">
        <h1 @mousedown='startDrag'>My Title</h1>
        <span class="close" @click='destroy'>X</span>
      </div>
      <span>Hello</span>
    </div>
    <div class='resizer top-left' @mousedown="startResize"></div>
    <div class='resizer top-right' @mousedown="startResize"></div>
    <div class='resizer bottom-left' @mousedown="startResize"></div>
    <div class='resizer bottom-right' @mousedown="startResize"></div>
  </div>
</template>

<script lang="ts">
import { constrainedInGrid, getCoordsForElement, Grid, Widget } from '@/lib/grid';
import { Options, Vue } from 'vue-class-component';
import { Prop, Watch } from 'vue-property-decorator'
import { Coords, Placement } from './types';

@Options({})
export default class WidgetComponent extends Vue {
  currentDragger: HTMLElement | null = null;
  original_width = 0
  original_height = 0
  original_mouse_x = 0
  original_mouse_y = 0
  original_offset_x = 0
  original_offset_y = 0
  original_x = 0
  original_y = 0
  dragging = false

  @Prop() widget!: Widget
  @Prop() grid!: Grid

  mounted(): void {
    this.placeInGrid()
  }

  @Watch('grid.columnWidth')
  onWidthChange(): void {
    this.placeInGrid()
  }

  @Watch('widget.placement')
  onPlacementChange() {
    this.placeInGrid()
  }

  get snapped() {
    return !this.resizing && !this.dragging
  }

  placeInGrid(): void {
    this.setCoords({
      top: this.widget.placement.row * this.grid.rowHeight + this.widget.placement.row * 20,
      left: (this.widget.placement.col * this.grid.columnWidth) + this.widget.placement.col * 20,
      width: Math.floor(this.grid.columnWidth * this.widget.placement.width + (this.widget.placement.width - 1) * 20),
      height: Math.floor(this.grid.rowHeight * this.widget.placement.height + (this.widget.placement.height - 1) * 20),
    })
  }

  container(): HTMLDivElement {
    return this.$refs.container as HTMLDivElement
  }

  startDrag(event: MouseEvent) {
    event.preventDefault()
    this.original_width = parseFloat(getComputedStyle(this.container(), null).getPropertyValue('width').replace('px', ''));
    this.original_height = parseFloat(getComputedStyle(this.container(), null).getPropertyValue('height').replace('px', ''));
    this.original_offset_x = event.offsetX;
    this.original_offset_y = event.offsetY;
    this.dragging = true
    window.addEventListener('mousemove', this.drag)
    window.addEventListener('mouseup', this.stopDrag)
  }

  drag(event: MouseEvent) {
    let coords = {
      width: this.original_width,
      height: this.original_height,
      top: event.pageY - this.container().parentElement!.offsetTop - this.original_offset_y,
      left: event.pageX - this.original_offset_x
    }
    this.setCoords(coords)
    this.$emit('resizing', {coords: coords, widget: this.widget})
  }

  stopDrag(event: MouseEvent) {
    event.preventDefault()
    window.removeEventListener('mousemove', this.drag)
    window.removeEventListener('mouseup', this.drag)
    this.$emit('snap', {widget: this.widget, coords: this.currentCoords()})
    this.dragging = false
  }

  startResize(event: MouseEvent) {
    event.preventDefault()
    this.currentDragger = event.target as HTMLElement;
    this.original_width = parseFloat(getComputedStyle(this.container(), null).getPropertyValue('width').replace('px', ''));
    this.original_height = parseFloat(getComputedStyle(this.container(), null).getPropertyValue('height').replace('px', ''));
    this.original_x = this.container().offsetLeft;
    this.original_y = this.container().offsetTop;
    this.original_mouse_x = event.pageX;
    this.original_mouse_y = event.pageY;
    window.addEventListener('mousemove', this.resize)
    window.addEventListener('mouseup', this.stopResize)
  }

  stopResize(event: MouseEvent) {
    event.preventDefault()
    this.currentDragger = null
    window.removeEventListener('mousemove', this.resize)
    window.removeEventListener('mouseup', this.stopResize)
    this.$emit('snap', {widget: this.widget, coords: this.currentCoords()})
  }

  resize(event: MouseEvent) {
    if (!this.currentDragger) return
    let coords: Coords | null
    let classList = this.currentDragger.classList
    if (classList.contains('bottom-left'))
      coords = this.bottomLeft(event)
    else if (classList.contains('bottom-right'))
      coords = this.bottomRight(event)
    else if (classList.contains('top-right'))
      coords = this.topRight(event)
    else
      coords = this.topLeft(event)
    if(!coords) return
    
    this.setCoords(coords)
    this.$emit('resizing', {coords: coords, widget: this.widget})
  }

  get resizing() {
    return !!this.currentDragger
  }

  currentCoords(): Coords {
    return getCoordsForElement(this.container())
  }

  setCoords(coords: Coords) {
    let constrainedCoords = constrainedInGrid(coords, this.grid.width)
    this.container().style.height = constrainedCoords.height + 'px'
    this.container().style.width = constrainedCoords.width + 'px'
    this.container().style.top = constrainedCoords.top + 'px'
    this.container().style.left = constrainedCoords.left + 'px'
  }

  bottomRight(event: MouseEvent): Coords {
    return {
      width: this.original_width + (event.pageX - this.original_mouse_x),
      height: this.original_height + (event.pageY - this.original_mouse_y),
      top: this.container().offsetTop,
      left: this.container().offsetLeft
    }
  }

  bottomLeft(event: MouseEvent): Coords {
    return {
      width: this.original_width - (event.pageX - this.original_mouse_x),
      height: this.original_height + (event.pageY - this.original_mouse_y),
      top: this.container().offsetTop,
      left: this.original_x + (event.pageX - this.original_mouse_x)
    }
  }

  topRight(event: MouseEvent) : Coords {
    return {
      width: this.original_width + (event.pageX - this.original_mouse_x),
      height: this.original_height - (event.pageY - this.original_mouse_y),
      top: this.original_y + (event.pageY - this.original_mouse_y),
      left: this.container().offsetLeft
    }
  }

  topLeft(event: MouseEvent) : Coords {
    return {
      width: this.original_width - (event.pageX - this.original_mouse_x),
      height: this.original_height - (event.pageY - this.original_mouse_y),
      top:  this.original_y + (event.pageY - this.original_mouse_y),
      left: this.original_x + (event.pageX - this.original_mouse_x)
    }
  }

  destroy() {
    this.$emit('destroy', this.widget.id)
  }
}
</script>

<style lang='scss'>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  margin-top: 60px;
}

.widget_container {
  border: 1px solid grey;
  // min-width: 200px;
  // min-height: 100px;
  filter: drop-shadow(5px 5px 2px #e1e1e1);
  background-color: white;
  position: absolute;
  top: 100px;
  left: 100px;
  z-index: 100;
  &.snapped {
    transition-property: left, top, height, width;
    transition-duration: .5s;
    z-index: 1;
  }
  .inner {
    padding: 10px;
    .title {
      user-select: none;
      font-weight: bold;
      border-bottom: 1px solid grey;
      padding: 5px;
      display: flex;
      h1 {
        display: inline-block;
        margin: 0;
        font-size: 20px;
        flex-grow: 1;
        cursor: grab;
      }
      .close {
        cursor: pointer;
        justify-self: end;
      }
    }
  }
  .resizer{
    display: none;
    width: 10px;
    height: 10px;
    border-radius: 50%; /*magic to turn square into circle*/
    background: white;
    border: 3px solid #4286f4;
    position: absolute;
    &.top-left {
      left: -5px;
      top: -5px;
      cursor: nwse-resize; /*resizer cursor*/
    }
    &.top-right {
      right: -5px;
      top: -5px;
      cursor: nesw-resize;
    }
    &.bottom-left {
      left: -5px;
      bottom: -5px;
      cursor: nesw-resize;
    }
    &.bottom-right {
      right: -5px;
      bottom: -5px;
      cursor: nwse-resize;
    }
  }
  &:hover {
    .resizer {
      display: block;
    }
  }
}

</style>
