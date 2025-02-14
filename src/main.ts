import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import App from './App.vue'
import router from './router'; // 引入路由实例
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'


const app = createApp(App)

app.use(ElementPlus, {
  locale: zhCn, // 设置 locale
})
app.use(router) // 使用路由实例
app.mount('#app')
