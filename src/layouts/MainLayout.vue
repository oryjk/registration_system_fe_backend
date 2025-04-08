<template>
  <div class="max-width-container">
    <el-container class="h-screen">
      <el-header class="bg-white shadow-md flex items-center justify-between px-8 border-b h-16">
        <div class="flex items-center">
          <el-image
            class="w-8 h-8 mr-3"
            src="/logo.png"
            fit="contain"
          />
          <h1 class="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
            比赛管理系统
          </h1>
        </div>
        <div class="flex items-center space-x-4">
          <el-avatar :size="32" :icon="User" />
        </div>
      </el-header>
        <!-- 修改为水平菜单 -->
        <el-menu
          :default-active="$route.path"
          mode="horizontal"
          router
        >
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


      <!-- 移除 el-aside 侧边栏 -->
      <el-main class="p-6 bg-gray-50">
        <router-view />
      </el-main>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import { Document, Clock, Setting } from '@element-plus/icons-vue'
import { useRouter, useRoute } from 'vue-router';
import { onMounted } from 'vue';
import { User } from '@element-plus/icons-vue'
import { useUserStore } from '../store/userStore'

const router = useRouter();
const route = useRoute();
onMounted(() => {
  const userStore = useUserStore();
  userStore.fetchUserInfos();
  // 如果当前路由不是 /history-competition，则导航到该路由
  if (route.path !== '/history-competition') {
    router.push('/history-competition');
  }
});
</script>
<style scoped lang="scss">
.max-width-container {
  max-width: 1200px;
  margin: 0 auto;
}

/* 优化水平菜单样式 */
.el-menu--horizontal {
  border-bottom: none !important;

  .el-menu-item {
    height: 60px;
    line-height: 60px;
    padding: 0 20px;
    transition: all 0.3s;

    &:hover {
      background: #f5f7fa;
    }

    &.is-active {
      color: #409eff;
      border-bottom: 2px solid #409eff;
    }
  }
}
</style>
