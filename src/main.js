import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'
//导入字体图标
import './assets/fonts/iconfont.css'
// 导入全局样式文件
import './assets/css/global.css'
//导入表格文件
import TreeTable from 'vue-table-with-tree-grid'
//导入请求文件
import './request.js'

Vue.config.productionTip = false

Vue.component('tree-table', TreeTable)

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
