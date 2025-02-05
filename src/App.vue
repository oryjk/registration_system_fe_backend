<template>
  <div id="app">
    <!-- 路由出口 -->
    <router-view></router-view>
  </div>
</template>

<script lang="ts" setup>
// 这里可以编写 App 组件的逻辑
</script>

<style>
#app {
  @apply h-screen;
}

.page-container {
  @apply max-w-4xl mx-auto bg-white p-6 rounded-lg shadow;
}

.el-menu {
  border-right: none !important;
}
</style>