<template>
  <div class="panel mt20 pdb30">
    <div class="panel-bd">
      <!-- 第一步骤 -->
      <validator name="validation">
        <!-- 第二步骤 -->
        <div>
          <!-- <step-form2></step-form2> -->
          <div class="recipe-form">
            <div class="form with-loading">
              <div class="icon-loading" v-show="loadingData">
                <i class="fa fa-refresh fa-spin"></i>
              </div>
              <form autocomplete="off" novalidate @submit.prevent="onRecipeSubmit">
                <div class="form-row panel mb20">
                  <div class="panel-bd">
                    <div v-for="cooking_step in cooking_steps" class="thumb-info mt20 mb15 row">
                      <div class="col-3">第{{ $index+1 }}步:</div>
                      <div class="col-21">
                        <div class="thumb">
                          <image-uploader :images="cooking_step.images" @modified="onModifiedImages(cooking_step.images)" class="mb0"></image-uploader>
                        </div>
                        <div class="info-text">
                          <div class="input-text-wrap">
                            <textarea v-model="cooking_step.description"  name="cooking_step.description" lazy placeholder="请填写步骤的描述" class="input-text" :field="'step' + $index" v-validate="{required: true, maxlength: 100}"></textarea>
                          </div>
                          <div class="form-tips form-tips-error">
                            <span v-if="$validation['step' + $index].touched && $validation['step' + $index].required">步骤描述不能为空</span>
                            <span v-if="$validation['step' + $index].modified && $validation['step' + $index].maxlength">{{ $t('ui.validation.maxlength', ['步骤描述', 100]) }}</span>
                          </div>
                          <div class="button-list">
                            <div v-show="cooking_steps.length>1&&$index>0" @click="handleStepEvent('MOVE_UP', cooking_step, $index)" class="control-button button-up"><i class="icon fa fa-long-arrow-up"></i></div>
                            <div v-show="cooking_steps.length>1&&$index<(cooking_steps.length-1)" @click="handleStepEvent('MOVE_DOWN', cooking_step, $index)" class="control-button button-down"><i class="icon fa fa-long-arrow-down"></i></div>
                            <div @click="handleStepEvent('ADD', cooking_step, $index)" class="control-button button-add" v-if="cooking_steps.length<maxStepCount"><i class="icon fa fa-plus"></i></div>
                            <div v-show="cooking_steps.length>1" @click="handleStepEvent('DEL', cooking_step, $index)" class="control-button button-del"><i class="icon fa fa-times"></i></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <!-- <div class="bortop" v-if="this.$route.params.type_value === '2'">
                  <h2>添加设备烹饪提示</h2>
                  <div class="row">
                    <div class="line32 mrb10" v-for="tip in cookTips">
                      <div class="col-3">第{{ $index+1 }}步:</div>
                      <div class="col-19">
                        <p class="cooktipp">{{tip.content}}</p>
                      </div>
                      <div class="col-2">
                        <a @click.prevent.stop="setCookTip(tip)">编辑</a>
                      </div>
                    </div>
                    <div class="row">
                      <button @click.prevent.stop="addTips" class="col-offset-3 btn btn-ghost addCookTip"><i class="fa fa-plus">添加烹饪提示步骤</i></button>
                    </div>
                  </div>
                </div> -->
                <div class="form-actions mb40 row">
                  <div class="col-offset-4">
                    <button type="submit" :disabled="editing" :class="{'disabled': editing}" class="btn btn-primary btn-lg">{{ $t("common.save") }}</button>
                    <!-- <button @click.prevent.stop="isShowPreview=true" class="btn btn-ghost btn-lg">预览</button> -->
                    <!-- <button @click.prevent="deleteRecipe" class="btn btn-ghost btn-lg" v-if="type==='edit'">{{ $t('ui.recipe.del') }}</button> -->
                  </div>
                </div>
              </form>
              <modal :show.sync="cookTipShow" width="480px">
                <h3 slot="header">编辑烹饪提示信息</h3>
                <div slot="body" class="form">
                  <form autocomplete="off" novalidate @submit.prevent="">
                    <div class="form-row row">
                      <label class="form-control col-6">提示信息:</label>
                      <div class="controls col-18">
                        <div class="input-text-wrap required-sign">
                          <textarea v-model="setTipModel.content" name="content" type="text" class="input-text"></textarea>
                        </div>
                      </div>
                    </div>
                    <div class="form-actions">
                      <label class="del-check">
                        <input type="checkbox" name="del" v-model="delChecked"/> 删除此提示
                      </label>
                      <button type="submit" class="btn btn-primary">确定</button>
                      <button @click.prevent.stop="cookTipShow = false" class="btn btn-default">{{ $t("common.cancel") }}</button>
                    </div>
                  </form>
                </div>
              </modal>
            </div>
          </div>
        </div>
        <!-- 第二步骤END -->
      </validator>
      <div v-show="isShowPreview" transition="modal" class="mask">
        <div class="preview-wrapper">
          <div :style="dialogStyle" class="preview-dialog">
            <div class="preview-header">
              <h3>预览</h3>
            </div>
            <div class="preview-body">
              <div class="app-header">{{ name }}</div>
              <div class="preview-thumb">
                <img :src="images[0]">
              </div>
              <div class="preview-panel">
                <div class="preview-panel-hd">
                  <h3>{{name}}</h3>
                </div>
                <div class="preview-panel-bd">
                  <p class="introduce">{{ instructions }}</p>
                  <div class="metas">
                    <div class="meta"><i class="fa fa-hand-pointer-o"></i> {{properties.difficulty}}</div>
                    <div class="meta"><i class="fa fa-clock-o"></i> {{properties.cooking_time}}</div>
                  </div>
                </div>
              </div>
              <div class="preview-panel">
                <div class="preview-panel-hd">
                  <div class="preview-panel-hd-actions"><span>添加到我的菜篮</span></div>
                  <h3>用料：</h3>
                </div>
                <div class="preview-panel-bd">
                  <table>
                    <tbody>
                      <tr v-for="ingredient in major_ingredients">
                        <td>{{ ingredient.name }}</td>
                        <td>{{ ingredient.unit }}</td>
                      </tr>
                      <tr v-for="ingredient in minor_ingredients">
                        <td>{{ ingredient.name }}</td>
                        <td>{{ ingredient.unit }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
              <div class="preview-panel">
                <div class="preview-panel-hd">
                  <h3>步骤：</h3>
                </div>
                <div class="preview-panel-bd">
                  <p v-for="step in cooking_steps">
                    {{$index+1}}、{{step.description}}
                  </p>
                </div>
              </div>
              <div class="preview-panel">
                <ul class="introlist">
                  <li><i class="fa fa-star"></i> 收藏菜谱</li>
                  <li><i class="fa fa-plus-circle"></i> 添加到我的常用菜</li>
                </ul>
              </div>
              <div class="preview-panel device-panel">
                <h4>选择厨具并开始烹饪</h4>
                <div class="cooking-devices">
                  <div class="cooking-device-item device1"></div>
                  <div class="cooking-device-item device2"></div>
                </div>
              </div>
            </div>
            <span @click="dismiss" class="fa fa-times-circle"></span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import api from 'api'
import { pluginMixins } from '../../../mixins'

export default {
  name: 'EditRecipe',

  layout: 'admin',

  mixins: [pluginMixins],

  components: {
  },

  vuex: {
    getters: {
      currentMember: ({ system }) => system.currentMember,
      products: ({ products }) => products.released
    }
  },
  props: {
    type: {
      type: String,
      default: 'edit'
    }
  },

  data () {
    return {
      name: '',
      images: [''], // 成品图
      difficulty: '不限',
      instructions: '',
      cooking_steps: [],
      properties: {
        user_cooking_time: '',
        cooking_time: '5分钟',
        difficulty: '不限',
        label: ''
      },
      mainCategories: [],
      classification: [],
      tips: '',
      tag: '',
      editingTag: false,
      show: false,
      difficulties: ['不限', '新手', '初级', '中级', '高级', '厨神'],
      cookingtimes: ['5分钟', '10分钟', '15分钟', '30分钟', '60分钟', '90分钟', '2小时', '数小时', '1天', '数天'],
      major_ingredients: [{name: '', unit: ''}],
      minor_ingredients: [{name: '', unit: ''}],
      devices: [],
      // allDevices: DEVICES,
      allDevices: '',
      // candidateTags: locales[Vue.config.lang].data.RULE_CANDIDATE_TAGS,
      candidateTags: [],
      adding: false,
      status: 1,
      isShowPreview: false,
      maxStepCount: 15,
      recipe: {
        name: '',
        devices: []
      },
      modal: {
        show: false,
        type: 'add'
      },
      isShowModal: false,
      selectedProduct: {},
      originModel: {
        id: '',
        name: '',
        autoexec: ''
      },
      model: {},
      submitting: false,
      delChecked: false,
      loadingData: true,
      breadcrumbNav: [{
        label: '运营商列表',
        link: '/dev/settings/message/custom-carrier'
      }, {
        label: '添加运营商'
      }],
      currPage: 1,
      // 页码在数组里的索引位置
      arrNum: 0,
      pages: [],
      lastAble: false,
      nextAble: true,
      cookTips: [
        {
          content: ''
        }
      ],
      cookTipShow: false,
      setTipModel: {
        content: ''
      }
    }
  },
  computed: {
    productOptions () {
      return _.differenceBy(this.products, this.recipe.devices, 'id')
    },
    // 判断当前是否第一页
    mixPage () {
      var result = true
      if (this.currPage === 1) {
        result = false
      } else {
        result = true
      }
      return result
    },
    // 判断当前是否最后一页
    maxPage () {
      var result = true
      if (this.currPage === this.pages[this.pages.length - 1]) {
        // 如果跟页码数组最后一项相同，说明为最后一页
        result = false
      } else {
        result = true
      }
      return result
    }
  },

  ready () {
    // this.getRecipes()
    this.whichPage()
    let appId = this.$route.params.app_id
    // 从 localStorage 中获取app token
    let token = JSON.parse(window.localStorage.pluginsToken)[appId].token

    if (this.type === 'add') { // 添加
      this.classification = [{
        main: {id: '', name: ''},
        sub: {id: '', name: ''},
        subOptions: []
      }]
    } else { // 编辑
      var condition = {
        filter: [],
        limit: 1,
        offset: 0,
        query: {
          _id: this.$route.params.id
        }
      }
      api.recipes.getRecipes(appId, token, condition).then((res) => {
        if (res.status === 200) {
          var data = res.data.list[0] ? res.data.list[0] : null

          this.name = data.name
          this.instructions = data.instructions
          this.properties.cooking_time = data.properties.cooking_time
          this.properties.difficulty = data.properties.difficulty
          this.tag = data.properties.label ? data.properties.label.join(',') : ''
          this.major_ingredients = data.major_ingredients
          this.minor_ingredients = data.minor_ingredients
          this.cooking_steps = data.cooking_steps
          this.tips = data.tips
          this.devices = data.devices
          this.status = data.status
          var images = ['']
          data.images.forEach((item, index) => {
            images[index] = item
          })
          this.images = images

          // TODO
          _.forEach(data.classification, (item) => {
            this.getSubCategories(item)
            this.classification.push(item)
          })
        }
      })
    }

    // 获取所有菜谱分类
    this.getMainCategories()
    // 获取所有标签
    this.getTags()
  },

  methods: {
    // 控制页码逻辑
    whichPage () {
      if (this.$route.params.type_value === '1') {
        // 如果菜谱类型为普通菜谱
        this.pages = [1, 2]
      } else if (this.$route.params.type_value === '2') {
        // 如果菜谱类型为智能菜谱
        this.pages = [1, 2]
      } else if (this.$route.params.type_value === '3') {
        // 如果菜谱类型为本地菜谱
        this.pages = [1, 2, 3]
      }
      this.currPage = this.pages[0]
      this.arrNum = 0
    },
    // 上一页功能
    lastStep () {
      this.arrNum -= 1
      this.currPage = this.pages[this.arrNum]
    },

    // 下一页功能
    nextStep () {
      this.arrNum += 1
      this.currPage = this.pages[this.arrNum]
    },

    /**
     * 处理图片上传
     * @param  {Array} images 图片路径数组
     */
    onModifiedImages (images, data) {
      images = data
    },

    /**
     * 获取菜谱分类
     * @author shengzhi
     */
    getCategories (id, limit) {
      let appId = this.$route.params.app_id
      // 从 localStorage 中获取app token
      let token = JSON.parse(window.localStorage.pluginsToken)[appId].token

      let condition = {
        limit: limit,
        query: {
          parent_id: id
        }
      }

      this.loadingData = true
      return api.recipes.getCategories(appId, token, condition)
    },

    /**
     * 获取父级分类
     * @author shengzhi
     */
    getMainCategories () {
      this.getCategories(0, 50).then((res) => {
        if (res.status !== 200) {
          this.loadingData = false
          return
        }
        this.mainCategories = res.data.list.map((item) => {
          return {
            main: {
              id: item._id,
              name: item.name
            }
          }
        })
      }).catch((res) => {
        this.handleError(res)
        this.loadingData = false
      })
    },

    /**
     * 获取子级分类
     * @author shengzhi
     * @param {Object} parent 父级
     */
    getSubCategories (parent, trigger) {
      if (trigger) {
        parent.sub = {id: '', name: ''}
      }
      parent.subOptions = []
      this.getCategories(parent.main.id, 500).then((res) => {
        if (res.status !== 200) {
          this.loadingData = false
          return
        }
        this.loadingData = false
        parent.subOptions = res.data.list.map((item) => {
          return {
            sub: {
              id: item._id,
              name: item.name
            }
          }
        })
      }).catch((res) => {
        this.handleError(res)
        this.loadingData = false
      })
    },

    /**
     * 获取标签
     */
    getTags () {
      let appId = this.$route.params.app_id
      // 从 localStorage 中获取app token
      let token = JSON.parse(window.localStorage.pluginsToken)[appId].token
      let condition = {
        limit: 200,
        query: {}
      }

      this.loadingData = true
      api.recipes.getTags(appId, token, condition).then((res) => {
        if (res.status === 200) {
          this.candidateTags = res.data.list.map((item) => {
            return item.label
          })
          this.loadingData = false
        }
      }).catch((res) => {
        this.handleError(res)
        this.loadingData = false
      })
    },

    /**
     * 添加菜谱类别
     */
    addCategory () {
      this.classification.push({
        main: {id: '', name: ''},
        sub: {id: '', name: ''},
        subOptions: []
      })
    },

    /**
     * 添加主料
     */
    addMajor () {
      var newMajor = {}
      newMajor.name = ''
      newMajor.unit = ''
      this.major_ingredients.push(newMajor)
    },

    /**
     * 添加辅料
     */
    addMinor () {
      var newMinor = {}
      newMinor.name = ''
      newMinor.unit = ''
      this.minor_ingredients.push(newMinor)
    },

    /**
     * 设置步骤
     * @param {Objcet} device 设备
     */
    setSteps (device) {
      var arr = []
      for (var i = 0, len = device.count; i < len; i++) {
        if (i < device.steps.length) {
          arr[i] = _.cloneDeep(device.steps[i])
        } else {
          arr[i] = _.cloneDeep(this.allDevices[device.id].template)
        }
      }
      device.steps = arr
    },

    /**
     * 菜谱步骤右边四个小操作按钮的事件
     * @param  {[type]} step      当前操作的步骤对象
     * @param  {[type]} index     当前操作的步骤index
     * @param  {[type]} eventType 事件类型，用来区分四个按钮的四个事件
     * @return {[type]}           无返回
     */
    handleStepEvent (eventType, step, index) {
      var newstep = {
        description: '',
        time: 0,
        images: ['']
      }
      switch (eventType) {
        case 'MOVE_UP':
          this.cooking_steps.splice(index, 1)
          this.cooking_steps.splice(index - 1, 0, step)
          break
        case 'MOVE_DOWN':
          this.cooking_steps.splice(index, 1)
          this.cooking_steps.splice(index + 1, 0, step)
          break
        case 'ADD':
          this.cooking_steps.splice(index + 1, 0, newstep)
          break
        case 'DEL':
          if (!window.confirm('您确定要删除该步骤？')) return
          this.cooking_steps.$remove(step)
          break
        default:
          break
      }
    },

    /**
     * 通用删除事件
     * @param  {Object} obj 要删除的对象
     * @param  {Array}  arr 要删除的对象的父数组
     */
    removeObj (obj, arr) {
      if (arr.length <= 1) {
        this.showNotice({
          type: 'error',
          content: '默认项不允许删除'
        })
        return
      }
      arr.$remove(obj)
    },

    // 关闭预览
    dismiss () {
      this.isShowPreview = false
    },

    /**
     * 菜谱表单提交
     */
    onRecipeSubmit () {
      if (this.editing) return

      if (this.$validation.invalid) {
        this.$validate(true)
        this.showNotice({
          type: 'error',
          content: '请确认填写是否正确！'
        })
        return
      }

      let appId = this.$route.params.app_id
      // 从 localStorage 中获取app token
      let token = JSON.parse(window.localStorage.pluginsToken)[appId].token

      this.editing = true
      let images = _.compact(_.clone(this.images))
      let major = this.major_ingredients.filter((item) => {
        return Object.keys(item).length > 0
      })
      let minor = this.minor_ingredients.filter((item) => {
        return Object.keys(item).length > 0
      })
      let classification = []
      _.forEach(this.classification, (item) => {
        if (!item.main.id) return
        classification.push({
          main: item.main,
          sub: item.sub
        })
      })
      let params = {
        name: this.name,
        images: images,
        instructions: this.instructions,
        properties: {
          cooking_time: this.properties.cooking_time,
          difficulty: this.properties.difficulty,
          label: _.compact(this.tag.split(','))
        },
        classification: classification,
        major_ingredients: major,
        minor_ingredients: minor,
        cooking_steps: this.cooking_steps,
        tips: this.tips,
        status: this.status,
        creator: this.currentMember.name,
        // type: this.devices.length ? 2 : 1
        type: this.$route.params.type_value
      }

      let process
      let noticeCont = ({
        add: '菜谱添加成功！',
        edit: '菜谱修改成功！'
      })[this.type]

      if (this.type === 'edit') {
        process = api.recipes.editRecipes(appId, this.$route.params.id, token, params)
      } else {
        process = api.recipes.addRecipes(appId, token, params)
      }

      process.then((res) => {
        if (res.status === 200) {
          this.showNotice({
            type: 'success',
            content: noticeCont
          })
          this.$route.router.go({path: '/operation/plugins/recipes/' + this.$route.params.app_id + '/recipes'})
        }
      }).catch((res) => {
        this.handleError(res)
        this.editing = false
      })
    },

    /**
     * 删除菜谱
     */
    deleteRecipe () {
      if (!window.confirm('确定要删除该菜谱吗？')) return

      let appId = this.$route.params.app_id
      // 从 localStorage 中获取app token
      let token = JSON.parse(window.localStorage.pluginsToken)[appId].token

      api.recipes.delRecipes(appId, this.$route.params.id, token).then((res) => {
        if (res.status === 200) {
          this.showNotice({
            type: 'success',
            content: '菜谱删除成功'
          })
          this.$route.router.go({path: `/operation/plugins/recipes/${this.$route.params.app_id}/recipes`})
        }
      }).catch((res) => {
        this.handleError(res)
      })
    },
    setCookTip (item) {
      this.cookTipShow = true
      this.setTipModel = item
    },
    addTips () {
      this.cookTips.push({content: ''})
    }
  }
}
</script>

<style lang="stylus" scoped>
  @import '../../../../../../assets/stylus/common'
  .line32
    line-height 32px
    height 32px
  .mrb10
    margin-bottom 10px
  .cooktipp
    width 100%
    border 1px solid #ddd
    box-sizing border-box
    margin 0
    height 32px
    line-height 32px
  .addCookTip
    margin-top 10px
  .bortop
    border-top 1px solid #ddd
    /*padding-top 20px*/
  .action
    border-top 1px solid #ddd
    padding-top 20px
  .mlr10
    margin 0 10px 0 10px
  .pdb30
    padding-bottom 30px!important
  .panel-bd.form
    padding 0!important
  .pad0
    padding 0!important

  // 图文
  .thumb-info
    width 100%
    position relative
    clearfix()
    label.form-control
      float left
      text-align right
      /*width 70px*/
      line-height 120px
      /*padding-right 20px*/
      box-sizing border-box
    .controls-image
      float left
      width 182px
      min-width 182px
      overflow hidden

      .image-uploader-item
        margin-bottom 0
    .thumb
      float left
      width 170px

      .image-uploader-item
        margin-bottom 0
    .info-text
      margin-left 170px
      box-sizing border-box
      height 120px
      position relative
      .input-text-wrap
      .input-text
        height 100%
    .button-list
      absolute right -30px top
      height 120px
      opacity 0
      /*transition opacity ease 0.3s*/
      .control-button
        height 25px
        width 25px
        line-height 25px
        margin-bottom 6px
        background #999
        text-align center
        cursor pointer
        &:hover
          background red
        i.icon
          color #fff
    &:hover
      .button-list
        opacity 1

  /*预览*/
  .mask
    fixed left top
    size 100%
    background rgba(0, 0, 0, .6)
    z-index 1000
    display table
    transition opacity .2s ease

    .preview-wrapper
      display table-cell
      vertical-align middle

    .preview-dialog
      position relative
      background rgba(255, 255, 255, .95)
      margin 0 auto
      width 320px
      box-shadow 0 2px 8px rgba(0, 0, 0, .3)
      transition all .3s ease

      .fa-times-circle
        absolute right top 3px
        size 40px
        line-height 40px
        text-align center
        cursor pointer
        font-size 16px
        color #666
        transition color .3s

        &:hover
          color red

    .preview-header
      padding 10px 20px
      border-bottom 1px solid #DDD

      h3
        font-weight normal
        color gray-darker
        margin 0

    .preview-body
      max-height 540px
      overflow-y auto
      box-sizing border-box
      background-color #F2F2F2

      .app-header
        font-size 18px
        text-align center
        padding 10px 0
        border-bottom 1px solid default-border-color
        background-color #fff
      .preview-thumb
        /*width 380px*/
        height 200px
        margin-bottom 10px
        img
          width 100%
          height 100%
      .preview-panel
        background #FFF
        padding 0 10px
        margin-bottom 10px
      .preview-panel-hd
        font-size 12px
        margin-bottom 10px
        padding 10px 0
        border-bottom 1px solid light-border-color

        .preview-panel-hd-actions
          float right

          span
            display inline-block
            background #999
            color #FFF
            line-height 20px
            padding 0 10px
            border-radius 20px

        h3
          font-size 14px
          margin 0
      .preview-panel-bd
        font-size 12px
        padding-bottom 10px

        table
          width 100%
          td
            padding 5px 0

      .device-panel
        padding 1px 0 15px

      .introduce
        margin 0
        border-bottom 1px solid light-border-color
        padding-bottom 10px

      .metas
        padding-top 10px
        clearfix()

        .meta
          float left
          width 50%
          text-align center
      .introlist
        clearfix()
        margin-top 5px
        li
          float left
          width 50%
          text-align center
          padding 10px 0
          line-height 25px
          height 25px
      .posdiv
        position relative
        padding-bottom 10px
        border-bottom 1px solid #999
        margin-bottom 10px
        span
          display inline-block
          position absolute
          right 5px
          background-color #999
          font-size 12px
          padding 3px 10px
          border-radius 10px
          color #fff
      h4
        text-align center
      .foolist
        clearfix()
        li
          float left
          width 50%
          text-align left
      .table
        margin 0

      // 错误信息
      .error-msg
        text-align center
        margin-bottom 30px

    .cooking-devices
      text-align center

      .cooking-device-item
        display inline-block
        size 64px
        background-color #F3F3F3
        background-repeat no-repeat
        background-position center center
        border-radius 40px
        margin 0 15px

      .device1
        background-image url('../assets/images/device_1.png')

      .device2
        background-image url('../assets/images/device_2.png')

    .preview-actions
        text-align center

        .btn
          width 120px

    .preview-footer
      padding 0 30px 20px
      text-align right
      clearfix()
      /*end*/
  .panel
    padding-bottom 5px
  .previewForm
    display table-cell
    vertical-align middle
  .dis
    display inline-block
  .m10
    margin 10px
  .childinblock div
    display inline-block
    margin-top 5px
    margin-left 5px
  .recipe-form
    .form
      max-width 800px
      .form-row
        max-height 5000px
        .fa-times
          cursor pointer
        .controls
          .select-group1
            position relative
            width 400px
            margin 0 10px 10px 0
            padding-right 30px
          .input-text-wrap
            input.input-text-time
              border 1px solid default-border-color
              display inline-block
              width 120px
              box-sizing border-box
              font-size 14px
              height 32px
              line-height 32px
              padding 6px 20px
              margin-right 10px
            span.text-time
              margin-right 10px

      // 设备列表
      .device-list
        .device-list-item
          position relative
          font-size 12px

          .device-name
            font-size 14px
            font-weight bold
            line-height 26px

          .cooking-time
            line-height 26px

            .input-text-wrap
              display inline-block

              .input-text
                font-size 12px
                size 90px 26px
                line-height 24px
                padding 0 5px

          .fa-times
            font-size 14px
            size 24px
            line-height 24px
            background rgba(255, 0, 0, .5)
            color #FFF
            text-align center
            z-index 100

        .step-list-item
          margin 20px 0
          border 1px solid default-border-color
          padding 0 0 10px 10px

          .step-num
            text-align center

            span
              position relative
              display inline-block
              line-height 24px
              padding 0 20px
              border 1px solid default-border-color
              border-radius 20px
              font-weight bold
              background #FFF
              top -13px
  // 浮窗
  .modal
    .modal-body
      clearfix()
      .status-bar
        padding 0
        border 0
        .x-select
          float left
          display inline-block
          padding-left 10px
        .search-box
          float right

    .to-select-list
      width 65%
      float left

    .pager
      margin-top 10px

    .selected-list
      width 33%
      float right
      border 1px solid light-border-color
      box-sizing border-box
      background #FFF

      h3
        font-size 14px
        padding 0 20px
        line-height 35px
        margin 0
        border-bottom 1px solid #e4e4e4

      ul
        margin 0
        max-height 310px
        list-style none
        overflow auto

      li
        border-bottom 1px solid #e4e4e4
        font-size 12px
        position relative
        line-height 30px
        padding 0 20px

        .fa
          height 100%
          top 0
          line-height 30px

        &:nth-child(2n-1)
          background #F9F9F9

        &:last-child
          border-bottom none

    .button-box
      width 100%
      box-sizing border-box
      text-align right
      .btn
        margin-left 10px
</style>
