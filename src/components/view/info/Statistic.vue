<template>
  <div :class="classes">
    <!-- 按钮区域 -->
    <div class="action" v-if="hasAction">
      <slot name="action"></slot>
    </div>
    <div class="tit" v-if="titletop">{{ title }}<i class="fa fa-question-circle" v-tooltip="tooltip" v-if="tooltip"></i></div>

    <div class="info" v-if="animated" v-animated-number="total"></div>
    <div class="info" v-else>{{ total }}</div>

    <div class="unit" v-if="totalUnit">{{totalUnit}}</div>
    <div class="change" v-if="change !== 0" :class="{'decrease': change < 0}">
      <i class="fa" :class="{'fa-long-arrow-up': change > 0, 'fa-long-arrow-down': change < 0}"></i>
      <span v-if="animated" v-animated-number="change"></span>
      <span v-else>{{ change }}</span>
      <span v-if="changeUnit">{{changeUnit}}</span>
      <span class="ml10" v-if="showchange">{{ percentage }}</span>
    </div>
    <div class="tit" v-if="!titletop">{{ title }}<slot name="tips"></slot><i class="fa fa-question-circle" v-tooltip="tooltip" v-if="tooltip"></i></div>
    <div class="target" v-if="hasTarget">
      <slot name="targetArea"></slot>
    </div>
    <div :class="{'tac': align==='center'}">
      <div class="chart" v-if="hasChart">
        <slot></slot>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Statistic',

  props: {
    // 标题
    title: {
      type: String,
      default: ''
    },

    // 标题提示说明
    tooltip: {
      type: String,
      default: ''
    },

    // 总量
    total: {
      default: 0
    },

    // 总量单位
    totalUnit: {
      type: String,
      default: ''
    },

    // 变化
    change: {
      default: 0
    },

    // 变化单位
    changeUnit: {
      type: String,
      default: ''
    },

    // 对齐方式
    align: {
      type: String,
      default: 'left'
    },

    // 配色
    color: {
      type: String,
      default: ''
    },

    // 类前缀
    classPrefix: {
      type: String,
      default: 'x-statistic'
    },

    // 行内显示
    inline: {
      type: Boolean,
      default: false
    },

    // 标题显示在上或者下
    titletop: {
      type: Boolean,
      default: false
    },

    // 是否带图表
    hasChart: {
      type: Boolean,
      default: false
    },

    // 是否带事件
    hasAction: {
      type: Boolean,
      default: false
    },

    // 是否带目标
    hasTarget: {
      type: Boolean,
      default: false
    },

    // 是否显示变化百分比
    showchange: {
      type: Boolean,
      default: false
    },

    // 保留小数点后多少位
    digits: {
      type: Number,
      default: 2
    },

    // 是否播放动画
    animated: {
      type: Boolean,
      default: true
    }
  },

  computed: {
    // 类
    classes () {
      var result = [this.classPrefix]

      if (this.inline) {
        result.push(`${this.classPrefix}-inline`)
      }

      if (this.align) {
        result.push(`${this.classPrefix}-${this.align}`)
      }

      if (this.color) {
        result.push(`${this.classPrefix}-${this.color}`)
      }

      return result.join(' ')
    },

    percentage () {
      let result = 0

      if (!isNaN(this.total)) {
        result = Math.abs(this.change / (this.total || 1) * 100).toFixed(this.digits) + '%'
      }
      return result
    }
  }
}
</script>

<style lang="stylus">
@import '../../../assets/stylus/common'

.x-statistic
  text-align center
  padding 15px
  box-sizing border-box
  position relative

  & > .tit
  & > .info
  & > .unit
    color gray-dark

  & > .tit
    /*font-weight bold*/

    .fa
      margin-left 4px

  & > .info
  & > .unit
    /*font-size 42px
    font-family 'PingFangSC-Ultralight', 'PingFang SC Ultralight', 'PingFang SC', arial*/
    font-size 36px
    font-weight 100

  & > .change
    absolute right 15px top 5px
    color green
    white-space nowrap
    font-size 0

    span
      font-size 12px

    .fa
      font-size 12px
      margin-right 2px
      font-size 13px

    &.decrease
      color red

  .chart
    display inline-block
    size 150px 40px

.x-statistic-left
  text-align left
  padding 5px 15px 15px 40px
  & > .tit
    color gray-light

  & > .info
  & > .unit
  & > .change
    display inline-block

.x-statistic-gray
  & > .tit
  & > .info
  & > .unit
    color gray-dark

.x-statistic-green
  & > .tit
  & > .info
  & > .unit
    color green

.x-statistic-blue
  & > .tit
  & > .info
  & > .unit
    color blue

.x-statistic-orange
  & > .tit
  & > .info
    color orange

.x-statistic-inline
  text-align left
  max-width 200px
  margin 0 auto

  .tit
    absolute right 15px bottom 25px
    font-size 12px

.statistic-group
  border-bottom 1px solid default-border-color

.col-6 + .col-6
.col-8 + .col-8
  .x-statistic
    &:after
      absolute left top 15%
      size 1px 70%
      content ''
      background #E5E5E5
.target
  font-size 10px!important
  color #307fc1
  .change-reduse
    color red
  .change-increase
    color green
.action
  position absolute
  right 10px
  top 10px
</style>
