import './assets/main.css'
import './assets/animations.css'
import './assets/custom-transitions.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

// Element Plus 组件库
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
// @ts-expect-error - 忽略类型检查错误
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'
import {
  ElConfigProvider,
  ElTooltip,
  ElCollapse,
  ElCollapseItem,
  ElPagination,
  ElInput,
  ElIcon,
  ElButton,
} from 'element-plus'

// 创建 Vue 应用
const app = createApp(App)

// 注册 Element Plus 组件
app.component('ElConfigProvider', ElConfigProvider)
app.component('ElTooltip', ElTooltip)
app.component('ElCollapse', ElCollapse)
app.component('ElCollapseItem', ElCollapseItem)
app.component('ElPagination', ElPagination)
app.component('ElInput', ElInput)
app.component('ElButton', ElButton)
app.component('ElIcon', ElIcon)

// 使用插件
app.use(router)
app.use(ElementPlus, {
  locale: zhCn,
})

app.mount('#app')
