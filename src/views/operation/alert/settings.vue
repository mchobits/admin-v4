<template>
  <div class="main">
    <div class="main-title">
      <h2>告警规则设置</h2>
    </div>
    <div class="tool-bar">
      <div class="tool-list">
        <div class="tool-list-item">
          <div class="trigger" @click="addRule(rule)"><i class="fa fa-plus"></i><span class="trigger-text">{{ $t("ui.rule.add_rule") }}</span></div>
        </div>
      </div>
    </div>
    <div class="panel">
      <div class="panel-bd">
        <div class="data-table with-loading">
          <div class="icon-loading" v-show="loadingData">
            <i class="fa fa-refresh fa-spin"></i>
          </div>
          <div class="filter-bar">
            <div class="filter-group">
              <x-select width="160px" placeholder="请选择产品" size="small" :label="currProduct.name">
                <span slot="label">产品：</span>
                <select v-model="currProduct" name="product" @change="Productstatus">
                  <option v-for="product in products" :value="product">{{ product.name }}</option>
                </select>
              </x-select>
            </div>
          </div>
          <table class="table table-stripe table-bordered">
            <thead>
              <tr>
                <th>{{ $t("ui.rule.fields.name") }}</th>
                <th>{{ $t("ui.rule.fields.type") }}</th>
                <th>{{ $t("ui.rule.fields.content") }}</th>
                <th>{{ $t("common.status") }}</th>
                <th class="tac">{{ $t("common.action") }}</th>
              </tr>
            </thead>
            <tbody>
              <template v-if="rules.length > 0">
                <tr v-for="rule in rules">
                  <td>{{* rule.name }}</td>
                  <td>{{* rule.type | ruleLabel }}</td>
                  <td>{{* rule.content }}</td>
                  <td><span v-if="rule.is_enable" class="hl-green">{{ $t("common.enable") }}</span><span v-else class="hl-gray">{{ $t("common.disabled") }}</span></td>
                  <td class="tac">
                    <button @click="editRule(rule)" class="btn btn-link btn-mini">{{ $t("common.edit") }}</button>
                  </td>
                </tr>
              </template>
              <tr v-if="rules.length === 0">
                <td colspan="5" class="tac">
                  <div class="tips-null"><i class="fa fa-exclamation-circle"></i> <span>{{ $t("common.no_records") }}</span></div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <!-- 分页-->
        <!-- <pagination v-if="rules.length > countPerPage" :total="rules.length" :current.sync="currentPage" :count-per-page="countPerPage"></pagination> -->
      </div>
    </div>

    <!-- Start: 添加规则浮层 -->
    <modal :show.sync="addModal.show" width="670px" :flag="addModal.editingTag" @close="onAddCancel">
      <h3 slot="header">{{ $t("ui.rule.add_rule") }}</h3>
      <div slot="body" class="form form-rules">
        <form autocomplete="off" v-form name="addValidation" @submit.prevent="onAddSubmit" hook="addFormHook">
          <div class="form-row row">
            <label class="form-control col-5">产品:</label>
            <div class="controls col-19">
              <x-select v-else width="200px" placeholder="请选择产品" :label="addProduct.name">
                <select v-model="addProduct" name="addproduct" @change="addProductstatus">
                  <option v-for="product in products" :value="product">{{ product.name }}</option>
                </select>
              </x-select>
            </div>
          </div>
          <div class="form-row row">
            <label class="form-control col-5">{{ $t("ui.rule.fields.name") }}:</label>
            <div class="controls col-19">
              <div v-placeholder="$t('ui.rule.placeholders.name')" class="input-text-wrap">
                <input v-model="addModal.model.name" type="text" v-form-ctrl name="name" required minlength="2" maxlength="32" lazy class="input-text"/>
              </div>
              <div v-if="addValidation.$submitted && addValidation.name.$pristine" class="form-tips form-tips-error"><span v-if="addValidation.name.$error.required">{{ $t('common.validation.required', {field: $t('ui.rule.fields.name')}) }}</span></div>
              <div v-if="addValidation.name.$dirty" class="form-tips form-tips-error"><span v-if="addValidation.name.$error.required">{{ $t('common.validation.required', {field: $t('ui.rule.fields.name')}) }}</span><span v-if="addValidation.name.$error.minlength">{{ $t('common.validation.minlength', [$t('ui.rule.fields.name'), 2]) }}</span><span v-if="addValidation.name.$error.maxlength">{{ $t('common.validation.maxlength', [ $t('ui.rule.fields.name'), 32]) }}</span></div>
            </div>
          </div>
          <div class="form-row row">
            <label class="form-control col-5">{{ $t("ui.rule.condition") }}:</label>
            <div class="controls col-19">
              <div class="row">
                <div class="col-5">
                  <x-select :label="ruleTypes[addModal.model.type-1]">
                    <select v-model="addModal.model.type" v-form-ctrl name="type" number @input="onSelectType">
                      <option v-for="type in ruleTypes" :value="$index+1" :selected="$index===0">{{ type }}</option>
                    </select>
                  </x-select>
                </div>
                <div class="col-19" v-show="addModal.model.type === 1 && !datapoints.length">
                  <a v-link="{path: '/products/' + addProduct.id + '/data-point' }" class="control-text ml20 hl-red">无数据端点，请点击添加</a>
                </div>
                <div class="col-8">
                  <div v-show="addModal.model.type === 1 && datapoints.length" class="ml10">
                    <div class="select">
                      <x-select :label="datapointName(addModal.model)">
                        <select v-model="addModal.model.param" v-form-ctrl name="param">
                          <option v-for="option in datapoints" :value="option.id">{{ option.name }}</option>
                        </select>
                      </x-select>
                    </div>
                  </div>
                </div>
                <div class="col-6">
                  <div v-show="addModal.model.type === 1 && datapoints.length" class="ml10">
                    <div class="select">
                      <x-select :label="compareTypes[addModal.model.compare-1]">
                        <select v-model="addModal.model.compare" v-form-ctrl name="compare" number>
                          <option v-for="type in compareTypes" :value="$index+1" :selected="$index===0">{{ type }}</option>
                        </select>
                      </x-select>
                    </div>
                  </div>
                </div>
                <div class="col-5">
                  <div class="ml10">
                    <div class="input-text-wrap" v-show="addModal.model.type === 1 && datapoints.length">
                      <input v-model="addModal.value1" type="text" v-form-ctrl name="value" required lazy class="input-text"/>
                    </div>
                    <div class="select" v-show="addModal.model.type === 2">
                      <x-select :label="$t('common.'+addModal.value2)">
                        <select v-model="addModal.value2" v-form-ctrl name="value">
                          <option value="online">{{ $t("common.online") }}</option>
                          <option value="offline">{{ $t("common.offline") }}</option>
                        </select>
                      </x-select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="form-row row">
            <label class="form-control col-5">{{ $t("ui.rule.fields.content") }}:</label>
            <div class="controls col-19">
              <div v-placeholder="$t('ui.rule.placeholders.content')" class="input-text-wrap">
                <textarea v-model="addModal.model.content" type="text" v-form-ctrl name="content" required maxlength="250" lazy class="input-text"></textarea>
              </div>
              <div v-if="addValidation.$submitted && addValidation.content.$pristine" class="form-tips form-tips-error"><span v-if="addValidation.content.$error.required">{{ $t('common.validation.required', {field: $t('ui.rule.fields.content')}) }}</span></div>
              <div v-if="addValidation.content.$dirty" class="form-tips form-tips-error"><span v-if="addValidation.content.$error.required">{{ $t('common.validation.required', {field: $t('ui.rule.fields.content')}) }}</span><span v-if="addValidation.content.$error.maxlength">{{ $t('common.validation.maxlength', [ $t('ui.rule.fields.content'), 250]) }}</span></div>
            </div>
          </div>
          <div class="form-row row">
            <label class="form-control col-5">{{ $t("ui.rule.fields.inform_type") }}:</label>
            <div class="controls col-19">
              <div class="select">
                <x-select :label="informTypes[addModal.model.notify_type-1]">
                  <select v-model="addModal.model.notify_type" v-form-ctrl name="notify_type" number>
                    <option v-for="type in informTypes" :value="$index+1" :selected="$index===0">{{ type }}</option>
                  </select>
                </x-select>
              </div>
            </div>
          </div>
          <div class="form-row row tag-row">
            <label class="form-control col-5">{{ $t("ui.rule.fields.tags") }}:</label>
            <div class="controls col-19">
              <tag-input :value.sync="addModal.model.tag" :candidate="candidateTags" :editing.sync="addModal.editingTag" @adding-tag="addModal.show = true"></tag-input>
            </div>
          </div>
          <div class="form-row row">
            <label class="form-control col-5">{{ $t("ui.rule.fields.notify_type") }}:</label>
            <div class="controls col-19">
              <div class="checkbox-group">
                <template v-for="type in notifyTypes">
                  <label v-if="$index < 3" class="checkbox">
                    <input type="checkbox" v-model="addModal.model.notify_target" name="notify_target" :value="$index+1" number/>{{ type }}
                  </label>
                </template>
              </div>
              <template v-for="type in notifyTypes">
                <div class="row" v-if="$index === 3">
                  <div class="checkbox-group col-6">
                    <label class="checkbox">
                      <input type="checkbox" v-model="addModal.model.notify_target" name="notify_target" :value="$index+1" number/>{{ type }}
                    </label>
                  </div>
                  <div class="col-18">
                    <div v-show="isShowApn(addModal.model)" class="apn-list">
                      <div class="checkbox-group">
                        <label v-for="app in apps" v-if="app.type===1" class="checkbox">
                          <input type="checkbox" v-model="addModal.model.notify_apps" name="notify_apps" :value="app.id" number/>{{ app.name }}
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="row" v-if="$index === 4">
                  <div class="checkbox-group col-6">
                    <label class="checkbox">
                      <input type="checkbox" v-model="addModal.model.notify_target" name="notify_target" :value="$index+1" number/>{{ type }}
                    </label>
                  </div>
                  <div class="col-18">
                    <div v-show="isShowGoogle(addModal.model)" class="apn-list">
                      <div class="checkbox-group">
                        <label v-for="app in apps" v-if="app.type===2" class="checkbox">
                          <input type="checkbox" v-model="addModal.model.notify_apps" name="notify_apps" :value="app.id" number/>{{ app.name }}
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </template>
            </div>
          </div>
          <div class="form-row row">
            <label class="form-control col-5">{{ $t("ui.rule.fields.scope") }}:</label>
            <div class="controls col-19">
              <div class="radio-group">
                <label v-for="type in scopeTypes" class="radio">
                  <input type="radio" v-model="addModal.model.scope" name="addModal.model.scope" :value="$index+1" number/>{{ type }}
                </label>
              </div>
            </div>
          </div>
          <div class="form-row row">
            <label class="form-control col-5">{{ $t("common.status") }}:</label>
            <div class="controls col-19">
              <div class="radio-group">
                <label class="radio">
                  <input type="radio" v-model="addModal.model.is_enable" name="is_enable" :value="false"/>{{ $t("common.disabled") }}
                </label>
                <label class="radio">
                  <input type="radio" v-model="addModal.model.is_enable" name="is_enable" :value="true"/>{{ $t("common.enable") }}
                </label>
              </div>
            </div>
          </div>
          <div class="form-actions">
            <button type="submit" :disabled="adding" :class="{'disabled':adding}" v-text="adding ? $t('common.handling') : $t('common.ok')" class="btn btn-primary"></button>
            <button type="reset" @click.prevent.stop="onAddCancel" class="btn btn-default">{{ $t("common.cancel") }}</button>
          </div>
        </form>
      </div>
    </modal>
    <!-- End: 添加规则浮层 -->

    <!-- Start: 编辑规则浮层 -->
    <modal :show.sync="editModal.show" :width="'670px'" :flag="editModal.editingTag">
      <h3 slot="header">{{ $t("ui.rule.edit_rule") }}</h3>
      <div slot="body" class="form form-rules">
        <form autocomplete="off" v-form name="editValidation" @submit.prevent="onEditSubmit" hook="editFormHook">
          <div class="form-row row">
            <label class="form-control col-5">产品:</label>
            <div class="controls col-19">
              <div class="control-text">{{ currProduct.name }}</div>
            </div>
          </div>
          <div class="form-row row">
            <label class="form-control col-5">{{ $t("ui.rule.fields.name") }}:</label>
            <div class="controls col-19">
              <div v-placeholder="$t('ui.rule.placeholders.name')" class="input-text-wrap">
                <input v-model="editModal.model.name" type="text" v-form-ctrl name="name" required minlength="2" maxlength="32" lazy class="input-text"/>
              </div>
              <div v-if="editValidation.$submitted && editValidation.name.$pristine" class="form-tips form-tips-error"><span v-if="editValidation.name.$error.required">{{ $t('common.validation.required', {field: $t('ui.rule.fields.name')}) }}</span></div>
              <div v-if="editValidation.name.$dirty" class="form-tips form-tips-error"><span v-if="editValidation.name.$error.required">{{ $t('common.validation.required', {field: $t('ui.rule.fields.name')}) }}</span><span v-if="editValidation.name.$error.minlength">{{ $t('common.validation.minlength', [ $t('ui.rule.fields.name'), 2]) }}</span><span v-if="editValidation.name.$error.maxlength">{{ $t('common.validation.maxlength', [ $t('ui.rule.fields.name'), 32]) }}</span></div>
            </div>
          </div>
          <div class="form-row row">
            <label class="form-control col-5">{{ $t("ui.rule.condition") }}:</label>
            <div class="controls col-19">
              <div class="row">
                <div class="col-5">
                  <x-select :label="ruleTypes[editModal.model.type-1]">
                    <select v-model="editModal.model.type" v-form-ctrl name="type" number @input="onSelectType">
                      <option v-for="type in ruleTypes" :value="$index+1" :selected="$index===0">{{ type }}</option>
                    </select>
                  </x-select>
                </div>
                <div class="col-8">
                  <div v-show="editModal.model.type === 1" class="ml10">
                    <div class="select">
                      <x-select :label="datapointName(editModal.model)">
                        <select v-model="editModal.model.param" v-form-ctrl name="param">
                          <option v-for="option in datapoints" :value="option.id">{{ option.name }}</option>
                        </select>
                      </x-select>
                    </div>
                  </div>
                </div>
                <div class="col-6">
                  <div v-show="editModal.model.type === 1" class="ml10">
                    <div class="select">
                      <x-select :label="compareTypes[editModal.model.compare-1]">
                        <select v-model="editModal.model.compare" v-form-ctrl name="compare" number>
                          <option v-for="type in compareTypes" :value="$index+1" :selected="$index===0">{{ type }}</option>
                        </select>
                      </x-select>
                    </div>
                  </div>
                </div>
                <div class="col-5">
                  <div class="ml10">
                    <div class="input-text-wrap" v-show="editModal.model.type === 1">
                      <input v-model="editModal.value1" type="text" v-form-ctrl name="value" required lazy class="input-text"/>
                    </div>
                    <div class="select" v-show="editModal.model.type === 2">
                      <x-select :label="$t('common.'+editModal.value2)">
                        <select v-model="editModal.value2" v-form-ctrl name="value">
                          <option value="online">{{ $t("common.online") }}</option>
                          <option value="offline">{{ $t("common.offline") }}</option>
                        </select>
                      </x-select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="form-row row">
            <label class="form-control col-5">{{ $t("ui.rule.fields.content") }}:</label>
            <div class="controls col-19">
              <div v-placeholder="'请输入告警内容'" class="input-text-wrap">
                <textarea v-model="editModal.model.content" type="text" v-form-ctrl name="content" required maxlength="250" lazy class="input-text"></textarea>
              </div>
              <div v-if="editValidation.$submitted && editValidation.content.$pristine" class="form-tips form-tips-error"><span v-if="editValidation.content.$error.required">{{ $t('common.validation.required', {field: $t('ui.rule.fields.content')}) }}</span></div>
              <div v-if="editValidation.content.$dirty" class="form-tips form-tips-error"><span v-if="editValidation.content.$error.required">{{ $t('common.validation.required', {field: $t('ui.rule.fields.content')}) }}</span><span v-if="editValidation.content.$error.maxlength">{{ $t('common.validation.maxlength', [ $t('ui.rule.fields.content'), 250]) }}</span></div>
            </div>
          </div>
          <div class="form-row row">
            <label class="form-control col-5">{{ $t("ui.rule.fields.inform_type") }}:</label>
            <div class="controls col-19">
              <div class="select">
                <x-select :label="informTypes[editModal.model.notify_type-1]">
                  <select v-model="editModal.model.notify_type" v-form-ctrl name="notify_type" number>
                    <option v-for="type in informTypes" :value="$index+1" :selected="$index===0">{{ type }}</option>
                  </select>
                </x-select>
              </div>
            </div>
          </div>
          <div class="form-row row tag-row">
            <label class="form-control col-5">{{ $t("ui.rule.fields.tags") }}:</label>
            <div class="controls col-19">
              <tag-input :value.sync="editModal.model.tag" :candidate="candidateTags" :editing.sync="editModal.editingTag" @adding-tag="editModal.show = true"></tag-input>
            </div>
          </div>
          <div class="form-row row">
            <label class="form-control col-5">{{ $t("ui.rule.fields.notify_type") }}:</label>
            <div class="controls col-19">
              <div class="checkbox-group">
                <template v-for="type in notifyTypes">
                  <label v-if="$index < 3" class="checkbox">
                    <input type="checkbox" v-model="editModal.model.notify_target" name="notify_target" :value="$index+1" number/>{{ type }}
                  </label>
                </template>
              </div>
              <template v-for="type in notifyTypes">
                <div class="row" v-if="$index === 3">
                  <div class="checkbox-group col-6">
                    <label class="checkbox">
                      <input type="checkbox" v-model="editModal.model.notify_target" name="notify_target" :value="$index+1" number/>{{ type }}
                    </label>
                  </div>
                  <div class="col-18">
                    <div v-show="isShowApn(editModal.model)" class="apn-list">
                      <div class="checkbox-group">
                        <label v-for="app in apps" v-if="app.type===1" class="checkbox">
                          <input type="checkbox" v-model="editModal.model.notify_apps" name="notify_apps" :value="app.id" number/>{{ app.name }}
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="row" v-if="$index === 4">
                  <div class="checkbox-group col-6">
                    <label class="checkbox">
                      <input type="checkbox" v-model="editModal.model.notify_target" name="notify_target" :value="$index+1" number/>{{ type }}
                    </label>
                  </div>
                  <div class="col-18">
                    <div v-show="isShowGoogle(editModal.model)" class="apn-list">
                      <div class="checkbox-group">
                        <label v-for="app in apps" v-if="app.type===2" class="checkbox">
                          <input type="checkbox" v-model="editModal.model.notify_apps" name="notify_apps" :value="app.id" number/>{{ app.name }}
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </template>
            </div>
          </div>
          <div class="form-row row">
            <label class="form-control col-5">{{ $t("ui.rule.fields.scope") }}:</label>
            <div class="controls col-19">
              <div class="radio-group">
                <label v-for="type in scopeTypes" class="radio">
                  <input type="radio" v-model="editModal.model.scope" name="scope" :value="$index+1" number/>{{ type }}
                </label>
              </div>
            </div>
          </div>
          <div class="form-row row">
            <label class="form-control col-5">{{ $t("common.status") }}:</label>
            <div class="controls col-19">
              <div class="radio-group">
                <label class="radio">
                  <input type="radio" v-model="editModal.model.is_enable" name="is_enable" :value="false"/>{{ $t("common.disabled") }}
                </label>
                <label class="radio">
                  <input type="radio" v-model="editModal.model.is_enable" name="is_enable" :value="true"/>{{ $t("common.enable") }}
                </label>
              </div>
            </div>
          </div>
          <div class="form-actions">
            <label class="del-check">
              <input type="checkbox" name="del" v-model="delChecked"/>{{ $t("ui.rule.del_rule") }}
            </label>
            <button type="submit" :disabled="editing" :class="{'disabled':editing}" v-text="editing ? $t('common.handling') : $t('common.ok')" class="btn btn-primary"></button>
            <button @click.prevent.stop="onEditCancel" class="btn btn-default">{{ $t("common.cancel") }}</button>
          </div>
        </form>
      </div>
    </modal>
    <!-- End: 编辑规则浮层 -->
  </div>
