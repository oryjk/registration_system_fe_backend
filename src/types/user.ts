// 用户信息字段别名映射
export type UserInfoAlias = {
  userId: number; // 对应 open_id
  unionId: string; // 对应 union_id
  avatarUrl: string; // 对应 avatar_url
  username: string; // 保持不变
  nickname: string; // 保持不变
  realName: string; // 对应 real_name
  isManager: boolean; // 对应 is_manager
  latestLoginDate: Date; // 对应 latest_login_date
};

// 原始用户信息接口
export interface UserInfoView {
  id: number;
  open_id: string;
  union_id: string;
  avatar_url: string;
  username: string;
  nickname: string;
  real_name: string;
  is_manager: boolean;
  latest_login_date: Date;
}

// 转换函数：将原始用户信息转换为别名格式
export function toUserInfoAlias(user: UserInfoView): UserInfoAlias {
  return {
    userId: user.id,
    unionId: user.union_id,
    avatarUrl: user.avatar_url,
    username: user.username,
    nickname: user.nickname,
    realName: user.real_name,
    isManager: user.is_manager,
    latestLoginDate: user.latest_login_date,
  };
}
