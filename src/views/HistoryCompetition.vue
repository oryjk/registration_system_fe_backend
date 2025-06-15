<template>
  <div class="page-container">
    <div class="history-competition">
      <el-tabs type="border-card" v-if="isDataLoaded">
        <el-tab-pane label="还没有开始的比赛">
          <CompetitionInfos :competitions="notStartedCompetitions" @message-from-child="handleMessage" />
        </el-tab-pane>
        <el-tab-pane label="进行中的比赛">
          <CompetitionInfos :competitions="ongoingCompetitions" @message-from-child="handleMessage" />
        </el-tab-pane>
        <el-tab-pane label="已完成的比赛">
          <CompetitionInfos :competitions="finishedCompetitions" @message-from-child="handleMessage" />
        </el-tab-pane>
        <el-tab-pane label="取消的比赛">
          <CompetitionInfos :competitions="cancelCompetitions" @message-from-child="handleMessage" />
        </el-tab-pane>
      </el-tabs>
    </div>

    <div class="fixed-reload-btn">
      <el-button type="primary" @click="handleMessage('重新加载数据')"
        class="shadow-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-full transition-all duration-300 transform hover:scale-105 active:scale-95"
        :icon="Refresh" >
        刷新数据
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import axios from 'axios';
import CompetitionInfos from '../components/CompetitionInfos.vue'; // 导入组件
import { ElLoading } from 'element-plus'
import { activityFunctions, type ActivityView } from '../functions/ActivityFunctions'
import { Refresh } from '@element-plus/icons-vue'
import { useMatchStore } from '../store/matchStore.ts'

const matchStore = useMatchStore();
const { clearCache } = activityFunctions();

const clearActivityCache = () => {
  clearCache()
  matchStore.setCache()
}



const ongoingCompetitions = ref<ActivityView[]>([]);
const finishedCompetitions = ref<ActivityView[]>([]);
const cancelCompetitions = ref<ActivityView[]>([]);
const notStartedCompetitions = ref<ActivityView[]>([]);
const isDataLoaded = ref<boolean>(false);

const handleMessage = (message: string) => {
  console.log('父组件收到消息:', message);
  clearActivityCache();
  loadCompetitions();

};
// 获取比赛历史信息
const fetchCompetitions = async () => {
  try {
    const loadingInstance = ElLoading.service({ fullscreen: true, text: "数据加载中…………" })
    const response = await axios.get(`${import.meta.env.VITE_API2_BASE_URL}/apid/activity/infos`);
    const allCompetitions: ActivityView[] = response.data;

    // 打印第一个比赛对象以检查holding_date的类型
    if (allCompetitions.length > 0) {
      console.log('第一个比赛对象:', allCompetitions[0]);
      console.log('holding_date类型:', typeof allCompetitions[0].holding_date);
      console.log('holding_date值:', allCompetitions[0].holding_date);
    }

    // 按照holding_date进行排序
    allCompetitions.sort((a, b) => {
      const dateA = new Date(a.holding_date).getTime();
      const dateB = new Date(b.holding_date).getTime();
      return dateB - dateA;
    });

    // 根据 status 属性进行分组
    notStartedCompetitions.value = allCompetitions.filter(competition => competition.status === 0);
    ongoingCompetitions.value = allCompetitions.filter(competition => competition.status === 1);
    finishedCompetitions.value = allCompetitions.filter(competition => competition.status === 2);
    cancelCompetitions.value = allCompetitions.filter(competition => competition.status === 3);
    isDataLoaded.value = true;
    // 存储到缓存
    setCompetitionsToCache(allCompetitions);
    loadingInstance.close();
  } catch (error) {
    console.error('获取比赛历史信息失败:', error);
  }
};

// 从 localStorage 获取数据
const cacheKey = 'competitionsData'; // 定义一个缓存键
const getCompetitionsFromCache = (): ActivityView[] | null => {
  const cachedData = localStorage.getItem(cacheKey);
  if (cachedData) {
    try {
      return JSON.parse(cachedData) as ActivityView[]; // 确保类型安全
    } catch (error) {
      console.error('解析缓存数据失败:', error);
      localStorage.removeItem(cacheKey); // 如果解析失败，清除缓存
      return null;
    }
  }
  return null;
};

// 将数据存储到 localStorage
const setCompetitionsToCache = (data: ActivityView[]): void => {
  try {
    localStorage.setItem(cacheKey, JSON.stringify(data));
  } catch (error) {
    console.error('存储缓存数据失败:', error);
  }
};

// 加载数据
const loadCompetitions = async () => {
  const cachedData = getCompetitionsFromCache();

  if (cachedData) {
    // 如果有缓存，从缓存加载
    const allCompetitions: ActivityView[] = cachedData;
    // 根据 status 属性进行分组
    ongoingCompetitions.value = allCompetitions.filter(competition => competition.status === 1);
    finishedCompetitions.value = allCompetitions.filter(competition => competition.status === 2);
    cancelCompetitions.value = allCompetitions.filter(competition => competition.status === 3);
    notStartedCompetitions.value = allCompetitions.filter(competition => competition.status === 0);
    isDataLoaded.value = true;

    console.log('从缓存加载数据');
  } else {
    // 如果没有缓存，从后台加载
    await fetchCompetitions();
    console.log('从后台加载数据');
  }
};


onMounted(() => {
  loadCompetitions();
});
</script>

<style scoped lang="scss">
.history-competition {
  padding: 20px;
}

// 修改样式部分
.fixed-reload-btn {
  /* 移除 @apply 规则，因为 SCSS 默认不支持 Tailwind 的 @apply 规则 */
  position: fixed;
  bottom: 1rem;
  /* 等同于 Tailwind 的 bottom-4 */
  right: 1rem;
  /* 等同于 Tailwind 的 right-4 */
  z-index: 1000;
  /* 等同于 Tailwind 的 z-1000 */

  .el-button {
    padding: 12px 24px;
    border-radius: 25px;
  }

  .el-button {
    padding: 12px 24px;
    border-radius: 25px;
  }
}
</style>
