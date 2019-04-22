import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import './registerServiceWorker'
import axios from 'axios'
import VueAxios from 'vue-axios'
import whscroll from './components/wh-scroll/'
import "./assets/css/common.css"

Vue.use(VueAxios,axios);
Vue.use(whscroll)

Vue.config.productionTip = false
import upperFirst from 'lodash/upperFirst'
import camelCase from 'lodash/camelCase'

const requireComponent = require.context(
    // 其组件目录的相对路径
    './base',
    // 是否查询其子目录
    true,
    // 匹配基础组件文件名的正则表达式
    /\w+\.vue$/
)

requireComponent.keys().forEach(fileName => {
    // 获取组件配置
    const componentConfig = requireComponent(fileName)

    let componentName = null

    // 检测该文件与父文件夹是否同名
    let arr = fileName.split('/').slice(1).map(item => upperFirst(item.replace(/(\w).vue$/, '$1')))
    if (arr.length > 1 && arr[arr.length - 1] == arr[arr.length - 2]) {
        // 组合文件名
        componentName = arr.slice(0, -1).reduce((accu, current) => `${accu}${current}`)
    } else {
        // 获取组件的 PascalCase 命名
        componentName = upperFirst(
            camelCase(
                // 剥去文件名开头的 `./` 和结尾的扩展名
                fileName.replace(/^\.\/(.*)\.\w+$/, '$1')
            )
        )
    }
    
    // 全局注册组件
    Vue.component(
        componentName,
        // 如果这个组件选项是通过 `export default` 导出的，
        // 那么就会优先使用 `.default`，
        // 否则回退到使用模块的根。
        componentConfig.default || componentConfig
    )
})
new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
