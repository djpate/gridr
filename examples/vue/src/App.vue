<template>
  <div class="container">
    <div class="row">
      <div class="col">
         <div class="actions">
          <div class="add">
            <div class="new" @mousedown='addNewWidget'>Some widget</div>
          </div>
          <div class="trash">
            <span>Trash</span>
          </div>
        </div>
      </div>
    </div>
    <div class="row">
      <div class="col">
        <div id="grid">
          <Widget class="widget" v-for='(value, name) in widgets' :width='value.width' :height='value.height' :minWidth='value.minWidth' :minHeight='value.minHeight' :ratio='value.ratio' :id='name' :key='name'></Widget>
        </div>
      </div>
    </div>
  </div>
  <footer>FOOTER</footer>
</template>

<script lang="ts">
import { random, uniqueId } from 'lodash';
import { Options, Vue } from 'vue-class-component';
import Widget from './components/PlainWidget.vue';
import { Grid } from '../../../src/lib/grid';
import 'bootstrap/dist/css/bootstrap.css'

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
    },
    [uniqueId()]: {
      width: 2,
      height: 2,
      minWidth: 2,
      minHeight: 2,
      ratio: true
    }
  }

  grid!: Grid
  intentTimeout = 0

  mounted(): void {
    this.grid = new Grid('grid', 6)
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
  .actions {
    display: flex;
    margin-bottom: 20px;
    .add {
      margin-right: 20px;
      user-select: none;
      .new {
        border: 1px solid black;
        height: 100px;
        width: 250px;
        cursor: grab;
      }
    }
    .trash {
      margin: 0 20px;
      user-select: none;
      border: 1px solid black;
      height: 100px;
      width: 250px;
    }
  }
}

</style>
