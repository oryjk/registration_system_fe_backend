<template>
  <div class="history-competition">
    <h1>历史比赛</h1>
    <!-- 下拉框选择比赛 -->
    <el-select v-model="selectedCompetitionId" placeholder="请选择比赛" @change="onCompetitionChange">
      <el-option v-for="competition in competitions" :key="competition.id" :label="competition.name"
        :value="competition.id" />
    </el-select>
    <!-- 展示比赛信息 -->
    <div v-if="selectedCompetition" class="competition-info">
      <p><strong>比赛名称:</strong> {{ selectedCompetition.name }}</p>
      <p><strong>比赛地点:</strong> {{ selectedCompetition.location }}</p>
      <p><strong>开始时间:</strong> {{ selectedCompetition.startTime }}</p>
      <p><strong>结束时间:</strong> {{ selectedCompetition.endTime }}</p>
      <p><strong>报名人数:</strong> {{ selectedCompetition.registCount }}</p>
      <p><strong>举办日期:</strong> {{ selectedCompetition.holdingDate }}</p>
      <!-- 状态展示与修改 -->
      <el-form-item label="比赛状态">
        <div v-if="!isEditingStatus">
          <el-tag :type="getCompetitionStatusTagType(selectedCompetition.status)">
            {{ getCompetitionStatusText(selectedCompetition.status) }}
          </el-tag>
          <el-button @click="startEditingStatus">修改</el-button>
        </div>
        <div v-else>
          <el-select v-model="selectedCompetition.status" placeholder="请选择比赛状态">
            <el-option label="未进行" value="0" />
            <el-option label="进行中" value="1" />
            <el-option label="已完赛" value="2" />
          </el-select>
          <el-button type="primary" @click="submitStatusChange">提交</el-button>
          <el-button @click="cancelStatusEdit">取消</el-button>
        </div>
      </el-form-item>
      <!-- 参赛人员信息 -->
      <h2>参赛人员信息</h2>
      <div class="user-info-container">
        <div v-for="user in selectedCompetition.userInfos" :key="user.openId" class="user-info-item">
          <img :src="`data:image/jpeg;base64,${user.avatarUrl}`" alt="用户头像" class="user-avatar" />
          <p class="user-nickname">{{ user.nickName }}</p>
          <el-tag :type="getStatusTagType(user.stand)">
            {{ getStatusText(user.stand) }}
          </el-tag>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import axios from 'axios';

// 存储所有比赛信息
const competitions = ref<any[]>([]);
// 当前选择的比赛 ID
const selectedCompetitionId = ref<string>('');
// 当前选择的比赛信息
const selectedCompetition = ref<any | null>(null);
// 控制比赛状态是否处于编辑状态
const isEditingStatus = ref(false);

// 获取比赛历史信息
const fetchCompetitions = async () => {
  try {
    const response = await axios.get('https://oryjk.cn:82/api/activity/all');
    competitions.value = response.data;
    if (competitions.value.length > 0) {
      selectedCompetitionId.value = competitions.value[0].id;
      await fetchCompetitionDetails(selectedCompetitionId.value);
    }
  } catch (error) {
    console.error('获取比赛历史信息失败:', error);
  }
};

// 根据比赛 ID 获取详细信息（包含 userInfos）
const fetchCompetitionDetails = async (id: string) => {
  try {
    const response = await axios.get(`https://oryjk.cn:82/api/activity/${id}`);
    selectedCompetition.value = response.data;
  } catch (error) {
    console.error('获取比赛详细信息失败:', error);
  }
};

// 处理比赛选择变化
const onCompetitionChange = async () => {
  await fetchCompetitionDetails(selectedCompetitionId.value);
};

// 开始编辑比赛状态
const startEditingStatus = () => {
  isEditingStatus.value = true;
};

// 提交比赛状态修改
const submitStatusChange = async () => {
  try {
    await axios.put(
      `https://oryjk.cn:82/api/activity/${selectedCompetition.value.id}/status`,
      { status: selectedCompetition.value.status }
    );
    isEditingStatus.value = false;
    console.log('比赛状态更新成功');
  } catch (error) {
    console.error('比赛状态更新失败:', error);
  }
};

// 取消编辑比赛状态
const cancelStatusEdit = () => {
  isEditingStatus.value = false;
};

// 根据参赛人员状态值返回对应的文本
const getStatusText = (status: number) => {
  switch (status) {
    case 0:
      return '未报名';
    case 1:
      return '报名参加';
    case 2:
      return '报名无法参加';
    default:
      return '未知状态';
  }
};

// 根据参赛人员状态值返回对应的标签类型
const getStatusTagType = (status: number) => {
  switch (status) {
    case 0:
      return 'danger';
    case 1:
      return 'success';
    case 2:
      return 'warning';
    default:
      return 'info';
  }
};

// 根据比赛状态值返回对应的文本
const getCompetitionStatusText = (status: number) => {
  switch (status) {
    case 0:
      return '未进行';
    case 1:
      return '进行中';
    case 2:
      return '已完赛';
    default:
      return '未知状态';
  }
};

// 根据比赛状态值返回对应的标签类型
const getCompetitionStatusTagType = (status: number) => {
  switch (status) {
    case 0:
      return 'info';
    case 1:
      return 'success';
    case 2:
      return 'warning';
    default:
      return 'info';
  }
};

// 组件挂载时获取比赛信息
onMounted(() => {
  fetchCompetitions();
});
</script>

<style scoped lang="scss">
.history-competition {
  padding: 20px;
}

.competition-info {
  margin-top: 20px;
  border: 1px solid #ccc;
  padding: 20px;
  border-radius: 4px;
}

.user-info-container {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  /* 可根据需要调整间距 */

  .user-info-item {
    display: flex;
    flex-direction: column;
    align-items: center;

    .user-avatar {
      width: 50px;
      height: 50px;
      border-radius: 50%;
      object-fit: cover;
    }

    .user-nickname,
    .el-tag {
      margin-top: 5px;
    }

    .el-button {
      margin-top: 5px;
    }

    .status-green {
      color: green;
      font-weight: bold;
    }

    .status-yellow {
      color: yellow;
      font-weight: bold;
    }

    .status-red {
      color: red;
      font-weight: bold;
    }

    .status-unknown {
      color: gray;
      font-weight: bold;
    }
  }
}
</style>
