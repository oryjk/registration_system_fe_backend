<template>
  <div class="user-billing-container p-0.5">
    <h2 class="text-2xl font-bold mb-4">用户账单 (共{{ users.length }}位)</h2>

    <div class="overflow-x-auto relative shadow-md sm:rounded-lg">
      <table class="w-full text-sm text-left text-gray-500 dark:text-gray-400">
        <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
          <tr>
            <th colspan="3" scope="colgroup"
              class="py-3 px-6 text-center sticky left-0 border-b bg-gray-50 border-gray-200 dark:bg-gray-700 dark:border-gray-700 z-10">
              人员信息</th>

            <template v-for="group in groupedCompetitions" :key="group.month">
              <th :colspan="group.competitions.length + 1" scope="colgroup"
                class="py-3 px-6 text-center border-b border-r border-l border-gray-200 dark:border-gray-700">
                {{ group.month }}
              </th>

            </template>
          </tr>
          <tr>

            <!-- 表头 -->
            <th scope="col" class="py-3 px-6 sticky left-0 bg-gray-50 dark:bg-gray-700 z-10">人员名称</th>
            <th scope="col" class="py-3 px-6 w-[60px] sticky left-[96px] bg-gray-50 dark:bg-gray-700 z-10">头像</th>
            <th scope="col" class="py-3 px-6 w-[80px] sticky left-[184px] bg-gray-50 dark:bg-gray-700 z-10">余额</th>

            <template v-for="group in groupedCompetitions" :key="group.month">
              <template v-for="(competition) in group.competitions" :key="competition.id">
                <th scope="col" class="py-3 px-6">
                  <template v-if="competition.status === 1 || competition.status === 2">
                    {{ formatHoldingDate(competition.holding_date) }}
                  </template>
                  <template v-else>
                    {{ formatHoldingDate(competition.holding_date) }} (比赛取消)
                  </template>
                </th>
              </template>
              <th scope="col" class="py-3 px-6">月罚款</th>
            </template>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in allUsersWithBilling" :key="user.userId"
            class="bg-white dark:bg-gray-800 dark:border-gray-700">
            <!-- 表体 -->
            <td class="py-4 px-6 font-medium text-gray-900 whitespace-nowrap dark:text-white sticky left-0 bg-white dark:bg-gray-800 z-10 w-[120px]">
              {{ user.realName }}
            </td>
            <td class="py-4 px-6 sticky left-[96px] bg-white dark:bg-gray-800 z-10 w-[60px]">
              <div class="avatar">
                <div class="w-10 rounded-full">
                  <img :src="getAvatarUrl(user.avatarUrl)" alt="用户头像" />
                </div>
              </div>
            </td>
            <td class="py-4 px-6 sticky left-[184px] bg-white dark:bg-gray-800 z-10 w-[80px]">
              {{ allUserOrders.userBalance[user.userId] || '0.00' }}
            </td>
            <!-- {{  user.monthlyBillings}} -->
            <template v-for="group in groupedCompetitions" :key="group.month">
              <template v-for="activity in group.competitions" :key="activity.id">

                <template
                  v-if="allBillingData[group.month] != null && allBillingData[group.month].billings.find(item => item.activity_id === activity.id)?.user_billing.find(item => item.user_id === user.userId) != null">
                  <td class="py-4 px-6 border-l-2 border-b-2 border-r-2 border-gray-400" :class="[
                    allUserOrders.userActivityBillings[user.userId][activity.id].status === 1 ? 'text-green-500' :
                      allUserOrders.userActivityBillings[user.userId][activity.id].status === 2 ? 'text-yellow-500' :
                        'text-red-500',
                  ]">
                    {{ allUserOrders.userActivityBillings[user.userId][activity.id].fee.toFixed(2) || '0.00' }}
                  </td>
                </template>
                <template v-else>
                  <td class="py-4 px-6 border-l-2 border-b-2 border-r-2 border-gray-400" :class="[]">
                    没有账单
                  </td>
                </template>
              </template>
              <td
                class="py-4 px-6 border-r-2 border-b-2 border-gray-400"
                :class="[
                  (allBillingData[group.month].finds.find(item => item.user_id === user.userId)?.fee ?? 0) !== 0
                    ? 'bg-red-500 text-white'
                    : 'bg-white text-gray-900 dark:bg-gray-800 dark:text-gray-400'
                ]"
              >
                {{ allBillingData[group.month].finds.find(item => item.user_id === user.userId)?.fee.toFixed(2) || '0.00' }}
              </td>

            </template>

          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import axios from 'axios';
