<template>
  <div class="page-container">
    <el-form :model="formData" :rules="rules" ref="formRef" label-width="120px">
      <!-- 比赛名称 -->
      <el-form-item label="比赛名称" prop="name">
        <el-input v-model="formData.name" placeholder="请输入比赛名称"/>
      </el-form-item>

      <!-- 开始时间 -->
      <el-form-item label="报名开始时间" prop="startTime">
        <el-date-picker v-model="formData.startTime" type="datetime"
                        placeholder="选择开始日期时间"
                        value-format="YYYY-MM-DD HH:mm" format="YYYY-MM-DD HH:mm:ss"/>
      </el-form-item>
      <!-- 结束时间 -->
      <el-form-item label="报名结束时间" prop="endTime">
        <el-date-picker value-format="YYYY-MM-DD HH:mm" format="YYYY-MM-DD HH:mm:ss"
                        v-model="formData.endTime"
                        type="datetime" placeholder="选择结束日期时间"/>
      </el-form-item>
      <!-- 举办日期 -->
      <el-form-item label="比赛日期" prop="holdingDate">
        <el-date-picker value-format="YYYY-MM-DD HH:mm" format="YYYY-MM-DD HH:mm:ss"
                        v-model="formData.holdingDate"
                        type="datetime" placeholder="选择举办日期时间"/>
      </el-form-item>
      <!-- 封面 -->
      <el-form-item label="封面" prop="cover">
        <el-input v-model="formData.cover" placeholder="请输入封面链接"/>
      </el-form-item>

      <!-- 比赛地点 -->
      <el-form-item label="比赛地点" prop="location">
        <el-input v-model="formData.location" placeholder="请输入比赛地点"/>
      </el-form-item>

      <!-- 活动信息 - 颜色 -->
      <el-form-item label="本队球衣颜色" prop="activityInfo.color">
        <el-color-picker v-model="formData.activityInfo.color"/>
      </el-form-item>
      <!-- 活动信息 - 对手 -->
      <el-form-item label="对手" prop="activityInfo.opposing">
        <el-input v-model="formData.activityInfo.opposing" placeholder="请输入对手名称"/>
      </el-form-item>
      <!-- 活动信息 - 对手颜色 -->
      <el-form-item label="对手颜色" prop="activityInfo.opposingColor">
        <el-color-picker v-model="formData.activityInfo.opposingColor"/>
      </el-form-item>
      <!-- 活动信息 - 每队人数 -->
      <el-form-item label="每队人数" prop="activityInfo.playersPerTeam">
        <el-input-number v-model="formData.activityInfo.playersPerTeam" :min="1"
                         placeholder="请输入每队人数"/>
      </el-form-item>
      <!-- 活动信息 - 计费类型 -->
      <el-form-item label="计费类型" prop="activityInfo.billingType">
        <el-select v-model="formData.activityInfo.billingType" placeholder="请选择计费类型">
          <el-option label="AA收费" value="AA"/>
          <el-option label="免费" value="FREE"/>
        </el-select>
      </el-form-item>
      <el-form-item label="备注信息" prop="cover">
        <el-input v-model="formData.description" placeholder="请输入备注信息"/>
      </el-form-item>
      <!-- 提交按钮 -->
      <el-form-item>
        <el-button type="primary" @click="createActivity(0)">立即创建</el-button>
        <el-button type="success" @click="createActivity(1)">创建并开始报名</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import {onMounted, reactive, ref} from 'vue';
import axios from 'axios';
import {ElForm, ElNotification} from 'element-plus';
import {activityFunctions} from '../functions/ActivityFunctions'

// 定义 activityInfo 的接口
interface ActivityInfo {
  color: string;
  opposing: string;
  opposingColor: string;
  playersPerTeam: number;
  billingType: 'AA' | 'other'; // 假设 billingType 只有这两种，或者你会有更多选项
}

// 定义整个表单数据的接口
interface FormData {
  name: string;
  startTime: string | null; // 或者 Date | null，取决于你实际使用
  endTime: string | null;
  cover: string;
  status: number;
  location: string;
  holdingDate: string | null; // 使用字符串格式 YYYY-MM-DD HH:mm:ss
  description: string;
  activityInfo: ActivityInfo;
}

