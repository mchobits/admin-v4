<template>
  <div class="main">
    <div class="main-title">
      <h2>网点详情</h2>
    </div>
    <breadcrumb :nav="breadcrumbNav"></breadcrumb>
    <div class="panel mt15 mb20 no-split-line">
      <div class="panel-bd row">
        <div class="col-16">
          <div class="account-info ml10">
            <info-card :thumb-hidden="true">
              <h3>{{ info.name }} <a href="#" @click.prevent="editAccount" class="fa fa-edit"></a></h3>
              <div class="desc">
                <span>创建时间：{{ info.create_time | formatDate }}</span>
              </div>
            </info-card>
          </div>
          <div v-stretch="121">
            <info-list :info="accountInfo"></info-list>
          </div>
        </div>
        <div class="col-8 device-map with-loading">
          <div class="icon-loading" v-show="loadingData">
            <i class="fa fa-refresh fa-spin"></i>
          </div>
          <div class="mt10 ml30">
            <!-- <x-map :location="deviceLocation" height="220px"></x-map> -->
            <!-- <div class="device-ip mt5">
              <span v-show="!currVirtualDevice.ip"> 未激活 </span>
              <span v-show="currVirtualDevice.ip">{{ currVirtualDevice.ip }} </span>
              <span v-show="province">{{province}} {{city}}</span>
            </div> -->
          </div>
        </div>
      </div>
    </div>
    <div class="panel">
      <div class="panel-bd">
        <div class="action-bar">
          <button @click="showAddModal = true" class="btn btn-primary"><i class="fa fa-plus"></i>添加客服</button>
        </div>
        <!-- Start: 客服人员列表 -->
        <div class="data-table">
          <!-- Start: 过滤器 -->
          <div class="filter-bar">
            <div class="filter-group fr">
              <div class="filter-group-item">
                <search-box :key.sync="key" :active="searching" :placeholder="'请输入关键字'" @cancel="getBranchStaffsList(true)" @search-activate="toggleSearching" @search-deactivate="toggleSearching" @search="handleSearch" @press-enter="getBranchStaffsList(true)">
                  <x-select width="90px" :label="queryType.label" size="small">
                    <select v-model="queryType">
                      <option v-for="option in queryTypeOptions" :value="option" :selected="$index===0">{{ option.label }}</option>
                    </select>
                  </x-select>
                  <button slot="search-button" class="btn" @click="getBranchStaffsList"><i class="fa fa-search"></i></button>
                </search-box>
              </div>
            </div>
            <div class="filter-group">
              <div class="filter-group-item">
                <x-select width="120px" size="small" :label="statusOptions[status.value].label">
                  <label slot="label">状态</label>
                  <select v-model="status" :status.sync="" @change="getBranchStaffsList(true)">
                    <option v-for="option in statusOptions" :value="option" :selected="option.value===2">{{option.label}}</option>
                  </select>
                </x-select>
              </div>
            </div>
          </div>
          <!-- End: 过滤器 -->
          <table class="table table-stripe table-bordered">
            <thead>
              <tr>
                <th>姓名</th>
                <th>手机</th>
                <th>邮箱</th>
                <th>最后一次登陆</th>
                <th>状态</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="staff in staffs">
                <td>
                  <a v-link="{path: '/operation/plugins/warranty/' + $route.params.app_id + '/accounts/' + this.$route.params.id + '/staffs/' + staff._id}" class="hl-red">{{ staff.name }}</a>
                </td>
                <td>{{ staff.phone }}</td>
                <td>{{ staff.email }}</td>
                <td>{{ staff.online_date | formatDate 'yyyy-MM-dd' true }}</td>
                <td v-if="staff.status-0 === 0">
                  <span class="hl-gray">已停用</span>
                </td>
                <td v-else>正常</td>
              </tr>
              <tr v-if="loadingData">
                <td colspan="5" class="tac">
                  <div class="tips-null"><i class="fa fa-refresh fa-spin"></i><span>{{ $t("common.data_loading") }}</span></div>
                </td>
              </tr>
              <tr v-if="staffs.length === 0">
                <td colspan="5" class="tac"><i v-if="$loadingRouteData" class="fa fa-refresh fa-spin"></i>
                  <div v-else class="tips-null">{{ $t("common.no_records") }}</div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <!-- End: 客服人员列表 -->

        <!-- Start: 分页信息 -->
        <!-- <pagination :total="51" :current.sync="0" :count-per-page="10"></pagination> -->
        <pagination v-if="total > countPerPage" :total="total" :current.sync="currentPage" :count-per-page="countPerPage" @page-update="getBranchStaffsList"></pagination>
        <!-- End: 分页信息 -->
      </div>
    </div>
    <!-- start: 添加客服 -->
    <modal :show.sync="showAddModal" width="600px">
      <h3 slot="header">添加客服</h3>
      <div slot="body" class="form">
        <form autocomplete="off" v-form name="addValidation" @submit.prevent="onAddSubmit" hook="addStaffHook">
          <div class="form-row row">
            <label class="form-control col-6">姓名:</label>
            <div class="controls col-18">
              <div class="input-text-wrap">
                <input v-model="addModel.name" type="text" v-form-ctrl name="staff" required lazy class="input-text"/>
              </div>
              <div v-if="addValidation.$submitted && addValidation.staff.$pristine" class="form-tips form-tips-error"><span v-if="addValidation.staff.$error.required">*必须</span></div>
              <div v-if="addValidation.staff.$dirty" class="form-tips form-tips-error"><span v-if="addValidation.staff.$error.required">*必须</span></div>
            </div>
          </div>

          <div class="form-row row">
            <label class="form-control col-6">邮箱地址:</label>
            <div class="controls col-18">
              <div class="input-text-wrap">
                <input v-model="addModel.email" type="email" v-form-ctrl name="email" required lazy class="input-text"/>
              </div>
              <div v-if="addValidation.$submitted && addValidation.email.$pristine" class="form-tips form-tips-error"><span v-if="addValidation.email.$error.required">*必须</span></div>
              <div v-if="addValidation.email.$dirty" class="form-tips form-tips-error"><span v-if="addValidation.email.$error.required">*必须</span></div>
            </div>
          </div>

          <div class="form-row row">
            <label class="form-control col-6">联系电话:</label>
            <div class="controls col-18">
              <div class="input-text-wrap">
                <input v-model="addModel.phone" type="text" :pattern="patterns.PHONE" v-form-ctrl name="phone" required lazy class="input-text"/>
              </div>
              <div v-if="addValidation.$submitted && addValidation.phone.$pristine" class="form-tips form-tips-error"><span v-if="addValidation.phone.$error.required">*必须</span></div>
              <div v-if="addValidation.phone.$dirty" class="form-tips form-tips-error"><span v-if="addValidation.phone.$error.required">*必须</span></div>
            </div>
          </div>

          <div class="form-row row">
            <label class="form-control col-6">登陆密码:</label>
            <div class="controls col-18">
              <div class="input-text-wrap">
                <input v-model="addModel.password" type="text" v-form-ctrl name="password" required lazy class="input-text"/>
              </div>
              <div v-if="addValidation.$submitted && addValidation.password.$pristine" class="form-tips form-tips-error"><span v-if="addValidation.password.$error.required">*必须</span></div>
              <div v-if="addValidation.password.$dirty" class="form-tips form-tips-error"><span v-if="addValidation.password.$error.required">*必须</span></div>
            </div>
          </div>
          <div class="form-row row">
            <div class="controls col-18 col-offset-6">
              <div class="checkbox-group">
                <label class="checkbox">
                  <input type="checkbox" v-model="addModel.status">启用
                </label>
              </div>
            </div>
          </div>
          <!-- <x-select :label="addCustomOptions[addModel.status].label" width="120px">
            <label slot="label">状态</label>
            <select v-model="addModel.status" name="status">
              <option v-for="customOption in addCustomOptions" :value="customOption.value">{{customOption.label}}</option>
            </select>
          </x-select> -->

          <div class="form-actions">
            <button type="submit" :disabled="false" :class="{'disabled':adding}" v-text="adding ? $t('common.handling') : $t('common.ok')" class="btn btn-primary"></button>
            <button @click.prevent.stop="onAddCancel" class="btn btn-default">{{ $t("common.cancel") }}</button>
          </div>
        </form>
      </div>
    </modal>
    <!-- end -->

    <!-- start 编辑网点 -->
    <modal :show.sync="showEditModal" width="600px">
      <h3 slot="header">编辑网点</h3>
      <div slot="body" class="form">
        <form autocomplete="off" v-form name="editValidation" @submit.prevent="onEditSubmit" hook="editStaffHook">
          <div class="form-row row">
            <label class="form-control col-6">网点名称:</label>
            <div class="controls col-18">
              <div class="input-text-wrap">
                <input v-model="editModal.name" type="text" v-form-ctrl name="branch" required lazy class="input-text"/>
              </div>
              <div v-if="editValidation.$submitted && editValidation.branch.$pristine" class="form-tips form-tips-error"><span v-if="editValidation.branch.$error.required">*必须</span></div>
              <div v-if="editValidation.branch.$dirty" class="form-tips form-tips-error"><span v-if="editValidation.branch.$error.required">*必须</span></div>
            </div>
          </div>
          <div class="form-row row">
            <label class="form-control col-6">负责人:</label>
            <div class="controls col-18">
              <div class="input-text-wrap">
                <input v-model="editModal.director" type="text" v-form-ctrl name="director" required lazy class="input-text"/>
              </div>
              <div v-if="editValidation.$submitted && editValidation.director.$pristine" class="form-tips form-tips-error"><span v-if="editValidation.director.$error.required">*必须</span></div>
              <div v-if="editValidation.director.$dirty" class="form-tips form-tips-error"><span v-if="editValidation.director.$error.required">*必须</span></div>
            </div>
          </div>
          <div class="form-row row">
            <label class="form-control col-6">联系号码:</label>
            <div class="controls col-18">
              <div class="input-text-wrap">
                <input v-model="editModal.phone" type="text" :pattern="patterns.PHONE" v-form-ctrl name="phone" required lazy class="input-text"/>
              </div>
              <div v-if="editValidation.$submitted && editValidation.phone.$pristine" class="form-tips form-tips-error"><span v-if="editValidation.phone.$error.required">*必须</span></div>
              <div v-if="editValidation.phone.$dirty" class="form-tips form-tips-error"><span v-if="editValidation.phone.$error.required">*必须</span></div>
            </div>
          </div>
          <div class="form-row row">
            <label class="form-control col-6">邮箱地址:</label>
            <div class="controls col-18">
              <div class="input-text-wrap">
                <input v-model="editModal.email" type="email" v-form-ctrl name="email" required lazy class="input-text"/>
              </div>
              <div v-if="editValidation.$submitted && editValidation.email.$pristine" class="form-tips form-tips-error"><span v-if="editValidation.email.$error.required">*必须</span></div>
              <div v-if="editValidation.email.$dirty" class="form-tips form-tips-error"><span v-if="editValidation.email.$error.required">*必须</span></div>
            </div>
          </div>
          <div class="form-row row">
            <label class="form-control col-6">详细地址:</label>
            <div class="controls col-18">
              <div class="input-text-wrap">
                <input v-model="editModal.address" type="text" v-form-ctrl name="address" required lazy class="input-text"/>
              </div>
              <div v-if="editValidation.$submitted && editValidation.address.$pristine" class="form-tips form-tips-error"><span v-if="editValidation.address.$error.required">*必须</span></div>
              <div v-if="editValidation.address.$dirty" class="form-tips form-tips-error"><span v-if="editValidation.address.$error.required">*必须</span></div>
            </div>
          </div>

          <div class="form-actions">
            <label class="del-check">
              <input type="checkbox" name="del" v-model="delChecked"/>删除网点
            </label>
            <button type="submit" :disabled="editing" :class="{'disabled':editing}" v-text="editing ? $t('common.handling') : $t('common.ok')" class="btn btn-primary"></button>
            <button @click.prevent.stop="onEditCancel" class="btn btn-default">{{ $t("common.cancel") }}</button>
          </div>
        </form>
      </div>
    </modal>
    <!-- end  -->
  </div>
