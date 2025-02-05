<template>
  <div class="max-width-container">
    <el-container class="h-screen">
      <el-aside width="200px" class="bg-gray-100 shadow-lg">
        <el-menu :default-active="$route.path" router class="h-full">
          <el-menu-item index="/create-competition">
            <el-icon>
              <document />
            </el-icon>
            <span>创建比赛</span>
          </el-menu-item>
          <el-menu-item index="/history-competition">
            <el-icon>
              <clock />
            </el-icon>
            <span>历史比赛</span>
          </el-menu-item>
          <el-menu-item index="/settings">
            <el-icon>
              <setting />
            </el-icon>
            <span>系统设置</span>
          </el-menu-item>
        </el-menu>
      </el-aside>

      <el-main class="p-6 bg-gray-50">
        <router-view />
      </el-main>
    </el-container>
  </div>

</template>

<script setup lang="ts">
import { Document, Clock, Setting } from '@element-plus/icons-vue'
</script>
<style scoped lang="scss">
.max-width-container {
  max-width: 1200px;
  /* 设置最大宽度为 1000px */
  margin: 0 auto;
  /* 水平居中 */
}

.el-aside {
  padding-top: 30px;
}
</style>
