<template>
  <div class="callback-container">
    <div class="loading-box" v-if="isLoading">
      <el-icon class="loading-icon">
        <Loading />
      </el-icon>
      <p>正在处理登录信息...</p>
    </div>
    <div v-else-if="error" class="error-box">
      <el-icon class="error-icon">
        <Warning />
      </el-icon>
      <p>{{ error }}</p>
      <el-button type="primary" @click="handleRetry">重试</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '../store/userStore'
import axios from 'axios'
import { Loading, Warning } from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const isLoading = ref(true)
const error = ref('')

// 处理微信登录回调
const handleWxCallback = async () => {
  try {
    const code = route.query.code as string
    const state = route.query.state as string

    // 验证state
    const savedState = localStorage.getItem('wxAuthState')
    if (state !== savedState) {
      throw new Error('无效的授权请求')
    }

    // 清除state
    localStorage.removeItem('wxAuthState')

    if (!code) {
      throw new Error('未获取到授权码')
    }

    // 调用后端接口处理微信登录
    const response = await axios.post(`${import.meta.env.VITE_API2_BASE_URL}/apid/wx/login`, {
      code
    })

    const { token, userInfo } = response.data

    // 保存用户信息和token
    localStorage.setItem('token', token)
    localStorage.setItem('userInfo', JSON.stringify(userInfo))

    // 更新用户状态
    await userStore.fetchUserInfos()

    // 跳转到首页
    router.push('/history-competition')
  } catch (err: any) {
    error.value = err.message || '登录失败，请重试'
    isLoading.value = false
  }
}

// 重试登录
const handleRetry = () => {
  router.push('/login')
}

onMounted(() => {
  handleWxCallback()
})
</script>

<style scoped>
.callback-container {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f5f5f5;
}

.loading-box,
.error-box {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  text-align: center;
}

.loading-icon,
.error-icon {
  font-size: 2rem;
  margin-bottom: 1rem;
}

.loading-icon {
  animation: rotate 1s linear infinite;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

.error-box p {
  color: #f56c6c;
  margin-bottom: 1rem;
}
</style>
