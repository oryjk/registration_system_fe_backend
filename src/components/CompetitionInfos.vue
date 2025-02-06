<template>
  <!-- 下拉框选择比赛 -->
  <el-select v-model="selectedCompetitionId" placeholder="请选择比赛" @change="onCompetitionChange">
    <el-option v-for="competition in competitions" :key="competition.id"
      :label="competition.name +' || '+ competition.holdingDate" :value="competition.id" />
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
        <img :src="getAvatarUrl(user.avatarUrl)" alt="用户头像" class="user-avatar" />
        <p class="user-nickname">{{ user.nickName }}</p>
        <div v-if="!user.isEditing" class="user-status">
          <el-tag :type="getStatusTagType(user.stand)">
            {{ getStatusText(user.stand) }}
          </el-tag>
          <el-button @click="startUserEditing(user)">修改</el-button>
        </div>
        <div v-else>
          <el-select v-model="user.stand" placeholder="请选择参赛状态">
            <el-option label="未报名" value="0" />
            <el-option label="报名参加" value="1" />
            <el-option label="报名无法参加" value="2" />
          </el-select>
          <el-button type="primary" @click="submitUserStatusChange(user)">提交</el-button>
          <el-button @click="cancelUserEditing(user)">取消</el-button>
        </div>
      </div>
    </div>
  </div>

</template>

<script setup lang="ts">
import { ref, onMounted, defineProps } from 'vue';
import axios from 'axios';
import { LocalDateTime } from 'luxon';

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

interface UserInfoView {
  openId: string;
  nickName: string;
  avatarUrl: string;
  stand: number;
  isEditing: boolean;
}
// 定义接收的参数
const props = defineProps<{
  competitions: ActivityView[]
}>();

// 当前选择的比赛 ID
const selectedCompetitionId = ref<string>('');
// 当前选择的比赛信息
const selectedCompetition = ref<ActivityView | null>(null);
// 控制比赛状态是否处于编辑状态
const isEditingStatus = ref(false);

const allUserInfo = ref<UserInfoView[]>([]);

// 获取比赛历史信息
const fetchCompetitions = async () => {
  try {
    if (props.competitions.length > 0) {
      selectedCompetitionId.value = props.competitions[0].id;
      await fetchCompetitionDetails(selectedCompetitionId.value);
    }
  } catch (error) {
    console.error('获取比赛历史信息失败:', error);
  }
};

// 根据比赛 ID 获取详细信息（包含 userInfos）
const fetchCompetitionDetails = async (id: string) => {
  try {
    const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/activity/${id}`);
    const data = response.data;
    data.userInfos.forEach((user: UserInfoView) => {
      user.isEditing = false;
    });
    selectedCompetition.value = data;

    // 合并未报名的用户信息
    if (selectedCompetition.value && allUserInfo.value.length > 0 && selectedCompetition.value.userInfos) {
      const registeredUserIds = new Set(selectedCompetition.value.userInfos.map(user => user.openId));
      const unregisteredUsers = allUserInfo.value.filter(user => !registeredUserIds.has(user.openId));
      unregisteredUsers.forEach(user => {
        user.stand = 0; // 设置为未报名
        user.isEditing = false;
      });
      selectedCompetition.value.userInfos = [...selectedCompetition.value.userInfos, ...unregisteredUsers];

      selectedCompetition.value.userInfos = sortUserInfos(selectedCompetition.value.userInfos);
    }

  } catch (error) {
    console.error('获取比赛详细信息失败:', error);
  }
};

// 排序函数
const sortUserInfos = (userInfos: UserInfoView[]): UserInfoView[] => {
  return userInfos.sort((a, b) => {
    if (a.stand === b.stand) return 0;
    if (a.stand === 1) return -1; // 报名参加的排在最前面
    if (b.stand === 1) return 1;
    if (a.stand === 2) return -1; // 报名无法参加的排在中间
    if (b.stand === 2) return 1;
    return 0; // 未报名的排在最后面
  });
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

    if (!selectedCompetition.value) {
      console.error('当前没有选择任何比赛');
      return;
    }

    await axios.put(
      `${import.meta.env.VITE_API_BASE_URL}/api/activity/${selectedCompetition.value.id}/status`,
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

// 开始编辑人员参赛状态
const startUserEditing = (user: UserInfoView) => {
  user.isEditing = true;
};

// 提交人员参赛状态修改
const submitUserStatusChange = async (user: UserInfoView) => {
  try {
    await axios.put(
      `${import.meta.env.VITE_API_BASE_URL}/api/user/${user.openId}/status`,
      { status: user.stand }
    );
    user.isEditing = false;
    console.log('人员参赛状态更新成功');
  } catch (error) {
    console.error('人员参赛状态更新失败:', error);
  }
};

// 取消编辑人员参赛状态
const cancelUserEditing = (user: UserInfoView) => {
  user.isEditing = false;
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

const getAvatarUrl = (avatarUrl: string | null | undefined): string => {
  if (!avatarUrl || typeof avatarUrl !== 'string') {
    return '/src/static/default-avatar-for-activity.png';
  }

  try {
    window.atob(avatarUrl);
    return `data:image/jpeg;base64,${avatarUrl}`;
  } catch {
    return '/src/static/default-avatar-for-activity.png';
  }
};

// 实现 fetchAllUserInfo 函数
const fetchAllUserInfo = async () => {
  try {
    const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/user/info/all`);
    allUserInfo.value = response.data;
  } catch (error) {
    console.error('获取所有用户信息失败:', error);
  }
};
// 封装异步初始化逻辑
const initialize = async () => {
  await fetchAllUserInfo();
  await fetchCompetitions();
};
// 组件挂载时获取比赛信息
onMounted(() => {
  initialize()
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
      width: 75px;
      height: 75px;
      border-radius: 50%;
      object-fit: cover;
    }

    .user-status {
      display: flex;
      flex-direction: column;
    }

    .user-nickname,
    .el-tag {
      margin-top: 5px;
      width: 100px;
      text-align: center;
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