import { computed, onMounted, ref } from 'vue';
import { type ActivityView } from '../functions/ActivityFunctions';
import { useUserStore } from '../store/userStore';
import { type BillingType, type UserInfoAlias } from '../types/user';

interface FindEntry {
  user_id: number;
  fee: number;
  status: number;
  billing_type: BillingType;
}

interface UserActivityBilling {
  user_id: number;
  fee: number;
  status: number;
  billing_type: BillingType;
}

interface ActivityBillingResponse {
  activity_id: string;
  activity_time: Date;
  total: number;
  user_billing: UserActivityBillingResponse[]
}
interface UserActivityBillingResponse {
  billing_type: number,
  fee: number,
  status: number,
  user_id: number,
}

interface MonthlyBillingDataResponse {
  finds: FindEntry[];
  billings: ActivityBillingResponse[];
}


interface UserWithBilling extends UserInfoAlias {
  balance: number;
}

const userStore = useUserStore();
const users = userStore.getAllUsers;
const competitions = ref<ActivityView[]>([]);

const allBillingData = ref<Record<string, MonthlyBillingDataResponse>>({});

type UserActivityBillings = Record<string, Record<string, UserActivityBilling>>;

const allUserOrders = ref<{
  userBalance: Record<string, number>;
  userActivityBillings: UserActivityBillings;
}>({
  userBalance: {},
  userActivityBillings: {}
});

interface GroupedCompetition {
  month: string;
  competitions: ActivityView[];
}
const allUsersWithBilling = ref<UserWithBilling[]>([]);

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

const fetchAllCompetitions = async () => {
  try {
    const response = await axios.get(`${import.meta.env.VITE_API2_BASE_URL}/apid/activity/infos`);
    competitions.value = response.data.filter((activity: ActivityView) => activity.status != 1).sort((a: ActivityView, b: ActivityView) => new Date(a.holding_date).getTime() - new Date(b.holding_date).getTime());
    console.log(competitions.value);
  } catch (error) {
    console.error('获取所有比赛信息失败:', error);
  }
};

const formatHoldingDate = (dateString: string): string => {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString();
  const day = date.getDate().toString();
  return `${year} 年 ${month} 月 ${day} 日`;
};

const formatMonth = (dateString: string): { title: string, key: string } => {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString();
  return { title: `${year} 年 ${month} 月`, key: `${year}-${month}` };
};

const groupedCompetitions = computed<GroupedCompetition[]>(() => {
  const groups: Record<string, ActivityView[]> = {};
  competitions.value.forEach(comp => {
    const monthKey = formatMonth(comp.holding_date);
    if (!groups[monthKey.key]) {
      groups[monthKey.key] = [];
    }
    groups[monthKey.key].push(comp);
  });
  const newLocal = Object.keys(groups).map(month => ({
    month,
    competitions: groups[month]
  }));

  return newLocal
});

const calculateBilling = async () => {

  const updatedUsers: UserWithBilling[] = [];

  try {
    const response = await axios.get<Record<string, MonthlyBillingDataResponse>>(`${import.meta.env.VITE_API2_BASE_URL}/apid/order/all-activities`);
    allBillingData.value = response.data;

    const allUserOrdersResponse = await axios.get<{
      userBalance: Record<string, number>;
      userActivityBillings: UserActivityBillings;
    }>(`${import.meta.env.VITE_API2_BASE_URL}/apid/order/all-user-orders`);
    allUserOrders.value = allUserOrdersResponse.data

    console.log(allBillingData.value);
    for (const user of users) {
      updatedUsers.push({
        ...user,
        balance: 400,

      });
    }
    allUsersWithBilling.value = updatedUsers;
    console.log(updatedUsers);
  } catch (error) {
    console.error('获取所有账单信息失败:', error);
  }
};

onMounted(async () => {
  await userStore.fetchUserInfos();
  await fetchAllCompetitions();
  await calculateBilling();
});
</script>

<style scoped>
.user-billing-container {
  max-width: 1200px;
  margin: 0 auto;
}

.overflow-x-auto {
  overflow-x: auto;
}

table {
  min-width: 800px;
  /* Ensure table is wide enough for scrolling */
}

th,
td {
  white-space: nowrap;
}

.sticky {
  position: sticky;
  z-index: 10;
  /* Ensure sticky columns are above scrolling content */
}

.left-0 {
  left: 0;
}

</style>
