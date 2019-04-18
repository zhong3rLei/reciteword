import wh_scroll from './scroll.vue'

let _scroll = {}
_scroll.install = (Vue, options) => {
    Vue.component(wh_scroll.name, wh_scroll)
}

export default _scroll;