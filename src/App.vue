<template>
  <div class="add">
    <div class="new" @mousedown='addNewWidget'>Some widget</div>
  </div>
  <div id="grid">
    <Widget class="widget" v-for='(value, name) in widgets' :width='value.width' :height='value.height' :id='name' :key='name'></Widget>
  </div>
</template>

<script lang="ts">
import { random, uniqueId } from 'lodash';
import { Options, Vue } from 'vue-class-component';
import Widget from './components/PlainWidget.vue';
import { Grid } from './lib/grid';
import { Placement } from './lib/placement';
import { Widget as GridWidget } from './lib/widget';

@Options({
  components: {
    Widget,
  },
})
export default class App extends Vue {
  rows = 0
  cols = 0

  widgets = {
    [uniqueId()]: {
      width: 1,
      height: 1
    }
  }

  grid!: Grid
  intentTimeout = 0

  mounted(): void {
    this.grid = new Grid('grid', 6)
    // this.demoSetup()
  }

  snapped(): void {
    // this.hideSnapGrid();
  }

  addNewWidget(): void {
    this.widgets[uniqueId()] = {
      width: random(1, 5),
      height: random(1, 5)
    }
  }

  // showSnapGrid(widget: GridWidget): void {
  //   let placement = this.grid.desiredPlacement(widget)
  //   clearTimeout(this.intentTimeout)
  //   this.cols = Math.min(6, placement.col + placement.width + 1)
  //   this.rows = placement.row + placement.height + 1
  //   this.displayShadow(placement)
    

  //   // try to be smart about when to move other widgets when collision will occur
  //   let mockWidget = new GridWidget(placement)
  //   let willCollide = this.grid.widgets.map((widget) => widget.collides(mockWidget)).some(Boolean)
  //   // console.log('collision?', willCollide, placement)
  //   let timeout = willCollide ? 125 : 0
  //   this.intentTimeout = setTimeout(() => {
  //     this.grid.updatePlacement(widget, placement)
  //   }, timeout)
  // }

  // displayShadow(placement: Placement): void {
  //   let ghost = (this.$refs.ghost as HTMLDivElement)
  //   ghost.style.display = 'block';
  //   let ghostPadding = 20;
  //   let width = (placement.width * (this.grid.columnWidth + this.grid.columnPadding)) - this.grid.columnPadding - ghostPadding
  //   let height = ((placement.height * (this.grid.rowHeight + this.grid.rowPadding)) - this.grid.rowPadding) - ghostPadding
  //   let top = Math.max(0, placement.row * (this.grid.rowHeight + this.grid.rowPadding)) + ghostPadding / 2
  //   let left = Math.max(0, placement.col * (this.grid.columnWidth + this.grid.columnPadding)) + ghostPadding / 2
  //   ghost.style.top = top + 'px'
  //   ghost.style.left = left + 'px';
  //   ghost.style.width = width + 'px'
  //   ghost.style.height = height + 'px'
  // }

  // hideSnapGrid(): void {
  //   this.rows = 0;
  //   this.cols = 0;
  //   (this.$refs.ghost as HTMLDivElement).style.display = 'none';
  // }

  // removeWidget(id: string): void {
  //   this.grid!.removeWidget(id)
  // }

  // addNewWidget(): void {
  //   const width = random(1, 2)
  //   const height = random(1, 2)
  //   let placement = this.grid.gridMap.firstFreeSpot(width, height)
  //   let widget = new GridWidget(placement)
  //   this.grid!.addWidget(widget)
  // }

  // demoSetup(): void {
  //   this.addNewWidget()
  //   this.addNewWidget()
  // }
}
</script>

<style lang='scss'>
body {
  margin: 0;
}
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  margin-top: 60px;
  .add {
    margin: 0 20px;
    user-select: none;
    .new {
      border: 1px solid black;
      height: 100px;
      width: 250px;
      cursor: grab;
    }
  }

.grid_root {
  margin: 20px;
  position: relative;
  .shadowGrid {
    width: fit-content;
    .shadowRow {
      display: flex;
      flex-direction: row;
      flex-wrap: nowrap;
      width: 100%;
      height: 150px;
      justify-content: space-evenly;
      margin-bottom: 20px;
      &::first-child {
        margin-bottom: 0;
      }
      .shadowCol {
        display: flex;
        width: calc(calc((100vw - 140px) / 6)); // 20px padding and 5 * 20px margin (last col has no margin)
        height: 100%;
        border: 1px dashed blue;
        box-sizing: border-box;
        margin-right: 20px;
        &:last-child {
          margin-right: 0;
        }
      }
    }
  }
  .ghost {
    top: 0;
    left: 0;
    background-color: #d6d6ff;
    width: 50px;
    height: 50px;
    border-radius: 15px;
    position: absolute;
    opacity: 0.5;
    display: none;
  }
  .widget_container {
    border: 1px solid grey;
    filter: drop-shadow(5px 5px 2px #e1e1e1);
    background-color: white;
    position: absolute;
    &.snapped {
      transition-property: width, height, top, left;
      transition-duration: .5s;
    }
    &.moving {
      opacity: 0.9;
      pointer-events: none;
    }
    z-index: 3;
    .resizer{
      display: none;
      width: 10px;
      height: 10px;
      border-radius: 50%; /*magic to turn square into circle*/
      background: white;
      border: 3px solid #4286f4;
      position: absolute;
      &.topLeft {
        left: -5px;
        top: -5px;
        cursor: nwse-resize; /*resizer cursor*/
      }
      &.topRight {
        right: -5px;
        top: -5px;
        cursor: nesw-resize;
      }
      &.bottomLeft {
        left: -5px;
        bottom: -5px;
        cursor: nesw-resize;
      }
      &.bottomRight {
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

    .dragger {
      border: 1px solid black;
      height: 20px;
      width: 20px;
      position: absolute;
      bottom: 0;
      right: 20;
    }
  }
}
}

</style>
