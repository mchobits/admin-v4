<template>
  <div class="x-pagination">
    <div class="fr">
      <div class="x-pagination-control" v-if="!simple">
        <x-select width="30px" :label="countPerPage.toString()" size="small">
          <span slot="label">{{ $t('components.pager.display') }}</span>
          <select v-model="countPerPage" @change="onCountChange">
            <option v-for="n in countOptions" :value="n">{{ n }}</option>
          </select>
        </x-select>
      </div>
      <div class="x-pagination-control" v-if="!simple">
        <div class="turn-to-page">
          <span>{{ $t('components.pager.total_page', {pages: pages}) }}{{ $t('components.pager.turn_to') }}</span>
          <div class="input-text-wrap">
            <input type="number" class="input-text input-text-sm" v-model="destPage" number @keypress.enter.prevent.stop="goToPage">
          </div>
          <span>{{ $t('components.pager.page') }}</span>
        </div>
      </div>
      <div class="x-pagination-control">
        <span>{{ $t('components.pager.item_range', {start: countPerPage*(current-1)+1, end: rangeText}) }}{{ $t('components.pager.total_items', {total: total}) }}</span>
      </div>
      <div class="x-pagination-control">
        <button-group>
          <button :class="{'disabled': current === 1}" :disabled="current === 1" @click.stop.prevent="onPageChange(current-1)" class="btn x-pagination-prev"><i class="fa fa-chevron-left"></i></button>
          <button :class="{'disabled': current === pages}" :disabled="current === pages" @click.stop.prevent="onPageChange(current+1)" class="btn x-pagination-next"><i class="fa fa-chevron-right"></i></button>
        </button-group>
      </div>
    </div>
  </div>
</template>

<script>
// import { COUNT_PER_PAGE } from 'consts/config'
export default {
  name: 'Pagination',
  props: {
    // 每页数量选项
    countOptions: {
      type: Array,
      default () {
        return [5, 10, 20, 50, 100]
      }
    },

    // 每页数量
    countPerPage: {
      type: Number,
      default: 10
    },

    // 总数
    total: {
      type: Number
    },

    // 当前页
    current: {
      type: Number,
      default: 1
    },

    // 是否简单分页
    simple: {
      type: Boolean,
      default: false
    }
  },

  data () {
    return {
      destPage: ''
    }
  },

  // watch: {
  //   current () {
  //     this.$emit('page-update', this.current)
  //   }
  // },

  computed: {
    pages () {
      return Math.ceil(this.total / this.countPerPage) || 1
    },

    rangeText () {
      return this.total < this.countPerPage * this.current ? this.total : this.countPerPage * this.current
    }
  },

  ready () {
    this.$emit('pagination-created', this)
  },

  methods: {
    /**
     * 处理分页变化
     * @param  {[type]} page [description]
     * @return {[type]}      [description]
     */
    onPageChange (page) {
      if (page && page <= this.pages) {
        this.current = page
        this.$emit('page-update', this.current)
      } else {
        this.showNotice({
          type: 'error',
          content: '页码不合法'
        })
      }
    },

    goToPage (ev) {
      if (this.destPage > 0 && this.destPage <= Math.ceil(this.total / this.countPerPage)) {
        this.onPageChange(this.destPage)
        this.destPage = ''
      } else {
        this.showNotice({
          type: 'error',
          content: '页数不合法！'
        })
      }
    },

    // 处理
    onCountChange () {
      this.$emit('count-update', this.countPerPage)
    }
  }
}
</script>

<style lang="stylus">
@import '../../../assets/stylus/common'

// 分页
.x-pagination
  font-size 0
  margin-top 10px
  clearfix()

  .x-pagination-control
    font-size 12px
    display inline-block
    margin-left 15px
    vertical-align middle

    .input-text-wrap
      display inline-block
      width 50px
      vertical-align middle

      .input-text
        text-align center
    .turn-to-page
      display inline-block
      vertical-align middle

  .x-btn-group
    .btn
      .fa
        margin 0
</style>
