import {defineStore} from "pinia";

export const useMatchStore = defineStore('refreshActivity', {
  state: () => ({
    clearCache: false,
  }),
  actions: {
    setCache() {
      this.clearCache = true;
    },
    resetCache() {
      this.clearCache = false;
    }
  }
});
