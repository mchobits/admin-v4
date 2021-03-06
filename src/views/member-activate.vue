<template>
  <div class="form form-auth form-member-activate">
    <div class="form-logo"></div>
    <form autocomplete="off" v-show="!activateSuccess" v-form name="validation" @submit.prevent="onSubmit" class="form-cont">
      <div class="form-header">
        <h2>{{ $t("auth.member_activate") }}</h2>
        <p>{{ $t("auth.member_activate_tips") }}</p>
      </div>
      <div class="form-body">
        <div class="form-row row">
          <div v-placeholder="$t('auth.fields.name')" class="input-text-wrap">
            <input type="text" v-model="model.name" v-form-ctrl required maxlength="32" minlength="2" name="name" lazy class="input-text"/>
          </div>
          <div v-if="validation.$submitted && validation.name.$pristine" class="form-tips form-tips-error"><span v-if="validation.name.$error.required">{{ $t('common.validation.required', {field: $t('auth.fields.name')}) }}</span></div>
          <div v-if="validation.name.$dirty" class="form-tips form-tips-error"><span v-if="validation.name.$error.required">{{ $t('common.validation.required', {field: $t('auth.fields.name')}) }}</span><span v-if="validation.name.$error.minlength">{{ $t('common.validation.minlength', [ $t('auth.fields.name'), 2]) }}</span><span v-if="validation.name.$error.maxlength">{{ $t('common.validation.maxlength', [ $t('auth.fields.name'), 32]) }}</span></div>
        </div>
        <div class="form-row row">
          <div v-placeholder="$t('auth.fields.phone')" class="input-text-wrap">
            <input type="text" v-model="model.phone" v-form-ctrl required :pattern="patterns.PHONE" name="phone" lazy class="input-text"/>
          </div>
          <div v-if="validation.$submitted && validation.phone.$pristine" class="form-tips form-tips-error"><span v-if="validation.phone.$error.required">{{ $t('common.validation.required', {field: $t('auth.fields.phone')}) }}</span></div>
          <div v-if="validation.phone.$dirty" class="form-tips form-tips-error"><span v-if="validation.phone.$error.required">{{ $t('common.validation.required', {field: $t('auth.fields.phone')}) }}</span><span v-if="validation.phone.$error.pattern">{{ $t('common.validation.format', {field: $t('auth.fields.phone')}) }}</span></div>
        </div>
        <div class="form-row row captcha-row">
          <div v-placeholder="$t('auth.insert_code')" class="input-text-wrap">
            <input type="text" v-model="captcha" lazy class="input-text"/>
          </div>
          <captcha :width="120" :height="32" :value.sync="captchaValue" v-ref:captcha></captcha>
        </div>
        <div class="form-row row verify-code">
          <div v-placeholder="$t('auth.verifycode')" class="input-text-wrap">
            <input type="text" v-model="model.verifycode" v-form-ctrl required name="verifycode" lazy class="input-text"/>
          </div>
          <button @click.stop.prevent="fetchVerifyCode" :class="{'disabled': btnDisabled || captcha.toLowerCase() !== captchaValue.toLowerCase()}" v-bind="{'disabled': btnDisabled || captcha.toLowerCase() !== captchaValue.toLowerCase()}" v-text="counting ? $t('auth.wating', {seconds: seconds}) : $t('auth.get_code')" class="btn btn-primary"></button>
          <div v-if="validation.$submitted && validation.verifycode.$pristine" class="form-tips form-tips-error"><span v-if="validation.verifycode.$error.required">{{ $t('common.validation.required', {field: $t('auth.verifycode')}) }}</span></div>
          <div v-if="validation.verifycode.$dirty" class="form-tips form-tips-error"><span v-if="validation.verifycode.$error.required">{{ $t('common.validation.required', {field: $t('auth.verifycode')}) }}</span></div>
        </div>
        <div class="form-row row">
          <div v-placeholder="$t('auth.password')" class="input-text-wrap">
            <input type="password" v-model="model.password" v-form-ctrl required maxlength="16" minlength="6" name="password" lazy class="input-text"/>
          </div>
          <div v-if="validation.$submitted && validation.password.$pristine" class="form-tips form-tips-error"><span v-if="validation.password.$error.required">{{ $t('common.validation.required', {field: $t('auth.fields.password')}) }}</span></div>
          <div v-if="validation.password.$dirty" class="form-tips form-tips-error"><span v-if="validation.password.$error.required">{{ $t('common.validation.required', {field: $t('auth.fields.password')}) }}</span><span v-if="validation.password.$error.minlength">{{ $t('common.validation.minlength', [ $t('auth.fields.password'), 6]) }}</span><span v-if="validation.password.$error.maxlength">{{ $t('common.validation.maxlength', [ $t('auth.fields.password'), 16]) }}</span></div>
        </div>
        <div class="form-row row">
          <div v-placeholder="$t('auth.fields.confirm_password')" class="input-text-wrap">
            <input type="password" v-model="confirmPassword" v-form-ctrl required custom-validator="checkEqualToPassword" name="confirmPassword" lazy class="input-text"/>
          </div>
          <div v-if="validation.$submitted && validation.confirmPassword.$pristine" class="form-tips form-tips-error"><span v-if="validation.confirmPassword.$error.required">{{ $t("auth.confirm_password") }}</span></div>
          <div v-if="validation.confirmPassword.$dirty" class="form-tips form-tips-error"><span v-if="model.password && validation.confirmPassword.$error.required">{{ $t("auth.confirm_password") }}</span><span v-if="validation.confirmPassword.$error.customValidator">{{ $t("auth.confirm_password_tips") }}</span></div>
        </div>
        <div class="form-actions">
          <button type="submit" class="btn btn-primary btn-block">{{ $t("common.ok") }}</button>
        </div>
      </div>
      <div class="form-footer">2015 &copy; {{ $t("common.company") }}.</div>
    </form>
    <div v-show="activateSuccess" class="form-cont reset-password-success">
      <div class="alert alert-success">
        <div class="fa fa-check-circle-o"></div>
        <h2>{{ $t("auth.activate_success") }}</h2>
        <p>{{ $t("auth.activate_success_msg") }}</p>
        <div class="actions"><a v-link="{ path: '/login'}" class="btn btn-primary">{{ $t("common.ok") }}</a></div>
      </div>
      <div class="form-footer">2015 &copy; {{ $t("common.company") }}.</div>
    </div>
  </div>
