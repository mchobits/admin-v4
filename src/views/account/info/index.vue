<template>
  <div class="main">
    <div class="account-info">
      <h2>{{ currentMember.name }}</h2>
      <div class="details row">
        <div class="col-16">
          <div v-stretch="182">
            <info-list :info="accountInfo">
              <a href="#" class="hl-red" @click.prevent="editPwd" slot="password">修改密码</a>
            </info-list>
          </div>
        </div>
      </div>
    </div>

    <!-- 修改密码浮层 start -->
    <modal :show.sync="isShowModal" width="400px">
      <h3 slot="header">{{ $t("ui.auth.reset") }}</h3>
      <div slot="body" class="form">
        <validator name="validation">
          <form novalidate @submit.prevent="onSubmitPwd">
            <div class="form-row row">
              <label class="form-control col-6">{{ $t('ui.account.fields.old_password') }}</label>
              <div class="controls col-18">
                <div class="input-text-wrap">
                  <input type="password" v-model="model.oldpassword" name="model.oldpassword" v-validate:oldpassword="{required: true, minlength: 8, maxlength: 16}" lazy class="input-text"/>
                </div>
                <div class="form-tips form-tips-error">
                  <span v-if="$validation.oldpassword.touched && $validation.oldpassword.required">{{ $t('ui.validation.required', {field: $t('ui.account.fields.old_password')}) }}</span>
                  <span v-if="$validation.oldpassword.touched && $validation.oldpassword.minlength">{{ $t('ui.validation.minlength', [$t('ui.account.fields.old_password'), 8]) }}</span>
                  <span v-if="$validation.oldpassword.touched && $validation.oldpassword.maxlength">{{ $t('ui.validation.maxlength', [$t('ui.account.fields.old_password'), 16]) }}</span>
                </div>
              </div>
            </div>
            <div class="form-row row">
              <label class="form-control col-6">{{ $t('ui.account.fields.new_password') }}</label>
              <div class="controls col-18">
                <div class="input-text-wrap">
                  <input type="password" v-model="model.newpassword" name="model.newpassword" v-validate:newpassword="{required: true, minlength: 8, maxlength: 16}" lazy class="input-text"/>
                </div>
                <div class="form-tips form-tips-error">
                  <span v-if="$validation.newpassword.touched && $validation.newpassword.required">{{ $t('ui.validation.required', {field: $t('ui.account.fields.new_password')}) }}</span>
                  <span v-if="$validation.newpassword.touched && $validation.newpassword.minlength">{{ $t('ui.validation.minlength', [$t('ui.account.fields.new_password'), 8]) }}</span>
                  <span v-if="$validation.newpassword.touched && $validation.newpassword.maxlength">{{ $t('ui.validation.maxlength', [$t('ui.account.fields.new_password'), 16]) }}</span>
                </div>
              </div>
            </div>
            <div class="form-row row">
              <label class="form-control col-6">{{ $t('ui.auth.fields.confirm_password') }}</label>
              <div class="controls col-18">
                <div class="input-text-wrap">
                  <input type="password" v-model="confirmPassword" name="confirmPassword" v-validate:confirm-password="{required: true, equal: model.oldpassword}" lazy class="input-text"/>
                </div>
                <div class="form-tips form-tips-error">
                  <span v-if="$validation.confirmPassword.touched && $validation.confirmPassword.required">{{ $t('ui.validation.required', {field: $t('ui.auth.fields.confirm_password')}) }}</span>
                  <span v-if="$validation.confirmPassword.touched && $validation.confirmPassword.equal">{{ $t('ui.validation.equal', [$t('ui.auth.fields.confirm_password'), $t('ui.auth.fields.password')]) }}</span>
                </div>
              </div>
            </div>
            <div class="form-actions">
              <button @click.prevent.stop="onEditPwdCancel" class="btn btn-default">{{ $t("common.cancel") }}</button>
              <button type="submit" :disabled="editing" :class="{'disabled':editing}" v-text="editing ? $t('common.handling') : $t('common.ok')" class="btn btn-primary"></button>
            </div>
          </form>
        </validator>
      </div>
    </modal>
    <!-- 修改密码浮层 end -->
  </div>
</template>

<script>
import { globalMixins } from 'src/mixins'
import { editPasswordMixin } from '../mixins'
import InfoList from 'components/InfoList'
import Modal from 'components/Modal'
import store from 'store'
import { formatDate } from 'src/filters'
import api from 'api'
// import _ from 'lodash'

export default {
  name: 'Info',

  // editPasswordMixin提供编辑密码的逻辑
  mixins: [globalMixins, editPasswordMixin],

  store,

  vuex: {
    getters: {
      currentMember: ({ system }) => system.currentMember
    }
  },

  components: {
    InfoList,
    Modal
  },

  data () {
    return {
      originModel: {
        oldpassword: '',
        newpassword: ''
      },
      model: {}
    }
  },

  computed: {
    accountInfo () {
      return {
        role: {
          label: '角色',
          value: this.locales.data.MEMBER_TYPES[this.currentMember.role - 1]
        },
        password: {
          label: '密码',
          slot: true
        },
        phone: {
          label: '手机',
          value: this.currentMember.phone
        },
        email: {
          label: '邮箱',
          value: this.currentMember.email
        },
        lastAuthTime: {
          label: '最后登录',
          value: formatDate(this.currentMember.last_auth_time)
        },
        createTime: {
          label: '创建时间',
          value: formatDate(this.currentMember.create_time)
        }
      }
    }
  },

  methods: {
    /**
     * 提交密码修改
     * @author shengzhi
     */
    onSubmitPwd () {
      if (this.$validation.valid && !this.editing) {
        this.editing = true
        api.corp.memberResetPwd(this.model).then((res) => {
          if (res.status === 200) {
            this.showNotice({
              type: 'success',
              content: this.$t('ui.account.password_msg')
            })
          }
          this.onEditPwdCancel()
        }).catch((res) => {
          this.handleError(res)
          this.editing = false
        })
      }
    }
    // /**
    //  * 修改密码
    //  * @author shengzhi
    //  */
    // editPwd () {
    //   this.isShowModal = true
    //   this.confirmPassword = ''
    //   this.model = _.clone(this.originModel)
    // },
    //
    // /**
    //  * 取消修改密码
    //  * @author shengzhi
    //  */
    // onEditPwdCancel () {
    //   this.editing = false
    //   this.isShowModal = false
    //   this.$nextTick(() => {
    //     this.$resetValidation()
    //   })
    // },
    //
    // /**
    //  * 提交密码修改
    //  * @author shengzhi
    //  */
    // onSubmitPwd () {
    //   if (this.$validation.valid && !this.editing) {
    //     this.editing = true
    //     api.corp.memberResetPwd(this.model).then((res) => {
    //       if (res.status === 200) {
    //         this.showNotice({
    //           type: 'success',
    //           content: this.$t('ui.account.password_msg')
    //         })
    //       }
    //       this.onEditPwdCancel()
    //     }).catch((res) => {
    //       this.handleError(res)
    //       this.editing = false
    //     })
    //   }
    // }
  }
}
</script>

<style lang="stylus" scoped>
@import '../account-info'
</style>