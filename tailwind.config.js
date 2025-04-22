/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  darkMode: "class", // 支持暗黑模式切换
  theme: {
    extend: {
      // 可在此扩展自定义主题颜色
      colors: {
        primary: "#409EFF", // 保持与 Element Plus 主题色一致
      },
    },
  },
  plugins: [
    // 如需集成 Element Plus 可在此添加插件
    // require('@tailwindcss/forms')
  ],
  corePlugins: {
    // 禁用与 Element Plus 冲突的基础样式
    preflight: false,
  },
};
