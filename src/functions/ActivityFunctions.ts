import {ElNotification} from "element-plus";
import {DateTime} from "luxon";

const successNotify = () => {
  ElNotification({
    title: '成功',
    message: '历史比赛缓存清除成功',
    type: 'success',
  })
}

export interface ActivityView {
  id: string;
  name: string;
  location: string;
  startTime: DateTime | null;
  endTime: DateTime | null;
  registCount: number;
  holdingDate: DateTime;
  status: number;
  billingType: string,
  userInfos: UserInfoView[] | null;
}

export interface UserInfoView {
  openId: string;
  nickName: string;
  avatarUrl: string;
  stand: number;
  isEditing: boolean;
}

export const activityFunctions = () => {


  const cacheKey = 'competitionsData'; // 定义一个缓存键
  // 创建新比赛后清除缓存的函数 (在创建新比赛的逻辑中调用)
  const clearCompetitionsCache = () => {
    localStorage.removeItem(cacheKey);
    console.log('比赛数据缓存已清除');
  };
  const clearCache = () => {
    clearCompetitionsCache()
    successNotify()
  }
  return {
    clearCompetitionsCache,
    clearCache
  };
}

