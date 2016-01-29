var Vue = require('vue');
var VueRouter = require('vue-router');
var VueForm = require('vue-form');
var i18n = require('vue-i18n');
var browser = require('./helpers/browser');

if (__DEBUG__) {
  console.log('系统语言：' + browser.language);
}

// 多语言配置文件
var locales = require('./consts/locales');

// 路由设置
var configRouter = require('./route-config');
var router;

// 配置
// var config = require('./consts/config');

// 创建 vue 实例
var App = Vue.extend(require('./app.vue'));

// 调试模式
Vue.config.debug = __DEBUG__;

// 加载路由插件
Vue.use(VueRouter);

// 使用表单验证插件
// 详见：https://github.com/fergaldoyle/vue-form
Vue.use(VueForm);

// 使用多语言插件
// 切换语言设置 `Vue.config.lang = 'en'`
// 详见：https://github.com/kazupon/vue-i18n
Vue.use(i18n, {
  // lang: browser.language === 'zh-cn' || browser.language === 'zh-tw' ? 'zh-cn' : 'en-us',
  lang: 'zh-cn',
  locales: locales
});

// console.log(Vue.config.lang);

// 指令
// ------------------------------

// input/textarea占位符
Vue.directive('placeholder', {
  bind: function () {
    var self = this;
    var vModel;
    var handlePlaceholder = function () {
      if (this.input.value.length === 0) {
        this.placeholder.style.display = 'inline';
      } else {
        this.placeholder.style.display = 'none';
      }
    };

    this.placeholder = document.createElement('span');
    this.placeholder.className = 'placeholder';
    this.el.appendChild(this.placeholder);

    this.input = this.el.getElementsByClassName('input-text')[0];
    vModel = this.input.getAttribute('v-model');

    if (vModel) {
      this.vm.$watch(vModel, function (value, oldValue) {
        if (value === undefined || value.length === 0) {
          self.placeholder.style.display = 'inline';
        } else {
          self.placeholder.style.display = 'none';
        }
      }, { immediate: true });
    }

    this.input.addEventListener('input', function () {
      handlePlaceholder.apply(self);
    });

    this.placeholder.addEventListener('click', function () {
      self.input.focus();
    });

    this.input.addEventListener('blur', function () {
      handlePlaceholder.apply(self);
    });

    handlePlaceholder.apply(this);
  },

  update: function (value) {
    this.placeholder.innerText = value;
  }
});

// 过滤器
// ------------------------------

// 日期格式化
Vue.filter('formatDate', function (value) {
  if (value !== undefined && value.length > 0) {
    return value.replace('T', ' ').replace('Z', '');
  } else {
    return value;
  }
});

// 过渡效果
// ------------------------------

// 渐进过渡
Vue.transition('stagger', {
  stagger: function (index) {
    return Math.min(300, index * 50);
  }
});

// 混合
// ------------------------------
Vue.mixin({
  methods: {
    /**
     * 检验数字
     */
    numberic: function (value) {
      return /^\d*$/.test(value);
    },

    /**
     * 检验字符串中是否不含空格
     */
    noSpaces: function (value) {
      return /^\S+$/.test(value);
    },

    /**
     * 检验字符串中是否不以空格开头或结尾
     */
    noSpacesPrefixAndSuffix: function (value) {
      return /^\S(.*\S)*$/.test(value);
    },

    // 统一的错误处理
    handleError: function (error) {
      // if (/^400/.test(error.code)) {
        // alert(config.errors[error.msg] || error.msg);
      // }
      // alert(locales[Vue.config.lang][error.code]);
      if (error.code && /^[4|5]/.test(error.code)) {
        // console.log(error);

        if (error.code === 4031003) {
          this.$route.router.app.access = false;
          this.$route.router.go('/login');
        } else {
          alert(locales[Vue.config.lang].errors[error.code]);
        }
      }
    }
  }
});

// 路由
router = new VueRouter({
  // history: true,
  // saveScrollPosition: true
});

configRouter(router);

router.start(App, '#app');
