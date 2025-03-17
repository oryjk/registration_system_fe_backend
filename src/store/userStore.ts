import { defineStore } from "pinia";
import axios from "axios";
import { type UserInfoView, type UserInfoAlias, toUserInfoAlias } from "../types/user";

export const useUserStore = defineStore('userStore', {
  state: () => ({
    userInfos: [] as UserInfoAlias[],
    isLoading: false,
    error: null as string | null,
    lastFetchTime: null as Date | null
  }),

  getters: {
    // 获取所有用户信息
    getAllUsers: (state) => state.userInfos,

    // 根据ID获取特定用户
    getUserById: (state) => (openId: string) => {
      return state.userInfos.find(user => user.userId === openId);
    },

    // 判断数据是否已加载
    isDataLoaded: (state) => state.userInfos.length > 0 && !state.isLoading
  },

  actions: {
    // 获取所有用户信息
    async fetchUserInfos() {
      // 如果已经加载过数据且在短时间内（例如5分钟），则不重复加载
      const now = new Date();
      if (this.lastFetchTime && now.getTime() - this.lastFetchTime.getTime() < 5 * 60 * 1000 && this.userInfos.length > 0) {
        console.log('用户数据已加载，不再重复加载');
        return;
      }

      this.isLoading = true;
      this.error = null;

      try {
        console.log('fetching user infos...');
        const response = await axios.get(`${import.meta.env.VITE_API2_BASE_URL}/apid/user/infos`);

        this.userInfos = response.data.map((user: UserInfoView) => toUserInfoAlias(user));
        console.log('user infos:', this.userInfos);
        this.lastFetchTime = now;
      } catch (err: unknown) {
        this.error = err instanceof Error ? err.message : '获取用户信息失败';
        console.error('获取用户信息失败:', err);
      } finally {
        this.isLoading = false;
      }
    },

    // 重置状态
    resetState() {
      this.userInfos = [];
      this.isLoading = false;
      this.error = null;
      this.lastFetchTime = null;
    }
  }
});
