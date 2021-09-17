<template>
  <div class="grid" ref='grid'>
    <div class="shadowGrid">
      <div class="row" v-for='(row, id) in rows' :key='id' >
        <div class="col" v-for='(col, id) in cols' :key='id'></div>
      </div>
    </div>
    <div class="ghost" ref='ghost'></div>
    <Widget v-for='(placement, id) in widgets' :rowHeight='rowHeight' :colWidth='colWidth' :gridWidth='gridWidth' :id='id' :key='id' :placement='placement' @snap='snap' @hideGrid='hideSnapGrid' @resizing='showSnapGrid'></Widget>
  </div>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component';
import Widget from './components/Widget.vue';
import { Placement } from './components/types'
import { reactive } from '@vue/reactivity';

type Coords = {
  width: number
  height: number
  top: number
  left: number
}

@Options({
  components: {
    Widget,
  },
})
export default class App extends Vue {
  rows = 0
  cols = 0

  rowHeight = 150
  colWidth = 0
  gridWidth = 0

  widgets: {[key: string]: Placement} = reactive({
    "1": {
      col: 0,
      row: 0,
      width: 2,
      height: 1
    },
    "2": {
      col: 1,
      row: 3,
      width: 1,
      height: 2
    }
  })

  mounted(): void {
    this.setColWidth()
    window.addEventListener("resize", this.setColWidth);
  }


  setColWidth(): void {
    this.gridWidth = (this.$refs.grid as HTMLDivElement).clientWidth;
    this.colWidth = (this.gridWidth - 100) / 6 // 100 is for 20px padding * 5, 2 is for the border
  }

  snap(payload: {key: string, coords: Coords}): void {
    let height = Math.ceil(payload.coords.height / this.rowHeight)
    let placement: Placement  = {
      col: Math.floor(payload.coords.left / this.colWidth),
      row: Math.floor(payload.coords.top / (this.rowHeight)),
      width: Math.ceil(payload.coords.width / (this.colWidth + 20)),
      height: Math.ceil(payload.coords.height / (this.rowHeight + 20))
    }
    this.widgets[payload.key] = placement
    this.hideSnapGrid();
    (this.$refs.ghost as HTMLDivElement).style.display = 'none';
  }


  showSnapGrid(coords: Coords): void {
    console.log(coords)
    let maxX = coords.left + coords.width
    let maxY = coords.top + coords.height
    this.cols = Math.min(6, Math.ceil(maxX / this.colWidth) + 1);
    this.rows = Math.ceil(maxY / 150);
    let predictedStartRow = Math.floor(coords.top / 150);
    let predictedStartCol = Math.floor(coords.left / this.colWidth);
    let predictedEndCol = Math.ceil(coords.width / (this.colWidth+ 20));
    let predictedEndRow = Math.ceil(coords.height / (this.rowHeight + 20));
    let ghost = (this.$refs.ghost as HTMLDivElement)
    ghost.style.display = 'block';
    ghost.style.top = Math.max(0, ((predictedStartRow * this.rowHeight) + (predictedStartRow * 20) + 10)) + 'px';
    ghost.style.left = ((predictedStartCol * this.colWidth) + (predictedStartCol * 20) + 10) + 'px';
    ghost.style.width = (predictedEndCol * this.colWidth) + (predictedEndCol * 20) - 40 + 'px';
    ghost.style.height = (predictedEndRow * this.rowHeight) + (predictedEndRow * 20) - 40 + 'px';
  }

  hideSnapGrid() {
    this.rows = 0
    this.cols = 0
  }
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
  .grid {
    margin: 20px;
    position: relative;
    .shadowGrid {
      width: fit-content;
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
    }
    .row {
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
      .col {
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
}

</style>
