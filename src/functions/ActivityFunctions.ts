import { ElNotification } from "element-plus";
import { DateTime } from "luxon";

const successNotify = () => {
  ElNotification({
    title: "成功",
    message: "历史比赛缓存清除成功",
    type: "success",
  });
};

export interface ActivityView {
  id: string;
  name: string;
  location: string;
  start_time: DateTime | null;
  end_time: DateTime | null;
  regist_count: number;
  holding_date: string;
  status: number;
  description: string;
  billing_type: string;
  opposing: string;
  opposing_color: string;
  color: string;
  cover: string;
  desc: string;
  players_per_team: number;
  user_infos: UserActivityView[] | null;
  total:number;
  fee:number;
}

export interface UserActivityView {
  activity_id: string;
  operation_time: string;
  user_id: number;
  stand: number;
  paid: number;
  is_editing: boolean;
  registration_count: number;
}

export interface UserInfoView {
  open_id: string;
  union_id: string;
  avatar_url: string;
  username: string;
  nickname: string;
  real_name: string;
  is_manager: boolean;
  latest_login_date: Date;
}

export const activityFunctions = () => {
  const cacheKey = "competitionsData"; // 定义一个缓存键
  // 创建新比赛后清除缓存的函数 (在创建新比赛的逻辑中调用)
  const clearCompetitionsCache = () => {
    localStorage.removeItem(cacheKey);
    console.log("比赛数据缓存已清除");
  };
  const clearCache = () => {
    clearCompetitionsCache();
    successNotify();
  };
  return {
    clearCompetitionsCache,
    clearCache,
  };
};
