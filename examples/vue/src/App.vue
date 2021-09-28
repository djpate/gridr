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
      width: random(1,2),
      height: random(1, 3)
    }
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
    transition-property: width, height, top, left;
    transition-duration: .2s;
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
      z-index: 10;
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
  &.moving {
    .widget_container {
      &.snapped {
        opacity: 0.7;
      }
    };
  }
}
}

</style>
