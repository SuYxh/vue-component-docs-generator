<template>
  <section class="home-page"></section>
</template>
<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator'

@Component({})
export default class YourCalssName extends Vue {
  /**
   * @author: 时光@
   * @description: 姓名
   * @param {*} （参数）无
   * @return {*} （返回值）无
   */
  @Prop(String) readonly name!: string | undefined
  // 年龄
  @Prop({ default: 30, type: Number }) private age!: number
  /**
   * 性别，1男 2女
   */
  @Prop([String, Boolean]) private sex!: string | boolean

  cardInfo: string = ''

  family: Object = {}

  @Watch('child')
  onChildChanged(newValue: string, oldValue: string) {
    console.log(newValue, oldValue)
  }

  get compute() {
    return ''
  }

  created() {}

  /**
   * @author: 时光@
   * @description: 更新当前时间
   * @param {*} （参数）无
   * @return {*} （返回值）无
   */
  updateTime() {
    this.$emit('updated')
  }
}
</script>
<style lang="sass" scoped></style>
