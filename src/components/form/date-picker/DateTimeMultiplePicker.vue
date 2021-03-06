<template>
  <div class="date-time-mutiple-picker">
    <div class="radio-group-wrap">
      <radio-button-group :items="periodsInfo" :value.sync="period" @select="periodSelect"><span slot="label" class="label"></span></radio-button-group>
    </div>
    <div class="time-range-picker-wrap">
      <button @click='toggle' class="time-range-show" readonly="readonly">{{timeShowPanel}}
        <span class="fa fa-sort-down ml10"></span>
      </button>
      <div v-show='showChoosePanel' class="time-range-picker-panel" :style="{opacity: opacity}">
        <div class="start-time">
          <span>{{ $t('components.start_time') }}:</span>
          <span class="time">{{startTime | formatDate 'yyyy-MM-dd' true}}</span>
          <a @click.prevent.stop='selectStartTime' class="fa fa-calendar"></a>
        </div>
        <div class="end-time">
          <span>{{ $t('components.end_time') }}:</span>
          <span class="time">{{endTime | formatDate 'yyyy-MM-dd' true}}</span>
          <a @click.prevent.stop='selectEndTime' class="fa fa-calendar"></a>
        </div>
        <div class="choose-submit">
          <button @click='chooseTimeRange'>{{ $t('components.ensure') }}</button>
        </div>
      </div>
      <date-time-picker :open.sync='showTimePicker' @timechange='timeChange' :value='defaultTime' :show-time='false'></date-time-picker>
    </div>
  </div>
</template>

<script>
import formatDate from 'filters/format-date'
import EventListener from 'utils/event-listener'
export default {
  name: 'DateTimeMultiplePicker',
  components: {
  },
  props: {
    label: {
      type: String,
      default: ''
    },
    periods: {
      type: Array,
      default () {
        return []
      }
    },
    defaultPeriod: {
      type: Number,
      defaults: 0
    }
  },
  data () {
    return {
      period: 0,
      showChoosePanel: false,
      showTimePicker: false,
      startTime: new Date(),
      endTime: new Date(),
      picker: 0, // 表示starttime在取值， 1表示endtime在取值,
      defaultTime: new Date(),
      rect: {},
      opacity: 1,
      periodsInfo: []
    }
  },
  computed: {
    timeShowPanel () {
      return formatDate(this.startTime, 'yyyy-MM-dd', true) + ' ~ ' + formatDate(this.endTime, 'yyyy-MM-dd', true) + ' '
    }
  },
  ready () {
    var curTime = new Date()
    if (this.periodsInfo.length <= 0) {
      this.startTime = new Date(curTime.getTime() - 3600 * 24 * 6000)
    }
    this.defaultTime = this.startTime
    this.endTime = curTime
    this._closeEvent = EventListener.listen(window, 'click', this.handleClose)
    this.initPeriods()
  },
  beforeDestroy () {
    if (this._closeEvent) {
      this._closeEvent.remove()
    }
  },
  methods: {
    initPeriods () {
      if (this.periods.length > 0) {
        var res = []
        this.periods.forEach((item) => {
          res.push({
            label: this.locales.data.PERIODS_MAP[item],
            value: item
          })
        })
        if (res.length > 0 && !this.period) {
          if (this.defaultPeriod) {
            this.period = this.defaultPeriod
          } else {
            this.period = res[0].value
          }
          this.periodSelect()
        }

        this.periodsInfo = res
      }
    },
    toggle () {
      this.showChoosePanel = !this.showChoosePanel
    },
    selectStartTime () {
      this.picker = 0
      this.defaultTime = this.startTime
      this.showTimePicker = true
    },
    selectEndTime () {
      this.picker = 1
      this.defaultTime = this.endTime
      this.showTimePicker = true
    },
    timeChange (microtime) {
      var date = new Date(microtime)
      if (this.picker === 0) {
        this.startTime = date
      } else {
        this.endTime = date
      }
    },
    chooseTimeRange () {
      this.period = 0
      this.dispatchTime()
    },
    dispatchTime () {
      this.showChoosePanel = false
      this.$emit('timechange', this.startTime, this.endTime)
    },
    handleClose (e) {
      if (this.$el && !this.$el.contains(e.target)) {
        this.showChoosePanel = false
      }
    },
    adjustTime () {
      this.endTime = new Date()
      if (this.period === 1) { // 当取24小时时,将starttime设置为昨天此刻
        this.startTime = new Date(this.endTime.getTime() - 3600 * 1000 * 24)
      } else { // 其他天数,将starttime设置为(n - 1)天前此刻
        this.startTime = new Date(this.endTime.getTime() - 3600 * 1000 * 24 * this.period)
        this.endTime = new Date(this.endTime.getTime() - 3600 * 1000 * 24)
      }
    },
    periodSelect () {
      this.adjustTime()
      this.$emit('timechange', this.startTime, this.endTime)
    }
  },
  watch: {
    showTimePicker () {
      if (this.showTimePicker) {
        this.opacity = 0
        if (this._closeEvent) {
          this._closeEvent.remove()
        }
      } else {
        this.opacity = 1
        this._closeEvent = EventListener.listen(window, 'click', this.handleClose)
      }
    }
  }
}
</script>

<style lang="stylus" scoped>
@import '../../../assets/stylus/common'

.date-time-mutiple-picker
  display inline-block
  font-size 0
.radio-group-wrap
  display inline-block
  vertical-align middle
  font-size 12px
  margin-right 10px
.time-range-picker-wrap
  height 28px
  display inline-block
  position relative
  vertical-align middle
  font-size 12px
  .time-range-show
    padding 0px 10px
    line-height 26px
    text-align center
    font-size 12px
    background-color #FFF
    border 1px solid default-border-color
    outline none
    span
      line-height 22px
      vertical-align top
  .time-range-picker-panel
    background-color white
    clear both
    z-index 99
    border 1px solid #DEDEDE
    position absolute
    margin 1px 0 0 -101px
    width 200px
    box-sizing border-box
    left 50%
    .start-time, .end-time
      margin 10px 10px 8px 10px
      text-align center
      font-size 12px
      .time
        /*margin-left 5px*/
        padding 0 10px
        display inline-block
        font-size 10px
        border 1px solid #EEEEEE
        background-color #F7F7F7
      a
        margin-left 5px
      span
        cursor text
    .choose-submit
      button
        float right
        margin 0 10px 6px
        font-size 12px
        border none
        background-color #F7F7F7
        border 1px solid #EEEEEE
        outline none
</style>
