<template>
  <div class='card h-100' :id='id' :data-width='width' :data-min-width='minWidth' :data-height='height' :data-ratio='ratio' :data-min-height='minHeight'>
    <div class="card-body h-100">
      <h5 class="card-title dragHandle">Widget ID: {{id}}</h5>
      <span class='closeHandle'>X</span>
      <span> {{ counter }}</span>
    </div>
  </div>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component';
import {Prop } from 'vue-property-decorator'
import { Widget } from '../../../../src/lib/widget';

@Options({})
export default class PlainWidget extends Vue {
  counter = 0
  widget: Widget | undefined

  @Prop() id!: string
  @Prop() width!: number
  @Prop() height!: number
  @Prop({default: false}) ratio!: number
  @Prop({default: 1}) minHeight!: number
  @Prop({default: 1}) minWidth!: number

  mounted(): void {
    this.updateCounter()
    this.$el.addEventListener('widgetized', (event: CustomEvent) => {
      this.widget = event.detail.widget as Widget
      this.widget.element.addEventListener('resized', (event: CustomEvent) => {
        console.log('resized')
      })
    })
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
