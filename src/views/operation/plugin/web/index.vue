<template>
  <section class="main-wrap">
    <div class="main">
      <div class="breadcrumb"><a v-link="{path: '/plugins/customize'}" class="fa fa-arrow-circle-left">返回应用列表</a></div>
      <div class="panel">
        <div class="panel-hd">
          <h2>{{ currentPlugin.name }}</h2>
        </div>
        <div class="panel-bd">
          <tab :nav="secondaryNav"></tab>
        </div>
      </div>
      <router-view transition="view" transition-mode="out-in" class="view"></router-view>
    </div>
  </section>
</template>
<script>
  import { setCurrPlugin } from 'store/actions/plugins'
  import api from 'api'

  export default {
    name: 'Statistic',
    components: {
    },

    vuex: {
      getters: {
        currentPlugin: ({ plugins }) => plugins.curr
      },
      actions: {
        setCurrPlugin
      }
    },

    data () {
      return {
        secondaryNav: []
      }
    },

    route: {
      data () {
        var appId = this.$route.params.id
        this.getPlugin()

        return {
          secondaryNav: [{
            label: '应用配置',
            link: { path: '/plugins/web/' + appId + '/settings' }
          }]
        }
      }
    },

    methods: {
      getPlugin () {
        api.plugin.get(this.$route.params.id).then((res) => {
          if (res.status === 200) {
            this.setCurrPlugin(res.data)
          }
        })
      }
    }
  }
</script>
