<template>
  <div class="rich-text-editor">
    <div class="editor-content" :style="editorStyles" v-html="inputContent" @input="outputContent"></div>
  </div>
</template>

<script>
// http://wangeditor.github.io/
import WangEditor from 'wangeditor'
import { API_SERVER } from 'consts/config'
import browser from 'utils/browser'

export default {
  name: 'Editor',

  props: {
    // 输入内容
    inputContent: {
      type: String,
      default: ''
    },

    // 图片上传 URL
    uploadUrl: {
      type: String,
      // default: `${API_SERVER.default}/v2/upload/image?content_type=data_uri`
      default: `${API_SERVER.default}/v2/upload/image`
    },

    // 编辑器高度
    height: {
      type: String,
      default: '400px'
    }
  },

  data () {
    return {
      content: ''
    }
  },

  computed: {
    // 编辑器样式
    editorStyles () {
      return {
        height: this.height
      }
    }
  },

  ready () {
    this.createEditor()
  },

  methods: {
    /**
     * 创建编辑器
     * @author shengzhi
     */
    createEditor () {
      let self = this
      let editor = new WangEditor(this.$el.getElementsByClassName('editor-content')[0])
      let browserLang = browser.language === 'zh-cn' || browser.language === 'zh-tw' ? 'zh-cn' : 'en-us'
      let lang = window.localStorage.getItem('lang') || browserLang
      let langMap = {
        'zh-cn': 'zh-cn',
        'en-us': 'en'
      }

      editor.config.lang = WangEditor.langs[langMap[lang]]

      // 工具菜单栏配置
      editor.config.menus = ['fontsize', 'forecolor', '|', 'bold', 'italic', 'underline', '|', 'link', 'unlink', 'img', '|', 'fullscreen']

      // 图片上传配置
      editor.config.uploadImgUrl = this.uploadUrl
      editor.config.uploadHeaders = {
        // 'Content-Type': 'multipart/form-data',
        'Content-Type': 'application/x-www-form-urlencoded',
        'Access-Token': window.localStorage.getItem('accessToken')
      }

      // 自定义 load 事件
      editor.config.uploadImgFns.onload = function (resultText, xhr) {
        // 上传图片时，已经将图片的名字存在 editor.uploadImgOriginalName
        let originalName = editor.uploadImgOriginalName || ''
        let res = JSON.parse(resultText)
        editor.command(null, 'insertHtml', '<img src="' + res.url + '" alt="' + originalName + '" style="max-width:100%;"/>')
      }

      // 自定义 error 事件
      editor.config.uploadImgFns.onerror = function (xhr) {
        // xhr 是 xmlHttpRequest 对象，IE8、9中不支持
        alert('上传错误')
      }

      editor.onchange = function () {
        self.formatContent(this.$txt.html())
      }
      editor.create()
    },

    /**
     * 格式化内容
     * @author shengzhi
     * @param {String} content 内容
     */
    formatContent (content) {
      this.content = content
      this.outputContent()
    },

    /**
     * 输出内容
     * @author shengzhi
     */
    outputContent () {
      this.$emit('input', this.content)
    }
  }
}
</script>

<style lang="stylus">
@import '../../../assets/stylus/common'

.rich-text-editor
  i
    font-style italic

  .wangEditor-container
    border 1px solid default-border-color !important

  .wangEditor-menu-container
    .menu-item
      height 27px

  .wangEditor-drop-panel input[type=text],
  .txt-toolbar input[type=text]
    height auto
    font-size 12px
</style>
