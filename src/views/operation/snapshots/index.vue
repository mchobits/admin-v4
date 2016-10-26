<template>
  <div class="main">
    <div class="main-title">
      <h2>快照分析</h2>
    </div>
    <div class="filter-bar filter-bar-head">
      <div class="filter-group fl">
        <div class="filter-group-item">
          <x-select width="130px" :label="selectedRule.label" size="small">
            <span slot="label">规则：</span>
            <select v-model="selectedRule" @change="toggleSelectedRule(selectedRule)">
              <option v-for="rule in ruleOptions" :value="rule">{{ rule.label }}</option>
            </select>
          </x-select>
        </div>
        <div class="filter-group-item">
          <radio-button-group :items="dimensions" :value.sync="dimension" @select="setFineness"></radio-button-group>
        </div>
        <div class="filter-group-item ml10">
          <x-select width="130px" :label="selectedDatapoint.label" size="small">
            <span slot="label">数据端点：</span>
            <select v-model="selectedDatapoint" @change="selectDataPoint">
              <option v-for="dp in datapointOptions" :value="dp">{{ dp.label }}</option>
            </select>
          </x-select>
        </div>
      </div>
    </div>
    <div class="panel snapshot-details">
      <div class="panel-bd layout-left">
        <div class="device-list-box">
          <div class="action-bar">
            <search-box :key.sync="query" :active="searching" :placeholder="$t('ui.overview.addForm.search_condi')" @cancel="getDevices(true)" @search-activate="toggleSearching" @search-deactivate="toggleSearching" @search="handleSearch" @press-enter="getDevices(true)">
              <x-select width="100px" :label="queryType.label" size="small">
                <select v-model="queryType">
                  <option v-for="option in queryTypeOptions" :value="option">{{ option.label }}</option>
                </select>
              </x-select>
              <button slot="search-button" @click="getDevices(true)" class="btn"><i class="fa fa-search"></i></button>
            </search-box>
          </div>
          <table class="table table-stripe table-bordered">
            <thead>
              <tr>
                <th class="wp44">设备ID</th>
                <th>设备标识(MAC)</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="device in devices" :class="{'selected': device.selected}" @click="selectedDevice(device)">
                <td>{{ device.id }}</td>
                <td>
                  <div class="text-overflow w110">
                    {{ device.mac }}
                  </div>
                </td>
              </tr>
              <tr v-if="devices.length === 0">
                <td colspan="2" class="tac"><i v-if="$loading" class="fa fa-refresh fa-spin"></i>
                  <div v-else class="tips-null">暂无数据</div>
                </td>
              </tr>
            </tbody>
          </table>
          <pager v-if="total > countPerPage" :total="total" :current="currentPage" :count-per-page="countPerPage" :simple="true" @page-update="onCurrentPageChange"></pager>
        </div>
      </div>
      <div class="panel-bd layout-right">
        <div class="device-details-box">
          <div class="ml10">
            <info-card :info="deviceSummary" :pic="(currentProduct.pics && currentProduct.pics.length) ? currentProduct.pics[0] : ''"></info-card>
          </div>
          <div class="cl-relative">
            <div class="fr mr30">
              <date-time-range-picker @timechange="timechange" :start-offset="timePickerStartOffset" :show-time="true"></date-time-range-picker>
            </div>
            <div class="col-24 over-flow">
              <chart :options="chartOptions" :loading="loading"></chart>
            </div>
          </div>
          <div class="ml10" v-if="stTable && stTable.length">
            <x-table :headers="stHeader" :tables="stTable" :page="stPage" @current-page-change="onStCurrentPageChange" :simple-page="true"></x-table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import { globalMixins } from 'src/mixins'
  import Select from 'components/Select'
  import RadioButtonGroup from 'components/RadioButtonGroup'
  import SearchBox from 'components/SearchBox'
  import DateTimeRangePicker from 'components/DateTimeRangePicker'
  import InfoCard from 'components/InfoCard'
  import Alert from 'components/Alert'
  import Chart from 'components/Chart/index'
  import Pager from 'components/Pager'
  import formatDate from 'filters/format-date'
  import api from 'api'
  import _ from 'lodash'
  import Table from 'components/Table'
  import toFixed from 'filters/to-fixed'

  const FINENESS_TYPE = {
    1: {
      label: '小时',
      value: 1,
      timeOffset: 1
    },
    2: {
      label: '天',
      value: 2,
      timeOffset: 7
    },
    3: {
      label: '周',
      value: 3,
      timeOffset: 30
    },
    4: {
      label: '月',
      value: 4,
      timeOffset: 365
    },
    5: {
      label: '年',
      value: 5,
      timeOffset: 365
    }
  }

  export default {
    name: 'snapshots',

    mixins: [globalMixins],

    vuex: {
      getters: {
        releasedProduct: ({ products }) => products.released
      }
    },

    components: {
      'x-table': Table,
      'x-select': Select,
      'x-alert': Alert,
      RadioButtonGroup,
      DateTimeRangePicker,
      Chart,
      SearchBox,
      InfoCard,
      Pager
    },

    data () {
      return {
        loading: false,
        selectedRule: {
          id: 0,
          label: '请选择统计规则'
        },
        selectedDatapoint: {
          id: 0,
          label: '请选择数据端点'
        },
        statisticsRules: [],
        dataPoints: [],
        dimension: 1,
        dimensions: [],
        xAxis: [],
        series: [],
        devices: [],
        // 搜索框
        query: '',
        searching: false,
        queryTypeOptions: [
          { label: '设备ID', value: 'id' },
          { label: 'MAC', value: 'mac' }
        ],
        queryType: {
          label: 'MAC',
          value: 'mac'
        },
        // 翻页
        total: 0,
        countPerPage: 20,
        currentPage: 1,
        currDevice: {},
        currProductId: '',
        currSnapshotId: '',
        fineness: [],
        dpMode: [],
        startTime: new Date(),
        endTime: new Date(),
        timePickerStartOffset: 7,
        // 统计表格
        stTotal: 0,
        stCountPerPage: 10,
        stCurrentPage: 1,
        stData: [], // 统计数据
        chartX: 30,
        timepickerModified: false,
        stHeader: [
          {
            key: 'date',
            title: '时间'
          },
          {
            key: 'max',
            title: '最大值'
          },
          {
            key: 'min',
            title: '最小值'
          },
          {
            key: 'avg',
            title: '平均值'
          },
          {
            key: 'sum',
            title: '和'
          }
        ]
      }
    },

    computed: {
      stPage () {
        var result = {
          total: this.stTotal,
          currentPage: this.stCurrentPage,
          countPerPage: this.stCountPerPage
        }
        return result
      },
      stTable () {
        return this.stData.slice((this.stCurrentPage - 1) * this.stCountPerPage, (this.stCurrentPage - 1) * this.stCountPerPage + 10)
      },
      currentProduct () {
        if (this.releasedProduct && this.releasedProduct.length) {
          let cur = _.find(this.releasedProduct, (item) => {
            return item.id === this.currProductId
          })
          return cur || {}
        }
        return {}
      },
      // 设备简介
      deviceSummary () {
        return {
          title: this.currDevice.name || this.currentProduct.name,
          online: this.currDevice.is_online || false,
          time: formatDate(this.currDevice.last_login)
        }
      },
      ruleOptions () {
        let res = []
        res.push({
          id: 0,
          label: '请选择统计规则'
        })
        if (this.statisticsRules && this.statisticsRules.length) {
          this.statisticsRules.forEach((item) => {
            res.push({
              id: item.id,
              label: item.name,
              product_id: item.product_id,
              snapshot_id: item.snapshot_id,
              dp_mode: item.dp_mode,
              fineness: item.fineness
            })
          })
        }
        return res
      },
      datapointOptions () {
        let res = []
        res.push({
          id: 0,
          label: '请选择数据端点'
        })
        if (this.dataPoints && this.dataPoints.length) {
          this.dataPoints.forEach((item) => {
            let findDpMode = _.find(this.dpMode, (dp) => {
              return dp.index === item.index
            })
            if (findDpMode) {
              res.push({
                id: item.id,
                label: item.name,
                index: item.index
              })
            }
          })
        }
        return res
      },
      statisticsType () {
        return {
          avg: true,
          sum: true,
          max: false,
          min: false
        }
      },
      // 图例
      legends () {
        return this.series.length > 0 ? _.map(this.series, 'name') : []
      },
      chartOptions () {
        return {
          tooltip: {
            trigger: 'axis'
          },
          grid: {
            x: this.chartX,
            y: 30,
            x2: 30,
            y2: 40
          },
          legend: {
            y: 5,
            data: this.legends
          },
          xAxis: [{
            type: 'category',
            boundaryGap: false,
            data: this.xAxis
          }],
          yAxis: [{
            type: 'value',
            minInterval: 1
          }],
          series: this.series
        }
      },
      // 快照统计规则的搜索条件
      srQueryCondition () {
        let params = {
          offset: 0,
          limit: 10000, // 取所有规则
          product_id: []
        }
        if (this.releasedProduct && this.releasedProduct.length) {
          this.releasedProduct.forEach((item) => {
            params.product_id.push(item.id)
          })
        }
        return params
      },
      // 快照数据端点统计搜索条件
      sdQueryCondition () {
        let params = {
          datapoint: [this.selectedDatapoint.index],
          fineness: this.dimension,
          date_start: new Date(this.startTime.getTime() + 3600 * 8 * 1000),
          date_end: new Date(this.endTime.getTime() + 3600 * 8 * 1000)
        }
        return params
      },
      // 设备列表
      deQueryCondition () {
        var condition = {
          filter: ['id', 'mac', 'is_active', 'active_date', 'is_online', 'last_login', 'name'],
          limit: this.countPerPage,
          offset: (this.currentPage - 1) * this.countPerPage,
          query: {}
        }
        if (this.query.length > 0) {
          condition.query[this.queryType.value] = this.queryType.value === 'id' ? { $in: [Number(this.query)] } : { $like: this.query }
        }
        return condition
      }
    },

    route: {
      data () {
      }
    },

    ready () {
      if (this.releasedProduct && this.releasedProduct.length) {
        this.getStatisticsRules()
      }
    },

    watch: {
      releasedProduct () {
        if (this.releasedProduct && this.releasedProduct.length) {
          this.getStatisticsRules()
        }
      }
    },

    methods: {
      setTimeRange (offset) {
        this.timePickerStartOffset = offset
        let curTime = new Date()
        this.startTime = new Date(curTime.getTime() - 3600 * 24 * 1000 * FINENESS_TYPE[this.dimension].timeOffset)
        this.endTime = curTime
      },
      getDatapoints (productId) {
        api.product.getDatapoints(productId).then((res) => {
          if (res.status === 200 && res.data.length) {
            this.dataPoints = res.data
            this.selectedDatapoint = this.datapointOptions[1]
            this.selectDataPoint()
          } else {
            this.dataPoints = []
          }
        }).catch((res) => {
          this.handleError(res)
        })
      },
      getStatisticsRules () {
        api.snapshot.getAllStatisticRules(this.srQueryCondition).then((res) => {
          if (res.status === 200 && res.data.list && res.data.list.length) {
            this.statisticsRules = res.data.list
            this.selectedRule = this.ruleOptions[1]
            this.toggleSelectedRule(this.selectedRule)
          } else {
            this.statisticsRules = []
          }
        }).catch((res) => {
          this.handleError(res)
        })
      },
      toggleSelectedType (type) {
        console.log(type)
      },
      // 选择规则
      toggleSelectedRule (rule) {
        if (rule.id !== 0) {
          this.fineness = rule.fineness
          this.dpMode = rule.dp_mode
          this.currProductId = rule.product_id
          this.currSnapshotId = rule.snapshot_id
          // 获取产品下设备数据
          this.getDevices(true)
          // 获取产品下的数据端点
          this.getDatapoints(rule.product_id)
          // 设置粒度选项和默认搜索时间
          this.setFinenessOption()
        }
      },
      setFinenessOption () {
        let res = []
        if (this.fineness.length) {
          this.fineness.sort()
          this.fineness.forEach((item) => {
            res.push(FINENESS_TYPE[item])
          })
          this.dimension = res[0] ? res[0].value : ''
          // 设置默认筛选时间
          if (!this.timepickerModified) {
            this.setTimeRange(res[0].timeOffset)
          }
        }
        this.dimensions = res
      },
      toggleSearching () {
        this.searching = !this.searching
      },
      timechange (startDate, endDate) {
        if (!this.timepickerModified) {
          this.timepickerModified = true
        }
        this.startTime = startDate
        this.endTime = endDate
        this.getSnapshotStatistic()
      },
      handleSearch () {
        if (this.query.length === 0) {
          this.getDevices(true)
        }
      },
      // 获取设备列表
      getDevices (reset) {
        if (reset) {
          this.currentPage = 1
        }
        if (!this.currProductId || !this.currProductId) {
          return
        }
        api.device.getList(this.currProductId, this.deQueryCondition).then((res) => {
          if (res.status === 200 && res.data.list && res.data.list.length) {
            res.data.list.map((item) => {
              item.selected = false
            })
            res.data.list[0].selected = true
            this.currDevice = res.data.list[0]
            this.devices = res.data.list
            this.total = res.data.count
            this.getSnapshotStatistic()
          } else {
            this.devices = []
            this.currDevice = {}
            this.total = 0
          }
        }).catch((res) => {
          this.devices = []
          this.currDevice = {}
          this.total = 0
          this.handleError(res)
        })
      },
      /**
       * 处理页码更新
       * @author guohao
       * @param {Number} page 页码
       */
      onCurrentPageChange (page) {
        this.currentPage = page
        this.getDevices()
      },
      onStCurrentPageChange (page) {
        this.stCurrentPage = page
      },
      /**
       * 选择设备
       * @return {[type]} [description]
       */
      selectedDevice (device) {
        this.devices.map((item) => {
          item.selected = false
        })
        device.selected = true
        this.currDevice = device
        this.getSnapshotStatistic()
      },
      getSnapshotStatistic () {
        if (this.currDevice.id && this.currSnapshotId && this.selectedRule.id && typeof this.selectedDatapoint.index === 'number') {
          api.statistics.getSnapshotStatistic(this.currSnapshotId, this.selectedRule.id, this.currDevice.id, this.sdQueryCondition).then((res) => {
            if (res.status === 200 && res.data.list.length) {
              this.dealSnapshot(res.data.list)
            } else {
              this.clearData()
            }
          }).catch((res) => {
            this.handleError(res)
          })
        }
      },
      clearData () {
        this.xAxis = []
        this.series = []
        this.stTotal = 0
        this.stData = []
        this.chartX = 30
      },
      dealSnapshot (snapshots) {
        let avg = {}
        let max = {}
        let min = {}
        let sum = {}
        let statistic = []
        this.series = []
        let maxValue = Number.NEGATIVE_INFINITY // 计算所有值的最大值。调整图标左边距
        snapshots.forEach((item) => {
          let data = []
          switch (item.mode) {
            case 1: // max 最大值
              if (item.value_list.length) {
                item.value_list.forEach((maxItem) => {
                  maxItem.value = toFixed(maxItem.value)
                  max[maxItem.date] = maxItem.value
                  data.push(maxItem.value)
                  if (maxItem.value > maxValue) {
                    maxValue = maxItem.value
                  }
                })
                this.series.push({
                  data: data,
                  type: 'line',
                  name: '最大值'
                })
              }
              break
            case 2: // min 最小值
              if (item.value_list.length) {
                item.value_list.forEach((minItem) => {
                  minItem.value = toFixed(minItem.value)
                  min[minItem.date] = minItem.value
                  data.push(minItem.value)
                  if (minItem.value > maxValue) {
                    maxValue = minItem.value
                  }
                })
                this.series.push({
                  data: data,
                  type: 'line',
                  name: '最小值'
                })
              }
              break
            case 3: // avg 平均值
              if (item.value_list.length) {
                item.value_list.forEach((avgItem) => {
                  avgItem.value = toFixed(avgItem.value)
                  avg[avgItem.date] = avgItem.value
                  data.push(avgItem.value)
                  if (avgItem.value > maxValue) {
                    maxValue = avgItem.value
                  }
                })
                this.series.push({
                  data: data,
                  type: 'line',
                  name: '平均值'
                })
              }
              break
            case 4: // sum 求和
              if (item.value_list.length) {
                item.value_list.forEach((sumItem) => {
                  sumItem.value = toFixed(sumItem.value)
                  sum[sumItem.date] = sumItem.value
                  data.push(sumItem.value)
                  if (sumItem.value > maxValue) {
                    maxValue = sumItem.value
                  }
                })
                this.series.push({
                  data: data,
                  type: 'line',
                  name: '和'
                })
              }
              break
            default:
              break
          }
        })
        let maxLength = Number(maxValue).toString().length
        this.chartX = maxLength * 10 > 200 ? 200 : maxLength * 10
        let finded = _.find(snapshots, (item) => {
          return item.value_list.length > 0
        })
        let xAxis = []
        let formate = ''
        if (this.dimension >= 1 && this.dimension <= 4) {
          formate = 'MM-dd hh:mm'
        } else {
          formate = 'yyyy-MM-dd'
        }
        if (finded) {
          finded.value_list.forEach((item) => {
            statistic.push({
              date: formatDate(item.date),
              max: typeof max[item.date] === 'number' ? max[item.date] : '--',
              min: typeof min[item.date] === 'number' ? min[item.date] : '--',
              avg: typeof avg[item.date] === 'number' ? avg[item.date] : '--',
              sum: typeof sum[item.date] === 'number' ? sum[item.date] : '--'
            })

            xAxis.push(formatDate(item.date, formate))
          })
        }

        this.xAxis = xAxis
        this.stTotal = statistic.length
        this.stData = statistic
      },
      setFineness (value) {
        if (!this.timepickerModified) {
          this.setTimeRange(FINENESS_TYPE[value].timeOffset)
        }
        this.getSnapshotStatistic()
      },
      selectDataPoint () {
        this.getSnapshotStatistic()
      }
    }
  }
</script>

<style lang="stylus">
.mutiple-select
  line-height 26px
  input, label
    vertical-align middle
  label
    margin-right 10px
.snapshot-details
  .layout-left
    width 328px
    float left
    z-index 1
  .layout-right
    width 100%
    padding-left 328px
    box-sizing border-box
  .device-list-box
    margin 20px 20px 20px 0
    box-sizing border-box
    .action-bar
      padding-top 0
    .search-box-input
      width 174px
      overflow hidden
      input
        width 174px
    .table-stripe tbody tr.selected:nth-child(2n+1) td
    .table-stripe tbody tr.selected td
      background #c0252e
      color #fff
    .table-stripe tbody tr.selected:hover td
      background #c0252e
      cursor pointer
    .table-stripe tbody tr:hover td
      background lighten(#000, 93%)
      cursor pointer
  .device-details-box
    padding-top 20px
    margin 0 0 20px 0px
.x-info-card
  &:after
    clear none !important
.info-card
  &:after
    display block !important
.cl-relative
  position relative
.over-flow
  overflow hidden
</style>