</template>

<script>
  import Vue from 'vue'
  import api from 'api'
  import * as config from 'consts/config'
  import locales from 'consts/locales/index'
  export default {
    name: 'Alert',
    components: {
    },

    data () {
      return {
        currProduct: {},
        addProduct: {},
        products: [],
        rules: [],            // 规则列表
        apps: [],              // app 列表
        ruleTypes: locales[Vue.config.lang].data.RULE_TYPES,
        compareTypes: locales[Vue.config.lang].data.RULE_COMPARE_TYPES,
        informTypes: locales[Vue.config.lang].data.RULE_INFORM_TYPES,
        notifyTypes: locales[Vue.config.lang].data.RULE_NOTIFY_TYPES,
        scopeTypes: locales[Vue.config.lang].data.RULE_SCOPE_TYPES,
        datapoints: [],       // 数据端点
        currentPage: 1,       // 当前页
        countPerPage: config.COUNT_PER_PAGE,        // 每页记录数
        // addModal.show: false,  // 是否显示添加浮层
        // editModal.show: false, // 是否显示编辑浮层
        candidateTags: locales[Vue.config.lang].data.RULE_CANDIDATE_TAGS,      // 候选标签
        addModal: {
          show: false,
          form: {},
          editingTag: false,
          model: {           // 添加数据模型
            product_id: '',
            name: '',
            tag: '',
            type: 1,
            notify_target: [],
            notify_apps: [],
            notify_type: 1,
            compare: 1,
            value: '0',
            scope: 1,
            is_enable: true,
            content: '',
            param: ''
          },
          value1: '0',
          value2: 'online'
        },
        editModal: {
          show: false,
          form: {},
          editingTag: false,
          model: {           // 添加数据模型
            tag: '',
            param: ''
          },
          value1: '0',
          value2: 'online'
        },
        // addModel: {           // 添加数据模型
        //   product_id: this.$route.params.id,
        //   name: '',
        //   tag: '',
        //   type: 1,
        //   notify_target: [],
        //   notify_apps: [],
        //   notify_type: 1,
        //   compare: 1,
        //   value: '0',
        //   scope: 1,
        //   is_enable: true,
        //   content: '',
        //   param: ''
        // },
        addValidation: {},    // 添加验证
        editValidation: {},   // 修改验证
        // addModelEditingTag: false, // 是否正在编辑添加浮层的标签
        // editModal.modelEditingTag: false, // 是否正在编辑编辑浮层的标签
        // editModal.model: {
        //   tag: ''
        // },
        delChecked: false,    // 是否删除
        adding: false,
        editing: false,
        // addForm: {},
        // editForm: {},
        originAddModel: {},
        originEditModel: {},
        loadingData: false,
        tips: false
      }
    },

    route: {
      data () {
        // this.getDatapoints().then((res) => {
        //   if (res.status === 200) {
        //     this.datapoints = res.data
        //     this.addModal.model.param = res.data[0].id
        //     this.originAddModel = _.cloneDeep(this.addModal.model)
        //   }
        // })
        this.getApps()
        this.getProducts()
      }
    },

    filters: {
      ruleLabel (value) {
        return this.ruleTypes[value - 1]
      }
    },

    computed: {
      /**
       * 数据端点名称
       */
      // datapointName (model) {
      //   var result
      //
      //   console.log(model.param)
      //
      //   if (this.datapoints.length > 0 && typeof model.param !== 'undefined') {
      //     var datapoint = _.find(this.datapoints, (item) => {
      //       return item.id === model.param
      //     })
      //     result = datapoint.name
      //   } else {
      //     result = ''
      //   }
      //
      //   return result
      // }
    },

    methods: {
      // 获取产品列表
      getProducts () {
        api.product.all().then((res) => {
          this.products = res.data
          this.currProduct = this.products[0]
          console.log(this.products)
          if (this.products.length === 0) {
            this.tips = true
            return
          }
          this.getRules()
          this.getDatapoints(this.currProduct.id).then((r) => {
            if (r.status === 200) {
              if (!r.data.length) {
                return
              }
              this.datapoints = r.data
              this.addModal.model.param = r.data[0].id
              this.originAddModel = _.cloneDeep(this.addModal.model)
            }
            this.loadingData = false
          })
        }).catch((res) => {
          this.handleError(res)
        })
      },
      /**
       * 数据端点名称
       */
      datapointName (model) {
        var result
        if (this.datapoints.length > 0 && typeof model.param !== 'undefined' && model.param.length > 0) {
          var datapoint = _.find(this.datapoints, (item) => {
            return item.id === model.param
          })
          if (datapoint !== undefined) {
            result = datapoint.name
          } else {
            result = ''
          }
        } else {
          result = ''
        }

        return result
      },

      // 获取数据端点列表
      getDatapoints (id) {
        return api.product.getDatapoints(id)
      },
      // 更改应用后获取列表与状态
      Productstatus () {
        this.getRules()
        this.getDatapoints(this.currProduct.id).then((res) => {
          if (res.status === 200) {
            this.datapoints = res.data
            // this.addModal.model.param = res.data[0].id
            this.originAddModel = _.cloneDeep(this.addModal.model)
          }
        })
      },
      // 更改应用后获取列表与状态
      addProductstatus () {
        this.getDatapoints(this.addProduct.id).then((res) => {
          if (res.status === 200) {
            this.datapoints = res.data
            if (this.datapoints.length) {
              this.addModal.model.param = res.data[0].id
            }
            this.originAddModel = _.cloneDeep(this.addModal.model)
          }
        })
      },

      // 获取告警规则列表
      getRules () {
        this.loadingData = true
        api.alert.getRules(this.currProduct.id).then((res) => {
          if (res.status === 200) {
            this.rules = res.data
            this.loadingData = false
          }
        }).catch((res) => {
          this.handleError(res)
          this.loadingData = false
        })
      },

      // 获取 APP 列表
      getApps () {
        api.plugin.all().then((res) => {
          if (res.status === 200) {
            this.apps = res.data.list
          }
        })
      },

      // 是否显示 APN推送
      isShowApn (model) {
        return _.includes(model.notify_target, 4)
      },

      // 是否显示 Google推送
      isShowGoogle (model) {
        return _.includes(model.notify_target, 5)
      },
      // 选择告警类型
      onSelectType () {
        if (this.addModal.model.type === 1) {
          this.addModal.model.compare = 1
          this.addModal.model.value = 'online'
        } else {
          this.addModal.model.value = ''
        }
      },

      // 添加表单钩子
      addFormHook (form) {
        this.addModal.form = form
      },

      // 编辑表单钩子
      editFormHook (form) {
        this.editModal.form = form
      },

      // 关闭添加浮层并净化添加表单
      resetAdd () {
        this.adding = false
        this.addModal.show = false
        this.addModal.model = _.cloneDeep(this.originAddModel)
        this.addModal.value1 = '0'
        this.addModal.value2 = 'online'
        this.$nextTick(() => {
          this.addModal.form.setPristine()
        })
      },

      // 关闭编辑浮层并净化编辑表单
      resetEdit () {
        this.editing = false
        this.delChecked = false
        this.editModal.show = false
        this.editModal.model = this.originEditModel
      },

      // 取消添加
      onAddCancel () {
        this.resetAdd()
      },

      onAddSubmit () {
        if (this.addValidation.$valid && !this.adding) {
          this.adding = true
          this.addModal.model.value = this.addModal.model.type === 1 ? this.addModal.value1 : this.addModal.value2
          this.addModal.model.product_id = this.addProduct.id
          api.alert.addRule(this.addModal.model).then((res) => {
            if (res.status === 200) {
              this.getRules()
              this.resetAdd()
            }
          }).catch((res) => {
            this.handleError(res)
            this.adding = false
          })
        }
      },

      // 初始化编辑表单
      editRule (rule) {
        this.editModal.show = true
        if (rule.type === 1) {
          this.editModal.value1 = rule.value
        } else {
          this.editModal.value2 = rule.value
        }
        this.editModal.model = _.clone(rule)
        this.originEditModel = _.clone(rule)
      },
      // 初始化添加表单
      addRule () {
        this.addModal.show = true
        this.addProduct = this.currProduct
      },

      // 取消编辑
      onEditCancel () {
        this.resetEdit()
      },

      // 提交编辑表单
      onEditSubmit () {
        if (this.delChecked && !this.editing) { // 删除
          this.editing = true
          api.alert.deleteRule(this.editModal.model.id).then((res) => {
            if (res.status === 200) {
              this.resetEdit()
              this.getRules()
            }
          }).catch((res) => {
            this.handleError(res)
            this.editing = false
          })
        } else if (this.editValidation.$valid && !this.editing) { // 更新
          this.editing = true
          this.editModal.model.value = this.editModal.model.type === 1 ? this.editModal.value1 : this.editModal.value2
          api.alert.updateRule(this.editModal.model, this.currProduct.id).then((res) => {
            if (res.status === 200) {
              this.resetEdit()
              this.getRules()
            }
          }).catch((res) => {
            this.handleError(res)
            this.editing = false
          })
        }
      }
    }
  }
</script>

<style lang="stylus">
  @import '../../../assets/stylus/common'

  .modal
    .form-rules
      /*.form-row
        .controls
          width 480px !important*/

      /*.tag-row*/
        /*overflow-y visible*/

      .apn-list
        background #FFF
        border 1px solid default-border-color
        padding 0 10px
        margin-bottom 3px
</style>
