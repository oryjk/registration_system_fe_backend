<template>
  <!-- 下拉框选择比赛 -->
  <el-select v-model="selectedCompetitionId" placeholder="请选择比赛" @change="onCompetitionChange">
    <el-option v-for="competition in competitions" :key="competition.id"
      :label="competition.name + ' || ' + competition.holding_date" :value="competition.id" />
  </el-select>
  <!-- 展示比赛信息 -->
  <div v-if="selectedCompetition" class="competition-info">
    <p><strong>比赛名称:</strong> {{ selectedCompetition.name }}</p>
    <p><strong>比赛地点:</strong> {{ selectedCompetition.location }}</p>
    <p><strong>对手名称:</strong> {{ selectedCompetition.opposing }}</p>
    <p><strong>开始时间:</strong> {{ selectedCompetition.start_time }}</p>
    <p><strong>结束时间:</strong> {{ selectedCompetition.end_time }}</p>
    <p><strong>举办日期:</strong> {{ selectedCompetition.holding_date }}</p>
    <p><strong>费用:</strong> {{ selectedCompetition.billing_type }}</p>
    <p><strong>备注:</strong> {{ selectedCompetition.description }}</p>
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
          <el-option label="已取消" value="3" />
        </el-select>
        <el-input v-model="selectedCompetition.desc" type="textarea" :rows="2" placeholder="请输入比赛备注" class="mt-2" />
        <el-button type="primary" @click="submitStatusChange" class="mt-2">提交</el-button>
        <el-button @click="cancelStatusEdit" class="mt-2">取消</el-button>
      </div>
    </el-form-item>
    <!-- 参赛人员信息 -->
    <div class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative w-[300px]" role="alert">
      <strong class="font-bold">报名参加人数: </strong>
      <span class="block sm:inline">{{ participatingCount }}</span>
    </div>
    <div class="bg-red-100 border border-green-400 text-red-700 px-4 py-3 rounded relative w-[300px]" role="alert">
      <strong class="font-bold">报名不参加人数: </strong>
      <span class="block sm:inline">{{ notParticipatingCount }}</span>
    </div>
    <div class="bg-gray-100 border border-green-400 text-gray-700 px-4 py-3 rounded relative w-[300px]" role="alert">
      <strong class="font-bold">未报名人数: </strong>
      <span class="block sm:inline">{{ unregisteredCount }}</span>
    </div>

    <div class="user-info-container">
      <div v-for="stand in standOrder" :key="stand" class="user-info-item">
        <el-divider class="mb-2 mt-6 font-bold">{{ getStatusText(Number(stand)) }}</el-divider>
        <div class="group-user-info-item">
          <div v-for="user in groupedUserInfosByStand[stand]" :key="user.user_id" class="user-info-item">
            <img :src="getAvatarUrl(allUserInfoMap[user.user_id]?.avatarUrl)" alt="用户头像" class="user-avatar" />

            <p class="user-nickname">{{ allUserInfoMap[user.user_id]?.realName }}</p>
            <p class="user-registration-count">报名人数：{{ user.registration_count }}</p>
            <div v-if="!user.is_editing" class="user-status">
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
              <el-input v-model="user.registration_count" type="number" placeholder="请输入报名人数" class="mt-2" />
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
import { onMounted, ref, watch } from 'vue';
import { useMatchStore } from '../store/matchStore.ts'
import { useUserStore } from '../store/userStore'
import axios from 'axios';
import {
  type ActivityView,
  type UserActivityView
} from '../functions/ActivityFunctions'

import {
  type UserInfoAlias
} from '../types/user';

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
const allUserInfoMap = ref<Record<string, UserInfoAlias>>({});
const userStore = useUserStore();
watch(() => userStore.userInfos, (newValue) => {
  if (newValue) {
    // 将 allUserInfo 转换为 Map``
    allUserInfoMap.value = newValue.reduce((map, user) => {
      map[user.userId] = user;
      return map;
    }, {} as Record<string, UserInfoAlias>);
  }
});
// 当前选择的比赛 ID
const selectedCompetitionId = ref<string>('');
// 当前选择的比赛信息
const selectedCompetition = ref<ActivityView | null>(null);
// 控制比赛状态是否处于编辑状态
const isEditingStatus = ref(false);

