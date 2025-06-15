<template>
  <div class="max-width-container">
    <el-container class="h-screen">
      <el-header class="bg-white shadow-md flex items-center justify-between px-8 border-b h-16">
        <div class="flex items-center">
          <el-icon style="font-size: 30px; color: #479dfb; margin-right: 20px;">
            <List />
          </el-icon>
          <h1 class="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
            比赛管理系统
          </h1>
        </div>
        <div class="flex items-center space-x-4">
          <el-button type="primary" :icon="Refresh" circle />
          <div class="flex items-center space-x-2">
            <el-avatar :size="32" :src="currentUser?.avatarUrl" :icon="User" />
            <span class="text-gray-700">{{ currentUser?.nickname || '未登录' }}</span>
          </div>
          <el-button type="danger" @click="handleLogout">退出登录</el-button>
        </div>
      </el-header>
      <!-- 修改为水平菜单 -->
      <el-menu :default-active="$route.path" mode="horizontal" router>
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
        <el-menu-item index="/user-info">
          <el-icon>
            <User />
          </el-icon>
          <span>用户信息</span>
        </el-menu-item>
        <el-menu-item index="/user-billing">
          <el-icon>
            <document />
          </el-icon>
          <span>用户账单</span>
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
import { Document, Clock, Setting, Refresh, List } from '@element-plus/icons-vue'
import { useRouter, useRoute } from 'vue-router';
import { onMounted } from 'vue';
import { User } from '@element-plus/icons-vue'
import { useUserStore } from '../store/userStore'
import { computed } from 'vue';

const userStore = useUserStore()

// 处理退出登录
const handleLogout = () => {
  // 清除本地存储的用户信息
  localStorage.removeItem('userInfo')
  // 重置用户状态
  userStore.$reset()
  // 跳转到登录页
  router.push('/login')
}

const router = useRouter();
const route = useRoute();
onMounted(async () => {
  await userStore.fetchUserInfos();

});

const currentUser = computed(() => {
  const userInfo = localStorage.getItem('userInfo')
  return userInfo ? JSON.parse(userInfo) : null
})
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
