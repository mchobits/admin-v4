<template>
  <div class="main">
    <div class="main-title">
      <h2>标签设置</h2>
    </div>
    <tab :nav="secondaryNav"></tab>
    <router-view transition="view" transition-mode="out-in" class="view"></router-view>
  </div>
</template>

<script>
export default {
  name: 'AddRecipe',
  components: {
  },

  data () {
    return {
      secondaryNav: [{
        label: '告警类型标签',
        link: { path: '/dev/settings/tag/alert' }
      }]
    }
  }
}
</script>
