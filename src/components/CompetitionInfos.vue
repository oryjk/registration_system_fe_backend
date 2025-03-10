<template>
  <!-- 下拉框选择比赛 -->
  <el-select v-model="selectedCompetitionId" placeholder="请选择比赛" @change="onCompetitionChange">
    <el-option v-for="competition in competitions" :key="competition.id"
               :label="competition.name + ' || ' + competition.holdingDate"
               :value="competition.id"/>
  </el-select>
  <!-- 展示比赛信息 -->
  <div v-if="selectedCompetition" class="competition-info">
    <p><strong>比赛名称:</strong> {{ selectedCompetition.name }}</p>
    <p><strong>比赛地点:</strong> {{ selectedCompetition.location }}</p>
    <p><strong>对手名称:</strong> {{ selectedActivityInfo?.opposing }}</p>
    <p><strong>开始时间:</strong> {{ selectedCompetition.startTime }}</p>
    <p><strong>结束时间:</strong> {{ selectedCompetition.endTime }}</p>
    <p><strong>报名人数:</strong> {{ selectedCompetition.registCount }}</p>
    <p><strong>举办日期:</strong> {{ selectedCompetition.holdingDate }}</p>
    <p><strong>费用:</strong> {{ selectedCompetition.billingType }}</p>
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
          <el-option label="未进行" value="0"/>
          <el-option label="进行中" value="1"/>
          <el-option label="已完赛" value="2"/>
          <el-option label="已取消" value="3"/>
        </el-select>
        <el-button type="primary" @click="submitStatusChange">提交</el-button>
        <el-button @click="cancelStatusEdit">取消</el-button>
      </div>
    </el-form-item>
    <!-- 参赛人员信息 -->
    <h2>参赛人员信息</h2>
    <div class="user-info-container">
      <div v-for="stand in standOrder" :key="stand"
           class="user-info-item">
        <h3>{{ getStatusText(Number(stand)) }}</h3>
        <div class="group-user-info-item">
          <div v-for="user in groupedUserInfosByStand[stand]" :key="user.openId"
               class="user-info-item">
            <img :src="getAvatarUrl(user.avatarUrl)" alt="用户头像" class="user-avatar"/>
            <p class="user-nickname">{{ user.nickName }}</p>
            <div v-if="!user.isEditing" class="user-status">
              <el-tag :type="getStatusTagType(user.stand)">
                {{ getStatusText(user.stand) }}
              </el-tag>
              <el-button @click="startUserEditing(user)">修改</el-button>
            </div>
            <div v-else>
              <el-select v-model="user.stand" placeholder="请选择参赛状态">
                <el-option label="未报名" value="0"/>
                <el-option label="报名参加" value="1"/>
                <el-option label="报名无法参加" value="2"/>
              </el-select>
              <el-button type="primary" @click="submitUserStatusChange(user)">提交</el-button>
              <el-button @click="cancelUserEditing(user)">取消</el-button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

</template>

<script setup lang="ts">
import {onMounted, ref, watch} from 'vue';
import {useMatchStore} from '../store/matchStore.ts'
import axios from 'axios';
import {
  type ActivityInfo,
  type ActivityView,
  type UserInfoView
} from '../functions/ActivityFunctions'

const emit = defineEmits(['message-from-child']); // 定义事件

// 定义接收的参数
const props = defineProps<{
  competitions: ActivityView[]
}>();


const matchStore = useMatchStore();
// 监听 parentMethodExecuted 状态的变化
watch(() => matchStore.clearCache, (newValue) => {
  if (newValue) {
    initialize()
    matchStore.resetCache()
  }
});

// 当前选择的比赛 ID
const selectedCompetitionId = ref<string>('');
// 当前选择的比赛信息
const selectedCompetition = ref<ActivityView | null>(null);
const selectedActivityInfo = ref<ActivityInfo | null>(null);
// 控制比赛状态是否处于编辑状态
const isEditingStatus = ref(false);

const allUserInfo = ref<UserInfoView[]>([]);
//0 代表未报名，1代表参加，2代表不参加
const groupedUserInfosByStand = ref<Record<string, UserInfoView[]>>({});

const standOrder = ref<string[]>(['1', '2', '0']); // 1 最前面，2 中间，0 最后面

interface UserActivityRequest {
  userId: string,
  activityId: string,
  stand: number,
  paid: boolean
}

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
const fetchCompetitionDetails = async (matchId: string) => {
  try {
    const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/activity/${matchId}`);
    const data = response.data;
    data.userInfos.forEach((user: UserInfoView) => {
      user.isEditing = false;
    });
    selectedCompetition.value = data;
    if (selectedCompetition.value) {
      selectedCompetition.value.billingType = 'AA';
    }

    // 合并未报名的用户信息
    if (selectedCompetition.value && allUserInfo.value.length > 0 && selectedCompetition.value.userInfos) {
      const registeredUserIds = new Set(selectedCompetition.value.userInfos.map(user => user.openId));
      const unregisteredUsers = allUserInfo.value.filter(user => !registeredUserIds.has(user.openId));
      unregisteredUsers.forEach(user => {
        user.stand = 0; // 设置为未报名
        user.isEditing = false;
      });
      selectedCompetition.value.userInfos = [...selectedCompetition.value.userInfos, ...unregisteredUsers];
      // 按照 stand 分组
      groupedUserInfosByStand.value = groupByStand(selectedCompetition.value.userInfos)
    }

  } catch (error) {
    console.error('获取比赛详细信息失败:', error);
  }
};

const fetchCompetitionInfo = async (matchId: string) => {
  const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/activity-info/${matchId}`);
  selectedActivityInfo.value = response.data;
};

// 按照 stand 分组的函数
const groupByStand = (userInfos: UserInfoView[]): Record<string, UserInfoView[]> => {
  return userInfos.reduce((grouped, user) => {
    const key = user.stand.toString(); // 将 stand 转为字符串作为分组键
    if (!grouped[key]) {
      grouped[key] = [];
    }
    grouped[key].push(user);
    return grouped;
  }, {} as Record<string, UserInfoView[]>);
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
  await fetchCompetitionInfo(selectedCompetitionId.value);
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
      `${import.meta.env.VITE_API_BASE_URL}/api/activity/status`,
      {
        status: Number(selectedCompetition.value.status),
        id: selectedCompetition.value.id
      }
    );
    isEditingStatus.value = false;
    emit('message-from-child', '比赛状态更新成功');
    selectedCompetition.value = null
    selectedCompetitionId.value = ''
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
      await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/user-activity/registration`,
        {
          userId: user.openId,
          activityId: selectedCompetition.value?.id,
          stand: user.stand,
          paid: false
        }
      )
      ;
      user.isEditing = false;
      console.log('人员参赛状态更新成功');
    } catch
      (error) {
      console.error('人员参赛状态更新失败:', error);
    }
  }
;

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
    case 3:
      return '已取消';
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
  if (!avatarUrl) {
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
  console.log("开始初始化比赛数据")
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
  flex-direction: column;
  flex-wrap: wrap;
  gap: 20px;
  //justify-content: center;
  //align-items: center;

  /* 可根据需要调整间距 */
  .group-user-info-item {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;


    .user-info-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      margin-right: 10px;
      margin-bottom: 10px;

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

      .user-nickname {
        margin-top: 5px;
        width: 100px; // 设置一个固定宽度
        text-align: center;
        white-space: nowrap; // 防止文本换行
        overflow: hidden; // 隐藏溢出的文本
        text-overflow: ellipsis; // 在文本溢出时显示省略号
      }

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


}
</style>
