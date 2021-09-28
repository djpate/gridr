<template>
  <div class='wid' :id='id' :data-width='width' :data-height='height'>
    <h1 class='dragHandle'>Hello {{ id }}</h1>
    <span class='closeHandle'>X</span>
    <span> {{ counter }}</span>
  </div>
</template>

<script lang="ts">
import { times } from 'lodash';
import { Options, Vue } from 'vue-class-component';
import {Prop} from 'vue-property-decorator'

@Options({})
export default class PlainWidget extends Vue {
  counter = 0

  @Prop() id!: string
  @Prop() width!: number
  @Prop() height!: number

  mounted(): void {
    this.updateCounter()
  }

  updateCounter(): void {
    setTimeout(() => {
      this.counter = this.counter + 1
      this.updateCounter()
    }, 100)
  }
  
}
</script>

<style lang='scss' scoped>

.wid {
  border: 1px solid black;
  height: 100%;
}
.closeHandle {
  position: absolute;
  top: 10px;
  right: 10px;
  cursor: pointer;
}
</style>