// 不参加人数
const participatingCount = ref<number>(0);
// 不参加人数
const notParticipatingCount = ref<number>(0);
// 未报名人数
const unregisteredCount = ref<number>(0);
//0 代表未报名，1代表参加，2代表不参加
const groupedUserInfosByStand = ref<Record<string, UserActivityView[]>>({});
// 监听 allUserInfo 和 selectedCompetition 的变化，更新不参加人数和未报名人数
watch(groupedUserInfosByStand, () => {
  participatingCount.value = groupedUserInfosByStand.value['1']?.length || 0;
  notParticipatingCount.value = groupedUserInfosByStand.value['2']?.length || 0;
  unregisteredCount.value = groupedUserInfosByStand.value['0']?.length || 0;
});



const standOrder = ref<string[]>(['1', '2', '0']); // 1 最前面，2 中间，0 最后面

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
    const response = await axios.get(`${import.meta.env.VITE_API2_BASE_URL}/apid/activity/${matchId}/users`);
    const data = response.data.data;
    console.log("xxxxxx" + data);
    data.user_infos.forEach((user: UserActivityView) => {
      user.is_editing = false;
    });
    selectedCompetition.value = {
      ...data.activity_info,
      user_infos: data.user_infos
    };
    if (selectedCompetition.value) {
      selectedCompetition.value.billing_type = 'AA';
    }

    // 合并未报名的用户信息
    if (selectedCompetition.value && Object.keys(allUserInfoMap.value).length > 0 && selectedCompetition.value.user_infos) {
      const registeredUserIds = new Set(selectedCompetition.value.user_infos.map(user => user.user_id));
      const unregisteredUsers = Object.values(allUserInfoMap.value).filter(user => !registeredUserIds.has(user.userId));
      unregisteredUsers.forEach(user => {
        const useActivityView: UserActivityView = {
          activity_id: selectedCompetition.value?.id || '',
          user_id: user.userId,
          stand: 0,
          is_editing: false,
          paid: 0,
          operation_time: '',
          registration_count:0
        };
        selectedCompetition.value?.user_infos?.push(useActivityView);
      });
      // 按照 stand 分组
      groupedUserInfosByStand.value = groupByStand(selectedCompetition.value.user_infos)
      console.log("xxxxxxxxx" + selectedCompetition.value.name)
    }

  } catch (error) {
    console.error('获取比赛详细信息失败:', error);
  }
};

// 按照 stand 分组的函数
const groupByStand = (userInfos: UserActivityView[]): Record<string, UserActivityView[]> => {
  return userInfos.reduce((grouped, user) => {
    const key = user.stand.toString(); // 将 stand 转为字符串作为分组键
    if (!grouped[key]) {
      grouped[key] = [];
    }
    grouped[key].push(user);
    return grouped;
  }, {} as Record<string, UserActivityView[]>);
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

    await axios.patch(
      `${import.meta.env.VITE_API2_BASE_URL}/apid/activity/${selectedCompetition.value.id}/status`,
      {
        status: Number(selectedCompetition.value.status),
        desc: selectedCompetition.value.desc
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
const startUserEditing = (user: UserActivityView) => {
  user.is_editing = true;
};

// 提交人员参赛状态修改
const submitUserStatusChange = async (user: UserActivityView) => {

  try {
    await axios.patch(
      `${import.meta.env.VITE_API2_BASE_URL}/apid/activity/${selectedCompetition.value?.id}/user/${user.user_id}/stand`,
      {
        count:user.registration_count,
        stand: user.stand,
      }
    )
      ;
    user.is_editing = false;
    if (selectedCompetition.value?.id) {
      await fetchCompetitionDetails(selectedCompetition.value.id);
    }
    console.log('人员参赛状态更新成功');
  } catch
  (error) {
    console.error('人员参赛状态更新失败:', error);
  }
}
  ;

// 取消编辑人员参赛状态
const cancelUserEditing = (user: UserActivityView) => {
  user.is_editing = false;
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
  // 添加日志输出，检查用户信息
  Object.entries(allUserInfoMap.value).forEach(([userId, userInfo]) => {
    if (!userInfo.nickname) {
      console.log(`用户ID: ${userId} 的nickname为空`);
    }
  });

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
  const userInfos = userStore.getAllUsers.reduce((acc, user) => {
    acc[user.userId] = user;
    return acc;
  }, {} as Record<string, UserInfoAlias>);
  allUserInfoMap.value = userInfos
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