</template>

<script>
import { pluginMixins } from '../../mixins'
import { warrantyMixins } from '../mixins'
import api from 'api'
import * as config from 'consts/config'

export default {
  name: 'AccountDetails',

  mixins: [pluginMixins, warrantyMixins],

  data () {
    return {
      token: JSON.parse(window.localStorage.pluginsToken)[this.$route.params.app_id].token,
      info: {},
      key: '',
      staffs: [],
      showAddModal: false,
      showEditModal: false,
      editModal: {
        // name: '',
        // charge: '',
        // tel: '',
        // email: '',
        // area: {},
        // addr: ''
      },
      status: {
        label: '全部',
        value: 0
      },
      statusOptions: [{
        label: '停用',
        value: 0
      }, {
        label: '启用',
        value: 1
      }, {
        label: '全部',
        value: 2}
      ],
      addCustomOptions: [{
        label: '启用',
        value: 0
      }, {
        label: '停用',
        value: 1}
      ],
      adding: false,
      editing: false,
      addValidation: {},
      editValidation: {},
      addModel: {
        name: '',
        username: '',
        branch_id: '',
        creator: '',
        password: '',
        phone: '',
        email: '',
        create_time: '',
        status: 1
      },
      total: 0,
      currentPage: 1,
      countPerPage: config.COUNT_PER_PAGE,
      delChecked: false,
      query: {},
      loadingData: false,
      loadingStaffs: false,
      originAddModel: {},
      originEditModel: {},
      queryTypeOptions: [
        { label: '姓名', value: 'name' },
        { label: '邮箱', value: 'email' },
        { label: '手机', value: 'phone' }
      ],
      queryType: {
        label: '姓名',
        value: 'name'
      },
      searching: false,
      breadcrumbNav: [{
        label: '全部',
        link: `/operation/plugins/warranty/${this.$route.params.app_id}/accounts`
      }, {
        label: '网点详情'
      }]
    }
  },

  components: {
  },

  ready () {
    this.getBranchList()
    this.getBranchStaffsList()
  },

  computed: {
    accountInfo () {
      return {
        director: {
          label: '负责人',
          value: this.info.director
        },
        phone: {
          label: '联系电话',
          value: this.info.phone
        },
        location: {
          label: '所在地区',
          value: `${this.info.province}${this.info.city}${this.info.district}`
        },
        address: {
          label: '详细地址',
          value: this.info.address
        }
      }
    },
    queryCondition () {
      var condition = {
        limit: this.countPerPage,
        offset: (this.currentPage - 1) * this.countPerPage,
        order: {},
        query: {
          branch_id: this.$route.params.id
        }
      }
      if (this.key.length > 0) {
        condition.query[this.queryType.value] = {$regex: this.key, $options: 'i'}
        // condition.query[this.queryType.value] = { $like: this.key }
      }
      if (this.status.value !== 2) {
        condition.query.status = this.status.value
      }
      // if (this.key !== '') {
      //   condition.query.name = this.key
      // }
      return condition
    }
  },
  route: {
    data () {
      this.originAddModel = _.clone(this.addModel)
    }
  },
  methods: {
    // 获取网点信息
    getBranchList () {
      // token 不存在，无权限访问
      if (!this.token) {
        this.showNoTokenError()
        return
      }

      var condition = {
        limit: this.countPerPage,
        offset: (this.currentPage - 1) * this.countPerPage,
        order: {},
        query: {
          _id: this.$route.params.id
        }
      }
      api.warranty.getBranchList(this.$route.params.app_id, condition).then((res) => {
        this.info = res.data.list[0] || {}
      }).catch((err) => {
        this.handleError(err)
      })
    },
    // 获取维修点员工列表
    getBranchStaffsList () {
      // token 不存在，无权限访问
      if (!this.token) {
        this.showNoTokenError()
        return
      }

      api.warranty.getBranchStaffsList(this.$route.params.app_id, this.queryCondition).then((res) => {
        this.staffs = res.data.list
        this.total = res.data.count
        this.loadingData = false
      }).catch((err) => {
        this.handleError(err)
        this.loadingData = false
      })
    },
    // 添加网点表单钩子
    addStaffHook (form) {
      this.addForm = form
    },
    // 编辑网点表单钩子
    editStaffHook (form) {
      this.editForm = form
    },
    resetAdd () {
      this.adding = false
      this.showAddModal = false
      this.addModel = _.clone(this.originAddModel)
      this.$nextTick(() => {
        this.addForm.setPristine()
      })
    },
    // 关闭编辑浮层并净化编辑表单
    resetEdit () {
      this.editing = false
      this.showEditModal = false
      this.delChecked = false
      setTimeout(() => {
        this.editModel = this.originEditModel
      }, 1000)
    },
    // 取消添加
    onAddCancel () {
      this.resetAdd()
    },
    // 取消编辑
    onEditCancel () {
      this.resetEdit()
      // this.product = this.originEditModel
    },
    // 切换搜索
    toggleSearching () {
      this.searching = !this.searching
    },
    // 搜索
    handleSearch () {
      if (this.query.length === 0) {
        this.getBranchStaffsList()
      }
    },
    // 添加操作
    onAddSubmit () {
      // token 不存在，无权限访问
      if (!this.token) {
        this.showNoTokenError()
        return
      }

      if (this.addValidation.$valid && !this.adding) {
        this.adding = true
        this.addModel.status = this.addModel.status - 0
        this.addModel.branch_id = this.$route.params.id
        this.addModel.username = this.addModel.email
        this.addModel.create_time = new Date()
        api.warranty.AddBranchStaffs(this.$route.params.app_id, this.addModel).then((res) => {
          this.adding = false
          this.showAddModal = false
          this.getBranchStaffsList()
          this.resetAdd()
        }).catch((err) => {
          this.handleError(err)
          this.adding = false
        })
      }
    },
    editAccount () {
      // token 不存在，无权限访问
      if (!this.token) {
        this.showNoTokenError()
        return
      }

      var condition = {
        limit: this.countPerPage,
        offset: (this.currentPage - 1) * this.countPerPage,
        order: {},
        query: {
          _id: this.$route.params.id
        }
      }
      api.warranty.getBranchList(this.$route.params.app_id, condition).then((res) => {
        this.editModal = res.data.list[0] || {}
      }).catch((err) => {
        this.handleError(err)
        this.loadingData = false
      })
      this.showEditModal = true
    },

    // 提交编辑表单
    onEditSubmit () {
      // token 不存在，无权限访问
      if (!this.token) {
        this.showNoTokenError()
        return
      }

      if (this.delChecked && !this.editing) { // 删除
        this.editing = true
        // console.log(this.$route.params.id)
        api.warranty.deleteBranch(this.$route.params.app_id, this.$route.params.id).then((res) => {
          this.editing = false
          this.showEditModal = false
          this.$route.router.replace('/operation/plugins/warranty/' + this.$route.params.app_id + '/accounts')
        }).catch((err) => {
          this.handleError(err)
          this.editing = false
        })
      } else if (this.editValidation.$valid && !this.editing) { // 更新
        this.editing = true
        api.warranty.UpdateBranch(this.$route.params.app_id, this.editthis.$route.params.id).then((res) => {
          if (res.status === 200) {
            this.resetEdit()
            this.getBranchList()
          }
        }).catch((err) => {
          this.handleError(err)
          this.editing = false
        })
      }
    }
  }
}
</script>
