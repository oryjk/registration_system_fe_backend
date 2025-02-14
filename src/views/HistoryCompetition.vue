<template>
  <div class="history-competition">
    <h1>历史比赛</h1>
    <el-tabs type="border-card" v-if="isDataLoaded">
      <el-tab-pane label="进行中的比赛">
        <CompetitionInfos :competitions="ongoingCompetitions" @message-from-child="handleMessage" />
      </el-tab-pane>
      <el-tab-pane label="已完成的比赛">
        <CompetitionInfos :competitions="finishedCompetitions" @message-from-child="handleMessage" />
      </el-tab-pane>
      <el-tab-pane label="取消的比赛">
        <CompetitionInfos :competitions="notStartedCompetitions" @message-from-child="handleMessage" />
      </el-tab-pane>
    </el-tabs>

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { DateTime } from 'luxon';
import CompetitionInfos from '../components/CompetitionInfos.vue'; // 导入组件
import { ElLoading } from 'element-plus'
import { activityFunctions } from '../functions/ActivityFunctions'


const { clearCompetitionsCache } = activityFunctions();



interface UserInfoView {
  openId: string;
  nickName: string;
  avatarUrl: string;
  stand: number;
  isEditing: boolean;
}

interface ActivityView {
  id: string;
  name: string;
  location: string;
  startTime: DateTime | null;
  endTime: DateTime | null;
  registCount: number;
  holdingDate: DateTime;
  status: number;
  userInfos: UserInfoView[] | null;
}

const ongoingCompetitions = ref<ActivityView[]>([]);
const finishedCompetitions = ref<ActivityView[]>([]);
const notStartedCompetitions = ref<ActivityView[]>([]);
const isDataLoaded = ref<boolean>(false);

const handleMessage = (message: string) => {
  console.log('父组件收到消息:', message);

  clearCompetitionsCache();
  loadCompetitions();

};
// 获取比赛历史信息
const fetchCompetitions = async () => {
  try {
    const loadingInstance = ElLoading.service({ fullscreen: true, text: "数据加载中…………" })
    const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/activity/all`);
    const allCompetitions: ActivityView[] = response.data;

    // 根据 status 属性进行分组
    ongoingCompetitions.value = allCompetitions.filter(competition => competition.status === 1);
    finishedCompetitions.value = allCompetitions.filter(competition => competition.status === 2);
    notStartedCompetitions.value = allCompetitions.filter(competition => competition.status === 0);
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
</style>