const {clearCache} = activityFunctions();

const value1 = ref<String>("")

const errorNotify = (msg: string) => {
  ElNotification({
    title: '失败',
    message: msg,
    type: 'error',
  })
}
// 初始化表单数据
const formData: FormData = reactive({
  name: '周四友谊赛',
  startTime: '',
  endTime: '',
  cover: '',
  status: 0,
  location: '驿马河二期',
  holdingDate: '',
  description: '',
  activityInfo: {
    color: '#FFFFFF',
    opposing: '待定',
    opposingColor: '#483D8B',
    playersPerTeam: 8,
    billingType: 'AA'
  }
});

// 表单验证规则
const rules = {
  name: [
    {required: true, message: '请输入比赛名称', trigger: 'blur'}
  ],
  startTime: [
    {required: true, message: '请选择开始时间', trigger: 'change'}
  ],
  endTime: [
    {required: true, message: '请选择结束时间', trigger: 'change'}
  ],
  location: [
    {required: true, message: '请输入比赛地点', trigger: 'blur'}
  ],
  holdingDate: [
    {required: true, message: '请选择举办日期', trigger: 'change'}
  ],
  'activityInfo.color': [
    {required: true, message: '请选择活动颜色', trigger: 'change'}
  ],
  'activityInfo.opposing': [
    {required: true, message: '请输入对手名称', trigger: 'blur'}
  ],
  'activityInfo.opposingColor': [
    {required: true, message: '请选择对手颜色', trigger: 'change'}
  ],
  'activityInfo.playersPerTeam': [
    {required: true, message: '请输入每队人数', trigger: 'change'}
  ],
  'activityInfo.billingType': [
    {required: true, message: '请选择计费类型', trigger: 'change'}
  ]
};

// 表单引用
const formRef = ref<InstanceType<typeof ElForm> | null>(null);


function setNearestThursdayEvening(formData: FormData) {
  const now = new Date();
  const currentDayOfWeek = now.getDay(); // 0:Sunday, 1:Monday, ..., 6:Saturday
  const thursdayDayOfWeek = 4; // Thursday is 4

  // Calculate days until the next Thursday
  let daysUntilThursday = (thursdayDayOfWeek - currentDayOfWeek + 7) % 7;

  // If today is already Thursday, we want the *next* Thursday
  if (currentDayOfWeek === thursdayDayOfWeek) {
    daysUntilThursday = 7;
  }

  const nearestThursday = new Date(now);
  nearestThursday.setDate(now.getDate() + daysUntilThursday);

  // Set time to 8:15 PM (20:15)
  nearestThursday.setHours(20, 15, 0, 0);

  // Format the date to match 'YYYY-MM-DD HH:mm:ss'
  const year = nearestThursday.getFullYear();
  const month = String(nearestThursday.getMonth() + 1).padStart(2, '0');
  const day = String(nearestThursday.getDate()).padStart(2, '0');
  const hours = String(nearestThursday.getHours()).padStart(2, '0');
  const minutes = String(nearestThursday.getMinutes()).padStart(2, '0');
  const seconds = String(nearestThursday.getSeconds()).padStart(2, '0');
  console.log(`${now.toLocaleString()}`)
  formData.holdingDate = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  formData.endTime = `${year}-${month}-${String(nearestThursday.getDate() - 1).padStart(2, '0')} ${hours}:${minutes}:${seconds}`;
}

// 提交表单方法
const createActivity = async (status: number) => {
  const form = formRef.value;
  if (form) {
    form.validate(async (valid) => {
      if (valid) {
        try {
          formData.status = status;
          const response = await axios.post(`${import.meta.env.VITE_API2_BASE_URL}/apid/activity/create`, formData, {
            headers: {
              'Content-Type': 'application/json'
            }
          });
          console.log('提交成功：', response.data);
          clearCache()
        } catch (error) {
          console.error('提交失败：', error);
          errorNotify("创建比赛失败")
        }
      } else {
        console.log('表单验证失败');
        errorNotify("请填写完整")
      }
    });
  }
};

onMounted(() => {
  setNearestThursdayEvening(formData)
})

</script>

<style scoped>
.page-container {
  padding: 20px;
}
</style>
