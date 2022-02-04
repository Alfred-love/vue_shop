import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'
// 导入字体图标
import './assets/fonts/iconfont.css'
// 导入全局样式文件
import './assets/css/global.css'
// 导入表格文件
import TreeTable from 'vue-table-with-tree-grid'
// 导入请求文件
import './request.js'
// 导入时间处理函数并全局应用
import dayjs from 'dayjs'
// 1.导入富文本编辑器
import VueQuillEditor from 'vue-quill-editor'
// 2.require styles 导入富文本编辑器对应的样式
import 'quill/dist/quill.core.css' // import styles
import 'quill/dist/quill.snow.css' // for snow theme
import 'quill/dist/quill.bubble.css'
Vue.prototype.dayjs = dayjs // for bubble theme

Vue.config.productionTip = false

Vue.component('tree-table', TreeTable)
// 3.将富文本编辑器注册成为全局可用的组件
Vue.use(VueQuillEditor)

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
