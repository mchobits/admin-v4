<template>
  <div class="row">
    <div class="col" :class="containerClass">
      <div :class="classes">
        <div :class="'fa fa-' + icon"></div>
        <div class="x-alert-cont">
          <div class="x-alert-inner">
            <h2 v-if="title">{{ title }}</h2>
            <slot></slot>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'Alert',

    props: {
      // 占据列宽
      cols: {
        type: Number,
        default: 8
      },

      // 标题
      title: {
        type: String
      },

      // 类型
      type: {
        type: String,
        default: 'info'
      },

      // 类前缀
      classPrefix: {
        type: String,
        default: 'x-alert'
      }
    },

    data () {
      return {
      }
    },

    computed: {
      // 类
      classes () {
        var result = [this.classPrefix]

        if (this.type) {
          result.push(`${this.classPrefix}-${this.type}`)
        }

        return result.join(' ')
      },

      // 图标
      icon () {
        return ({
          'success': 'check-circle',
          'info': 'info-circle',
          'warning': 'exclamation-triangle',
          'error': 'times-circle'
        })[this.type] || ''
      },

      // 容器样式
      containerClass () {
        return `col-${this.cols} col-offset-${Math.round((24 - this.cols) / 2)}`
      }
    }
  }
</script>

<style lang="stylus">
  @import '../../../assets/stylus/common'

  .x-alert
    position relative
    padding-left 50px
    margin 80px 0

    .fa
      absolute left top
      size 36px
      font-size 36px
      text-align center

    h2
      font-size 18px
      margin 0 0 5px
      font-weight normal

    p
      margin 0

    .x-alert-cont
      min-height 36px
      display table
      width 100%

      .x-alert-inner
        display table-cell
        vertical-align middle

    .actions
      margin-top 30px

      .btn
        height 36px
        line-height 36px
        font-size 14px
        width 80px
        text-align center

  .x-alert-error
    .fa
      color red

  .x-alert-success
    .fa
      color green

  .x-alert-info
    .fa
      color blue

  .x-alert-warning
    .fa
      color #F6D14C
</style>
