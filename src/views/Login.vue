<template>
  <div class="login-container">
    <div class="login-box">
      <img src="../static/logo.png" alt="Logo" class="logo">
      <h1 class="title">欢迎登录</h1>
      <div v-if="!isWxClient" class="error-message">
        请在微信中打开此页面
      </div>
      <el-button v-else type="primary" @click="handleWxLogin" :loading="isLoading">
        微信登录
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../store/userStore'
import axios from 'axios'

const router = useRouter()
const userStore = useUserStore()
const isWxClient = ref(false)
const isLoading = ref(false)

const wxConfig = ref()

// 检查是否在微信浏览器中
const checkWxClient = () => {
  const ua = navigator.userAgent.toLowerCase()
  isWxClient.value = ua.indexOf('micromessenger') !== -1
}

// 加载微信JSSDK脚本
const loadWxScript = () => {
  return new Promise((resolve, reject) => {
    if (window.wx) {
      resolve(window.wx)
      return
    }

    const script = document.createElement('script')
    script.type = 'text/javascript'
    script.src = 'https://res.wx.qq.com/open/js/jweixin-1.6.0.js'
    script.onload = () => resolve(window.wx)
    script.onerror = (error) => reject(error)
    document.head.appendChild(script)
  })
}

// 初始化微信JSSDK
const initWxJsSdk = async () => {
  try {
    // 先加载微信JSSDK脚本
    await loadWxScript()

    // 获取JSSDK配置
    const response = await axios.get(`${import.meta.env.VITE_API2_BASE_URL}/apid/wx/jsconfig`, {
      params: {
        url: window.location.href
      }
    })
    const config = response.data
    wxConfig.value = config

    // 配置JSSDK
    window.wx.config({
      debug: false,
      appId: config.appId,
      timestamp: config.timestamp,
      nonceStr: config.nonceStr,
      signature: config.signature,
      jsApiList: ['getUserInfo']
    })

    window.wx.ready(() => {
      console.log('JSSDK ready')
    })

    window.wx.error((err: any) => {
      console.error('JSSDK error:', err)
    })
  } catch (error) {
    console.error('初始化JSSDK失败:', error)
  }
}

// 处理微信登录
const handleWxLogin = () => {
  isLoading.value = true

  // 构造微信授权URL
  const appId = wxConfig.value.appId
  const redirectUri = encodeURIComponent(`${window.location.origin}/wx-callback`)
  const state = Math.random().toString(36).substring(7)

  // 保存state用于验证回调
  localStorage.setItem('wxAuthState', state)

  // 重定向到微信授权页面
  const authUrl = `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${appId}&redirect_uri=${redirectUri}&response_type=code&scope=snsapi_userinfo&state=${state}#wechat_redirect`
  window.location.href = authUrl
}

onMounted(() => {
  checkWxClient()
  if (isWxClient.value) {
    initWxJsSdk()
  }
})
</script>

<style scoped>
.login-container {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f5f5f5;
}

.login-box {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  text-align: center;
}

.logo {
  width: 100px;
  height: 100px;
  margin-bottom: 1rem;
}

.title {
  font-size: 1.5rem;
  color: #333;
  margin-bottom: 2rem;
}

.error-message {
  color: #f56c6c;
  margin-bottom: 1rem;
}
</style>