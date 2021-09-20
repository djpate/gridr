<template>
  <div class="add">
    <div class="new" @mousedown='addNewWidget'>Some widget</div>
  </div>
  <div class="grid" ref='gridContainer'>
    <div class="shadowGrid">
      <div class="row" v-for='(row, id) in rows' :key='id' >
        <div class="col" v-for='(col, id) in cols' :key='id'></div>
      </div>
    </div>
    <div class="ghost" ref='ghost'></div>
    <Widget v-for='widget in widgets'
            :grid='grid' 
            :widget='widget' 
            :key='widget.id' 
            @snapped='hideSnapGrid' 
            @resizing='showSnapGrid'
            @destroy='removeWidget'>
    </Widget>
  </div>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component';
import Widget from './components/Widget.vue';
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

  grid: Grid  = new Grid(0, 6)
  intentTimeout = 0

  mounted(): void {
    window.addEventListener("resize", this.setColWidth);
    this.setColWidth()
    this.demoSetup()
  }

  get widgets(): GridWidget[] {
    return this.grid.widgets
  }

  setColWidth(): void {
    this.grid!.width = (this.$refs.gridContainer as HTMLDivElement).clientWidth;
  }

  snapped(): void {
    this.hideSnapGrid();
  }

  showSnapGrid(widget: GridWidget): void {
    let placement = this.grid.desiredPlacement(widget)
    if (widget.tentativePlacement?.sameAs(placement)) return 
    clearTimeout(this.intentTimeout)
    widget.tentativePlacement = placement
    this.cols = Math.min(6, placement.col + placement.width + 1)
    this.rows = placement.row + placement.height + 1
    this.displayShadow(placement)
    

    // try to be smart about when to move other widgets when collision will occur
    let mockWidget = new GridWidget(placement)
    let willCollide = this.grid.widgets.map((widget) => widget.collides(mockWidget)).some(Boolean)
    console.log('collision?', willCollide, placement)
    let timeout = willCollide ? 500 : 0
    this.intentTimeout = setTimeout(() => {
      this.grid.updatePlacement(widget, placement)
    }, timeout)
  }

  displayShadow(placement: Placement): void {
    let ghost = (this.$refs.ghost as HTMLDivElement)
    ghost.style.display = 'block';
    ghost.style.top = Math.max(0, ((placement.row * this.grid.rowHeight) + (placement.row * 20) + 10)) + 'px';
    ghost.style.left = ((placement.col * this.grid.columnWidth) + (placement.col * 20) + 10) + 'px';
    ghost.style.width = (placement.width * this.grid.columnWidth) + (placement.width * 20) - 40 + 'px';
    ghost.style.height = (placement.height * this.grid.rowHeight) + (placement.height * 20) - 40 + 'px';
  }

  hideSnapGrid(): void {
    this.rows = 0;
    this.cols = 0;
    (this.$refs.ghost as HTMLDivElement).style.display = 'none';
  }

  removeWidget(id: string): void {
    this.grid!.removeWidget(id)
  }

  addNewWidget(): void {
    let widget = new GridWidget(new Placement(1,1,5,1))
    this.grid!.addWidget(widget)
  }

  demoSetup(): void {
    this.grid.addWidget(new GridWidget(new Placement(0, 0, 3, 2), 3, 2))
    this.grid.addWidget(new GridWidget(new Placement(1, 3, 1, 2)))
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
      display: none;
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