</template>

<script>
  import api from 'api'
  import * as config from 'consts/config'
  import base64 from 'utils/base64'
  export default {
    name: 'MemberActivateForm',

    layouts: ['auth'],
    data () {
      return {
        validation: {},
        captcha: '',
        captchaValue: '',
        model: {},
        confirmPassword: '',
        verifycodeValid: false,
        counting: false,
        btnDisabled: false,
        seconds: config.VERIFYCODE_DURATION,
        activateSuccess: false
      }
    },

    ready () {
      this.model.email = base64.decode(this.$route.params.email)
    },

    methods: {
      getObjLength (obj) {
        return Object.keys(obj).length
      },

      checkEqualToPassword (value) {
        return value === this.model.password
      },

      checkTypeValid (value) {
        return Number(value) > 0
      },

      tiktac () {
        var itvl = window.setInterval(() => {
          if (this.seconds) {
            this.seconds--
          } else {
            this.seconds = config.VERIFYCODE_DURATION
            this.counting = false
            this.btnDisabled = false
            window.clearInterval(itvl)
          }
        }, 1000)
      },
      fetchVerifyCode () {
        if (this.validation.phone.$invalid) {
          this.showNotice({
            type: 'error',
            content: this.$t('auth.phone_msg')
          })
          return
        }

        this.btnDisabled = true
        this.captcha = ''
        this.$refs.captcha.generate()
        api.sms.getVerifycode({
          phone: this.model.phone
        }).then((res) => {
          if (res.status === 200) {
            this.counting = true
            this.tiktac()
          }
        }).catch((res) => {
          this.handleError(res)
        })
      },
      onSubmit () {
        var content = {'phone': this.model.phone, 'verifycode': this.model.verifycode, 'password': this.model.password, 'email': this.model.email, 'name': this.model.name}

        api.corp.memberActivate(content).then((res) => {
          if (res.status === 200) {
            this.activateSuccess = true
          }
        }).catch((res) => {
          this.handleError(res)
        })
      }
    }
  }
</script>

<style lang="stylus">
  @import '../assets/stylus/common'

  .form-auth.form-member-activate
    .form-cont
      padding-left 100px
      padding-right 100px

    .form-header
      padding 0
      margin-bottom 30px

    .form-body
      padding 0

    .form-actions
      margin-top 30px

    .captcha-row
      clearfix()

      .input-text-wrap
        float left
        width 220px
        margin-right 10px

      .captcha
        float left
        width 120px

    .verify-code
      .input-text-wrap
        float left
        width 220px
        margin-right 10px

      .btn
        float left
        width 120px
</style>
