<template>
  <div class="widget_container" ref='container' :class="{ snapped: snapped, dragging: dragging }">
    <div class="inner">
      <div class="title">
        <h1 @mousedown='startDrag'>My Title</h1>
        <span class="close" @click='destroy'>X</span>
      </div>
      <span>{{ widget.id }} {{ widget.placement }}</span>
    </div>
    <div class='resizer top-left' @mousedown="startResize"></div>
    <div class='resizer top-right' @mousedown="startResize"></div>
    <div class='resizer bottom-left' @mousedown="startResize"></div>
    <div class='resizer bottom-right' @mousedown="startResize"></div>
  </div>
</template>

<script lang="ts">
import { Grid } from '@/lib/grid';
import { Widget } from '@/lib/widget';
import { Options, Vue } from 'vue-class-component';
import { Prop } from 'vue-property-decorator'
import { Coords } from './types';

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
    this.widget.element = this.container()
    this.grid.snap(this.widget)
  }

  get resizing(): boolean {
    return !!this.currentDragger
  }

  get snapped(): boolean {
    return !this.resizing && !this.dragging
  }

  container(): HTMLDivElement {
    return this.$refs.container as HTMLDivElement
  }

  startDrag(event: MouseEvent): void {
    event.preventDefault()
    this.original_width = parseFloat(getComputedStyle(this.container(), null).getPropertyValue('width').replace('px', ''));
    this.original_height = parseFloat(getComputedStyle(this.container(), null).getPropertyValue('height').replace('px', ''));
    this.original_offset_x = event.offsetX;
    this.original_offset_y = event.offsetY;
    this.dragging = true
    this.widget.moving = true
    window.addEventListener('mousemove', this.drag)
    window.addEventListener('mouseup', this.stopDrag)
  }

  drag(event: MouseEvent): void  {
    let coords = {
      width: this.original_width,
      height: this.original_height,
      top: event.pageY - this.container().parentElement!.offsetTop - this.original_offset_y,
      left: event.pageX - this.original_offset_x
    }
    this.widget.coords = coords
    this.$emit('resizing', this.widget)
  }

  stopDrag(event: MouseEvent): void  {
    event.preventDefault()
    window.removeEventListener('mousemove', this.drag)
    window.removeEventListener('mouseup', this.drag)
    this.widget.moving = false
    this.grid.snap(this.widget)
    this.$emit('snapped', this.widget)
    this.dragging = false
  }

  startResize(event: MouseEvent): void  {
    event.preventDefault()
    this.currentDragger = event.target as HTMLElement;
    this.original_width = parseFloat(getComputedStyle(this.container(), null).getPropertyValue('width').replace('px', ''));
    this.original_height = parseFloat(getComputedStyle(this.container(), null).getPropertyValue('height').replace('px', ''));
    this.original_x = this.container().offsetLeft;
    this.original_y = this.container().offsetTop;
    this.original_mouse_x = event.pageX;
    this.original_mouse_y = event.pageY;
    this.widget.moving = true
    window.addEventListener('mousemove', this.resize)
    window.addEventListener('mouseup', this.stopResize)
  }

  stopResize(event: MouseEvent): void  {
    event.preventDefault()
    this.currentDragger = null
    window.removeEventListener('mousemove', this.resize)
    window.removeEventListener('mouseup', this.stopResize)
    this.grid.snap(this.widget)
    this.widget.moving = false
    this.$emit('snapped', this.widget)
  }

  resize(event: MouseEvent): void  {
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
    
    this.widget.coords = coords
    this.$emit('resizing', this.widget)
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

  destroy(): void {
    this.$emit('destroy', this.widget.id)
  }
}
</script>

<style lang='scss' scoped>
.widget_container {
  border: 1px solid grey;
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
  &.dragging {
    cursor: grabbing!important;
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
