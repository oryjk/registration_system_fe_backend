import { createApp } from "vue";
import ElementPlus from "element-plus";
import "element-plus/dist/index.css";
import App from "./App.vue";
import router from "./router"; // 引入路由实例
import zhCn from "element-plus/dist/locale/zh-cn.mjs";
import { createPinia } from "pinia";
import "./style.css"; // 添加这行导入

const pinia = createPinia();

const app = createApp(App);

app.use(ElementPlus, {
  locale: zhCn, // 设置 locale
});
app.use(pinia);
app.use(router); // 使用路由实例
app.mount("#app");
