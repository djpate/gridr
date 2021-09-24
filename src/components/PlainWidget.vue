<template>
  <div :id='id' :data-width='width' :data-height='height'>
    <h1 class='dragHandle'>Hello {{ id }}</h1>
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

  mounted() {
    this.updateCounter()
  }

  updateCounter() {
    setTimeout(() => {
      this.counter = this.counter + 1
      this.updateCounter()
    }, 100)
  }
  
}
</script>

<style lang='scss' scoped>
</style>
