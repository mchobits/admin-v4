<template>
  <div class="panel-bd">
    <!-- <div class="action-bar">
      <div class="action-group">
        <button @click="addRule(rule)" class="btn btn-success" :disabled="tips" :class="{'disabled': tips}"><i class="fa fa-plus"></i>{{ $t("ui.rule.add_rule") }}</button>
        <div class="fl">
          <a  v-show="tips" v-link="{ path: '/product/create' }" class="nontip">没有产品，点击此处跳转添加页面</a>
          <v-select v-else width="200px" placeholder="请选择产品" :label="currProduct.name">
            <span slot="label">请选择产品：</span>
            <select v-model="currProduct" name="product" @change="Productstatus">
              <option v-for="product in products" :value="product">{{ product.name }}</option>
            </select>
          </v-select>
        </div>
      </div>
    </div> -->
    <div class="filter-bar">
      <div class="filter-group fl">
        <div class="filter-group-item">
          <v-select width="90px" :label="curLevel.label" size="small">
            <span slot="label">告警等级:</span>
            <select v-model="curLevel" name="product">
              <option v-for="level in warningLevels" :value="level">{{ level.label }}</option>
            </select>
          </v-select>
        </div>
      </div>
      <div class="filter-group fr">
        <div class="filter-group-item">
          <search-box :key.sync="key">
            <v-select width="100px" :label="queryType.label" size="small">
              <select v-model="queryType">
                <option v-for="option in queryTypeOptions" :value="option">{{ option.label }}</option>
              </select>
            </v-select>
            <button slot="search-button" @click="" class="btn btn-primary"><i class="fa fa-search"></i></button>
          </search-box>
        </div>
      </div>
    </div>
    <div class="data-table with-loading">
      <div class="icon-loading" v-show="loadingData">
        <i class="fa fa-refresh fa-spin"></i>
      </div>
      <table class="table table-stripe table-bordered">
        <thead>
          <tr>
            <th><input type="checkbox" name="selectAll"></th>
            <th>{{ $t("ui.alert.info_list.content") }}</th>
            <th>设备MAC</th>
            <th>设备ID</th>
            <th>{{ $t("ui.alert.info_list.create_date") }}</th>
            <th>持续时长</th>
            <th>告警等级</th>
            <th>{{ $t("ui.alert.info_list.is_read") }}</th>
            <!-- <th class="tac">{{ $t("common.action") }}</th> -->
          </tr>
        </thead>
        <tbody>
          <template v-if="alerts.length > 0">
            <tr v-for="alert in alerts">
              <td>
                <input type="checkbox" name="selectDone">
              </td>
              <td>
                <!-- <template v-if="alert.tags"><span v-for="tag in alert.tags | toTags" :class="{'text-label-danger':tag==='严重', 'text-label-info':tag==='轻微'}" class="text-label">{{ tag }}</span></template> -->
                <span class="limit-width">{{ alert.content }}</span>
              </td>
              <td></td>
              <td></td>
              <td>{{ alert.create_date | formatDate }}</td>
              <td>1.1h</td>
              <td>
                <span class="text-label-danger level-style">重度</span>
              </td>
              <td><span v-if="alert.is_read" class="hl-gray">{{ $t("common.read") }}</span><span v-else>{{ $t("common.unread") }}</span></td>
              <!-- <td class="tac">
                <button @click="showAlert(alert)" class="btn btn-link btn-mini">{{ $t("common.details") }}</button>
              </td> -->
            </tr>
          </template>
          <tr v-if="alerts.length === 0 && !loadingData">
            <td colspan="8" class="tac">
              <div class="tips-null"><span>{{ $t("common.no_records") }}</span></div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="row">
      <div class="col-4 mark-style">
        <v-select width="120px" :label="markType.label">
          <select v-model="markType">
            <option v-for="option in markTypeOptions" :value="option">{{ option.label }}</option>
          </select>
        </v-select>
      </div>
      <div class="col-20">
        <pager v-if="true" :total="total" :current.sync="currentPage" :count-per-page="countPerPage" @page-update="getAlerts"></pager>
      </div>
    </div>
  </div>
</template>

<script>
  import Vue from 'vue'
  import api from 'src/api'
  import Select from 'components/Select'
  import SearchBox from 'components/SearchBox'
  import locales from 'consts/locales/index'
  import Pager from 'components/Pager'
  import { globalMixins } from 'src/mixins'

  export default {
    name: 'Alert',

    mixins: [globalMixins],

    components: {
      'v-select': Select,
      SearchBox,
      Pager
    },

    data () {
      return {
        alerts: [],
        total: 0,
        markType: {
          value: 0,
          label: '标记为已处理'
        },
        markTypeOptions: [
          {
            value: 0,
            label: '全部'
          },
          {
            value: 1,
            label: '已选中'
          }
        ],
        queryType: {
          value: 0,
          label: 'MAC地址'
        },
        queryTypeOptions: [
          {
            value: 0,
            label: 'MAC地址'
          },
          {
            value: 1,
            label: '设备ID'
          },
          {
            value: 2,
            label: '告警内容'
          }
        ],
        ruleTypes: locales[Vue.config.lang].data.RULE_TYPES,
        rules: [], // 规则列表
        key: '',
        curLevel: {
          value: 0,
          label: '全部'
        },
        warningLevels: [
          {
            value: 0,
            label: '全部'
          },
          {
            value: 1,
            label: '轻微'
          },
          {
            value: 2,
            label: '中等'
          },
          {
            value: 3,
            label: '重度'
          }
        ],
        loadingData: false,
        currentPage: 1,
        countPerPage: 10
      }
    },
    computed: {
      queryCondition () {
        return {
          limit: this.countPerPage,
          offset: (this.currentPage - 1) * this.countPerPage,
          query: {
            product_id: this.$route.params.id
          }
        }
      }
    },
    filters: {
      toTags (value) {
        return value.length ? value.split(',') : []
      }
    },
    ready () {
      this.getAlerts()
    },
    methods: {
      getAlerts () {
        this.loadingData = true
        api.alert.getAlerts(this.queryCondition).then((res) => {
          if (res.status === 200) {
            this.alerts = res.data.list
            this.total = res.data.count
            this.loadingData = false
          }
        }).catch((res) => {
          this.handleError(res)
          this.loadingData = false
        })
      }
    }
  }
</script>

<style lang='stylus' scoped>
@import '../../../../assets/stylus/common'
.limit-width
  display inline-block
  width 400px
  overflow hidden
.level-style
  display inline-block
  width 50px
.mark-style
  padding-top 10px
</style>