<template>
  <div class="history-competition">
    <h1>历史比赛</h1>
    <el-tabs type="border-card" v-if="isDataLoaded">
      <el-tab-pane label="进行中">
        <CompetitionInfos :competitions="ongoingCompetitions" />
      </el-tab-pane>
      <el-tab-pane label="已完成">
        <CompetitionInfos :competitions="finishedCompetitions" />
      </el-tab-pane>
      <el-tab-pane label="未开始/取消">
        <CompetitionInfos :competitions="notStartedCompetitions" />
      </el-tab-pane>
    </el-tabs>

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { LocalDateTime } from 'luxon';
import CompetitionInfos from '../components/CompetitionInfos.vue'; // 导入组件
import { ElLoading } from 'element-plus'

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
  startTime: LocalDateTime | null;
  endTime: LocalDateTime | null;
  registCount: number;
  holdingDate: LocalDateTime;
  status: number;
  userInfos: UserInfoView[] | null;
}

const ongoingCompetitions = ref<ActivityView[]>([]);
const finishedCompetitions = ref<ActivityView[]>([]);
const notStartedCompetitions = ref<ActivityView[]>([]);
const isDataLoaded = ref<boolean>(false);
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
    await sleep(2000);
    isDataLoaded.value = true;
    loadingInstance.close();
  } catch (error) {
    console.error('获取比赛历史信息失败:', error);
  }
};

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));


onMounted(() => {

  fetchCompetitions();
});
</script>

<style scoped lang="scss">
.history-competition {
  padding: 20px;
}
</style>
